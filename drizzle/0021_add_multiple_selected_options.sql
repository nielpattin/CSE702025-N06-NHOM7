-- Add table to support multiple selected options per question attempt
CREATE TABLE IF NOT EXISTS "question_attempt_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_attempt_id" integer NOT NULL,
	"selected_session_option_id" integer NOT NULL,
	CONSTRAINT "question_attempt_options_question_attempt_id_question_attempts_id_fk" FOREIGN KEY ("question_attempt_id") REFERENCES "question_attempts"("id") ON DELETE cascade,
	CONSTRAINT "question_attempt_options_selected_session_option_id_session_question_options_id_fk" FOREIGN KEY ("selected_session_option_id") REFERENCES "session_question_options"("id") ON DELETE cascade
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_question_attempt_options_attempt_id" ON "question_attempt_options" USING btree ("question_attempt_id");
CREATE INDEX IF NOT EXISTS "idx_question_attempt_options_option_id" ON "question_attempt_options" USING btree ("selected_session_option_id");

-- Add unique constraint to prevent duplicate selections
CREATE UNIQUE INDEX IF NOT EXISTS "idx_question_attempt_options_unique" ON "question_attempt_options" USING btree ("question_attempt_id", "selected_session_option_id");