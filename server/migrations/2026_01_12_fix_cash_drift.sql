-- Fix Cash Schema Drift

ALTER TABLE "cash_bank_accounts" ADD COLUMN IF NOT EXISTS "secondary_ledger_id" varchar;
ALTER TABLE "cash_bank_accounts" ADD COLUMN IF NOT EXISTS "cash_account_ccid" integer;
ALTER TABLE "cash_bank_accounts" ADD COLUMN IF NOT EXISTS "cash_clearing_ccid" integer;
ALTER TABLE "cash_bank_accounts" ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'Active';
ALTER TABLE "cash_bank_accounts" ADD COLUMN IF NOT EXISTS "pending_data" jsonb;
