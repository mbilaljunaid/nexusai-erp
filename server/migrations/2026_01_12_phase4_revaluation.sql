-- Migration: Add Cash Revaluation History table (Phase 4)

CREATE TABLE IF NOT EXISTS "cash_revaluation_history" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    "bank_account_id" varchar NOT NULL,
    "currency" varchar(10) NOT NULL,
    "revaluation_date" timestamp DEFAULT now(),
    "system_rate" numeric(20, 6) NOT NULL,
    "used_rate" numeric(20, 6) NOT NULL,
    "rate_type" varchar(20) DEFAULT 'Corporate',
    "unrealized_gain_loss" numeric(20, 2) NOT NULL,
    "posted_journal_id" varchar,
    "user_id" varchar DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS "idx_cash_reval_account" ON "cash_revaluation_history" ("bank_account_id");
