import { error, fail, redirect } from "@sveltejs/kit"
import { db } from "$lib/server/db"
import { gameAttempts, quizSessions, sessionParticipants, sessionQuestions, sessionQuestionOptions, questionAttempts, quizzes } from "$lib/server/db/schema"
import { eq, and, asc } from "drizzle-orm"
import type { PageServerLoad, Actions } from "./$types"

export const load: PageServerLoad = async ({ params, locals }) => {
	const sessionId = parseInt(params.sessionId)
	const attemptId = parseInt(params.attemptId)

	if (isNaN(sessionId) || isNaN(attemptId)) {
		throw error(404, "Invalid session or attempt ID")
	}

	const authSession = await locals.auth()

	const attemptResult = await db
		.select({
			attempt: {
				id: gameAttempts.id,
				quizSessionId: gameAttempts.quizSessionId,
				participantId: gameAttempts.participantId,
				attemptNumber: gameAttempts.attemptNumber,
				score: gameAttempts.score,
				status: gameAttempts.status,
				startedAt: gameAttempts.startedAt,
				completedAt: gameAttempts.completedAt
			},
			session: {
				id: quizSessions.id,
				code: quizSessions.code,
				status: quizSessions.status,
				expiresAt: quizSessions.expiresAt
			},
			participant: {
				id: sessionParticipants.id,
				userId: sessionParticipants.userId,
				guestId: sessionParticipants.guestId,
				name: sessionParticipants.name
			},
			quiz: {
				id: quizzes.id,
				title: quizzes.title,
				description: quizzes.description
			}
		})
		.from(gameAttempts)
		.innerJoin(quizSessions, eq(gameAttempts.quizSessionId, quizSessions.id))
		.innerJoin(sessionParticipants, eq(gameAttempts.participantId, sessionParticipants.id))
		.innerJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
		.where(and(eq(gameAttempts.id, attemptId), eq(gameAttempts.quizSessionId, sessionId)))
		.limit(1)

	if (attemptResult.length === 0) {
		throw error(404, "Game attempt not found")
	}

	const { attempt, session, participant, quiz } = attemptResult[0]

	if (authSession?.user) {
		if (participant.userId !== authSession.user.id) {
			throw error(403, "Access denied")
		}
	}

	const questionsWithAnswers = await db
		.select({
			question: {
				id: sessionQuestions.id,
				originalQuestionId: sessionQuestions.originalQuestionId,
				type: sessionQuestions.type,
				content: sessionQuestions.content,
				timeLimit: sessionQuestions.timeLimit,
				points: sessionQuestions.points
			},
			attempt: {
				id: questionAttempts.id,
				selectedSessionOptionId: questionAttempts.selectedSessionOptionId,
				correct: questionAttempts.correct,
				timeTakenMs: questionAttempts.timeTakenMs,
				pointsAwarded: questionAttempts.pointsAwarded
			}
		})
		.from(sessionQuestions)
		.leftJoin(questionAttempts, and(eq(questionAttempts.sessionQuestionId, sessionQuestions.id), eq(questionAttempts.gameAttemptId, attemptId)))
		.where(eq(sessionQuestions.quizSessionId, sessionId))
		.orderBy(asc(sessionQuestions.id))

	const allOptions = await db
		.select({
			id: sessionQuestionOptions.id,
			sessionQuestionId: sessionQuestionOptions.sessionQuestionId,
			originalOptionId: sessionQuestionOptions.originalOptionId,
			order: sessionQuestionOptions.order,
			content: sessionQuestionOptions.content,
			correct: sessionQuestionOptions.correct
		})
		.from(sessionQuestionOptions)
		.innerJoin(sessionQuestions, eq(sessionQuestionOptions.sessionQuestionId, sessionQuestions.id))
		.where(eq(sessionQuestions.quizSessionId, sessionId))
		.orderBy(asc(sessionQuestionOptions.sessionQuestionId), asc(sessionQuestionOptions.order))

	const questionOptionsMap = new Map<number, typeof allOptions>()
	for (const option of allOptions) {
		if (!questionOptionsMap.has(option.sessionQuestionId)) {
			questionOptionsMap.set(option.sessionQuestionId, [])
		}
		questionOptionsMap.get(option.sessionQuestionId)!.push(option)
	}

	const questionsWithResults = questionsWithAnswers.map(({ question, attempt: questionAttempt }) => ({
		...question,
		options: questionOptionsMap.get(question.id) || [],
		attempt: questionAttempt,
		selectedOption: questionAttempt?.selectedSessionOptionId ? (questionOptionsMap.get(question.id) || []).find((opt) => opt.id === questionAttempt.selectedSessionOptionId) : null,
		correctOption: (questionOptionsMap.get(question.id) || []).find((opt) => opt.correct)
	}))

	const totalQuestions = questionsWithResults.length
	const answeredQuestions = questionsWithResults.filter((q) => q.attempt).length
	const correctAnswers = questionsWithResults.filter((q) => q.attempt?.correct).length
	const totalPossiblePoints = questionsWithResults.reduce((sum, q) => sum + (q.points || 0), 0)
	const totalTimeTaken = questionsWithResults.reduce((sum, q) => sum + (q.attempt?.timeTakenMs || 0), 0)

	return {
		attempt,
		session,
		participant,
		quiz,
		questions: questionsWithResults,
		summary: {
			totalQuestions,
			answeredQuestions,
			correctAnswers,
			incorrectAnswers: answeredQuestions - correctAnswers,
			score: attempt.score || 0,
			totalPossiblePoints,
			percentage: totalPossiblePoints > 0 ? Math.round(((attempt.score || 0) / totalPossiblePoints) * 100) : 0,
			totalTimeTaken,
			averageTimePerQuestion: answeredQuestions > 0 ? Math.round(totalTimeTaken / answeredQuestions) : 0
		},
		userSession: authSession
	}
}

