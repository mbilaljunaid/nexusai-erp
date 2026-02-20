-- P1-L: HR Analytics & Compliance Migration
-- Gaps: HR-OG-01 (Gender Pay Gap), HR-OG-02 (Workforce Benchmarking),
--       HR-OG-03 (Attrition Prediction), HR-OG-04 (FCPA Training),
--       HR-OG-05 (Regulatory Calendar)

-- ─── Gender Pay Gap Analysis ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pay_equity_snapshots (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    snapshot_date       DATE NOT NULL,
    report_period       TEXT NOT NULL,           -- e.g. '2025-Q4', '2025-ANNUAL'
    employee_id         TEXT NOT NULL,
    gender              TEXT,                    -- 'M'|'F'|'X'|'UNDISCLOSED'
    race_ethnicity      TEXT,
    job_level           TEXT,                    -- e.g. 'IC1'–'IC6', 'M1'–'M5', 'E1'–'E3'
    job_family          TEXT,
    department          TEXT,
    country_code        TEXT,
    base_salary         NUMERIC(18,2),
    total_compensation  NUMERIC(18,2),           -- base + bonus + equity
    currency_code       TEXT DEFAULT 'USD',
    years_experience    NUMERIC(5,1),
    years_at_company    NUMERIC(5,1),
    performance_band    TEXT,                    -- 'Exceeds'|'Meets'|'Below'
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pay_equity_tenant  ON pay_equity_snapshots(tenant_id, report_period);
CREATE INDEX IF NOT EXISTS idx_pay_equity_job     ON pay_equity_snapshots(tenant_id, job_family, job_level);

-- ─── Workforce Benchmarking ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS workforce_benchmarks (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    benchmark_source    TEXT NOT NULL DEFAULT 'INTERNAL',
    -- 'INTERNAL'|'MERCER'|'RADFORD'|'WILLIS_TOWERS'|'CUSTOM'
    job_family          TEXT NOT NULL,
    job_level           TEXT NOT NULL,
    country_code        TEXT NOT NULL DEFAULT 'US',
    p25_salary          NUMERIC(18,2),
    p50_salary          NUMERIC(18,2),
    p75_salary          NUMERIC(18,2),
    p90_salary          NUMERIC(18,2),
    currency_code       TEXT DEFAULT 'USD',
    effective_date      DATE NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_benchmark_tenant   ON workforce_benchmarks(tenant_id, job_family, job_level);

-- ─── Attrition Prediction (ML Feature Store) ─────────────────────────────────

CREATE TABLE IF NOT EXISTS attrition_risk_scores (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    employee_id         TEXT NOT NULL,
    scored_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    risk_score          NUMERIC(5,4) NOT NULL,   -- 0.0000–1.0000
    risk_band           TEXT NOT NULL,           -- 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'
    -- Feature contributions (SHAP-style)
    top_factors         JSONB DEFAULT '[]',      -- [{ factor, value, direction, weight }]
    tenure_months       INTEGER,
    engagement_score    NUMERIC(4,2),
    last_promotion_days INTEGER,
    manager_tenure_months INTEGER,
    compa_ratio         NUMERIC(5,3),            -- 1.0 = at market
    recent_absence_days INTEGER,
    overdue_goals       INTEGER,
    model_version       TEXT DEFAULT 'v1',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attrition_tenant   ON attrition_risk_scores(tenant_id, risk_band, scored_at);
CREATE INDEX IF NOT EXISTS idx_attrition_employee ON attrition_risk_scores(tenant_id, employee_id);

-- ─── FCPA Training Tracker ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS fcpa_training_assignments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    employee_id         TEXT NOT NULL,
    training_module     TEXT NOT NULL,
    -- 'FCPA_BASICS'|'ANTI_BRIBERY'|'GIFTS_ENTERTAINMENT'|'THIRD_PARTY_DUE_DILIGENCE'|'SANCTIONS'
    required_by         DATE NOT NULL,
    status              TEXT NOT NULL DEFAULT 'Pending',
    -- 'Pending'|'In_Progress'|'Completed'|'Overdue'|'Exempt'
    assigned_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    score_pct           INTEGER,                 -- 0–100 quiz score
    passing_score_pct   INTEGER DEFAULT 80,
    passed              BOOLEAN,
    certificate_url     TEXT,
    exemption_reason    TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fcpa_tenant       ON fcpa_training_assignments(tenant_id, status, required_by);
CREATE INDEX IF NOT EXISTS idx_fcpa_employee     ON fcpa_training_assignments(tenant_id, employee_id);

-- ─── Regulatory Calendar ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS regulatory_calendar_events (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    title               TEXT NOT NULL,
    regulation          TEXT,        -- 'GDPR'|'SOX'|'HIPAA'|'FCPA'|'EEOC'|'OSHA'|'ADA'|'CUSTOM'
    jurisdiction        TEXT,        -- 'US'|'EU'|'UK'|'GLOBAL'|custom
    event_type          TEXT NOT NULL DEFAULT 'FILING',
    -- 'FILING'|'AUDIT'|'TRAINING'|'POLICY_REVIEW'|'REPORTING'|'CERTIFICATION'
    due_date            DATE NOT NULL,
    recurrence          TEXT,        -- 'NONE'|'MONTHLY'|'QUARTERLY'|'ANNUAL'
    owner_id            TEXT,
    status              TEXT NOT NULL DEFAULT 'Upcoming',
    -- 'Upcoming'|'In_Progress'|'Completed'|'Overdue'|'Waived'
    description         TEXT,
    reminder_days       INTEGER DEFAULT 30,
    completed_at        TIMESTAMPTZ,
    completed_by        TEXT,
    attachments         JSONB DEFAULT '[]',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_regcal_tenant     ON regulatory_calendar_events(tenant_id, due_date);
CREATE INDEX IF NOT EXISTS idx_regcal_status     ON regulatory_calendar_events(tenant_id, status, regulation);
