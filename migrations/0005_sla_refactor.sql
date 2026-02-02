CREATE TABLE IF NOT EXISTS "sla_event_types" (
	"id" varchar PRIMARY KEY NOT NULL,
	"event_class_id" varchar NOT NULL REFERENCES "sla_event_classes"("id"),
	"name" varchar NOT NULL,
	"description" text,
	"accounting_flag" boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS "sla_journal_line_types" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar NOT NULL,
	"event_class_id" varchar NOT NULL REFERENCES "sla_event_classes"("id"),
	"name" varchar NOT NULL,
	"balance_type" varchar DEFAULT 'Actual',
	"side" varchar NOT NULL,
	"accounting_class" varchar NOT NULL,
	"account_rule_id" varchar REFERENCES "sla_accounting_rules"("id"),
	"switch_side_flag" boolean DEFAULT false,
	"merge_flag" boolean DEFAULT true
);

ALTER TABLE "sla_journal_headers" ADD COLUMN IF NOT EXISTS "event_type_id" varchar REFERENCES "sla_event_types"("id");
