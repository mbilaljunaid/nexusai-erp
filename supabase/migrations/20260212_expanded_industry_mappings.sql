-- Expanded Industry-Module Mappings for All 11 Industries
-- Phase 5: Comprehensive mapping coverage

-- =====================================================
-- SEED: Industry-Module Mappings - LOGISTICS
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
        ('transportation', true, true, 100),
        ('wms', true, true, 90),
        ('inventory', true, true, 85),
        ('scm', true, false, 80),
        ('tracking', true, false, 70),
        ('procurement', true, false, 60),
        ('analytics', true, false, 50),
        ('finance', true, false, 40),
        ('core_hr', false, false, 30)
) AS mapping(module_code, is_recommended, is_required, priority)
JOIN modules m ON m.code = mapping.module_code
WHERE i.code = 'logistics'
ON CONFLICT (industry_id, module_id) DO NOTHING;

-- =====================================================
-- SEED: Industry-Module Mappings - AUTOMOTIVE
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
        ('quality', true, true, 90),
        ('inventory', true, true, 85),
        ('scm', true, false, 80),
        ('sales', true, false, 75),
        ('crm', true, false, 70),
        ('maintenance', true, false, 60),
        ('wms', true, false, 50),
        ('finance', true, false, 40),
        ('core_hr', false, false, 30)
) AS mapping(module_code, is_recommended, is_required, priority)
JOIN modules m ON m.code = mapping.module_code
WHERE i.code = 'automotive'
ON CONFLICT (industry_id, module_id) DO NOTHING;

-- =====================================================
-- SEED: Industry-Module Mappings - BANKING
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
        ('compliance', true, true, 95),
        ('crm', true, true, 90),
        ('ar', true, false, 85),
        ('treasury', true, false, 80),
        ('revenue', true, false, 75),
        ('analytics', true, false, 70),
        ('tax', true, false, 60),
        ('core_hr', true, false, 50),
        ('payroll', false, false, 40)
) AS mapping(module_code, is_recommended, is_required, priority)
JOIN modules m ON m.code = mapping.module_code
WHERE i.code = 'banking'
ON CONFLICT (industry_id, module_id) DO NOTHING;

-- =====================================================
-- SEED: Industry-Module Mappings - INSURANCE
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
        ('crm', true, true, 100),
        ('compliance', true, true, 95),
        ('finance', true, true, 90),
        ('analytics', true, false, 85),
        ('billing', true, false, 80),
        ('revenue', true, false, 75),
        ('sales', true, false, 70),
        ('core_hr', true, false, 60),
        ('tax', false, false, 50)
) AS mapping(module_code, is_recommended, is_required, priority)
JOIN modules m ON m.code = mapping.module_code
WHERE i.code = 'insurance'
ON CONFLICT (industry_id, module_id) DO NOTHING;

-- =====================================================
-- SEED: Industry-Module Mappings - GOVERNMENT
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
        ('compliance', true, true, 95),
        ('finance', true, true, 90),
        ('procurement', true, false, 85),
        ('projects', true, false, 80),
        ('payroll', true, false, 75),
        ('analytics', true, false, 70),
        ('tax', true, false, 60),
        ('fixed_assets', true, false, 50),
        ('ap', false, false, 40)
) AS mapping(module_code, is_recommended, is_required, priority)
JOIN modules m ON m.code = mapping.module_code
WHERE i.code = 'government'
ON CONFLICT (industry_id, module_id) DO NOTHING;

-- =====================================================
-- SEED: Industry-Module Mappings - EDUCATION
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
        ('learning', true, true, 90),
        ('scheduling', true, true, 85),
        ('finance', true, false, 80),
        ('crm', true, false, 75),
        ('billing', true, false, 70),
        ('payroll', true, false, 65),
        ('analytics', true, false, 60),
        ('compliance', true, false, 50),
        ('procurement', false, false, 40)
) AS mapping(module_code, is_recommended, is_required, priority)
JOIN modules m ON m.code = mapping.module_code
WHERE i.code = 'education'
ON CONFLICT (industry_id, module_id) DO NOTHING;

-- =====================================================
-- SEED: Industry-Module Mappings - ENERGY
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
        ('maintenance', true, true, 100),
        ('compliance', true, true, 95),
        ('finance', true, true, 90),
        ('procurement', true, false, 85),
        ('inventory', true, false, 80),
        ('projects', true, false, 75),
        ('analytics', true, false, 70),
        ('core_hr', true, false, 65),
        ('scm', true, false, 60),
        ('fixed_assets', false, false, 50)
) AS mapping(module_code, is_recommended, is_required, priority)
JOIN modules m ON m.code = mapping.module_code
WHERE i.code = 'energy'
ON CONFLICT (industry_id, module_id) DO NOTHING;

COMMENT ON TABLE industry_module_mappings IS 'Complete module recommendations for all 11 industries with required vs optional tags';
