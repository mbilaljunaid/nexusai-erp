-- =====================================================
-- MRR Analytics - Database Schema
-- Module: 1.3 - SaaS MRR/ARR Analytics
-- Phase: 1 of Niche Verticals Implementation
-- =====================================================

-- =====================================================
-- Table: mrr_movements
-- Purpose: Track all MRR changes over time (waterfall)
-- =====================================================
CREATE TABLE mrr_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    
    period DATE NOT NULL, -- Month of the movement
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN (
        'new',           -- New customer MRR
        'expansion',     -- Existing customer upgrade
        'contraction',   -- Existing customer downgrade
        'churn',         -- Customer cancellation
        'reactivation'   -- Churned customer returns
    )),
    
    customer_id UUID NOT NULL,
    subscription_id UUID,
    
    -- Amounts
    amount DECIMAL(15,2) NOT NULL,
    arr_impact DECIMAL(15,2), -- Annual impact (amount * 12)
    
    -- Context
    previous_plan_id UUID,
    new_plan_id UUID,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_mrr_movements_tenant ON mrr_movements(tenant_id, period DESC);
CREATE INDEX idx_mrr_movements_customer ON mrr_movements(customer_id);
CREATE INDEX idx_mrr_movements_type ON mrr_movements(tenant_id, movement_type, period DESC);

COMMENT ON TABLE mrr_movements IS 'MRR movement tracking for waterfall analysis';

-- =====================================================
-- Table: saas_metrics_snapshot
-- Purpose: Daily/monthly snapshot of key SaaS metrics
-- =====================================================
CREATE TABLE saas_metrics_snapshot (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    
    snapshot_date DATE NOT NULL,
    snapshot_type VARCHAR(20) DEFAULT 'month' CHECK (snapshot_type IN ('day', 'month')),
    
    -- Revenue metrics
    mrr DECIMAL(15,2) NOT NULL,
    arr DECIMAL(15,2) NOT NULL, -- ARR = MRR * 12
    
    -- Customer metrics
    total_customers INT DEFAULT 0,
    new_customers INT DEFAULT 0,
    churned_customers INT DEFAULT 0,
    active_customers INT DEFAULT 0,
    
    -- Per-customer metrics
    arpu DECIMAL(15,2), -- Average Revenue Per User (MRR / customers)
    arpa DECIMAL(15,2), -- Average Revenue Per Account
    
    -- LTV & CAC
    ltv DECIMAL(15,2),  -- Customer Lifetime Value
    cac DECIMAL(15,2),  -- Customer Acquisition Cost
    ltv_cac_ratio DECIMAL(5,2), -- LTV / CAC
    
    -- Churn metrics
    customer_churn_rate DECIMAL(5,2), -- % customers churned
    revenue_churn_rate DECIMAL(5,2),  -- % MRR churned
    
    -- Retention metrics
    net_revenue_retention DECIMAL(5,2), -- NRR %
    gross_revenue_retention DECIMAL(5,2), -- GRR %
    
    -- Growth metrics
    mrr_growth_rate DECIMAL(5,2), -- % MRR growth
    quick_ratio DECIMAL(5,2), -- (New + Expansion) / (Contraction + Churn)
    
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, snapshot_date, snapshot_type)
);

CREATE INDEX idx_saas_metrics_tenant ON saas_metrics_snapshot(tenant_id, snapshot_date DESC);

COMMENT ON TABLE saas_metrics_snapshot IS 'Daily/monthly SaaS metrics snapshots for trend analysis';

-- =====================================================
-- Table: customer_revenue_timeline
-- Purpose: Customer-level revenue history
-- =====================================================
CREATE TABLE customer_revenue_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    customer_id UUID NOT NULL,
    
    period_date DATE NOT NULL,
    
    -- Revenue
    mrr DECIMAL(15,2) DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0, -- Cumulative
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    plan_id UUID,
    plan_name VARCHAR(255),
    
    -- Cohort info
    signup_date DATE,
    months_as_customer INT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, customer_id, period_date)
);

CREATE INDEX idx_revenue_timeline_customer ON customer_revenue_timeline(customer_id, period_date DESC);
CREATE INDEX idx_revenue_timeline_period ON customer_revenue_timeline(tenant_id, period_date DESC);

-- =====================================================
-- Table: cohort_ltv_analysis
-- Purpose: Lifetime value analysis by cohort
-- =====================================================
CREATE TABLE cohort_ltv_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    
    cohort_month DATE NOT NULL, -- YYYY-MM-01 (first day of signup month)
    
    -- Cohort stats
    cohort_size INT DEFAULT 0,
    
    -- Revenue metrics
    total_revenue DECIMAL(15,2) DEFAULT 0,
    avg_ltv DECIMAL(15,2), -- Total revenue / cohort size
    
    -- Retention by month
    retention_curve JSONB, -- {1: 95%, 2: 85%, 3: 78%, ...}
    
    -- Time to payback
    avg_months_to_payback DECIMAL(5,2),
    
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, cohort_month)
);

CREATE INDEX idx_cohort_ltv_tenant ON cohort_ltv_analysis(tenant_id, cohort_month DESC);

-- =====================================================
-- Table: plan_performance_metrics
-- Purpose: Per-plan revenue analytics
-- =====================================================
CREATE TABLE plan_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    plan_id UUID NOT NULL,
    
    period DATE NOT NULL,
    
    -- Subscription counts
    active_subscriptions INT DEFAULT 0,
    new_subscriptions INT DEFAULT 0,
    churned_subscriptions INT DEFAULT 0,
    
    -- Revenue
    mrr DECIMAL(15,2) DEFAULT 0,
    arr DECIMAL(15,2) DEFAULT 0,
    
    -- Performance
    churn_rate DECIMAL(5,2),
    expansion_rate DECIMAL(5,2), -- % upgrading to higher plan
    contraction_rate DECIMAL(5,2), -- % downgrading
    
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, plan_id, period)
);

