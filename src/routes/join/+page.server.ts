import { error, redirect } from "@sveltejs/kit"
import { db } from "$lib/server/db/index.js"
import { quizSessions } from "$lib/server/db/schema.js"
import { eq } from "drizzle-orm"
import type { PageServerLoad } from "./$types.js"

export const load: PageServerLoad = async ({ url, locals }) => {
	const code = url.searchParams.get("code")

	if (!code) {
		return {}
	}

	// Query the database to find a session with the provided code
	const sessionResult = await db
		.select({
			id: quizSessions.id
		})
		.from(quizSessions)
		.where(eq(quizSessions.code, code))
		.limit(1)

	if (sessionResult.length === 0) {
		throw error(404, "Session not found")
	}

	const session = sessionResult[0]

	// Redirect to the play session page
	redirect(302, `/play/session/${session.id}`)
}
