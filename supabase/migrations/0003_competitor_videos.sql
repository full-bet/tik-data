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
