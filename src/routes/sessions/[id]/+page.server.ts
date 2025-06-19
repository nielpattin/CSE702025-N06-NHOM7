import { error, fail, redirect } from "@sveltejs/kit"
import { db } from "$lib/server/db/index.js"
import { quizSessions, quizzes } from "$lib/server/db/schema.js"
import { and, eq, ne } from "drizzle-orm"
import type { PageServerLoad, Actions } from "./$types.js"

export const load: PageServerLoad = async ({ params, locals }) => {
	const session = await locals.auth()

	// Redirect if not authenticated
	if (!session?.user) {
		redirect(302, "/signin")
	}

	const sessionId = parseInt(params.id)

	if (isNaN(sessionId)) {
		throw error(404, "Session not found")
	}

	// Fetch session details with quiz information
	const sessionResult = await db
		.select({
			id: quizSessions.id,
			quizId: quizSessions.quizId,
			hostId: quizSessions.hostId,
			code: quizSessions.code,
			status: quizSessions.status,
			expiresAt: quizSessions.expiresAt,
			createdAt: quizSessions.createdAt,
			updatedAt: quizSessions.updatedAt,
			quiz: {
				id: quizzes.id,
				title: quizzes.title,
				description: quizzes.description,
				status: quizzes.status,
				visibility: quizzes.visibility
			}
		})
		.from(quizSessions)
		.innerJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
		.where(and(eq(quizSessions.id, sessionId), ne(quizSessions.status, "deleting")))
		.limit(1)

	if (sessionResult.length === 0) {
		throw error(404, "Session not found")
	}

	const quizSession = sessionResult[0]

	// Check if the current user is the host of this session
	if (quizSession.hostId !== session.user.id) {
		throw error(403, "You are not authorized to manage this session")
	}

	return {
		quizSession: quizSession
	}
}

export const actions: Actions = {
	updateDueDate: async ({ request, params, locals }) => {
		const session = await locals.auth()

		// Redirect if not authenticated
		if (!session?.user) {
			redirect(302, "/signin")
		}

		const sessionId = parseInt(params.id)

		if (isNaN(sessionId)) {
			return fail(400, { error: "Invalid session ID" })
		}

		const formData = await request.formData()
		const dueDate = formData.get("dueDate")?.toString()

		if (!dueDate) {
			return fail(400, { error: "Due date is required" })
		}

		// Parse and validate the due date
		const dueDateObj = new Date(dueDate)

		if (isNaN(dueDateObj.getTime())) {
			return fail(400, { error: "Invalid due date format" })
		}

		// Check if the due date is in the future
		const now = new Date()
		if (dueDateObj <= now) {
			return fail(400, { error: "Due date must be in the future" })
		}

		try {
			// Verify the session exists and the user is the host
			const sessionResult = await db.select({ hostId: quizSessions.hostId }).from(quizSessions).where(eq(quizSessions.id, sessionId)).limit(1)

			if (sessionResult.length === 0) {
				return fail(404, { error: "Session not found" })
			}

			if (sessionResult[0].hostId !== session.user.id) {
				return fail(403, { error: "You are not authorized to modify this session" })
			}

			// Update the session expiration date
			const updateResult = await db
				.update(quizSessions)
				.set({
					expiresAt: dueDateObj,
					updatedAt: new Date()
				})
				.where(eq(quizSessions.id, sessionId))
				.returning({ updatedId: quizSessions.id, updatedExpiresAt: quizSessions.expiresAt })

			// Verify the update was successful
			if (updateResult.length === 0) {
				return fail(500, { error: "Failed to update session - no rows affected" })
			}

			return { success: true, message: "Due date updated successfully" }
		} catch (err) {
			console.error("Error updating due date:", err)
			return fail(500, { error: "Failed to update due date" })
		}
	}
}
