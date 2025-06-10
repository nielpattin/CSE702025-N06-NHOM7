import { db } from "$lib/server/db"
import { quizzes } from "$lib/server/db/schema"
import { redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth()
	if (!session?.user) {
		redirect(302, "/signin")
	}

	const [newQuiz] = await db
		.insert(quizzes)
		.values({
			title: "Untitled Quiz",
			status: "draft",
			creatorId: session.user.id
		})
		.returning({ id: quizzes.id })

	if (newQuiz) {
		redirect(302, `/quiz/edit/${newQuiz.id}`)
	}

	// Fallback redirect in case something goes wrong
	redirect(302, "/dashboard")
}
