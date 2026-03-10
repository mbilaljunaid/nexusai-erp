-- Phase 6: Configuration Templates Schema
-- Creates configuration_templates table and template_applications audit table

-- =====================================================
-- CREATE: configuration_templates table
-- =====================================================
CREATE TABLE IF NOT EXISTS configuration_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_id VARCHAR(100) REFERENCES industries(id) ON DELETE CASCADE,
    module_id VARCHAR(100) REFERENCES modules(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_category VARCHAR(50),
    template_data JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    dependencies JSONB DEFAULT '[]'::jsonb,
    validation_rules JSONB DEFAULT '{}'::jsonb,
    version VARCHAR(20) DEFAULT '1.0',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_config_templates_category 
ON configuration_templates(template_category);

CREATE INDEX IF NOT EXISTS idx_config_templates_industry_module 
ON configuration_templates(industry_id, module_id);

CREATE INDEX IF NOT EXISTS idx_config_templates_active 
ON configuration_templates(is_active) WHERE is_active = true;

-- =====================================================
-- CREATE: template_applications table (audit trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS template_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES configuration_templates(id) ON DELETE RESTRICT,
    applied_by VARCHAR(100), -- User ID who applied (no FK to avoid type issues)
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'applied', -- applied, rolled_back, failed
    applied_data JSONB,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_template_apps_tenant ON template_applications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_template_apps_template ON template_applications(template_id);
CREATE INDEX IF NOT EXISTS idx_template_apps_status ON template_applications(status);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE configuration_templates IS 'Industry and module-specific configuration templates for auto-provisioning baseline data';
COMMENT ON COLUMN configuration_templates.template_category IS 'Template category: finance, hr, inventory, healthcare, saas, etc.';
COMMENT ON COLUMN configuration_templates.is_default IS 'Whether this is the default template for the industry/module combination';
COMMENT ON COLUMN configuration_templates.dependencies IS 'Array of module codes that must be enabled for this template';
COMMENT ON COLUMN configuration_templates.validation_rules IS 'JSON schema or validation rules for template data';

COMMENT ON TABLE template_applications IS 'Audit trail of template applications to tenants';
COMMENT ON COLUMN template_applications.status IS 'Status: applied, rolled_back, failed';
COMMENT ON COLUMN template_applications.applied_data IS 'Snapshot of data that was applied';
