-- P1-O: EPM + EAM Migration
-- EPM: ESG Planning, Budgetary Control, Narrative Reporting
-- EAM: Permit-to-Work, Condition-Based Monitoring, Meter PM

-- ─── ESG Planning ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS esg_goals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    goal_code       TEXT NOT NULL,
    goal_name       TEXT NOT NULL,
    category        TEXT NOT NULL DEFAULT 'ENVIRONMENTAL',
    -- 'ENVIRONMENTAL'|'SOCIAL'|'GOVERNANCE'
    subcategory     TEXT,  -- e.g. 'CARBON', 'WATER', 'DIVERSITY', 'BOARD'
    unit            TEXT,  -- e.g. 'tCO2e', 'MWh', '%', 'headcount'
    baseline_value  NUMERIC(18,4),
    baseline_year   INT,
    target_value    NUMERIC(18,4),
    target_year     INT,
    owner           TEXT,
    status          TEXT NOT NULL DEFAULT 'Draft',
    -- 'Draft'|'Active'|'On_Track'|'At_Risk'|'Off_Track'|'Achieved'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_esg_goals_tenant ON esg_goals(tenant_id, category, status);

CREATE TABLE IF NOT EXISTS esg_actuals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    goal_id         UUID NOT NULL REFERENCES esg_goals(id),
    period          TEXT NOT NULL,   -- YYYY-MM or YYYY
    actual_value    NUMERIC(18,4) NOT NULL,
    data_source     TEXT,
    verified_by     TEXT,
    notes           TEXT,
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_esg_actuals_goal ON esg_actuals(tenant_id, goal_id, period);

