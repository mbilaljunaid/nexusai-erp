-- P1-C: Core HR & Multi-Country Payroll Migration
-- Gaps: HR-OG-01 (date-track), HR-OG-02 (absence), HR-OG-03 (payroll elements),
--        HR-OG-04 (multi-country payroll), HR-OG-05 (benefits), HR-OG-06 (payslip)

-- ─── Date-Track History ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hr_date_track_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    entity_type     TEXT NOT NULL,  -- 'assignment' | 'salary' | 'position' | 'grade'
    entity_id       UUID NOT NULL,
    effective_date  DATE NOT NULL,
    end_date        DATE,           -- NULL = currently active
    payload         JSONB NOT NULL, -- snapshot of fields at effective_date
    changed_by      TEXT NOT NULL,
    change_reason   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dt_entity ON hr_date_track_history(tenant_id, entity_type, entity_id, effective_date DESC);

-- ─── Absence Management ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS absence_types (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    code            TEXT NOT NULL,
    name            TEXT NOT NULL,
    accrual_rate    NUMERIC(8,4) DEFAULT 0,  -- hours per pay period
    max_carryover   NUMERIC(8,4) DEFAULT 0,
    is_paid         BOOLEAN NOT NULL DEFAULT TRUE,
    requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS absence_balances (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    employee_id     UUID NOT NULL,
    absence_type_id UUID NOT NULL REFERENCES absence_types(id),
    year            INTEGER NOT NULL,
    accrued         NUMERIC(8,4) NOT NULL DEFAULT 0,
    used            NUMERIC(8,4) NOT NULL DEFAULT 0,
    balance         NUMERIC(8,4) GENERATED ALWAYS AS (accrued - used) STORED,
    last_accrual_date DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, employee_id, absence_type_id, year)
);

CREATE TABLE IF NOT EXISTS absence_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    employee_id     UUID NOT NULL,
    absence_type_id UUID NOT NULL REFERENCES absence_types(id),
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    days_requested  NUMERIC(6,2) NOT NULL,
    reason          TEXT,
    status          TEXT NOT NULL DEFAULT 'Pending',  -- 'Pending'|'Approved'|'Rejected'|'Cancelled'
    approved_by     TEXT,
    approved_at     TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_absence_req_employee ON absence_requests(tenant_id, employee_id, status);
CREATE INDEX IF NOT EXISTS idx_absence_req_dates ON absence_requests(tenant_id, start_date, end_date);

-- ─── Payroll Elements ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payroll_elements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    code            TEXT NOT NULL,
    name            TEXT NOT NULL,
    element_type    TEXT NOT NULL,  -- 'Earnings' | 'Deduction' | 'Tax' | 'Employer_Contribution'
    calculation_rule TEXT NOT NULL, -- 'Flat' | 'Percent_of_Base' | 'Formula' | 'Table'
    formula         TEXT,           -- JS-safe formula string, e.g. "base * 0.15"
    gl_account_code TEXT,
    is_statutory    BOOLEAN NOT NULL DEFAULT FALSE,
    country_code    TEXT,           -- NULL = global
    effective_from  DATE NOT NULL,
    effective_to    DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS employee_element_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    employee_id     UUID NOT NULL,
    element_id      UUID NOT NULL REFERENCES payroll_elements(id),
    input_value     NUMERIC(18,4),  -- override value (e.g. fixed bonus amount)
    effective_from  DATE NOT NULL,
    effective_to    DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Payroll Runs ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payroll_runs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    payroll_name    TEXT NOT NULL,
    period_start    DATE NOT NULL,
    period_end      DATE NOT NULL,
    pay_date        DATE NOT NULL,
    country_code    TEXT NOT NULL,
    currency_code   TEXT NOT NULL DEFAULT 'USD',
    status          TEXT NOT NULL DEFAULT 'Draft',  -- 'Draft'|'Processing'|'Review'|'Approved'|'Paid'|'Reversed'
    employee_count  INTEGER DEFAULT 0,
    gross_total     NUMERIC(18,4) DEFAULT 0,
    net_total       NUMERIC(18,4) DEFAULT 0,
    tax_total       NUMERIC(18,4) DEFAULT 0,
    employer_ni     NUMERIC(18,4) DEFAULT 0,
    processed_by    TEXT,
    approved_by     TEXT,
    gl_batch_id     UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payroll_run_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id          UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
    employee_id     UUID NOT NULL,
    element_id      UUID NOT NULL REFERENCES payroll_elements(id),
    element_code    TEXT NOT NULL,
    calculated_amount NUMERIC(18,4) NOT NULL DEFAULT 0,
    currency_code   TEXT NOT NULL DEFAULT 'USD',
    gl_account_code TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payroll_runs_tenant ON payroll_runs(tenant_id, status, pay_date DESC);
