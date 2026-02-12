-- Schema Update Migration
-- Adds missing columns and tables to support Phase 6 templates

-- =====================================================
-- STEP 1: Add code column to industries table
-- =====================================================
ALTER TABLE industries 
ADD COLUMN IF NOT EXISTS code VARCHAR(50) UNIQUE;

-- Populate code from existing slug (uppercase)
UPDATE industries 
SET code = UPPER(slug)
WHERE code IS NULL;

-- Make code NOT NULL after population
ALTER TABLE industries 
ALTER COLUMN code SET NOT NULL;

-- Add index
CREATE INDEX IF NOT EXISTS idx_industries_code ON industries(code);

-- =====================================================
-- STEP 2: Create modules table
-- =====================================================
CREATE TABLE IF NOT EXISTS modules (
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modules_code ON modules(code);
CREATE INDEX IF NOT EXISTS idx_modules_category ON modules(category);

-- =====================================================
-- STEP 3: Create industry_module_mappings table
-- =====================================================
CREATE TABLE IF NOT EXISTS industry_module_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_id VARCHAR(100) REFERENCES industries(id) ON DELETE CASCADE,
    module_id VARCHAR(100) REFERENCES modules(id) ON DELETE CASCADE,
    priority VARCHAR(20) DEFAULT 'recommended', -- required, recommended, optional
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(industry_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_industry_module_industry ON industry_module_mappings(industry_id);
CREATE INDEX IF NOT EXISTS idx_industry_module_module ON industry_module_mappings(module_id);
CREATE INDEX IF NOT EXISTS idx_industry_module_priority ON industry_module_mappings(priority);

-- =====================================================
-- STEP 4: Seed essential modules
-- =====================================================
INSERT INTO modules (id, code, name, description, category, sort_order) VALUES
    ('hr', 'hr', 'Human Resources', 'Core HR management and employee data', 'core', 10),
    ('finance', 'finance', 'Finance & Accounting', 'General ledger, AP, AR, and financial management', 'core', 20),
    ('manufacturing', 'manufacturing', 'Manufacturing', 'Production planning and shop floor control', 'operations', 30),
    ('real_estate', 'real_estate', 'Real Estate', 'Property management and lease administration', 'industry', 40),
    ('construction', 'construction', 'Construction', 'Project costing and job management', 'industry', 50),
    ('healthcare', 'healthcare', 'Healthcare', 'Patient management and scheduling', 'industry', 60),
    ('banking', 'banking', 'Banking & Finance', 'Specialized banking operations', 'industry', 70),
    ('retail', 'retail', 'Retail', 'Point of sale and inventory', 'industry', 80),
    ('subscription', 'subscription', 'Subscription Management', 'Recurring billing and subscriptions', 'industry', 90)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE modules IS 'Available modules that can be enabled for tenants';
COMMENT ON TABLE industry_module_mappings IS 'Maps modules to industries with priority levels';
COMMENT ON COLUMN industries.code IS 'Unique code identifier for the industry (e.g., BANKING, HEALTHCARE)';
