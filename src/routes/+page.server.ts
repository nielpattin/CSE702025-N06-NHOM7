import { redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth()

	// Redirect logged-in users to /join
	if (session?.user) {
		redirect(302, "/join")
	}

	// For logged-out users, continue to show the homepage
	return {}
}
