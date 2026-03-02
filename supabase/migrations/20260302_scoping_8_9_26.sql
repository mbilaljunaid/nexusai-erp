-- =============================================================
-- Enterprise Scoping: CRM (Module 8) + EPM (Modules 9, 26)
-- =============================================================

-- ── Module 8: CRM → Business Unit scoping ──────────────────

ALTER TABLE leads         ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR(36);
ALTER TABLE accounts      ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR(36);
ALTER TABLE contacts      ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR(36);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR(36);
ALTER TABLE campaigns     ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR(36);
ALTER TABLE crm_quotes    ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR(36);
ALTER TABLE crm_orders    ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR(36);
ALTER TABLE crm_cases     ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR(36);
ALTER TABLE crm_commissions ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR(36);

CREATE INDEX IF NOT EXISTS idx_leads_bu         ON leads(ent_business_unit_id);
CREATE INDEX IF NOT EXISTS idx_accounts_bu      ON accounts(ent_business_unit_id);
CREATE INDEX IF NOT EXISTS idx_contacts_bu      ON contacts(ent_business_unit_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_bu ON opportunities(ent_business_unit_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_bu     ON campaigns(ent_business_unit_id);
CREATE INDEX IF NOT EXISTS idx_crm_quotes_bu    ON crm_quotes(ent_business_unit_id);
CREATE INDEX IF NOT EXISTS idx_crm_orders_bu    ON crm_orders(ent_business_unit_id);
CREATE INDEX IF NOT EXISTS idx_crm_cases_bu     ON crm_cases(ent_business_unit_id);
CREATE INDEX IF NOT EXISTS idx_crm_commissions_bu ON crm_commissions(ent_business_unit_id);

-- ── Modules 9 & 26: EPM → Ledger scoping ───────────────────

ALTER TABLE budgets        ADD COLUMN IF NOT EXISTS ent_ledger_id VARCHAR(36);
ALTER TABLE plan_scenarios ADD COLUMN IF NOT EXISTS ent_ledger_id VARCHAR(36);
ALTER TABLE plan_versions  ADD COLUMN IF NOT EXISTS ent_ledger_id VARCHAR(36);
ALTER TABLE plan_units     ADD COLUMN IF NOT EXISTS ent_ledger_id VARCHAR(36);

CREATE INDEX IF NOT EXISTS idx_budgets_ledger        ON budgets(ent_ledger_id);
CREATE INDEX IF NOT EXISTS idx_plan_scenarios_ledger ON plan_scenarios(ent_ledger_id);
CREATE INDEX IF NOT EXISTS idx_plan_versions_ledger  ON plan_versions(ent_ledger_id);
CREATE INDEX IF NOT EXISTS idx_plan_units_ledger     ON plan_units(ent_ledger_id);
