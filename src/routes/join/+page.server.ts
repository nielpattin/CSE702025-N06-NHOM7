import { fail, redirect } from "@sveltejs/kit"
import { db } from "$lib/server/db"
import { quizSessions, quizzes, sessionParticipants } from "$lib/server/db/schema"
import { eq, desc, count } from "drizzle-orm"

export const load = async () => {
	const recentSessions = await db
		.select({
			id: quizSessions.id,
			code: quizSessions.code,
			status: quizSessions.status,
			createdAt: quizSessions.createdAt,
			quizTitle: quizzes.title,
			participantCount: count(sessionParticipants.id)
		})
		.from(quizSessions)
		.leftJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
		.leftJoin(sessionParticipants, eq(quizSessions.id, sessionParticipants.quizSessionId))
		.groupBy(quizSessions.id, quizzes.title)
		.orderBy(desc(quizSessions.createdAt))
		.limit(5)

	return {
		recentSessions
	}
}

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData()
		const code = (formData.get("code") as string)?.trim().toUpperCase()

		if (!code || code.length < 4) {
			return fail(400, { error: "Please enter a valid code." })
		}

		const session = await db.query.quizSessions.findFirst({
			where: eq(quizSessions.code, code)
		})

		if (!session) {
			return fail(404, { error: "Session not found. Please check your code." })
		}

		throw redirect(302, `/play/session/${session.id}`)
	}
}
