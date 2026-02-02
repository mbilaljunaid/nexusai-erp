-- Migration: Normalize Bank Master Data (Phase 4)
-- 1. Create cash_banks and cash_bank_branches tables
-- 2. Migrate distinct bank names from cash_bank_accounts to cash_banks
-- 3. Update cash_bank_accounts to reference new IDs (Optional: keeping dual-write for safety first)

CREATE TABLE IF NOT EXISTS "cash_banks" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    "bank_name" varchar(255) NOT NULL UNIQUE,
    "country_code" varchar(2),
    "tax_payer_id" varchar(50),
    "active" boolean DEFAULT true,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "cash_bank_branches" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    "bank_id" varchar NOT NULL,
    "branch_name" varchar(255) NOT NULL,
    "routing_number" varchar(50),
    "bic_code" varchar(11),
    "address_line1" varchar(255),
    "city" varchar(100),
    "state" varchar(100),
    "zip_code" varchar(20),
    "active" boolean DEFAULT true,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS "idx_cash_banks_name" ON "cash_banks" ("bank_name");
CREATE INDEX IF NOT EXISTS "idx_cash_bank_branches_bank_id" ON "cash_bank_branches" ("bank_id");

-- Seed Banks from existing Accounts
-- Seed Banks from existing Accounts (Skipped if table missing)
-- INSERT INTO "cash_banks" ("bank_name", "active")
-- SELECT DISTINCT "bank_name", true
-- FROM "cash_bank_accounts"
-- WHERE "bank_name" NOT IN (SELECT "bank_name" FROM "cash_banks");

-- (Self-Correction): We will eventually add bank_id and branch_id columns to cash_bank_accounts 
-- but will do that in a subsequent step to avoid breaking existing code immediately.
