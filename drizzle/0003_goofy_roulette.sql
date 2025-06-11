-- Step 1: Drop the unique constraint that has a dependency, and cascade to drop the dependent FK.
ALTER TABLE "session_participants" DROP CONSTRAINT "session_participants_player_id_unique" CASCADE;
--> statement-breakpoint

-- Step 2: Rename the column in game_attempts.
ALTER TABLE "game_attempts" RENAME COLUMN "player_id" TO "participant_id";
--> statement-breakpoint

-- Step 3: CRITICAL - Change the data type of the renamed column to match the target FK.
ALTER TABLE "game_attempts" ALTER COLUMN "participant_id" SET DATA TYPE integer USING "participant_id"::integer;
--> statement-breakpoint

-- Step 4: Now that dependencies are handled, rename the main table.
ALTER TABLE "session_participants" RENAME TO "participants";
--> statement-breakpoint

-- Step 5: Perform other renames and additions.
ALTER TABLE "quiz_sessions" RENAME COLUMN "shareable_code" TO "code";
--> statement-breakpoint
ALTER TABLE "quiz_sessions" RENAME COLUMN "end_time" TO "expires_at";
--> statement-breakpoint
ALTER TABLE "participants" RENAME COLUMN "nickname" TO "name";
--> statement-breakpoint
ALTER TABLE "quiz_sessions" ADD COLUMN "status" varchar DEFAULT 'active';
--> statement-breakpoint

-- Step 6: Drop the now-unused columns.
ALTER TABLE "quiz_sessions" DROP COLUMN IF EXISTS "settings_overrides";
--> statement-breakpoint
ALTER TABLE "participants" DROP COLUMN IF EXISTS "player_id";
--> statement-breakpoint
ALTER TABLE "participants" DROP COLUMN IF EXISTS "total_attempts";
--> statement-breakpoint
ALTER TABLE "participants" DROP COLUMN IF EXISTS "best_score";
--> statement-breakpoint

-- Step 7: Re-create the foreign key with the correct columns, types, and a clean name.
ALTER TABLE "game_attempts" ADD CONSTRAINT "game_attempts_participant_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;