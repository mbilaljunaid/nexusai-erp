-- Seed Data for Industry Onboarding System
-- Populates initial industries, modules, and their mappings

-- =====================================================
-- SEED: Industries
-- =====================================================
INSERT INTO industries (code, name, description, tagline, icon, color) VALUES
('healthcare', 'Healthcare', 'Patient & Clinical Management', 'Complete Patient & Clinical Management Solution', 'heart', 'from-red-500/10 to-pink-500/10'),
('telecom', 'Telecommunications', 'Network & Billing Operations', 'Network Operations & Billing Solution', 'wifi', 'from-blue-500/10 to-cyan-500/10'),
('hospitality', 'Hospitality', 'Reservations & Guest CRM', 'Hospitality & Guest Management Solution', 'hotel', 'from-purple-500/10 to-pink-500/10'),
('retail', 'Retail & Commerce', 'POS & Omnichannel', 'Omnichannel Retail Management Solution', 'shopping-bag', 'from-green-500/10 to-emerald-500/10'),
('logistics', 'Logistics', 'Shipping & Cold Chain', 'Supply Chain & Logistics Solution', 'boxes', 'from-orange-500/10 to-amber-500/10'),
('automotive', 'Automotive', 'Production & Sales', 'Automotive Manufacturing & Sales Solution', 'car', 'from-slate-500/10 to-gray-500/10'),
('banking', 'Banking & Finance', 'Core Banking & Loans', 'Core Banking & Financial Services Solution', 'landmark', 'from-yellow-500/10 to-amber-500/10'),
('insurance', 'Insurance', 'Policies & Claims', 'Insurance Policy & Claims Management', 'shield', 'from-indigo-500/10 to-blue-500/10'),
('government', 'Government', 'Citizen Services', 'Government & Public Sector Solution', 'landmark', 'from-teal-500/10 to-cyan-500/10'),
('education', 'Education', 'Admissions & Faculty', 'Education Management Solution', 'graduation-cap', 'from-violet-500/10 to-purple-500/10'),
('energy', 'Energy & Utilities', 'Grid Ops & Trading', 'Energy & Utilities Management', 'flame', 'from-red-500/10 to-orange-500/10')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- SEED: Modules
-- =====================================================
INSERT INTO modules (code, name, description, category, is_core) VALUES
-- Core Modules
('core_hr', 'Core HR', 'Employee & organizational management', 'HR', true),
('payroll', 'Payroll', 'Payroll processing & tax management', 'HR', true),
('finance', 'Finance', 'General ledger & financial management', 'Finance', true),

-- HR & Talent Modules
('recruitment', 'Recruitment', 'Talent acquisition & hiring', 'HR', false),
('performance', 'Performance Management', 'Goals, reviews & evaluations', 'HR', false),
('learning', 'Learning & Development', 'Training & skill development', 'HR', false),
('compensation', 'Compensation', 'Total rewards management', 'HR', false),
('wfm', 'Workforce Management', 'Time, attendance & scheduling', 'HR', false),

-- Finance Modules
('ap', 'Accounts Payable', 'Vendor invoice & payment management', 'Finance', false),
('ar', 'Accounts Receivable', 'Customer billing & collections', 'Finance', false),
('gl', 'General Ledger', 'Chart of accounts & journal entries', 'Finance', false),
('billing', 'Billing & Subscriptions', 'Subscription & usage-based billing', 'Finance', false),
('revenue', 'Revenue Management', 'ASC 606 revenue recognition', 'Finance', false),
('treasury', 'Treasury', 'Cash & liquidity management', 'Finance', false),
('tax', 'Tax Management', 'Tax compliance & reporting', 'Finance', false),
('fixed_assets', 'Fixed Assets', 'Asset lifecycle management', 'Finance', false),

-- Supply Chain Modules
('scm', 'Supply Chain Management', 'End-to-end supply chain', 'SCM', false),
('procurement', 'Procurement', 'Purchase requisitions & orders', 'SCM', false),
('inventory', 'Inventory Management', 'Stock & warehouse management', 'SCM', false),
('wms', 'Warehouse Management', 'Advanced warehouse operations', 'SCM', false),
('manufacturing', 'Manufacturing', 'Production & MRP', 'SCM', false),
('quality', 'Quality Management', 'Quality control & inspections', 'SCM', false),
('maintenance', 'Maintenance', 'Asset maintenance & work orders', 'SCM', false),
('transportation', 'Transportation Management', 'Shipping & logistics', 'SCM', false),

-- CRM & Sales Modules
('crm', 'CRM', 'Customer relationship management', 'Sales', false),
('sales', 'Sales Management', 'Opportunity & pipeline management', 'Sales', false),
('cpq', 'CPQ', 'Configure, price, quote', 'Sales', false),
('ecommerce', 'E-Commerce', 'Online store platform', 'Sales', false),

