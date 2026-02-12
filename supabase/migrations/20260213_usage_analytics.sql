-- =====================================================
-- Usage Analytics Dashboard - Database Schema
-- Module: 1.2 - SaaS Usage Analytics
-- Phase: 1 of Niche Verticals Implementation
-- =====================================================

-- =====================================================
-- Table: product_usage_events
-- Purpose: High-volume event tracking (time-series)
-- =====================================================
CREATE TABLE product_usage_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    customer_id UUID,
    user_id UUID,
    
    -- Event details
    feature_name VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'feature_used',
        'api_call',
        'page_view',
        'button_click',
        'form_submit',
        'export',
        'report_run',
        'integration_sync'
    )),
    
    -- Session tracking
    session_id UUID,
    session_duration_seconds INT,
    
    -- Context
    metadata JSONB DEFAULT '{}'::jsonb,
    -- Example: {
    --   "screen_name": "Dashboard",
    --   "duration_ms": 1500,
    --   "result": "success",
    --   "params": {...}
    -- }
    
    -- Analytics dimensions
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    browser VARCHAR(100),
    os VARCHAR(100),
    location_country VARCHAR(3), -- ISO code
    
    -- Timestamp
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) PARTITION BY RANGE (timestamp);

-- Create monthly partitions for the next 12 months
DO $$
DECLARE
    partition_date DATE := DATE_TRUNC('month', CURRENT_DATE);
    partition_name TEXT;
    start_date DATE;
    end_date DATE;
BEGIN
    FOR i IN 0..11 LOOP
        start_date := partition_date + (i || ' months')::INTERVAL;
        end_date := partition_date + ((i + 1) || ' months')::INTERVAL;
        partition_name := 'product_usage_events_' || TO_CHAR(start_date, 'YYYY_MM');
        
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS %I PARTITION OF product_usage_events
             FOR VALUES FROM (%L) TO (%L)',
            partition_name,
            start_date,
            end_date
        );
    END LOOP;
END $$;

-- Indexes on partitioned table
CREATE INDEX idx_usage_events_tenant ON product_usage_events(tenant_id, timestamp DESC);
CREATE INDEX idx_usage_events_customer ON product_usage_events(customer_id, timestamp DESC);
CREATE INDEX idx_usage_events_feature ON product_usage_events(feature_name, timestamp DESC);
CREATE INDEX idx_usage_events_session ON product_usage_events(session_id);

COMMENT ON TABLE product_usage_events IS 'High-volume product usage event tracking (partitioned by month)';

-- =====================================================
-- Table: feature_adoption_metrics
-- Purpose: Pre-aggregated feature adoption metrics
-- =====================================================
CREATE TABLE feature_adoption_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    feature_name VARCHAR(255) NOT NULL,
    
    -- Time period
    period DATE NOT NULL,
    period_type VARCHAR(20) DEFAULT 'day' CHECK (period_type IN ('day', 'week', 'month')),
    
    -- Adoption metrics
    total_users INT DEFAULT 0,
    active_users INT DEFAULT 0,
    new_users INT DEFAULT 0, -- First time using this feature
    adoption_rate DECIMAL(5,2), -- (active_users / total_users) * 100
    
    -- Usage metrics
    total_events INT DEFAULT 0,
    avg_usage_per_user DECIMAL(10,2),
    median_usage_per_user DECIMAL(10,2),
    
    -- Engagement
    avg_session_duration_seconds DECIMAL(10,2),
    
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, feature_name, period, period_type)
);

CREATE INDEX idx_adoption_tenant ON feature_adoption_metrics(tenant_id, period DESC);
CREATE INDEX idx_adoption_feature ON feature_adoption_metrics(feature_name, period DESC);

COMMENT ON TABLE feature_adoption_metrics IS 'Pre-aggregated feature adoption metrics for fast analytics';

