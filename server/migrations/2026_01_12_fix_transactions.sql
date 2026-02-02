-- Add Description to Cash Transactions
ALTER TABLE "cash_transactions" ADD COLUMN IF NOT EXISTS "description" text;
