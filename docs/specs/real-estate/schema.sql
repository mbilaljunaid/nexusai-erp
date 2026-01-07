-- REAL ESTATE SCHEMA (Postgres)
-- Multi-tenant with RLS

CREATE SCHEMA IF NOT EXISTS real_estate;

-- PROPERTIES
CREATE TABLE real_estate.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('COMMERCIAL', 'RESIDENTIAL', 'MIXED_USE', 'INDUSTRIAL')),
    address_json JSONB NOT NULL, -- { street, city, state, zip, country }
    gla DECIMAL(18, 2), -- Gross Leasable Area
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_properties_tenant ON real_estate.properties(tenant_id);

-- UNITS
CREATE TABLE real_estate.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    property_id UUID NOT NULL REFERENCES real_estate.properties(id),
    unit_number VARCHAR(50) NOT NULL,
    floor VARCHAR(20),
    sq_ft DECIMAL(18, 2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('VACANT', 'OCCUPIED', 'MAINTENANCE')),
    current_lease_id UUID, -- Circular reference managed by app logic or separate link table
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LEASES
CREATE TABLE real_estate.leases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    unit_id UUID NOT NULL REFERENCES real_estate.units(id),
    lease_tenant_id UUID NOT NULL, -- Refers to common.tenants/customers
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    base_rent DECIMAL(18, 2) NOT NULL,
    cam_charges DECIMAL(18, 2) DEFAULT 0,
    security_deposit DECIMAL(18, 2) DEFAULT 0,
    status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'ACTIVE', 'TERMINATED', 'EXPIRED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE real_estate.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_properties ON real_estate.properties
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
