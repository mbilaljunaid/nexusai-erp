-- Add Intraday Flag to Statement Lines (Phase 4)
ALTER TABLE "cash_statement_lines" ADD COLUMN IF NOT EXISTS "is_intraday" boolean DEFAULT false;
