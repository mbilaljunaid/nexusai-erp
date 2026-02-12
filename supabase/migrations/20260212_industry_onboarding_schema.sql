-- Industry-Specific Onboarding System - Database Schema
-- Phase 2: Data Model & Architecture
-- Created: 2026-02-12

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: industries
-- Master data for all supported industries
-- =====================================================
CREATE TABLE IF NOT EXISTS industries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tagline VARCHAR(500),
    icon VARCHAR(50),
    color VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups by code
CREATE INDEX IF NOT EXISTS idx_industries_code ON industries(code);
CREATE INDEX IF NOT EXISTS idx_industries_active ON industries(is_active);

-- =====================================================
-- TABLE: modules
-- Module definitions (e.g., HR, Finance, SCM, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- HR, Finance, SCM, Operations, etc.
    is_core BOOLEAN DEFAULT false, -- Core modules like HR, Finance
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_modules_code ON modules(code);
CREATE INDEX IF NOT EXISTS idx_modules_category ON modules(category);
CREATE INDEX IF NOT EXISTS idx_modules_core ON modules(is_core);

-- =====================================================
-- TABLE: industry_module_mappings
-- Defines which modules are recommended/required for each industry
-- =====================================================
CREATE TABLE IF NOT EXISTS industry_module_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    is_recommended BOOLEAN DEFAULT true,
    is_required BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 0, -- Higher priority = more important
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(industry_id, module_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_imm_industry ON industry_module_mappings(industry_id);
CREATE INDEX IF NOT EXISTS idx_imm_module ON industry_module_mappings(module_id);
CREATE INDEX IF NOT EXISTS idx_imm_recommended ON industry_module_mappings(is_recommended);
CREATE INDEX IF NOT EXISTS idx_imm_required ON industry_module_mappings(is_required);

-- =====================================================
-- TABLE: tenant_modules
-- Tracks which modules are enabled for each tenant
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT true,
    enabled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    enabled_by UUID, -- User who enabled this module
    disabled_at TIMESTAMP WITH TIME ZONE,
    disabled_by UUID, -- User who disabled this module
    UNIQUE(tenant_id, module_id)
);

-- Indexes for access control checks
CREATE INDEX IF NOT EXISTS idx_tm_tenant ON tenant_modules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tm_module ON tenant_modules(module_id);
CREATE INDEX IF NOT EXISTS idx_tm_enabled ON tenant_modules(enabled);
CREATE INDEX IF NOT EXISTS idx_tm_tenant_enabled ON tenant_modules(tenant_id, enabled);

-- =====================================================
-- TABLE: configuration_templates
-- Pre-configured templates for each industry/module combination
-- =====================================================
CREATE TABLE IF NOT EXISTS configuration_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    industry_id UUID REFERENCES industries(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    template_type VARCHAR(100) NOT NULL, -- coa, product_categories, workflows, approval_chains, etc.
    template_name VARCHAR(255) NOT NULL,
    template_description TEXT,
    template_data JSONB NOT NULL, -- The actual template configuration
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for template lookups
CREATE INDEX IF NOT EXISTS idx_ct_industry ON configuration_templates(industry_id);
CREATE INDEX IF NOT EXISTS idx_ct_module ON configuration_templates(module_id);
CREATE INDEX IF NOT EXISTS idx_ct_type ON configuration_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_ct_active ON configuration_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_ct_industry_module ON configuration_templates(industry_id, module_id);

-- =====================================================
-- ALTER TABLE: tenants
-- Add industry support to existing tenants table
-- =====================================================
DO $$
BEGIN
    -- Add industry_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'industry_id'
    ) THEN
        ALTER TABLE tenants ADD COLUMN industry_id UUID REFERENCES industries(id);
    END IF;

    -- Add onboarding tracking columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'onboarding_completed'
    ) THEN
        ALTER TABLE tenants ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'onboarding_step'
    ) THEN
        ALTER TABLE tenants ADD COLUMN onboarding_step INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'onboarding_completed_at'
    ) THEN
        ALTER TABLE tenants ADD COLUMN onboarding_completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Index for industry lookups on tenants
CREATE INDEX IF NOT EXISTS idx_tenants_industry ON tenants(industry_id);
CREATE INDEX IF NOT EXISTS idx_tenants_onboarding ON tenants(onboarding_completed);

-- =====================================================
-- COMMENTS: Documentation for each table/column
-- =====================================================
COMMENT ON TABLE industries IS 'Master data for all supported industries (Healthcare, Retail, Manufacturing, etc.)';
COMMENT ON TABLE modules IS 'Module definitions for the ERP system (HR, Finance, SCM, CRM, etc.)';
COMMENT ON TABLE industry_module_mappings IS 'Defines which modules are recommended or required for each industry';
COMMENT ON TABLE tenant_modules IS 'Tracks which modules are enabled for each tenant/organization';
COMMENT ON TABLE configuration_templates IS 'Pre-configured templates for different industry/module combinations';

COMMENT ON COLUMN industries.code IS 'Unique code identifier (e.g., healthcare, retail, manufacturing)';
COMMENT ON COLUMN industries.tagline IS 'Short marketing tagline for the industry solution';
COMMENT ON COLUMN modules.is_core IS 'Core modules that are fundamental (HR, Finance) vs optional modules';
COMMENT ON COLUMN industry_module_mappings.priority IS 'Higher number = higher priority in recommendations';
COMMENT ON COLUMN tenant_modules.enabled_by IS 'User ID who enabled this module';
COMMENT ON COLUMN configuration_templates.template_data IS 'JSONB storing the actual template configuration';
