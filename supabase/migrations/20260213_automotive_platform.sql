-- =====================================================
-- Automotive Platform - Complete Schema
-- Modules: 8.1-8.3 - Digital Retailing, Service, Parts
-- =====================================================

-- =====================================================
-- DIGITAL RETAILING
-- =====================================================

CREATE TABLE vehicle_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    vin VARCHAR(17) UNIQUE NOT NULL,
    stock_number VARCHAR(50),
    year INT,
    make VARCHAR(100),
    model VARCHAR(100),
    trim VARCHAR(100),
    body_style VARCHAR(50),
    exterior_color VARCHAR(50),
    interior_color VARCHAR(50),
    mileage INT,
    condition VARCHAR(20) CHECK (condition IN ('new', 'certified_pre_owned', 'used')),
    msrp DECIMAL(12,2),
    selling_price DECIMAL(12,2),
    cost DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'in_transit')),
    location VARCHAR(100),
    images JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE online_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    quote_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id UUID NOT NULL,
    vehicle_id UUID REFERENCES vehicle_inventory(id),
    vehicle_price DECIMAL(12,2),
    trade_in_value DECIMAL(12,2),
    down_payment DECIMAL(12,2),
    financing_term_months INT,
    apr DECIMAL(5,2),
    monthly_payment DECIMAL(10,2),
    total_price DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'draft',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SERVICE SCHEDULING
-- =====================================================

CREATE TABLE service_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    appointment_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id UUID NOT NULL,
    vehicle_vin VARCHAR(17),
    service_type VARCHAR(50) CHECK (service_type IN (
        'oil_change',
        'tire_rotation',
        'brake_service',
        'inspection',
        'diagnostic',
        'recall',
        'warranty_repair',
        'general_repair'
    )),
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INT DEFAULT 60,
    service_advisor_id UUID,
    technician_id UUID,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN (
        'scheduled',
        'checked_in',
        'in_progress',
        'completed',
        'cancelled'
    )),
    mileage_in INT,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    customer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE service_ro_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES service_appointments(id),
    line_type VARCHAR(20) CHECK (line_type IN ('labor', 'parts', 'sublet')),
    description TEXT,
    quantity DECIMAL(8,2),
    price DECIMAL(10,2),
    total DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PARTS MANAGEMENT
-- =====================================================

CREATE TABLE auto_parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    part_number VARCHAR(100) UNIQUE NOT NULL,
    part_name VARCHAR(255),
    manufacturer VARCHAR(100),
    category VARCHAR(100), -- 'engine', 'brake', 'electrical', etc.
    fits_makes VARCHAR(100)[], -- ['Toyota', 'Honda']
    fits_models VARCHAR(100)[],
    fits_years INT[],
    quantity_on_hand INT DEFAULT 0,
    reorder_point INT,
    cost DECIMAL(10,2),
    retail_price DECIMAL(10,2),
    location VARCHAR(50), -- Bin location
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE parts_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    vendor_id UUID,
    order_date DATE DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE parts_order_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES parts_orders(id),
    part_id UUID NOT NULL REFERENCES auto_parts(id),
    quantity INT,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inventory_vin ON vehicle_inventory(vin);
CREATE INDEX idx_inventory_status ON vehicle_inventory(status);
CREATE INDEX idx_appointments_date ON service_appointments(scheduled_date);
CREATE INDEX idx_parts_number ON auto_parts(part_number);
CREATE INDEX idx_parts_category ON auto_parts(category);
