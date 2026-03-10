-- ============================================================
-- P1-B: Financial Close & Consolidation Migration
-- Gaps: FC-OG-01..05, EPM-OG-03, GL-OG-01, PBF-OG-01..04, SLA-OG-01
-- ============================================================

-- Account Reconciliation Certification Portal (FC-OG-01)
CREATE TABLE IF NOT EXISTS account_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    account_id TEXT NOT NULL,
    ledger_id UUID,
    period_name TEXT NOT NULL,                          -- e.g. 'Jan-2026'
    status TEXT NOT NULL DEFAULT 'Pending'              -- Pending | In-Review | Certified | Escalated | Rejected
        CHECK (status IN ('Pending','In-Review','Certified','Escalated','Rejected')),
    preparer_id UUID,                                   -- User who prepared reconciliation
    reviewer_id UUID,                                   -- Assigned reviewer
    prepared_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    certified_at TIMESTAMPTZ,
    escalated_at TIMESTAMPTZ,
    escalation_reason TEXT,
    balance_per_gl NUMERIC(20,4),
    balance_per_sub NUMERIC(20,4),
    variance NUMERIC(20,4) GENERATED ALWAYS AS (balance_per_gl - balance_per_sub) STORED,
    notes TEXT,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_acct_certs_tenant_period ON account_certifications(tenant_id, period_name);
CREATE INDEX IF NOT EXISTS idx_acct_certs_status ON account_certifications(status);

-- Tax Provision Engine (FC-OG-02, ASC 740 / IAS 12)
CREATE TABLE IF NOT EXISTS tax_provisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    entity_id UUID NOT NULL,
    period_name TEXT NOT NULL,
    fiscal_year INT NOT NULL,
    -- Current Tax
    pretax_income NUMERIC(20,4),
    permanent_differences NUMERIC(20,4) DEFAULT 0,
    temporary_differences NUMERIC(20,4) DEFAULT 0,
    taxable_income NUMERIC(20,4),
    current_tax_rate NUMERIC(8,6),                      -- e.g. 0.21 for 21%
    current_tax_expense NUMERIC(20,4),
    -- Deferred Tax
    deferred_tax_asset NUMERIC(20,4) DEFAULT 0,
    deferred_tax_liability NUMERIC(20,4) DEFAULT 0,
    net_deferred_tax NUMERIC(20,4) GENERATED ALWAYS AS (deferred_tax_asset - deferred_tax_liability) STORED,
    effective_tax_rate NUMERIC(8,6),
    standard TEXT NOT NULL DEFAULT 'ASC740'             -- ASC740 | IAS12
        CHECK (standard IN ('ASC740','IAS12')),
    status TEXT NOT NULL DEFAULT 'Draft'
        CHECK (status IN ('Draft','Reviewed','Filed')),
    computed_by UUID,
    computed_at TIMESTAMPTZ,
    journal_id UUID,                                    -- Posted GL journal reference
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tax_prov_tenant_period ON tax_provisions(tenant_id, period_name);

-- IC Invoice-Level Matching Pre-Consolidation (FC-OG-04)
CREATE TABLE IF NOT EXISTS ic_invoice_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    consolidation_run_id UUID,
    period_name TEXT NOT NULL,
    seller_entity_id UUID NOT NULL,
    buyer_entity_id UUID NOT NULL,
    seller_invoice_id UUID,                             -- AR invoice in seller entity
    buyer_bill_id UUID,                                 -- AP bill in buyer entity
    seller_amount NUMERIC(20,4),
    buyer_amount NUMERIC(20,4),
    currency_code TEXT NOT NULL DEFAULT 'USD',
    variance NUMERIC(20,4) GENERATED ALWAYS AS (seller_amount - buyer_amount) STORED,
    match_status TEXT NOT NULL DEFAULT 'Unmatched'
        CHECK (match_status IN ('Matched','Unmatched','Disputed','Waived')),
    matched_at TIMESTAMPTZ,
    matched_by UUID,
    dispute_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ic_matches_run ON ic_invoice_matches(consolidation_run_id);
CREATE INDEX IF NOT EXISTS idx_ic_matches_period ON ic_invoice_matches(tenant_id, period_name);

-- Inter-company Balances for Real Elimination (FC-OG-05 / EPM-OG-03)
CREATE TABLE IF NOT EXISTS ic_entity_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    period_name TEXT NOT NULL,
    entity_id UUID NOT NULL,                            -- The legal entity
    counterparty_entity_id UUID NOT NULL,               -- IC counterpart
    account_code TEXT NOT NULL,
    balance_type TEXT NOT NULL                          -- AR | AP | Revenue | Expense
        CHECK (balance_type IN ('AR','AP','Revenue','Expense','Loan','Investment')),
    functional_amount NUMERIC(20,4) NOT NULL DEFAULT 0,
    currency_code TEXT NOT NULL DEFAULT 'USD',
    cta_amount NUMERIC(20,4) DEFAULT 0,                 -- Cumulative Translation Adjustment
    minority_interest_pct NUMERIC(5,4) DEFAULT 0,       -- 0.0000 to 1.0000
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, period_name, entity_id, counterparty_entity_id, account_code, balance_type)
);