-- ─── Budgetary Control ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS budget_controls (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    budget_version      TEXT NOT NULL DEFAULT 'Working',
    -- 'Working'|'Approved'|'Revised'|'Final'
    cost_center         TEXT NOT NULL,
    gl_account          TEXT NOT NULL,
    period              TEXT NOT NULL,       -- YYYY-MM
    currency            TEXT NOT NULL DEFAULT 'USD',
    budget_amount       NUMERIC(18,2) NOT NULL DEFAULT 0,
    committed_amount    NUMERIC(18,2) NOT NULL DEFAULT 0,
    actual_amount       NUMERIC(18,2) NOT NULL DEFAULT 0,
    encumbrance_amount  NUMERIC(18,2) NOT NULL DEFAULT 0,
    tolerance_pct       NUMERIC(6,2) DEFAULT 10.0,
    control_action      TEXT NOT NULL DEFAULT 'WARN',
    -- 'NONE'|'WARN'|'HOLD'|'HARD_STOP'
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_budget_ctrl_tenant ON budget_controls(tenant_id, period, cost_center);
CREATE UNIQUE INDEX IF NOT EXISTS idx_budget_ctrl_unique ON budget_controls(tenant_id, budget_version, cost_center, gl_account, period);

CREATE TABLE IF NOT EXISTS budget_check_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    control_id      UUID REFERENCES budget_controls(id),
    check_type      TEXT NOT NULL DEFAULT 'COMMIT',
    -- 'COMMIT'|'ACTUAL'|'ENCUMBRANCE'
    amount_checked  NUMERIC(18,2),
    available_amount NUMERIC(18,2),
    result          TEXT NOT NULL,  -- 'PASS'|'WARN'|'BLOCKED'
    source_doc      TEXT,
    checked_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_budget_check_tenant ON budget_check_log(tenant_id, checked_at DESC);

-- ─── Narrative Reporting ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS narrative_reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    report_name     TEXT NOT NULL,
    report_type     TEXT NOT NULL DEFAULT 'MD_AND_A',
    -- 'MD_AND_A'|'BOARD_PACK'|'ESG_REPORT'|'INVESTOR_DECK'|'CUSTOM'
    period          TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'Draft',
    -- 'Draft'|'In_Review'|'Approved'|'Published'
    sections        JSONB DEFAULT '[]',
    -- [{id, title, body, data_refs, order, last_edited_by, last_edited_at}]
    template_id     TEXT,
    created_by      TEXT,
    approved_by     TEXT,
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_narr_reports_tenant ON narrative_reports(tenant_id, period, status);

-- ─── Permit-to-Work ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS permits_to_work (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    permit_number   TEXT NOT NULL,
    permit_type     TEXT NOT NULL DEFAULT 'COLD_WORK',
    -- 'COLD_WORK'|'HOT_WORK'|'CONFINED_SPACE'|'ELECTRICAL'|'HEIGHT'|'EXCAVATION'|'RADIATION'
    asset_id        TEXT,
    location        TEXT,
    description     TEXT,
    hazards         JSONB DEFAULT '[]',
    precautions     JSONB DEFAULT '[]',
    status          TEXT NOT NULL DEFAULT 'Draft',
    -- 'Draft'|'Pending_Approval'|'Approved'|'Active'|'Suspended'|'Closed'|'Cancelled'
    requested_by    TEXT,
    approved_by     TEXT,
    issued_by       TEXT,
    contractor      TEXT,
    start_datetime  TIMESTAMPTZ,
    end_datetime    TIMESTAMPTZ,
    closed_at       TIMESTAMPTZ,
    events          JSONB DEFAULT '[]',   -- [{at, by, action, note}]
    extensions      JSONB DEFAULT '[]',   -- [{requested_by, new_end, approved_by}]
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ptw_tenant ON permits_to_work(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_ptw_asset  ON permits_to_work(tenant_id, asset_id);

-- ─── Condition-Based Monitoring (CBM) ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cbm_readings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    asset_id        TEXT NOT NULL,
    parameter_name  TEXT NOT NULL,   -- e.g. 'VIBRATION', 'TEMP', 'OIL_LEVEL'
    parameter_unit  TEXT,
    reading_value   NUMERIC(18,6) NOT NULL,
    reading_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source          TEXT DEFAULT 'MANUAL', -- 'MANUAL'|'IOT'|'SCADA'
    alert_generated BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_cbm_asset ON cbm_readings(tenant_id, asset_id, parameter_name, reading_at DESC);

CREATE TABLE IF NOT EXISTS cbm_thresholds (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    asset_id        TEXT NOT NULL,
    parameter_name  TEXT NOT NULL,
    warn_low        NUMERIC(18,6),
    warn_high       NUMERIC(18,6),
    critical_low    NUMERIC(18,6),
    critical_high   NUMERIC(18,6),
    action_on_warn  TEXT DEFAULT 'ALERT',       -- 'ALERT'|'CREATE_WO'
    action_on_crit  TEXT DEFAULT 'CREATE_WO',   -- 'ALERT'|'CREATE_WO'|'SHUTDOWN'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cbm_thresh_unique ON cbm_thresholds(tenant_id, asset_id, parameter_name);

-- ─── Meter-Based PM ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS meters (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    asset_id        TEXT NOT NULL,
    meter_name      TEXT NOT NULL,
    unit            TEXT NOT NULL,  -- 'hours'|'km'|'cycles'|'kWh'
    current_reading NUMERIC(18,4) NOT NULL DEFAULT 0,
    last_reading_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meter_readings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    meter_id        UUID NOT NULL REFERENCES meters(id),
    reading_value   NUMERIC(18,4) NOT NULL,
    delta           NUMERIC(18,4),
    read_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by     TEXT
);
CREATE INDEX IF NOT EXISTS idx_meter_readings ON meter_readings(tenant_id, meter_id, read_at DESC);

CREATE TABLE IF NOT EXISTS meter_pm_schedules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    meter_id        UUID NOT NULL REFERENCES meters(id),
    asset_id        TEXT NOT NULL,
    task_name       TEXT NOT NULL,
    interval_value  NUMERIC(18,4) NOT NULL,
    last_done_at_reading NUMERIC(18,4) DEFAULT 0,
    next_due_at_reading  NUMERIC(18,4),
    lead_value      NUMERIC(18,4) DEFAULT 0,
    work_order_template JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_meter_pm_meter ON meter_pm_schedules(tenant_id, meter_id);
