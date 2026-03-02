-- Migration: Add ent_legal_entity_id to Fixed Assets tables
-- Date: 2026-03-02

-- fa_assets: tag each physical asset to a legal entity
ALTER TABLE fa_assets
    ADD COLUMN IF NOT EXISTS ent_legal_entity_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_fa_assets_legal_entity
    ON fa_assets (ent_legal_entity_id)
    WHERE ent_legal_entity_id IS NOT NULL;

-- fa_mass_additions: tag AP-sourced mass addition lines to a legal entity
ALTER TABLE fa_mass_additions
    ADD COLUMN IF NOT EXISTS ent_legal_entity_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_fa_mass_additions_legal_entity
    ON fa_mass_additions (ent_legal_entity_id)
    WHERE ent_legal_entity_id IS NOT NULL;

-- Comment: fa_books already links to a GL Ledger via ledger_id.
-- Filtering assets by ledger is done via fa_asset_books JOIN fa_books.
-- The ent_legal_entity_id columns above provide direct LE ownership for
-- assets purchased by a specific LE (e.g. from AP/Mass Additions).
