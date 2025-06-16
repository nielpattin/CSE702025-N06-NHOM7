ALTER TABLE "quiz_sessions" ADD COLUMN "archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_quiz_sessions_archived" ON "quiz_sessions" USING btree ("archived");