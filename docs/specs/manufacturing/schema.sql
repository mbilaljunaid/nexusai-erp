-- MANUFACTURING SCHEMA (Postgres)
-- Multi-tenant by default using RLS (Row Level Security) pattern

CREATE SCHEMA IF NOT EXISTS manufacturing;

-- ITEMS TABLE
CREATE TABLE manufacturing.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    sku VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('RM', 'WIP', 'FG')),
    uom VARCHAR(10) NOT NULL,
    standard_cost DECIMAL(18, 4) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_items_tenant_sku ON manufacturing.items(tenant_id, sku);

-- BOM TABLE
CREATE TABLE manufacturing.boms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    parent_item_id UUID NOT NULL REFERENCES manufacturing.items(id),
    revision VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'ACTIVE', 'OBSOLETE')),
    effective_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOM COMPONENTS
CREATE TABLE manufacturing.bom_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bom_id UUID NOT NULL REFERENCES manufacturing.boms(id),
    child_item_id UUID NOT NULL REFERENCES manufacturing.items(id),
    quantity DECIMAL(18, 6) NOT NULL,
    scrap_factor DECIMAL(5, 4) DEFAULT 0
);

-- WORK CENTERS
CREATE TABLE manufacturing.work_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    hourly_rate DECIMAL(10, 2),
    capacity_per_day DECIMAL(5, 2) -- Hours
);

-- PRODUCTION ORDERS
CREATE TABLE manufacturing.production_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    order_number VARCHAR(50) NOT NULL,
    item_id UUID NOT NULL REFERENCES manufacturing.items(id),
    quantity DECIMAL(18, 2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PLANNED', 'RELEASED', 'IN_PROCESS', 'COMPLETED', 'CLOSED')),
    bom_revision VARCHAR(10), -- Snapshot at release
    routing_revision VARCHAR(10), -- Snapshot at release
    start_date DATE,
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES (Example)
ALTER TABLE manufacturing.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_items ON manufacturing.items
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
