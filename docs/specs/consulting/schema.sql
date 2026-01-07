-- CONSULTING SCHEMA (Postgres)
-- Multi-tenant with RLS

CREATE SCHEMA IF NOT EXISTS consulting;

-- RESOURCES (Consultants)
CREATE TABLE consulting.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL, -- Ref to common.users
    title VARCHAR(100),
    skills_json JSONB, -- [{name: 'React', level: 5}]
    bill_rate DECIMAL(18, 2),
    cost_rate DECIMAL(18, 2),
    target_utilization DECIMAL(3, 2) DEFAULT 0.80, -- 80%
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENGAGEMENTS (Projects)
CREATE TABLE consulting.engagements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    client_id UUID NOT NULL, -- Ref to common.customers
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('TIME_AND_MATERIALS', 'FIXED_PRICE', 'RETAINER')),
    status VARCHAR(20) CHECK (status IN ('OPPORTUNITY', 'ACTIVE', 'COMPLETED', 'ON_HOLD')),
    start_date DATE NOT NULL,
    end_date DATE,
    budget_amount DECIMAL(18, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSIGNMENTS (Staffing)
CREATE TABLE consulting.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    engagement_id UUID NOT NULL REFERENCES consulting.engagements(id),
    resource_id UUID NOT NULL REFERENCES consulting.resources(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    allocation_percent DECIMAL(5, 2) DEFAULT 100.0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TIME ENTRIES
CREATE TABLE consulting.time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    resource_id UUID NOT NULL REFERENCES consulting.resources(id),
    engagement_id UUID NOT NULL REFERENCES consulting.engagements(id),
    work_date DATE NOT NULL,
    hours DECIMAL(4, 2) NOT NULL,
    description TEXT,
    billable BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')),
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE consulting.engagements ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_engagements ON consulting.engagements
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
