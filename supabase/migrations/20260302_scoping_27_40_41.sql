-- ============================================================
-- Enterprise Scoping: Modules 27, 40, 41
-- Module 27 : Project Portfolio Management (PPM) → Business Unit
-- Module 40 : Project Accounting               → Business Unit
-- Module 41 : Projects Costing                 → Business Unit
-- ============================================================

-- ── Module 27: PPM – ppm_projects ────────────────────────────
ALTER TABLE ppm_projects
    ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR(36);

CREATE INDEX IF NOT EXISTS idx_ppm_projects_bu
    ON ppm_projects (ent_business_unit_id)
    WHERE ent_business_unit_id IS NOT NULL;

-- ── Module 40: Project Accounting – projects2 ─────────────────
ALTER TABLE projects2
    ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR(36);

CREATE INDEX IF NOT EXISTS idx_projects2_bu
    ON projects2 (ent_business_unit_id)
    WHERE ent_business_unit_id IS NOT NULL;

-- ── Module 41: Projects Costing – pa_cost_distribution_lines ──
ALTER TABLE pa_cost_distribution_lines
    ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR(36);

CREATE INDEX IF NOT EXISTS idx_pa_cost_dist_lines_bu
    ON pa_cost_distribution_lines (ent_business_unit_id)
    WHERE ent_business_unit_id IS NOT NULL;
