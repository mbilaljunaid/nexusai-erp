-- P1-Q: Remaining Module Gaps Migration
-- EVM/Construction, CPQ/CRM, Expense, LCM, Lease Modifications,
-- MDM, Stage-Gate PPM, Procurement CLM, Revenue GL Recon, Talent

-- ─── EVM / Construction ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS evm_baselines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    project_id      TEXT NOT NULL,
    baseline_name   TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'Active', -- 'Active'|'Superseded'
    total_bac       NUMERIC(18,2),  -- Budget at Completion
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_evm_baselines_proj ON evm_baselines(tenant_id, project_id);

CREATE TABLE IF NOT EXISTS evm_control_accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    baseline_id     UUID NOT NULL REFERENCES evm_baselines(id),
    wbs_code        TEXT NOT NULL,
    description     TEXT,
    planned_value   NUMERIC(18,2) DEFAULT 0,
    earned_value    NUMERIC(18,2) DEFAULT 0,
    actual_cost     NUMERIC(18,2) DEFAULT 0,
    currency        TEXT NOT NULL DEFAULT 'USD'
);
CREATE INDEX IF NOT EXISTS idx_evm_ca_baseline ON evm_control_accounts(tenant_id, baseline_id);

CREATE TABLE IF NOT EXISTS drawing_register (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    project_id      TEXT NOT NULL,
    drawing_number  TEXT NOT NULL,
    title           TEXT NOT NULL,
    discipline      TEXT,       -- 'CIVIL'|'MECHANICAL'|'ELECTRICAL'|'PIPING'
    rev             TEXT NOT NULL DEFAULT 'A',
    status          TEXT NOT NULL DEFAULT 'For_Review', -- 'Draft'|'For_Review'|'Approved'|'Superseded'
    file_url        TEXT,
    issued_by       TEXT,
    approved_by     TEXT,
    issued_at       TIMESTAMPTZ,
    revisions       JSONB DEFAULT '[]',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_drawing_register ON drawing_register(tenant_id, project_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_drawing_unique ON drawing_register(tenant_id, project_id, drawing_number, rev);

-- ─── CPQ / CRM ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cpq_quotes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    quote_number    TEXT NOT NULL,
    opportunity_id  TEXT,
    customer_id     TEXT NOT NULL,
    currency        TEXT NOT NULL DEFAULT 'USD',
    status          TEXT NOT NULL DEFAULT 'Draft',
    -- 'Draft'|'Pending_Approval'|'Approved'|'Presented'|'Won'|'Lost'|'Expired'
    valid_until     DATE,
    discount_pct    NUMERIC(6,2) DEFAULT 0,
    list_total      NUMERIC(18,2) DEFAULT 0,
    net_total       NUMERIC(18,2) DEFAULT 0,
    margin_pct      NUMERIC(6,2),
    approved_by     TEXT,
    presented_at    TIMESTAMPTZ,
    created_by      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cpq_tenant ON cpq_quotes(tenant_id, status);

CREATE TABLE IF NOT EXISTS cpq_quote_lines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    quote_id        UUID NOT NULL REFERENCES cpq_quotes(id),
    line_number     INT NOT NULL,
    product_id      TEXT NOT NULL,
    description     TEXT,
    quantity        NUMERIC(18,4) NOT NULL DEFAULT 1,
    unit_price      NUMERIC(18,4) NOT NULL DEFAULT 0,
    discount_pct    NUMERIC(6,2) DEFAULT 0,
    net_price       NUMERIC(18,4) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_pct / 100.0)) STORED,
    product_config  JSONB DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_cpq_lines ON cpq_quote_lines(tenant_id, quote_id);

CREATE TABLE IF NOT EXISTS renewal_contracts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    contract_number TEXT NOT NULL,
    customer_id     TEXT NOT NULL,
    subscription_id TEXT,
    renewal_date    DATE NOT NULL,
    status          TEXT NOT NULL DEFAULT 'Pending', -- 'Pending'|'Renewed'|'Churned'|'On_Hold'
    auto_renew      BOOLEAN DEFAULT FALSE,
    mrr             NUMERIC(14,2),
    currency        TEXT DEFAULT 'USD',
    renewed_at      TIMESTAMPTZ,
    renewed_by      TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_renewals_tenant ON renewal_contracts(tenant_id, renewal_date, status);

