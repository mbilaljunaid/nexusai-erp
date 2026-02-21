-- P1-N: Intercompany Migration
-- IC-OG-01: IC Invoice / Transaction Matching
-- IC-OG-02: Multilateral Netting
-- IC-OG-03: Transfer Pricing
-- IC-OG-04: IC Dispute Management

-- ─── IC Transactions (entity-to-entity) ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS ic_transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    from_entity         TEXT NOT NULL,  -- legal entity code
    to_entity           TEXT NOT NULL,
    transaction_type    TEXT NOT NULL DEFAULT 'TRADE_RECEIVABLE',
    -- 'TRADE_RECEIVABLE'|'TRADE_PAYABLE'|'LOAN'|'ROYALTY'|'MGMT_FEE'|'DIVIDEND'|'OTHER'
    currency            TEXT NOT NULL DEFAULT 'USD',
    amount              NUMERIC(18,2) NOT NULL,
    exchange_rate       NUMERIC(14,6) DEFAULT 1.0,
    base_currency_amount NUMERIC(18,2),
    invoice_number      TEXT,
    invoice_date        DATE,
    due_date            DATE,
    period              TEXT,          -- YYYY-MM
    description         TEXT,
    ar_reference        TEXT,          -- reference to AR invoice
    ap_reference        TEXT,          -- reference to AP invoice (counterpart)
    match_status        TEXT NOT NULL DEFAULT 'Unmatched',
    -- 'Unmatched'|'Auto_Matched'|'Manual_Matched'|'Disputed'|'Eliminated'
    matched_with        UUID REFERENCES ic_transactions(id),
    eliminate_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ic_txn_tenant ON ic_transactions(tenant_id, period, match_status);
CREATE INDEX IF NOT EXISTS idx_ic_txn_entities ON ic_transactions(tenant_id, from_entity, to_entity);

-- ─── Netting Sessions ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ic_netting_sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    session_name        TEXT NOT NULL,
    period              TEXT NOT NULL,        -- YYYY-MM
    currency            TEXT NOT NULL DEFAULT 'USD',
    status              TEXT NOT NULL DEFAULT 'Draft',
    -- 'Draft'|'Running'|'Completed'|'Settled'|'Cancelled'
    entities_in_scope   JSONB DEFAULT '[]',   -- [entityCode]
    net_positions       JSONB DEFAULT '[]',   -- [{entity, payable, receivable, net}]
    settlement_date     DATE,
    settlement_instructions JSONB DEFAULT '{}',
    run_by              TEXT,
    settled_by          TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_netting_tenant ON ic_netting_sessions(tenant_id, period, status);

-- ─── Transfer Pricing Arms-Length ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS transfer_pricing_policies (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    policy_name         TEXT NOT NULL,
    transaction_category TEXT NOT NULL,
    -- 'GOODS'|'SERVICES'|'IP_ROYALTIES'|'LOANS'|'COST_SHARING'|'DISTRIBUTION'
    method              TEXT NOT NULL,
    -- 'CUP'|'RESALE_PRICE'|'COST_PLUS'|'TNMM'|'PSM'|'CUSTOM'
    from_entity         TEXT,           -- NULL = applies all
    to_entity           TEXT,
    arm_length_margin_pct NUMERIC(8,4),
    benchmark_range_low NUMERIC(8,4),
    benchmark_range_high NUMERIC(8,4),
    effective_from      DATE NOT NULL,
    effective_to        DATE,
    documentation_url   TEXT,
    approved_by         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transfer_pricing_analyses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    policy_id           UUID NOT NULL REFERENCES transfer_pricing_policies(id),
    period              TEXT NOT NULL,
    actual_margin_pct   NUMERIC(8,4),
    benchmark_margin_pct NUMERIC(8,4),
    variance_pct        NUMERIC(8,4),
    in_range            BOOLEAN,
    flagged             BOOLEAN DEFAULT FALSE,
    transactions_reviewed INTEGER DEFAULT 0,
    analysis_notes      TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tp_policy   ON transfer_pricing_policies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tp_analysis ON transfer_pricing_analyses(tenant_id, period);

-- ─── IC Disputes ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ic_disputes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    dispute_number      TEXT NOT NULL,
    ic_transaction_id   UUID REFERENCES ic_transactions(id),
    from_entity         TEXT NOT NULL,
    to_entity           TEXT NOT NULL,
    disputed_amount     NUMERIC(18,2),
    currency            TEXT DEFAULT 'USD',
    status              TEXT NOT NULL DEFAULT 'Open',
    -- 'Open'|'Under_Review'|'Escalated'|'Resolved'|'Closed'
    reason              TEXT NOT NULL,
    -- 'AMOUNT_MISMATCH'|'MISSING_INVOICE'|'DUPLICATE'|'CURRENCY_DIFF'|'OTHER'
    opened_by           TEXT,
    assigned_to         TEXT,
    resolved_by         TEXT,
    resolution          TEXT,
    opened_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at         TIMESTAMPTZ,
    events              JSONB DEFAULT '[]',   -- [{at, by, action, note}]
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ic_dispute_tenant ON ic_disputes(tenant_id, status);
