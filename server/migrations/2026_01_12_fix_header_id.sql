-- Add Header ID to Cash Statement Lines
ALTER TABLE "cash_statement_lines" ADD COLUMN IF NOT EXISTS "header_id" varchar;
