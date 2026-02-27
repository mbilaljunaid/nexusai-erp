-- Migration: Add Lockbox Batches and Items
-- Created at: 2026-02-27 18:10:00

CREATE TABLE IF NOT EXISTS "lockbox_batches" (
	"id" text PRIMARY KEY,
	"tenant_id" text NOT NULL,
	"bank_account_id" text,
	"batch_date" date NOT NULL,
	"total_amount" numeric(20, 2) NOT NULL,
	"item_count" integer NOT NULL,
	"status" text DEFAULT 'Pending',
	"imported_by" text NOT NULL,
	"raw_file" text,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "lockbox_items" (
	"id" text PRIMARY KEY,
	"batch_id" text REFERENCES lockbox_batches(id) NOT NULL,
	"check_number" text,
	"remittance_ref" text,
	"payer_name" text,
	"payer_account" text,
	"amount" numeric(20, 2) NOT NULL,
	"item_date" date NOT NULL,
	"matched_invoice_id" text,
	"match_method" text,
	"match_status" text DEFAULT 'Unmatched',
	"unapplied_amount" numeric(20, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
