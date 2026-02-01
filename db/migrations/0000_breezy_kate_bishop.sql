CREATE TABLE "communities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"plan_tuple" text DEFAULT 'starter_100',
	"max_homes" integer DEFAULT 100,
	"is_active" boolean DEFAULT true,
	"logo_url" text,
	"primary_color" text DEFAULT '#4f46e5',
	"secondary_color" text DEFAULT '#1e1b4b',
	"accent_color" text DEFAULT '#f59e0b',
	"has_marketplace" boolean DEFAULT true,
	"has_resources" boolean DEFAULT true,
	"has_events" boolean DEFAULT true,
	"has_documents" boolean DEFAULT true,
	"has_forum" boolean DEFAULT true,
	"has_messages" boolean DEFAULT true,
	"has_service_pros" boolean DEFAULT true,
	"has_local_guide" boolean DEFAULT true,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "communities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"upload_date" timestamp with time zone DEFAULT now(),
	"size" text,
	"url" text,
	"uploader_id" uuid
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"date" date NOT NULL,
	"time" time NOT NULL,
	"location" text,
	"category" text,
	"organizer_id" uuid,
	"attendees_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "marketplace_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) DEFAULT '0',
	"is_free" boolean DEFAULT false,
	"is_negotiable" boolean DEFAULT false,
	"images" text[],
	"status" text DEFAULT 'Active',
	"posted_date" timestamp with time zone DEFAULT now(),
	"expires_at" timestamp with time zone,
	"seller_id" uuid
);
--> statement-breakpoint
CREATE TABLE "neighbors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid,
	"name" text NOT NULL,
	"role" text DEFAULT 'Resident',
	"address" text,
	"avatar" text,
	"skills" text[],
	"joined_date" timestamp with time zone DEFAULT now(),
	"is_online" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text,
	"capacity" integer,
	"description" text,
	"is_reservable" boolean DEFAULT true,
	"image_url" text
);
--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploader_id_neighbors_id_fk" FOREIGN KEY ("uploader_id") REFERENCES "public"."neighbors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_neighbors_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."neighbors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_items" ADD CONSTRAINT "marketplace_items_seller_id_neighbors_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."neighbors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "neighbors" ADD CONSTRAINT "neighbors_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;