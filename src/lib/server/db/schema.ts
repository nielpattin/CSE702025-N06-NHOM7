import { timestamp, pgTable, text, primaryKey, integer, boolean, jsonb, varchar, serial } from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "@auth/sveltekit/adapters"

export type UserRole = "Admin" | "User"
export type QuizStatus = "draft" | "published" | "archived"
export type QuizVisibility = "public" | "private" | "unlisted"
export type QuestionType = "multiple_choice" | "true_false"
export type AttemptStatus = "in_progress" | "completed" | "abandoned"
export type SessionStatus = "active" | "inactive" | "expired"

// Auth.js tables (with minimal additions)
export const users = pgTable("user", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	email: text("email").unique(),
	name: text("name"),
	image: text("image"),
	emailVerified: timestamp("emailVerified", { mode: "date" }),
	role: text("role").$type<UserRole>().notNull().default("User"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow()
})

export const accounts = pgTable(
	"account",
	{
		userId: text("userId")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		type: text("type").$type<AdapterAccountType>().notNull(),
		provider: text("provider").notNull(),
		providerAccountId: text("providerAccountId").notNull(),
		refresh_token: text("refresh_token"),
		access_token: text("access_token"),
		expires_at: integer("expires_at"),
		token_type: text("token_type"),
		scope: text("scope"),
		id_token: text("id_token"),
		session_state: text("session_state")
	},
	(account) => [
		primaryKey({
			columns: [account.provider, account.providerAccountId]
		})
	]
)

export const sessions = pgTable("session", {
	sessionToken: text("sessionToken").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	expires: timestamp("expires", { mode: "date" }).notNull()
})

// Application tables
export const quizzes = pgTable("quizzes", {
	id: serial("id").primaryKey(),
	title: varchar("title", { length: 256 }),
	description: text("description"),
	creatorId: text("creator_id").references(() => users.id),
	status: varchar("status").$type<QuizStatus>(),
	visibility: varchar("visibility").$type<QuizVisibility>().default("private").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow()
})

export const questions = pgTable("questions", {
	id: serial("id").primaryKey(),
	quizId: integer("quiz_id")
		.notNull()
		.references(() => quizzes.id, { onDelete: "cascade" }),
	type: varchar("type").$type<QuestionType>(),
	content: varchar("content", { length: 5000 }),
	timeLimit: integer("time_limit"),
	points: integer("points"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow()
})

export const questionOptions = pgTable("question_options", {
	id: serial("id").primaryKey(),
	questionId: integer("question_id")
		.notNull()
		.references(() => questions.id, { onDelete: "cascade" }),
	order: integer("order"),
	content: varchar("content", { length: 2500 }),
	correct: boolean("correct")
})

export const quizSessions = pgTable("quiz_sessions", {
	id: serial("id").primaryKey(),
	quizId: integer("quiz_id")
		.notNull()
		.references(() => quizzes.id, { onDelete: "cascade" }),
	hostId: text("host_id")
		.notNull()
		.references(() => users.id),
	code: varchar("code", { length: 8 }).unique().notNull(),
	status: varchar("status").$type<SessionStatus>().notNull().default("inactive"),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow()
})

export const sessionParticipants = pgTable("participants", {
	id: serial("id").primaryKey(),
	quizSessionId: integer("quiz_session_id")
		.notNull()
		.references(() => quizSessions.id, { onDelete: "cascade" }),
	userId: text("user_id").references(() => users.id), // nullable for guest users
	name: varchar("name", { length: 100 }), // for guest users
	data: jsonb("data"), // Report data: correct, incorrect, attempts, total_time_ms, questions_per_sec, best_score
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow()
})

export const gameAttempts = pgTable("game_attempts", {
	id: serial("id").primaryKey(),
	quizSessionId: integer("quiz_session_id")
		.notNull()
		.references(() => quizSessions.id, { onDelete: "cascade" }),
	participantId: integer("participant_id").references(() => sessionParticipants.id, { onDelete: "cascade" }),
	attemptNumber: integer("attempt_number"),
	score: integer("score"),
	status: varchar("status").$type<AttemptStatus>(),
	startedAt: timestamp("started_at"),
	completedAt: timestamp("completed_at"),
	updatedAt: timestamp("updated_at").defaultNow()
})

export const sessionQuestions = pgTable("session_questions", {
	id: serial("id").primaryKey(),
	quizSessionId: integer("quiz_session_id")
		.notNull()
		.references(() => quizSessions.id, { onDelete: "cascade" }),
	originalQuestionId: integer("original_question_id")
		.notNull()
		.references(() => questions.id),
	type: varchar("type"),
	content: text("content"),
	timeLimit: integer("time_limit"),
	points: integer("points")
})

export const sessionQuestionOptions = pgTable("session_question_options", {
	id: serial("id").primaryKey(),
	sessionQuestionId: integer("session_question_id")
		.notNull()
		.references(() => sessionQuestions.id, { onDelete: "cascade" }),
	originalOptionId: integer("original_option_id")
		.notNull()
		.references(() => questionOptions.id),
	order: integer("order"),
	content: varchar("content"),
	correct: boolean("correct")
})

export const questionAttempts = pgTable("question_attempts", {
	id: serial("id").primaryKey(),
	gameAttemptId: integer("game_attempt_id")
		.notNull()
		.references(() => gameAttempts.id, { onDelete: "cascade" }),
	sessionQuestionId: integer("session_question_id")
		.notNull()
		.references(() => sessionQuestions.id),
	selectedSessionOptionId: integer("selected_session_option_id").references(() => sessionQuestionOptions.id), // NULL if no answer
	correct: boolean("correct"),
	timeTakenMs: integer("time_taken_ms"),
	pointsAwarded: integer("points_awarded")
})
