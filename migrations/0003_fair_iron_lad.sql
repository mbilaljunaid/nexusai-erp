CREATE TABLE "ar_receipt_applications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"receipt_id" varchar NOT NULL,
	"invoice_id" varchar NOT NULL,
	"amount_applied" numeric(18, 2) NOT NULL,
	"application_date" timestamp DEFAULT now(),
	"status" varchar DEFAULT 'Applied',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ar_receipts" ADD COLUMN "unapplied_amount" numeric(18, 2) DEFAULT '0';