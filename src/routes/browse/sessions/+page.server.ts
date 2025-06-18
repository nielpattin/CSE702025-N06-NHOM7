import { db } from "$lib/server/db"
import { quizSessions, quizzes, sessionParticipants, users } from "$lib/server/db/schema"
import { redirect } from "@sveltejs/kit"
import { eq, and, ilike, desc, asc, count, sql, or, getTableColumns } from "drizzle-orm"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth()

	if (!session?.user) {
		redirect(302, "/signin")
	}

	const url = new URL(event.request.url)
	const page = parseInt(url.searchParams.get("page") || "1")
	const search = url.searchParams.get("search") || ""
	const sortBy = url.searchParams.get("sortBy") || "participants"
	const sortOrder = url.searchParams.get("sortOrder") || "desc"
	const difficultyFilter = url.searchParams.get("difficulty") || ""
	const perPage = 9

	// Only show active sessions from published quizzes
	let whereCondition = and(eq(quizSessions.status, "active"), eq(quizzes.status, "published"), eq(quizzes.visibility, "public"))

	if (search) {
		whereCondition = and(whereCondition, ilike(quizzes.title, `%${search}%`))
	}

	if (difficultyFilter) {
		whereCondition = and(whereCondition, eq(quizzes.difficulty, difficultyFilter as "easy" | "medium" | "hard"))
	}

	try {
		const orderByDirection = sortOrder === "asc" ? asc : desc
		let orderByClause

		switch (sortBy) {
			case "title":
				orderByClause = orderByDirection(quizzes.title)
				break
			case "rating":
				orderByClause = orderByDirection(quizzes.rating)
				break
			case "participants":
				orderByClause = orderByDirection(sql`count(distinct ${sessionParticipants.id})`)
				break
			case "createdAt":
				orderByClause = orderByDirection(quizSessions.createdAt)
				break
			default:
				orderByClause = desc(sql`count(distinct ${sessionParticipants.id})`)
		}

		const [results, totalCountResult] = await Promise.all([
			db
				.select({
					sessionId: quizSessions.id,
					sessionCode: quizSessions.code,
					sessionStatus: quizSessions.status,
					sessionCreatedAt: quizSessions.createdAt,
					sessionExpiresAt: quizSessions.expiresAt,
					quizId: quizzes.id,
					quizTitle: quizzes.title,
					quizDescription: quizzes.description,
					quizDifficulty: quizzes.difficulty,
					quizDuration: quizzes.duration,
					quizRating: quizzes.rating,
					quizImageUrl: quizzes.imageUrl,
					hostName: users.name,
					hostImage: users.image,
					participantCount: sql<number>`count(distinct ${sessionParticipants.id})`.as("participant_count")
				})
				.from(quizSessions)
				.leftJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
				.leftJoin(users, eq(quizSessions.hostId, users.id))
				.leftJoin(sessionParticipants, eq(quizSessions.id, sessionParticipants.quizSessionId))
				.where(whereCondition)
				.groupBy(quizSessions.id, quizSessions.code, quizSessions.status, quizSessions.createdAt, quizSessions.expiresAt, quizzes.id, quizzes.title, quizzes.description, quizzes.difficulty, quizzes.duration, quizzes.imageUrl, users.name, users.image)
				.orderBy(orderByClause)
				.limit(perPage)
				.offset((page - 1) * perPage),
			db.select({ count: count() }).from(quizSessions).leftJoin(quizzes, eq(quizSessions.quizId, quizzes.id)).where(whereCondition)
		])

		const totalSessions = totalCountResult[0]?.count ?? 0
		const totalPages = Math.ceil(totalSessions / perPage)

		const formattedSessions = results.map((session) => ({
			id: session.sessionId,
			code: session.sessionCode,
			status: session.sessionStatus,
			createdAt: session.sessionCreatedAt,
			expiresAt: session.sessionExpiresAt,
			quiz: {
				id: session.quizId,
				title: session.quizTitle || "Untitled Quiz",
				description: session.quizDescription,
				difficulty: session.quizDifficulty === "easy" ? "Beginner" : session.quizDifficulty === "medium" ? "Intermediate" : "Advanced",
				duration: session.quizDuration === 0 ? "Unlimited" : session.quizDuration ? `${session.quizDuration} min` : "N/A",
				rating: Number(session.quizRating?.toFixed(1)) || 0.0,
				imageUrl: session.quizImageUrl
			},
			host: {
				name: session.hostName || "Unknown Host",
				image: session.hostImage
			},
			participantCount: Number(session.participantCount) || 0
		}))

		return {
			sessions: formattedSessions,
			pagination: {
				currentPage: page,
				perPage,
				totalSessions,
				totalPages
			},
			search,
			sortBy,
			sortOrder,
			difficultyFilter
		}
	} catch (error) {
		console.error("Error fetching active sessions:", error)
		return {
			sessions: [],
			pagination: {
				currentPage: 1,
				perPage,
				totalSessions: 0,
				totalPages: 0
			},
			search: "",
			sortBy: "participants",
			sortOrder: "desc",
			difficultyFilter: ""
		}
	}
}
