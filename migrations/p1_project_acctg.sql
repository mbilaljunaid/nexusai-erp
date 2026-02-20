-- P1-J: Project Accounting + Costing Migration
-- Gaps: PA-OG-01 (Revenue Recognition), PA-OG-02 (Funding Limits),
--        PA-OG-03 (Progress Billing), PA-OG-04 (Commitment Tracking),
--        PA-OG-05 (Resource Plan vs Actuals), PA-OG-06 (Budget Exception Alerts)

-- ─── Project Revenue Recognition ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS project_revenue_methods (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    project_id          TEXT NOT NULL,
    method              TEXT NOT NULL DEFAULT 'POC',
    -- 'POC' (% completion) | 'MILESTONE' | 'COMPLETED_CONTRACT' | 'TIME_MATERIALS'
    contract_value      NUMERIC(18,4) NOT NULL DEFAULT 0,
    currency_code       TEXT NOT NULL DEFAULT 'USD',
    start_date          DATE,
    end_date            DATE,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_revenue_events (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    project_id          TEXT NOT NULL,
    method_id           UUID REFERENCES project_revenue_methods(id),
    period_start        DATE NOT NULL,
    period_end          DATE NOT NULL,
    pct_complete        NUMERIC(6,4) DEFAULT 0,    -- 0.00–1.00 for POC
    costs_incurred      NUMERIC(18,4) DEFAULT 0,
    costs_to_complete   NUMERIC(18,4) DEFAULT 0,
    revenue_recognized  NUMERIC(18,4) DEFAULT 0,
    cumulative_revenue  NUMERIC(18,4) DEFAULT 0,
    gl_posted           BOOLEAN DEFAULT FALSE,
    gl_reference        TEXT,
    posted_at           TIMESTAMPTZ,
    posted_by           TEXT,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rev_project ON project_revenue_events(tenant_id, project_id);

-- ─── Funding Limits ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS project_funding_limits (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    project_id          TEXT NOT NULL,
    funding_source      TEXT NOT NULL,             -- 'GRANT'|'CONTRACT'|'INTERNAL'|'LOAN'|'EQUITY'
    limit_amount        NUMERIC(18,4) NOT NULL,
    currency_code       TEXT DEFAULT 'USD',
    effective_from      DATE,
    effective_to        DATE,
    utilized_amount     NUMERIC(18,4) DEFAULT 0,
    status              TEXT DEFAULT 'Active',     -- 'Active'|'Exhausted'|'Suspended'|'Closed'
    alert_threshold_pct NUMERIC(5,2) DEFAULT 80,   -- alert when utilization >= X%
    restrict_charges    BOOLEAN DEFAULT TRUE,       -- block charges when exceeded
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fl_project ON project_funding_limits(tenant_id, project_id);

-- ─── Progress Billing ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS progress_billing_schedules (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    project_id          TEXT NOT NULL,
    customer_id         TEXT NOT NULL,
    billing_type        TEXT NOT NULL DEFAULT 'MILESTONE',
    -- 'MILESTONE'|'PERIODIC'|'PERCENT_COMPLETE'|'COST_PLUS'
    billing_frequency   TEXT,                      -- 'MONTHLY'|'QUARTERLY'|null for MILESTONE
    contract_value      NUMERIC(18,4) NOT NULL,
    currency_code       TEXT DEFAULT 'USD',
    retention_pct       NUMERIC(5,2) DEFAULT 0,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS progress_billing_events (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    schedule_id         UUID REFERENCES progress_billing_schedules(id),
    project_id          TEXT NOT NULL,
    billing_period      DATE NOT NULL,
    pct_complete        NUMERIC(6,4) DEFAULT 0,
    amount_billed       NUMERIC(18,4) NOT NULL DEFAULT 0,
    retention_withheld  NUMERIC(18,4) DEFAULT 0,
    invoice_number      TEXT,
    status              TEXT NOT NULL DEFAULT 'Draft',
    -- 'Draft'|'Submitted'|'Approved'|'Invoiced'|'Paid'
    submitted_at        TIMESTAMPTZ,
    approved_at         TIMESTAMPTZ,
    approved_by         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pb_project ON progress_billing_events(tenant_id, project_id);

-- ─── Commitment Tracking ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS project_commitments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    project_id          TEXT NOT NULL,
    commitment_type     TEXT NOT NULL DEFAULT 'PO',
    -- 'PO'|'CONTRACT'|'SUBCONTRACT'|'PRELIM_ESTIMATE'
    reference_number    TEXT,
    vendor_id           TEXT,
    description         TEXT,
    committed_amount    NUMERIC(18,4) NOT NULL,
    currency_code       TEXT DEFAULT 'USD',
    invoiced_amount     NUMERIC(18,4) DEFAULT 0,
    remaining_amount    NUMERIC(18,4) GENERATED ALWAYS AS (committed_amount - invoiced_amount) STORED,
    status              TEXT DEFAULT 'Open',       -- 'Open'|'PartiallyInvoiced'|'FullyInvoiced'|'Closed'|'Cancelled'
    commitment_date     DATE,
    expected_close_date DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commit_project ON project_commitments(tenant_id, project_id, status);

-- ─── Resource Plan vs Actuals ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS project_resource_plans (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    project_id          TEXT NOT NULL,
    resource_id         TEXT NOT NULL,
    resource_type       TEXT DEFAULT 'LABOR',      -- 'LABOR'|'EQUIPMENT'|'MATERIAL'|'SUBCONTRACT'
    role                TEXT,
    period_start        DATE NOT NULL,
    period_end          DATE NOT NULL,
    planned_hours       NUMERIC(10,2) DEFAULT 0,
    planned_cost        NUMERIC(18,4) DEFAULT 0,
    currency_code       TEXT DEFAULT 'USD',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_resource_actuals (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    project_id          TEXT NOT NULL,
    resource_id         TEXT NOT NULL,
    resource_type       TEXT DEFAULT 'LABOR',
    period_start        DATE NOT NULL,
    period_end          DATE NOT NULL,
    actual_hours        NUMERIC(10,2) DEFAULT 0,
    actual_cost         NUMERIC(18,4) DEFAULT 0,
    currency_code       TEXT DEFAULT 'USD',
    source              TEXT,                      -- 'TIMESHEET'|'AP_INVOICE'|'MANUAL'
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rplan_project ON project_resource_plans(tenant_id, project_id);
CREATE INDEX IF NOT EXISTS idx_ract_project ON project_resource_actuals(tenant_id, project_id);

-- ─── Budget Exception Alerts ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS project_budget_alerts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    project_id          TEXT NOT NULL,
    alert_type          TEXT NOT NULL,
    -- 'COST_OVERRUN'|'SCHEDULE_VARIANCE'|'FUNDING_LIMIT'|'COMMITMENT_SPIKE'|'MARGIN_DROP'
    severity            TEXT NOT NULL DEFAULT 'Warning',  -- 'Info'|'Warning'|'Critical'
    budget_amount       NUMERIC(18,4),
    actual_amount       NUMERIC(18,4),
    variance_pct        NUMERIC(8,4),
    threshold_pct       NUMERIC(8,4),
    description         TEXT,
    is_acknowledged     BOOLEAN DEFAULT FALSE,
    acknowledged_by     TEXT,
    acknowledged_at     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_project ON project_budget_alerts(tenant_id, project_id, is_acknowledged);
