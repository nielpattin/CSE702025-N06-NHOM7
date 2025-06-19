CREATE TABLE "quiz_tag_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	"assigned_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"color" varchar(7),
	"icon" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "quiz_tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "quiz_tag_assignments" ADD CONSTRAINT "quiz_tag_assignments_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_tag_assignments" ADD CONSTRAINT "quiz_tag_assignments_tag_id_quiz_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."quiz_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_quiz_tag_assignments_quiz_id" ON "quiz_tag_assignments" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX "idx_quiz_tag_assignments_tag_id" ON "quiz_tag_assignments" USING btree ("tag_id");
--> statement-breakpoint

INSERT INTO quiz_tags (name, description, color, icon) VALUES
('Science', 'Natural sciences, physics, chemistry, biology', '#10B981', 'Microscope'),
('Mathematics', 'Math, algebra, geometry, calculus', '#3B82F6', 'Calculator'),
('History', 'Historical events, dates, civilizations', '#8B5CF6', 'Scroll'),
('Geography', 'Countries, capitals, maps, landmarks', '#06B6D4', 'Map'),
('Literature', 'Books, authors, poetry, language arts', '#F59E0B', 'Book'),
('Technology', 'Programming, computers, digital literacy', '#6B7280', 'Monitor'),
('Sports', 'Athletics, games, sports trivia', '#EF4444', 'Trophy'),
('Entertainment', 'Movies, music, celebrities, pop culture', '#EC4899', 'Film'),
('Business', 'Economics, finance, entrepreneurship', '#059669', 'Briefcase'),
('Health', 'Medicine, wellness, anatomy, nutrition', '#DC2626', 'Heart'),
('Art', 'Visual arts, drawing, painting, design', '#7C3AED', 'Palette'),
('Language', 'Foreign languages, grammar, vocabulary', '#0891B2', 'Languages'),
('General Knowledge', 'Mixed topics, trivia, common knowledge', '#6B7280', 'Brain'),
('Education', 'Teaching, learning, academic subjects', '#16A34A', 'GraduationCap')
ON CONFLICT (name) DO NOTHING;