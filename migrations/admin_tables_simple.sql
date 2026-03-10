-- Simple Admin Tables Migration
-- Run this with: node scripts/run-migration.js

CREATE TABLE IF NOT EXISTS affiliates (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  company VARCHAR,
  tier VARCHAR DEFAULT 'bronze',
  status VARCHAR DEFAULT 'pending',
  commission_rate NUMERIC DEFAULT 10,
  total_referrals INTEGER DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  affiliate_id VARCHAR NOT NULL,
  tenant_id VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'pending',
  commission_amount NUMERIC,
  created_at TIMESTAMP DEFAULT now(),
  converted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_config (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key VARCHAR NOT NULL UNIQUE,
  value JSONB NOT NULL,
  category VARCHAR,
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feature_flags (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);
CREATE INDEX IF NOT EXISTS idx_affiliates_tier ON affiliates(tier);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON affiliate_referrals(status);
CREATE INDEX IF NOT EXISTS idx_system_config_category ON system_config(category);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);
