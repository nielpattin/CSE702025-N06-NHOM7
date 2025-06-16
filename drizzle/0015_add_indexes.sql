ALTER TABLE "quiz_sessions" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
CREATE INDEX "idx_quiz_sessions_deleted_at" ON "quiz_sessions" USING btree ("deleted_at");