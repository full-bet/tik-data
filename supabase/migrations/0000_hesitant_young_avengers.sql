CREATE TABLE IF NOT EXISTS "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tiktok_open_id" text NOT NULL,
	"tiktok_username" text,
	"tiktok_display_name" text,
	"tiktok_avatar_url" text,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"token_expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "accounts_tiktok_open_id_unique" UNIQUE("tiktok_open_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid,
	"video_title" text NOT NULL,
	"video_url" text,
	"posted_at" timestamp with time zone,
	"script_content" text,
	"category" text,
	"hook" text,
	"views" bigint DEFAULT 0,
	"likes" bigint DEFAULT 0,
	"followers_gained" bigint DEFAULT 0,
	"cv_count" bigint DEFAULT 0,
	"initial_views" bigint DEFAULT 0,
	"initial_likes" bigint DEFAULT 0,
	"initial_followers_gained" bigint DEFAULT 0,
	"initial_cv_count" bigint DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "analytics_imports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"filename" text NOT NULL,
	"imported_at" timestamp with time zone DEFAULT now(),
	"processed_at" timestamp with time zone,
	"row_count" integer DEFAULT 0,
	"status" text DEFAULT 'pending',
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "analytics_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"import_id" uuid NOT NULL,
	"video_title" text,
	"video_id" text,
	"post_date" text,
	"views" bigint DEFAULT 0,
	"likes" bigint DEFAULT 0,
	"comments" bigint DEFAULT 0,
	"shares" bigint DEFAULT 0,
	"reach" bigint DEFAULT 0,
	"watch_time_mins" numeric DEFAULT '0',
	"profile_views" bigint DEFAULT 0,
	"new_followers" bigint DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
