import type { UserRole } from "$lib/server/db/schema"

// Extend Auth.js types to include role
declare module "@auth/sveltekit" {
	interface Session {
		user: {
			id: string
			name?: string | null
			email?: string | null
			image?: string | null
			role: UserRole
		}
	}

	interface User {
		role: UserRole
	}
}

// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			session: import("@auth/sveltekit").Session | null
		}
		interface PageData {
			session: import("@auth/sveltekit").Session | null
		}
		// Interface declarations can be added here as needed
	}
}

export {}
