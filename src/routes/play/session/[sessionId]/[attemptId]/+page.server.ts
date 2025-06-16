import { error, fail, redirect } from "@sveltejs/kit"
import { db } from "$lib/server/db/index.js"
import { gameAttempts, quizSessions, sessionParticipants, sessionQuestions, sessionQuestionOptions, questionAttempts, users } from "$lib/server/db/schema.js"
import { eq, and, asc } from "drizzle-orm"
import type { PageServerLoad, Actions } from "./$types.js"

export const load: PageServerLoad = async ({ params, locals }) => {
	const sessionId = parseInt(params.sessionId)
	const attemptId = parseInt(params.attemptId)

	if (isNaN(sessionId) || isNaN(attemptId)) {
		throw error(404, "Invalid session or attempt ID")
	}

	const authSession = await locals.auth()

	// Fetch the game attempt with session and participant details
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
			}
		})
		.from(gameAttempts)
		.innerJoin(quizSessions, eq(gameAttempts.quizSessionId, quizSessions.id))
		.innerJoin(sessionParticipants, eq(gameAttempts.participantId, sessionParticipants.id))
		.where(and(eq(gameAttempts.id, attemptId), eq(gameAttempts.quizSessionId, sessionId)))
		.limit(1)

	if (attemptResult.length === 0) {
		throw error(404, "Game attempt not found")
	}

	const { attempt, session, participant } = attemptResult[0]

	// Verify user ownership of this attempt
	if (authSession?.user) {
		// Authenticated user - check if they own this participant record
		if (participant.userId !== authSession.user.id) {
			throw error(403, "Access denied")
		}
	} else {
		// Guest user - we'll need to check guest ID in the client
		// For now, we'll allow access but this should be enhanced with guest session tracking
	}

	// Check if session is still active or marked for deletion (allowing ongoing games)
	if (session.status !== "active" && session.status !== "deleting") {
		throw error(400, "Session is no longer available for play.")
	}

	// Check if session has expired (Note: a "deleting" session might also have an expiry, this logic remains)
	if (session.expiresAt && new Date() > new Date(session.expiresAt)) {
		throw error(400, "Session has expired")
	}

	// If attempt is completed, redirect to results (to be implemented)
	if (attempt.status === "completed") {
		throw redirect(302, `/play/session/${sessionId}/${attemptId}/results`)
	}

	// Fetch session questions in order
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
		.orderBy(asc(sessionQuestions.id))

	if (questions.length === 0) {
		throw error(500, "No questions found for this session")
	}

	// Fetch options for all questions
	const questionIds = questions.map((q) => q.id)
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

	// Group options by question
	const questionOptionsMap = new Map<number, typeof allOptions>()
	for (const option of allOptions) {
		if (!questionOptionsMap.has(option.sessionQuestionId)) {
			questionOptionsMap.set(option.sessionQuestionId, [])
		}
		questionOptionsMap.get(option.sessionQuestionId)!.push(option)
	}

	// Fetch existing question attempts for this game attempt
	const existingAttempts = await db
		.select({
			id: questionAttempts.id,
			sessionQuestionId: questionAttempts.sessionQuestionId,
			selectedSessionOptionId: questionAttempts.selectedSessionOptionId,
			correct: questionAttempts.correct,
			timeTakenMs: questionAttempts.timeTakenMs,
			pointsAwarded: questionAttempts.pointsAwarded
		})
		.from(questionAttempts)
		.where(eq(questionAttempts.gameAttemptId, attemptId))

	// Create a map of answered questions
	const answeredQuestionsMap = new Map<number, (typeof existingAttempts)[0]>()
	for (const qa of existingAttempts) {
		answeredQuestionsMap.set(qa.sessionQuestionId, qa)
	}

	// Combine questions with their options and attempt status
	const questionsWithOptions = questions.map((question) => ({
		...question,
		options: (questionOptionsMap.get(question.id) || [])
			.map((option) => ({
				id: option.id,
				content: option.content,
				order: option.order
				// Don't expose correct answers to client
			}))
			.sort((a, b) => (a.order || 0) - (b.order || 0)),
		attempt: answeredQuestionsMap.get(question.id) || null
	}))

	// Determine current question (first unanswered question)
	let currentQuestionIndex = 0
	for (let i = 0; i < questionsWithOptions.length; i++) {
		if (!questionsWithOptions[i].attempt) {
			currentQuestionIndex = i
			break
		}
		// If all questions are answered, stay on the last question
		if (i === questionsWithOptions.length - 1) {
			currentQuestionIndex = i
		}
	}

	return {
		attempt,
		session,
		participant,
		questions: questionsWithOptions,
		currentQuestionIndex,
		totalQuestions: questions.length,
		userSession: authSession
	}
}

