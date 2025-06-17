import { db } from "$lib/server/db"
import { quizzes, quizSessions, sessionParticipants, users } from "$lib/server/db/schema"
import { redirect } from "@sveltejs/kit"
import { eq, and, ilike, desc, asc, count, sql, getTableColumns } from "drizzle-orm"
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
	const perPage = 6

	let whereCondition = and(eq(quizzes.status, "published"), eq(quizzes.visibility, "public"))

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
			case "createdAt":
				orderByClause = orderByDirection(quizzes.createdAt)
				break
			case "participants":
				orderByClause = orderByDirection(sql`count(distinct ${sessionParticipants.id})`)
				break
			default:
				orderByClause = desc(quizzes.createdAt)
		}

		const [results, totalCountResult] = await Promise.all([
			db
				.select({
					...getTableColumns(quizzes),
					creatorName: users.name,
					creatorImage: users.image,
					participantCount: sql<number>`count(distinct ${sessionParticipants.id})`.as("participant_count")
				})
				.from(quizzes)
				.leftJoin(users, eq(quizzes.creatorId, users.id))
				.leftJoin(quizSessions, eq(quizzes.id, quizSessions.quizId))
				.leftJoin(sessionParticipants, eq(quizSessions.id, sessionParticipants.quizSessionId))
				.where(whereCondition)
				.groupBy(quizzes.id, users.id)
				.orderBy(orderByClause)
				.limit(perPage)
				.offset((page - 1) * perPage),
			db.select({ count: count() }).from(quizzes).where(whereCondition)
		])

		const totalQuizzes = totalCountResult[0]?.count ?? 0
		const totalPages = Math.ceil(totalQuizzes / perPage)

		const formattedQuizzes = results.map((quiz) => ({
			id: quiz.id,
			title: quiz.title || "Untitled Quiz",
			author: quiz.creatorName || "Unknown Author",
			participants: Number(quiz.participantCount),
			difficulty: quiz.difficulty === "easy" ? "Beginner" : quiz.difficulty === "medium" ? "Intermediate" : "Advanced",
			rating: Number(quiz.rating?.toFixed(1)) || 0.0,
			duration: quiz.duration === 0 ? "Unlimited" : quiz.duration ? `${quiz.duration} min` : "N/A",
			imageUrl: quiz.imageUrl,
			createdAt: quiz.createdAt
		}))

		return {
			quizzes: formattedQuizzes,
			pagination: {
				currentPage: page,
				perPage,
				totalQuizzes,
				totalPages
			},
			search,
			sortBy,
			sortOrder,
			difficultyFilter
		}
	} catch (error) {
		console.error("Error fetching quizzes:", error)
		return {
			quizzes: [],
			pagination: {
				currentPage: 1,
				perPage,
				totalQuizzes: 0,
				totalPages: 0
			},
			search: "",
			sortBy: "participants",
			sortOrder: "desc",
			difficultyFilter: ""
		}
	}
}
