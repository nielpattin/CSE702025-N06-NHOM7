import { timestamp, pgTable, text, primaryKey, integer, boolean, jsonb, varchar, serial, pgEnum, real, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import type { AdapterAccountType } from "@auth/sveltekit/adapters"

export const visibilityEnum = pgEnum("visibility", ["public", "private"])
export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"])

export type UserRole = "Admin" | "User"
export type QuizStatus = "draft" | "published" | "archived"
export type QuizVisibility = "public" | "private" | "unlisted"
export type QuestionType = "multiple_choice" | "true_false"
export type AttemptStatus = "in_progress" | "completed" | "abandoned"
export type SessionStatus = "active" | "inactive" | "expired" | "deleting"
export type QuizDifficulty = "easy" | "medium" | "hard"

// Auth.js tables
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
export const quizzes = pgTable(
	"quizzes",
	{
		id: serial("id").primaryKey(),
		title: varchar("title", { length: 256 }),
		description: text("description"),
		creatorId: text("creator_id").references(() => users.id),
		status: varchar("status").$type<QuizStatus>(),
		visibility: visibilityEnum("visibility").default("private").notNull(),
		difficulty: difficultyEnum("difficulty").default("medium").notNull(),
		duration: integer("duration").default(0),
		rating: real("rating").default(0.0).notNull(),
		participants: integer("participants").default(0).notNull(),
		imageUrl: text("image_url"),
		createdAt: timestamp("created_at").defaultNow(),
		updatedAt: timestamp("updated_at").defaultNow()
	},
	(table) => [index("idx_quizzes_title").on(table.title)]
)

export const questions = pgTable(
	"questions",
	{
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
	},
	(table) => [index("idx_questions_quiz_id").on(table.quizId)]
)

export const questionOptions = pgTable(
	"question_options",
	{
		id: serial("id").primaryKey(),
		questionId: integer("question_id")
			.notNull()
			.references(() => questions.id, { onDelete: "cascade" }),
		order: integer("order"),
		content: varchar("content", { length: 2500 }),
		correct: boolean("correct")
	},
	(table) => [index("idx_question_options_question_id").on(table.questionId)]
)

export const quizSessions = pgTable(
	"quiz_sessions",
	{
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
	},
	(table) => [index("idx_quiz_sessions_host_id").on(table.hostId), index("idx_quiz_sessions_created_at").on(table.createdAt), index("idx_quiz_sessions_host_created").on(table.hostId, table.createdAt)]
)

export const sessionParticipants = pgTable(
	"participants",
	{
		id: serial("id").primaryKey(),
		quizSessionId: integer("quiz_session_id")
			.notNull()
			.references(() => quizSessions.id, { onDelete: "cascade" }),
		userId: text("user_id").references(() => users.id),
		guestId: text("guest_id"),
		name: varchar("name", { length: 100 }),
		data: jsonb("data"),
		createdAt: timestamp("created_at").defaultNow(),
		updatedAt: timestamp("updated_at").defaultNow()
	},
	(table) => [index("idx_participants_session_id").on(table.quizSessionId)]
)

export const gameAttempts = pgTable(
	"game_attempts",
	{
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
	},
	(table) => [index("idx_game_attempts_participant_id").on(table.participantId), index("idx_game_attempts_session_id").on(table.quizSessionId)]
)

export const sessionQuestions = pgTable(
	"session_questions",
	{
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
	},
	(table) => [index("idx_session_questions_session_id").on(table.quizSessionId)]
)

export const sessionQuestionOptions = pgTable(
	"session_question_options",
	{
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
	},
	(table) => [index("idx_session_question_options_session_question_id").on(table.sessionQuestionId)]
)

export const questionAttempts = pgTable(
	"question_attempts",
	{
		id: serial("id").primaryKey(),
		gameAttemptId: integer("game_attempt_id")
			.notNull()
			.references(() => gameAttempts.id, { onDelete: "cascade" }),
		sessionQuestionId: integer("session_question_id")
			.notNull()
			.references(() => sessionQuestions.id),
		selectedSessionOptionId: integer("selected_session_option_id").references(() => sessionQuestionOptions.id),
		correct: boolean("correct"),
		timeTakenMs: integer("time_taken_ms"),
		pointsAwarded: integer("points_awarded")
	},
	(table) => [index("idx_question_attempts_game_attempt_id").on(table.gameAttemptId), index("idx_question_attempts_session_question_id").on(table.sessionQuestionId)]
)

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
	sessions: many(sessions),
	quizzes: many(quizzes),
	quizSessions: many(quizSessions),
	sessionParticipants: many(sessionParticipants)
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, { fields: [accounts.userId], references: [users.id] })
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] })
}))

export const quizzesRelations = relations(quizzes, ({ many, one }) => ({
	questions: many(questions),
	creator: one(users, { fields: [quizzes.creatorId], references: [users.id] }),
	quizSessions: many(quizSessions)
}))

export const questionsRelations = relations(questions, ({ one, many }) => ({
	quiz: one(quizzes, { fields: [questions.quizId], references: [quizzes.id] }),
	options: many(questionOptions)
}))

export const questionOptionsRelations = relations(questionOptions, ({ one }) => ({
	question: one(questions, { fields: [questionOptions.questionId], references: [questions.id] })
}))

export const quizSessionsRelations = relations(quizSessions, ({ one, many }) => ({
	quiz: one(quizzes, { fields: [quizSessions.quizId], references: [quizzes.id] }),
	host: one(users, { fields: [quizSessions.hostId], references: [users.id] }),
	participants: many(sessionParticipants),
	sessionQuestions: many(sessionQuestions)
}))

export const sessionParticipantsRelations = relations(sessionParticipants, ({ one, many }) => ({
	quizSession: one(quizSessions, { fields: [sessionParticipants.quizSessionId], references: [quizSessions.id] }),
	user: one(users, { fields: [sessionParticipants.userId], references: [users.id] }),
	gameAttempts: many(gameAttempts)
}))

export const gameAttemptsRelations = relations(gameAttempts, ({ one, many }) => ({
	quizSession: one(quizSessions, { fields: [gameAttempts.quizSessionId], references: [quizSessions.id] }),
	participant: one(sessionParticipants, { fields: [gameAttempts.participantId], references: [sessionParticipants.id] }),
	questionAttempts: many(questionAttempts)
}))

export const sessionQuestionsRelations = relations(sessionQuestions, ({ one, many }) => ({
	quizSession: one(quizSessions, { fields: [sessionQuestions.quizSessionId], references: [quizSessions.id] }),
	originalQuestion: one(questions, { fields: [sessionQuestions.originalQuestionId], references: [questions.id] }),
	options: many(sessionQuestionOptions),
	questionAttempts: many(questionAttempts)
}))

export const sessionQuestionOptionsRelations = relations(sessionQuestionOptions, ({ one }) => ({
	sessionQuestion: one(sessionQuestions, { fields: [sessionQuestionOptions.sessionQuestionId], references: [sessionQuestions.id] }),
	originalOption: one(questionOptions, { fields: [sessionQuestionOptions.originalOptionId], references: [questionOptions.id] })
}))

export const questionAttemptsRelations = relations(questionAttempts, ({ one }) => ({
	gameAttempt: one(gameAttempts, { fields: [questionAttempts.gameAttemptId], references: [gameAttempts.id] }),
	sessionQuestion: one(sessionQuestions, { fields: [questionAttempts.sessionQuestionId], references: [sessionQuestions.id] }),
	selectedSessionOption: one(sessionQuestionOptions, { fields: [questionAttempts.selectedSessionOptionId], references: [sessionQuestionOptions.id] })
}))
