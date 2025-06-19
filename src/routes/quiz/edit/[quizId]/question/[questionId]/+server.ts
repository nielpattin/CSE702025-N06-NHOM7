import { error, json } from "@sveltejs/kit"
import { db } from "$lib/server/db"
import { questions, questionOptions, quizzes, sessionQuestionOptions, sessionQuestions, questionAttempts } from "$lib/server/db/schema"
import { eq, and, inArray } from "drizzle-orm"
import type { RequestHandler } from "./$types"

export const PATCH: RequestHandler = async ({ params, locals, request }) => {
	const session = await locals.auth()

	if (!session?.user) {
		return json({ error: "You must be signed in to update questions" }, { status: 401 })
	}

	const quizId = parseInt(params.quizId, 10)
	const questionId = parseInt(params.questionId, 10)

	if (isNaN(quizId) || isNaN(questionId)) {
		return json({ error: "Invalid quiz ID or question ID" }, { status: 400 })
	}

	try {
		const body = await request.json()
		const { timeLimit, points } = body

		// First, verify the quiz exists and user has permission
		const quiz = await db.query.quizzes.findFirst({
			where: eq(quizzes.id, quizId)
		})

		if (!quiz) {
			return json({ error: "Quiz not found" }, { status: 404 })
		}

		if (quiz.creatorId !== session.user.id) {
			return json({ error: "You don't have permission to update questions in this quiz" }, { status: 403 })
		}

		// Verify the question exists and belongs to this quiz
		const question = await db.query.questions.findFirst({
			where: and(eq(questions.id, questionId), eq(questions.quizId, quizId))
		})

		if (!question) {
			return json({ error: "Question not found" }, { status: 404 })
		}

		// Build update object with only provided fields
		const updateData: Partial<{ timeLimit: number | null; points: number | null }> = {}
		if (timeLimit !== undefined) {
			updateData.timeLimit = timeLimit
		}
		if (points !== undefined) {
			updateData.points = points
		}

		if (Object.keys(updateData).length === 0) {
			return json({ error: "No valid fields to update" }, { status: 400 })
		}

		// Update the question
		await db.update(questions).set(updateData).where(eq(questions.id, questionId))

		return json({ success: true })
	} catch (err) {
		console.error("Error updating question:", err)
		return json({ error: "Failed to update question. Please try again." }, { status: 500 })
	}
}

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const session = await locals.auth()

	if (!session?.user) {
		return json({ error: "You must be signed in to delete questions" }, { status: 401 })
	}

	const quizId = parseInt(params.quizId, 10)
	const questionId = parseInt(params.questionId, 10)

	if (isNaN(quizId) || isNaN(questionId)) {
		return json({ error: "Invalid quiz ID or question ID" }, { status: 400 })
	}

	try {
		// First, verify the quiz exists and user has permission
		const quiz = await db.query.quizzes.findFirst({
			where: eq(quizzes.id, quizId)
		})

		if (!quiz) {
			return json({ error: "Quiz not found" }, { status: 404 })
		}

		if (quiz.creatorId !== session.user.id) {
			return json({ error: "You don't have permission to delete questions from this quiz" }, { status: 403 })
		}

		// Verify the question exists and belongs to this quiz
		const question = await db.query.questions.findFirst({
			where: and(eq(questions.id, questionId), eq(questions.quizId, quizId))
		})

		if (!question) {
			return json({ error: "Question not found" }, { status: 404 })
		}

		// Get all session questions that reference this question
		const sessionQuestionsToDelete = await db.select({ id: sessionQuestions.id }).from(sessionQuestions).where(eq(sessionQuestions.originalQuestionId, questionId))

		const sessionQuestionIds = sessionQuestionsToDelete.map((sq) => sq.id)

		// Delete question attempts that reference session questions
		if (sessionQuestionIds.length > 0) {
			await db.delete(questionAttempts).where(inArray(questionAttempts.sessionQuestionId, sessionQuestionIds))
		}

		// Delete session question options that reference session questions
		if (sessionQuestionIds.length > 0) {
			await db.delete(sessionQuestionOptions).where(inArray(sessionQuestionOptions.sessionQuestionId, sessionQuestionIds))
		}

		// Get all option IDs for this question
		const optionsToDelete = await db.select({ id: questionOptions.id }).from(questionOptions).where(eq(questionOptions.questionId, questionId))

		const optionIds = optionsToDelete.map((option) => option.id)

		// Delete any remaining session question options that reference these option IDs
		if (optionIds.length > 0) {
			await db.delete(sessionQuestionOptions).where(inArray(sessionQuestionOptions.originalOptionId, optionIds))
		}

		// Delete question options (foreign key constraint)
		await db.delete(questionOptions).where(eq(questionOptions.questionId, questionId))

		// Delete the question
		await db.delete(questions).where(eq(questions.id, questionId))

		return json({ success: true })
	} catch (err) {
		console.error("Error deleting question:", err)
		return json({ error: "Failed to delete question. Please try again." }, { status: 500 })
	}
}
