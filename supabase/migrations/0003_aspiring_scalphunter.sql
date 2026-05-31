CREATE TABLE "competitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"url" text NOT NULL,
	"platform" text DEFAULT 'tiktok',
	"video_title" text,
	"creator_name" text,
	"posted_at" timestamp with time zone,
	"thumbnail_url" text,
	"transcript" text,
	"hook" text,
	"structure" text,
	"cta" text,
	"ai_summary" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
