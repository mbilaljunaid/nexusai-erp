-- =====================================================
-- Trial Management & Plan Management - Database Schema
-- Module: 1.4 & 1.5 - SaaS Trial and Plan Features
-- Phase: 1 of Niche Verticals Implementation
-- =====================================================

-- =====================================================
-- Table: trial_signups
-- Purpose: Track trial signups and conversions
-- =====================================================
CREATE TABLE trial_signups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    
    -- User/Company info
    email VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    user_id UUID, -- NULL until account created
    customer_id UUID, -- NULL until converted
    
    -- Trial details
    trial_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    trial_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    trial_duration_days INT DEFAULT 14,
    trial_plan_id UUID,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN (
        'active',
        'converted',
        'expired',
        'cancelled',
        'extended'
    )),
    
    -- Conversion tracking
    converted_at TIMESTAMP WITH TIME ZONE,
    conversion_plan_id UUID,
    days_to_conversion INT,
    
    -- Attribution
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    referral_source VARCHAR(255),
    
    -- Engagement during trial
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_completion_date TIMESTAMP WITH TIME ZONE,
    features_explored JSONB DEFAULT '[]'::jsonb,
    activation_score INT DEFAULT 0, -- 0-100 based on feature usage
    
    -- Extensions
    extension_count INT DEFAULT 0,
    extended_until TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trial_signups_tenant ON trial_signups(tenant_id, trial_started_at DESC);
CREATE INDEX idx_trial_signups_email ON trial_signups(email);
CREATE INDEX idx_trial_signups_status ON trial_signups(tenant_id, status);

-- =====================================================
-- Table: trial_conversion_funnel
-- Purpose: Track trial user journey milestones
-- =====================================================
CREATE TABLE trial_conversion_funnel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    trial_id UUID NOT NULL REFERENCES trial_signups(id) ON DELETE CASCADE,
    
    step_name VARCHAR(255) NOT NULL,
    step_number INT NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversion_funnel_trial ON trial_conversion_funnel(trial_id, step_number);

