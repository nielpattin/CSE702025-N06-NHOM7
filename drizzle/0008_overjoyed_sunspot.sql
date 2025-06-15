ALTER TABLE "quizzes" ADD COLUMN "rating" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "participants" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_sessions" DROP COLUMN "rating";--> statement-breakpoint
ALTER TABLE "quiz_sessions" DROP COLUMN "participants";