CREATE TABLE "ap_distribution_set_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"distribution_set_id" integer NOT NULL,
	"distribution_percent" numeric NOT NULL,
	"dist_code_combination_id" integer NOT NULL,
	"description" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "ap_distribution_sets" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ap_supplier_sites" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" integer NOT NULL,
	"site_name" varchar(100) DEFAULT 'OFFICE' NOT NULL,
	"address" text,
	"tax_id" varchar(100),
	"payment_terms_id" varchar(50),
	"is_pay_site" boolean DEFAULT true,
	"is_purchasing_site" boolean DEFAULT true,
	"enabled_flag" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ap_system_parameters" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" integer DEFAULT 1,
	"price_tolerance_percent" numeric DEFAULT '0.05',
	"qty_tolerance_percent" numeric DEFAULT '0.05',
	"tax_tolerance_percent" numeric DEFAULT '0.10',
	"default_payment_terms_id" varchar(50) DEFAULT 'Net 30',
	"default_currency_code" varchar(10) DEFAULT 'USD',
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ap_holds" ADD COLUMN "hold_type" varchar(50) DEFAULT 'GENERAL' NOT NULL;--> statement-breakpoint
ALTER TABLE "ap_invoices" ADD COLUMN "invoice_status" varchar(50) DEFAULT 'DRAFT';--> statement-breakpoint
ALTER TABLE "ap_suppliers" ADD COLUMN "supplier_type" varchar(50) DEFAULT 'STANDARD';