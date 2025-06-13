import { redirect } from "@sveltejs/kit"
import { signOut } from "../../auth"
import type { Actions, PageServerLoad } from "./$types"
import { db } from "$lib/server/db"
import { quizzes } from "$lib/server/db/schema"
import { eq, count } from "drizzle-orm"

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth()

	if (!session) {
		redirect(302, "/signin")
	}

	const quizCount = await db.select({ value: count() }).from(quizzes).where(eq(quizzes.creatorId, session.user.id))

	return {
		session,
		quizCount,
		collectionsCount: 0
	}
}

export const actions = {
	signout: signOut
} satisfies Actions
