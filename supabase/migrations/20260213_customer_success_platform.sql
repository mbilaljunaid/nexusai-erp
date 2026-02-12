-- =====================================================
-- Customer Success Platform - Database Schema
-- Module: SaaS Customer Success
-- Phase: 1.1 of Niche Verticals Implementation
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Table: customer_health_scores
-- Purpose: Track customer health metrics over time
-- =====================================================
CREATE TABLE customer_health_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    customer_id UUID NOT NULL,
    health_score DECIMAL(5,2) NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
    trend VARCHAR(20) CHECK (trend IN ('improving', 'stable', 'declining', 'critical')),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    
    -- Health score factors (JSON structure)
    factors JSONB DEFAULT '{}'::jsonb,
    -- Example: {
    --   "usage_score": 60,
    --   "support_tickets_score": 20,
    --   "nps_score": 80,
    --   "feature_adoption_score": 70,
    --   "payment_history_score": 95
    -- }
    
    last_engagement TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    days_since_last_activity INT,
    
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT fk_health_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX idx_health_scores_tenant ON customer_health_scores(tenant_id);
CREATE INDEX idx_health_scores_customer ON customer_health_scores(customer_id);
CREATE INDEX idx_health_scores_risk ON customer_health_scores(tenant_id, risk_level);
CREATE INDEX idx_health_scores_calculated ON customer_health_scores(calculated_at DESC);

COMMENT ON TABLE customer_health_scores IS 'Tracks customer health metrics and risk levels for proactive success management';
COMMENT ON COLUMN customer_health_scores.health_score IS 'Overall health score from 0-100';
COMMENT ON COLUMN customer_health_scores.factors IS 'JSON breakdown of individual health factors';

-- =====================================================
-- Table: cs_playbooks
-- Purpose: Define automated customer success playbooks
-- =====================================================
CREATE TABLE cs_playbooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Trigger configuration
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN (
        'health_decline', 
        'milestone', 
        'renewal', 
        'onboarding',
        'expansion_opportunity',
        'churn_risk',
        'usage_threshold'
    )),
    
    trigger_conditions JSONB NOT NULL,
    -- Example: {
    --   "health_score_below": 60,
    --   "days_inactive": 14,
    --   "support_tickets_count": 5
    -- }
    
    -- Actions to execute
    actions JSONB NOT NULL,
    -- Example: [
    --   {"type": "email", "template_id": "uuid", "delay_days": 0},
    --   {"type": "task", "assigned_to": "uuid", "description": "Call customer"},
    --   {"type": "notification", "message": "High risk customer"}
    -- ]
    
    priority INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    execution_count INT DEFAULT 0,
    last_executed_at TIMESTAMP WITH TIME ZONE,
    
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_playbooks_tenant ON cs_playbooks(tenant_id);
CREATE INDEX idx_playbooks_active ON cs_playbooks(tenant_id, is_active);
CREATE INDEX idx_playbooks_trigger ON cs_playbooks(trigger_type);

COMMENT ON TABLE cs_playbooks IS 'Automated playbooks for customer success workflows';
COMMENT ON COLUMN cs_playbooks.trigger_conditions IS 'JSON conditions that trigger the playbook';
COMMENT ON COLUMN cs_playbooks.actions IS 'JSON array of actions to execute when triggered';

