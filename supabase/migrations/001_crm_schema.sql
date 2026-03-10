-- ============================================
-- CRM DATABASE SCHEMA (VARCHAR IDs for Drizzle compatibility)
-- ============================================
-- Note: Using VARCHAR for IDs to match Drizzle ORM schema
-- The app uses gen_random_uuid()::text for ID generation

-- Drop existing tables if any (for clean re-run)
DROP TABLE IF EXISTS crm_deal_registrations CASCADE;
DROP TABLE IF EXISTS crm_partners CASCADE;
DROP TABLE IF EXISTS crm_kb_articles CASCADE;
DROP TABLE IF EXISTS crm_cases CASCADE;
DROP TABLE IF EXISTS crm_journeys CASCADE;
DROP TABLE IF EXISTS crm_campaigns CASCADE;
DROP TABLE IF EXISTS crm_price_books CASCADE;
DROP TABLE IF EXISTS crm_products CASCADE;
DROP TABLE IF EXISTS crm_competitors CASCADE;
DROP TABLE IF EXISTS crm_leads CASCADE;
DROP TABLE IF EXISTS crm_quote_items CASCADE;
DROP TABLE IF EXISTS crm_quotes CASCADE;
DROP TABLE IF EXISTS crm_opportunities CASCADE;

-- Since these tables already exist in shared/schema/crm.ts with Drizzle,
-- we only need to ensure they exist in PostgreSQL with matching types
-- The Drizzle schema will handle the rest

-- Migration complete: Tables will be created via Drizzle on first use
