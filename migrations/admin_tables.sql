-- Admin Panel Database Migration
-- Creates tables for affiliates, affiliate_referrals, system_config, and feature_flags

-- Affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  company VARCHAR,
  tier VARCHAR DEFAULT 'bronze', -- bronze, silver, gold, platinum
  status VARCHAR DEFAULT 'pending', -- pending, active, inactive, suspended
  commission_rate NUMERIC DEFAULT 10, -- percentage
  total_referrals INTEGER DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Affiliate Referrals table
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id VARCHAR NOT NULL,
  tenant_id VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'pending', -- pending, converted, rejected
  commission_amount NUMERIC,
  created_at TIMESTAMP DEFAULT now(),
  converted_at TIMESTAMP
);

-- System Configuration table
CREATE TABLE IF NOT EXISTS system_config (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR NOT NULL UNIQUE,
  value JSONB NOT NULL,
  category VARCHAR, -- general, email, security, integrations, etc.
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Feature Flags table
CREATE TABLE IF NOT EXISTS feature_flags (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);
CREATE INDEX IF NOT EXISTS idx_affiliates_tier ON affiliates(tier);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON affiliate_referrals(status);
CREATE INDEX IF NOT EXISTS idx_system_config_category ON system_config(category);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);