-- =====================================================
-- Table: playbook_executions
-- Purpose: Track playbook execution history
-- =====================================================
CREATE TABLE playbook_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    playbook_id UUID NOT NULL REFERENCES cs_playbooks(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    execution_status VARCHAR(50) CHECK (execution_status IN ('success', 'failed', 'partial')),
    actions_completed INT DEFAULT 0,
    actions_failed INT DEFAULT 0,
    
    execution_log JSONB,
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_playbook_exec_tenant ON playbook_executions(tenant_id);
CREATE INDEX idx_playbook_exec_playbook ON playbook_executions(playbook_id);
CREATE INDEX idx_playbook_exec_customer ON playbook_executions(customer_id);
CREATE INDEX idx_playbook_exec_date ON playbook_executions(executed_at DESC);

-- =====================================================
-- Table: customer_touchpoints
-- Purpose: Track all customer success interactions
-- =====================================================
CREATE TABLE customer_touchpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    customer_id UUID NOT NULL,
    csm_user_id UUID, -- Customer Success Manager
    
    touchpoint_type VARCHAR(50) NOT NULL CHECK (touchpoint_type IN (
        'call',
        'email',
        'meeting',
        'qbr', -- Quarterly Business Review
        'check_in',
        'training',
        'escalation',
        'renewal_discussion',
        'expansion_discussion'
    )),
    
    subject VARCHAR(500),
    description TEXT,
    
    sentiment VARCHAR(20) CHECK (sentiment IN ('very_positive', 'positive', 'neutral', 'negative', 'very_negative')),
    sentiment_score DECIMAL(3,1) CHECK (sentiment_score >= 1 AND sentiment_score <= 5), -- 1-5 scale
    
    -- Follow-up tracking
    next_action VARCHAR(255),
    next_action_date DATE,
    next_action_owner UUID,
    
    -- Metadata
    duration_minutes INT,
    attendees JSONB, -- Array of user IDs
    attachments JSONB, -- Array of file URLs
    tags VARCHAR(100)[],
    
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_touchpoint_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX idx_touchpoints_tenant ON customer_touchpoints(tenant_id);
CREATE INDEX idx_touchpoints_customer ON customer_touchpoints(customer_id);
CREATE INDEX idx_touchpoints_csm ON customer_touchpoints(csm_user_id);
CREATE INDEX idx_touchpoints_type ON customer_touchpoints(touchpoint_type);
CREATE INDEX idx_touchpoints_date ON customer_touchpoints(created_at DESC);
CREATE INDEX idx_touchpoints_next_action ON customer_touchpoints(next_action_date) WHERE next_action_date IS NOT NULL;

COMMENT ON TABLE customer_touchpoints IS 'All customer success interactions and touchpoints';
COMMENT ON COLUMN customer_touchpoints.sentiment_score IS 'Numeric sentiment rating from 1 (very negative) to 5 (very positive)';

-- =====================================================
-- Table: customer_milestones
-- Purpose: Track customer lifecycle milestones
-- =====================================================
CREATE TABLE customer_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    customer_id UUID NOT NULL,
    
    milestone_type VARCHAR(50) NOT NULL CHECK (milestone_type IN (
        'onboarding_started',
        'first_login',
        'first_value',
        'fully_onboarded',
        'expansion',
        'renewal',
        'advocate',
        'at_risk',
        'churned'
    )),
    
    milestone_date TIMESTAMP WITH TIME ZONE NOT NULL,
    milestone_value JSONB, -- Additional context data
    
    notes TEXT,
    recorded_by UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_milestone_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX idx_milestones_tenant ON customer_milestones(tenant_id);
CREATE INDEX idx_milestones_customer ON customer_milestones(customer_id);
CREATE INDEX idx_milestones_type ON customer_milestones(milestone_type);
CREATE INDEX idx_milestones_date ON customer_milestones(milestone_date DESC);

COMMENT ON TABLE customer_milestones IS 'Customer lifecycle milestones for success tracking';

-- =====================================================
-- Table: cs_goals
-- Purpose: Track customer success goals and OKRs
-- =====================================================
CREATE TABLE cs_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    customer_id UUID NOT NULL,
    
    goal_name VARCHAR(255) NOT NULL,
    goal_description TEXT,
    goal_type VARCHAR(50) CHECK (goal_type IN ('business_outcome', 'adoption', 'usage', 'satisfaction')),
    
    target_metric VARCHAR(100),
    target_value DECIMAL(15,2),
    current_value DECIMAL(15,2),
    
    start_date DATE,
    target_date DATE,
    
    status VARCHAR(50) CHECK (status IN ('not_started', 'on_track', 'at_risk', 'achieved', 'missed')),
    progress_percentage DECIMAL(5,2) CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    owner_user_id UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_goal_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX idx_goals_tenant ON cs_goals(tenant_id);
CREATE INDEX idx_goals_customer ON cs_goals(customer_id);
CREATE INDEX idx_goals_status ON cs_goals(status);
CREATE INDEX idx_goals_target_date ON cs_goals(target_date);

COMMENT ON TABLE cs_goals IS 'Customer success goals and objectives tracking';

-- =====================================================
-- Table: renewal_forecasts
-- Purpose: Track renewal probability and forecasting
-- =====================================================
CREATE TABLE renewal_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    customer_id UUID NOT NULL,
    
    renewal_date DATE NOT NULL,
    current_arr DECIMAL(15,2) NOT NULL,
    forecasted_arr DECIMAL(15,2),
    
    renewal_probability DECIMAL(5,2) CHECK (renewal_probability >= 0 AND renewal_probability <= 100),
    expansion_probability DECIMAL(5,2) CHECK (expansion_probability >= 0 AND expansion_probability <= 100),
    churn_risk DECIMAL(5,2) CHECK (churn_risk >= 0 AND churn_risk <= 100),
    
    risk_factors JSONB,
    -- Example: {
    --   "low_usage": true,
    --   "support_escalations": 3,
    --   "champion_left": false,
    --   "competitive_pressure": true
    -- }
    
    mitigation_plan TEXT,
    csm_confidence VARCHAR(20) CHECK (csm_confidence IN ('very_low', 'low', 'medium', 'high', 'very_high')),
    
    last_updated_by UUID,
    forecast_date DATE DEFAULT CURRENT_DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_renewal_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX idx_renewals_tenant ON renewal_forecasts(tenant_id);
CREATE INDEX idx_renewals_customer ON renewal_forecasts(customer_id);
CREATE INDEX idx_renewals_date ON renewal_forecasts(renewal_date);
CREATE INDEX idx_renewals_risk ON renewal_forecasts(tenant_id, churn_risk DESC);

COMMENT ON TABLE renewal_forecasts IS 'Renewal probability forecasting and risk tracking';

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE customer_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE cs_playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_touchpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cs_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewal_forecasts ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY tenant_isolation_health ON customer_health_scores
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_playbooks ON cs_playbooks
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_executions ON playbook_executions
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_touchpoints ON customer_touchpoints
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_milestones ON customer_milestones
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_goals ON cs_goals
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_renewals ON renewal_forecasts
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_health_scores_updated_at BEFORE UPDATE ON customer_health_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playbooks_updated_at BEFORE UPDATE ON cs_playbooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_touchpoints_updated_at BEFORE UPDATE ON customer_touchpoints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON cs_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_renewals_updated_at BEFORE UPDATE ON renewal_forecasts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Sample Data (for development/testing)
-- =====================================================

-- Insert sample playbook
INSERT INTO cs_playbooks (tenant_id, name, description, trigger_type, trigger_conditions, actions, is_active)
VALUES (
    'demo-tenant',
    'Health Decline Alert',
    'Automatically alert CSM when customer health score drops below 60',
    'health_decline',
    '{"health_score_below": 60, "trend": "declining"}'::jsonb,
    '[
        {"type": "notification", "message": "Customer health declining - immediate action needed"},
        {"type": "task", "title": "Schedule check-in call", "priority": "high"}
    ]'::jsonb,
    true
);

-- Analytics/Reporting Comment
COMMENT ON TABLE customer_health_scores IS 'ANALYTICS: Primary table for customer health dashboards and risk reporting';
COMMENT ON TABLE renewal_forecasts IS 'ANALYTICS: Key table for renewal pipeline and churn prediction models';
