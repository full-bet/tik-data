CREATE TABLE "competitor_videos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "tiktok_url" text NOT NULL,
  "title" text,
  "account_name" text,
  "category" text,
  "script_content" text,
  "memo" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "competitor_videos" ADD CONSTRAINT "competitor_videos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "competitor_videos" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "users_own_competitor_videos" ON "competitor_videos" FOR ALL USING (auth.uid() = user_id);
--> statement-breakpoint
CREATE INDEX "competitor_videos_user_id_idx" ON "competitor_videos" ("user_id");
