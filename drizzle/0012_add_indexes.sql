CREATE INDEX "idx_game_attempts_participant_id" ON "game_attempts" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "idx_game_attempts_session_id" ON "game_attempts" USING btree ("quiz_session_id");--> statement-breakpoint
CREATE INDEX "idx_question_attempts_game_attempt_id" ON "question_attempts" USING btree ("game_attempt_id");--> statement-breakpoint
CREATE INDEX "idx_quiz_sessions_host_id" ON "quiz_sessions" USING btree ("host_id");--> statement-breakpoint
CREATE INDEX "idx_quiz_sessions_created_at" ON "quiz_sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_quiz_sessions_host_created" ON "quiz_sessions" USING btree ("host_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_quizzes_title" ON "quizzes" USING btree ("title");--> statement-breakpoint
CREATE INDEX "idx_participants_session_id" ON "participants" USING btree ("quiz_session_id");