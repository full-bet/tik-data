CREATE TABLE "competitor_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competitor_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"order_index" integer DEFAULT 0,
	"title" text,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "storyboard_cuts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competitor_id" uuid,
	"test_id" uuid,
	"cut_order" integer NOT NULL,
	"description" text NOT NULL,
	"source_type" text,
	"material_id" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "test_seed_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"member_id" uuid,
	"comment_text" text NOT NULL,
	"is_candidate" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" uuid NOT NULL,
	"name" text NOT NULL,
	"what_how" text,
	"account_persona" text,
	"account_id" uuid,
	"win_condition" text,
	"premise" text,
	"rationale" text,
	"completion_condition" text,
	"material_ready_at" date,
	"script_review_requested_at" date,
	"edit_completed_at" date,
	"video_review_requested_at" date,
	"posted_at" date,
	"competitor_id" uuid,
	"script_id" uuid,
	"item_id" uuid,
	"editor_member_id" uuid,
	"edit_request_doc_url" text,
	"shooter_member_id" uuid,
	"shooting_request_doc_url" text,
	"existing_material_drive_url" text,
	"reviewer_member_id" uuid,
	"review_questions" text,
	"review_focus_points" text,
	"reviewer_feedback" text,
	"caption" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "competitors" ADD COLUMN "deal_id" uuid;--> statement-breakpoint
ALTER TABLE "competitors" ADD COLUMN "appeal_angle" text;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "characteristics" text;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "selection_rationale" text;--> statement-breakpoint
ALTER TABLE "competitor_insights" ADD CONSTRAINT "competitor_insights_competitor_id_competitors_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "public"."competitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storyboard_cuts" ADD CONSTRAINT "storyboard_cuts_competitor_id_competitors_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "public"."competitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storyboard_cuts" ADD CONSTRAINT "storyboard_cuts_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storyboard_cuts" ADD CONSTRAINT "storyboard_cuts_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_seed_comments" ADD CONSTRAINT "test_seed_comments_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_seed_comments" ADD CONSTRAINT "test_seed_comments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_competitor_id_competitors_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "public"."competitors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_editor_member_id_members_id_fk" FOREIGN KEY ("editor_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_shooter_member_id_members_id_fk" FOREIGN KEY ("shooter_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_reviewer_member_id_members_id_fk" FOREIGN KEY ("reviewer_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitors" ADD CONSTRAINT "competitors_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE set null ON UPDATE no action;