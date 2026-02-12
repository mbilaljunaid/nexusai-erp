-- =====================================================
-- Prerequisites - FINAL VERSION
-- Creates customers table for niche vertical modules
-- =====================================================

-- Install PostGIS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
        CREATE EXTENSION postgis;
    END IF;
END $$;

-- Ensure UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create customers table for niche verticals
-- This is separate from the main ERP customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    customer_number VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    customer_type VARCHAR(50) DEFAULT 'business',
    status VARCHAR(50) DEFAULT 'active',
    industry VARCHAR(100),
    company_size VARCHAR(50),
    website VARCHAR(255),
    billing_address JSONB,
    shipping_address JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

COMMENT ON TABLE customers IS 'Customers table for niche vertical modules (SaaS, E-commerce, Real Estate, etc.)';

-- Success
DO $$
BEGIN
    RAISE NOTICE 'Prerequisites complete: PostGIS, UUID, triggers, customers table';
END $$;
