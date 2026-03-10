-- P1-A: Compliance & Tax Engine Migration
-- Gaps: COMP-OG-01 (eInvoicing), COMP-OG-02 (WHT), COMP-OG-03 (Tax-GL Recon)

-- ─── E-Invoicing ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS einvoice_documents (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID NOT NULL,
    invoice_id       UUID NOT NULL,                       -- FK → ap_invoices or ar_transactions
    invoice_type     TEXT NOT NULL,                       -- 'AP' | 'AR'
    standard         TEXT NOT NULL,                       -- 'ZATCA' | 'SDI' | 'CFDI' | 'GST_IRN' | 'PEPPOL'
    country_code     TEXT NOT NULL,                       -- 'SA' | 'IT' | 'MX' | 'IN' | 'EU'
    irn              TEXT,                                -- GST Invoice Reference Number
    uuid             TEXT,                                -- E-invoice UUID (ZATCA/SDI/CFDI)
    qr_code          TEXT,                                -- Base64 QR payload
    xml_payload      TEXT,                                -- Signed XML / JSON
    submission_id    TEXT,                                -- Tax authority submission ID
    status           TEXT NOT NULL DEFAULT 'Pending',    -- 'Pending'|'Submitted'|'Accepted'|'Rejected'|'Cancelled'
    error_message    TEXT,
    submitted_at     TIMESTAMPTZ,
    accepted_at      TIMESTAMPTZ,
    cancelled_at     TIMESTAMPTZ,
    created_by       TEXT NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_einvoice_tenant_status ON einvoice_documents(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_einvoice_invoice_id ON einvoice_documents(invoice_id);
CREATE INDEX IF NOT EXISTS idx_einvoice_irn ON einvoice_documents(irn) WHERE irn IS NOT NULL;

-- ─── WHT (Withholding Tax) ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wht_rules (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID NOT NULL,
    country_code     TEXT NOT NULL,
    income_type      TEXT NOT NULL,    -- 'Dividend' | 'Interest' | 'Royalty' | 'Services' | 'Other'
    rate             NUMERIC(8,6) NOT NULL,               -- e.g. 0.15 for 15%
    treaty_rate      NUMERIC(8,6),                        -- Reduced treaty rate
    threshold_amount NUMERIC(18,4) DEFAULT 0,             -- Only apply WHT above this amount
    currency_code    TEXT NOT NULL DEFAULT 'USD',
    effective_from   DATE NOT NULL,
    effective_to     DATE,
    enabled          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wht_transactions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID NOT NULL,
    payment_id       UUID NOT NULL,                       -- FK → ap_payments
    supplier_id      UUID NOT NULL,
    rule_id          UUID REFERENCES wht_rules(id),
    country_code     TEXT NOT NULL,
    income_type      TEXT NOT NULL,
    gross_amount     NUMERIC(18,4) NOT NULL,
    wht_rate         NUMERIC(8,6) NOT NULL,
    wht_amount       NUMERIC(18,4) NOT NULL,
    net_amount       NUMERIC(18,4) NOT NULL,
    currency_code    TEXT NOT NULL DEFAULT 'USD',
    period_name      TEXT NOT NULL,
    gl_account_code  TEXT,                                -- WHT payable account
    remittance_ref   TEXT,                                -- Tax authority remittance reference
    remitted_at      TIMESTAMPTZ,
    certificate_url  TEXT,                                -- WHT certificate (Form 16A, etc.)
    statutory_xml    TEXT,                                -- Jurisdiction-specific XML
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wht_remittance_batches (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID NOT NULL,
    period_name      TEXT NOT NULL,
    country_code     TEXT NOT NULL,
    total_wht        NUMERIC(18,4) NOT NULL DEFAULT 0,
    currency_code    TEXT NOT NULL DEFAULT 'USD',
    status           TEXT NOT NULL DEFAULT 'Pending',    -- 'Pending'|'Filed'|'Paid'
    due_date         DATE,
    filed_at         TIMESTAMPTZ,
    payment_ref      TEXT,
    created_by       TEXT NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wht_txn_tenant_period ON wht_transactions(tenant_id, period_name);
CREATE INDEX IF NOT EXISTS idx_wht_txn_supplier ON wht_transactions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_wht_rules_country ON wht_rules(tenant_id, country_code, enabled);

-- ─── Tax-GL Reconciliation ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tax_gl_recon_runs (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID NOT NULL,
    period_name      TEXT NOT NULL,
    ledger_id        UUID,
    status           TEXT NOT NULL DEFAULT 'Running',    -- 'Running'|'Completed'|'Error'
    matched_count    INTEGER DEFAULT 0,
    unmatched_count  INTEGER DEFAULT 0,
    variance_total   NUMERIC(18,4) DEFAULT 0,
    run_by           TEXT NOT NULL,
    started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at     TIMESTAMPTZ,
    error_log        TEXT
);

CREATE TABLE IF NOT EXISTS tax_gl_recon_lines (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id           UUID NOT NULL REFERENCES tax_gl_recon_runs(id) ON DELETE CASCADE,
    tax_return_line  TEXT NOT NULL,                       -- Tax return line reference
    tax_amount       NUMERIC(18,4) NOT NULL,
    gl_account_code  TEXT NOT NULL,
    gl_amount        NUMERIC(18,4) NOT NULL,
    variance         NUMERIC(18,4) GENERATED ALWAYS AS (gl_amount - tax_amount) STORED,
    match_status     TEXT NOT NULL DEFAULT 'Unmatched',  -- 'Matched'|'Unmatched'|'Disputed'
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tax_recon_tenant_period ON tax_gl_recon_runs(tenant_id, period_name);
CREATE INDEX IF NOT EXISTS idx_tax_recon_lines_run ON tax_gl_recon_lines(run_id, match_status);

-- ─── Compliance Control Calendar ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS compliance_controls (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID NOT NULL,
    control_class    TEXT NOT NULL,    -- 'eInvoicing' | 'WHT' | 'VAT' | 'SOX' | 'AntiCorruption'
    country_code     TEXT,
    due_date         DATE NOT NULL,
    period_name      TEXT NOT NULL,
    status           TEXT NOT NULL DEFAULT 'Pending',    -- 'Pending'|'InProgress'|'Complete'|'Overdue'
    owner_id         TEXT,
    description      TEXT,
    evidence_url     TEXT,
    completed_at     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_controls_tenant ON compliance_controls(tenant_id, status, due_date);
