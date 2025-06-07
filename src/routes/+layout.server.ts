import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.auth()
	return {
		session,
		userRole: session?.user?.role ?? null
	}
}
