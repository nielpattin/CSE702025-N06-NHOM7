import type { InferSelectModel } from "drizzle-orm"
import type { sessions, users } from "$lib/server/db/schema"

export type SessionReport = InferSelectModel<typeof sessions> & {
	participantCount: number
}

export type UserProfile = InferSelectModel<typeof users>

export interface Tag {
	id: number
	name: string
	description: string | null
	color: string | null
	icon: string | null
}
