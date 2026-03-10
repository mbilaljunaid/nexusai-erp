-- ============================================================
-- Oracle Parity — GL Statistical Balance Table
-- Round 6 (March 8 2026)
-- Maps to Oracle: GL_STATISTICAL_BALANCES + GL_STATISTICAL_UNITS
-- ============================================================

-- Statistical Units of Measure (headcount, units shipped, etc.)
CREATE TABLE IF NOT EXISTS gl_statistical_units (
    id              SERIAL PRIMARY KEY,
    tenant_id       VARCHAR(36),
    unit_code       VARCHAR(20)  NOT NULL UNIQUE,
    unit_name       VARCHAR(100) NOT NULL,
    precision_digits INTEGER      NOT NULL DEFAULT 2,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- Seed standard units
INSERT INTO gl_statistical_units (unit_code, unit_name, precision_digits)
VALUES
    ('HEADCOUNT',  'Headcount (FTE)',       0),
    ('UNITS',      'Units Produced',        0),
    ('HOURS',      'Hours Worked',          2),
    ('MILES',      'Miles / Distance',      1),
    ('SQFT',       'Square Footage',        0),
    ('ORDERS',     'Number of Orders',      0),
    ('CUSTOMERS',  'Active Customers',      0),
    ('CALLS',      'Call Volume',           0)
ON CONFLICT (unit_code) DO NOTHING;

-- Statistical Balances — mirrors GL_STATISTICAL_BALANCES in Oracle
CREATE TABLE IF NOT EXISTS gl_statistical_balances (
    id              SERIAL PRIMARY KEY,
    tenant_id       VARCHAR(36),
    ledger_id       VARCHAR(50),
    period_name     VARCHAR(20)  NOT NULL,
    period_year     INTEGER      NOT NULL,
    period_num      INTEGER      NOT NULL CHECK (period_num BETWEEN 1 AND 13),
    stat_unit_id    INTEGER      NOT NULL REFERENCES gl_statistical_units(id),
    code_combination_id VARCHAR(100),  -- Segment values for the stat account
    stat_account    VARCHAR(50)  NOT NULL,  -- The S-type GL account code
    entered_amount  NUMERIC(22, 6) NOT NULL DEFAULT 0,
    ytd_amount      NUMERIC(22, 6) NOT NULL DEFAULT 0,
    ptd_amount      NUMERIC(22, 6) NOT NULL DEFAULT 0,
    source          VARCHAR(50)  DEFAULT 'MANUAL',  -- MANUAL, INTERFACE, ALLOCATION
    created_by      VARCHAR(100),
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE (tenant_id, ledger_id, period_name, stat_account, code_combination_id)
);

CREATE INDEX IF NOT EXISTS idx_gl_stat_bal_period ON gl_statistical_balances(period_year, period_num);
CREATE INDEX IF NOT EXISTS idx_gl_stat_bal_account ON gl_statistical_balances(stat_account);
CREATE INDEX IF NOT EXISTS idx_gl_stat_bal_ledger  ON gl_statistical_balances(ledger_id);

-- Statistical Allocation Rules — drive GL_MASS_ALLOCATIONS for stat-based allocations
CREATE TABLE IF NOT EXISTS gl_statistical_allocation_rules (
    id              SERIAL PRIMARY KEY,
    tenant_id       VARCHAR(36),
    rule_name       VARCHAR(200) NOT NULL,
    stat_account    VARCHAR(50)  NOT NULL,  -- Source statistic (numerator)
    basis_method    VARCHAR(30)  NOT NULL DEFAULT 'PRO_RATA'
                        CHECK (basis_method IN ('PRO_RATA', 'FIXED_AMOUNT', 'FULL_COST')),
    source_ledger   VARCHAR(50),
    target_accounts TEXT[],  -- Target GL accounts for cost spread
    description     TEXT,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- ============================================================
-- FA: Prorate Conventions — Seed Standard Oracle Conventions
-- ============================================================
INSERT INTO fa_prorate_conventions (convention_code, convention_name, description, first_year_rule, last_year_rule)
VALUES
    ('HALF_YEAR',    'Half-Year Convention',     'MACRS default: half year of depreciation in year 1 and year of disposal', '50% of annual rate', '50% of annual rate'),
    ('MID_MONTH',    'Mid-Month Convention',     'Real property: mid-month in month placed in service',                    'Mid-month rule',      'Mid-month rule'),
    ('MID_QUARTER',  'Mid-Quarter Convention',   'Applies when > 40% of assets placed in service in Q4 of tax year',      'Mid-quarter rule',    'Mid-quarter rule'),
    ('FULL_MONTH',   'Full-Month Convention',    'Full month depreciation in period of acquisition',                       'Full month',          'No depreciation in disposal month'),
    ('ACTUAL_DAYS',  'Actual Days Convention',   'Prorate based on exact days asset is in service in period',              'Days in service / Days in period', 'Days in service / Days in period')
ON CONFLICT DO NOTHING;

-- ============================================================
-- AP: Seed Standard Match Tolerance Thresholds
-- ============================================================
INSERT INTO ap_match_tolerances (item_category, match_type, qty_variance_pct, amt_variance_pct, amt_variance_abs, hold_code, breach_action)
VALUES
    ('Goods',         '4-Way', 3,   2,   500,  'MATCH_AMT', 'Hold'),
    ('Goods',         '3-Way', 5,   3,   1000, 'MATCH_QTY', 'Hold'),
    ('Services',      '2-Way', 0,   5,   2500, 'PRICE_TOLERANCE', 'Warn'),
    ('Capital Goods', '4-Way', 1,   1,   250,  'PO_VARIANCE', 'Hold')
ON CONFLICT DO NOTHING;

-- ============================================================
-- AP: Seed Standard Inspection Hold Rules
-- ============================================================
INSERT INTO ap_inspection_hold_rules (description, trigger_condition, hold_code, requires_grn, requires_inspection, auto_release, is_active)
VALUES
    ('High-value receipts (>$25,000) require physical inspection',
     'PO Line Received Amount > 25000',
     'INSP_REQUIRED', TRUE, TRUE, FALSE, TRUE),
    ('Capital equipment — inspection report mandatory before PO closure',
     'PO Type = Capital AND PO Amount > 50000',
     'INSP_REQUIRED', TRUE, TRUE, FALSE, TRUE)
ON CONFLICT DO NOTHING;