export const actions: Actions = {
	reattempt: async ({ params, locals }) => {
		const sessionId = parseInt(params.sessionId)

		if (isNaN(sessionId)) {
			return fail(400, { error: "Invalid session ID" })
		}

		try {
			const sessionResult = await db.select({ id: quizSessions.id, status: quizSessions.status }).from(quizSessions).where(eq(quizSessions.id, sessionId)).limit(1)

			if (sessionResult.length === 0) {
				return fail(404, { error: "Session not found" })
			}

			const session = sessionResult[0]
			if (session.status !== "active") {
				return fail(400, { error: "Session is not active" })
			}

			const authSession = await locals.auth()
			if (!authSession?.user) {
				return fail(401, { error: "Authentication required" })
			}

			const participantResult = await db
				.select({ id: sessionParticipants.id })
				.from(sessionParticipants)
				.where(and(eq(sessionParticipants.quizSessionId, sessionId), eq(sessionParticipants.userId, authSession.user.id)))
				.limit(1)

			if (participantResult.length === 0) {
				return fail(400, { error: "You must join the session first" })
			}

			const participantId = participantResult[0].id

			const lastAttemptResult = await db
				.select({ attemptNumber: gameAttempts.attemptNumber })
				.from(gameAttempts)
				.where(and(eq(gameAttempts.quizSessionId, sessionId), eq(gameAttempts.participantId, participantId)))
				.orderBy(gameAttempts.attemptNumber)

			const nextAttemptNumber = lastAttemptResult.length > 0 ? Math.max(...lastAttemptResult.map((a) => a.attemptNumber || 1)) + 1 : 1

			const newAttempt = await db
				.insert(gameAttempts)
				.values({
					quizSessionId: sessionId,
					participantId: participantId,
					attemptNumber: nextAttemptNumber,
					status: "in_progress",
					startedAt: new Date()
				})
				.returning({ id: gameAttempts.id })

			throw redirect(302, `/play/session/${sessionId}/${newAttempt[0].id}`)
		} catch (err) {
			if (err && typeof err === "object" && "status" in err && "location" in err) {
				throw err
			}
			console.error("Error creating reattempt:", err)
			return fail(500, { error: "Failed to create new attempt" })
		}
	}
}
