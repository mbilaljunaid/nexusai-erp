-- P1-D: Treasury & Banking Migration
-- Gaps: TREAS-OG-01 (bank statement import), TREAS-OG-02 (hedge effectiveness),
--        TREAS-OG-03 (debt covenants), TREAS-OG-04 (sanctions screening),
--        TREAS-OG-05 (recon sign-off)

-- ─── Bank Statement Import ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bank_statement_imports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    bank_account_id UUID,
    format          TEXT NOT NULL,  -- 'BAI2' | 'MT940' | 'CAMT053'
    raw_content     TEXT NOT NULL,
    statement_date  DATE NOT NULL,
    opening_balance NUMERIC(18,4),
    closing_balance NUMERIC(18,4),
    currency_code   TEXT NOT NULL DEFAULT 'USD',
    total_credits   NUMERIC(18,4) DEFAULT 0,
    total_debits    NUMERIC(18,4) DEFAULT 0,
    transaction_count INTEGER DEFAULT 0,
    import_status   TEXT NOT NULL DEFAULT 'Pending',  -- 'Pending'|'Parsed'|'Matched'|'Error'
    error_message   TEXT,
    imported_by     TEXT NOT NULL,
    imported_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_statement_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_id       UUID NOT NULL REFERENCES bank_statement_imports(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    value_date      DATE,
    amount          NUMERIC(18,4) NOT NULL,
    direction       TEXT NOT NULL,  -- 'Credit' | 'Debit'
    currency_code   TEXT NOT NULL DEFAULT 'USD',
    bank_ref        TEXT,
    description     TEXT,
    bai2_type_code  TEXT,
    swift_code      TEXT,
    match_status    TEXT NOT NULL DEFAULT 'Unmatched',  -- 'Matched' | 'Unmatched' | 'Exception'
    gl_journal_id   UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bst_import ON bank_statement_transactions(import_id, match_status);

-- ─── Hedge Effectiveness (IFRS 9 / ASC 815) ──────────────────────────────────

CREATE TABLE IF NOT EXISTS hedge_relationships (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    hedge_id        TEXT NOT NULL,  -- user-assigned hedge designation ID
    hedge_type      TEXT NOT NULL,  -- 'CashFlow' | 'FairValue' | 'NetInvestment'
    accounting_std  TEXT NOT NULL DEFAULT 'IFRS9',  -- 'IFRS9' | 'ASC815'
    hedging_instrument_desc TEXT NOT NULL,
    hedged_item_desc TEXT NOT NULL,
    notional_amount  NUMERIC(18,4) NOT NULL,
    currency_code    TEXT NOT NULL DEFAULT 'USD',
    inception_date   DATE NOT NULL,
    maturity_date    DATE NOT NULL,
    status           TEXT NOT NULL DEFAULT 'Designated',  -- 'Designated'|'Discontinued'|'Expired'
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, hedge_id)
);

CREATE TABLE IF NOT EXISTS hedge_effectiveness_tests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hedge_rel_id    UUID NOT NULL REFERENCES hedge_relationships(id) ON DELETE CASCADE,
    test_date       DATE NOT NULL,
    method          TEXT NOT NULL DEFAULT 'DollarOffset',  -- 'DollarOffset' | 'Regression'
    hedging_gain_loss NUMERIC(18,4) NOT NULL,
    hedged_item_gain_loss NUMERIC(18,4) NOT NULL,
    effectiveness_ratio NUMERIC(8,6),  -- |hedging / hedged|
    is_highly_effective BOOLEAN GENERATED ALWAYS AS (
        effectiveness_ratio BETWEEN 0.8 AND 1.25
    ) STORED,
    oci_amount      NUMERIC(18,4),  -- OCI debit/credit from cash flow hedges
    pl_reclassified NUMERIC(18,4),  -- recycled to P&L
    notes           TEXT,
    tested_by       TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hedge_test_rel ON hedge_effectiveness_tests(hedge_rel_id, test_date DESC);