CREATE INDEX idx_plan_perf_tenant ON plan_performance_metrics(tenant_id, period DESC);
CREATE INDEX idx_plan_perf_plan ON plan_performance_metrics(plan_id, period DESC);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

ALTER TABLE mrr_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_metrics_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_revenue_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_ltv_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_mrr ON mrr_movements
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_metrics ON saas_metrics_snapshot
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_revenue_timeline ON customer_revenue_timeline
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_cohort_ltv ON cohort_ltv_analysis
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_plan_perf ON plan_performance_metrics
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

-- =====================================================
-- Materialized Views
-- =====================================================

-- Current MRR by movement type (last 12 months)
CREATE MATERIALIZED VIEW mv_mrr_waterfall AS
SELECT 
    tenant_id,
    period,
    movement_type,
    SUM(amount) as total_amount,
    COUNT(*) as movement_count,
    COUNT(DISTINCT customer_id) as unique_customers
FROM mrr_movements
WHERE period >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
GROUP BY tenant_id, period, movement_type;

CREATE UNIQUE INDEX ON mv_mrr_waterfall (tenant_id, period, movement_type);

-- Latest metrics snapshot
CREATE MATERIALIZED VIEW mv_current_saas_metrics AS
SELECT DISTINCT ON (tenant_id)
    tenant_id,
    snapshot_date,
    mrr,
    arr,
    total_customers,
    arpu,
    ltv,
    cac,
    ltv_cac_ratio,
    customer_churn_rate,
    net_revenue_retention,
    mrr_growth_rate
FROM saas_metrics_snapshot
ORDER BY tenant_id, snapshot_date DESC;

CREATE UNIQUE INDEX ON mv_current_saas_metrics (tenant_id);

-- =====================================================
-- Helper Functions
-- =====================================================

-- Calculate NRR (Net Revenue Retention)
CREATE OR REPLACE FUNCTION calculate_nrr(
    p_tenant_id VARCHAR(100),
    p_start_date DATE,
    p_end_date DATE
) RETURNS DECIMAL(5,2) AS $$
DECLARE
    starting_mrr DECIMAL(15,2);
    ending_mrr DECIMAL(15,2);
    expansion DECIMAL(15,2);
    contraction DECIMAL(15,2);
    churn DECIMAL(15,2);
    nrr DECIMAL(5,2);
BEGIN
    -- Get starting MRR
    SELECT COALESCE(SUM(mrr), 0) INTO starting_mrr
    FROM customer_revenue_timeline
    WHERE tenant_id = p_tenant_id 
    AND period_date = p_start_date
    AND is_active = true;
    
    IF starting_mrr = 0 THEN
        RETURN 0;
    END IF;
    
    -- Get movements
    SELECT 
        COALESCE(SUM(CASE WHEN movement_type = 'expansion' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN movement_type = 'contraction' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN movement_type = 'churn' THEN amount ELSE 0 END), 0)
    INTO expansion, contraction, churn
    FROM mrr_movements
    WHERE tenant_id = p_tenant_id
    AND period >= p_start_date
    AND period <= p_end_date;
    
    -- NRR = (Starting MRR + Expansion - Contraction - Churn) / Starting MRR * 100
    nrr := ((starting_mrr + expansion - contraction - churn) / starting_mrr) * 100;
    
    RETURN ROUND(nrr, 2);
END;
$$ LANGUAGE plpgsql;

-- Calculate Quick Ratio
CREATE OR REPLACE FUNCTION calculate_quick_ratio(
    p_tenant_id VARCHAR(100),
    p_period DATE
) RETURNS DECIMAL(5,2) AS $$
DECLARE
    new_expansion DECIMAL(15,2);
    contraction_churn DECIMAL(15,2);
    quick_ratio DECIMAL(5,2);
BEGIN
    SELECT 
        COALESCE(SUM(CASE WHEN movement_type IN ('new', 'expansion') THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN movement_type IN ('contraction', 'churn') THEN amount ELSE 0 END), 0)
    INTO new_expansion, contraction_churn
    FROM mrr_movements
    WHERE tenant_id = p_tenant_id
    AND period = p_period;
    
    IF contraction_churn = 0 THEN
        RETURN 999.99; -- Infinite growth
    END IF;
    
    quick_ratio := new_expansion / contraction_churn;
    RETURN ROUND(quick_ratio, 2);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Sample Data
-- =====================================================

-- Insert sample MRR movements for demo
INSERT INTO mrr_movements (tenant_id, period, movement_type, customer_id, amount, arr_impact) VALUES
('demo-tenant', '2026-01-01', 'new', uuid_generate_v4(), 1000, 12000),
('demo-tenant', '2026-01-01', 'new', uuid_generate_v4(), 500, 6000),
('demo-tenant', '2026-01-01', 'expansion', uuid_generate_v4(), 200, 2400),
('demo-tenant', '2026-01-01', 'contraction', uuid_generate_v4(), -100, -1200),
('demo-tenant', '2026-01-01', 'churn', uuid_generate_v4(), -300, -3600);

COMMENT ON MATERIALIZED VIEW mv_mrr_waterfall IS 'Refresh daily - MRR waterfall by movement type';
COMMENT ON MATERIALIZED VIEW mv_current_saas_metrics IS 'Refresh hourly - Latest SaaS metrics snapshot';