-- ─── Expense: Travel Pre-Auth & Mileage ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS travel_prereqs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    request_number  TEXT NOT NULL,
    employee_id     TEXT NOT NULL,
    purpose         TEXT,
    destination     TEXT,
    departure_date  DATE,
    return_date     DATE,
    estimated_cost  NUMERIC(14,2),
    currency        TEXT DEFAULT 'USD',
    status          TEXT NOT NULL DEFAULT 'Draft',
    -- 'Draft'|'Submitted'|'Approved'|'Rejected'|'Cancelled'
    approved_by     TEXT,
    approved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_travel_prereqs ON travel_prereqs(tenant_id, employee_id, status);

CREATE TABLE IF NOT EXISTS mileage_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    employee_id     TEXT NOT NULL,
    expense_report_id TEXT,
    trip_date       DATE NOT NULL,
    from_location   TEXT,
    to_location     TEXT,
    miles           NUMERIC(10,2) NOT NULL,
    rate_per_mile   NUMERIC(8,4) NOT NULL,
    reimbursable    NUMERIC(12,2) GENERATED ALWAYS AS (miles * rate_per_mile) STORED,
    gps_track       JSONB DEFAULT '[]',  -- [{lat, lng, ts}]
    status          TEXT NOT NULL DEFAULT 'Draft', -- 'Draft'|'Submitted'|'Approved'|'Paid'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mileage ON mileage_logs(tenant_id, employee_id, trip_date);

