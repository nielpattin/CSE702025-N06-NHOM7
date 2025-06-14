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

	const participant = await db.query.sessionParticipants.findFirst({
		where: eq(sessionParticipants.id, participantId),
		with: {
			user: {
				columns: {
					name: true,
					image: true
				}
			},
			quizSession: {
				with: {
					quiz: {
						columns: {
							title: true
						}
					}
				}
			}
		}
	})

	if (!participant) {
		throw error(404, "Participant not found")
	}

	const quiz = participant.quizSession?.quiz || { title: "Unknown Quiz" }

	const attemptsRaw = await db.query.gameAttempts.findMany({
		where: eq(gameAttempts.participantId, participantId),
		orderBy: desc(gameAttempts.startedAt)
	})

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
