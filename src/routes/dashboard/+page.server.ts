import { db } from "$lib/server/db"
import { quizzes, quizSessions, sessionParticipants, users, questions } from "$lib/server/db/schema"
import { redirect } from "@sveltejs/kit"
import { eq, and, count, sql, desc, gte } from "drizzle-orm"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth()

	if (!session?.user) {
		redirect(302, "/signin")
	}

	try {
		// Get current date for filtering recent data
		const thirtyDaysAgo = new Date()
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

		const [userStatsResult, recentQuizzesResult, recentSessionsResult, publicQuizzesCountResult, activeSessionsCountResult] = await Promise.all([
			// User's own stats
			Promise.all([
				// Total quizzes created by user
				db.select({ count: count() }).from(quizzes).where(eq(quizzes.creatorId, session.user.id)),
				// Total sessions hosted by user
				db.select({ count: count() }).from(quizSessions).where(eq(quizSessions.hostId, session.user.id)),
				// Total participants in user's sessions
				db.select({ count: count() }).from(sessionParticipants).leftJoin(quizSessions, eq(sessionParticipants.quizSessionId, quizSessions.id)).where(eq(quizSessions.hostId, session.user.id))
			]),

			// Recent quizzes created by user (last 5)
			db
				.select({
					id: quizzes.id,
					title: quizzes.title,
					status: quizzes.status,
					createdAt: quizzes.createdAt,
					questionCount: sql<number>`count(${questions.id})`.as("question_count")
				})
				.from(quizzes)
				.leftJoin(questions, eq(quizzes.id, questions.quizId))
				.where(eq(quizzes.creatorId, session.user.id))
				.groupBy(quizzes.id, quizzes.title, quizzes.status, quizzes.createdAt)
				.orderBy(desc(quizzes.createdAt))
				.limit(5),

			// Recent sessions hosted by user (last 5)
			db
				.select({
					id: quizSessions.id,
					code: quizSessions.code,
					status: quizSessions.status,
					createdAt: quizSessions.createdAt,
					quizTitle: quizzes.title,
					participantCount: sql<number>`count(distinct ${sessionParticipants.id})`.as("participant_count")
				})
				.from(quizSessions)
				.leftJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
				.leftJoin(sessionParticipants, eq(quizSessions.id, sessionParticipants.quizSessionId))
				.where(eq(quizSessions.hostId, session.user.id))
				.groupBy(quizSessions.id, quizSessions.code, quizSessions.status, quizSessions.createdAt, quizzes.title)
				.orderBy(desc(quizSessions.createdAt))
				.limit(5),

			// Total public quizzes available
			db
				.select({ count: count() })
				.from(quizzes)
				.where(and(eq(quizzes.status, "published"), eq(quizzes.visibility, "public"))),

			// Total active sessions available
			db
				.select({ count: count() })
				.from(quizSessions)
				.leftJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
				.where(and(eq(quizSessions.status, "active"), eq(quizzes.status, "published"), eq(quizzes.visibility, "public")))
		])

		const [totalQuizzes, totalSessions, totalParticipants] = userStatsResult

		const userStats = {
			totalQuizzes: totalQuizzes[0]?.count || 0,
			totalSessions: totalSessions[0]?.count || 0,
			totalParticipants: totalParticipants[0]?.count || 0
		}

		const recentQuizzes = recentQuizzesResult.map((quiz) => ({
			...quiz,
			questionCount: Number(quiz.questionCount) || 0
		}))

		const recentSessions = recentSessionsResult.map((session) => ({
			...session,
			participantCount: Number(session.participantCount) || 0
		}))

		const globalStats = {
			publicQuizzes: publicQuizzesCountResult[0]?.count || 0,
			activeSessions: activeSessionsCountResult[0]?.count || 0
		}

		return {
			userStats,
			recentQuizzes,
			recentSessions,
			globalStats
		}
	} catch (error) {
		console.error("Error loading dashboard data:", error)
		return {
			userStats: {
				totalQuizzes: 0,
				totalSessions: 0,
				totalParticipants: 0
			},
			recentQuizzes: [],
			recentSessions: [],
			globalStats: {
				publicQuizzes: 0,
				activeSessions: 0
			}
		}
	}
}
