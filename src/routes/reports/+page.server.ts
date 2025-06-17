import { db } from "$lib/server/db"
import { quizzes, quizSessions, sessionParticipants, gameAttempts, questionAttempts } from "$lib/server/db/schema"
import { redirect, fail } from "@sveltejs/kit"
import { eq, desc, asc, ilike, sql, count, and, inArray } from "drizzle-orm"
import type { PageServerLoad, Actions } from "./$types"
export interface TransformedReport {
	id: number
	sessionName: string
	createdDate: Date | string | null
	participantCount: number
	status: string
}

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth()

	if (!session?.user) {
		redirect(302, "/signin")
	}

	const url = new URL(event.request.url)
	const page = parseInt(url.searchParams.get("page") || "1")
	const search = url.searchParams.get("search") || ""
	const sortBy = url.searchParams.get("sortBy") || "createdDate"
	const sortOrder = url.searchParams.get("sortOrder") || "desc"
	const perPage = 9

	// Build base conditions for quiz sessions
	const baseWhere = eq(quizSessions.hostId, session.user.id!)
	let searchCondition = baseWhere

	// Handle search by finding matching quiz IDs first
	if (search) {
		const relevantQuizzes = await db
			.selectDistinct({ id: quizzes.id })
			.from(quizzes)
			.where(ilike(quizzes.title, `%${search}%`))

		if (relevantQuizzes.length === 0) {
			return {
				sessionReports: [],
				pagination: { currentPage: page, perPage, totalReports: 0, totalPages: 0 },
				search,
				sortBy,
				sortOrder
			}
		}
		const quizIdsToFilter = relevantQuizzes.map((q) => q.id)
		searchCondition = and(baseWhere, inArray(quizSessions.quizId, quizIdsToFilter))!
	}

	// Get total count for pagination
	const totalCountResult = await db.select({ count: count() }).from(quizSessions).where(searchCondition)

	const totalReports = totalCountResult[0]?.count || 0
	const totalPages = Math.ceil(totalReports / perPage)

	if (totalReports === 0) {
		return {
			sessionReports: [],
			pagination: { currentPage: page, perPage, totalReports: 0, totalPages: 0 },
			search,
			sortBy,
			sortOrder
		}
	}

	const orderByDirection = sortOrder === "asc" ? asc : desc

	let orderByClause
	switch (sortBy) {
		case "sessionName":
			orderByClause = orderByDirection(quizzes.title)
			break
		case "participantCount":
			orderByClause = orderByDirection(sql`COALESCE(COUNT(DISTINCT ${sessionParticipants.id}), 0)`)
			break
		case "status":
			orderByClause = orderByDirection(quizSessions.status)
			break
		default:
			orderByClause = orderByDirection(quizSessions.createdAt)
	}

	// Simplified query without accuracy calculation for better performance
	const sessionReportsData = await db
		.select({
			id: quizSessions.id,
			sessionName: quizzes.title,
			createdDate: quizSessions.createdAt,
			status: quizSessions.status,
			participantCount: sql<number>`COALESCE(COUNT(DISTINCT ${sessionParticipants.id}), 0)`.mapWith(Number)
		})
		.from(quizSessions)
		.leftJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
		.leftJoin(sessionParticipants, eq(sessionParticipants.quizSessionId, quizSessions.id))
		.where(searchCondition)
		.groupBy(quizSessions.id, quizzes.title, quizSessions.createdAt)
		.orderBy(orderByClause)
		.limit(perPage)
		.offset((page - 1) * perPage)

	const transformedReports: TransformedReport[] = sessionReportsData.map((report) => ({
		id: report.id,
		sessionName: report.sessionName || "Untitled Session",
		createdDate: report.createdDate,
		participantCount: report.participantCount,
		status: report.status
	}))

	return {
		sessionReports: transformedReports,
		pagination: {
			currentPage: page,
			perPage,
			totalReports,
			totalPages
		},
		search,
		sortBy,
		sortOrder
	}
}

export const actions: Actions = {
	deleteReport: async ({ request, locals }) => {
		const session = await locals.auth()
		if (!session?.user) {
			throw redirect(302, "/signin")
		}

		const formData = await request.formData()
		const sessionId = parseInt(formData.get("sessionId") as string)

		if (isNaN(sessionId)) {
			return fail(400, { error: "Invalid session ID" })
		}

		const quizSession = await db.query.quizSessions.findFirst({
			where: eq(quizSessions.id, sessionId),
			columns: { status: true, hostId: true }
		})

		if (!quizSession) {
			return fail(404, { error: "Session not found" })
		}

		if (quizSession.hostId !== session.user.id) {
			return fail(403, { error: "Unauthorized" })
		}

		if (quizSession.status !== "deleting") {
			return fail(400, { error: "Can only delete reports for sessions marked for deletion" })
		}

		return fail(400, { error: "Real deletion is disabled. Sessions will remain in deleting status." })
	}
}
