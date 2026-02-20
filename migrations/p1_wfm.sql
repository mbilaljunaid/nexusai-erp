-- P1-F: Time & Labor / WFM Migration
-- Gaps: WFM-OG-01 (FLSA overtime rules engine), WFM-OG-02 (predictive scheduling)

-- ─── FLSA / Overtime Rules ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS overtime_rules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    rule_code       TEXT NOT NULL,
    jurisdiction    TEXT NOT NULL,       -- 'US_FEDERAL'|'CA_ON'|'UK'|'DE'|state/province codes
    standard        TEXT NOT NULL DEFAULT 'FLSA',  -- 'FLSA'|'PROVINCIAL'|'EU_WTD'
    daily_threshold_hours    NUMERIC(5,2) DEFAULT 8,    -- e.g. 8h → OT above
    weekly_threshold_hours   NUMERIC(5,2) DEFAULT 40,   -- e.g. 40h → OT above
    daily_ot_rate            NUMERIC(6,4) DEFAULT 1.5,  -- multiplier
    weekly_ot_rate           NUMERIC(6,4) DEFAULT 1.5,
    double_time_daily        NUMERIC(5,2) DEFAULT 12,   -- CA: >12h = 2x
    double_time_rate         NUMERIC(6,4) DEFAULT 2.0,
    seventh_day_rate         NUMERIC(6,4) DEFAULT 1.5,  -- CA: 7th consecutive = 1.5x (first 8h)
    seventh_day_double_rate  NUMERIC(6,4) DEFAULT 2.0,
    rest_period_minutes      INTEGER DEFAULT 600,   -- min break between shifts
    max_weekly_hours         INTEGER DEFAULT 48,    -- EU WTD: 48h cap
    active                   BOOLEAN DEFAULT TRUE,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, rule_code)
);

CREATE TABLE IF NOT EXISTS timecard_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    employee_id     UUID NOT NULL,
    work_date       DATE NOT NULL,
    clock_in        TIMESTAMPTZ NOT NULL,
    clock_out       TIMESTAMPTZ NOT NULL,
    regular_hours   NUMERIC(6,2) DEFAULT 0,
    ot_hours        NUMERIC(6,2) DEFAULT 0,
    double_hours    NUMERIC(6,2) DEFAULT 0,
    regular_pay     NUMERIC(14,4) DEFAULT 0,
    ot_pay          NUMERIC(14,4) DEFAULT 0,
    double_pay      NUMERIC(14,4) DEFAULT 0,
    total_pay       NUMERIC(14,4) GENERATED ALWAYS AS (regular_pay + ot_pay + double_pay) STORED,
    rule_id         UUID REFERENCES overtime_rules(id),
    hourly_rate     NUMERIC(10,4),
    status          TEXT NOT NULL DEFAULT 'Calculated',  -- 'Calculated'|'Approved'|'Disputed'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tc_emp_date ON timecard_entries(employee_id, work_date);

-- ─── Weekly Overtime Aggregation ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS weekly_overtime_summary (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    employee_id     UUID NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date   DATE NOT NULL,
    total_hours     NUMERIC(6,2) NOT NULL DEFAULT 0,
    regular_hours   NUMERIC(6,2) NOT NULL DEFAULT 0,
    ot_hours        NUMERIC(6,2) NOT NULL DEFAULT 0,
    double_hours    NUMERIC(6,2) NOT NULL DEFAULT 0,
    gross_pay       NUMERIC(14,4) NOT NULL DEFAULT 0,
    rule_id         UUID REFERENCES overtime_rules(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, employee_id, week_start_date)
);

-- ─── Predictive Scheduling ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS schedule_shifts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    employee_id     UUID,               -- null = open shift
    location_id     TEXT,
    role_id         TEXT,
    shift_date      DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    shift_hours     NUMERIC(5,2) NOT NULL,
    status          TEXT NOT NULL DEFAULT 'Scheduled',  -- 'Scheduled'|'Confirmed'|'Swapped'|'Open'|'Cancelled'
    predicted_demand NUMERIC(8,2),      -- ML/rule-based demand score
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS demand_forecasts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    location_id     TEXT NOT NULL,
    role_id         TEXT,
    forecast_date   DATE NOT NULL,
    hour_of_day     INTEGER NOT NULL CHECK (hour_of_day BETWEEN 0 AND 23),
    predicted_demand NUMERIC(10,2) NOT NULL,  -- e.g. # customers, transactions, items
    required_headcount INTEGER NOT NULL DEFAULT 1,
    model_version   TEXT DEFAULT 'rule_v1',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, location_id, forecast_date, hour_of_day)
);

CREATE TABLE IF NOT EXISTS schedule_constraints (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    constraint_type TEXT NOT NULL,   -- 'MaxHoursPerWeek'|'MinRestBetweenShifts'|'PreferredDays'|'NoAvailability'
    employee_id     UUID,            -- null = applies to all
    role_id         TEXT,
    location_id     TEXT,
    value_json      JSONB NOT NULL DEFAULT '{}',
    effective_from  DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to    DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shifts_date ON schedule_shifts(tenant_id, shift_date, location_id);
CREATE INDEX IF NOT EXISTS idx_demand_date ON demand_forecasts(tenant_id, location_id, forecast_date);
