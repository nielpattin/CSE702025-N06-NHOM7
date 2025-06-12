import { db } from "$lib/server/db"
import { quizSessions, quizzes, sessionParticipants, gameAttempts, questionAttempts } from "$lib/server/db/schema"
import { redirect } from "@sveltejs/kit"
import { eq, count, avg, sql } from "drizzle-orm"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth()

	// Redirect if not authenticated
	if (!session?.user) {
		redirect(302, "/signin")
	}

	// Fetch all sessions where the current user is the host
	// Include related quiz data, participant count, and accuracy
	const sessionReports = await db
		.select({
			id: quizSessions.id,
			sessionName: quizzes.title,
			createdDate: quizSessions.createdAt,
			participantCount: sql<number>`COUNT(DISTINCT ${sessionParticipants.id})`,
			accuracy: sql<number>`
				CASE
					WHEN COUNT(${questionAttempts.id}) = 0 THEN 0
					ELSE ROUND((SUM(CASE WHEN ${questionAttempts.correct} = true THEN 1 ELSE 0 END) * 100.0) / COUNT(${questionAttempts.id}))
				END
			`
		})
		.from(quizSessions)
		.leftJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
		.leftJoin(sessionParticipants, eq(quizSessions.id, sessionParticipants.quizSessionId))
		.leftJoin(gameAttempts, eq(sessionParticipants.id, gameAttempts.participantId))
		.leftJoin(questionAttempts, eq(gameAttempts.id, questionAttempts.gameAttemptId))
		.where(eq(quizSessions.hostId, session.user.id))
		.groupBy(quizSessions.id, quizzes.title, quizSessions.createdAt)
		.orderBy(sql`${quizSessions.createdAt} DESC`)

	// Transform the data
	const transformedReports = sessionReports.map((report) => {
		const accuracy = Math.round(report.accuracy)

		return {
			...report,
			sessionName: report.sessionName || "Untitled Session",
			accuracy
		}
	})

	return {
		sessionReports: transformedReports
	}
}
