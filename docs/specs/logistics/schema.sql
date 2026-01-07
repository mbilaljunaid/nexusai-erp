-- LOGISTICS SCHEMA (Postgres)
-- Multi-tenant with RLS

CREATE SCHEMA IF NOT EXISTS logistics;

-- WAREHOUSES
CREATE TABLE logistics.warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    address_json JSONB,
    total_capacity_m3 DECIMAL(18, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FLEET / VEHICLES
CREATE TABLE logistics.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    license_plate VARCHAR(50) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('TRUCK', 'VAN', 'DRONE', 'SHIP', 'RAIL')),
    capacity_kg DECIMAL(18, 2),
    capacity_m3 DECIMAL(18, 2),
    status VARCHAR(20) DEFAULT 'IDLE',
    current_lat DECIMAL(9, 6),
    current_lng DECIMAL(9, 6),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- SHIPMENTS
CREATE TABLE logistics.shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    origin_json JSONB NOT NULL,
    destination_json JSONB NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PLANNED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'EXCEPTION')),
    carrier_id UUID, -- External link or NULL if internal fleet
    vehicle_id UUID REFERENCES logistics.vehicles(id),
    driver_id UUID, -- Ref to common.users or separate drivers table
    estimated_arrival TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SHIPMENT ORDERS (Link Table)
CREATE TABLE logistics.shipment_orders (
    shipment_id UUID NOT NULL REFERENCES logistics.shipments(id),
    order_id UUID NOT NULL, -- Ref to retail.orders or external
    PRIMARY KEY (shipment_id, order_id)
);

-- ROUTES
CREATE TABLE logistics.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    vehicle_id UUID NOT NULL REFERENCES logistics.vehicles(id),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    total_distance_km DECIMAL(10, 2),
    stops_json JSONB NOT NULL, -- Detailed stop sequence
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE logistics.shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_shipments ON logistics.shipments
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
