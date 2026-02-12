-- =====================================================
-- Real Estate Platform - Complete Schema
-- Modules: 3.1, 3.2, 3.3 - Property, Lease, Listing
-- =====================================================

-- =====================================================
-- PROPERTY MANAGEMENT
-- =====================================================

CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    
    -- Property details
    property_name VARCHAR(255) NOT NULL,
    property_type VARCHAR(50) CHECK (property_type IN (
        'residential',
        'commercial',
        'industrial',
        'mixed_use',
        'retail',
        'office'
    )),
    
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(3) DEFAULT 'USA',
    
    -- Details
    year_built INT,
    total_units INT DEFAULT 0,
    total_sqft DECIMAL(12,2),
    lot_size_sqft DECIMAL(12,2),
    
    -- Financial
    acquisition_cost DECIMAL(15,2),
    current_value DECIMAL(15,2),
    
    -- Amenities
    amenities JSONB DEFAULT '[]'::jsonb,
    
    -- Management
    property_manager_id UUID,
    
    status VARCHAR(50) DEFAULT 'active',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE property_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    
    unit_number VARCHAR(50) NOT NULL,
    unit_type VARCHAR(50) CHECK (unit_type IN ('studio', '1br', '2br', '3br', '4br', 'commercial', 'office')),
    
    -- Size
    sqft DECIMAL(10,2),
    bedrooms INT,
    bathrooms DECIMAL(3,1),
    
    -- Rental
    monthly_rent DECIMAL(10,2),
    security_deposit DECIMAL(10,2),
    
    -- Features
    features JSONB DEFAULT '[]'::jsonb,
    
    -- Status
    status VARCHAR(50) DEFAULT 'vacant' CHECK (status IN ('vacant', 'occupied', 'maintenance', 'reserved')),
    
    -- Current lease
    current_lease_id UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(property_id, unit_number)
);

CREATE TABLE property_maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    property_id UUID NOT NULL REFERENCES properties(id),
    unit_id UUID REFERENCES property_units(id),
    
    work_order_number VARCHAR(50) UNIQUE NOT NULL,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    category VARCHAR(50) CHECK (category IN (
        'plumbing',
        'electrical',
        'hvac',
        'appliance',
        'structural',
        'landscaping',
        'general'
    )),
    
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN (
        'open',
        'assigned',
        'in_progress',
        'completed',
        'cancelled'
    )),
    
    -- Assignment
    assigned_to_vendor_id UUID,
    
    -- Cost
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    
    -- Dates
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- LEASE MANAGEMENT (ASC 842 Compliant)
-- =====================================================

CREATE TABLE leases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    
    lease_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Property/Unit
    property_id UUID NOT NULL REFERENCES properties(id),
    unit_id UUID NOT NULL REFERENCES property_units(id),
    
    -- Tenant (customer)
    customer_id UUID NOT NULL,
    
    -- Dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    lease_term_months INT,
    
    -- Financial
    monthly_rent DECIMAL(10,2) NOT NULL,
    security_deposit DECIMAL(10,2),
    late_fee DECIMAL(10,2),
    
    -- Payment terms
    payment_day_of_month INT DEFAULT 1,
    grace_period_days INT DEFAULT 5,
    
    -- ASC 842 fields
    lease_classification VARCHAR(20) CHECK (lease_classification IN ('operating', 'finance')),
    discount_rate DECIMAL(5,2),
    rou_asset_value DECIMAL(15,2), -- Right-of-Use Asset
    lease_liability DECIMAL(15,2),
    
    -- Renewal
    auto_renew BOOLEAN DEFAULT false,
    renewal_notice_days INT DEFAULT 60,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN (
        'draft',
        'pending_signature',
        'active',
        'expiring_soon',
        'expired',
        'terminated',
        'renewed'
    )),
    
    -- Documents
    contract_url VARCHAR(500),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lease_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    
    payment_date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'late', 'failed')),
    
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    
    late_fee_assessed DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lease_renewals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    original_lease_id UUID NOT NULL REFERENCES leases(id),
    new_lease_id UUID REFERENCES leases(id),
    
    renewal_status VARCHAR(50) DEFAULT 'pending' CHECK (renewal_status IN (
        'pending',
        'offered',
        'accepted',
        'declined',
        'renewed'
    )),
    
    offered_rent DECIMAL(10,2),
    new_term_months INT,
    
    offered_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- LISTING PORTAL
