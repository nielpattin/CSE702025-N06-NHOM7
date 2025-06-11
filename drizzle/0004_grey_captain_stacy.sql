UPDATE "quizzes" SET "visibility" = 'private' WHERE "visibility" IS NULL;--> statement-breakpoint
ALTER TABLE "quiz_sessions" ALTER COLUMN "status" SET DEFAULT 'inactive';--> statement-breakpoint
ALTER TABLE "quizzes" ALTER COLUMN "visibility" SET DEFAULT 'private';--> statement-breakpoint
ALTER TABLE "quizzes" ALTER COLUMN "visibility" SET NOT NULL;