import { error, json } from "@sveltejs/kit"
import { db } from "$lib/server/db"
import { questions, questionOptions, quizzes } from "$lib/server/db/schema"
import { eq, and } from "drizzle-orm"
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

		// Delete question options first (foreign key constraint)
		await db.delete(questionOptions).where(eq(questionOptions.questionId, questionId))

		// Delete the question
		await db.delete(questions).where(eq(questions.id, questionId))

		return json({ success: true })
	} catch (err) {
		console.error("Error deleting question:", err)
		return json({ error: "Failed to delete question. Please try again." }, { status: 500 })
	}
}