CREATE INDEX IF NOT EXISTS idx_ic_balances_period ON ic_entity_balances(tenant_id, period_name, entity_id);

-- GL Minority Interest / CTA Tracking
CREATE TABLE IF NOT EXISTS consolidation_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consolidation_run_id UUID NOT NULL,
    adjustment_type TEXT NOT NULL                       -- IC_Elim | CTA | MinorityInterest | Goodwill
        CHECK (adjustment_type IN ('IC_Elim','CTA','MinorityInterest','Goodwill','Reclassification')),
    entity_id UUID NOT NULL,
    counterparty_entity_id UUID,
    account_code TEXT NOT NULL,
    debit_amount NUMERIC(20,4) DEFAULT 0,
    credit_amount NUMERIC(20,4) DEFAULT 0,
    currency_code TEXT NOT NULL DEFAULT 'USD',
    journal_id UUID,                                    -- Generated elimination journal
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consol_adj_run ON consolidation_adjustments(consolidation_run_id);

-- FSG Financial Reporting Studio (GL-OG-01)
CREATE TABLE IF NOT EXISTS fsg_report_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    report_type TEXT NOT NULL DEFAULT 'IncomeStatement'
        CHECK (report_type IN ('IncomeStatement','BalanceSheet','CashFlow','Custom')),
    rows JSONB NOT NULL DEFAULT '[]',                   -- { row_num, label, account_range, formula, indent }
    columns JSONB NOT NULL DEFAULT '[]',                -- { col_num, label, period_offset, scenario }
    column_sets JSONB DEFAULT '[]',
    currency_option TEXT DEFAULT 'Functional',
    is_published BOOL DEFAULT FALSE,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fsg_report_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_definition_id UUID NOT NULL REFERENCES fsg_report_definitions(id) ON DELETE CASCADE,
    period_name TEXT NOT NULL,
    ledger_id UUID,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    generated_by UUID,
    data JSONB NOT NULL DEFAULT '{}',                   -- Rendered cell values
    status TEXT DEFAULT 'Generated'
        CHECK (status IN ('Generated','Approved','Published'))
);

-- Accounting Scheduler — ESS Job Replacement (SLA-OG-01)
CREATE TABLE IF NOT EXISTS accounting_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    job_type TEXT NOT NULL                              -- CloseJournals | CreateAcctg | TransferToGL | ReconRun
        CHECK (job_type IN ('CloseJournals','CreateAcctg','TransferToGL','ReconRun','ConsolidationRun')),
    schedule_cron TEXT,                                 -- e.g. '0 2 * * *' for 2am nightly
    ledger_id UUID,
    period_name TEXT,
    status TEXT NOT NULL DEFAULT 'Scheduled'
        CHECK (status IN ('Scheduled','Running','Completed','Failed','Cancelled')),
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    last_run_duration_ms INT,
    error_log TEXT,
    run_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_acctg_jobs_tenant ON accounting_jobs(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_acctg_jobs_next_run ON accounting_jobs(next_run_at) WHERE status = 'Scheduled';

-- iXBRL Tagging / Disclosure Management (FC-OG-03)
CREATE TABLE IF NOT EXISTS ixbrl_tagging_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    period_name TEXT NOT NULL,
    filing_standard TEXT NOT NULL DEFAULT 'EDGAR'
        CHECK (filing_standard IN ('EDGAR','ESMA','CH','AU_ASIC')),
    taxonomy_version TEXT,                              -- e.g. 'us-gaap/2024'
    status TEXT NOT NULL DEFAULT 'InProgress'
        CHECK (status IN ('InProgress','Reviewed','Filed','Rejected')),
    document_url TEXT,                                  -- Source HTML/XHTML doc
    output_url TEXT,                                    -- Tagged iXBRL output
    tags JSONB DEFAULT '[]',                            -- Array of { element, context, value, unit }
    filed_at TIMESTAMPTZ,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EPBCS Sandbox Clone Tracking (PBF-OG-04)
CREATE TABLE IF NOT EXISTS planning_sandboxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    source_plan_id UUID,                                -- Plan being cloned
    sandbox_type TEXT NOT NULL DEFAULT 'WhatIf'
        CHECK (sandbox_type IN ('WhatIf','Forecast','Budget','Test')),
    status TEXT NOT NULL DEFAULT 'Creating'
        CHECK (status IN ('Creating','Ready','Archived')),
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    archived_at TIMESTAMPTZ
);

-- Row Level Security
ALTER TABLE account_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_provisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ic_invoice_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE ic_entity_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE fsg_report_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_sandboxes ENABLE ROW LEVEL SECURITY;
