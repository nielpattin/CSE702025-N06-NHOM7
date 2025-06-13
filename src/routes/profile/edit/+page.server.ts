import { redirect, fail } from "@sveltejs/kit"
import type { Actions, PageServerLoad } from "./$types"
import { db } from "$lib/server/db"
import { users } from "$lib/server/db/schema"
import { eq } from "drizzle-orm"

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth()

	if (!session) {
		redirect(302, "/signin")
	}

	return {
		session
	}
}

export const actions = {
	default: async ({ request, locals }) => {
		const session = await locals.auth()

		if (!session) {
			redirect(302, "/signin")
		}

		const data = await request.formData()
		const name = data.get("name")

		if (!name || typeof name !== "string" || name.trim() === "") {
			return fail(400, {
				error: "Name is required"
			})
		}

		try {
			await db
				.update(users)
				.set({
					name: name.trim(),
					updatedAt: new Date()
				})
				.where(eq(users.id, session.user.id))

			return { success: true, message: "Profile updated successfully!" }
		} catch (error) {
			return fail(500, {
				error: "Failed to update profile"
			})
		}
	}
} satisfies Actions
