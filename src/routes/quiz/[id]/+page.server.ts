import { error, redirect, fail } from "@sveltejs/kit"
import { db } from "$lib/server/db"
import { quizzes, quizSessions, sessionQuestions, sessionQuestionOptions } from "$lib/server/db/schema"
import { eq } from "drizzle-orm"
import type { PageServerLoad, Actions } from "./$types"

export const load: PageServerLoad = async ({ params, locals }) => {
	const session = await locals.auth()

	const quizId = parseInt(params.id, 10)

	if (isNaN(quizId)) {
		throw error(400, "Invalid quiz ID")
	}

	const quiz = await db.query.quizzes.findFirst({
		where: eq(quizzes.id, quizId),
		with: {
			creator: true,
			questions: {
				with: {
					options: true
				}
			},
			quizSessions: {
				with: {
					participants: true
				}
			}
		}
	})

	if (!quiz) {
		throw error(404, "Quiz not found")
	}

	const isOwner = session?.user?.id === quiz.creatorId

	if (quiz.visibility === "private" && !isOwner) {
		throw error(403, "This quiz is private")
	}

	const allParticipants = new Set()
	quiz.quizSessions.forEach((session) => {
		session.participants.forEach((participant) => {
			allParticipants.add(participant.id)
		})
	})

	const quizWithParticipantCount = {
		...quiz,
		participants: allParticipants.size
	}

	return {
		quiz: quizWithParticipantCount,
		isOwner
	}
}

export const actions: Actions = {
	startSession: async (event) => {
		const session = await event.locals.auth()

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

			let code: string
			let isUnique = false
			let attempts = 0
			const maxAttempts = 10

			do {
				code = Math.random().toString(36).substring(2, 8).toUpperCase()
				const existingSession = await db.query.quizSessions.findFirst({ where: eq(quizSessions.code, code) })
				isUnique = !existingSession
				attempts++
			} while (!isUnique && attempts < maxAttempts)

			if (!isUnique) {
				return fail(500, { error: "Failed to generate unique session code" })
			}

			const expiresAt = new Date()
			expiresAt.setHours(expiresAt.getHours() + 24)
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

			for (const question of quiz.questions) {
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

		throw redirect(303, `/sessions/${newSession.id}`)
	}
}
