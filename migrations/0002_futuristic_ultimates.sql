CREATE TABLE "ap_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"action" varchar(100) NOT NULL,
	"entity" varchar(50) NOT NULL,
	"entity_id" varchar(50) NOT NULL,
	"user_id" varchar NOT NULL,
	"before_state" jsonb,
	"after_state" jsonb,
	"details" text,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ap_payment_batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_name" varchar(100) NOT NULL,
	"status" varchar(50) DEFAULT 'NEW',
	"check_date" timestamp DEFAULT now() NOT NULL,
	"pay_group" varchar(50),
	"payment_method_code" varchar(50) DEFAULT 'CHECK',
	"total_amount" numeric(18, 2) DEFAULT '0',
	"payment_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ap_period_statuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"period_id" varchar NOT NULL,
	"status" varchar(20) DEFAULT 'OPEN',
	"closed_date" timestamp,
	"closed_by" varchar,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ap_prepay_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"standard_invoice_id" integer NOT NULL,
	"prepayment_invoice_id" integer NOT NULL,
	"amount_applied" numeric(18, 2) NOT NULL,
	"accounting_date" timestamp DEFAULT now() NOT NULL,
	"user_id" varchar NOT NULL,
	"status" varchar(20) DEFAULT 'APPLIED',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ap_wht_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_name" varchar(100) NOT NULL,
	"description" text,
	"enabled_flag" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "ap_wht_groups_group_name_unique" UNIQUE("group_name")
);
--> statement-breakpoint
CREATE TABLE "ap_wht_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"tax_authority_id" integer,
	"tax_rate_name" varchar(100) NOT NULL,
	"rate_percent" numeric(5, 2) NOT NULL,
	"priority" integer DEFAULT 1,
	"enabled_flag" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ar_customer_accounts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar NOT NULL,
	"account_name" varchar NOT NULL,
	"account_number" varchar NOT NULL,
	"status" varchar DEFAULT 'Active',
	"credit_limit" numeric(18, 2) DEFAULT '0',
	"balance" numeric(18, 2) DEFAULT '0',
	"credit_hold" boolean DEFAULT false,
	"risk_category" varchar DEFAULT 'Low',
	"ledger_id" varchar,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "ar_customer_accounts_account_number_unique" UNIQUE("account_number")
);
--> statement-breakpoint
CREATE TABLE "ar_customer_sites" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" varchar NOT NULL,
	"site_name" varchar NOT NULL,
	"address" text NOT NULL,
	"is_bill_to" boolean DEFAULT true,
	"is_ship_to" boolean DEFAULT false,
	"status" varchar DEFAULT 'Active',
	"primary_flag" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cash_statement_headers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bank_account_id" varchar NOT NULL,
	"statement_number" varchar(50),
	"statement_date" timestamp NOT NULL,
	"opening_balance" numeric(20, 2),
	"closing_balance" numeric(20, 2),
	"status" varchar(20) DEFAULT 'Uploaded',
	"import_format" varchar(20),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cash_zba_structures" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"master_account_id" varchar NOT NULL,
	"sub_account_id" varchar NOT NULL,
	"target_balance" numeric(20, 2) DEFAULT '0',
	"status" varchar(20) DEFAULT 'Active',
	"pending_data" jsonb,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cash_zba_sweeps" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"structure_id" varchar NOT NULL,
	"sweep_date" timestamp DEFAULT now(),
	"amount" numeric(20, 2) NOT NULL,
	"direction" varchar(20) NOT NULL,
	"transaction_id" varchar,
	"status" varchar(20) DEFAULT 'Completed'
);
--> statement-breakpoint
ALTER TABLE "ap_invoices" ADD COLUMN "withholding_tax_amount" numeric(18, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "ap_invoices" ADD COLUMN "audio_url" text;--> statement-breakpoint
ALTER TABLE "ap_invoices" ADD COLUMN "document_url" text;--> statement-breakpoint
ALTER TABLE "ap_invoices" ADD COLUMN "ai_extraction_status" varchar(50);--> statement-breakpoint
ALTER TABLE "ap_invoices" ADD COLUMN "extracted_json" jsonb;--> statement-breakpoint
ALTER TABLE "ap_invoices" ADD COLUMN "prepay_amount_remaining" numeric(18, 2);--> statement-breakpoint
ALTER TABLE "ap_payments" ADD COLUMN "batch_id" integer;--> statement-breakpoint
ALTER TABLE "ap_supplier_sites" ADD COLUMN "org_id" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "ap_supplier_sites" ADD COLUMN "iban" varchar(50);--> statement-breakpoint
ALTER TABLE "ap_supplier_sites" ADD COLUMN "swift_code" varchar(20);--> statement-breakpoint
ALTER TABLE "ap_supplier_sites" ADD COLUMN "bank_account_name" varchar(100);--> statement-breakpoint
ALTER TABLE "ap_supplier_sites" ADD COLUMN "bank_account_number" varchar(50);--> statement-breakpoint
ALTER TABLE "ap_suppliers" ADD COLUMN "allow_withholding_tax" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "ap_suppliers" ADD COLUMN "withholding_tax_group_id" varchar(50);--> statement-breakpoint
ALTER TABLE "ap_system_parameters" ADD COLUMN "amount_tolerance" numeric DEFAULT '10.00';--> statement-breakpoint
ALTER TABLE "ap_system_parameters" ADD COLUMN "default_pay_group" varchar(50) DEFAULT 'STANDARD';--> statement-breakpoint
ALTER TABLE "ap_system_parameters" ADD COLUMN "default_payment_method" varchar(50) DEFAULT 'CHECK';--> statement-breakpoint
ALTER TABLE "ap_system_parameters" ADD COLUMN "allow_manual_invoice_number" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "ap_system_parameters" ADD COLUMN "invoice_currency_override" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "ap_system_parameters" ADD COLUMN "payment_currency_override" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "ap_system_parameters" ADD COLUMN "allow_payment_terms_override" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "ap_system_parameters" ADD COLUMN "account_on_validation" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "ap_system_parameters" ADD COLUMN "account_on_payment" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "ap_system_parameters" ADD COLUMN "allow_draft_accounting" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "ar_invoices" ADD COLUMN "account_id" varchar;--> statement-breakpoint
ALTER TABLE "ar_invoices" ADD COLUMN "site_id" varchar;--> statement-breakpoint
ALTER TABLE "ar_invoices" ADD COLUMN "transaction_class" varchar DEFAULT 'INV';--> statement-breakpoint
ALTER TABLE "ar_invoices" ADD COLUMN "source_transaction_id" varchar;--> statement-breakpoint
ALTER TABLE "ar_receipts" ADD COLUMN "account_id" varchar;--> statement-breakpoint
ALTER TABLE "cash_bank_accounts" ADD COLUMN "secondary_ledger_id" varchar;--> statement-breakpoint
ALTER TABLE "cash_bank_accounts" ADD COLUMN "cash_account_ccid" integer;--> statement-breakpoint
ALTER TABLE "cash_bank_accounts" ADD COLUMN "cash_clearing_ccid" integer;--> statement-breakpoint
ALTER TABLE "cash_statement_lines" ADD COLUMN "header_id" varchar;--> statement-breakpoint
ALTER TABLE "cash_transactions" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "ar_customers" DROP COLUMN "credit_limit";--> statement-breakpoint
ALTER TABLE "ar_customers" DROP COLUMN "balance";--> statement-breakpoint
ALTER TABLE "ar_customers" DROP COLUMN "credit_hold";--> statement-breakpoint
ALTER TABLE "ar_customers" DROP COLUMN "risk_category";