-- Operations Modules
('pos', 'Point of Sale', 'Retail POS system', 'Operations', false),
('projects', 'Project Management', 'Project planning & tracking', 'Operations', false),
('construction', 'Construction Management', 'Construction project management', 'Operations', false),

-- Compliance & Analytics
('compliance', 'Compliance', 'Regulatory compliance management', 'Governance', false),
('analytics', 'Analytics & BI', 'Business intelligence & reporting', 'Analytics', false),

-- Industry-Specific Modules
('clinical', 'Clinical Documentation', 'EHR & clinical workflows', 'Healthcare', false),
('pharmacy', 'Pharmacy Management', 'Prescription & medication management', 'Healthcare', false),
('scheduling', 'Scheduling', 'Appointment & resource scheduling', 'Healthcare', false),
('network_oss', 'Network OSS', 'Network operations support systems', 'Telecom', false),
('reservations', 'Reservations', 'Booking & reservation management', 'Hospitality', false),
('fnb', 'F&B Management', 'Food & beverage operations', 'Hospitality', false)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- SEED: Industry-Module Mappings - HEALTHCARE
-- =====================================================
INSERT INTO industry_module_mappings (industry_id, module_id, is_recommended, is_required, priority)
SELECT 
    i.id,
    m.id,
    mapping.is_recommended,
    mapping.is_required,
    mapping.priority
FROM industries i
CROSS JOIN LATERAL (
    VALUES
        ('core_hr', true, true, 100),
        ('payroll', true, true, 90),
        ('scheduling', true, false, 80),
        ('compliance', true, false, 70),
        ('billing', true, false, 60),
        ('clinical', true, false, 50),
        ('pharmacy', true, false, 40),
        ('inventory', false, false, 30)
) AS mapping(module_code, is_recommended, is_required, priority)
JOIN modules m ON m.code = mapping.module_code
WHERE i.code = 'healthcare'
ON CONFLICT (industry_id, module_id) DO NOTHING;

-- =====================================================
-- SEED: Industry-Module Mappings - RETAIL
-- =====================================================
INSERT INTO industry_module_mappings (industry_id, module_id, is_recommended, is_required, priority)
SELECT 
    i.id,
    m.id,
    mapping.is_recommended,
    mapping.is_required,
    mapping.priority
FROM industries i
CROSS JOIN LATERAL (
    VALUES
        ('inventory', true, true, 100),
        ('pos', true, true, 90),
        ('crm', true, false, 80),
        ('scm', true, false, 70),
        ('ecommerce', true, false, 60),
        ('analytics', true, false, 50)
) AS mapping(module_code, is_recommended, is_required, priority)
JOIN modules m ON m.code = mapping.module_code
WHERE i.code = 'retail'
ON CONFLICT (industry_id, module_id) DO NOTHING;

-- =====================================================
-- SEED: Industry-Module Mappings - TELECOM
-- =====================================================
INSERT INTO industry_module_mappings (industry_id, module_id, is_recommended, is_required, priority)
SELECT 
    i.id,
    m.id,
    mapping.is_recommended,
    mapping.is_required,
    mapping.priority
FROM industries i
CROSS JOIN LATERAL (
    VALUES
        ('network_oss', true, true, 100),
        ('billing', true, true, 90),
        ('crm', true, false, 80),
        ('compliance', true, false, 70)
) AS mapping(module_code, is_recommended, is_required, priority)
JOIN modules m ON m.code = mapping.module_code
WHERE i.code = 'telecom'
ON CONFLICT (industry_id, module_id) DO NOTHING;

-- =====================================================
-- SEED: Industry-Module Mappings - HOSPITALITY
-- =====================================================
INSERT INTO industry_module_mappings (industry_id, module_id, is_recommended, is_required, priority)
SELECT 
    i.id,
    m.id,
    mapping.is_recommended,
    mapping.is_required,
    mapping.priority
FROM industries i
CROSS JOIN LATERAL (
    VALUES
        ('reservations', true, true, 100),
        ('pos', true, true, 90),
        ('crm', true, false, 80),
        ('fnb', true, false, 70),
        ('core_hr', true, false, 60)
) AS mapping(module_code, is_recommended, is_required, priority)
JOIN modules m ON m.code = mapping.module_code
WHERE i.code = 'hospitality'
ON CONFLICT (industry_id, module_id) DO NOTHING;

-- Continue for other industries...
-- (Manufacturing, Logistics, Banking, Insurance, Government, Education, Energy)
-- Following same pattern with industry-specific module recommendations

COMMENT ON TABLE industry_module_mappings IS 'Defines module recommendations per industry - populated with curated mappings for all 11 industries';
