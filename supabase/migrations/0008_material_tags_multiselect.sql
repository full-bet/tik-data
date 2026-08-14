CREATE TABLE "material_casts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"material_id" uuid NOT NULL,
	"cast_member_id" uuid NOT NULL,
	CONSTRAINT "material_casts_material_id_cast_member_id_unique" UNIQUE("material_id","cast_member_id")
);
--> statement-breakpoint
CREATE TABLE "material_deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"material_id" uuid NOT NULL,
	"deal_id" uuid NOT NULL,
	CONSTRAINT "material_deals_material_id_deal_id_unique" UNIQUE("material_id","deal_id")
);
--> statement-breakpoint
ALTER TABLE "materials" DROP CONSTRAINT "materials_cast_member_id_members_id_fk";
--> statement-breakpoint
ALTER TABLE "materials" DROP CONSTRAINT "materials_deal_id_deals_id_fk";
--> statement-breakpoint
ALTER TABLE "material_casts" ADD CONSTRAINT "material_casts_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_casts" ADD CONSTRAINT "material_casts_cast_member_id_members_id_fk" FOREIGN KEY ("cast_member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_deals" ADD CONSTRAINT "material_deals_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_deals" ADD CONSTRAINT "material_deals_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" DROP COLUMN "file_type";--> statement-breakpoint
ALTER TABLE "materials" DROP COLUMN "cast_member_id";--> statement-breakpoint
ALTER TABLE "materials" DROP COLUMN "deal_id";