-- =====================================================
-- Table: user_cohorts
-- Purpose: User cohort definitions for retention analysis
-- =====================================================
CREATE TABLE user_cohorts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    cohort_name VARCHAR(255) NOT NULL,
    
    -- Cohort definition
    cohort_type VARCHAR(50) CHECK (cohort_type IN (
        'signup_month',
        'first_purchase',
        'plan_tier',
        'industry',
        'custom'
    )),
    
    cohort_date DATE, -- For time-based cohorts
    
    -- Criteria
    criteria JSONB,
    -- Example: {
    --   "signup_month": "2026-01",
    --   "plan": "enterprise",
    --   "industry": "healthcare"
    -- }
    
    -- Metrics
    user_count INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, cohort_name)
);

CREATE INDEX idx_cohorts_tenant ON user_cohorts(tenant_id);
CREATE INDEX idx_cohorts_date ON user_cohorts(cohort_date);

-- =====================================================
-- Table: cohort_retention_metrics
-- Purpose: Retention analysis by cohort
-- =====================================================
CREATE TABLE cohort_retention_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    cohort_id UUID NOT NULL REFERENCES user_cohorts(id) ON DELETE CASCADE,
    
    -- Time period since cohort start
    period_offset INT NOT NULL, -- 0, 1, 2, 3... (months since cohort start)
    period_date DATE NOT NULL,
    
    -- Retention metrics
    active_users INT DEFAULT 0,
    retention_rate DECIMAL(5,2), -- (active_users / initial_cohort_size) * 100
    
    -- Engagement metrics
    avg_events_per_user DECIMAL(10,2),
    avg_features_used DECIMAL(10,2),
    
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(cohort_id, period_offset)
);

CREATE INDEX idx_retention_cohort ON cohort_retention_metrics(cohort_id, period_offset);

COMMENT ON TABLE cohort_retention_metrics IS 'Cohort retention analysis over time';

-- =====================================================
-- Table: user_sessions
-- Purpose: User session tracking
-- =====================================================
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    customer_id UUID,
    user_id UUID NOT NULL,
    
    session_id UUID UNIQUE NOT NULL,
    
    -- Session details
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INT,
    
    -- Activity metrics
    page_views INT DEFAULT 0,
    features_used VARCHAR(255)[],
    unique_features_count INT DEFAULT 0,
    
    -- Context
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    entry_page VARCHAR(500),
    exit_page VARCHAR(500),
    
    -- Session quality
    bounce BOOLEAN DEFAULT false, -- Single page/action session
    converted BOOLEAN DEFAULT false, -- Led to a conversion event
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_tenant ON user_sessions(tenant_id, start_time DESC);
CREATE INDEX idx_sessions_user ON user_sessions(user_id, start_time DESC);
CREATE INDEX idx_sessions_customer ON user_sessions(customer_id, start_time DESC);

COMMENT ON TABLE user_sessions IS 'User session tracking for engagement analysis';

-- =====================================================
-- Table: feature_stickiness_metrics
-- Purpose: Track DAU/MAU ratios for product stickiness
-- =====================================================
CREATE TABLE feature_stickiness_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    
    -- Time period
    metric_date DATE NOT NULL,
    feature_name VARCHAR(255), -- NULL for overall product
    
    -- User counts
    daily_active_users INT DEFAULT 0,
    weekly_active_users INT DEFAULT 0,
    monthly_active_users INT DEFAULT 0,
    
    -- Stickiness ratios
    dau_mau_ratio DECIMAL(5,2), -- (DAU / MAU) * 100
    dau_wau_ratio DECIMAL(5,2), -- (DAU / WAU) * 100
    wau_mau_ratio DECIMAL(5,2), -- (WAU / MAU) * 100
    
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, metric_date, COALESCE(feature_name, ''))
);

CREATE INDEX idx_stickiness_tenant ON feature_stickiness_metrics(tenant_id, metric_date DESC);

COMMENT ON TABLE feature_stickiness_metrics IS 'Product stickiness metrics (DAU/MAU ratios)';

