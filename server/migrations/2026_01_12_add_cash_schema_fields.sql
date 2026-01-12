-- Migration: Add missing fields for Cash Management schema
-- File: server/migrations/2026_01_12_add_cash_schema_fields.sql

-- Ensure the tables exist (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cash_bank_accounts') THEN
        RAISE NOTICE 'cash_bank_accounts table does not exist yet, skipping migration.';
    END IF;
END $$;

-- Add columns if they do not exist
ALTER TABLE cash_bank_accounts
    ADD COLUMN IF NOT EXISTS secondary_ledger_id VARCHAR,
    ADD COLUMN IF NOT EXISTS cash_account_ccid INTEGER,
    ADD COLUMN IF NOT EXISTS cash_clearing_ccid INTEGER,
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active',
    ADD COLUMN IF NOT EXISTS pending_data JSONB;

ALTER TABLE cash_zba_structures
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active',
    ADD COLUMN IF NOT EXISTS pending_data JSONB;

-- Add indexes for faster lookup
CREATE INDEX IF NOT EXISTS idx_cash_bank_accounts_status ON cash_bank_accounts (status);
CREATE INDEX IF NOT EXISTS idx_cash_zba_structures_status ON cash_zba_structures (status);

-- Ensure default values for existing rows
UPDATE cash_bank_accounts SET status = 'Active' WHERE status IS NULL;
UPDATE cash_zba_structures SET status = 'Active' WHERE status IS NULL;

COMMIT;
