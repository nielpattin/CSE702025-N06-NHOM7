CREATE TYPE "public"."visibility" AS ENUM('public', 'private');--> statement-breakpoint
ALTER TABLE "quizzes" ALTER COLUMN "visibility" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "quizzes" ALTER COLUMN "visibility" SET DATA TYPE visibility USING visibility::visibility;--> statement-breakpoint
ALTER TABLE "quizzes" ALTER COLUMN "visibility" SET DEFAULT 'private';