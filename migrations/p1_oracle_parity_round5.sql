-- ============================================================
-- Oracle Parity — Missing DB Tables Migration
-- Round 5 (March 8 2026)
-- ============================================================

-- -------------------------------------------------------
-- AR: Credit / Debit Memos
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS ar_memos (
    id              SERIAL PRIMARY KEY,
    tenant_id       VARCHAR(36),
    business_unit_id VARCHAR(36),
    memo_number     VARCHAR(50) NOT NULL,
    memo_type       VARCHAR(20) NOT NULL CHECK (memo_type IN ('Credit Memo', 'Debit Memo')),
    customer_id     INTEGER REFERENCES ar_customers(id),
    related_invoice_id INTEGER REFERENCES ar_invoices(id),
    memo_date       DATE NOT NULL,
    accounting_date DATE NOT NULL,
    currency_code   VARCHAR(3) NOT NULL DEFAULT 'USD',
    total_amount    NUMERIC(18,2) NOT NULL,
    gl_account      VARCHAR(50),
    status          VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft','Pending Approval','Approved','Posted','Voided')),
    notes           TEXT,
    posted_at       TIMESTAMPTZ,
    created_by      VARCHAR(100),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ar_memo_lines (
    id              SERIAL PRIMARY KEY,
    memo_id         INTEGER NOT NULL REFERENCES ar_memos(id) ON DELETE CASCADE,
    line_seq        INTEGER NOT NULL,
    description     TEXT,
    reason_code     VARCHAR(100),
    unit_price      NUMERIC(18,2) NOT NULL,
    quantity        NUMERIC(14,4) NOT NULL DEFAULT 1,
    tax_code        VARCHAR(20),
    amount          NUMERIC(18,2) NOT NULL,
    gl_account      VARCHAR(50),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ar_memos_customer ON ar_memos(customer_id);
CREATE INDEX IF NOT EXISTS idx_ar_memos_status ON ar_memos(status);
CREATE INDEX IF NOT EXISTS idx_ar_memo_lines_memo ON ar_memo_lines(memo_id);

-- -------------------------------------------------------
-- AR: Receipt Applications Ledger
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS ar_receipt_applications (
    id                  SERIAL PRIMARY KEY,
    tenant_id           VARCHAR(36),
    receipt_id          INTEGER NOT NULL REFERENCES ar_receipts(id),
    applied_to_invoice_id INTEGER REFERENCES ar_invoices(id),
    application_type    VARCHAR(30) NOT NULL DEFAULT 'Invoice'
                            CHECK (application_type IN ('Invoice','On-Account','Write-Off','Deduction')),
    application_date    DATE NOT NULL,
    amount_applied      NUMERIC(18,2) NOT NULL,
    currency_code       VARCHAR(3) NOT NULL DEFAULT 'USD',
    gl_account          VARCHAR(50),
    status              VARCHAR(20) NOT NULL DEFAULT 'Applied',
    memo_ref            VARCHAR(100),
    created_by          VARCHAR(100),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ar_receipt_apps_receipt ON ar_receipt_applications(receipt_id);
CREATE INDEX IF NOT EXISTS idx_ar_receipt_apps_invoice ON ar_receipt_applications(applied_to_invoice_id);

-- -------------------------------------------------------
-- AP: Match Tolerance Configuration
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS ap_match_tolerances (
    id                  SERIAL PRIMARY KEY,
    tenant_id           VARCHAR(36),
    business_unit_id    VARCHAR(36),
    item_category       VARCHAR(100) NOT NULL DEFAULT 'Goods',
    match_type          VARCHAR(10) NOT NULL CHECK (match_type IN ('2-Way','3-Way','4-Way')),
    qty_variance_pct    NUMERIC(6,2) NOT NULL DEFAULT 0,
    amt_variance_pct    NUMERIC(6,2) NOT NULL DEFAULT 0,
    amt_variance_abs    NUMERIC(18,2) NOT NULL DEFAULT 0,
    hold_code           VARCHAR(50) NOT NULL DEFAULT 'MATCH_AMT',
    breach_action       VARCHAR(10) NOT NULL DEFAULT 'Hold' CHECK (breach_action IN ('Hold','Warn','Pass')),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ap_inspection_hold_rules (
    id                  SERIAL PRIMARY KEY,
    tenant_id           VARCHAR(36),
    description         TEXT NOT NULL,
    trigger_condition   TEXT NOT NULL,
    hold_code           VARCHAR(50) NOT NULL,
    requires_grn        BOOLEAN NOT NULL DEFAULT TRUE,
    requires_inspection BOOLEAN NOT NULL DEFAULT TRUE,
    auto_release        BOOLEAN NOT NULL DEFAULT FALSE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------
-- FA: Tax Books, Prorate Conventions, Reclassifications
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS fa_tax_books (
    id                   SERIAL PRIMARY KEY,
    tenant_id            VARCHAR(36),
    book_name            VARCHAR(100) NOT NULL,
    linked_corporate_book VARCHAR(100),
    tax_authority        VARCHAR(100),
    depreciation_method  VARCHAR(50) NOT NULL,
    convention           VARCHAR(50),
    life_years           NUMERIC(5,2),
    bonus_pct            NUMERIC(5,2),
    effective_date       DATE NOT NULL,
    is_active            BOOLEAN NOT NULL DEFAULT TRUE,
    notes                TEXT,
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fa_prorate_conventions (
    id                  SERIAL PRIMARY KEY,
    tenant_id           VARCHAR(36),
    convention_code     VARCHAR(50) NOT NULL,
    convention_name     VARCHAR(100) NOT NULL,
    description         TEXT,
    first_year_rule     VARCHAR(50),
    last_year_rule      VARCHAR(50),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fa_reclassifications (
    id                  SERIAL PRIMARY KEY,
    tenant_id           VARCHAR(36),
    asset_id            INTEGER,
    from_category_id    INTEGER REFERENCES fa_categories(id),
    to_category_id      INTEGER REFERENCES fa_categories(id),
    effective_date      DATE NOT NULL,
    old_deprn_method    VARCHAR(50),
    new_deprn_method    VARCHAR(50),
    old_life_months     INTEGER,
    new_life_months     INTEGER,
    gl_journal_ref      VARCHAR(100),
    status              VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Posted','Reversed')),
    notes               TEXT,
    requested_by        VARCHAR(100),
    approved_by         VARCHAR(100),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------
-- Expense: Cash Advances
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS expense_cash_advances (
    id                  SERIAL PRIMARY KEY,
    tenant_id           VARCHAR(36),
    business_unit_id    VARCHAR(36),
    advance_number      VARCHAR(50) NOT NULL,
    employee_id         VARCHAR(50) NOT NULL,
    employee_name       VARCHAR(200),
    department          VARCHAR(100),
    advance_amount      NUMERIC(18,2) NOT NULL,
    currency_code       VARCHAR(3) NOT NULL DEFAULT 'USD',
    purpose             TEXT,
    issue_date          DATE NOT NULL,
    due_date            DATE,
    reconciled_amount   NUMERIC(18,2) NOT NULL DEFAULT 0,
    expense_report_ref  VARCHAR(100),
    status              VARCHAR(20) NOT NULL DEFAULT 'Issued'
                            CHECK (status IN ('Issued','Partial','Reconciled','Overdue','Cancelled')),
    payment_method      VARCHAR(50),
    gl_account          VARCHAR(50),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------
-- Expense: Audit Rules
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS expense_audit_rules (
    id              SERIAL PRIMARY KEY,
    tenant_id       VARCHAR(36),
    rule_name       VARCHAR(200) NOT NULL,
    rule_type       VARCHAR(50) NOT NULL, -- AMOUNT_LIMIT, RECEIPT_REQUIRED, CATEGORY, etc.
    severity        VARCHAR(20) NOT NULL DEFAULT 'Warning' CHECK (severity IN ('Warning','Flag','Reject')),
    condition_field VARCHAR(100),
    condition_op    VARCHAR(20),
    threshold_value NUMERIC(18,2),
    action          VARCHAR(50),
    notify_roles    TEXT[],
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    applies_to      VARCHAR(50) DEFAULT 'All', -- Employee Type
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------
-- Expense: Payroll Reimbursement Batches
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS expense_payroll_batches (
    id              SERIAL PRIMARY KEY,
    tenant_id       VARCHAR(36),
    batch_ref       VARCHAR(50) NOT NULL,
    pay_period      VARCHAR(50),
    run_date        DATE,
    total_amount    NUMERIC(18,2) NOT NULL DEFAULT 0,
    employee_count  INTEGER NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'Pending'
                        CHECK (status IN ('Pending','Approved','Transmitted','Complete')),
    submitted_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expense_payroll_batch_lines (
    id              SERIAL PRIMARY KEY,
    batch_id        INTEGER NOT NULL REFERENCES expense_payroll_batches(id) ON DELETE CASCADE,
    employee_id     VARCHAR(50) NOT NULL,
    employee_name   VARCHAR(200),
    expense_report_id INTEGER,
    gross_amount    NUMERIC(18,2) NOT NULL,
    tax_withheld    NUMERIC(18,2) NOT NULL DEFAULT 0,
    net_payable     NUMERIC(18,2) NOT NULL,
    currency_code   VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_method  VARCHAR(50),
    status          VARCHAR(20) NOT NULL DEFAULT 'Pending'
);

-- -------------------------------------------------------
-- CE: Cash Pools (Notional Pooling)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS ce_cash_pools (
    id              SERIAL PRIMARY KEY,
    tenant_id       VARCHAR(36),
    pool_name       VARCHAR(200) NOT NULL,
    pool_type       VARCHAR(30) NOT NULL DEFAULT 'Notional' CHECK (pool_type IN ('Notional','Zero Balance')),
    header_account  VARCHAR(100) NOT NULL,
    currency_code   VARCHAR(3) NOT NULL DEFAULT 'USD',
    bank_name       VARCHAR(200),
    concentration_account VARCHAR(100),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ce_cash_pool_members (
    id              SERIAL PRIMARY KEY,
    pool_id         INTEGER NOT NULL REFERENCES ce_cash_pools(id) ON DELETE CASCADE,
    entity_name     VARCHAR(200) NOT NULL,
    account_number  VARCHAR(100) NOT NULL,
    bank_code       VARCHAR(50),
    currency_code   VARCHAR(3),
    contribution_pct NUMERIC(5,2),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------
-- Lease: Approval Chains
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS lease_approval_chains (
    id              SERIAL PRIMARY KEY,
    tenant_id       VARCHAR(36),
    chain_name      VARCHAR(200) NOT NULL,
    lease_type      VARCHAR(50),
    threshold_min   NUMERIC(18,2),
    threshold_max   NUMERIC(18,2),
    currency_code   VARCHAR(3) DEFAULT 'USD',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lease_approval_steps (
    id              SERIAL PRIMARY KEY,
    chain_id        INTEGER NOT NULL REFERENCES lease_approval_chains(id) ON DELETE CASCADE,
    step_order      INTEGER NOT NULL,
    approver_role   VARCHAR(100) NOT NULL,
    approver_name   VARCHAR(200),
    step_type       VARCHAR(20) NOT NULL DEFAULT 'Sequential' CHECK (step_type IN ('Sequential','Parallel')),
    escalation_days INTEGER,
    is_mandatory    BOOLEAN NOT NULL DEFAULT TRUE
);

-- -------------------------------------------------------
-- Tax: eBTax Persistent Configuration Tables
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS zx_regimes (
    id              SERIAL PRIMARY KEY,
    tenant_id       VARCHAR(36),
    regime_code     VARCHAR(50) NOT NULL,
    regime_name     VARCHAR(200) NOT NULL,
    country_code    VARCHAR(3),
    tax_type        VARCHAR(30) NOT NULL DEFAULT 'VAT' CHECK (tax_type IN ('VAT','GST','SALES','WITHHOLDING','EXCISE')),
    effective_from  DATE NOT NULL,
    effective_to    DATE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zx_taxes (
    id              SERIAL PRIMARY KEY,
    regime_id       INTEGER NOT NULL REFERENCES zx_regimes(id),
    tax_code        VARCHAR(50) NOT NULL,
    tax_name        VARCHAR(200) NOT NULL,
    country_code    VARCHAR(3),
    recovery_rate   NUMERIC(5,2) NOT NULL DEFAULT 100,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zx_rates (
    id              SERIAL PRIMARY KEY,
    tax_id          INTEGER NOT NULL REFERENCES zx_taxes(id),
    rate_code       VARCHAR(50) NOT NULL,
    rate_name       VARCHAR(200),
    percentage_rate NUMERIC(8,4) NOT NULL,
    effective_from  DATE NOT NULL,
    effective_to    DATE,
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zx_jurisdictions (
    id              SERIAL PRIMARY KEY,
    tax_id          INTEGER NOT NULL REFERENCES zx_taxes(id),
    jurisdiction_code VARCHAR(50) NOT NULL,
    jurisdiction_name VARCHAR(200) NOT NULL,
    country_code    VARCHAR(3),
    region_code     VARCHAR(20),
    city            VARCHAR(100),
    effective_from  DATE NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS zx_trn_validation_log (
    id              SERIAL PRIMARY KEY,
    tenant_id       VARCHAR(36),
    supplier_id     INTEGER,
    supplier_name   VARCHAR(200),
    trn_number      VARCHAR(100),
    country_code    VARCHAR(3),
    validation_type VARCHAR(30), -- REGEX, EU_VIES, UAE_FTA, HMRC
    validated_at    TIMESTAMPTZ DEFAULT NOW(),
    result          VARCHAR(20) NOT NULL CHECK (result IN ('Valid','Invalid','Unverified')),
    vies_response   TEXT,
    error_message   TEXT
);
