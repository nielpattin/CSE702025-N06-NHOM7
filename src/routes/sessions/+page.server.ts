import { db } from "$lib/server/db"
import { quizSessions, quizzes, sessionParticipants } from "$lib/server/db/schema"
import { redirect, error, fail } from "@sveltejs/kit"
import { eq, count, and } from "drizzle-orm"
import type { PageServerLoad, Actions } from "./$types"

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth()

	// Redirect if not authenticated
	if (!session?.user) {
		redirect(302, "/signin")
	}

	// Fetch all sessions where the current user is the host
	// Include related quiz data and participant count
	const userSessions = await db
		.select({
			id: quizSessions.id,
			quizId: quizSessions.quizId,
			hostId: quizSessions.hostId,
			code: quizSessions.code,
			status: quizSessions.status,
			expiresAt: quizSessions.expiresAt,
			createdAt: quizSessions.createdAt,
			updatedAt: quizSessions.updatedAt,
			quizName: quizzes.title,
			participantCount: count(sessionParticipants.id)
		})
		.from(quizSessions)
		.leftJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
		.leftJoin(sessionParticipants, eq(quizSessions.id, sessionParticipants.quizSessionId))
		.where(eq(quizSessions.hostId, session.user.id))
		.groupBy(quizSessions.id, quizSessions.quizId, quizSessions.hostId, quizSessions.code, quizSessions.status, quizSessions.expiresAt, quizSessions.createdAt, quizSessions.updatedAt, quizzes.title)
		.orderBy(quizSessions.createdAt)

	return {
		sessions: userSessions
	}
}

export const actions: Actions = {
	deleteSession: async ({ request, locals }) => {
		const session = await locals.auth()

		// Check if user is authenticated
		if (!session?.user) {
			throw error(401, "Unauthorized")
		}

		const formData = await request.formData()
		const sessionId = formData.get("id") as string

		// Validate session ID
		if (!sessionId) {
			return fail(400, { error: "Session ID is required" })
		}

		const sessionIdNum = parseInt(sessionId, 10)
		if (isNaN(sessionIdNum)) {
			return fail(400, { error: "Invalid session ID" })
		}

		try {
			// Find the session and verify it belongs to the current user
			const quizSession = await db.query.quizSessions.findFirst({
				where: eq(quizSessions.id, sessionIdNum)
			})

			if (!quizSession) {
				throw error(404, "Session not found")
			}

			// Check if the session belongs to the current user
			if (quizSession.hostId !== session.user.id) {
				throw error(403, "Forbidden: You can only delete your own sessions")
			}

			// Delete the session (cascade will handle related data)
			await db.delete(quizSessions).where(eq(quizSessions.id, sessionIdNum))

			return { success: true }
		} catch (err) {
			// Re-throw SvelteKit errors (401, 403, 404)
			if (err && typeof err === "object" && "status" in err) {
				throw err
			}

			// Handle database or other errors
			return fail(500, { error: "Failed to delete session" })
		}
	},

	toggleStatus: async ({ request, locals }) => {
		const session = await locals.auth()

		// Check if user is authenticated
		if (!session?.user) {
			throw error(401, "Unauthorized")
		}

		const formData = await request.formData()
		const sessionId = formData.get("id") as string
		const currentStatus = formData.get("currentStatus") as string

		// Validate session ID
		if (!sessionId) {
			return fail(400, { error: "Session ID is required" })
		}

		const sessionIdNum = parseInt(sessionId, 10)
		if (isNaN(sessionIdNum)) {
			return fail(400, { error: "Invalid session ID" })
		}

		// Validate current status
		if (!currentStatus) {
			return fail(400, { error: "Current status is required" })
		}

		try {
			// Find the session and verify it belongs to the current user
			const quizSession = await db.query.quizSessions.findFirst({
				where: eq(quizSessions.id, sessionIdNum)
			})

			if (!quizSession) {
				throw error(404, "Session not found")
			}

			// Check if the session belongs to the current user
			if (quizSession.hostId !== session.user.id) {
				throw error(403, "Forbidden: You can only modify your own sessions")
			}

			// Determine the new status (toggle between active and inactive)
			const newStatus = currentStatus === "active" ? "inactive" : "active"

			// Update the session status
			await db
				.update(quizSessions)
				.set({
					status: newStatus,
					updatedAt: new Date()
				})
				.where(eq(quizSessions.id, sessionIdNum))

			return { success: true, newStatus }
		} catch (err) {
			// Re-throw SvelteKit errors (401, 403, 404)
			if (err && typeof err === "object" && "status" in err) {
				throw err
			}

			// Handle database or other errors
			return fail(500, { error: "Failed to toggle session status" })
		}
	}
}
