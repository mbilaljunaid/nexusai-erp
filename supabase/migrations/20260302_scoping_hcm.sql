-- ============================================================
-- HCM Enterprise Scoping Migration
-- Modules: 6 (Core HR), 10 (ESS/MSS), 15 (HR Analytics),
--          16 (HR Compliance), 21 (LMS), 32 (Talent),
--          34 (Time & Labor), 38 (Payroll), 39 (Recruiting)
-- Scope Type: Legal Entity (ent_legal_entity_id)
-- Note: hr_work_relationships and hr_assignments already scoped
-- ============================================================

-- Core HR tables (Module 6, 10, 34, 38)
ALTER TABLE employees       ADD COLUMN IF NOT EXISTS ent_legal_entity_id VARCHAR(36);
ALTER TABLE payroll          ADD COLUMN IF NOT EXISTS ent_legal_entity_id VARCHAR(36);
ALTER TABLE payroll_configs  ADD COLUMN IF NOT EXISTS ent_legal_entity_id VARCHAR(36);
ALTER TABLE time_entries    ADD COLUMN IF NOT EXISTS ent_legal_entity_id VARCHAR(36);
ALTER TABLE leave_requests  ADD COLUMN IF NOT EXISTS ent_legal_entity_id VARCHAR(36);

-- HR Compliance tables (Module 16)
ALTER TABLE hr_compliance_frameworks ADD COLUMN IF NOT EXISTS ent_legal_entity_id VARCHAR(36);
ALTER TABLE hr_compliance_events     ADD COLUMN IF NOT EXISTS ent_legal_entity_id VARCHAR(36);
ALTER TABLE hr_compliance_violations ADD COLUMN IF NOT EXISTS ent_legal_entity_id VARCHAR(36);

-- HR Analytics tables (Module 15)
ALTER TABLE hr_analytics_snapshots ADD COLUMN IF NOT EXISTS ent_legal_entity_id VARCHAR(36);
ALTER TABLE hr_report_schedules    ADD COLUMN IF NOT EXISTS ent_legal_entity_id VARCHAR(36);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_employees_le          ON employees(ent_legal_entity_id);
CREATE INDEX IF NOT EXISTS idx_payroll_le             ON payroll(ent_legal_entity_id);
CREATE INDEX IF NOT EXISTS idx_payroll_configs_le    ON payroll_configs(ent_legal_entity_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_le       ON time_entries(ent_legal_entity_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_le     ON leave_requests(ent_legal_entity_id);
CREATE INDEX IF NOT EXISTS idx_hr_comp_fw_le         ON hr_compliance_frameworks(ent_legal_entity_id);
CREATE INDEX IF NOT EXISTS idx_hr_comp_ev_le         ON hr_compliance_events(ent_legal_entity_id);
CREATE INDEX IF NOT EXISTS idx_hr_comp_vl_le         ON hr_compliance_violations(ent_legal_entity_id);
CREATE INDEX IF NOT EXISTS idx_hr_analytics_snap_le  ON hr_analytics_snapshots(ent_legal_entity_id);
CREATE INDEX IF NOT EXISTS idx_hr_report_sched_le    ON hr_report_schedules(ent_legal_entity_id);
