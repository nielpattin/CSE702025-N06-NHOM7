import { error, fail } from "@sveltejs/kit"
import { db } from "$lib/server/db"
import { quizzes, questions, questionOptions } from "$lib/server/db/schema"
import { eq } from "drizzle-orm"
import type { PageServerLoad, Actions } from "./$types"

export const load: PageServerLoad = async ({ params, locals }) => {
	const session = await locals.auth()

	if (!session?.user) {
		throw error(401, "You must be signed in to edit quizzes")
	}

	const quizId = parseInt(params.quizId, 10)

	const quiz = await db.query.quizzes.findFirst({
		where: eq(quizzes.id, quizId),
		with: {
			questions: {
				with: {
					options: true
				}
			}
		}
	})

	if (!quiz) {
		throw error(404, "Quiz not found")
	}

	// Check if user has permission to edit this quiz
	if (quiz.creatorId !== session.user.id) {
		throw error(403, "You don't have permission to edit this quiz")
	}

	return {
		quiz,
		questions: quiz.questions
	}
}

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const session = await locals.auth()

		if (!session?.user) {
			return fail(401, { error: "You must be signed in to edit quizzes" })
		}

		const quizId = parseInt(params.quizId, 10)

		// Verify quiz exists and user has permission
		const quiz = await db.query.quizzes.findFirst({ where: eq(quizzes.id, quizId) })

		if (!quiz) {
			return fail(404, { error: "Quiz not found" })
		}

		if (quiz.creatorId !== session.user.id) {
			return fail(403, { error: "You don't have permission to edit this quiz" })
		}

		const data = await request.formData()
		const title = data.get("title") as string

		// Validate title
		if (!title || title.trim().length === 0) {
			return fail(400, { error: "Quiz title cannot be empty" })
		}

		if (title.trim().length > 256) {
			return fail(400, { error: "Quiz title cannot exceed 256 characters" })
		}

		try {
			// Update the quiz title
			await db
				.update(quizzes)
				.set({
					title: title.trim(),
					updatedAt: new Date()
				})
				.where(eq(quizzes.id, quizId))

			return { success: true }
		} catch (err) {
			console.error("Error updating quiz title:", err)
			return fail(500, { error: "Failed to update quiz title. Please try again." })
		}
	}
}
