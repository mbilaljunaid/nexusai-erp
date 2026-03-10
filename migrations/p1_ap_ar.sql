-- P1-E: AP / AR Core Migration
-- Gaps: APAR-OG-01 (payment terms catalogue), APAR-OG-02 (lockbox processing),
--        APAR-OG-03 (AutoInvoice validation), APAR-OG-04 (FX revaluation)

-- ─── Payment Terms ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payment_terms (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    term_code       TEXT NOT NULL,
    term_name       TEXT NOT NULL,
    net_days        INTEGER NOT NULL DEFAULT 30,    -- days until due
    discount_pct    NUMERIC(8,4) DEFAULT 0,         -- e.g. 2 = 2% early-pay discount
    discount_days   INTEGER DEFAULT 0,              -- days to qualify for discount
    installments    JSONB DEFAULT '[]',             -- [{pct, due_days}, ...] for split terms
    is_split        BOOLEAN NOT NULL DEFAULT FALSE,
    day_of_month    INTEGER,                        -- for EOM / specific-day terms (1-28)
    term_type       TEXT NOT NULL DEFAULT 'Net',    -- 'Net'|'EOM'|'InstallmentSplit'|'ImmediateDue'
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, term_code)
);

CREATE TABLE IF NOT EXISTS payment_schedule_lines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type     TEXT NOT NULL,  -- 'Invoice' | 'PO'
    source_id       UUID NOT NULL,
    installment_num INTEGER NOT NULL DEFAULT 1,
    due_date        DATE NOT NULL,
    amount          NUMERIC(18,4) NOT NULL,
    discount_amount NUMERIC(18,4) DEFAULT 0,
    discount_due_date DATE,
    status          TEXT NOT NULL DEFAULT 'Open',   -- 'Open' | 'Paid' | 'Overdue' | 'Disputed'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (source_type, source_id, installment_num)
);

CREATE INDEX IF NOT EXISTS idx_psl_due ON payment_schedule_lines(due_date, status);

-- ─── Lockbox ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lockbox_batches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    bank_account_id TEXT,
    batch_date      DATE NOT NULL,
    total_amount    NUMERIC(18,4) NOT NULL DEFAULT 0,
    item_count      INTEGER NOT NULL DEFAULT 0,
    currency_code   TEXT NOT NULL DEFAULT 'USD',
    status          TEXT NOT NULL DEFAULT 'Pending',  -- 'Pending'|'Matched'|'Partial'|'Exception'
    raw_file        TEXT,
    imported_by     TEXT,
    imported_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lockbox_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id        UUID NOT NULL REFERENCES lockbox_batches(id) ON DELETE CASCADE,
    check_number    TEXT,
    remittance_ref  TEXT,
    payer_name      TEXT,
    payer_account   TEXT,
    amount          NUMERIC(18,4) NOT NULL,
    item_date       DATE NOT NULL,
    matched_invoice_id UUID,
    match_method    TEXT,  -- 'Exact' | 'Fuzzy_Ref' | 'Amount' | 'Manual'
    match_status    TEXT NOT NULL DEFAULT 'Unmatched',  -- 'Matched' | 'Unmatched' | 'Overpayment' | 'Partial'
    unapplied_amount NUMERIC(18,4) DEFAULT 0,
    gl_posted       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lb_batch ON lockbox_items(batch_id, match_status);

-- ─── AutoInvoice Validation ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS autoinvoice_runs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    run_date        DATE NOT NULL,
    source_type     TEXT NOT NULL,  -- 'Order' | 'Contract' | 'ShipmentLine' | 'UsageEvent'
    source_ref      TEXT,
    status          TEXT NOT NULL DEFAULT 'Pending',  -- 'Pending'|'Validated'|'Error'|'Imported'
    total_lines     INTEGER DEFAULT 0,
    valid_lines     INTEGER DEFAULT 0,
    error_lines     INTEGER DEFAULT 0,
    validation_errors JSONB DEFAULT '[]',  -- [{lineRef, rule, message}, ...]
    generated_invoice_id UUID,
    run_by          TEXT,
    run_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── FX Revaluation ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS fx_revaluation_runs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    ledger_id       UUID,
    period_name     TEXT NOT NULL,  -- 'Jan-2026'
    revaluation_date DATE NOT NULL,
    base_currency   TEXT NOT NULL DEFAULT 'USD',
    status          TEXT NOT NULL DEFAULT 'Draft',  -- 'Draft' | 'Posted' | 'Reversed'
    total_gain_loss NUMERIC(18,4) DEFAULT 0,
    run_by          TEXT,
    run_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fx_revaluation_lines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id          UUID NOT NULL REFERENCES fx_revaluation_runs(id) ON DELETE CASCADE,
    foreign_currency TEXT NOT NULL,
    account_code    TEXT NOT NULL,
    account_name    TEXT,
    balance_fc      NUMERIC(18,4) NOT NULL,  -- foreign currency balance
    old_rate        NUMERIC(18,8) NOT NULL,
    new_rate        NUMERIC(18,8) NOT NULL,
    old_bc_amount   NUMERIC(18,4) NOT NULL,  -- old base currency value
    new_bc_amount   NUMERIC(18,4) NOT NULL,  -- new base currency value
    gain_loss       NUMERIC(18,4) NOT NULL,  -- unrealised G/L = new_bc - old_bc
    gl_journal_id   UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fxrev_run ON fx_revaluation_lines(run_id);
