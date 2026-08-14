ALTER TABLE "clients" ADD COLUMN "contact_name" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "contact_method" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();