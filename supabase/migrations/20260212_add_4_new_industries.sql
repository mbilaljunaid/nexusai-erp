-- Additional Industries: Real Estate, Construction, SaaS, E-commerce
-- Expanding industry coverage to 15 total industries

-- =====================================================
-- ADD: New Industries
-- =====================================================
INSERT INTO industries (code, name, description, tagline, icon, color) VALUES
('real_estate', 'Real Estate', 'Property & Asset Management', 'Complete Real Estate & Property Management Solution', 'building-2', 'from-emerald-500/10 to-teal-500/10'),
('construction', 'Construction', 'Project & Site Management', 'Construction Project & Site Management Solution', 'hard-hat', 'from-amber-500/10 to-yellow-500/10'),
('saas', 'SaaS', 'Subscription & Customer Success', 'SaaS Business Management Solution', 'cloud', 'from-sky-500/10 to-blue-500/10'),
('ecommerce_retail', 'E-commerce', 'Online Store & Fulfillment', 'E-commerce Platform Management Solution', 'shopping-cart', 'from-purple-500/10 to-pink-500/10')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- ADD: Industry-Specific Modules
-- =====================================================
INSERT INTO modules (code, name, description, category, is_core) VALUES
-- Real Estate
('property_management', 'Property Management', 'Property listings & portfolio management', 'Real Estate', false),
('lease_management', 'Lease Management', 'Lease contracts & tenant management', 'Real Estate', false),
('facility_management', 'Facility Management', 'Building maintenance & services', 'Real Estate', false),
('listing_portal', 'Listing Portal', 'Property listings & agent portal', 'Real Estate', false),

-- Construction (many already exist, adding specific ones)
('safety_compliance', 'Safety & Compliance', 'Job site safety & OSHA compliance', 'Construction', false),
('equipment_mgmt', 'Equipment Management', 'Construction equipment tracking', 'Construction', false),
('subcontractor_mgmt', 'Subcontractor Management', 'Subcontractor coordination & billing', 'Construction', false),

-- SaaS
('subscription_mgmt', 'Subscription Management', 'Subscription lifecycle & renewals', 'SaaS', false),
('customer_success', 'Customer Success', 'CS team workflows & health scores', 'SaaS', false),
('usage_tracking', 'Usage Tracking', 'Product usage analytics & metering', 'SaaS', false),
('mrr_analytics', 'MRR Analytics', 'MRR, ARR, churn analytics', 'SaaS', false),
('onboarding_automation', 'Onboarding Automation', 'Customer onboarding workflows', 'SaaS', false),

-- E-commerce (many exist, adding specific ones)
('order_fulfillment', 'Order Fulfillment', 'Order processing & shipping', 'E-commerce', false),
('product_catalog', 'Product Catalog', 'Product information management', 'E-commerce', false),
('marketplace', 'Marketplace', 'Multi-vendor marketplace management', 'E-commerce', false),
('returns_mgmt', 'Returns Management', 'Returns & refunds processing', 'E-commerce', false)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- SEED: Industry-Module Mappings - REAL ESTATE
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
        ('property_management', true, true, 100),
        ('lease_management', true, true, 90),
        ('crm', true, true, 85),
        ('finance', true, false, 80),
        ('facility_management', true, false, 75),
        ('listing_portal', true, false, 70),
        ('maintenance', true, false, 65),
        ('analytics', true, false, 60),
        ('core_hr', true, false, 55),
        ('billing', false, false, 50)
) AS mapping(module_code, is_recommended, is_required, priority)
JOIN modules m ON m.code = mapping.module_code
WHERE i.code = 'real_estate'
ON CONFLICT (industry_id, module_id) DO NOTHING;

-- =====================================================
-- SEED: Industry-Module Mappings - CONSTRUCTION
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
        ('construction', true, true, 100),
        ('projects', true, true, 95),
        ('procurement', true, true, 90),
        ('safety_compliance', true, false, 85),
        ('subcontractor_mgmt', true, false, 80),
        ('equipment_mgmt', true, false, 75),
        ('finance', true, false, 70),
        ('inventory', true, false, 65),
        ('core_hr', true, false, 60),
        ('wms', false, false, 55)
) AS mapping(module_code, is_recommended, is_required, priority)
JOIN modules m ON m.code = mapping.module_code
WHERE i.code = 'construction'
ON CONFLICT (industry_id, module_id) DO NOTHING;

-- =====================================================
-- SEED: Industry-Module Mappings - SAAS
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
        ('subscription_mgmt', true, true, 100),
        ('billing', true, true, 95),
        ('crm', true, true, 90),
        ('customer_success', true, false, 85),
        ('usage_tracking', true, false, 80),
        ('mrr_analytics', true, false, 75),
        ('onboarding_automation', true, false, 70),
        ('finance', true, false, 65),
        ('analytics', true, false, 60),
        ('core_hr', false, false, 55),
        ('sales', false, false, 50)
) AS mapping(module_code, is_recommended, is_required, priority)
JOIN modules m ON m.code = mapping.module_code
WHERE i.code = 'saas'
ON CONFLICT (industry_id, module_id) DO NOTHING;

-- =====================================================
-- SEED: Industry-Module Mappings - E-COMMERCE
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
        ('ecommerce', true, true, 100),
        ('inventory', true, true, 95),
        ('order_fulfillment', true, true, 90),
        ('product_catalog', true, false, 85),
        ('crm', true, false, 80),
        ('marketplace', true, false, 75),
        ('returns_mgmt', true, false, 70),
        ('analytics', true, false, 65),
        ('scm', true, false, 60),
        ('finance', false, false, 55),
        ('pos', false, false, 50)
) AS mapping(module_code, is_recommended, is_required, priority)
JOIN modules m ON m.code = mapping.module_code
WHERE i.code = 'ecommerce_retail'
ON CONFLICT (industry_id, module_id) DO NOTHING;

COMMENT ON TABLE industries IS 'Expanded to 15 industries including Real Estate, Construction, SaaS, and E-commerce';