-- =====================================================

CREATE TABLE property_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    
    property_id UUID NOT NULL REFERENCES properties(id),
    unit_id UUID REFERENCES property_units(id),
    
    listing_title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Pricing
    list_price DECIMAL(10,2),
    price_type VARCHAR(20) CHECK (price_type IN ('sale', 'rent_monthly', 'rent_weekly')),
    
    -- Media
    photos JSONB DEFAULT '[]'::jsonb,
    virtual_tour_url VARCHAR(500),
    video_url VARCHAR(500),
    floor_plan_url VARCHAR(500),
    
    -- Features highlight
    key_features JSONB DEFAULT '[]'::jsonb,
    
    -- Publishing channels
    channels JSONB DEFAULT '[]'::jsonb, -- ['website', 'zillow', 'realtor', 'apartments.com']
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    slug VARCHAR(255),
    
    -- Availability
    available_date DATE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN (
        'draft',
        'published',
        'rented',
        'sold',
        'archived'
    )),
    
    -- Stats
    view_count INT DEFAULT 0,
    inquiry_count INT DEFAULT 0,
    
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE listing_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    listing_id UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
    
    -- Contact info
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    
    message TEXT,
    
    -- Qualification
    move_in_date DATE,
    monthly_income DECIMAL(10,2),
    credit_score INT,
    
    -- Follow-up
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN (
        'new',
        'contacted',
        'scheduled_showing',
        'application_sent',
        'converted',
        'lost'
    )),
    
    assigned_to_user_id UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE property_showings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    
    property_id UUID NOT NULL REFERENCES properties(id),
    unit_id UUID REFERENCES property_units(id),
    inquiry_id UUID REFERENCES listing_inquiries(id),
    
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INT DEFAULT 30,
    
    attendee_name VARCHAR(255),
    attendee_email VARCHAR(255),
    attendee_phone VARCHAR(50),
    
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN (
        'scheduled',
        'confirmed',
        'completed',
        'no_show',
        'cancelled'
    )),
    
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX idx_properties_tenant ON properties(tenant_id);
CREATE INDEX idx_units_property ON property_units(property_id);
CREATE INDEX idx_units_status ON property_units(status);
CREATE INDEX idx_maintenance_property ON property_maintenance(property_id);
CREATE INDEX idx_maintenance_status ON property_maintenance(status);

CREATE INDEX idx_leases_tenant ON leases(tenant_id);
CREATE INDEX idx_leases_property ON leases(property_id);
CREATE INDEX idx_leases_unit ON leases(unit_id);
CREATE INDEX idx_leases_status ON leases(status);
CREATE INDEX idx_leases_dates ON leases(start_date, end_date);

CREATE INDEX idx_lease_payments_lease ON lease_payments(lease_id);
CREATE INDEX idx_lease_payments_status ON lease_payments(status);

CREATE INDEX idx_listings_tenant ON property_listings(tenant_id);
CREATE INDEX idx_listings_property ON property_listings(property_id);
CREATE INDEX idx_listings_status ON property_listings(status);

CREATE INDEX idx_inquiries_listing ON listing_inquiries(listing_id);
CREATE INDEX idx_inquiries_status ON listing_inquiries(status);

-- =====================================================
-- RLS Policies
-- =====================================================

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_properties ON properties
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE POLICY tenant_isolation_units ON property_units
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE POLICY tenant_isolation_maintenance ON property_maintenance
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE POLICY tenant_isolation_leases ON leases
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE POLICY tenant_isolation_payments ON lease_payments
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE POLICY tenant_isolation_listings ON property_listings
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE POLICY tenant_isolation_inquiries ON listing_inquiries
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

-- Triggers
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON property_units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leases_updated_at BEFORE UPDATE ON leases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON property_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data
INSERT INTO properties (tenant_id, property_name, property_type, total_units) VALUES
('demo-tenant', 'Sunset Towers', 'residential', 50),
('demo-tenant', 'Downtown Office Plaza', 'commercial', 25);
