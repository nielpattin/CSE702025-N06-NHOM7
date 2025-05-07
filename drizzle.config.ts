import { defineConfig } from "drizzle-kit"

export default defineConfig({
	schema: "./src/lib/server/db/schema.ts",
	dbCredentials: {
		host: process.env.DB_HOST as string,
		database: process.env.DB_NAME as string,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
		ssl: false
	},
	verbose: true,
	strict: true,
	dialect: "postgresql"
})
