-- Migration: Add Intercompany Netting and Disputes
-- Created at: 2026-02-27 18:00:00

CREATE TABLE IF NOT EXISTS "ic_netting_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" text NOT NULL,
	"session_name" text NOT NULL,
	"period" text NOT NULL,
	"currency" text NOT NULL,
	"entities_in_scope" jsonb,
	"settlement_date" date,
	"status" text DEFAULT 'Draft',
	"net_positions" jsonb,
	"run_by" text,
	"settled_by" text,
	"settlement_instructions" jsonb,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "transfer_pricing_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" text NOT NULL,
	"policy_name" text NOT NULL,
	"transaction_category" text NOT NULL,
	"method" text NOT NULL,
	"from_entity" text,
	"to_entity" text,
	"arm_length_margin_pct" numeric(5, 2),
	"benchmark_range_low" numeric(5, 2),
	"benchmark_range_high" numeric(5, 2),
	"effective_from" date NOT NULL,
	"effective_to" date,
	"approved_by" text,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "transfer_pricing_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" text NOT NULL,
	"policy_id" uuid REFERENCES transfer_pricing_policies(id),
	"period" text NOT NULL,
	"actual_margin_pct" numeric(5, 2),
	"benchmark_margin_pct" numeric(5, 2),
	"variance_pct" numeric(5, 2),
	"in_range" boolean DEFAULT true,
	"flagged" boolean DEFAULT false,
	"transactions_reviewed" integer DEFAULT 0,
	"analysis_notes" text,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "ic_disputes" (
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
