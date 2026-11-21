ALTER TABLE "crux_comments" ADD COLUMN "moderation" text DEFAULT 'unchecked' NOT NULL;--> statement-breakpoint
ALTER TABLE "suggestions" ADD COLUMN "moderation" text DEFAULT 'unchecked' NOT NULL;--> statement-breakpoint
ALTER TABLE "viewpoint_suggestions" ADD COLUMN "moderation" text DEFAULT 'unchecked' NOT NULL;