-- CONSTRUCTION SCHEMA (Postgres)
-- Multi-tenant with RLS

CREATE SCHEMA IF NOT EXISTS construction;

-- PROJECTS (Jobs)
CREATE TABLE construction.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('BIDDING', 'AWARDED', 'IN_PROGRESS', 'COMPLETED', 'WARRANTY')),
    contract_value DECIMAL(18, 2),
    start_date DATE,
    est_end_date DATE,
    address_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BUDGET
CREATE TABLE construction.budget_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    project_id UUID NOT NULL REFERENCES construction.projects(id),
    cost_code VARCHAR(50) NOT NULL, -- CSI format
    description VARCHAR(255),
    original_estimate DECIMAL(18, 2) DEFAULT 0,
    approved_cos DECIMAL(18, 2) DEFAULT 0,
    committed_cost DECIMAL(18, 2) DEFAULT 0, -- Subcontracts + POs
    actual_cost DECIMAL(18, 2) DEFAULT 0, -- Invoiced
    forecast_at_completion DECIMAL(18, 2) GENERATED ALWAYS AS (original_estimate + approved_cos) STORED, -- Simplified logic
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, cost_code)
);

-- COMMITMENTS (Subcontracts/POs)
CREATE TABLE construction.commitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    project_id UUID NOT NULL REFERENCES construction.projects(id),
    vendor_id UUID NOT NULL, -- Common vendor
    amount DECIMAL(18, 2) NOT NULL,
    retainage_percent DECIMAL(5, 2) DEFAULT 10,
    status VARCHAR(20) CHECK (status IN ('DRAFT', 'SENT', 'EXECUTED', 'CLOSED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DAILY LOGS (Field data)
CREATE TABLE construction.daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES construction.projects(id),
    date DATE NOT NULL,
    weather_json JSONB,
    manpower_count INT,
    notes TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE construction.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_projects ON construction.projects
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
