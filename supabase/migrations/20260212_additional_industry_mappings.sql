-- Module Mappings for 3 Additional Industries
-- Manufacturing, Financial Services, Technology

-- =====================================================
-- SEED: Industry-Module Mappings - MANUFACTURING
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
        ('manufacturing', true, true, 100),
        ('quality', true, true, 95),
        ('inventory', true, true, 90),
        ('scm', true, false, 85),
        ('procurement', true, false, 80),
        ('wms', true, false, 75),
        ('maintenance', true, false, 70),
        ('projects', true, false, 65),
        ('analytics', true, false, 60),
        ('finance', false, false, 55),
        ('core_hr', false, false, 50)
) AS mapping(module_code, is_recommended, is_required, priority)
JOIN modules m ON m.code = mapping.module_code
WHERE i.code = 'manufacturing'
ON CONFLICT (industry_id, module_id) DO NOTHING;

-- =====================================================
-- SEED: Industry-Module Mappings - FINANCIAL SERVICES
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
        ('finance', true, true, 100),
        ('crm', true, true, 95),
        ('compliance', true, true, 90),
        ('analytics', true, false, 85),
        ('treasury', true, false, 80),
        ('risk_management', true, false, 75),
        ('revenue', true, false, 70),
        ('tax', true, false, 65),
        ('core_hr', true, false, 60),
        ('sales', false, false, 55)
) AS mapping(module_code, is_recommended, is_required, priority)
JOIN modules m ON m.code = mapping.module_code
WHERE i.code = 'financial_services'
ON CONFLICT (industry_id, module_id) DO NOTHING;

-- =====================================================
-- SEED: Industry-Module Mappings - TECHNOLOGY
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
        ('projects', true, true, 100),
        ('core_hr', true, true, 95),
       ('crm', true, true, 90),
        ('analytics', true, false, 85),
        ('finance', true, false, 80),
        ('sales', true, false, 75),
        ('compliance', true, false, 70),
        ('learning', true, false, 65),
        ('recruitment', true, false, 60),
        ('performance', false, false, 55)
) AS mapping(module_code, is_recommended, is_required, priority)
JOIN modules m ON m.code = mapping.module_code
WHERE i.code = 'technology'
ON CONFLICT (industry_id, module_id) DO NOTHING;

COMMENT ON TABLE industry_module_mappings IS 'Complete module recommendations for all 18 industries with tailored selections per vertical';
