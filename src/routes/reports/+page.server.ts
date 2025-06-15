import { db } from "$lib/server/db"
import { quizzes, quizSessions, sessionParticipants, gameAttempts, questionAttempts } from "$lib/server/db/schema"
import { redirect } from "@sveltejs/kit"
import { eq, desc, ilike, sql, count, and, inArray } from "drizzle-orm"
import type { PageServerLoad } from "./$types"

export interface TransformedReport {
	id: number
	sessionName: string
	createdDate: Date | string | null
	participantCount: number
	accuracy: number
}

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth()

	if (!session?.user) {
		redirect(302, "/signin")
	}

	const url = new URL(event.request.url)
	const page = parseInt(url.searchParams.get("page") || "1")
	const search = url.searchParams.get("search") || ""
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
				search
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
			search
		}
	}

	// Optimized query using SQL aggregations to calculate accuracy at database level
	const sessionReportsData = await db
		.select({
			id: quizSessions.id,
			sessionName: quizzes.title,
			createdDate: quizSessions.createdAt,
			participantCount: sql<number>`COALESCE(COUNT(DISTINCT ${sessionParticipants.id}), 0)`.mapWith(Number),
			accuracy: sql<number>`
				CASE
					WHEN COUNT(${questionAttempts.id}) = 0 THEN 0
					ELSE ROUND(
						(COUNT(CASE WHEN ${questionAttempts.correct} = true THEN 1 END)::numeric /
						 COUNT(${questionAttempts.id})::numeric) * 100
					)
				END
			`.mapWith(Number)
		})
		.from(quizSessions)
		.leftJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
		.leftJoin(sessionParticipants, eq(sessionParticipants.quizSessionId, quizSessions.id))
		.leftJoin(
			gameAttempts,
			and(
				eq(gameAttempts.participantId, sessionParticipants.id),
				// Only get the latest attempt per participant
				sql`${gameAttempts.startedAt} = (
				SELECT MAX(ga2.started_at)
				FROM game_attempts ga2
				WHERE ga2.participant_id = ${sessionParticipants.id}
			)`
			)
		)
		.leftJoin(questionAttempts, eq(questionAttempts.gameAttemptId, gameAttempts.id))
		.where(searchCondition)
		.groupBy(quizSessions.id, quizzes.title, quizSessions.createdAt)
		.orderBy(desc(quizSessions.createdAt))
		.limit(perPage)
		.offset((page - 1) * perPage)

	const transformedReports: TransformedReport[] = sessionReportsData.map((report) => ({
		id: report.id,
		sessionName: report.sessionName || "Untitled Session",
		createdDate: report.createdDate,
		participantCount: report.participantCount,
		accuracy: report.accuracy
	}))

	return {
		sessionReports: transformedReports,
		pagination: {
			currentPage: page,
			perPage,
			totalReports,
			totalPages
		},
		search
	}
}
