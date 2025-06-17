import type { InferSelectModel } from "drizzle-orm"
import type { sessions, users } from "$lib/server/db/schema"

export type SessionReport = InferSelectModel<typeof sessions> & {
	participantCount: number
}

export type UserProfile = InferSelectModel<typeof users>
