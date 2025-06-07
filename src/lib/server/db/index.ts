import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"
import { env } from "$env/dynamic/private"

if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not set")

const pool = new Pool({
	connectionString: env.DATABASE_URL
})

// Create the drizzle instance with the pg pool and schema
export const db = drizzle(pool, { schema })
