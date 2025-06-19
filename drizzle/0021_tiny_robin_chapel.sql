CREATE TABLE "question_attempt_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_attempt_id" integer NOT NULL,
	"selected_session_option_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session_questions" DROP CONSTRAINT "session_questions_original_question_id_questions_id_fk";
--> statement-breakpoint
ALTER TABLE "question_attempt_options" ADD CONSTRAINT "question_attempt_options_question_attempt_id_question_attempts_id_fk" FOREIGN KEY ("question_attempt_id") REFERENCES "public"."question_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_attempt_options" ADD CONSTRAINT "question_attempt_options_selected_session_option_id_session_question_options_id_fk" FOREIGN KEY ("selected_session_option_id") REFERENCES "public"."session_question_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_question_attempt_options_attempt_id" ON "question_attempt_options" USING btree ("question_attempt_id");--> statement-breakpoint
CREATE INDEX "idx_question_attempt_options_option_id" ON "question_attempt_options" USING btree ("selected_session_option_id");--> statement-breakpoint
CREATE INDEX "idx_question_attempt_options_unique" ON "question_attempt_options" USING btree ("question_attempt_id","selected_session_option_id");--> statement-breakpoint
ALTER TABLE "session_questions" ADD CONSTRAINT "session_questions_original_question_id_questions_id_fk" FOREIGN KEY ("original_question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;