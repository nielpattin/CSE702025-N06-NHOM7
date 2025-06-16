import { db } from "$lib/server/db"
import { quizSessions, quizzes, sessionParticipants, gameAttempts, questionAttempts, sessionQuestions, sessionQuestionOptions } from "$lib/server/db/schema"
import { redirect, error, fail } from "@sveltejs/kit"
import { eq, and, ilike, desc, asc, count, sql, inArray, ne, or, lt } from "drizzle-orm"
import type { PageServerLoad, Actions } from "./$types"

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth()

	if (!session?.user) {
		redirect(302, "/signin")
	}

	// Ensure sessions are marked as expired in DB if their time has passed
	const now = new Date()
	try {
		const sessionsToExpire = await db
			.select({ id: quizSessions.id })
			.from(quizSessions)
			.where(and(eq(quizSessions.hostId, session.user.id), or(eq(quizSessions.status, "active"), eq(quizSessions.status, "inactive")), lt(quizSessions.expiresAt, now)))

		if (sessionsToExpire.length > 0) {
			const idsToExpire = sessionsToExpire.map((s) => s.id)
			await db.update(quizSessions).set({ status: "expired", updatedAt: now }).where(inArray(quizSessions.id, idsToExpire))
			console.log(`Expired ${idsToExpire.length} overdue session(s) for user ${session.user.id}.`)
		}
	} catch (error) {
		console.error(`Error expiring overdue sessions for user ${session.user.id}:`, error)
	}

	const url = new URL(event.request.url)
	const page = parseInt(url.searchParams.get("page") || "1")
	const search = url.searchParams.get("search") || ""
	const sortBy = url.searchParams.get("sortBy") || "createdAt"
	const sortOrder = url.searchParams.get("sortOrder") || "desc"
	const perPage = 10

	const baseWhere = and(eq(quizSessions.hostId, session.user.id), ne(quizSessions.status, "deleting"))
	let whereCondition = baseWhere

	if (search) {
		const relevantQuizzes = await db
			.select({ id: quizzes.id })
			.from(quizzes)
			.where(ilike(quizzes.title, `%${search}%`))

		if (relevantQuizzes.length === 0) {
			return {
				sessions: [],
				pagination: {
					currentPage: page,
					perPage,
					totalSessions: 0,
					totalPages: 0
				},
				search,
				sortBy,
				sortOrder
			}
		}

		const quizIds = relevantQuizzes.map((q) => q.id)
		whereCondition = and(eq(quizSessions.hostId, session.user.id), ne(quizSessions.status, "deleting"), inArray(quizSessions.quizId, quizIds))!
	}

	const orderByDirection = sortOrder === "asc" ? asc : desc

	let orderByClause
	if (sortBy === "quizName") {
		orderByClause = orderByDirection(quizzes.title)
	} else if (sortBy === "participantCount") {
		orderByClause = orderByDirection(sql`count(DISTINCT ${sessionParticipants.id})`)
	} else if (sortBy === "status") {
		orderByClause = orderByDirection(quizSessions.status)
	} else {
		orderByClause = orderByDirection(quizSessions.createdAt)
	}

	const [userSessions, totalCountResult] = await Promise.all([
		db
			.select({
				id: quizSessions.id,
				quizId: quizSessions.quizId,
				hostId: quizSessions.hostId,
				code: quizSessions.code,
				status: quizSessions.status,
				expiresAt: quizSessions.expiresAt,
				createdAt: quizSessions.createdAt,
				updatedAt: quizSessions.updatedAt,
				quizTitle: quizzes.title,
				imageUrl: quizzes.imageUrl,
				participantCount: sql<number>`count(DISTINCT ${sessionParticipants.id})`.as("participant_count")
			})
			.from(quizSessions)
			.leftJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
			.leftJoin(sessionParticipants, eq(sessionParticipants.quizSessionId, quizSessions.id))
			.where(whereCondition)
			.groupBy(quizSessions.id, quizSessions.quizId, quizSessions.hostId, quizSessions.code, quizSessions.status, quizSessions.expiresAt, quizSessions.createdAt, quizSessions.updatedAt, quizzes.title, quizzes.imageUrl)
			.orderBy(orderByClause)
			.limit(perPage)
			.offset((page - 1) * perPage),

		db.select({ count: count() }).from(quizSessions).leftJoin(quizzes, eq(quizSessions.quizId, quizzes.id)).where(whereCondition)
	])

	const totalSessions = totalCountResult[0]?.count || 0
	const totalPages = Math.ceil(totalSessions / perPage)

	const sessionsWithCounts = userSessions.map((session) => ({
		id: session.id,
		quizId: session.quizId,
		hostId: session.hostId,
		code: session.code,
		status: session.status,
		expiresAt: session.expiresAt,
		createdAt: session.createdAt,
		updatedAt: session.updatedAt,
		quizName: session.quizTitle || "Untitled Quiz",
		imageUrl: session.imageUrl,
		participantCount: Number(session.participantCount) || 0
	}))

	return {
		sessions: sessionsWithCounts,
		pagination: {
			currentPage: page,
			perPage,
			totalSessions,
			totalPages
		},
		search,
		sortBy,
		sortOrder
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
			const sessionToDelete = await db.query.quizSessions.findFirst({
				where: eq(quizSessions.id, sessionIdNum),
				columns: {
					id: true,
					hostId: true,
					status: true
				}
			})

			if (!sessionToDelete) {
				return fail(404, { error: "Session not found" })
			}

			if (sessionToDelete.hostId !== session.user.id) {
				return fail(403, { error: "You can only delete your own sessions" })
			}
			if (sessionToDelete.status === "deleting") {
				return fail(400, { error: "Session is already marked for deletion" })
			}

			// Always mark for deletion, never perform immediate deletion
			await db
				.update(quizSessions)
				.set({
					status: "deleting",
					updatedAt: new Date()
				})
				.where(eq(quizSessions.id, sessionIdNum))

			return {
				success: true,
				message: "Session marked for deletion",
				immediateDelete: false
			}
		} catch (err) {
			console.error("Error deleting session:", err)
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

			if (quizSession.status === "deleting") {
				return fail(400, { error: "Cannot change status of a session that is pending deletion." })
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
