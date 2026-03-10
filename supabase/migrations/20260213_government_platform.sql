-- =====================================================
-- Government Platform - Complete Schema
-- Modules: 5.1-5.3 - Tax, Public Works, Emergency
-- =====================================================

-- =====================================================
-- TAX ADMINISTRATION
-- =====================================================

CREATE TABLE tax_filings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    filing_number VARCHAR(100) UNIQUE NOT NULL,
    taxpayer_id UUID NOT NULL,
    tax_year INT NOT NULL,
    tax_type VARCHAR(50) CHECK (tax_type IN ('income', 'property', 'sales', 'business', 'estate')),
    filing_status VARCHAR(50) DEFAULT 'draft',
    gross_income DECIMAL(18,2),
    deductions DECIMAL(18,2),
    taxable_income DECIMAL(18,2),
    tax_liability DECIMAL(18,2),
    payments_made DECIMAL(18,2),
    refund_amount DECIMAL(18,2),
    amount_due DECIMAL(18,2),
    due_date DATE,
    filed_date DATE,
    assessment_status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tax_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    filing_id UUID REFERENCES tax_filings(id),
    taxpayer_id UUID NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(15,2),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PUBLIC WORKS
-- =====================================================

CREATE TABLE public_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    asset_id VARCHAR(100) UNIQUE NOT NULL,
    asset_type VARCHAR(50) CHECK (asset_type IN (
        'road',
        'bridge',
        'park',
        'building',
        'water_main',
        'sewer_line',
        'street_light'
    )),
    location GEOGRAPHY(POINT),
    install_date DATE,
    condition_rating INT, -- 1-10
    replacement_cost DECIMAL(15,2),
    useful_life_years INT,
    last_inspection_date DATE,
    next_inspection_date DATE,
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    work_order_number VARCHAR(50) UNIQUE NOT NULL,
    asset_id UUID REFERENCES public_assets(id),
    work_type VARCHAR(50) CHECK (work_type IN ('maintenance', 'repair', 'replacement', 'inspection')),
    priority VARCHAR(20),
    status VARCHAR(50) DEFAULT 'open',
    scheduled_date DATE,
    completed_date DATE,
    estimated_cost DECIMAL(12,2),
    actual_cost DECIMAL(12,2),
    assigned_crew_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- EMERGENCY MANAGEMENT
-- =====================================================

CREATE TABLE emergency_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    incident_number VARCHAR(50) UNIQUE NOT NULL,
    incident_type VARCHAR(50) CHECK (incident_type IN (
        'fire',
        'flood',
        'earthquake',
        'hurricane',
        'hazmat',
        'medical',
        'civil_unrest'
    )),
    severity VARCHAR(20) CHECK (severity IN ('minor', 'moderate', 'major', 'catastrophic')),
    location GEOGRAPHY(POINT),
    affected_area GEOGRAPHY(POLYGON),
    population_affected INT,
    status VARCHAR(50) DEFAULT 'active',
    declared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE emergency_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) CHECK (resource_type IN (
        'personnel',
        'vehicle',
        'equipment',
        'shelter',
        'medical_supplies'
    )),
    resource_name VARCHAR(255),
    quantity INT,
    location GEOGRAPHY(POINT),
    status VARCHAR(50) DEFAULT 'available',
    assigned_incident_id UUID REFERENCES emergency_incidents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tax_filings_tenant ON tax_filings(tenant_id, tax_year DESC);
CREATE INDEX idx_public_assets_type ON public_assets(asset_type);
CREATE INDEX idx_incidents_status ON emergency_incidents(status);
