-- ============================================================
-- p1_cross_cutting.sql
-- Cross-Cutting P1: Feature Flags per-tenant/per-module
-- ============================================================

-- Extend feature_flags table with tenant/module/rollout columns
ALTER TABLE feature_flags
  ADD COLUMN IF NOT EXISTS tenant_id    VARCHAR,          -- NULL = global flag
  ADD COLUMN IF NOT EXISTS module       VARCHAR,          -- e.g. 'AP','AR','GL','HR'
  ADD COLUMN IF NOT EXISTS rollout_pct  INTEGER DEFAULT 100; -- 0–100% gradual rollout

CREATE INDEX IF NOT EXISTS ff_tenant_module_idx
  ON feature_flags (tenant_id, module);

-- Seed core platform feature flags
INSERT INTO feature_flags (name, description, enabled, module, rollout_pct)
VALUES
  ('ap_bullmq_queue',           'Route AP payment processing through BullMQ durable queue',          true,  'AP',  100),
  ('ar_bullmq_queue',           'Route AR lockbox/autoinvoice through BullMQ durable queue',          true,  'AR',  100),
  ('gl_bullmq_queue',           'Route GL posting through BullMQ durable queue',                      true,  'GL',  100),
  ('accounting_close_bullmq',   'Use BullMQ for accounting-close period jobs',                        true,  'GL',  100),
  ('fx_rate_daily_feed',        'Run daily FX rate ingestion from Frankfurter API',                   true,  'FX',  100),
  ('pdf_invoice_generation',    'Generate PDF invoices server-side via PDFKit',                       true,  'AP',  100),
  ('pdf_payslip_generation',    'Generate PDF payslips server-side via PDFKit',                       true,  'HR',  100),
  ('pdf_gl_report',             'Generate PDF GL summary reports',                                    true,  'GL',  100),
  ('audit_before_after_state',  'Capture full before/after state in admin_logs on every mutation',    true,  'ALL', 100),
  ('ai_chat_assistant',         'Enable persistent AI chat assistant in app layout',                  true,  'ALL', 100),
  ('esg_module',                'Enable ESG / Sustainability Planning module',                        true,  'EPM', 100),
  ('bullmq_job_dashboard',      'Show BullMQ job status in admin panel',                             false, 'ALL',   0)
ON CONFLICT (name) DO NOTHING;
