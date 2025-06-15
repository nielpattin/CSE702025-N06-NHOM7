import { db } from "$lib/server/db"
import { quizzes, questions, users, quizSessions, questionOptions, sessionQuestions, sessionQuestionOptions } from "$lib/server/db/schema"
import { redirect, fail } from "@sveltejs/kit"
import { eq, count, and, asc, desc } from "drizzle-orm"
import type { PageServerLoad, Actions } from "./$types"

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth()

	// Redirect if not authenticated
	if (!session?.user) {
		redirect(302, "/signin")
	}

	// Get sortOrder from query parameters
	const sortOrder = event.url.searchParams.get("sortOrder")
	const validSortOrder = sortOrder === "asc" || sortOrder === "desc" ? sortOrder : "desc"

	// Fetch all quizzes with creator names and question counts
	const allQuizzes = await db.query.quizzes.findMany({
		with: {
			creator: {
				columns: {
					name: true
				}
			},
			questions: {
				columns: {
					id: true
				}
			}
		},
		orderBy: validSortOrder === "asc" ? asc(quizzes.createdAt) : desc(quizzes.createdAt)
	})

	const quizzesWithCounts = allQuizzes.map((quiz) => ({
		...quiz,
		creatorName: quiz.creator?.name || "Unknown",
		questionCount: quiz.questions.length
	}))

	// Get count of quizzes created by the current user
	const userQuizzesCount = await db
		.select({ count: count(quizzes.id) })
		.from(quizzes)
		.where(eq(quizzes.creatorId, session.user.id))

	return {
		quizzes: quizzesWithCounts,
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
			await db.transaction(async (tx) => {
				// First, find all questions for this quiz using relational query
				const quiz = await tx.query.quizzes.findFirst({
					where: eq(quizzes.id, quizIdNum),
					with: {
						questions: {
							columns: {
								id: true
							}
						}
					}
				})

				if (!quiz) {
					throw new Error("Quiz not found")
				}

				const questionIds = quiz.questions.map((q) => q.id)

				if (questionIds.length > 0) {
					// Delete session question options that reference these questions through session questions
					for (const questionId of questionIds) {
						const sessionQuestionsForQuestion = await tx.select({ id: sessionQuestions.id }).from(sessionQuestions).where(eq(sessionQuestions.originalQuestionId, questionId))

						for (const sessionQuestion of sessionQuestionsForQuestion) {
							await tx.delete(sessionQuestionOptions).where(eq(sessionQuestionOptions.sessionQuestionId, sessionQuestion.id))
						}

						// Delete session questions that reference these questions
						await tx.delete(sessionQuestions).where(eq(sessionQuestions.originalQuestionId, questionId))
					}
				}

				// Now delete the quiz (this will cascade to delete questions and their options)
				await tx.delete(quizzes).where(eq(quizzes.id, quizIdNum))
			})

			return { success: true, message: "Quiz deleted" }
		} catch (error) {
			console.error("Error deleting quiz:", error)
			return fail(500, { error: "Failed to delete quiz" })
		}
	},

	startSession: async (event) => {
		const session = await event.locals.auth()

		// Verify user is authenticated
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
		let newSession: typeof quizSessions.$inferSelect

		try {
			// Fetch the quiz with its questions and options to verify it exists and is published
			const quiz = await db.query.quizzes.findFirst({
				where: eq(quizzes.id, quizIdNum),
				with: {
					questions: {
						with: {
							options: true
						}
					}
				}
			})

			if (!quiz) {
				return fail(404, { error: "Quiz not found" })
			}

			if (quiz.status !== "published") {
				return fail(400, { error: "Quiz must be published to start a session" })
			}

			// Generate a unique, user-friendly code (6-8 alphanumeric characters)
			let code: string
			let isUnique = false
			let attempts = 0
			const maxAttempts = 10

			do {
				// Generate 6-character alphanumeric code (uppercase letters and numbers)
				code = Math.random().toString(36).substring(2, 8).toUpperCase()

				// Check if code already exists
				const existingSession = await db.query.quizSessions.findFirst({ where: eq(quizSessions.code, code) })

				isUnique = !existingSession
				attempts++
			} while (!isUnique && attempts < maxAttempts)

			if (!isUnique) {
				return fail(500, { error: "Failed to generate unique session code" })
			}

			// Set expiration to 24 hours from now
			const expiresAt = new Date()
			expiresAt.setHours(expiresAt.getHours() + 24)

			// Insert new session record
			;[newSession] = await db
				.insert(quizSessions)
				.values({
					quizId: quizIdNum,
					hostId: session.user.id,
					code: code,
					status: "inactive",
					expiresAt: expiresAt
				})
				.returning()

			// Snapshot questions and options from the quiz to the session
			for (const question of quiz.questions) {
				// Insert the question into sessionQuestions
				const [sessionQuestion] = await db
					.insert(sessionQuestions)
					.values({
						quizSessionId: newSession.id,
						originalQuestionId: question.id,
						type: question.type,
						content: question.content,
						timeLimit: question.timeLimit,
						points: question.points
					})
					.returning()

				// Insert each option into sessionQuestionOptions
				for (const option of question.options) {
					await db.insert(sessionQuestionOptions).values({
						sessionQuestionId: sessionQuestion.id,
						originalOptionId: option.id,
						order: option.order,
						content: option.content,
						correct: option.correct
					})
				}
			}
		} catch (error) {
			console.error("Error starting quiz session:", error)
			return fail(500, { error: "Failed to start quiz session" })
		}

		// Redirect immediately to the new session page (outside try-catch)
		throw redirect(303, `/sessions/${newSession.id}`)
	},

	toggleVisibility: async (event) => {
		const session = await event.locals.auth()

		// Redirect if not authenticated
		if (!session?.user) {
			redirect(302, "/signin")
		}

		const data = await event.request.formData()
		const quizId = data.get("quizId")
		const visibility = data.get("visibility")

		if (!quizId || typeof quizId !== "string") {
			return fail(400, { error: "Quiz ID is required" })
		}

		if (!visibility || typeof visibility !== "string") {
			return fail(400, { error: "Visibility status is required" })
		}

		const quizIdNum = parseInt(quizId, 10)
		if (isNaN(quizIdNum)) {
			return fail(400, { error: "Invalid quiz ID" })
		}

		if (visibility !== "public" && visibility !== "private") {
			return fail(400, { error: "Invalid visibility status" })
		}

		try {
			// Verify quiz exists and user has permission to modify it
			const quiz = await db.query.quizzes.findFirst({
				where: eq(quizzes.id, quizIdNum),
				columns: {
					id: true,
					creatorId: true
				}
			})

			if (!quiz) {
				return fail(404, { error: "Quiz not found" })
			}

			if (quiz.creatorId !== session.user.id) {
				return fail(403, { error: "You don't have permission to modify this quiz" })
			}

			// Update the quiz visibility
			await db
				.update(quizzes)
				.set({
					visibility: visibility as "public" | "private",
					updatedAt: new Date()
				})
				.where(eq(quizzes.id, quizIdNum))

			return { success: true, message: `Quiz visibility updated to ${visibility}` }
		} catch (error) {
			console.error("Error updating quiz visibility:", error)
			return fail(500, { error: "Failed to update quiz visibility" })
		}
	}
}
