-- Migration: Add ent_inventory_org_id scoping column
-- Modules: Inventory Management (18), LCM (19), Manufacturing (23), WIP Costing (24)
-- All modules scope to Inventory Organization.

-- 18: Inventory Management (actual table: inv_items)
ALTER TABLE inv_items ADD COLUMN IF NOT EXISTS ent_inventory_org_id VARCHAR;

-- 19: Landed Cost Management
ALTER TABLE lcm_trade_operations ADD COLUMN IF NOT EXISTS ent_inventory_org_id VARCHAR;

-- 23 + 24: Manufacturing & WIP Costing
ALTER TABLE production_orders ADD COLUMN IF NOT EXISTS ent_inventory_org_id VARCHAR;
ALTER TABLE mfg_wip_balances ADD COLUMN IF NOT EXISTS ent_inventory_org_id VARCHAR;
ALTER TABLE mfg_batches ADD COLUMN IF NOT EXISTS ent_inventory_org_id VARCHAR;
