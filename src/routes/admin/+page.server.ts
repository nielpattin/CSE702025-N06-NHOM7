import { db } from "$lib/server/db"
import { users, type UserRole } from "$lib/server/db/schema"
import { eq } from "drizzle-orm"
import { isAdmin } from "$lib/server/role-utils"
import { redirect } from "@sveltejs/kit"
import type { Actions, PageServerLoad } from "./$types"

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth()
	if (!session || !isAdmin(session)) {
		redirect(302, "/")
	}
	const allUsers = await db.select().from(users)
	return {
		users: allUsers
	}
}

export const actions: Actions = {
	updateUserRole: async ({ request, locals }) => {
		const session = await locals.auth()

		if (!session || !isAdmin(session)) {
			return { status: 403, body: "Forbidden" }
		}

		const data = await request.formData()
		const userId = data.get("userId")?.toString()
		const role = data.get("role")?.toString() as "Admin" | "User"

		// Validate role against valid UserRole values
		const validRoles: UserRole[] = ["Admin", "User"]
		if (!userId || !role || !validRoles.includes(role)) {
			return { status: 400, body: "Bad Request" }
		}

		await db.update(users).set({ role: role }).where(eq(users.id, userId))

		return { success: true }
	}
}
