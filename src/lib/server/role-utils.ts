import type { UserRole } from "./db/schema"
import type { Session } from "@auth/sveltekit"

export const ROLE_LEVELS: Record<UserRole, number> = {
	Admin: 2,
	User: 1
}

export const hasRole = (userRole: UserRole, requiredRole: UserRole) => {
	const userLevel = ROLE_LEVELS[userRole]
	const requiredLevel = ROLE_LEVELS[requiredRole]
	return userLevel >= requiredLevel
}

export const isAdmin = (session: Session) => {
	return session?.user?.role === "Admin"
}

export const DEFAULT_ROLE: UserRole = "User"
