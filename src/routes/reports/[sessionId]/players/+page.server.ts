import { db } from "$lib/server/db"
import { quizSessions, quizzes, sessionParticipants, gameAttempts, questionAttempts, sessionQuestions, users } from "$lib/server/db/schema"
import { redirect, error } from "@sveltejs/kit"
import { eq, and, sql, desc, count } from "drizzle-orm"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth()

	// Redirect if not authenticated
	if (!session?.user) {
		redirect(302, "/signin")
	}

	const sessionId = parseInt(event.params.sessionId)
	if (isNaN(sessionId)) {
		throw error(400, "Invalid session ID")
	}

	// Fetch session details with quiz information
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

	// Check if user has access to this session
	if (sessionData.hostId !== session.user.id) {
		throw error(403, "Access denied")
	}

	// Get session statistics
	const sessionStats = await db
		.select({
			totalParticipants: sql<number>`COUNT(DISTINCT ${sessionParticipants.id})`,
			totalQuestions: sql<number>`COUNT(DISTINCT ${sessionQuestions.id})`,
			accuracy: sql<number>`
				CASE
					WHEN COUNT(${questionAttempts.id}) = 0 THEN 0
					ELSE ROUND((SUM(CASE WHEN ${questionAttempts.correct} = true THEN 1 ELSE 0 END) * 100.0) / COUNT(${questionAttempts.id}))
				END
			`
		})
		.from(quizSessions)
		.leftJoin(sessionParticipants, eq(quizSessions.id, sessionParticipants.quizSessionId))
		.leftJoin(sessionQuestions, eq(quizSessions.id, sessionQuestions.quizSessionId))
		.leftJoin(gameAttempts, eq(sessionParticipants.id, gameAttempts.participantId))
		.leftJoin(questionAttempts, eq(gameAttempts.id, questionAttempts.gameAttemptId))
		.where(eq(quizSessions.id, sessionId))
		.groupBy(quizSessions.id)

	// Get participant details with their performance
	const participants = await db
		.select({
			id: sessionParticipants.id,
			name: sessionParticipants.name,
			userId: sessionParticipants.userId,
			createdAt: sessionParticipants.createdAt,
			user: {
				name: users.name,
				image: users.image
			},
			totalQuestions: sql<number>`COUNT(DISTINCT ${questionAttempts.sessionQuestionId})`,
			correctAnswers: sql<number>`SUM(CASE WHEN ${questionAttempts.correct} = true THEN 1 ELSE 0 END)`,
			totalScore: sql<number>`COALESCE(SUM(${questionAttempts.pointsAwarded}), 0)`,
			accuracy: sql<number>`
				CASE
					WHEN COUNT(${questionAttempts.id}) = 0 THEN 0
					ELSE ROUND((SUM(CASE WHEN ${questionAttempts.correct} = true THEN 1 ELSE 0 END) * 100.0) / COUNT(${questionAttempts.id}))
				END
			`
		})
		.from(sessionParticipants)
		.leftJoin(users, eq(sessionParticipants.userId, users.id))
		.leftJoin(gameAttempts, eq(sessionParticipants.id, gameAttempts.participantId))
		.leftJoin(questionAttempts, eq(gameAttempts.id, questionAttempts.gameAttemptId))
		.where(eq(sessionParticipants.quizSessionId, sessionId))
		.groupBy(sessionParticipants.id, sessionParticipants.name, sessionParticipants.userId, sessionParticipants.createdAt, users.name, users.image)
		.orderBy(desc(sql`COALESCE(SUM(${questionAttempts.pointsAwarded}), 0)`))

	// Get questions for this session
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

	// Transform participant data
	const transformedParticipants = participants.map((participant) => ({
		...participant,
		displayName: participant.name || participant.user?.name || "Anonymous",
		points: `${participant.correctAnswers}/${participant.totalQuestions}`,
		accuracy: Math.round(participant.accuracy || 0)
	}))

	return {
		quizSession: sessionData,
		stats: {
			accuracy: Math.round(sessionStats[0]?.accuracy || 0),
			totalParticipants: sessionStats[0]?.totalParticipants || 0,
			totalQuestions: sessionStats[0]?.totalQuestions || 0
		},
		participants: transformedParticipants,
		questions
	}
}
