CREATE TABLE "gl_close_tasks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ledger_id" varchar NOT NULL,
	"period_id" varchar NOT NULL,
	"task_name" varchar NOT NULL,
	"description" text,
	"status" varchar DEFAULT 'PENDING',
	"completed_by" varchar,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_fsg_column_sets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"ledger_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_fsg_row_sets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"ledger_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_report_instances" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" varchar NOT NULL,
	"schedule_id" varchar,
	"run_date" timestamp DEFAULT now(),
	"status" varchar DEFAULT 'COMPLETED',
	"output_path" text,
	"filters_applied" jsonb,
	"error_log" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_report_schedules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"recurrence" varchar NOT NULL,
	"parameters" jsonb,
	"recipient_emails" text,
	"next_run_at" timestamp,
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cash_matching_groups" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reconciled_date" timestamp DEFAULT now(),
	"user_id" varchar NOT NULL,
	"method" varchar NOT NULL,
	"batch_id" varchar
);
--> statement-breakpoint
CREATE TABLE "cash_reconciliation_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ledger_id" varchar NOT NULL,
	"bank_account_id" varchar,
	"rule_name" varchar NOT NULL,
	"priority" integer DEFAULT 10,
	"matching_criteria" jsonb NOT NULL,
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_auto_post_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_name" varchar NOT NULL,
	"ledger_id" varchar NOT NULL,
	"priority" integer DEFAULT 1,
	"criteria" jsonb NOT NULL,
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_je_categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"user_category_name" varchar NOT NULL,
	"description" text,
	"reversal_method" varchar DEFAULT 'Switch Dr/Cr',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "gl_je_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "gl_je_sources" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"user_source_name" varchar NOT NULL,
	"description" text,
	"import_journal_references" boolean DEFAULT false,
	"journal_approval_flag" boolean DEFAULT false,
	"effective_date_rule" varchar DEFAULT 'Fail',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "gl_je_sources_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "gl_ledger_controls" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ledger_id" varchar NOT NULL,
	"enable_suspense" boolean DEFAULT false,
	"suspense_ccid" varchar,
	"rounding_ccid" varchar,
	"threshold_amount" numeric(18, 2) DEFAULT '0',
	"auto_post_journals" boolean DEFAULT false,
	"auto_reverse_journals" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "gl_ledger_controls_ledger_id_unique" UNIQUE("ledger_id")
);
--> statement-breakpoint
ALTER TABLE "gl_fsg_rows" ALTER COLUMN "segment_filter" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "cash_bank_accounts" ALTER COLUMN "id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "cash_bank_accounts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "cash_bank_accounts" ALTER COLUMN "gl_account_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "cash_bank_accounts" ALTER COLUMN "current_balance" SET DATA TYPE numeric(20, 2);--> statement-breakpoint
ALTER TABLE "cash_bank_accounts" ALTER COLUMN "current_balance" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "cash_statement_lines" ALTER COLUMN "id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "cash_statement_lines" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "cash_statement_lines" ALTER COLUMN "bank_account_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "cash_statement_lines" ALTER COLUMN "amount" SET DATA TYPE numeric(20, 2);--> statement-breakpoint
ALTER TABLE "cash_transactions" ALTER COLUMN "id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "cash_transactions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "cash_transactions" ALTER COLUMN "bank_account_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "cash_transactions" ALTER COLUMN "source_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "cash_transactions" ALTER COLUMN "amount" SET DATA TYPE numeric(20, 2);--> statement-breakpoint
ALTER TABLE "gl_fsg_cols" ADD COLUMN "column_set_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "gl_fsg_defs" ADD COLUMN "row_set_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "gl_fsg_defs" ADD COLUMN "column_set_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "gl_fsg_rows" ADD COLUMN "row_set_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "cash_bank_accounts" ADD COLUMN "ledger_id" varchar;--> statement-breakpoint
ALTER TABLE "cash_statement_lines" ADD COLUMN "matching_group_id" varchar;--> statement-breakpoint
ALTER TABLE "cash_transactions" ADD COLUMN "matching_group_id" varchar;--> statement-breakpoint
ALTER TABLE "gl_fsg_cols" DROP COLUMN "report_id";--> statement-breakpoint
ALTER TABLE "gl_fsg_cols" DROP COLUMN "ledger_id";--> statement-breakpoint
ALTER TABLE "gl_fsg_defs" DROP COLUMN "chart_of_accounts_id";--> statement-breakpoint
ALTER TABLE "gl_fsg_rows" DROP COLUMN "report_id";