CREATE INDEX IF NOT EXISTS idx_payroll_results_run ON payroll_run_results(run_id, employee_id);

-- ─── Compensation Workbench ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS compensation_plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    name            TEXT NOT NULL,
    plan_type       TEXT NOT NULL,  -- 'MeritReview' | 'BonusCycle' | 'PromoRound'
    cycle_start     DATE NOT NULL,
    cycle_end       DATE NOT NULL,
    budget_total    NUMERIC(18,4),
    currency_code   TEXT NOT NULL DEFAULT 'USD',
    status          TEXT NOT NULL DEFAULT 'Planning',  -- 'Planning'|'InProgress'|'Approved'|'Applied'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compensation_proposals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id         UUID NOT NULL REFERENCES compensation_plans(id) ON DELETE CASCADE,
    employee_id     UUID NOT NULL,
    current_salary  NUMERIC(18,4) NOT NULL,
    proposed_salary NUMERIC(18,4),
    bonus_amount    NUMERIC(18,4),
    merit_pct       NUMERIC(6,4),
    currency_code   TEXT NOT NULL DEFAULT 'USD',
    status          TEXT NOT NULL DEFAULT 'Draft',  -- 'Draft'|'Submitted'|'Approved'|'Applied'
    manager_id      TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Statutory Payment Files ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS statutory_payment_files (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    run_id          UUID REFERENCES payroll_runs(id),
    format          TEXT NOT NULL,  -- 'ACH_NACHA' | 'BACS' | 'SEPA_PAIN001' | 'FPS'
    file_content    TEXT NOT NULL,  -- The generated file payload
    file_name       TEXT NOT NULL,
    total_amount    NUMERIC(18,4) NOT NULL,
    currency_code   TEXT NOT NULL DEFAULT 'USD',
    payment_count   INTEGER NOT NULL DEFAULT 0,
    status          TEXT NOT NULL DEFAULT 'Generated',  -- 'Generated'|'Submitted'|'Settled'|'Rejected'
    generated_by    TEXT NOT NULL,
    generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at    TIMESTAMPTZ,
    settled_at      TIMESTAMPTZ
);

-- ─── Benefits Enrollment ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS benefit_plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    name            TEXT NOT NULL,
    benefit_type    TEXT NOT NULL,  -- 'Medical' | 'Dental' | 'Vision' | 'Life' | '401k' | 'FSA' | 'HSA'
    provider_name   TEXT,
    employee_cost   NUMERIC(10,4) DEFAULT 0,  -- per-period employee contribution
    employer_cost   NUMERIC(10,4) DEFAULT 0,
    currency_code   TEXT NOT NULL DEFAULT 'USD',
    enrollment_start DATE,
    enrollment_end   DATE,
    effective_from  DATE NOT NULL,
    effective_to    DATE,
    max_dependents  INTEGER DEFAULT 10,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS benefit_enrollments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    employee_id     UUID NOT NULL,
    plan_id         UUID NOT NULL REFERENCES benefit_plans(id),
    enrollment_date DATE NOT NULL,
    effective_from  DATE NOT NULL,
    effective_to    DATE,
    status          TEXT NOT NULL DEFAULT 'Active',  -- 'Active'|'Terminated'|'OnLeave'
    dependents      JSONB DEFAULT '[]',
    waived          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, employee_id, plan_id, effective_from)
);

CREATE INDEX IF NOT EXISTS idx_benefits_employee ON benefit_enrollments(tenant_id, employee_id, status);
