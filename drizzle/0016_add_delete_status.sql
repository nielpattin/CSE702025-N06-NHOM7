DROP INDEX "idx_quiz_sessions_deleted_at";--> statement-breakpoint
ALTER TABLE "quiz_sessions" DROP COLUMN "deleted_at";