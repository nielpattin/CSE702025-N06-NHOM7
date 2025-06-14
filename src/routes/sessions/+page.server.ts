import { db } from "$lib/server/db"
import { quizSessions } from "$lib/server/db/schema"
import { redirect, error, fail } from "@sveltejs/kit"
import { eq } from "drizzle-orm"
import type { PageServerLoad, Actions } from "./$types"

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth()

	if (!session?.user) {
		redirect(302, "/signin")
	}

	const userSessions = await db.query.quizSessions.findMany({
		where: eq(quizSessions.hostId, session.user.id),
		with: {
			quiz: {
				columns: {
					title: true
				}
			},
			participants: {
				columns: {
					id: true
				}
			}
		},
		orderBy: quizSessions.createdAt
	})

	const sessionsWithCounts = userSessions.map((session) => ({
		id: session.id,
		quizId: session.quizId,
		hostId: session.hostId,
		code: session.code,
		status: session.status,
		expiresAt: session.expiresAt,
		createdAt: session.createdAt,
		updatedAt: session.updatedAt,
		quizName: session.quiz?.title || null,
		participantCount: session.participants.length
	}))

	return {
		sessions: sessionsWithCounts
	}
}

export const actions: Actions = {
	deleteSession: async ({ request, locals }) => {
		const session = await locals.auth()

		if (!session?.user) {
			throw error(401, "Unauthorized")
		}

		const formData = await request.formData()
		const sessionId = formData.get("id") as string

		if (!sessionId) {
			return fail(400, { error: "Session ID is required" })
		}

		const sessionIdNum = parseInt(sessionId, 10)
		if (isNaN(sessionIdNum)) {
			return fail(400, { error: "Invalid session ID" })
		}

		try {
			const quizSession = await db.query.quizSessions.findFirst({
				where: eq(quizSessions.id, sessionIdNum)
			})

			if (!quizSession) {
				throw error(404, "Session not found")
			}

			if (quizSession.hostId !== session.user.id) {
				throw error(403, "Forbidden: You can only delete your own sessions")
			}

			await db.delete(quizSessions).where(eq(quizSessions.id, sessionIdNum))

			return { success: true }
		} catch (err) {
			if (err && typeof err === "object" && "status" in err) {
				throw err
			}

			return fail(500, { error: "Failed to delete session" })
		}
	},

	toggleStatus: async ({ request, locals }) => {
		const session = await locals.auth()

		if (!session?.user) {
			throw error(401, "Unauthorized")
		}

		const formData = await request.formData()
		const sessionId = formData.get("id") as string
		const currentStatus = formData.get("currentStatus") as string

		if (!sessionId) {
			return fail(400, { error: "Session ID is required" })
		}

		const sessionIdNum = parseInt(sessionId, 10)
		if (isNaN(sessionIdNum)) {
			return fail(400, { error: "Invalid session ID" })
		}

		if (!currentStatus) {
			return fail(400, { error: "Current status is required" })
		}

		try {
			const quizSession = await db.query.quizSessions.findFirst({
				where: eq(quizSessions.id, sessionIdNum)
			})

			if (!quizSession) {
				throw error(404, "Session not found")
			}

			if (quizSession.hostId !== session.user.id) {
				throw error(403, "Forbidden: You can only modify your own sessions")
			}

			const newStatus = currentStatus === "active" ? "inactive" : "active"

			await db
				.update(quizSessions)
				.set({
					status: newStatus,
					updatedAt: new Date()
				})
				.where(eq(quizSessions.id, sessionIdNum))

			return { success: true, newStatus }
		} catch (err) {
			if (err && typeof err === "object" && "status" in err) {
				throw err
			}

			return fail(500, { error: "Failed to toggle session status" })
		}
	}
}
