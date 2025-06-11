import { error, redirect, fail } from "@sveltejs/kit"
import { db } from "$lib/server/db"
import { quizzes, questions, questionOptions, type QuestionType } from "$lib/server/db/schema"
import { eq } from "drizzle-orm"
import type { PageServerLoad, Actions } from "./$types"

export const load: PageServerLoad = async ({ params }) => {
	const quizId = parseInt(params.quizId, 10)

	const quiz = await db.query.quizzes.findFirst({
		where: eq(quizzes.id, quizId)
	})

	if (!quiz) {
		throw error(404, "Quiz not found")
	}

	if (params.questionId === "new") {
		return {
			quiz,
			question: {
				id: "new",
				type: "multiple_choice",
				content: "",
				points: 10,
				timeLimit: 30,
				options: [
					{ content: "", correct: false },
					{ content: "", correct: false }
				]
			}
		}
	}

	const questionId = parseInt(params.questionId, 10)
	const question = await db.query.questions.findFirst({
		where: eq(questions.id, questionId),
		with: {
			options: true
		}
	})

	if (!question) {
		throw error(404, "Question not found")
	}

	return {
		quiz,
		question
	}
}

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const session = await locals.auth()
		if (!session?.user) {
			throw error(401, "Unauthorized")
		}

		const quizId = parseInt(params.quizId, 10)

		// Verify user has permission to edit this quiz
		const quiz = await db.query.quizzes.findFirst({
			where: eq(quizzes.id, quizId)
		})

		if (!quiz) {
			throw error(404, "Quiz not found")
		}

		if (quiz.creatorId !== session.user.id) {
			throw error(403, "Forbidden")
		}

		const formData = await request.formData()

		// Extract basic question details
		const content = formData.get("content") as string
		const type = formData.get("type") as QuestionType
		const points = parseInt(formData.get("points") as string, 10)
		const timeLimit = parseInt(formData.get("time_limit") as string, 10)

		// Validate required fields
		if (!content?.trim()) {
			return fail(400, { error: "Question content is required" })
		}

		if (!type || !["multiple_choice", "true_false"].includes(type)) {
			return fail(400, { error: "Invalid question type" })
		}

		if (isNaN(points) || points < 1) {
			return fail(400, { error: "Points must be a positive number" })
		}

		if (isNaN(timeLimit) || timeLimit < 1) {
			return fail(400, { error: "Time limit must be a positive number" })
		}

		// Parse answer options from FormData
		const options: Array<{ content: string; correct: boolean }> = []
		const optionIndexes = new Set<string>()

		// First pass: collect all option indexes
		for (const [key] of formData.entries()) {
			if (key.startsWith("option-content-")) {
				const index = key.replace("option-content-", "")
				optionIndexes.add(index)
			}
		}

		// Second pass: build options array
		for (const index of Array.from(optionIndexes).sort()) {
			const content = formData.get(`option-content-${index}`) as string
			const correct = formData.get(`option-correct-${index}`) === "on"

			if (content?.trim()) {
				options.push({
					content: content.trim(),
					correct
				})
			}
		}

		// Validate options
		if (options.length === 0) {
			return fail(400, { error: "At least one option is required" })
		}

		if (type === "multiple_choice" && options.length < 2) {
			return fail(400, { error: "Multiple choice questions require at least 2 options" })
		}

		if (type === "true_false" && options.length !== 2) {
			return fail(400, { error: "True/False questions must have exactly 2 options" })
		}

		const hasCorrectAnswer = options.some((option) => option.correct)
		if (!hasCorrectAnswer) {
			return fail(400, { error: "At least one option must be marked as correct" })
		}

		// Database operations
		try {
			const result = await db.transaction(async (tx) => {
				if (params.questionId === "new") {
					// Insert new question
					const [newQuestion] = await tx
						.insert(questions)
						.values({
							quizId,
							type,
							content,
							points,
							timeLimit
						})
						.returning({ id: questions.id })

					// Insert options for new question
					if (options.length > 0) {
						await tx.insert(questionOptions).values(
							options.map((option, index) => ({
								questionId: newQuestion.id,
								order: index,
								content: option.content,
								correct: option.correct
							}))
						)
					}

					return newQuestion.id
				} else {
					// Update existing question
					const questionId = parseInt(params.questionId, 10)

					await tx
						.update(questions)
						.set({
							type,
							content,
							points,
							timeLimit,
							updatedAt: new Date()
						})
						.where(eq(questions.id, questionId))

					// Delete existing options
					await tx.delete(questionOptions).where(eq(questionOptions.questionId, questionId))

					// Insert new options
					if (options.length > 0) {
						await tx.insert(questionOptions).values(
							options.map((option, index) => ({
								questionId,
								order: index,
								content: option.content,
								correct: option.correct
							}))
						)
					}

					return questionId
				}
			})
		} catch (err) {
			return fail(500, { error: "Failed to save question" })
		}

		// Redirect back to quiz editor (outside try-catch to avoid catching the redirect)
		throw redirect(302, `/quiz/edit/${params.quizId}`)
	}
}
