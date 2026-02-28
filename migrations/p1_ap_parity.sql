-- AP Oracle Parity Data Model Adjustments
-- This script adds the missing fields and new tables to support the advanced AP features.

-- 1. ap_invoices Table Modifications
ALTER TABLE "ap_invoices" 
ADD COLUMN IF NOT EXISTS "business_unit_id" varchar,
ADD COLUMN IF NOT EXISTS "legal_entity_id" varchar,
ADD COLUMN IF NOT EXISTS "terms_date" timestamp,
ADD COLUMN IF NOT EXISTS "goods_received_date" timestamp,
ADD COLUMN IF NOT EXISTS "invoice_received_date" timestamp,
ADD COLUMN IF NOT EXISTS "control_amount" numeric(18, 2),
ADD COLUMN IF NOT EXISTS "pay_group" varchar(50),
ADD COLUMN IF NOT EXISTS "payment_method_override" varchar(50),
ADD COLUMN IF NOT EXISTS "document_category" varchar(50),
ADD COLUMN IF NOT EXISTS "exchange_rate" numeric(18, 6);

-- 2. ap_invoice_lines Table Modifications
ALTER TABLE "ap_invoice_lines"
ADD COLUMN IF NOT EXISTS "po_line_id" varchar,
ADD COLUMN IF NOT EXISTS "quantity_invoiced" numeric(18, 4),
ADD COLUMN IF NOT EXISTS "unit_price" numeric(18, 4),
ADD COLUMN IF NOT EXISTS "uom" varchar(50),
ADD COLUMN IF NOT EXISTS "tax_classification_code" varchar(50),
ADD COLUMN IF NOT EXISTS "track_as_asset_flag" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "asset_category_id" varchar,
ADD COLUMN IF NOT EXISTS "requester_id" varchar;

-- 3. ap_invoice_distributions Table Modifications
ALTER TABLE "ap_invoice_distributions"
ADD COLUMN IF NOT EXISTS "distribution_line_type" varchar(50) DEFAULT 'ITEM' NOT NULL,
ADD COLUMN IF NOT EXISTS "ppm_project_id" varchar,
ADD COLUMN IF NOT EXISTS "ppm_task_id" varchar,
ADD COLUMN IF NOT EXISTS "expenditure_item_date" timestamp,
ADD COLUMN IF NOT EXISTS "expenditure_type" varchar(100),
ADD COLUMN IF NOT EXISTS "reversal_flag" boolean DEFAULT false;

-- 4. ap_payment_batches Table Modifications
ALTER TABLE "ap_payment_batches"
ADD COLUMN IF NOT EXISTS "template_id" varchar,
ADD COLUMN IF NOT EXISTS "pay_through_date" timestamp,
ADD COLUMN IF NOT EXISTS "priority_range" varchar(50),
ADD COLUMN IF NOT EXISTS "payment_document_id" varchar;

-- Change default status to SELECTING to match new PPR state machine
ALTER TABLE "ap_payment_batches" ALTER COLUMN "status" SET DEFAULT 'SELECTING';

-- 5. New Setup Tables

DO $$ BEGIN
 CREATE TABLE IF NOT EXISTS "ap_tolerances" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"price_tolerance_pct" numeric(5, 2) DEFAULT '0',
	"quantity_tolerance_pct" numeric(5, 2) DEFAULT '0',
	"max_amount_tolerance" numeric(18, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "ap_tolerances_name_unique" UNIQUE("name")
);
EXCEPTION
 WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
 CREATE TABLE IF NOT EXISTS "ap_ppr_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_name" varchar(100) NOT NULL,
	"description" text,
	"pay_group_id" varchar,
	"priority_range_from" integer,
	"priority_range_to" integer,
	"payment_method_code" varchar(50),
	"bank_account_id" varchar,
	"auto_review_invoices" boolean DEFAULT true,
	"auto_format_payments" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "ap_ppr_templates_template_name_unique" UNIQUE("template_name")
);
EXCEPTION
 WHEN duplicate_table THEN null;
END $$;
