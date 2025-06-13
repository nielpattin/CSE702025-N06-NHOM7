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

	// CTE to get the latest game attempt for each participant
	const latestGameAttempts = db
		.select({
			id: gameAttempts.id,
			participantId: gameAttempts.participantId,
			sessionId: sql<number>`${sessionParticipants.quizSessionId}`.as("sessionId"),
			rowNumber: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${gameAttempts.participantId} ORDER BY ${gameAttempts.id} DESC)`.mapWith(Number).as("rn")
		})
		.from(gameAttempts)
		.innerJoin(sessionParticipants, eq(gameAttempts.participantId, sessionParticipants.id))
		.as("latest_game_attempts")

	// Fetch all sessions where the current user is the host
	// Include related quiz data, participant count, and accuracy based on latest attempts only
	const sessionReports = await db
		.with(latestGameAttempts)
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
		.leftJoin(latestGameAttempts, sql`${sessionParticipants.id} = ${latestGameAttempts.participantId} AND ${latestGameAttempts.rowNumber} = 1`)
		.leftJoin(gameAttempts, eq(latestGameAttempts.id, gameAttempts.id))
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
