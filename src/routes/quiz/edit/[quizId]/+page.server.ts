import { error, fail } from "@sveltejs/kit"
import { db } from "$lib/server/db"
import { quizzes, questions, questionOptions, quizTags, quizTagAssignments } from "$lib/server/db/schema"
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
			},
			tagAssignments: {
				with: {
					tag: true
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

	// Get all available tags
	const availableTags = await db.select().from(quizTags).orderBy(quizTags.name)

	// Get currently selected tag IDs
	const selectedTagIds = quiz.tagAssignments.map((assignment) => assignment.tag.id)

	return {
		quiz,
		questions: quiz.questions,
		availableTags,
		selectedTagIds
	}
}

export const actions: Actions = {
	updateQuizDetails: async ({ request, params, locals }) => {
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
		const description = data.get("description") as string
		const tagIds = data
			.getAll("tagIds")
			.map((id) => parseInt(id as string))
			.filter((id) => !isNaN(id))

		// Validate title
		if (!title || title.trim().length === 0) {
			return fail(400, { error: "Quiz title cannot be empty" })
		}

		if (title.trim().length > 256) {
			return fail(400, { error: "Quiz title cannot exceed 256 characters" })
		}

		try {
			// Update the quiz details
			await db
				.update(quizzes)
				.set({
					title: title.trim(),
					description: description?.trim() || null,
					updatedAt: new Date()
				})
				.where(eq(quizzes.id, quizId))

			// Update tag assignments
			// First, remove existing assignments
			await db.delete(quizTagAssignments).where(eq(quizTagAssignments.quizId, quizId))

			// Then add new assignments
			if (tagIds.length > 0) {
				const assignments = tagIds.map((tagId) => ({
					quizId,
					tagId
				}))
				await db.insert(quizTagAssignments).values(assignments)
			}

			return { success: true }
		} catch (err) {
			console.error("Error updating quiz details:", err)
			return fail(500, { error: "Failed to update quiz details. Please try again." })
		}
	}
}
