-- Admin Panel Database Schema Migration (Simplified)
-- Creates only NEW tables that don't conflict with existing schema
-- Skips: invoices, subscription_plans, subscriptions (already exist)

-- ============================================================================
-- PHASE 1: EXTEND EXISTING TABLES
-- ============================================================================

-- Extend tenants table with admin fields (if needed)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'industry') THEN
    ALTER TABLE tenants ADD COLUMN industry VARCHAR(100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'plan_type') THEN
    ALTER TABLE tenants ADD COLUMN plan_type VARCHAR(50);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'trial_ends_at') THEN
    ALTER TABLE tenants ADD COLUMN trial_ends_at TIMESTAMP;
  END IF;
END $$;

-- Extend modules table with pricing info (if needed)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'modules' AND column_name = 'features') THEN
    ALTER TABLE modules ADD COLUMN features JSONB DEFAULT '[]';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'modules' AND column_name = 'pricing_model') THEN
    ALTER TABLE modules ADD COLUMN pricing_model VARCHAR(50);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'modules' AND column_name = 'base_price') THEN
    ALTER TABLE modules ADD COLUMN base_price DECIMAL(10,2);
  END IF;
END $$;

-- ============================================================================
-- PHASE 2: CREATE NEW ADMIN TABLES
-- ============================================================================

-- Demo Environments
CREATE TABLE IF NOT EXISTS demo_environments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  industry VARCHAR(100),
  status VARCHAR(20) DEFAULT 'provisioning',
  access_url TEXT,
  credentials JSONB,
  modules JSONB DEFAULT '[]',
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tenant Module Subscriptions
CREATE TABLE IF NOT EXISTS tenant_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255) REFERENCES tenants(id) ON DELETE CASCADE,
  module_id VARCHAR(255) REFERENCES modules(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  enabled_at TIMESTAMP DEFAULT NOW(),
  disabled_at TIMESTAMP,
  configuration JSONB DEFAULT '{}',
  UNIQUE(tenant_id, module_id)
);

-- Support Requests & Issues
CREATE TABLE IF NOT EXISTS support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'open',
  priority VARCHAR(20) DEFAULT 'medium',
  submitted_by VARCHAR(255),
  tenant_id VARCHAR(255) REFERENCES tenants(id),
  assigned_to VARCHAR(255) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Marketing Campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'draft',
  leads_generated INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT,
  author_id VARCHAR(255) REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Email Campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  template_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  subject VARCHAR(255),
  html_content TEXT,
  text_content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Affiliates
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  tier VARCHAR(20) DEFAULT 'bronze',
  commission_rate DECIMAL(5,2),
  total_referrals INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_commission DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Affiliate Referrals
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  tenant_id VARCHAR(255) REFERENCES tenants(id),
  converted BOOLEAN DEFAULT false,
  commission_amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Database Backups
CREATE TABLE IF NOT EXISTS database_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) DEFAULT 'automatic',
  status VARCHAR(20) DEFAULT 'in_progress',
  size_bytes BIGINT,
  storage_location TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- System Configuration
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB,
  category VARCHAR(50),
  description TEXT,
  updated_by VARCHAR(255) REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Feature Flags
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin Audit Logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id VARCHAR(255) REFERENCES users(id),
  actor_email VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  resource_name VARCHAR(255),
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PHASE 3: SEED DATA
-- ============================================================================

-- Seed default feature flags
INSERT INTO feature_flags (name, enabled, description)
VALUES
  ('ai_features', true, 'Enable AI-powered automation and insights'),
  ('demo_mode', true, 'Allow users to create demo environments'),
  ('advanced_analytics', true, 'Enable advanced analytics and reporting'),
  ('multi_tenancy', true, 'Enable tenant isolation and management')
ON CONFLICT (name) DO NOTHING;