-- ─── Debt Covenants ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS debt_facilities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    facility_name   TEXT NOT NULL,
    lender          TEXT NOT NULL,
    facility_type   TEXT NOT NULL,  -- 'RCF' | 'TermLoan' | 'Bond' | 'Note'
    facility_amount NUMERIC(18,4) NOT NULL,
    drawn_amount    NUMERIC(18,4) NOT NULL DEFAULT 0,
    currency_code   TEXT NOT NULL DEFAULT 'USD',
    interest_rate   NUMERIC(8,6),
    maturity_date   DATE NOT NULL,
    status          TEXT NOT NULL DEFAULT 'Active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS debt_covenants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id     UUID NOT NULL REFERENCES debt_facilities(id) ON DELETE CASCADE,
    covenant_type   TEXT NOT NULL,  -- 'LeverageRatio' | 'InterestCoverage' | 'CurrentRatio' | 'EBITDA' | 'Custom'
    metric_name     TEXT NOT NULL,  -- Human-readable metric (e.g. "Net Debt / EBITDA")
    threshold_min   NUMERIC(18,6),  -- NULL if no minimum
    threshold_max   NUMERIC(18,6),  -- NULL if no maximum
    test_frequency  TEXT NOT NULL DEFAULT 'Quarterly',  -- 'Monthly'|'Quarterly'|'Annual'
    next_test_date  DATE,
    is_financial    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS covenant_test_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    covenant_id     UUID NOT NULL REFERENCES debt_covenants(id),
    test_date       DATE NOT NULL,
    actual_value    NUMERIC(18,6) NOT NULL,
    status          TEXT NOT NULL,  -- 'Pass' | 'Breach' | 'Cure_Period' | 'Waiver'
    headroom_min    NUMERIC(18,6),
    headroom_max    NUMERIC(18,6),
    notes           TEXT,
    tested_by       TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_covenant_results ON covenant_test_results(covenant_id, test_date DESC);

-- ─── Sanctions Screening ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sanctions_screening_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    entity_type     TEXT NOT NULL,  -- 'Supplier' | 'Customer' | 'Employee' | 'BeneficialOwner'
    entity_id       TEXT NOT NULL,
    entity_name     TEXT NOT NULL,
    list_sources    TEXT[] NOT NULL DEFAULT '{}',  -- ['OFAC_SDN', 'UN_SANCTIONS', 'EU_LIST', 'HM_TREASURY']
    match_status    TEXT NOT NULL DEFAULT 'Clear',  -- 'Clear' | 'PotentialMatch' | 'Confirmed' | 'FalsePositive'
    match_score     NUMERIC(5,2),  -- 0-100
    matched_name    TEXT,
    program_tags    TEXT[],  -- e.g. ['IRAN', 'RUSSIA']
    screened_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_by     TEXT,
    reviewed_at     TIMESTAMPTZ,
    review_notes    TEXT
);

CREATE INDEX IF NOT EXISTS idx_sanctions_entity ON sanctions_screening_results(tenant_id, entity_id, screened_at DESC);
CREATE INDEX IF NOT EXISTS idx_sanctions_status ON sanctions_screening_results(tenant_id, match_status);

-- ─── Bank Recon Sign-Off ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bank_recon_signoffs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    bank_account_id UUID,
    period_name     TEXT NOT NULL,  -- 'Jan-2026'
    statement_balance NUMERIC(18,4) NOT NULL,
    gl_balance      NUMERIC(18,4) NOT NULL,
    outstanding_items JSONB DEFAULT '[]',  -- [{type, amount, description}]
    reconciled_balance NUMERIC(18,4) NOT NULL,
    status          TEXT NOT NULL DEFAULT 'Draft',  -- 'Draft'|'Reviewed'|'Approved'
    preparer_id     TEXT,
    preparer_signed_at TIMESTAMPTZ,
    reviewer_id     TEXT,
    reviewer_signed_at TIMESTAMPTZ,
    approver_id     TEXT,
    approver_signed_at TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, bank_account_id, period_name)
);
