-- Additional Industry-Specific Modules
-- Expanding module catalog for comprehensive industry coverage

INSERT INTO modules (code, name, description, category, is_core) VALUES
-- Logistics-specific
('tracking', 'Shipment Tracking', 'Real-time shipment tracking & visibility', 'SCM', false),
('cold_chain', 'Cold Chain Management', 'Temperature-controlled logistics', 'SCM', false),
('route_optimization', 'Route Optimization', 'AI-powered route planning', 'SCM', false),

-- Banking/Finance-specific
('loan_origination', 'Loan Origination', 'Loan application & underwriting', 'Finance', false),
('risk_management', 'Risk Management', 'Credit & operational risk', 'Governance', false),
('customer_onboarding', 'Customer Onboarding', 'KYC & AML compliance', 'Governance', false),

-- Insurance-specific
('policy_admin', 'Policy Administration', 'Policy lifecycle management', 'Insurance', false),
('claims', 'Claims Management', 'Claims processing & adjudication', 'Insurance', false),
('underwriting', 'Underwriting', 'Risk assessment & pricing', 'Insurance', false),
('actuarial', 'Actuarial Management', 'Actuarial calculations & reserves', 'Insurance', false),

-- Government-specific
('permits', 'Permits & Licensing', 'Permit application & tracking', 'Government', false),
('case_management', 'Case Management', 'Citizen case tracking', 'Government', false),
('grants', 'Grants Management', 'Grant application & disbursement', 'Government', false),

-- Education-specific
('admissions', 'Admissions', 'Student recruitment & enrollment', 'Education', false),
('student_info', 'Student Information System', 'Student records & transcripts', 'Education', false),
('curriculum', 'Curriculum Management', 'Course planning & scheduling', 'Education', false),
('alumni', 'Alumni Management', 'Alumni engagement & fundraising', 'Education', false),

-- Energy-specific
('asset_health', 'Asset Health Monitoring', 'Predictive asset maintenance', 'Operations', false),
('outage_management', 'Outage Management', 'Power outage tracking & response', 'Operations', false),
('smart_grid', 'Smart Grid Management', 'Grid optimization & monitoring', 'Operations', false),
('trading', 'Energy Trading', 'Commodity trading & hedging', 'Finance', false),

-- Automotive-specific
('dealer_management', 'Dealer Management', 'Dealership operations & sales', 'Sales', false),
('warranty', 'Warranty Management', 'Warranty claims & tracking', 'Operations', false),
('recall_management', 'Recall Management', 'Product recall coordination', 'Governance', false),

-- Hospitality-specific
('housekeeping', 'Housekeeping', 'Room maintenance & cleaning', 'Hospitality', false),
('events', 'Events Management', 'Event planning & execution', 'Hospitality', false),
('loyalty', 'Loyalty Programs', 'Guest loyalty & rewards', 'Hospitality', false)
ON CONFLICT (code) DO NOTHING;
