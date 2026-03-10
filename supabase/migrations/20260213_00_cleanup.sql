-- =====================================================
-- COMPLETE CLEANUP: Drop ALL niche vertical tables
-- Run this BEFORE running the main migrations
-- =====================================================

-- Automotive
DROP TABLE IF EXISTS parts_order_lines CASCADE;
DROP TABLE IF EXISTS parts_orders CASCADE;
DROP TABLE IF EXISTS auto_parts CASCADE;
DROP TABLE IF EXISTS service_ro_lines CASCADE;
DROP TABLE IF EXISTS service_appointments CASCADE;
DROP TABLE IF EXISTS online_quotes CASCADE;
DROP TABLE IF EXISTS vehicle_inventory CASCADE;

-- Education
DROP TABLE IF EXISTS academic_transcripts CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS application_documents CASCADE;
DROP TABLE IF EXISTS admission_applications CASCADE;
DROP TABLE IF EXISTS aid_packages CASCADE;
DROP TABLE IF EXISTS financial_aid_applications CASCADE;

-- Insurance
DROP TABLE IF EXISTS risk_factors CASCADE;
DROP TABLE IF EXISTS underwriting_submissions CASCADE;
DROP TABLE IF EXISTS ceded_claims CASCADE;
DROP TABLE IF EXISTS reinsurance_treaties CASCADE;
DROP TABLE IF EXISTS claim_documents CASCADE;
DROP TABLE IF EXISTS insurance_claims CASCADE;

-- Government
DROP TABLE IF EXISTS compliance_violations CASCADE;
DROP TABLE IF EXISTS compliance_filings CASCADE;
DROP TABLE IF EXISTS compliance_regulations CASCADE;
DROP TABLE IF EXISTS trading_positions CASCADE;
DROP TABLE IF EXISTS energy_contracts CASCADE;
DROP TABLE IF EXISTS dr_enrollments CASCADE;
DROP TABLE IF EXISTS dr_events CASCADE;
DROP TABLE IF EXISTS dr_programs CASCADE;
DROP TABLE IF EXISTS outage_notifications CASCADE;
DROP TABLE IF EXISTS outages CASCADE;
DROP TABLE IF EXISTS emergency_resources CASCADE;
DROP TABLE IF EXISTS emergency_incidents CASCADE;
DROP TABLE IF EXISTS work_orders CASCADE;
DROP TABLE IF EXISTS public_assets CASCADE;
DROP TABLE IF EXISTS tax_payments CASCADE;
DROP TABLE IF EXISTS tax_filings CASCADE;

-- Energy & Utilities
DROP TABLE IF EXISTS meter_readings_2026_02 CASCADE;
DROP TABLE IF EXISTS meter_readings_2026_01 CASCADE;
DROP TABLE IF EXISTS meter_readings CASCADE;
DROP TABLE IF EXISTS smart_meters CASCADE;
DROP TABLE IF EXISTS grid_topology CASCADE;
DROP TABLE IF EXISTS grid_assets CASCADE;

-- Real Estate
DROP TABLE IF EXISTS property_showings CASCADE;
DROP TABLE IF EXISTS listing_inquiries CASCADE;
DROP TABLE IF EXISTS property_listings CASCADE;
DROP TABLE IF EXISTS lease_renewals CASCADE;
DROP TABLE IF EXISTS lease_payments CASCADE;
DROP TABLE IF EXISTS leases CASCADE;
DROP TABLE IF EXISTS property_maintenance CASCADE;
DROP TABLE IF EXISTS maintenance_requests CASCADE;
DROP TABLE IF EXISTS property_amenities CASCADE;
DROP TABLE IF EXISTS property_units CASCADE;
DROP TABLE IF EXISTS properties CASCADE;

-- E-commerce
DROP TABLE IF EXISTS dam_transformations CASCADE;
DROP TABLE IF EXISTS dam_folders CASCADE;
DROP TABLE IF EXISTS dam_assets CASCADE;
DROP TABLE IF EXISTS rma_attachments CASCADE;
DROP TABLE IF EXISTS rma_requests CASCADE;
DROP TABLE IF EXISTS marketplace_commissions CASCADE;
DROP TABLE IF EXISTS asset_transformations CASCADE;
DROP TABLE IF EXISTS asset_folders CASCADE;
DROP TABLE IF EXISTS digital_assets CASCADE;
DROP TABLE IF EXISTS rma_returns CASCADE;
DROP TABLE IF EXISTS marketplace_products CASCADE;
DROP TABLE IF EXISTS vendor_products CASCADE;
DROP TABLE IF EXISTS marketplace_vendors CASCADE;

-- PIM
DROP TABLE IF EXISTS pim_bulk_operations CASCADE;
DROP TABLE IF EXISTS pim_channel_content CASCADE;
DROP TABLE IF EXISTS pim_product_variants CASCADE;
DROP TABLE IF EXISTS pim_product_relationships CASCADE;
DROP TABLE IF EXISTS pim_product_categories CASCADE;
DROP TABLE IF EXISTS pim_product_attributes CASCADE;
DROP TABLE IF EXISTS pim_products CASCADE;
DROP TABLE IF EXISTS pim_brands CASCADE;
DROP TABLE IF EXISTS pim_categories CASCADE;
DROP TABLE IF EXISTS pim_attribute_definitions CASCADE;
DROP TABLE IF EXISTS pim_attributes CASCADE;

-- Trial & Plan Management
DROP TABLE IF EXISTS customer_plan_usage CASCADE;
DROP TABLE IF EXISTS plan_change_history CASCADE;
DROP TABLE IF EXISTS plan_usage_tracking CASCADE;
DROP TABLE IF EXISTS plan_features CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS trial_milestone_tracking CASCADE;
DROP TABLE IF EXISTS trial_conversion_funnel CASCADE;
DROP TABLE IF EXISTS trial_signups CASCADE;

-- MRR Analytics
DROP TABLE IF EXISTS cohort_ltv_analysis CASCADE;
DROP TABLE IF EXISTS plan_performance_metrics CASCADE;
DROP TABLE IF EXISTS saas_metrics_snapshot CASCADE;
DROP TABLE IF EXISTS customer_revenue_timeline CASCADE;
DROP TABLE IF EXISTS mrr_movements CASCADE;

-- Usage Analytics
DROP TABLE IF EXISTS funnel_step_events CASCADE;
DROP TABLE IF EXISTS funnel_steps CASCADE;
DROP TABLE IF EXISTS user_funnels CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_cohorts CASCADE;
DROP TABLE IF EXISTS feature_adoption_metrics CASCADE;
DROP TABLE IF EXISTS product_usage_events CASCADE;

-- Customer Success
DROP TABLE IF EXISTS renewal_forecasts CASCADE;
DROP TABLE IF EXISTS cs_goals CASCADE;
DROP TABLE IF EXISTS customer_milestones CASCADE;
DROP TABLE IF EXISTS customer_touchpoints CASCADE;
DROP TABLE IF EXISTS playbook_executions CASCADE;
DROP TABLE IF EXISTS cs_playbooks CASCADE;
DROP TABLE IF EXISTS success_playbook_executions CASCADE;
DROP TABLE IF EXISTS success_playbooks CASCADE;
DROP TABLE IF EXISTS success_goals CASCADE;
DROP TABLE IF EXISTS customer_health_scores CASCADE;

-- Drop customers table (will be recreated by prerequisites)
DROP TABLE IF EXISTS customers CASCADE;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'All niche vertical tables dropped successfully';
END $$;
