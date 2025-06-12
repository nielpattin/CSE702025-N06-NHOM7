import { db } from "$lib/server/db"
import { sessionParticipants, gameAttempts, questionAttempts, sessionQuestions, sessionQuestionOptions, users, quizSessions } from "$lib/server/db/schema"
import { error, json } from "@sveltejs/kit"
import { eq, and, inArray } from "drizzle-orm"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ params, url, locals }) => {
	const session = await locals.auth()

	if (!session?.user) {
		return error(401, "Unauthorized")
	}

	const participantId = parseInt(params.participantId)
	const sessionId = parseInt(url.searchParams.get("sessionId") || "")

	if (isNaN(participantId) || isNaN(sessionId)) {
		return error(400, "Invalid participant ID or session ID")
	}

	try {
		// Verify that the user has access to this session
		const sessionCheck = await db.select({ hostId: quizSessions.hostId }).from(quizSessions).where(eq(quizSessions.id, sessionId)).limit(1)

		if (sessionCheck.length === 0) {
			return error(404, "Session not found")
		}

		if (sessionCheck[0].hostId !== session.user.id) {
			return error(403, "Access denied")
		}

		// Fetch participant details
		const participantResult = await db
			.select({
				id: sessionParticipants.id,
				name: sessionParticipants.name,
				userId: sessionParticipants.userId,
				createdAt: sessionParticipants.createdAt,
				user: {
					name: users.name,
					image: users.image
				}
			})
			.from(sessionParticipants)
			.leftJoin(users, eq(sessionParticipants.userId, users.id))
			.where(and(eq(sessionParticipants.id, participantId), eq(sessionParticipants.quizSessionId, sessionId)))
			.limit(1)

		if (participantResult.length === 0) {
			return error(404, "Participant not found")
		}

		const participant = participantResult[0]

		// Get the participant's game attempt
		const gameAttemptResult = await db
			.select({
				id: gameAttempts.id,
				startedAt: gameAttempts.startedAt,
				completedAt: gameAttempts.completedAt,
				score: gameAttempts.score
			})
			.from(gameAttempts)
			.where(eq(gameAttempts.participantId, participantId))
			.limit(1)

		if (gameAttemptResult.length === 0) {
			return error(404, "No game attempt found for this participant")
		}

		const gameAttempt = gameAttemptResult[0]

		// Fetch question attempts with question details and correct answers
		const questionAttemptsResult = await db
			.select({
				attemptId: questionAttempts.id,
				sessionQuestionId: questionAttempts.sessionQuestionId,
				selectedOptionId: questionAttempts.selectedSessionOptionId,
				correct: questionAttempts.correct,
				timeTaken: questionAttempts.timeTakenMs,
				pointsAwarded: questionAttempts.pointsAwarded,
				question: {
					id: sessionQuestions.id,
					content: sessionQuestions.content,
					points: sessionQuestions.points
				}
			})
			.from(questionAttempts)
			.innerJoin(sessionQuestions, eq(questionAttempts.sessionQuestionId, sessionQuestions.id))
			.where(eq(questionAttempts.gameAttemptId, gameAttempt.id))
			.orderBy(sessionQuestions.id)

		// Fetch all options for the questions to determine correct and selected answers
		const questionIds = questionAttemptsResult.map((qa) => qa.sessionQuestionId)
		const optionsResult =
			questionIds.length > 0
				? await db
						.select({
							id: sessionQuestionOptions.id,
							sessionQuestionId: sessionQuestionOptions.sessionQuestionId,
							content: sessionQuestionOptions.content,
							correct: sessionQuestionOptions.correct,
							order: sessionQuestionOptions.order
						})
						.from(sessionQuestionOptions)
						.where(inArray(sessionQuestionOptions.sessionQuestionId, questionIds))
						.orderBy(sessionQuestionOptions.sessionQuestionId, sessionQuestionOptions.order)
				: []

		// Group options by question
		const optionsByQuestion = optionsResult.reduce(
			(acc, option) => {
				if (!acc[option.sessionQuestionId]) {
					acc[option.sessionQuestionId] = []
				}
				acc[option.sessionQuestionId].push(option)
				return acc
			},
			{} as Record<number, typeof optionsResult>
		)

		// Build the questions array with user and correct answers and all options
		const questions = questionAttemptsResult.map((qa) => {
			const options = optionsByQuestion[qa.sessionQuestionId] || []
			const correctOption = options.find((opt) => opt.correct)
			const selectedOption = qa.selectedOptionId ? options.find((opt) => opt.id === qa.selectedOptionId) : null

			return {
				id: qa.question.id,
				question: qa.question.content || "Question content not available",
				userAnswer: selectedOption ? selectedOption.content || "No answer selected" : "No answer selected",
				correctAnswer: correctOption ? correctOption.content || "Correct answer not available" : "Correct answer not available",
				isCorrect: qa.correct || false,
				points: qa.question.points || 0,
				pointsAwarded: qa.pointsAwarded || 0,
				options: options.map((opt) => ({
					id: opt.id,
					content: opt.content,
					correct: opt.correct,
					selected: opt.id === qa.selectedOptionId
				}))
			}
		})

		// Calculate performance metrics
		const totalQuestions = questions.length
		const correctAnswers = questions.filter((q) => q.isCorrect).length
		const totalScore = questions.reduce((sum, q) => sum + (q.pointsAwarded || 0), 0)
		const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

		// Format completion time
		const completionTime = gameAttempt.startedAt && gameAttempt.completedAt ? formatCompletionTime(gameAttempt.startedAt, gameAttempt.completedAt) : null

		// Build the response
		const participantData = {
			id: participant.id,
			displayName: participant.name || participant.user?.name || "Anonymous",
			completionTime,
			accuracy,
			points: correctAnswers,
			totalScore,
			correctAnswers,
			totalQuestions,
			user: participant.user,
			questions
		}

		return json(participantData)
	} catch (err) {
		console.error("Error fetching participant data:", err)
		return error(500, "Internal server error")
	}
}

function formatCompletionTime(startTime: Date | string, endTime: Date | string): string {
	const start = new Date(startTime)
	const end = new Date(endTime)
	const diffMs = end.getTime() - start.getTime()

	const minutes = Math.floor(diffMs / 60000)
	const seconds = Math.floor((diffMs % 60000) / 1000)

	if (minutes > 0) {
		return `${minutes}m ${seconds}s`
	}
	return `${seconds}s`
}
