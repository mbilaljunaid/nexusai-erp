DROP TABLE IF EXISTS "ic_disputes";
CREATE TABLE "ic_disputes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" text NOT NULL,
	"dispute_number" text NOT NULL UNIQUE,
	"ic_transaction_id" text,
	"from_entity" text NOT NULL,
	"to_entity" text NOT NULL,
	"disputed_amount" numeric(20, 2),
	"currency" text DEFAULT 'USD' NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'Open',
	"opened_by" text NOT NULL,
	"opened_at" timestamp DEFAULT now(),
	"resolved_by" text,
	"resolved_at" timestamp,
	"resolution" text,
	"events" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now()
);
