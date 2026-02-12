-- =====================================================
-- Energy & Utilities Platform - Complete Schema
-- Modules: 4.1-4.6 - Grid, MDM, OMS, DR, Trading, Compliance
-- =====================================================

-- =====================================================
-- GRID MANAGEMENT
-- =====================================================

CREATE TABLE grid_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    asset_id VARCHAR(100) UNIQUE NOT NULL,
    asset_type VARCHAR(50) CHECK (asset_type IN (
        'transformer',
        'substation',
        'transmission_line',
        'distribution_line',
        'capacitor',
        'switch',
        'meter'
    )),
    location GEOGRAPHY(POINT),
    address TEXT,
    capacity_kw DECIMAL(12,2),
    voltage_level VARCHAR(20),
    manufacturer VARCHAR(255),
    install_date DATE,
    last_maintenance DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'faulty', 'offline')),
    health_score INT, -- 0-100
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE grid_topology (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    upstream_asset_id UUID REFERENCES grid_assets(id),
    downstream_asset_id UUID REFERENCES grid_assets(id),
    connection_type VARCHAR(50),
    capacity_kw DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- METER DATA MANAGEMENT (MDM)
-- =====================================================

CREATE TABLE smart_meters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    meter_id VARCHAR(100) UNIQUE NOT NULL,
    customer_id UUID NOT NULL,
    meter_type VARCHAR(50) CHECK (meter_type IN ('electric', 'gas', 'water')),
    location GEOGRAPHY(POINT),
    install_date DATE,
    last_read_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active',
    firmware_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time-series meter readings (partitioned by month)
CREATE TABLE meter_readings (
    id UUID DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    meter_id UUID NOT NULL REFERENCES smart_meters(id),
    read_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    consumption_kwh DECIMAL(12,4),
    demand_kw DECIMAL(12,4),
    voltage DECIMAL(8,2),
    power_factor DECIMAL(4,3),
    quality_code VARCHAR(20) DEFAULT 'valid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) PARTITION BY RANGE (read_timestamp);

CREATE TABLE meter_readings_2026_01 PARTITION OF meter_readings
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE meter_readings_2026_02 PARTITION OF meter_readings
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE INDEX idx_meter_readings_meter_time ON meter_readings(meter_id, read_timestamp DESC);

-- =====================================================
-- OUTAGE MANAGEMENT SYSTEM (OMS)
-- =====================================================

CREATE TABLE outages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    outage_number VARCHAR(50) UNIQUE NOT NULL,
    outage_type VARCHAR(50) CHECK (outage_type IN ('planned', 'unplanned', 'emergency')),
    cause VARCHAR(100) CHECK (cause IN (
        'equipment_failure',
        'weather',
        'vegetation',
        'animal',
        'vehicle_accident',
        'planned_maintenance',
        'unknown'
    )),
    affected_area GEOGRAPHY(POLYGON),
    affected_customers INT DEFAULT 0,
    estimated_restore_time TIMESTAMP WITH TIME ZONE,
    actual_restore_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'reported' CHECK (status IN (
        'reported',
        'dispatched',
        'crew_assigned',
        'in_progress',
        'restored',
        'closed'
    )),
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    crew_id UUID,
    notes TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE outage_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outage_id UUID NOT NULL REFERENCES outages(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    notification_type VARCHAR(50) CHECK (notification_type IN ('sms', 'email', 'push', 'ivr')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'sent'
);

-- =====================================================
-- DEMAND RESPONSE
-- =====================================================

CREATE TABLE dr_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    program_name VARCHAR(255) NOT NULL,
    program_type VARCHAR(50) CHECK (program_type IN (
        'peak_shaving',
        'load_shifting',
        'voluntary_curtailment',
        'direct_load_control',
        'time_of_use'
    )),
    incentive_rate DECIMAL(10,4), -- $/kWh
    target_reduction_kw DECIMAL(12,2),
    is_active BOOLEAN DEFAULT true,
    season VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE dr_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    program_id UUID NOT NULL REFERENCES dr_programs(id),
    event_name VARCHAR(255),
    event_start TIMESTAMP WITH TIME ZONE NOT NULL,
    event_end TIMESTAMP WITH TIME ZONE NOT NULL,
    target_reduction_kw DECIMAL(12,2),
    actual_reduction_kw DECIMAL(12,2),
    participants_count INT DEFAULT 0,
    status VARCHAR(50) CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE dr_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    program_id UUID NOT NULL REFERENCES dr_programs(id),
    customer_id UUID NOT NULL,
    enrolled_date DATE DEFAULT CURRENT_DATE,
    baseline_usage_kwh DECIMAL(12,2),
    committed_reduction_kw DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENERGY TRADING
-- =====================================================

CREATE TABLE energy_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    contract_number VARCHAR(100) UNIQUE NOT NULL,
    counterparty VARCHAR(255) NOT NULL,
    contract_type VARCHAR(50) CHECK (contract_type IN ('purchase', 'sale', 'swap', 'futures')),
    commodity VARCHAR(50) CHECK (commodity IN ('electricity', 'natural_gas', 'renewable_credits')),
    volume_mwh DECIMAL(15,2),
    price_per_mwh DECIMAL(10,4),
    delivery_start DATE,
    delivery_end DATE,
    settlement_type VARCHAR(50) CHECK (settlement_type IN ('physical', 'financial')),
    status VARCHAR(50) DEFAULT 'draft',
    contract_value DECIMAL(18,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE trading_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    position_date DATE NOT NULL DEFAULT CURRENT_DATE,
    commodity VARCHAR(50),
    long_position_mwh DECIMAL(15,2) DEFAULT 0,
    short_position_mwh DECIMAL(15,2) DEFAULT 0,
    net_position_mwh DECIMAL(15,2),
    mark_to_market_value DECIMAL(18,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REGULATORY COMPLIANCE
-- =====================================================

CREATE TABLE compliance_regulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    regulation_code VARCHAR(100) UNIQUE NOT NULL,
    regulation_name VARCHAR(255) NOT NULL,
    regulatory_body VARCHAR(255), -- 'FERC', 'PUC', 'EPA', etc.
    category VARCHAR(100) CHECK (category IN (
        'environmental',
        'safety',
        'reliability',
        'financial',
        'consumer_protection'
    )),
    effective_date DATE,
    description TEXT,
    reporting_frequency VARCHAR(50), -- 'monthly', 'quarterly', 'annually'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE compliance_filings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    regulation_id UUID NOT NULL REFERENCES compliance_regulations(id),
    filing_period VARCHAR(50), -- 'Q1 2026', '2025 Annual', etc.
    due_date DATE NOT NULL,
    submission_date DATE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending',
        'in_progress',
        'review',
        'submitted',
        'approved',
        'rejected'
    )),
    filing_data JSONB DEFAULT '{}'::jsonb,
    filing_url VARCHAR(500),
    assigned_to_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE compliance_violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    regulation_id UUID NOT NULL REFERENCES compliance_regulations(id),
    violation_date DATE NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('minor', 'moderate', 'major', 'critical')),
    description TEXT,
    root_cause TEXT,
    corrective_action TEXT,
    penalty_amount DECIMAL(15,2),
    status VARCHAR(50) DEFAULT 'open',
    resolved_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX idx_grid_assets_tenant ON grid_assets(tenant_id);
CREATE INDEX idx_grid_assets_type ON grid_assets(asset_type);
CREATE INDEX idx_grid_assets_location ON grid_assets USING GIST (location);

CREATE INDEX idx_smart_meters_tenant ON smart_meters(tenant_id);
CREATE INDEX idx_smart_meters_customer ON smart_meters(customer_id);

CREATE INDEX idx_outages_tenant ON outages(tenant_id, started_at DESC);
CREATE INDEX idx_outages_status ON outages(status);

CREATE INDEX idx_dr_events_program ON dr_events(program_id);
CREATE INDEX idx_dr_enrollments_customer ON dr_enrollments(customer_id);

CREATE INDEX idx_contracts_tenant ON energy_contracts(tenant_id);
CREATE INDEX idx_filings_regulation ON compliance_filings(regulation_id);
CREATE INDEX idx_filings_due_date ON compliance_filings(due_date);

-- =====================================================
-- RLS Policies
-- =====================================================

ALTER TABLE grid_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE meter_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE outages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dr_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_regulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_grid_assets ON grid_assets
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE POLICY tenant_isolation_meters ON smart_meters
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE POLICY tenant_isolation_readings ON meter_readings
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE POLICY tenant_isolation_outages ON outages
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE POLICY tenant_isolation_dr ON dr_programs
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE POLICY tenant_isolation_contracts ON energy_contracts
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE POLICY tenant_isolation_compliance ON compliance_regulations
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
