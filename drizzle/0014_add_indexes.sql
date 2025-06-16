CREATE INDEX "idx_question_attempts_session_question_id" ON "question_attempts" USING btree ("session_question_id");--> statement-breakpoint
CREATE INDEX "idx_question_options_question_id" ON "question_options" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_questions_quiz_id" ON "questions" USING btree ("quiz_id");