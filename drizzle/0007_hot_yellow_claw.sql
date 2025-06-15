CREATE TYPE "public"."difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
ALTER TABLE "quiz_sessions" ADD COLUMN "rating" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_sessions" ADD COLUMN "participants" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "difficulty" "difficulty" DEFAULT 'medium' NOT NULL;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "duration" integer;