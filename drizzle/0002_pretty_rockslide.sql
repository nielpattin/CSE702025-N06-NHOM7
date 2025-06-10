CREATE TABLE "game_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_session_id" integer NOT NULL,
	"player_id" varchar,
	"attempt_number" integer,
	"score" integer,
	"status" varchar,
	"started_at" timestamp,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "question_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_attempt_id" integer NOT NULL,
	"session_question_id" integer NOT NULL,
	"selected_session_option_id" integer,
	"correct" boolean,
	"time_taken_ms" integer,
	"points_awarded" integer
);
--> statement-breakpoint
CREATE TABLE "question_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"order" integer,
	"content" varchar(2500),
	"correct" boolean
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer NOT NULL,
	"type" varchar,
	"content" varchar(5000),
	"time_limit" integer,
	"points" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer NOT NULL,
	"host_id" text NOT NULL,
	"shareable_code" varchar(7),
	"settings_overrides" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"end_time" timestamp,
	CONSTRAINT "quiz_sessions_shareable_code_unique" UNIQUE("shareable_code")
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(256),
	"description" text,
	"creator_id" text,
	"status" varchar,
	"visibility" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_session_id" integer NOT NULL,
	"player_id" varchar,
	"user_id" text,
	"nickname" varchar,
	"total_attempts" integer,
	"best_score" integer,
	"data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "session_participants_player_id_unique" UNIQUE("player_id")
);
--> statement-breakpoint
CREATE TABLE "session_question_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_question_id" integer NOT NULL,
	"original_option_id" integer NOT NULL,
	"order" integer,
	"content" varchar,
	"correct" boolean
);
--> statement-breakpoint
CREATE TABLE "session_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_session_id" integer NOT NULL,
	"original_question_id" integer NOT NULL,
	"type" varchar,
	"content" text,
	"time_limit" integer,
	"points" integer
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "game_attempts" ADD CONSTRAINT "game_attempts_quiz_session_id_quiz_sessions_id_fk" FOREIGN KEY ("quiz_session_id") REFERENCES "public"."quiz_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_attempts" ADD CONSTRAINT "game_attempts_player_id_session_participants_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."session_participants"("player_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_attempts" ADD CONSTRAINT "question_attempts_game_attempt_id_game_attempts_id_fk" FOREIGN KEY ("game_attempt_id") REFERENCES "public"."game_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_attempts" ADD CONSTRAINT "question_attempts_session_question_id_session_questions_id_fk" FOREIGN KEY ("session_question_id") REFERENCES "public"."session_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_attempts" ADD CONSTRAINT "question_attempts_selected_session_option_id_session_question_options_id_fk" FOREIGN KEY ("selected_session_option_id") REFERENCES "public"."session_question_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_host_id_user_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_quiz_session_id_quiz_sessions_id_fk" FOREIGN KEY ("quiz_session_id") REFERENCES "public"."quiz_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_question_options" ADD CONSTRAINT "session_question_options_session_question_id_session_questions_id_fk" FOREIGN KEY ("session_question_id") REFERENCES "public"."session_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_question_options" ADD CONSTRAINT "session_question_options_original_option_id_question_options_id_fk" FOREIGN KEY ("original_option_id") REFERENCES "public"."question_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_questions" ADD CONSTRAINT "session_questions_quiz_session_id_quiz_sessions_id_fk" FOREIGN KEY ("quiz_session_id") REFERENCES "public"."quiz_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_questions" ADD CONSTRAINT "session_questions_original_question_id_questions_id_fk" FOREIGN KEY ("original_question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;