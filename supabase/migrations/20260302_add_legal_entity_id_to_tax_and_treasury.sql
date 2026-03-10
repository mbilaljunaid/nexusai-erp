-- Migration: Add legal_entity_id to Tax and Treasury tables
-- Created: 2026-03-02
-- Purpose: Enable Legal Entity (LE) scoping for the Tax Engine and Treasury modules.
--          Cash tables already have ent_legal_entity_id.
--          treasuryDeals already has legal_entity_id.

-- ─────────────────────────────────────────────────────────────────────────────
-- TAX ENGINE
-- ─────────────────────────────────────────────────────────────────────────────

-- Tax Jurisdictions: Jurisdictions can be LE-specific (e.g. different tax rules per entity).
ALTER TABLE tax_jurisdictions
    ADD COLUMN IF NOT EXISTS ent_legal_entity_id varchar(255);

-- Tax Codes: Codes are applied per jurisdiction, make them LE-scoped.
ALTER TABLE tax_codes
    ADD COLUMN IF NOT EXISTS ent_legal_entity_id varchar(255);

-- Tax Exemptions: Exemptions are granted per customer/site and should be LE-scoped.
ALTER TABLE tax_exemptions
    ADD COLUMN IF NOT EXISTS ent_legal_entity_id varchar(255);

-- Indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_tax_jurisdictions_le_id ON tax_jurisdictions(ent_legal_entity_id);
CREATE INDEX IF NOT EXISTS idx_tax_codes_le_id ON tax_codes(ent_legal_entity_id);
CREATE INDEX IF NOT EXISTS idx_tax_exemptions_le_id ON tax_exemptions(ent_legal_entity_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TREASURY
-- Note: treasury_deals already has legal_entity_id (added in schema design).
-- Adding to fx_deals and hedge_relationships for completeness.
-- ─────────────────────────────────────────────────────────────────────────────

-- FX Deals: FX contracts belong to the trading legal entity.
ALTER TABLE treasury_fx_deals
    ADD COLUMN IF NOT EXISTS legal_entity_id varchar(255);

-- Hedge Relationships: Hedging activity is LE-specific.
ALTER TABLE treasury_hedge_relationships
    ADD COLUMN IF NOT EXISTS legal_entity_id varchar(255);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_treasury_fx_deals_le_id ON treasury_fx_deals(legal_entity_id);
CREATE INDEX IF NOT EXISTS idx_treasury_hedge_rel_le_id ON treasury_hedge_relationships(legal_entity_id);
