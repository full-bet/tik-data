-- 旧・未使用の台本管理プロトタイプ用テーブル（データなし、drizzleの管理外で作成されたもの）を撤去し、
-- 本マイグレーションで定義する新しい scripts テーブルと衝突しないようにする
DROP TABLE IF EXISTS "post_metrics";
DROP TABLE IF EXISTS "posts";
DROP TABLE IF EXISTS "scripts";
--> statement-breakpoint
CREATE TABLE "account_classifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"type" text NOT NULL,
	"list_applied" boolean DEFAULT false,
	"list_applied_at" timestamp with time zone,
	CONSTRAINT "account_classifications_account_id_type_unique" UNIQUE("account_id","type")
);
--> statement-breakpoint
CREATE TABLE "ai_tools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "ai_tools_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "auth_email_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_email_id" uuid NOT NULL,
	"device_id" uuid NOT NULL,
	CONSTRAINT "auth_email_devices_auth_email_id_device_id_unique" UNIQUE("auth_email_id","device_id")
);
--> statement-breakpoint
CREATE TABLE "auth_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "auth_emails_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "cast_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cast_member_id" uuid NOT NULL,
	"url" text NOT NULL,
	"category" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cast_profiles" (
	"member_id" uuid PRIMARY KEY NOT NULL,
	"referrer_member_id" uuid,
	"contact_method" text,
	"contact_person_id" uuid,
	"age" integer,
	"gender" text,
	"exposure_range" text,
	"ng_notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deal_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"role_note" text
);
--> statement-breakpoint
CREATE TABLE "deal_cv_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" uuid NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now(),
	"cv_count" integer DEFAULT 1,
	"source" text,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "deal_monthly_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" uuid NOT NULL,
	"target_month" date NOT NULL,
	"budget_cv_count" integer DEFAULT 0,
	CONSTRAINT "deal_monthly_targets_deal_id_target_month_unique" UNIQUE("deal_id","target_month")
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid,
	"name" text NOT NULL,
	"unit_price" numeric,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"owner_type" text,
	"usage_note" text,
	"assigned_member_id" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "item_ai_tools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"ai_tool_id" uuid NOT NULL,
	CONSTRAINT "item_ai_tools_item_id_ai_tool_id_unique" UNIQUE("item_id","ai_tool_id")
);
--> statement-breakpoint
CREATE TABLE "item_materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"material_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"file_url" text,
	"file_type" text,
	"cast_member_id" uuid,
	"deal_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "member_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"role" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"memo" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "script_ai_tools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"script_id" uuid NOT NULL,
	"ai_tool_id" uuid NOT NULL,
	CONSTRAINT "script_ai_tools_script_id_ai_tool_id_unique" UNIQUE("script_id","ai_tool_id")
);
--> statement-breakpoint
CREATE TABLE "scripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"operator_member_id" uuid,
	"title" text NOT NULL,
	"content" text,
	"category" text,
	"hook" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "taggables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "taggables_tag_id_entity_type_entity_id_unique" UNIQUE("tag_id","entity_type","entity_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text,
	CONSTRAINT "tags_name_category_unique" UNIQUE("name","category")
);
--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "tiktok_open_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "access_token" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "analytics_imports" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "analytics_snapshots" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "competitors" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "items" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "auth_email_id" uuid;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "primary_operator_member_id" uuid;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "platform" text DEFAULT 'tiktok';--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "birthday" date;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "tts_value" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "ekyc_value" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "deal_id" uuid;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "script_id" uuid;--> statement-breakpoint
ALTER TABLE "account_classifications" ADD CONSTRAINT "account_classifications_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_email_devices" ADD CONSTRAINT "auth_email_devices_auth_email_id_auth_emails_id_fk" FOREIGN KEY ("auth_email_id") REFERENCES "public"."auth_emails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_email_devices" ADD CONSTRAINT "auth_email_devices_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cast_photos" ADD CONSTRAINT "cast_photos_cast_member_id_members_id_fk" FOREIGN KEY ("cast_member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cast_profiles" ADD CONSTRAINT "cast_profiles_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cast_profiles" ADD CONSTRAINT "cast_profiles_referrer_member_id_members_id_fk" FOREIGN KEY ("referrer_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cast_profiles" ADD CONSTRAINT "cast_profiles_contact_person_id_members_id_fk" FOREIGN KEY ("contact_person_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_contacts" ADD CONSTRAINT "deal_contacts_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_contacts" ADD CONSTRAINT "deal_contacts_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_cv_events" ADD CONSTRAINT "deal_cv_events_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_monthly_targets" ADD CONSTRAINT "deal_monthly_targets_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_assigned_member_id_members_id_fk" FOREIGN KEY ("assigned_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_ai_tools" ADD CONSTRAINT "item_ai_tools_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_ai_tools" ADD CONSTRAINT "item_ai_tools_ai_tool_id_ai_tools_id_fk" FOREIGN KEY ("ai_tool_id") REFERENCES "public"."ai_tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_materials" ADD CONSTRAINT "item_materials_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_materials" ADD CONSTRAINT "item_materials_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_cast_member_id_members_id_fk" FOREIGN KEY ("cast_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_roles" ADD CONSTRAINT "member_roles_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "script_ai_tools" ADD CONSTRAINT "script_ai_tools_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "script_ai_tools" ADD CONSTRAINT "script_ai_tools_ai_tool_id_ai_tools_id_fk" FOREIGN KEY ("ai_tool_id") REFERENCES "public"."ai_tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_operator_member_id_members_id_fk" FOREIGN KEY ("operator_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taggables" ADD CONSTRAINT "taggables_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_auth_email_id_auth_emails_id_fk" FOREIGN KEY ("auth_email_id") REFERENCES "public"."auth_emails"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_primary_operator_member_id_members_id_fk" FOREIGN KEY ("primary_operator_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE set null ON UPDATE no action;