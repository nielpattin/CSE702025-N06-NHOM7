import { db } from "$lib/server/db"
import { quizzes, questions, users } from "$lib/server/db/schema"
import { redirect, fail } from "@sveltejs/kit"
import { eq, count } from "drizzle-orm"
import type { PageServerLoad, Actions } from "./$types"

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth()

	// Redirect if not authenticated
	if (!session?.user) {
		redirect(302, "/signin")
	}

	// Fetch all quizzes with creator names and question counts
	const allQuizzes = await db
		.select({
			id: quizzes.id,
			title: quizzes.title,
			description: quizzes.description,
			creatorId: quizzes.creatorId,
			status: quizzes.status,
			visibility: quizzes.visibility,
			createdAt: quizzes.createdAt,
			updatedAt: quizzes.updatedAt,
			creatorName: users.name,
			questionCount: count(questions.id)
		})
		.from(quizzes)
		.leftJoin(users, eq(quizzes.creatorId, users.id))
		.leftJoin(questions, eq(quizzes.id, questions.quizId))
		.groupBy(quizzes.id, users.name)

	// Get count of quizzes created by the current user
	const userQuizzesCount = await db
		.select({ count: count(quizzes.id) })
		.from(quizzes)
		.where(eq(quizzes.creatorId, session.user.id))

	return {
		quizzes: allQuizzes,
		userQuizzesCount: userQuizzesCount[0]?.count || 0
	}
}

export const actions: Actions = {
	publishQuiz: async (event) => {
		const session = await event.locals.auth()

		// Redirect if not authenticated
		if (!session?.user) {
			redirect(302, "/signin")
		}

		const data = await event.request.formData()
		const quizId = data.get("quizId")

		if (!quizId || typeof quizId !== "string") {
			return fail(400, { error: "Quiz ID is required" })
		}

		const quizIdNum = parseInt(quizId, 10)
		if (isNaN(quizIdNum)) {
			return fail(400, { error: "Invalid quiz ID" })
		}

		try {
			// Update the quiz status to 'published'
			await db
				.update(quizzes)
				.set({
					status: "published",
					updatedAt: new Date()
				})
				.where(eq(quizzes.id, quizIdNum))
		} catch (error) {
			console.error("Error publishing quiz:", error)
			return fail(500, { error: "Failed to publish quiz" })
		}

		throw redirect(303, "/library?tab=published")
	},

	archiveQuiz: async (event) => {
		const session = await event.locals.auth()

		// Redirect if not authenticated
		if (!session?.user) {
			redirect(302, "/signin")
		}

		const data = await event.request.formData()
		const quizId = data.get("quizId")

		if (!quizId || typeof quizId !== "string") {
			return fail(400, { error: "Quiz ID is required" })
		}

		const quizIdNum = parseInt(quizId, 10)
		if (isNaN(quizIdNum)) {
			return fail(400, { error: "Invalid quiz ID" })
		}

		try {
			// Update the quiz status to 'archived'
			await db
				.update(quizzes)
				.set({
					status: "archived",
					updatedAt: new Date()
				})
				.where(eq(quizzes.id, quizIdNum))

			return { success: true, message: "Quiz archived" }
		} catch (error) {
			console.error("Error archiving quiz:", error)
			return fail(500, { error: "Failed to archive quiz" })
		}
	},

	deleteQuiz: async (event) => {
		const session = await event.locals.auth()

		// Redirect if not authenticated
		if (!session?.user) {
			redirect(302, "/signin")
		}

		const data = await event.request.formData()
		const quizId = data.get("quizId")

		if (!quizId || typeof quizId !== "string") {
			return fail(400, { error: "Quiz ID is required" })
		}

		const quizIdNum = parseInt(quizId, 10)
		if (isNaN(quizIdNum)) {
			return fail(400, { error: "Invalid quiz ID" })
		}

		try {
			// Delete the quiz from the database
			await db.delete(quizzes).where(eq(quizzes.id, quizIdNum))

			return { success: true, message: "Quiz deleted" }
		} catch (error) {
			console.error("Error deleting quiz:", error)
			return fail(500, { error: "Failed to delete quiz" })
		}
	}
}
