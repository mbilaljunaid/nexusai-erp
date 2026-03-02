-- ============================================================
-- Enterprise Scoping: Modules 5, 7, 20, 22
-- Module 5  : Construction Management  → Business Unit
-- Module 7  : Cost Management          → Inventory Org + BU
-- Module 20 : Lease & Contract Mgmt    → Business Unit + Legal Entity
-- Module 22 : EAM / Maintenance        → Inventory Org
-- ============================================================

-- ── Module 5: Construction Management ────────────────────────
ALTER TABLE construction_contracts
    ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR(36);

CREATE INDEX IF NOT EXISTS idx_construction_contracts_bu
    ON construction_contracts (ent_business_unit_id)
    WHERE ent_business_unit_id IS NOT NULL;

-- ── Module 20: Lease & Contract Management ───────────────────
ALTER TABLE lease_headers
    ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR(36),
    ADD COLUMN IF NOT EXISTS ent_legal_entity_id  VARCHAR(36);

CREATE INDEX IF NOT EXISTS idx_lease_headers_bu
    ON lease_headers (ent_business_unit_id)
    WHERE ent_business_unit_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lease_headers_le
    ON lease_headers (ent_legal_entity_id)
    WHERE ent_legal_entity_id IS NOT NULL;

-- ── Module 22: EAM / Maintenance ─────────────────────────────
ALTER TABLE maint_work_orders
    ADD COLUMN IF NOT EXISTS ent_inventory_org_id VARCHAR(36);

CREATE INDEX IF NOT EXISTS idx_maint_work_orders_inv_org
    ON maint_work_orders (ent_inventory_org_id)
    WHERE ent_inventory_org_id IS NOT NULL;

-- ── Module 7: Cost Management ─────────────────────────────────
ALTER TABLE cst_item_costs
    ADD COLUMN IF NOT EXISTS ent_inventory_org_id VARCHAR(36);

CREATE INDEX IF NOT EXISTS idx_cst_item_costs_inv_org
    ON cst_item_costs (ent_inventory_org_id)
    WHERE ent_inventory_org_id IS NOT NULL;

ALTER TABLE cst_cost_scenarios
    ADD COLUMN IF NOT EXISTS ent_inventory_org_id VARCHAR(36);

CREATE INDEX IF NOT EXISTS idx_cst_cost_scenarios_inv_org
    ON cst_cost_scenarios (ent_inventory_org_id)
    WHERE ent_inventory_org_id IS NOT NULL;
