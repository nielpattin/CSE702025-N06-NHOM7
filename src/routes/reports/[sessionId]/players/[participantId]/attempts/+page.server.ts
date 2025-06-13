import { db } from "$lib/server/db"
import { sessionParticipants, gameAttempts, users, sessionQuestions, quizSessions, quizzes, questionAttempts } from "$lib/server/db/schema"
import { error, redirect } from "@sveltejs/kit"
import { eq, desc, count, sum, sql } from "drizzle-orm"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth()
	if (!session?.user) {
		redirect(302, "/signin")
	}

	const participantId = parseInt(event.params.participantId)
	if (isNaN(participantId)) {
		throw error(400, "Invalid participant ID")
	}

	const participantResult = await db
		.select({
			id: sessionParticipants.id,
			name: sessionParticipants.name,
			userId: sessionParticipants.userId,
			quizSessionId: sessionParticipants.quizSessionId,
			createdAt: sessionParticipants.createdAt,
			user: {
				name: users.name,
				image: users.image
			}
		})
		.from(sessionParticipants)
		.leftJoin(users, eq(sessionParticipants.userId, users.id))
		.where(eq(sessionParticipants.id, participantId))
		.limit(1)

	if (participantResult.length === 0) {
		throw error(404, "Participant not found")
	}
	const participant = participantResult[0]

	const quizResult = await db
		.select({
			title: quizzes.title
		})
		.from(quizSessions)
		.innerJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
		.where(eq(quizSessions.id, participant.quizSessionId))
		.limit(1)

	const quiz = quizResult[0] || { title: "Unknown Quiz" }

	const attemptsRaw = await db.select().from(gameAttempts).where(eq(gameAttempts.participantId, participantId)).orderBy(desc(gameAttempts.startedAt))

	const attempts = await Promise.all(
		attemptsRaw.map(async (attempt) => {
			const [totalPointsResult, questionStats] = await Promise.all([
				db
					.select({ total: sum(sessionQuestions.points) })
					.from(sessionQuestions)
					.where(eq(sessionQuestions.quizSessionId, attempt.quizSessionId)),
				db
					.select({
						totalQuestions: count(),
						correctAnswers: sql<number>`sum(CASE WHEN ${questionAttempts.correct} THEN 1 ELSE 0 END)`.as("correctAnswers")
					})
					.from(questionAttempts)
					.where(eq(questionAttempts.gameAttemptId, attempt.id))
			])

			const totalPoints = Number(totalPointsResult[0]?.total) || 0
			const totalQuestions = Number(questionStats[0]?.totalQuestions) || 0
			const correctAnswers = Number(questionStats[0]?.correctAnswers) || 0
			const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

			return {
				...attempt,
				totalPoints,
				accuracy,
				totalQuestions,
				correctAnswers
			}
		})
	)

	return {
		participant,
		quiz,
		attempts
	}
}
