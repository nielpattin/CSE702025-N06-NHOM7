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

	const attemptData = await db.query.gameAttempts.findFirst({
		where: and(eq(gameAttempts.id, attemptId), eq(gameAttempts.quizSessionId, sessionId), eq(gameAttempts.participantId, participantId)),
		with: {
			participant: {
				with: {
					user: true
				}
			},
			quizSession: {
				with: {
					quiz: true
				}
			}
		}
	})

	if (!attemptData) {
		throw error(404, "Attempt not found")
	}

	const questionsWithDetails = await db.query.sessionQuestions.findMany({
		where: eq(sessionQuestions.quizSessionId, sessionId),
		with: {
			options: true,
			questionAttempts: {
				where: eq(questionAttempts.gameAttemptId, attemptId)
			}
		},
		orderBy: asc(sessionQuestions.id)
	})

	const questions = questionsWithDetails.map((question) => {
		const questionAttempt = question.questionAttempts[0] || null
		const selectedOption = questionAttempt?.selectedSessionOptionId ? question.options.find((opt) => opt.id === questionAttempt.selectedSessionOptionId) : null
		const correctOption = question.options.find((opt) => opt.correct)

		return {
			id: question.id,
			type: question.type,
			content: question.content,
			timeLimit: question.timeLimit,
			points: question.points,
			options: question.options.map((opt) => ({
				id: opt.id,
				content: opt.content,
				correct: opt.correct,
				selected: selectedOption?.id === opt.id
			})),
			userAnswer: selectedOption?.content || null,
			correctAnswer: correctOption?.content || null,
			isCorrect: questionAttempt?.correct || false,
			pointsAwarded: questionAttempt?.pointsAwarded || 0,
			timeTaken: questionAttempt?.timeTakenMs || null
		}
	})

	const totalQuestions = questions.length
	const answeredQuestions = questions.filter((q) => q.userAnswer !== null).length
	const correctAnswers = questions.filter((q) => q.isCorrect).length
	const totalPossiblePoints = questions.reduce((sum, q) => sum + (q.points || 0), 0)
	const totalTimeTaken = questions.reduce((sum, q) => sum + (q.timeTaken || 0), 0)

	const attempt = {
		id: attemptData.id,
		quizSessionId: attemptData.quizSessionId,
		participantId: attemptData.participantId,
		attemptNumber: attemptData.attemptNumber,
		score: attemptData.score,
		status: attemptData.status,
		startedAt: attemptData.startedAt,
		completedAt: attemptData.completedAt,
		displayName: attemptData.participant?.name || attemptData.participant?.user?.name || "Anonymous"
	}

	const participant = {
		id: attemptData.participant?.id,
		name: attemptData.participant?.name,
		userId: attemptData.participant?.userId,
		user: {
			name: attemptData.participant?.user?.name,
			image: attemptData.participant?.user?.image
		},
		displayName: attemptData.participant?.name || attemptData.participant?.user?.name || "Anonymous"
	}

	const quiz = {
		title: attemptData.quizSession?.quiz?.title
	}

	return {
		attemptDetails: {
			attempt,
			participant,
			quiz,
			questions,
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