-- ─── LCM: Duty Drawback & C-TPAT ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS duty_drawback_claims (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    claim_number    TEXT NOT NULL,
    claim_type      TEXT NOT NULL DEFAULT 'MANUFACTURING', -- 'MANUFACTURING'|'UNUSED'|'REJECTED'
    import_entry    TEXT,
    export_entry    TEXT,
    import_date     DATE,
    export_date     DATE,
    duties_paid     NUMERIC(14,2),
    drawback_rate   NUMERIC(6,4) DEFAULT 0.99,
    drawback_amount NUMERIC(14,2) GENERATED ALWAYS AS (duties_paid * drawback_rate) STORED,
    currency        TEXT DEFAULT 'USD',
    status          TEXT NOT NULL DEFAULT 'Draft',
    -- 'Draft'|'Filed'|'Under_Review'|'Approved'|'Rejected'|'Refunded'
    filed_at        TIMESTAMPTZ,
    approved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_drawback ON duty_drawback_claims(tenant_id, status);

CREATE TABLE IF NOT EXISTS ctpat_assessments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    partner_id      TEXT NOT NULL,  -- supplier / carrier
    partner_type    TEXT NOT NULL DEFAULT 'SUPPLIER', -- 'SUPPLIER'|'CARRIER'|'BROKER'
    assessment_date DATE NOT NULL,
    status          TEXT NOT NULL DEFAULT 'Scheduled',
    -- 'Scheduled'|'In_Progress'|'Passed'|'Remediation'|'Failed'
    score           NUMERIC(5,2),
    findings        JSONB DEFAULT '[]',  -- [{area, severity, finding, remediation}]
    certified_until DATE,
    assessed_by     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ctpat ON ctpat_assessments(tenant_id, partner_id, status);

-- ─── Lease Modifications & Subleases ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lease_modifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    lease_id        TEXT NOT NULL,
    modification_type TEXT NOT NULL DEFAULT 'EXTENSION',
    -- 'EXTENSION'|'PARTIAL_TERMINATION'|'SCOPE_CHANGE'|'RATE_CHANGE'
    effective_date  DATE NOT NULL,
    new_end_date    DATE,
    new_monthly_pmt NUMERIC(14,2),
    incremental_rou NUMERIC(14,2),
    incremental_liability NUMERIC(14,2),
    approved_by     TEXT,
    accounting_memo TEXT,
    status          TEXT NOT NULL DEFAULT 'Draft',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lease_mods ON lease_modifications(tenant_id, lease_id);

CREATE TABLE IF NOT EXISTS subleases (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    parent_lease_id TEXT NOT NULL,
    sublessee       TEXT NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE,
    monthly_income  NUMERIC(14,2),
    currency        TEXT DEFAULT 'USD',
    status          TEXT NOT NULL DEFAULT 'Active', -- 'Active'|'Expired'|'Terminated'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subleases ON subleases(tenant_id, parent_lease_id);

-- ─── Stage-Gate PPM ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS stage_gates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    project_id      TEXT NOT NULL,
    gate_name       TEXT NOT NULL,
    gate_order      INT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'Pending',
    -- 'Pending'|'In_Review'|'Passed'|'Conditional'|'Failed'
    criteria        JSONB DEFAULT '[]',  -- [{name, required, met}]
    reviewed_by     TEXT,
    reviewed_at     TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_stage_gates ON stage_gates(tenant_id, project_id, gate_order);

CREATE TABLE IF NOT EXISTS milestone_billing_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    project_id      TEXT NOT NULL,
    contract_id     TEXT,
    milestone_name  TEXT NOT NULL,
    billing_amount  NUMERIC(18,2),
    currency        TEXT DEFAULT 'USD',
    triggered_at    TIMESTAMPTZ,
    invoice_id      TEXT,
    status          TEXT NOT NULL DEFAULT 'Pending',
    -- 'Pending'|'Triggered'|'Invoiced'|'Paid'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_milestone_billing ON milestone_billing_events(tenant_id, project_id, status);

-- ─── Revenue GL Recon ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gl_recon_runs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    period          TEXT NOT NULL,
    run_by          TEXT,
    status          TEXT NOT NULL DEFAULT 'Running',
    -- 'Running'|'Complete'|'Failed'
    matched_count   INT DEFAULT 0,
    unmatched_count INT DEFAULT 0,
    variance_total  NUMERIC(18,2) DEFAULT 0,
    results         JSONB DEFAULT '[]',
    run_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gl_recon ON gl_recon_runs(tenant_id, period);

-- ─── MDM: Data Quality ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS mdm_data_quality_scores (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    entity_type     TEXT NOT NULL,  -- 'CUSTOMER'|'SUPPLIER'|'ITEM'|'EMPLOYEE'
    entity_id       TEXT NOT NULL,
    completeness    NUMERIC(5,2),
    accuracy        NUMERIC(5,2),
    consistency     NUMERIC(5,2),
    anomaly_flags   JSONB DEFAULT '[]',
    enriched_by     TEXT,           -- 'DnB'|'manual'|'AI'
    enriched_at     TIMESTAMPTZ,
    scored_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_mdm_entity ON mdm_data_quality_scores(tenant_id, entity_type, entity_id);

-- ─── Talent: Cascading Goals & Nine-Box ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS talent_goals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    employee_id     TEXT NOT NULL,
    parent_goal_id  UUID REFERENCES talent_goals(id),  -- cascading
    goal_title      TEXT NOT NULL,
    description     TEXT,
    weight          NUMERIC(5,2) DEFAULT 100,
    due_date        DATE,
    progress_pct    NUMERIC(5,2) DEFAULT 0,
    status          TEXT NOT NULL DEFAULT 'Active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_talent_goals ON talent_goals(tenant_id, employee_id, parent_goal_id);

CREATE TABLE IF NOT EXISTS nine_box_assessments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    employee_id     TEXT NOT NULL,
    period          TEXT NOT NULL,   -- YYYY
    performance     INT NOT NULL CHECK (performance BETWEEN 1 AND 3),  -- 1=Low,2=Med,3=High
    potential       INT NOT NULL CHECK (potential BETWEEN 1 AND 3),
    box_label       TEXT GENERATED ALWAYS AS (
        CASE (performance * 10 + potential)
            WHEN 11 THEN 'Underperformer' WHEN 12 THEN 'Inconsistent Player' WHEN 13 THEN 'Enigma'
            WHEN 21 THEN 'Core Player' WHEN 22 THEN 'Core Player' WHEN 23 THEN 'High Potential'
            WHEN 31 THEN 'Solid Performer' WHEN 32 THEN 'High Performer' WHEN 33 THEN 'Star'
        END
    ) STORED,
    assessed_by     TEXT,
    notes           TEXT,
    gdpr_purge_at   TIMESTAMPTZ,  -- auto-purge date for GDPR retention
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_nine_box ON nine_box_assessments(tenant_id, employee_id, period);