-- =====================================================
-- Table: subscription_plans
-- Purpose: Define subscription plans with features
-- =====================================================
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    
    -- Plan basics
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    
    -- Pricing
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Billing
    billing_interval VARCHAR(20) CHECK (billing_interval IN ('monthly', 'yearly', 'custom')),
    
    -- Plan metadata
    tier VARCHAR(50) CHECK (tier IN ('free', 'trial', 'starter', 'professional', 'enterprise', 'custom')),
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true, -- False for custom/internal plans
    
    -- Limits & quotas
    limits JSONB DEFAULT '{}'::jsonb,
    -- Example: {
    --   "max_users": 10,
    --   "max_projects": 100,
    --   "max_storage_gb": 50,
    --   "api_calls_per_month": 10000
    -- }
    
    -- Features included(plan_id TEXT REFERENCES subscription_plans(id),
    features JSONB DEFAULT '[]'::jsonb,
    -- Example: ["feature_a", "feature_b", "advanced_analytics"]
    
    -- Trial settings
    trial_period_days INT DEFAULT 0,
    
    -- Versioning
    version INT DEFAULT 1,
    replaced_by_plan_id UUID, -- For plan migrations
    
    -- Display order
    sort_order INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscription_plans_tenant ON subscription_plans(tenant_id, is_active);
CREATE INDEX idx_subscription_plans_tier ON subscription_plans(tier, is_active);

-- =====================================================
-- Table: plan_features
-- Purpose: Define all available features for gating
-- =====================================================
CREATE TABLE plan_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    
    feature_code VARCHAR(100) UNIQUE NOT NULL,
    feature_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    category VARCHAR(100), -- 'analytics', 'automation', 'integration', etc.
    
    -- Default availability
    available_in_tiers VARCHAR(50)[] DEFAULT ARRAY['enterprise'], -- Which tiers include this
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_plan_features_tenant ON plan_features(tenant_id);
CREATE INDEX idx_plan_features_code ON plan_features(feature_code);

-- =====================================================
-- Table: customer_plan_usage
-- Purpose: Track usage against plan limits
-- =====================================================
CREATE TABLE customer_plan_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    customer_id UUID NOT NULL,
    subscription_id UUID,
    
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Usage metrics (JSONB for flexibility)
    usage_metrics JSONB DEFAULT '{}'::jsonb,
    -- Example: {
    --   "users_count": 8,
    --   "projects_count": 45,
    --   "storage_gb": 23.5,
    --   "api_calls": 8500
    -- }
    
    -- Limit violations
    limits_exceeded JSONB DEFAULT '{}'::jsonb,
    -- Example: {"storage_gb": true, "api_calls": false}
    
    overage_charges DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_customer_usage_tenant ON customer_plan_usage(tenant_id, period_start DESC);
CREATE INDEX idx_customer_usage_customer ON customer_plan_usage(customer_id, period_start DESC);

-- =====================================================
-- Table: plan_change_history
-- Purpose: Audit trail of plan upgrades/downgrades
-- =====================================================
CREATE TABLE plan_change_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    customer_id UUID NOT NULL,
    subscription_id UUID,
    
    -- Change details
    previous_plan_id UUID,
    new_plan_id UUID NOT NULL,
    
    change_type VARCHAR(50) CHECK (change_type IN (
        'upgrade',
        'downgrade',
        'trial_to_paid',
        'renewal',
        'cancellation'
    )),
    
    -- Financial impact
    previous_mrr DECIMAL(10,2),
    new_mrr DECIMAL(10,2),
    mrr_delta DECIMAL(10,2),
    
    -- Timing
    effective_date DATE NOT NULL,
    prorated BOOLEAN DEFAULT false,
    proration_amount DECIMAL(10,2),
    
    -- Attribution
    changed_by_user_id UUID,
    reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_plan_changes_tenant ON plan_change_history(tenant_id, effective_date DESC);
CREATE INDEX idx_plan_changes_customer ON plan_change_history(customer_id);

-- =====================================================
-- Row Level Security
-- =====================================================

ALTER TABLE trial_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_conversion_funnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_plan_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_change_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_trials ON trial_signups
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_funnel ON trial_conversion_funnel
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_plans ON subscription_plans
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_features ON plan_features
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_usage ON customer_plan_usage
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_changes ON plan_change_history
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

-- =====================================================
-- Triggers
-- =====================================================

CREATE TRIGGER update_trial_signups_updated_at BEFORE UPDATE ON trial_signups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Functions
-- =====================================================

-- Check if customer has feature access
CREATE OR REPLACE FUNCTION has_feature_access(
    p_customer_id UUID,
    p_feature_code VARCHAR(100)
) RETURNS BOOLEAN AS $$
DECLARE
    plan_features JSONB;
    has_access BOOLEAN;
BEGIN
    -- Get customer's current plan features
    SELECT sp.features INTO plan_features
    FROM customers c
    JOIN subscriptions s ON s.customer_id = c.id
    JOIN subscription_plans sp ON sp.id = s.plan_id
    WHERE c.id = p_customer_id
    AND s.status = 'active'
    LIMIT 1;
    
    IF plan_features IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check if feature is in the array
    has_access := plan_features ? p_feature_code;
    
    RETURN COALESCE(has_access, false);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Sample Data
-- =====================================================

INSERT INTO subscription_plans (tenant_id, name, display_name, price_monthly, price_yearly, tier, billing_interval, limits, features) VALUES
('demo-tenant', 'free', 'Free Plan', 0, 0, 'free', 'monthly', 
 '{"max_users": 2, "max_projects": 3, "max_storage_gb": 1}'::jsonb,
 '["basic_features"]'::jsonb),
 
('demo-tenant', 'starter', 'Starter', 49, 490, 'starter', 'monthly',
 '{"max_users": 10, "max_projects": 50, "max_storage_gb": 25, "api_calls_per_month": 10000}'::jsonb,
 '["basic_features", "advanced_reporting", "api_access"]'::jsonb),
 
('demo-tenant', 'professional', 'Professional', 149, 1490, 'professional', 'monthly',
 '{"max_users": 50, "max_projects": 500, "max_storage_gb": 100, "api_calls_per_month": 100000}'::jsonb,
 '["basic_features", "advanced_reporting", "api_access", "automation", "integrations", "priority_support"]'::jsonb),
 
('demo-tenant', 'enterprise', 'Enterprise', 499, 4990, 'enterprise', 'monthly',
 '{"max_users": -1, "max_projects": -1, "max_storage_gb": 1000, "api_calls_per_month": -1}'::jsonb,
 '["all_features", "white_label", "dedicated_support", "sla_guarantee"]'::jsonb);

INSERT INTO plan_features (tenant_id, feature_code, feature_name, category, available_in_tiers) VALUES
('demo-tenant', 'advanced_analytics', 'Advanced Analytics Dashboard', 'analytics', ARRAY['professional', 'enterprise']),
('demo-tenant', 'custom_workflows', 'Custom Workflow Automation', 'automation', ARRAY['enterprise']),
('demo-tenant', 'api_access', 'API Access', 'integration', ARRAY['starter', 'professional', 'enterprise']),
('demo-tenant', 'white_label', 'White Label Branding', 'platform', ARRAY['enterprise']),
('demo-tenant', 'sso', 'Single Sign-On (SSO)', 'security', ARRAY['professional', 'enterprise']);
