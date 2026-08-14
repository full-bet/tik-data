CREATE TABLE "client_contact_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"contact_method_id" uuid NOT NULL,
	CONSTRAINT "client_contact_methods_client_id_contact_method_id_unique" UNIQUE("client_id","contact_method_id")
);
--> statement-breakpoint
CREATE TABLE "contact_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "contact_methods_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "client_contact_methods" ADD CONSTRAINT "client_contact_methods_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_contact_methods" ADD CONSTRAINT "client_contact_methods_contact_method_id_contact_methods_id_fk" FOREIGN KEY ("contact_method_id") REFERENCES "public"."contact_methods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "contact_method";