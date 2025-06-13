import { db } from "$lib/server/db"
import { quizSessions, quizzes, sessionParticipants, gameAttempts, questionAttempts, sessionQuestions, users, questions as questionsTable } from "$lib/server/db/schema"
import { redirect, error } from "@sveltejs/kit"
import { eq, sql, and } from "drizzle-orm"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth()

	if (!session?.user) {
		redirect(302, "/signin")
	}

	const sessionId = parseInt(event.params.sessionId)
	if (isNaN(sessionId)) {
		throw error(400, "Invalid session ID")
	}

	const sessionResult = await db
		.select({
			id: quizSessions.id,
			code: quizSessions.code,
			status: quizSessions.status,
			createdAt: quizSessions.createdAt,
			hostId: quizSessions.hostId,
			quiz: {
				id: quizzes.id,
				title: quizzes.title,
				description: quizzes.description
			}
		})
		.from(quizSessions)
		.innerJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
		.where(eq(quizSessions.id, sessionId))
		.limit(1)

	if (sessionResult.length === 0) {
		throw error(404, "Session not found")
	}

	const sessionData = sessionResult[0]

	if (sessionData.hostId !== session.user.id) {
		throw error(403, "Access denied")
	}

	const quizQuestionStats = await db
		.select({
			totalQuestions: sql<number>`COUNT(${questionsTable.id})`.mapWith(Number),
			totalPoints: sql<number>`SUM(${questionsTable.points})`.mapWith(Number)
		})
		.from(questionsTable)
		.where(eq(questionsTable.quizId, sessionData.quiz.id))

	const totalQuestionsInQuiz = quizQuestionStats[0]?.totalQuestions || 0
	const totalPossiblePoints = quizQuestionStats[0]?.totalPoints || 0

	const attemptCounts = db
		.select({
			participantId: gameAttempts.participantId,
			count: sql<number>`count(${gameAttempts.id})`.mapWith(Number).as("count")
		})
		.from(gameAttempts)
		.groupBy(gameAttempts.participantId)
		.as("attempt_counts")

	const latestGameAttempts = db
		.select({
			id: gameAttempts.id,
			participantId: gameAttempts.participantId,
			rowNumber: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${gameAttempts.participantId} ORDER BY ${gameAttempts.id} DESC)`.mapWith(Number).as("rn")
		})
		.from(gameAttempts)
		.as("latest_game_attempts")

	const participantsWithStats = await db
		.with(latestGameAttempts, attemptCounts)
		.select({
			id: sessionParticipants.id,
			name: sessionParticipants.name,
			userId: sessionParticipants.userId,
			createdAt: sessionParticipants.createdAt,
			user: {
				name: users.name,
				image: users.image
			},
			attemptTimes: attemptCounts.count,
			correctAnswers: sql<number>`SUM(CASE WHEN ${questionAttempts.correct} = true THEN 1 ELSE 0 END)`.mapWith(Number),
			totalScore: sql<number>`COALESCE(SUM(${questionAttempts.pointsAwarded}), 0)`.mapWith(Number)
		})
		.from(sessionParticipants)
		.leftJoin(users, eq(sessionParticipants.userId, users.id))
		.leftJoin(attemptCounts, eq(sessionParticipants.id, attemptCounts.participantId))
		.leftJoin(latestGameAttempts, and(eq(sessionParticipants.id, latestGameAttempts.participantId), eq(latestGameAttempts.rowNumber, 1)))
		.leftJoin(gameAttempts, eq(latestGameAttempts.id, gameAttempts.id))
		.leftJoin(questionAttempts, eq(gameAttempts.id, questionAttempts.gameAttemptId))
		.where(eq(sessionParticipants.quizSessionId, sessionId))
		.groupBy(sessionParticipants.id, users.name, users.image, attemptCounts.count)

	const participants = participantsWithStats.sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0))

	const questions = await db
		.select({
			id: sessionQuestions.id,
			originalQuestionId: sessionQuestions.originalQuestionId,
			type: sessionQuestions.type,
			content: sessionQuestions.content,
			timeLimit: sessionQuestions.timeLimit,
			points: sessionQuestions.points
		})
		.from(sessionQuestions)
		.where(eq(sessionQuestions.quizSessionId, sessionId))
		.orderBy(sessionQuestions.id)

	const transformedParticipants = participants.map((participant) => ({
		...participant,
		displayName: participant.name || participant.user?.name || "Anonymous",
		points: `${participant.correctAnswers || 0}/${totalQuestionsInQuiz}`,
		accuracy: totalQuestionsInQuiz > 0 ? Math.round(((participant.correctAnswers || 0) * 100) / totalQuestionsInQuiz) : 0,
		totalQuestions: totalQuestionsInQuiz
	}))

	const totalParticipants = transformedParticipants.length
	const totalCorrectAnswers = transformedParticipants.reduce((sum, p) => sum + (p.correctAnswers || 0), 0)
	const totalQuestionsAttempted = totalParticipants * totalQuestionsInQuiz
	const averageAccuracy = totalQuestionsAttempted > 0 ? (totalCorrectAnswers / totalQuestionsAttempted) * 100 : 0

	return {
		quizSession: sessionData,
		stats: {
			accuracy: Math.round(averageAccuracy),
			totalParticipants: totalParticipants,
			totalQuestions: totalQuestionsInQuiz
		},
		participants: transformedParticipants,
		questions
	}
}
