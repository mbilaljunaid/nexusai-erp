-- ============================================================
-- Enterprise Scoping: Modules 25, 28, 31, 35, 37
-- MDM (ent_set_id), SCM + Supplier (ent_business_unit_id),
-- TMS (ent_business_unit_id + ent_inventory_org_id),
-- WMS (ent_inventory_org_id)
-- ============================================================

-- ── Module 25: MDM ─────────────────────────────────────────
ALTER TABLE hz_parties ADD COLUMN IF NOT EXISTS ent_set_id VARCHAR;
ALTER TABLE hz_party_sites ADD COLUMN IF NOT EXISTS ent_set_id VARCHAR;
ALTER TABLE mdm_audit_log ADD COLUMN IF NOT EXISTS ent_set_id VARCHAR;
ALTER TABLE mdm_change_requests ADD COLUMN IF NOT EXISTS ent_set_id VARCHAR;

-- ── Module 28: Procurement & SCM ───────────────────────────
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR;
ALTER TABLE purchase_requisitions ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR;
ALTER TABLE scm_suppliers ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR;

-- ── Module 31: Supplier Portal & Contracts ─────────────────
ALTER TABLE supplier_certifications ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR;
ALTER TABLE supplier_qualifications ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR;
ALTER TABLE supplier_qualification_templates ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR;

-- ── Module 35: Transportation & Logistics (TMS) ────────────
ALTER TABLE tl_shipments ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR;
ALTER TABLE tl_shipments ADD COLUMN IF NOT EXISTS ent_inventory_org_id VARCHAR;
ALTER TABLE tl_lanes ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR;
ALTER TABLE tl_freight_charges ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR;

-- ── Module 37: Warehouse Management (WMS) ──────────────────
ALTER TABLE wms_zones ADD COLUMN IF NOT EXISTS ent_inventory_org_id VARCHAR;
ALTER TABLE wms_waves ADD COLUMN IF NOT EXISTS ent_inventory_org_id VARCHAR;
ALTER TABLE wms_tasks ADD COLUMN IF NOT EXISTS ent_inventory_org_id VARCHAR;
ALTER TABLE yard_docks ADD COLUMN IF NOT EXISTS ent_inventory_org_id VARCHAR;
ALTER TABLE wh_zones ADD COLUMN IF NOT EXISTS ent_inventory_org_id VARCHAR;
ALTER TABLE wh_bin_locations ADD COLUMN IF NOT EXISTS ent_inventory_org_id VARCHAR;
