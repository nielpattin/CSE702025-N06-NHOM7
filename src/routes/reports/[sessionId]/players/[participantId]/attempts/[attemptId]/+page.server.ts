import { db } from "$lib/server/db"
import { sessionParticipants, gameAttempts, users, sessionQuestions, quizSessions, quizzes, questionAttempts, sessionQuestionOptions } from "$lib/server/db/schema"
import { error, redirect } from "@sveltejs/kit"
import { eq, and, asc } from "drizzle-orm"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth()
	if (!session?.user) {
		redirect(302, "/signin")
	}

	const sessionId = parseInt(event.params.sessionId)
	const participantId = parseInt(event.params.participantId)
	const attemptId = parseInt(event.params.attemptId)

	if (isNaN(sessionId) || isNaN(participantId) || isNaN(attemptId)) {
		throw error(400, "Invalid parameters")
	}

	const attemptResult = await db
		.select({
			attemptId: gameAttempts.id,
			attemptQuizSessionId: gameAttempts.quizSessionId,
			attemptParticipantId: gameAttempts.participantId,
			attemptNumber: gameAttempts.attemptNumber,
			score: gameAttempts.score,
			status: gameAttempts.status,
			startedAt: gameAttempts.startedAt,
			completedAt: gameAttempts.completedAt,
			participantId: sessionParticipants.id,
			participantName: sessionParticipants.name,
			participantUserId: sessionParticipants.userId,
			userName: users.name,
			userImage: users.image,
			quizTitle: quizzes.title
		})
		.from(gameAttempts)
		.innerJoin(sessionParticipants, eq(gameAttempts.participantId, sessionParticipants.id))
		.leftJoin(users, eq(sessionParticipants.userId, users.id))
		.innerJoin(quizSessions, eq(gameAttempts.quizSessionId, quizSessions.id))
		.innerJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
		.where(and(eq(gameAttempts.id, attemptId), eq(gameAttempts.quizSessionId, sessionId), eq(gameAttempts.participantId, participantId)))
		.limit(1)

	if (attemptResult.length === 0) {
		throw error(404, "Attempt not found")
	}

	const result = attemptResult[0]

	const questionsWithAnswers = await db
		.select({
			questionId: sessionQuestions.id,
			questionOriginalId: sessionQuestions.originalQuestionId,
			questionType: sessionQuestions.type,
			questionContent: sessionQuestions.content,
			questionTimeLimit: sessionQuestions.timeLimit,
			questionPoints: sessionQuestions.points,
			attemptId: questionAttempts.id,
			selectedSessionOptionId: questionAttempts.selectedSessionOptionId,
			correct: questionAttempts.correct,
			timeTakenMs: questionAttempts.timeTakenMs,
			pointsAwarded: questionAttempts.pointsAwarded
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

	const questionsWithDetails = questionsWithAnswers.map((item) => {
		const options = questionOptionsMap.get(item.questionId) || []
		const selectedOption = item.selectedSessionOptionId ? options.find((opt) => opt.id === item.selectedSessionOptionId) : null
		const correctOption = options.find((opt) => opt.correct)

		return {
			id: item.questionId,
			type: item.questionType,
			content: item.questionContent,
			timeLimit: item.questionTimeLimit,
			points: item.questionPoints,
			options: options.map((opt) => ({
				id: opt.id,
				content: opt.content,
				correct: opt.correct,
				selected: item.selectedSessionOptionId === opt.id
			})),
			userAnswer: selectedOption?.content || null,
			correctAnswer: correctOption?.content || null,
			isCorrect: item.correct || false,
			pointsAwarded: item.pointsAwarded || 0,
			timeTaken: item.timeTakenMs || null
		}
	})

	const totalQuestions = questionsWithDetails.length
	const answeredQuestions = questionsWithDetails.filter((q) => q.userAnswer !== null).length
	const correctAnswers = questionsWithDetails.filter((q) => q.isCorrect).length
	const totalPossiblePoints = questionsWithDetails.reduce((sum, q) => sum + (q.points || 0), 0)
	const totalTimeTaken = questionsWithDetails.reduce((sum, q) => sum + (q.timeTaken || 0), 0)

	const attempt = {
		id: result.attemptId,
		quizSessionId: result.attemptQuizSessionId,
		participantId: result.attemptParticipantId,
		attemptNumber: result.attemptNumber,
		score: result.score,
		status: result.status,
		startedAt: result.startedAt,
		completedAt: result.completedAt,
		displayName: result.participantName || result.userName || "Anonymous"
	}

	const participant = {
		id: result.participantId,
		name: result.participantName,
		userId: result.participantUserId,
		user: {
			name: result.userName,
			image: result.userImage
		},
		displayName: result.participantName || result.userName || "Anonymous"
	}

	const quiz = {
		title: result.quizTitle
	}

	return {
		attemptDetails: {
			attempt,
			participant,
			quiz,
			questions: questionsWithDetails,
			summary: {
				totalQuestions,
				answeredQuestions,
				correctAnswers,
				incorrectAnswers: answeredQuestions - correctAnswers,
				score: attempt.score || 0,
				totalPossiblePoints,
				accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
				totalTimeTaken,
				averageTimePerQuestion: answeredQuestions > 0 ? Math.round(totalTimeTaken / answeredQuestions) : 0
			}
		}
	}
}
