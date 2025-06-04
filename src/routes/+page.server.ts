import { db } from "$lib/server/db"
import { user } from "$lib/server/db/schema"

export const load = async () => {
	try {
		// Test database connection by trying to query the user table
		const result = await db.select().from(user).limit(1)

		// Count users by selecting all and getting length
		const allUsers = await db.select().from(user)
		const userCount = allUsers.length

		return {
			dbStatus: {
				connected: true,
				message: "Database connection successful",
				testQuery: { success: true, query: "SELECT * FROM user LIMIT 1" },
				userTableExists: true,
				userCount,
				timestamp: new Date().toISOString(),
				sampleData: result.length > 0 ? result[0] : null
			}
		}
	} catch (error) {
		console.error("Database connection error:", error)

		// Try to determine if it's a connection issue or table doesn't exist
		let errorType = "connection"
		if (
			error instanceof Error &&
			error.message.includes("relation") &&
			error.message.includes("does not exist")
		) {
			errorType = "table_missing"
		}

		return {
			dbStatus: {
				connected: errorType === "table_missing",
				message:
					errorType === "table_missing"
						? "Database connected but user table does not exist"
						: "Database connection failed",
				error: error instanceof Error ? error.message : "Unknown error",
				userTableExists: errorType !== "table_missing",
				userCount: 0,
				timestamp: new Date().toISOString()
			}
		}
	}
}
