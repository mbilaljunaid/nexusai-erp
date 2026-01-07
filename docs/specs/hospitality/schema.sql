-- HOSPITALITY SCHEMA (Postgres)
-- Multi-tenant pattern with RLS

CREATE SCHEMA IF NOT EXISTS hospitality;

-- PROPERTIES (Extension of Real Estate or Separate?)
-- Assuming separate for clean bounded context, or linked via ID.
CREATE TABLE hospitality.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    address_json JSONB NOT NULL,
    star_rating INT DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROOM TYPES
CREATE TABLE hospitality.room_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES hospitality.properties(id),
    name VARCHAR(100) NOT NULL,
    base_occupancy INT NOT NULL DEFAULT 2,
    base_rate DECIMAL(18, 2) NOT NULL,
    description TEXT
);

-- ROOMS
CREATE TABLE hospitality.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    property_id UUID NOT NULL REFERENCES hospitality.properties(id),
    room_type_id UUID NOT NULL REFERENCES hospitality.room_types(id),
    room_number VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'CLEAN' CHECK (status IN ('CLEAN', 'DIRTY', 'INSPECTED', 'OOO')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GUESTS
CREATE TABLE hospitality.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    loyalty_tier VARCHAR(20) DEFAULT 'NONE',
    preferences_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RESERVATIONS
CREATE TABLE hospitality.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    property_id UUID NOT NULL REFERENCES hospitality.properties(id),
    guest_id UUID NOT NULL REFERENCES hospitality.guests(id),
    room_type_id UUID NOT NULL REFERENCES hospitality.room_types(id),
    room_id UUID REFERENCES hospitality.rooms(id), -- Nullable until assignment
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    total_price DECIMAL(18, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE hospitality.guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_guests ON hospitality.guests
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