export const actions: Actions = {
	submitAnswer: async ({ request, params, locals }) => {
		const sessionId = parseInt(params.sessionId)
		const attemptId = parseInt(params.attemptId)

		if (isNaN(sessionId) || isNaN(attemptId)) {
			return fail(400, { error: "Invalid session or attempt ID" })
		}

		const formData = await request.formData()
		const questionId = parseInt(formData.get("questionId")?.toString() || "")
		const selectedOptionId = parseInt(formData.get("selectedOptionId")?.toString() || "")
		const timeTaken = parseInt(formData.get("timeTaken")?.toString() || "0")

		if (isNaN(questionId) || isNaN(selectedOptionId)) {
			return fail(400, { error: "Invalid question or option ID" })
		}

		try {
			// Verify the attempt exists and belongs to the user
			const authSession = await locals.auth()
			const attemptResult = await db
				.select({
					attempt: gameAttempts,
					participant: sessionParticipants
				})
				.from(gameAttempts)
				.innerJoin(sessionParticipants, eq(gameAttempts.participantId, sessionParticipants.id))
				.where(and(eq(gameAttempts.id, attemptId), eq(gameAttempts.quizSessionId, sessionId)))
				.limit(1)

			if (attemptResult.length === 0) {
				return fail(404, { error: "Game attempt not found" })
			}

			const { attempt, participant } = attemptResult[0]

			// Verify ownership
			if (authSession?.user) {
				if (participant.userId !== authSession.user.id) {
					return fail(403, { error: "Access denied" })
				}
			}

			// Check if attempt is still in progress
			if (attempt.status !== "in_progress") {
				return fail(400, { error: "Cannot submit answer for completed attempt" })
			}

			// Check if this question was already answered
			const existingAnswer = await db
				.select({ id: questionAttempts.id })
				.from(questionAttempts)
				.where(and(eq(questionAttempts.gameAttemptId, attemptId), eq(questionAttempts.sessionQuestionId, questionId)))
				.limit(1)

			if (existingAnswer.length > 0) {
				return fail(400, { error: "Question already answered" })
			}

			// Get the correct answer and points for this question
			const optionResult = await db
				.select({
					option: sessionQuestionOptions,
					question: sessionQuestions
				})
				.from(sessionQuestionOptions)
				.innerJoin(sessionQuestions, eq(sessionQuestionOptions.sessionQuestionId, sessionQuestions.id))
				.where(eq(sessionQuestionOptions.id, selectedOptionId))
				.limit(1)

			if (optionResult.length === 0) {
				return fail(400, { error: "Invalid option selected" })
			}

			const { option, question } = optionResult[0]
			const isCorrect = option.correct || false
			const pointsAwarded = isCorrect ? question.points || 0 : 0

			// Save the question attempt
			await db.insert(questionAttempts).values({
				gameAttemptId: attemptId,
				sessionQuestionId: questionId,
				selectedSessionOptionId: selectedOptionId,
				correct: isCorrect,
				timeTakenMs: timeTaken,
				pointsAwarded: pointsAwarded
			})

			// Get updated data to return to client
			// Fetch session questions in order
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
				.orderBy(asc(sessionQuestions.id))

			// Fetch existing question attempts for this game attempt
			const existingAttempts = await db
				.select({
					id: questionAttempts.id,
					sessionQuestionId: questionAttempts.sessionQuestionId,
					selectedSessionOptionId: questionAttempts.selectedSessionOptionId,
					correct: questionAttempts.correct,
					timeTakenMs: questionAttempts.timeTakenMs,
					pointsAwarded: questionAttempts.pointsAwarded
				})
				.from(questionAttempts)
				.where(eq(questionAttempts.gameAttemptId, attemptId))

			// Create a map of answered questions
			const answeredQuestionsMap = new Map<number, (typeof existingAttempts)[0]>()
			for (const qa of existingAttempts) {
				answeredQuestionsMap.set(qa.sessionQuestionId, qa)
			}

			// Check if all questions are answered
			const allQuestionsAnswered = questions.every((q) => answeredQuestionsMap.has(q.id))

			if (allQuestionsAnswered) {
				// All questions answered, calculate final score and complete attempt
				const totalScore = existingAttempts.reduce((sum, qa) => sum + (qa.pointsAwarded || 0), 0)

				await db
					.update(gameAttempts)
					.set({
						status: "completed",
						score: totalScore,
						completedAt: new Date()
					})
					.where(eq(gameAttempts.id, attemptId))

				// Return completion data
				return {
					success: true,
					correct: isCorrect,
					pointsAwarded: pointsAwarded,
					completed: true,
					redirectTo: `/play/session/${sessionId}/${attemptId}/results`
				}
			} else {
				// Find next question
				const currentQuestionIndex = questions.findIndex((q) => q.id === questionId)
				const nextQuestionIndex = questions.findIndex((q, index) => index > currentQuestionIndex && !answeredQuestionsMap.has(q.id))

				return {
					success: true,
					correct: isCorrect,
					pointsAwarded: pointsAwarded,
					completed: false,
					nextQuestionIndex: nextQuestionIndex >= 0 ? nextQuestionIndex : currentQuestionIndex
				}
			}
		} catch (err) {
			console.error("Error submitting answer:", err)
			return fail(500, { error: "Failed to submit answer" })
		}
	},

	completeAttempt: async ({ params, locals }) => {
		const sessionId = parseInt(params.sessionId)
		const attemptId = parseInt(params.attemptId)

		if (isNaN(sessionId) || isNaN(attemptId)) {
			return fail(400, { error: "Invalid session or attempt ID" })
		}

		try {
			// Verify the attempt exists and belongs to the user
			const authSession = await locals.auth()
			const attemptResult = await db
				.select({
					attempt: gameAttempts,
					participant: sessionParticipants
				})
				.from(gameAttempts)
				.innerJoin(sessionParticipants, eq(gameAttempts.participantId, sessionParticipants.id))
				.where(and(eq(gameAttempts.id, attemptId), eq(gameAttempts.quizSessionId, sessionId)))
				.limit(1)

			if (attemptResult.length === 0) {
				return fail(404, { error: "Game attempt not found" })
			}

			const { attempt, participant } = attemptResult[0]

			// Verify ownership
			if (authSession?.user) {
				if (participant.userId !== authSession.user.id) {
					return fail(403, { error: "Access denied" })
				}
			}

			// Check if attempt is still in progress
			if (attempt.status !== "in_progress") {
				return fail(400, { error: "Attempt is already completed" })
			}

			// Calculate total score
			const scoreResult = await db
				.select({
					totalPoints: questionAttempts.pointsAwarded
				})
				.from(questionAttempts)
				.where(eq(questionAttempts.gameAttemptId, attemptId))

			const totalScore = scoreResult.reduce((sum, row) => sum + (row.totalPoints || 0), 0)

			// Update the game attempt as completed
			await db
				.update(gameAttempts)
				.set({
					status: "completed",
					score: totalScore,
					completedAt: new Date()
				})
				.where(eq(gameAttempts.id, attemptId))

			// Return completion data instead of redirecting
			return {
				success: true,
				completed: true,
				redirectTo: `/play/session/${sessionId}/${attemptId}/results`
			}
		} catch (err) {
			console.error("Error completing attempt:", err)
			return fail(500, { error: "Failed to complete attempt" })
		}
	}
}
