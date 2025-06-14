import { db } from "$lib/server/db"
import { quizSessions, sessionQuestions, questions as questionsTable } from "$lib/server/db/schema"
import { redirect, error } from "@sveltejs/kit"
import { eq, sql, desc } from "drizzle-orm"
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

	const sessionData = await db.query.quizSessions.findFirst({
		where: eq(quizSessions.id, sessionId),
		with: {
			quiz: true
		}
	})

	if (!sessionData) {
		throw error(404, "Session not found")
	}

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

	const participantsData = await db.query.quizSessions.findFirst({
		where: eq(quizSessions.id, sessionId),
		with: {
			participants: {
				with: {
					user: {
						columns: {
							name: true,
							image: true
						}
					},
					gameAttempts: {
						with: {
							questionAttempts: true
						},
						orderBy: (gameAttempts, { desc }) => [desc(gameAttempts.id)]
					}
				}
			}
		}
	})

	const participants = (participantsData?.participants || [])
		.map((participant) => {
			const latestAttempt = participant.gameAttempts[0]
			const correctAnswers = latestAttempt?.questionAttempts.filter((qa) => qa.correct).length || 0
			const totalScore = latestAttempt?.questionAttempts.reduce((sum, qa) => sum + (qa.pointsAwarded || 0), 0) || 0

			return {
				id: participant.id,
				name: participant.name,
				userId: participant.userId,
				createdAt: participant.createdAt,
				user: participant.user,
				attemptTimes: participant.gameAttempts.length,
				correctAnswers,
				totalScore
			}
		})
		.sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0))

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