-- =====================================================
-- Table: funnel_definitions
-- Purpose: Define user journey funnels
-- =====================================================
CREATE TABLE funnel_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    funnel_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Funnel steps (ordered)
    steps JSONB NOT NULL,
    -- Example: [
    --   {"step": 1, "event": "page_view", "feature": "signup_page"},
    --   {"step": 2, "event": "form_submit", "feature": "signup_form"},
    --   {"step": 3, "event": "feature_used", "feature": "onboarding_wizard"}
    -- ]
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, funnel_name)
);

-- =====================================================
-- Table: funnel_metrics
-- Purpose: Pre-calculated funnel conversion metrics
-- =====================================================
CREATE TABLE funnel_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    funnel_id UUID NOT NULL REFERENCES funnel_definitions(id) ON DELETE CASCADE,
    
    -- Time period
    period_date DATE NOT NULL,
    
    -- Step metrics
    step_number INT NOT NULL,
    step_name VARCHAR(255),
    
    users_entered INT DEFAULT 0,
    users_completed INT DEFAULT 0,
    conversion_rate DECIMAL(5,2), -- (completed / entered) * 100
    drop_off_rate DECIMAL(5,2),
    
    avg_time_to_complete_seconds DECIMAL(10,2),
    
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(funnel_id, period_date, step_number)
);

CREATE INDEX idx_funnel_metrics_funnel ON funnel_metrics(funnel_id, period_date DESC);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

ALTER TABLE product_usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_adoption_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_retention_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_stickiness_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_metrics ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY tenant_isolation_events ON product_usage_events
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_adoption ON feature_adoption_metrics
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_cohorts ON user_cohorts
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_retention ON cohort_retention_metrics
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_sessions ON user_sessions
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_stickiness ON feature_stickiness_metrics
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_funnel_defs ON funnel_definitions
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_funnel_metrics ON funnel_metrics
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Update timestamp trigger
CREATE TRIGGER update_cohorts_updated_at BEFORE UPDATE ON user_cohorts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_funnel_defs_updated_at BEFORE UPDATE ON funnel_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Materialized Views for Analytics
-- =====================================================

-- Top features by usage (last 30 days)
CREATE MATERIALIZED VIEW mv_top_features AS
SELECT 
    tenant_id,
    feature_name,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) as total_events,
    COUNT(DISTINCT session_id) as unique_sessions,
    AVG(EXTRACT(EPOCH FROM (timestamp - LAG(timestamp) OVER (PARTITION BY session_id ORDER BY timestamp)))) as avg_time_between_actions
FROM product_usage_events
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY tenant_id, feature_name
ORDER BY unique_users DESC;

CREATE UNIQUE INDEX ON mv_top_features (tenant_id, feature_name);

-- Overall engagement metrics
CREATE MATERIALIZED VIEW mv_engagement_summary AS
SELECT 
    tenant_id,
    DATE(timestamp) as date,
    COUNT(DISTINCT user_id) as dau,
    COUNT(DISTINCT customer_id) as active_customers,
    COUNT(*) as total_events,
    AVG(session_duration_seconds) as avg_session_duration
FROM product_usage_events
WHERE timestamp >= NOW() - INTERVAL '90 days'
GROUP BY tenant_id, DATE(timestamp);

CREATE UNIQUE INDEX ON mv_engagement_summary (tenant_id, date);

COMMENT ON MATERIALIZED VIEW mv_top_features IS 'Refresh daily - Top features by usage';
COMMENT ON MATERIALIZED VIEW mv_engagement_summary IS 'Refresh daily - Daily engagement summary';

-- Sample data for development
INSERT INTO funnel_definitions (tenant_id, funnel_name, description, steps) VALUES
('demo-tenant', 'User Onboarding', 'Track user onboarding completion', 
'[
    {"step": 1, "event": "page_view", "feature": "welcome_page", "name": "Visit Welcome"},
    {"step": 2, "event": "feature_used", "feature": "profile_setup", "name": "Complete Profile"},
    {"step": 3, "event": "feature_used", "feature": "first_project", "name": "Create Project"},
    {"step": 4, "event": "feature_used", "feature": "invite_team", "name": "Invite Team"}
]'::jsonb);
