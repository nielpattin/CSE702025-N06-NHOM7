import { redirect } from "@sveltejs/kit"
import { eq } from "drizzle-orm"
import { db } from "$lib/server/db"
import { quizzes } from "$lib/server/db/schema"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth()

	// Redirect logged-in users to /join
	if (session?.user) {
		redirect(302, "/join")
	}

	// For logged-out users, fetch public quizzes for the homepage
	const publicQuizzes = await db
		.select({
			id: quizzes.id,
			title: quizzes.title,
			description: quizzes.description,
			createdAt: quizzes.createdAt
		})
		.from(quizzes)
		.where(eq(quizzes.visibility, "public"))
		.orderBy(quizzes.createdAt)
		.limit(10)

	return {
		publicQuizzes
	}
}
