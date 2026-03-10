-- AP Enterprise Business Unit Scoping Migration
-- Adds ent_business_unit_id to tables that were missing it:
-- apPaymentBatches and apSupplierSites
-- apInvoices, apPayments, apPaymentSchedules already have this column.

-- Add ent_business_unit_id to ap_payment_batches
ALTER TABLE ap_payment_batches
    ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR;

-- Add index for BU-scoped queries on payment batches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ap_payment_batches_bu_id
    ON ap_payment_batches (ent_business_unit_id)
    WHERE ent_business_unit_id IS NOT NULL;

-- Add ent_business_unit_id to ap_supplier_sites
-- (Oracle: supplier sites are assigned to purchasing/payment BUs)
ALTER TABLE ap_supplier_sites
    ADD COLUMN IF NOT EXISTS ent_business_unit_id VARCHAR;

-- Add index for BU-scoped supplier site queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ap_supplier_sites_bu_id
    ON ap_supplier_sites (ent_business_unit_id)
    WHERE ent_business_unit_id IS NOT NULL;
