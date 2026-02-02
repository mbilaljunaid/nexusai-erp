CREATE TABLE "audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"action" varchar NOT NULL,
	"entity_type" varchar,
	"entity_id" varchar,
	"old_value" jsonb,
	"new_value" jsonb,
	"ip_address" varchar,
	"user_agent" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"company" varchar,
	"subject" varchar NOT NULL,
	"message" text NOT NULL,
	"status" varchar DEFAULT 'new',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dashboard_widgets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"widget_type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"config" jsonb,
	"position" integer DEFAULT 0,
	"size" varchar DEFAULT 'medium',
	"is_visible" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "demos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"company" varchar NOT NULL,
	"industry" varchar NOT NULL,
	"status" varchar DEFAULT 'active',
	"demo_token" varchar,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	CONSTRAINT "demos_demo_token_unique" UNIQUE("demo_token")
);
--> statement-breakpoint
CREATE TABLE "form_data" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" varchar NOT NULL,
	"data" jsonb NOT NULL,
	"status" varchar DEFAULT 'draft',
	"submitted_by" varchar,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "industries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"description" text,
	"icon" varchar,
	"default_modules" text[],
	"config_schema" jsonb,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "industries_name_unique" UNIQUE("name"),
	CONSTRAINT "industries_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "industry_app_recommendations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"industry_id" varchar NOT NULL,
	"app_id" varchar NOT NULL,
	"ranking" integer DEFAULT 0,
	"reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "industry_deployments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"industry_id" varchar NOT NULL,
	"enabled_modules" text[],
	"custom_config" jsonb,
	"status" varchar DEFAULT 'active',
	"deployed_by" varchar,
	"deployed_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"owner_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"description" text,
	"logo_url" varchar,
	"status" varchar DEFAULT 'active',
	"settings" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_feedback" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"type" varchar NOT NULL,
	"category" varchar,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"priority" varchar DEFAULT 'medium',
	"status" varchar DEFAULT 'new',
	"attachment_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"message" text,
	"icon" varchar,
	"action_url" varchar,
	"reference_type" varchar,
	"reference_id" varchar,
	"is_read" boolean DEFAULT false,
	"is_archived" boolean DEFAULT false,
	"priority" varchar DEFAULT 'normal',
	"created_at" timestamp DEFAULT now(),
	"read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"password" varchar,
	"name" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"role" varchar DEFAULT 'user',
	"permissions" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "ap_approvals" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"approver_id" integer,
	"status" varchar(50) DEFAULT 'Pending',
	"decision" varchar(50) DEFAULT 'Pending',
	"action_date" timestamp,
	"comments" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ap_holds" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"line_location_id" integer,
	"hold_lookup_code" varchar(50) NOT NULL,
	"hold_reason" varchar(255),
	"release_lookup_code" varchar(50),
	"hold_date" timestamp DEFAULT now(),
	"held_by" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "ap_invoice_distributions" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"invoice_line_id" integer NOT NULL,
	"dist_line_number" integer NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"dist_code_combination_id" varchar NOT NULL,
	"accounting_date" timestamp,
	"description" text,
	"posted_flag" boolean DEFAULT false,
	"reversal_flag" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ap_invoice_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"line_number" integer NOT NULL,
	"line_type" varchar(50) DEFAULT 'ITEM' NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"description" text,
	"po_header_id" varchar,
	"po_line_id" varchar,
	"quantity_invoiced" numeric(18, 4),
	"unit_price" numeric(18, 4),
	"discarded_flag" boolean DEFAULT false,
	"cancelled_flag" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ap_invoice_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"payment_id" integer NOT NULL,
	"invoice_id" integer NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"accounting_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ap_invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" varchar(50),
	"supplier_id" integer NOT NULL,
	"supplier_site_id" integer,
	"invoice_number" varchar(100) NOT NULL,
	"invoice_date" timestamp NOT NULL,
	"description" text,
	"invoice_type" varchar(50) DEFAULT 'STANDARD',
	"invoice_currency_code" varchar(10) DEFAULT 'USD' NOT NULL,
	"payment_currency_code" varchar(10) DEFAULT 'USD' NOT NULL,
	"invoice_amount" numeric(18, 2) NOT NULL,
	"validation_status" varchar(50) DEFAULT 'NEVER VALIDATED',
	"approval_status" varchar(50) DEFAULT 'REQUIRED',
	"payment_status" varchar(50) DEFAULT 'UNPAID',
	"accounting_status" varchar(50) DEFAULT 'UNACCOUNTED',
	"due_date" timestamp,
	"payment_terms" varchar(100) DEFAULT 'Net 30',
	"tax_amount" numeric(18, 2) DEFAULT '0',
	"cancelled_date" timestamp,
	"gl_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ap_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"payment_number" serial NOT NULL,
	"check_number" varchar,
	"payment_date" timestamp NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"currency_code" varchar(10) NOT NULL,
	"payment_method_code" varchar(50) NOT NULL,
	"supplier_id" integer NOT NULL,
	"status" varchar(50) DEFAULT 'NEGOTIABLE',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ap_suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_number" varchar(50),
	"name" varchar(255) NOT NULL,
	"tax_organization_type" varchar(50),
	"tax_id" varchar(100),
	"enabled_flag" boolean DEFAULT true,
	"credit_hold" boolean DEFAULT false,
	"payment_terms_id" varchar(50),
	"risk_category" varchar(50) DEFAULT 'Low',
	"risk_score" integer,
	"address" text,
	"country" varchar(100),
	"contact_email" varchar(255),
	"parent_supplier_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ar_customers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"tax_id" varchar,
	"customer_type" varchar DEFAULT 'Commercial',
	"credit_limit" numeric(18, 2) DEFAULT '0',
	"balance" numeric(18, 2) DEFAULT '0',
	"address" text,
	"contact_email" varchar,
	"credit_hold" boolean DEFAULT false,
	"risk_category" varchar DEFAULT 'Low',
	"parent_customer_id" varchar,
	"status" varchar DEFAULT 'Active',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ar_invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar NOT NULL,
	"invoice_number" varchar NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"tax_amount" numeric(18, 2) DEFAULT '0',
	"total_amount" numeric(18, 2) NOT NULL,
	"currency" varchar DEFAULT 'USD',
	"due_date" timestamp,
	"status" varchar DEFAULT 'Draft',
	"description" text,
	"gl_account_id" varchar,
	"revenue_schedule_id" varchar,
	"recognition_status" varchar DEFAULT 'Pending',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "ar_invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "ar_receipts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar NOT NULL,
	"invoice_id" varchar,
	"amount" numeric(18, 2) NOT NULL,
	"receipt_date" timestamp,
	"payment_method" varchar,
	"transaction_id" varchar,
	"status" varchar DEFAULT 'Completed',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"parent_account_id" varchar,
	"type" varchar,
	"industry" varchar,
	"rating" varchar,
	"billing_street" text,
	"billing_city" varchar,
	"billing_state" varchar,
	"billing_postal_code" varchar,
	"billing_country" varchar,
	"shipping_street" text,
	"shipping_city" varchar,
	"shipping_state" varchar,
	"shipping_postal_code" varchar,
	"shipping_country" varchar,
	"phone" varchar,
	"fax" varchar,
	"website" varchar,
	"annual_revenue" numeric,
	"number_of_employees" integer,
	"ownership" varchar,
	"ticker_symbol" varchar,
	"description" text,
	"status" varchar DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"owner_id" varchar
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar,
	"status" varchar DEFAULT 'Planned',
	"start_date" timestamp,
	"end_date" timestamp,
	"expected_revenue" numeric,
	"budgeted_cost" numeric,
	"actual_cost" numeric,
	"is_active" integer DEFAULT 1,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"owner_id" varchar
);
--> statement-breakpoint
CREATE TABLE "crm_case_comments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" varchar NOT NULL,
	"body" text NOT NULL,
	"is_public" boolean DEFAULT false,
	"created_by_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crm_cases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'New',
	"priority" text DEFAULT 'Medium',
	"origin" text,
	"account_id" varchar,
	"contact_id" varchar,
	"user_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" varchar,
	"salutation" varchar,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"email" varchar,
	"phone" varchar,
	"mobile_phone" varchar,
	"home_phone" varchar,
	"title" varchar,
	"department" varchar,
	"assistant_name" varchar,
	"assistant_phone" varchar,
	"lead_source" varchar,
	"mailing_street" text,
	"mailing_city" varchar,
	"mailing_state" varchar,
	"mailing_postal_code" varchar,
	"mailing_country" varchar,
	"description" text,
	"birthdate" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"owner_id" varchar
);
--> statement-breakpoint
CREATE TABLE "interactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar NOT NULL,
	"entity_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"subject" varchar,
	"summary" text NOT NULL,
	"description" text,
	"priority" varchar DEFAULT 'Normal',
	"status" varchar DEFAULT 'Completed',
	"due_date" timestamp,
	"performed_at" timestamp DEFAULT now(),
	"performed_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salutation" varchar,
	"first_name" varchar,
	"last_name" varchar NOT NULL,
	"name" varchar NOT NULL,
	"title" varchar,
	"company" varchar,
	"email" varchar,
	"phone" varchar,
	"mobile_phone" varchar,
	"website" varchar,
	"street" text,
	"city" varchar,
	"state" varchar,
	"postal_code" varchar,
	"country" varchar,
	"lead_source" varchar,
	"status" varchar DEFAULT 'new',
	"industry" varchar,
	"rating" varchar,
	"annual_revenue" numeric,
	"number_of_employees" integer,
	"score" numeric(5, 2) DEFAULT '0',
	"is_converted" integer DEFAULT 0,
	"converted_date" timestamp,
	"converted_account_id" varchar,
	"converted_contact_id" varchar,
	"converted_opportunity_id" varchar,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"owner_id" varchar
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"account_id" varchar,
	"type" varchar,
	"lead_source" varchar,
	"amount" numeric NOT NULL,
	"close_date" timestamp,
	"stage" varchar NOT NULL,
	"next_step" varchar,
	"probability" integer,
	"forecast_category" varchar,
	"description" text,
	"contact_id" varchar,
	"campaign_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"owner_id" varchar
);
--> statement-breakpoint
CREATE TABLE "crm_opportunity_line_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" varchar NOT NULL,
	"product_id" varchar,
	"price_book_entry_id" varchar,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric NOT NULL,
	"total_price" numeric,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crm_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" varchar,
	"quote_id" varchar,
	"opportunity_id" varchar,
	"order_number" text,
	"status" text DEFAULT 'Draft',
	"total_amount" numeric DEFAULT '0',
	"effective_date" timestamp DEFAULT now(),
	"billing_address" text,
	"shipping_address" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crm_price_book_entries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"price_book_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"unit_price" numeric NOT NULL,
	"is_active" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crm_price_books" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"is_active" integer DEFAULT 1,
	"is_standard" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crm_products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"product_code" varchar,
	"description" text,
	"is_active" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crm_quote_line_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" varchar NOT NULL,
	"product_id" varchar,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric NOT NULL,
	"total_price" numeric,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crm_quotes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" varchar,
	"name" text NOT NULL,
	"quote_number" text,
	"expiration_date" timestamp,
	"status" text DEFAULT 'Draft',
	"total_amount" numeric DEFAULT '0',
	"description" text,
	"bill_to_name" text,
	"bill_to_street" text,
	"bill_to_city" text,
	"bill_to_state" text,
	"bill_to_zip" text,
	"bill_to_country" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"category" varchar,
	"status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_accounts_v2" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_code" varchar NOT NULL,
	"account_name" varchar NOT NULL,
	"account_type" varchar NOT NULL,
	"parent_account_id" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "gl_accounts_v2_account_code_unique" UNIQUE("account_code")
);
--> statement-breakpoint
CREATE TABLE "gl_allocations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"ledger_id" varchar NOT NULL,
	"pool_account_filter" varchar NOT NULL,
	"basis_account_filter" varchar NOT NULL,
	"target_account_pattern" varchar NOT NULL,
	"offset_account" varchar NOT NULL,
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" varchar NOT NULL,
	"entity" varchar NOT NULL,
	"entity_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"ip_address" varchar,
	"session_id" varchar,
	"details" jsonb,
	"before_state" jsonb,
	"after_state" jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gl_balances_v2" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ledger_id" varchar NOT NULL,
	"code_combination_id" varchar NOT NULL,
	"currency_code" varchar NOT NULL,
	"period_name" varchar NOT NULL,
	"period_year" integer,
	"period_num" integer,
	"period_net_dr" numeric(18, 2) DEFAULT '0',
	"period_net_cr" numeric(18, 2) DEFAULT '0',
	"begin_balance" numeric(18, 2) DEFAULT '0',
	"end_balance" numeric(18, 2) DEFAULT '0',
	"translated_flag" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_budget_balances" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"budget_id" varchar NOT NULL,
	"period_name" varchar NOT NULL,
	"code_combination_id" varchar NOT NULL,
	"budget_amount" numeric(18, 2) DEFAULT '0',
	"encumbrance_amount" numeric(18, 2) DEFAULT '0',
	"actual_amount" numeric(18, 2) DEFAULT '0',
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_budget_control_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ledger_id" varchar NOT NULL,
	"rule_name" varchar NOT NULL,
	"control_level" varchar DEFAULT 'Absolute',
	"control_filters" jsonb,
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_budgets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"ledger_id" varchar NOT NULL,
	"status" varchar DEFAULT 'Open',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "gl_budgets_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "gl_coa_structures" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"delimiter" varchar DEFAULT '-',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "gl_coa_structures_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "gl_code_combinations_v2" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar NOT NULL,
	"ledger_id" varchar NOT NULL,
	"segment1" varchar,
	"segment2" varchar,
	"segment3" varchar,
	"segment4" varchar,
	"segment5" varchar,
	"segment6" varchar,
	"segment7" varchar,
	"segment8" varchar,
	"segment9" varchar,
	"segment10" varchar,
	"account_type" varchar,
	"enabled_flag" boolean DEFAULT true,
	"start_date_active" timestamp,
	"end_date_active" timestamp,
	"summary_flag" boolean DEFAULT false,
	CONSTRAINT "gl_code_combinations_v2_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "gl_cross_validation_rules_v2" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ledger_id" varchar NOT NULL,
	"rule_name" varchar NOT NULL,
	"description" text,
	"enabled" boolean DEFAULT true,
	"error_message" text,
	"include_filter" text,
	"exclude_filter" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_currencies" (
	"code" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"symbol" varchar,
	"precision" integer DEFAULT 2,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "gl_daily_rates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_currency" varchar NOT NULL,
	"to_currency" varchar NOT NULL,
	"conversion_date" timestamp NOT NULL,
	"conversion_type" varchar DEFAULT 'Spot',
	"rate" numeric(20, 10) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_data_access_set_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"data_access_set_id" varchar NOT NULL,
	"assigned_by" varchar,
	"assigned_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_data_access_sets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"ledger_id" varchar NOT NULL,
	"access_level" varchar DEFAULT 'Read/Write',
	"segment_security" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "gl_data_access_sets_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "gl_exchange_rates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"currency" varchar NOT NULL,
	"period_name" varchar NOT NULL,
	"rate_to_functional" numeric(20, 10) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_intercompany_rules_v2" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_company" varchar NOT NULL,
	"to_company" varchar NOT NULL,
	"receivable_account_id" varchar NOT NULL,
	"payable_account_id" varchar NOT NULL,
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_journal_approvals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"journal_id" varchar NOT NULL,
	"approver_id" varchar,
	"status" varchar DEFAULT 'Pending',
	"comments" text,
	"action_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_journal_batches" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_name" varchar NOT NULL,
	"description" text,
	"period_id" varchar,
	"status" varchar DEFAULT 'Unposted',
	"total_debit" numeric(18, 2) DEFAULT '0',
	"total_credit" numeric(18, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_journal_lines_v2" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"journal_id" varchar NOT NULL,
	"account_id" varchar NOT NULL,
	"description" text,
	"currency_code" varchar DEFAULT 'USD' NOT NULL,
	"entered_debit" numeric(18, 2),
	"entered_credit" numeric(18, 2),
	"accounted_debit" numeric(18, 2),
	"accounted_credit" numeric(18, 2),
	"exchange_rate" numeric(20, 10) DEFAULT '1',
	"debit" numeric(18, 2) DEFAULT '0',
	"credit" numeric(18, 2) DEFAULT '0'
);
--> statement-breakpoint
CREATE TABLE "gl_journals_v2" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"journal_number" varchar NOT NULL,
	"ledger_id" varchar DEFAULT 'PRIMARY' NOT NULL,
	"batch_id" varchar,
	"period_id" varchar,
	"description" text,
	"currency_code" varchar DEFAULT 'USD' NOT NULL,
	"source" varchar DEFAULT 'Manual',
	"status" varchar DEFAULT 'Draft',
	"approval_status" varchar DEFAULT 'Not Required',
	"reversal_journal_id" varchar,
	"auto_reverse" boolean DEFAULT false,
	"posted_date" timestamp,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "gl_journals_v2_journal_number_unique" UNIQUE("journal_number")
);
--> statement-breakpoint
CREATE TABLE "gl_ledger_relationships" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"primary_ledger_id" varchar NOT NULL,
	"secondary_ledger_id" varchar NOT NULL,
	"relationship_type" varchar NOT NULL,
	"conversion_level" varchar DEFAULT 'JOURNAL',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_ledger_set_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ledger_set_id" varchar NOT NULL,
	"ledger_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_ledger_sets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "gl_ledger_sets_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "gl_ledgers_v2" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"currency_code" varchar DEFAULT 'USD' NOT NULL,
	"calendar_id" varchar,
	"coa_id" varchar,
	"description" text,
	"ledger_category" varchar DEFAULT 'PRIMARY',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "gl_ledgers_v2_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "gl_legal_entities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"tax_id" varchar,
	"ledger_id" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "gl_legal_entities_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "gl_periods" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_name" varchar NOT NULL,
	"ledger_id" varchar DEFAULT 'PRIMARY' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"fiscal_year" integer NOT NULL,
	"status" varchar DEFAULT 'Open'
);
--> statement-breakpoint
CREATE TABLE "gl_recurring_journals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"ledger_id" varchar NOT NULL,
	"currency_code" varchar DEFAULT 'USD',
	"schedule_type" varchar NOT NULL,
	"next_run_date" timestamp NOT NULL,
	"last_run_date" timestamp,
	"status" varchar DEFAULT 'Active',
	"journal_template" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_fsg_cols" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" varchar NOT NULL,
	"column_number" integer NOT NULL,
	"column_header" varchar NOT NULL,
	"amount_type" varchar DEFAULT 'PTD',
	"currency_type" varchar DEFAULT 'Functional',
	"period_offset" integer DEFAULT 0,
	"ledger_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_fsg_defs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"ledger_id" varchar,
	"chart_of_accounts_id" varchar,
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_fsg_rows" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" varchar NOT NULL,
	"row_number" integer NOT NULL,
	"description" varchar NOT NULL,
	"row_type" varchar DEFAULT 'DETAIL' NOT NULL,
	"account_filter_min" varchar,
	"account_filter_max" varchar,
	"segment_filter" varchar,
	"calculation_formula" varchar,
	"indent_level" integer DEFAULT 0,
	"inverse_sign" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_revaluation_entries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ledger_id" varchar NOT NULL,
	"period_name" varchar NOT NULL,
	"currency" varchar NOT NULL,
	"amount" numeric(20, 10) NOT NULL,
	"fx_rate" numeric(20, 10) NOT NULL,
	"gain_loss" numeric(20, 10) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_revaluations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ledger_id" varchar NOT NULL,
	"period_name" varchar NOT NULL,
	"currency_code" varchar NOT NULL,
	"rate_type" varchar DEFAULT 'Spot' NOT NULL,
	"unrealized_gain_loss_account_id" varchar NOT NULL,
	"status" varchar DEFAULT 'Draft',
	"journal_batch_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_segment_hierarchies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value_set_id" varchar NOT NULL,
	"parent_value" varchar NOT NULL,
	"child_value" varchar NOT NULL,
	"tree_name" varchar DEFAULT 'DEFAULT',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_segment_values_v2" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value_set_id" varchar NOT NULL,
	"value" varchar NOT NULL,
	"description" text,
	"parent_value_id" varchar,
	"is_summary" boolean DEFAULT false,
	"enabled_flag" boolean DEFAULT true,
	"start_date_active" timestamp,
	"end_date_active" timestamp,
	"account_type" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_segments_v2" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coa_structure_id" varchar NOT NULL,
	"segment_name" varchar NOT NULL,
	"segment_number" integer NOT NULL,
	"column_name" varchar NOT NULL,
	"value_set_id" varchar NOT NULL,
	"prompt" varchar NOT NULL,
	"display_width" integer DEFAULT 20,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_value_sets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"validation_type" varchar DEFAULT 'Independent',
	"format_type" varchar DEFAULT 'Char',
	"max_length" integer,
	"uppercase_only" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "gl_value_sets_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" varchar NOT NULL,
	"customer_id" varchar,
	"amount" numeric(18, 2) NOT NULL,
	"due_date" timestamp,
	"status" varchar DEFAULT 'draft',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"email" varchar,
	"department" varchar,
	"hire_date" timestamp,
	"status" varchar DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "employees_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "payroll" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" varchar NOT NULL,
	"salary" numeric(18, 2),
	"bonus" numeric(18, 2) DEFAULT '0',
	"deductions" numeric(18, 2) DEFAULT '0',
	"net_pay" numeric(18, 2),
	"pay_period" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payroll_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"pay_period" varchar DEFAULT 'monthly',
	"pay_day" integer,
	"tax_settings" jsonb,
	"benefit_settings" jsonb,
	"overtime_rules" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bom" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bom_number" varchar NOT NULL,
	"product_id" varchar,
	"quantity" integer,
	"status" varchar DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "bom_bom_number_unique" UNIQUE("bom_number")
);
--> statement-breakpoint
CREATE TABLE "production_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar NOT NULL,
	"product_id" varchar,
	"quantity" integer,
	"status" varchar DEFAULT 'planned',
	"scheduled_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "production_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "work_centers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"capacity" integer,
	"status" varchar DEFAULT 'active',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_name" varchar NOT NULL,
	"sku" varchar,
	"quantity" integer DEFAULT 0,
	"reorder_level" integer,
	"location" varchar,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "inventory_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "purchase_order_lines" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"po_header_id" varchar NOT NULL,
	"line_number" integer NOT NULL,
	"item_id" varchar,
	"description" varchar,
	"quantity" numeric(18, 4) NOT NULL,
	"unit_price" numeric(18, 4) NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar NOT NULL,
	"supplier_id" varchar,
	"total_amount" numeric(18, 2),
	"status" varchar DEFAULT 'draft',
	"due_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "purchase_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar,
	"phone" varchar,
	"address" text,
	"status" varchar DEFAULT 'active',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "issues" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"sprint_id" varchar,
	"title" varchar NOT NULL,
	"description" text,
	"type" varchar DEFAULT 'task',
	"status" varchar DEFAULT 'todo',
	"priority" varchar DEFAULT 'medium',
	"assignee_id" varchar,
	"reporter_id" varchar,
	"story_points" integer,
	"due_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects2" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"status" varchar DEFAULT 'active',
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sprints" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"goal" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"status" varchar DEFAULT 'planned',
	"velocity" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "work_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"status" varchar DEFAULT 'open',
	"assigned_to" varchar,
	"due_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "field_service_jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_number" varchar NOT NULL,
	"customer_id" varchar,
	"technician_id" varchar,
	"job_type" varchar,
	"status" varchar DEFAULT 'scheduled',
	"priority" varchar DEFAULT 'medium',
	"scheduled_date" timestamp,
	"completed_date" timestamp,
	"location" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketplace_app_dependencies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" varchar NOT NULL,
	"depends_on_app_id" varchar NOT NULL,
	"min_version" varchar,
	"max_version" varchar,
	"is_required" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketplace_app_versions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" varchar NOT NULL,
	"version" varchar NOT NULL,
	"changelog" text,
	"release_notes" text,
	"min_erp_version" varchar,
	"max_erp_version" varchar,
	"download_url" varchar,
	"file_size" integer,
	"checksum" varchar,
	"is_latest" boolean DEFAULT false,
	"status" varchar DEFAULT 'pending',
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketplace_apps" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"developer_id" varchar NOT NULL,
	"category_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"short_description" varchar NOT NULL,
	"full_description" text NOT NULL,
	"logo_url" varchar,
	"screenshots" text[],
	"price_type" varchar DEFAULT 'free',
	"price" numeric(18, 2) DEFAULT '0',
	"currency" varchar DEFAULT 'USD',
	"tags" text[],
	"features" jsonb,
	"compatibility" jsonb,
	"permissions" text[],
	"status" varchar DEFAULT 'draft',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"published_at" timestamp,
	"install_count" integer DEFAULT 0,
	"average_rating" numeric(3, 2) DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"supported_industries" text[],
	"subscription_price_monthly" numeric(18, 2),
	"subscription_price_yearly" numeric(18, 2),
	"total_revenue" numeric(18, 2) DEFAULT '0',
	"deployment_type" varchar DEFAULT 'cloud',
	"demo_url" varchar,
	"documentation_url" varchar,
	"github_url" varchar,
	"support_url" varchar,
	"support_email" varchar,
	"license_type" varchar DEFAULT 'proprietary',
	"featured_order" integer,
	CONSTRAINT "marketplace_apps_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "marketplace_audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar NOT NULL,
	"entity_id" varchar NOT NULL,
	"action" varchar NOT NULL,
	"actor_id" varchar NOT NULL,
	"actor_role" varchar,
	"previous_state" jsonb,
	"new_state" jsonb,
	"metadata" jsonb,
	"ip_address" varchar,
	"user_agent" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketplace_categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"description" text,
	"icon" varchar,
	"parent_id" varchar,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "marketplace_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "marketplace_commission_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar DEFAULT 'global',
	"target_id" varchar,
	"commission_rate" numeric(5, 2) DEFAULT '0',
	"min_commission" numeric(18, 2),
	"max_commission" numeric(18, 2),
	"is_active" boolean DEFAULT true,
	"effective_from" timestamp DEFAULT now(),
	"effective_to" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketplace_developers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"website" varchar,
	"support_email" varchar,
	"status" varchar DEFAULT 'pending',
	"verified" boolean DEFAULT false,
	"total_revenue" numeric(18, 2) DEFAULT '0',
	"total_payouts" numeric(18, 2) DEFAULT '0',
	"total_apps" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketplace_installations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" varchar NOT NULL,
	"app_version_id" varchar,
	"tenant_id" varchar NOT NULL,
	"installed_by" varchar NOT NULL,
	"status" varchar DEFAULT 'active',
	"installed_at" timestamp DEFAULT now(),
	"uninstalled_at" timestamp,
	"settings" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketplace_licenses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" varchar NOT NULL,
	"app_version_id" varchar,
	"tenant_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"transaction_id" varchar,
	"license_key" varchar,
	"license_type" varchar NOT NULL,
	"status" varchar DEFAULT 'active',
	"seats" integer DEFAULT 0,
	"used_seats" integer DEFAULT 0,
	"valid_from" timestamp DEFAULT now(),
	"valid_until" timestamp,
	"grace_period_days" integer DEFAULT 7,
	"grace_period_end" timestamp,
	"last_validated_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "marketplace_licenses_license_key_unique" UNIQUE("license_key")
);
--> statement-breakpoint
CREATE TABLE "marketplace_payouts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"developer_id" varchar NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"currency" varchar DEFAULT 'USD',
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"status" varchar DEFAULT 'pending',
	"payment_method" varchar,
	"payment_reference" varchar,
	"paid_at" timestamp,
	"statement_url" varchar,
	"transaction_count" integer DEFAULT 0,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketplace_reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" varchar NOT NULL,
	"app_version_id" varchar,
	"user_id" varchar NOT NULL,
	"tenant_id" varchar NOT NULL,
	"rating" integer NOT NULL,
	"title" varchar,
	"content" text,
	"developer_response" text,
	"developer_response_at" timestamp,
	"status" varchar DEFAULT 'published',
	"helpful_count" integer DEFAULT 0,
	"reported_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketplace_subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" varchar NOT NULL,
	"tenant_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"plan" varchar NOT NULL,
	"status" varchar DEFAULT 'active',
	"amount" numeric(18, 2) NOT NULL,
	"currency" varchar DEFAULT 'USD',
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancelled_at" timestamp,
	"cancel_reason" text,
	"auto_renew" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketplace_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" varchar NOT NULL,
	"developer_id" varchar NOT NULL,
	"tenant_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"gross_amount" numeric(18, 2) NOT NULL,
	"platform_commission_rate" numeric(5, 2) DEFAULT '0',
	"platform_commission" numeric(18, 2) DEFAULT '0',
	"developer_revenue" numeric(18, 2) NOT NULL,
	"tax" numeric(18, 2) DEFAULT '0',
	"currency" varchar DEFAULT 'USD',
	"payment_method" varchar,
	"payment_reference" varchar,
	"status" varchar DEFAULT 'completed',
	"invoice_url" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_postings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buyer_id" varchar NOT NULL,
	"category_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"budget_min" numeric(10, 2),
	"budget_max" numeric(10, 2),
	"currency" varchar DEFAULT 'USD',
	"deadline" timestamp,
	"status" varchar DEFAULT 'open',
	"skills" text[],
	"urgency" varchar DEFAULT 'normal',
	"total_proposals" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_proposals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_posting_id" varchar NOT NULL,
	"provider_id" varchar NOT NULL,
	"package_id" varchar,
	"proposal_message" text NOT NULL,
	"bid_amount" numeric(10, 2) NOT NULL,
	"estimated_delivery_days" integer NOT NULL,
	"status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"icon" varchar,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"package_id" varchar NOT NULL,
	"buyer_id" varchar NOT NULL,
	"provider_id" varchar NOT NULL,
	"status" varchar DEFAULT 'pending',
	"price" numeric(10, 2) NOT NULL,
	"requirements" text,
	"delivery_notes" text,
	"delivered_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_packages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar NOT NULL,
	"category_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"delivery_days" integer DEFAULT 7,
	"status" varchar DEFAULT 'active',
	"total_orders" integer DEFAULT 0,
	"average_rating" numeric(3, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"reviewer_id" varchar NOT NULL,
	"provider_id" varchar NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_ai_recommendations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flag_id" varchar NOT NULL,
	"content_analysis" jsonb,
	"severity_score" numeric(3, 2),
	"suggested_action" varchar,
	"confidence" numeric(3, 2),
	"reasoning" text,
	"categories" text[],
	"processing_time" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_badge_progress" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"badge_category" varchar NOT NULL,
	"current_count" integer DEFAULT 0,
	"current_level" varchar DEFAULT 'none',
	"unlocked_at" timestamp,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_comments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" varchar NOT NULL,
	"parent_id" varchar,
	"author_id" varchar NOT NULL,
	"content" text NOT NULL,
	"upvotes" integer DEFAULT 0,
	"downvotes" integer DEFAULT 0,
	"is_accepted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_flags" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" varchar NOT NULL,
	"target_type" varchar NOT NULL,
	"target_id" varchar NOT NULL,
	"reason" varchar NOT NULL,
	"details" text,
	"status" varchar DEFAULT 'pending',
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"action_taken" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_moderation_actions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"moderator_id" varchar NOT NULL,
	"target_user_id" varchar,
	"action_type" varchar NOT NULL,
	"reason" text,
	"target_type" varchar,
	"target_id" varchar,
	"duration" integer,
	"flag_id" varchar,
	"ai_recommendation_id" varchar,
	"anomaly_id" varchar,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"space_id" varchar NOT NULL,
	"author_id" varchar NOT NULL,
	"post_type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"content" text NOT NULL,
	"is_pinned" boolean DEFAULT false,
	"is_locked" boolean DEFAULT false,
	"upvotes" integer DEFAULT 0,
	"downvotes" integer DEFAULT 0,
	"view_count" integer DEFAULT 0,
	"answer_count" integer DEFAULT 0,
	"accepted_answer_id" varchar,
	"tags" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_rate_limits" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"action_type" varchar NOT NULL,
	"action_count" integer DEFAULT 0,
	"window_start" timestamp DEFAULT now(),
	"is_throttled" boolean DEFAULT false,
	"throttle_expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_space_memberships" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"space_id" varchar NOT NULL,
	"role" varchar DEFAULT 'member',
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_spaces" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"description" text,
	"icon" varchar,
	"posting_guidelines" text,
	"allowed_post_types" text[],
	"reputation_weight" numeric(3, 2) DEFAULT '1.0',
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "community_spaces_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "community_vote_anomalies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"anomaly_type" varchar NOT NULL,
	"user_id" varchar,
	"related_user_ids" text[],
	"target_id" varchar,
	"target_type" varchar,
	"severity" varchar DEFAULT 'medium',
	"evidence" jsonb,
	"status" varchar DEFAULT 'pending',
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"action_taken" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_vote_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"voter_id" varchar NOT NULL,
	"target_type" varchar NOT NULL,
	"target_id" varchar NOT NULL,
	"vote_type" varchar NOT NULL,
	"ip_hash" varchar,
	"user_agent" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_votes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"target_type" varchar NOT NULL,
	"target_id" varchar NOT NULL,
	"vote_type" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reputation_dimensions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"technical_skill" integer DEFAULT 0,
	"knowledge_sharing" integer DEFAULT 0,
	"quality_accuracy" integer DEFAULT 0,
	"consistency" integer DEFAULT 0,
	"community_trust" integer DEFAULT 0,
	"service_reliability" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "reputation_dimensions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "reputation_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"action_type" varchar NOT NULL,
	"points" integer NOT NULL,
	"source_type" varchar,
	"source_id" varchar,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_earned_badges" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"badge_id" varchar NOT NULL,
	"earned_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_trust_levels" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"trust_level" integer DEFAULT 0,
	"total_reputation" integer DEFAULT 0,
	"posts_today" integer DEFAULT 0,
	"answers_today" integer DEFAULT 0,
	"spaces_joined_today" integer DEFAULT 0,
	"last_reset_at" timestamp DEFAULT now(),
	"last_calculated_at" timestamp DEFAULT now(),
	"is_shadow_banned" boolean DEFAULT false,
	"ban_expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_trust_levels_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "education_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"assignment_id" varchar NOT NULL,
	"course_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"due_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "education_assignments_assignment_id_unique" UNIQUE("assignment_id")
);
--> statement-breakpoint
CREATE TABLE "education_attendance" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"student_id" varchar NOT NULL,
	"course_id" varchar,
	"attendance_date" timestamp,
	"status" varchar DEFAULT 'PRESENT',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "education_billing" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"invoice_id" varchar NOT NULL,
	"student_id" varchar NOT NULL,
	"amount" numeric,
	"due_date" timestamp,
	"status" varchar DEFAULT 'PENDING',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "education_billing_invoice_id_unique" UNIQUE("invoice_id")
);
--> statement-breakpoint
CREATE TABLE "education_courses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"course_id" varchar NOT NULL,
	"course_name" varchar NOT NULL,
	"description" text,
	"instructor" varchar,
	"credits" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "education_courses_course_id_unique" UNIQUE("course_id")
);
--> statement-breakpoint
CREATE TABLE "education_enrollments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"student_id" varchar NOT NULL,
	"course_id" varchar NOT NULL,
	"enrollment_date" timestamp,
	"status" varchar DEFAULT 'ENROLLED',
	"grade" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "education_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"event_id" varchar NOT NULL,
	"event_name" varchar NOT NULL,
	"event_date" timestamp,
	"capacity" integer,
	"status" varchar DEFAULT 'SCHEDULED',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "education_events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE "education_grades" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"student_id" varchar NOT NULL,
	"course_id" varchar NOT NULL,
	"score" integer,
	"grade" varchar,
	"grade_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "education_students" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"student_id" varchar NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"email" varchar,
	"enrollment_date" timestamp,
	"status" varchar DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "education_students_student_id_unique" UNIQUE("student_id")
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"company" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"website" varchar,
	"type" varchar DEFAULT 'partner' NOT NULL,
	"tier" varchar DEFAULT 'silver',
	"description" text,
	"logo" varchar,
	"specializations" text[],
	"is_active" boolean DEFAULT true,
	"is_approved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copilot_conversations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"title" varchar,
	"status" varchar DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copilot_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" varchar NOT NULL,
	"role" varchar,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mobile_devices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"device_id" varchar NOT NULL,
	"device_name" varchar,
	"platform" varchar,
	"push_token" varchar,
	"last_sync_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "offline_syncs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" varchar NOT NULL,
	"entity_type" varchar NOT NULL,
	"entity_id" varchar NOT NULL,
	"action" varchar NOT NULL,
	"data" jsonb,
	"sync_status" varchar DEFAULT 'pending',
	"synced_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bi_dashboards" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"layout" jsonb,
	"widgets" jsonb,
	"filters" jsonb,
	"is_public" boolean DEFAULT false,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"module" varchar,
	"type" varchar,
	"category" varchar,
	"config" jsonb,
	"is_favorite" boolean DEFAULT false,
	"is_public" boolean DEFAULT false,
	"created_by" varchar,
	"last_run_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "smart_views" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"filters" jsonb DEFAULT '[]'::jsonb,
	"sort_by" jsonb DEFAULT '[]'::jsonb,
	"visible_columns" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "time_series_data" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"series_name" varchar NOT NULL,
	"data_point" timestamp NOT NULL,
	"value" numeric(18, 4),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "budget_allocations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"department" varchar,
	"category" varchar,
	"fiscal_year" varchar,
	"allocated_amount" numeric(18, 2),
	"spent_amount" numeric(18, 2) DEFAULT '0',
	"remaining_amount" numeric(18, 2),
	"status" varchar DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forecast_models" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar NOT NULL,
	"parameters" jsonb,
	"accuracy" numeric(5, 2),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "revenue_forecasts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"period" varchar NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"forecast_amount" numeric(18, 2),
	"actual_amount" numeric(18, 2),
	"variance" numeric(18, 2),
	"status" varchar DEFAULT 'draft',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scenario_variables" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_id" varchar NOT NULL,
	"variable_name" varchar NOT NULL,
	"base_value" numeric(18, 4),
	"adjusted_value" numeric(18, 4),
	"adjustment_type" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scenarios" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"type" varchar,
	"baseline_id" varchar,
	"status" varchar DEFAULT 'draft',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "connector_instances" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"connector_id" varchar NOT NULL,
	"tenant_id" varchar NOT NULL,
	"config" jsonb,
	"credentials" jsonb,
	"status" varchar DEFAULT 'active',
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "connectors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar NOT NULL,
	"config" jsonb,
	"status" varchar DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "data_lakes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"storage_type" varchar,
	"connection_config" jsonb,
	"status" varchar DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "etl_pipelines" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"source_config" jsonb,
	"transform_config" jsonb,
	"destination_config" jsonb,
	"schedule" varchar,
	"status" varchar DEFAULT 'active',
	"last_run_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"connector_instance_id" varchar NOT NULL,
	"event_type" varchar NOT NULL,
	"payload" jsonb,
	"status" varchar DEFAULT 'pending',
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "abac_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"resource" varchar NOT NULL,
	"action" varchar NOT NULL,
	"conditions" jsonb,
	"effect" varchar DEFAULT 'allow',
	"priority" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "app_installations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" varchar NOT NULL,
	"tenant_id" varchar NOT NULL,
	"installed_by" varchar NOT NULL,
	"status" varchar DEFAULT 'active',
	"installed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "app_reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"rating" integer NOT NULL,
	"title" varchar,
	"content" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "apps" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"version" varchar,
	"status" varchar DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "compliance_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"framework" varchar NOT NULL,
	"settings" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "encrypted_fields" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar NOT NULL,
	"entity_id" varchar NOT NULL,
	"field_name" varchar NOT NULL,
	"encrypted_value" text,
	"key_version" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"name" varchar NOT NULL,
	"description" text,
	"permissions" jsonb,
	"is_system" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_actions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module" varchar NOT NULL,
	"action_name" varchar NOT NULL,
	"description" text,
	"required_permissions" jsonb,
	"input_schema" jsonb,
	"is_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "ai_actions_action_name_unique" UNIQUE("action_name")
);
--> statement-breakpoint
CREATE TABLE "ai_audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"action_name" varchar NOT NULL,
	"input_prompt" text,
	"structured_intent" jsonb,
	"status" varchar NOT NULL,
	"error_message" text,
	"execution_time_ms" integer,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_credits" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"total_mined" integer DEFAULT 0,
	"last_daily_bonus" timestamp,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_actions" (
	"code" text PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"required_permissions" jsonb,
	"parameters_schema" jsonb NOT NULL,
	"is_enabled" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "agent_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"execution_id" integer,
	"step_number" integer NOT NULL,
	"message" text NOT NULL,
	"action_type" text NOT NULL,
	"data_snapshot" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_executions" (
	"id" serial PRIMARY KEY NOT NULL,
	"intent_text" text NOT NULL,
	"action_code" text,
	"parameters" jsonb,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"confidence_score" numeric DEFAULT '0',
	"executed_by" text DEFAULT 'system',
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"invoice_id" varchar,
	"amount" numeric(18, 2) NOT NULL,
	"currency" varchar DEFAULT 'USD',
	"status" varchar DEFAULT 'pending',
	"payment_method" varchar,
	"transaction_id" varchar,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"price" numeric(18, 2),
	"billing_period" varchar DEFAULT 'monthly',
	"features" jsonb,
	"limits" jsonb,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"plan_id" varchar NOT NULL,
	"status" varchar DEFAULT 'active',
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "developer_spotlight" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"developer_id" varchar NOT NULL,
	"featured_reason" text,
	"is_trending" boolean DEFAULT false,
	"is_new" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"display_order" integer DEFAULT 0,
	"featured_from" timestamp DEFAULT now(),
	"featured_until" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "training_filter_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filter_type" varchar NOT NULL,
	"filter_value" varchar NOT NULL,
	"description" text,
	"requested_by" varchar NOT NULL,
	"status" varchar DEFAULT 'pending',
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "training_resource_likes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "training_resources" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"resource_url" varchar,
	"thumbnail_url" varchar,
	"duration" varchar,
	"difficulty" varchar DEFAULT 'beginner',
	"modules" text[],
	"industries" text[],
	"apps" text[],
	"tags" text[],
	"submitted_by" varchar NOT NULL,
	"status" varchar DEFAULT 'pending',
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"review_notes" text,
	"likes" integer DEFAULT 0,
	"views" integer DEFAULT 0,
	"featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "badge_definitions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"icon" varchar,
	"category" varchar NOT NULL,
	"points" integer DEFAULT 10,
	"criteria" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "badge_definitions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_activity_points" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"activity_type" varchar NOT NULL,
	"points" integer DEFAULT 0,
	"description" text,
	"reference_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"badge_id" varchar NOT NULL,
	"badge_name" varchar NOT NULL,
	"badge_description" text,
	"badge_icon" varchar,
	"badge_category" varchar,
	"points" integer DEFAULT 0,
	"earned_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_dashboard_widgets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"widget_type" varchar NOT NULL,
	"app_id" varchar,
	"title" varchar NOT NULL,
	"config" jsonb,
	"position" integer DEFAULT 0,
	"size" varchar DEFAULT 'medium',
	"is_visible" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ar_revenue_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"schedule_date" timestamp NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'Pending'
);
--> statement-breakpoint
CREATE TABLE "cash_bank_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"account_number" varchar(100) NOT NULL,
	"bank_name" varchar(255) NOT NULL,
	"currency" varchar(10) DEFAULT 'USD',
	"swift_code" varchar(50),
	"gl_account_id" integer,
	"current_balance" numeric(12, 2) DEFAULT '0',
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cash_statement_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"bank_account_id" integer NOT NULL,
	"transaction_date" timestamp NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"description" text,
	"reference_number" varchar(100),
	"reconciled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cash_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"bank_account_id" integer NOT NULL,
	"source_module" varchar(20) NOT NULL,
	"source_id" integer NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"transaction_date" timestamp DEFAULT now(),
	"reference" varchar(100),
	"status" varchar(20) DEFAULT 'Unreconciled'
);
--> statement-breakpoint
CREATE TABLE "fa_additions" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_number" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"tag_number" varchar(50),
	"category_id" integer NOT NULL,
	"manufacturer" varchar(100),
	"model" varchar(100),
	"serial_number" varchar(100),
	"date_placed_in_service" timestamp NOT NULL,
	"original_cost" numeric(12, 2) NOT NULL,
	"salvage_value" numeric(12, 2) DEFAULT '0',
	"units" integer DEFAULT 1,
	"status" varchar(30) DEFAULT 'Active',
	"location" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "fa_additions_asset_number_unique" UNIQUE("asset_number")
);
--> statement-breakpoint
CREATE TABLE "fa_asset_books" (
	"book_type_code" varchar(30) PRIMARY KEY NOT NULL,
	"book_name" varchar(100) NOT NULL,
	"description" text,
	"current_open_period" varchar(20),
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fa_books" (
	"asset_id" integer NOT NULL,
	"book_type_code" varchar(30) NOT NULL,
	"cost" numeric(12, 2) NOT NULL,
	"depreciate_flag" boolean DEFAULT true,
	"method_code" varchar(30) NOT NULL,
	"life_in_months" integer NOT NULL,
	"date_placed_in_service" timestamp NOT NULL,
	"ytd_depreciation" numeric(12, 2) DEFAULT '0',
	"depreciation_reserve" numeric(12, 2) DEFAULT '0',
	"net_book_value" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "fa_books_asset_id_book_type_code_pk" PRIMARY KEY("asset_id","book_type_code")
);
--> statement-breakpoint
CREATE TABLE "fa_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"major_category" varchar(100),
	"default_life_months" integer,
	"default_method_code" varchar(30),
	"active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "fa_depreciation_summary" (
	"asset_id" integer NOT NULL,
	"book_type_code" varchar(30) NOT NULL,
	"period_name" varchar(20) NOT NULL,
	"depreciation_amount" numeric(12, 2) NOT NULL,
	"ytd_depreciation" numeric(12, 2) NOT NULL,
	"depreciation_reserve" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "fa_depreciation_summary_asset_id_book_type_code_period_name_pk" PRIMARY KEY("asset_id","book_type_code","period_name")
);
--> statement-breakpoint
CREATE TABLE "fa_transaction_headers" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"book_type_code" varchar(30) NOT NULL,
	"transaction_type" varchar(30) NOT NULL,
	"transaction_date" timestamp DEFAULT now(),
	"date_effective" timestamp,
	"amount" numeric(12, 2) DEFAULT '0',
	"comments" text
);
--> statement-breakpoint
CREATE TABLE "sla_accounting_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar NOT NULL,
	"name" varchar NOT NULL,
	"event_class_id" varchar,
	"rule_type" varchar NOT NULL,
	"segment_name" varchar,
	"source_type" varchar NOT NULL,
	"constant_value" varchar,
	"mapping_set_id" varchar,
	"source_attribute" varchar,
	CONSTRAINT "sla_accounting_rules_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sla_event_classes" (
	"id" varchar PRIMARY KEY NOT NULL,
	"application_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"enabled_flag" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "sla_journal_headers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ledger_id" varchar NOT NULL,
	"event_class_id" varchar,
	"entity_id" varchar NOT NULL,
	"entity_table" varchar NOT NULL,
	"event_date" timestamp NOT NULL,
	"gl_date" timestamp NOT NULL,
	"currency_code" varchar NOT NULL,
	"status" varchar DEFAULT 'Draft',
	"completed_flag" boolean DEFAULT false,
	"description" text,
	"transfer_status" varchar DEFAULT 'Not Transferred',
	"gl_journal_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sla_journal_lines" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"header_id" varchar NOT NULL,
	"line_number" integer NOT NULL,
	"accounting_class" varchar NOT NULL,
	"code_combination_id" varchar,
	"entered_dr" varchar,
	"entered_cr" varchar,
	"accounted_dr" varchar,
	"accounted_cr" varchar,
	"currency_code" varchar NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "sla_mapping_set_values" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mapping_set_id" varchar NOT NULL,
	"input_value" varchar NOT NULL,
	"output_value" varchar NOT NULL,
	"start_date_active" timestamp,
	"end_date_active" timestamp
);
--> statement-breakpoint
CREATE TABLE "sla_mapping_sets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"input_type" varchar NOT NULL,
	"output_type" varchar NOT NULL,
	CONSTRAINT "sla_mapping_sets_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "crm_case_comments" ADD CONSTRAINT "crm_case_comments_case_id_crm_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."crm_cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_cases" ADD CONSTRAINT "crm_cases_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_cases" ADD CONSTRAINT "crm_cases_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunity_line_items" ADD CONSTRAINT "crm_opportunity_line_items_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunity_line_items" ADD CONSTRAINT "crm_opportunity_line_items_product_id_crm_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."crm_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_orders" ADD CONSTRAINT "crm_orders_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_orders" ADD CONSTRAINT "crm_orders_quote_id_crm_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."crm_quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_orders" ADD CONSTRAINT "crm_orders_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_quote_line_items" ADD CONSTRAINT "crm_quote_line_items_quote_id_crm_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."crm_quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_quote_line_items" ADD CONSTRAINT "crm_quote_line_items_product_id_crm_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."crm_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_quotes" ADD CONSTRAINT "crm_quotes_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_audit_logs" ADD CONSTRAINT "agent_audit_logs_execution_id_agent_executions_id_fk" FOREIGN KEY ("execution_id") REFERENCES "public"."agent_executions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sla_accounting_rules" ADD CONSTRAINT "sla_accounting_rules_event_class_id_sla_event_classes_id_fk" FOREIGN KEY ("event_class_id") REFERENCES "public"."sla_event_classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sla_accounting_rules" ADD CONSTRAINT "sla_accounting_rules_mapping_set_id_sla_mapping_sets_id_fk" FOREIGN KEY ("mapping_set_id") REFERENCES "public"."sla_mapping_sets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sla_journal_headers" ADD CONSTRAINT "sla_journal_headers_ledger_id_gl_ledgers_v2_id_fk" FOREIGN KEY ("ledger_id") REFERENCES "public"."gl_ledgers_v2"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sla_journal_headers" ADD CONSTRAINT "sla_journal_headers_event_class_id_sla_event_classes_id_fk" FOREIGN KEY ("event_class_id") REFERENCES "public"."sla_event_classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sla_journal_lines" ADD CONSTRAINT "sla_journal_lines_header_id_sla_journal_headers_id_fk" FOREIGN KEY ("header_id") REFERENCES "public"."sla_journal_headers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sla_journal_lines" ADD CONSTRAINT "sla_journal_lines_code_combination_id_gl_code_combinations_v2_id_fk" FOREIGN KEY ("code_combination_id") REFERENCES "public"."gl_code_combinations_v2"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sla_mapping_set_values" ADD CONSTRAINT "sla_mapping_set_values_mapping_set_id_sla_mapping_sets_id_fk" FOREIGN KEY ("mapping_set_id") REFERENCES "public"."sla_mapping_sets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");