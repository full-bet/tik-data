ALTER TABLE "analytics_snapshots" ADD COLUMN "duration" text;--> statement-breakpoint
ALTER TABLE "analytics_snapshots" ADD COLUMN "gmv" numeric DEFAULT '0';--> statement-breakpoint
ALTER TABLE "analytics_snapshots" ADD COLUMN "direct_gmv" numeric DEFAULT '0';--> statement-breakpoint
ALTER TABLE "analytics_snapshots" ADD COLUMN "items_sold" bigint DEFAULT 0;--> statement-breakpoint
ALTER TABLE "analytics_snapshots" ADD COLUMN "ctr" numeric DEFAULT '0';--> statement-breakpoint
ALTER TABLE "analytics_snapshots" ADD COLUMN "completion_rate" numeric DEFAULT '0';