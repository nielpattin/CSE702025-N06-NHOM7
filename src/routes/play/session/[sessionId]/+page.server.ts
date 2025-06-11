import { error, fail } from "@sveltejs/kit"
import { db } from "$lib/server/db/index.js"
import { quizSessions, quizzes, sessionParticipants, users } from "$lib/server/db/schema.js"
import { eq, and } from "drizzle-orm"
import type { PageServerLoad, Actions } from "./$types.js"

export const load: PageServerLoad = async ({ params, locals }) => {
	const sessionId = parseInt(params.sessionId)

	if (isNaN(sessionId)) {
		throw error(404, "Session not found")
	}

	// Fetch session details with quiz information
	const sessionResult = await db
		.select({
			id: quizSessions.id,
			code: quizSessions.code,
			status: quizSessions.status,
			expiresAt: quizSessions.expiresAt,
			createdAt: quizSessions.createdAt,
			hostId: quizSessions.hostId,
			quiz: {
				id: quizzes.id,
				title: quizzes.title,
				description: quizzes.description
			}
		})
		.from(quizSessions)
		.innerJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
		.where(eq(quizSessions.id, sessionId))
		.limit(1)

	if (sessionResult.length === 0) {
		throw error(404, "Session not found")
	}

	const session = sessionResult[0]

	// Fetch participants for this session
	const participants = await db
		.select({
			id: sessionParticipants.id,
			name: sessionParticipants.name,
			userId: sessionParticipants.userId,
			createdAt: sessionParticipants.createdAt,
			user: {
				name: users.name,
				image: users.image
			}
		})
		.from(sessionParticipants)
		.leftJoin(users, eq(sessionParticipants.userId, users.id))
		.where(eq(sessionParticipants.quizSessionId, sessionId))
		.orderBy(sessionParticipants.createdAt)

	return {
		session,
		participants,
		userSession: locals.session
	}
}

export const actions: Actions = {
	joinSession: async ({ request, params, locals }) => {
		const sessionId = parseInt(params.sessionId)

		if (isNaN(sessionId)) {
			return fail(400, { error: "Invalid session ID" })
		}

		const formData = await request.formData()
		const name = formData.get("name")?.toString()

		try {
			// Check if session exists and is active
			const sessionResult = await db.select({ id: quizSessions.id, status: quizSessions.status }).from(quizSessions).where(eq(quizSessions.id, sessionId)).limit(1)

			if (sessionResult.length === 0) {
				return fail(404, { error: "Session not found" })
			}

			const session = sessionResult[0]
			if (session.status !== "active") {
				return fail(400, { error: "Session is not active" })
			}

			// Handle authenticated users
			if (locals.session?.user) {
				// Check if user has already joined this session
				const existingParticipant = await db
					.select({ id: sessionParticipants.id })
					.from(sessionParticipants)
					.where(and(eq(sessionParticipants.quizSessionId, sessionId), eq(sessionParticipants.userId, locals.session?.user.id)))
					.limit(1)

				if (existingParticipant.length > 0) {
					return fail(400, { error: "You have already joined this session" })
				}

				// Add authenticated user to participants
				await db.insert(sessionParticipants).values({
					quizSessionId: sessionId,
					userId: locals.session?.user.id,
					name: null // name is null for authenticated users
				})
			} else {
				// Handle guest users
				if (!name || name.trim() === "") {
					return fail(400, { error: "Name is required for guest users" })
				}

				const trimmedName = name.trim()
				if (trimmedName.length > 100) {
					return fail(400, { error: "Name must be 100 characters or less" })
				}

				// Add guest user to participants
				await db.insert(sessionParticipants).values({
					quizSessionId: sessionId,
					userId: null,
					name: trimmedName
				})
			}

			return { success: true }
		} catch (err) {
			console.error("Error joining session:", err)
			return fail(500, { error: "Failed to join session" })
		}
	}
}
