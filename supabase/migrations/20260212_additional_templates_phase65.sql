-- Phase 6.5: Additional Configuration Templates (Priority 2 & 3)
-- HR Departments, Manufacturing, Real Estate, Construction

-- =====================================================
-- TEMPLATE 5: HR Department Structure
-- =====================================================
INSERT INTO configuration_templates (
    industry_id,
    module_id,
    name,
    description,
    template_category,
    template_data,
    is_default,
    sort_order,
    dependencies,
    version
)
SELECT 
    NULL AS industry_id, -- Generic, applies to all industries
    m.id AS module_id,
    'Standard Department Structure',
    'Common organizational department hierarchy for HR management',
    'hr',
    '{
        "departments": [
            {"name": "Executive Leadership", "code": "EXEC", "description": "C-suite and executive management", "costCenter": "CC-100"},
            {"name": "Finance & Accounting", "code": "FIN", "description": "Financial operations and accounting", "costCenter": "CC-200"},
            {"name": "Human Resources", "code": "HR", "description": "People operations and talent management", "costCenter": "CC-300"},
            {"name": "Information Technology", "code": "IT", "description": "Technology infrastructure and support", "costCenter": "CC-400"},
            {"name": "Operations", "code": "OPS", "description": "Day-to-day business operations", "costCenter": "CC-500"},
            {"name": "Sales", "code": "SALES", "description": "Revenue generation and client acquisition", "costCenter": "CC-600"},
            {"name": "Marketing", "code": "MKTG", "description": "Brand, demand generation, and communications", "costCenter": "CC-700"},
            {"name": "Customer Success", "code": "CS", "description": "Client onboarding and support", "costCenter": "CC-800"},
            {"name": "Product & Engineering", "code": "PROD", "description": "Product development and engineering", "costCenter": "CC-900"},
            {"name": "Legal & Compliance", "code": "LEGAL", "description": "Legal affairs and regulatory compliance", "costCenter": "CC-1000"},
            {"name": "Research & Development", "code": "RD", "description": "Innovation and product research", "parentCode": "PROD", "costCenter": "CC-910"},
            {"name": "Quality Assurance", "code": "QA", "description": "Quality control and testing", "parentCode": "PROD", "costCenter": "CC-920"}
        ]
    }'::jsonb,
    true,
    10,
    '["hr"]'::jsonb,
    '1.0'
FROM modules m
WHERE m.code = 'hr';

-- =====================================================
-- TEMPLATE 6: Manufacturing Work Centers
-- =====================================================
INSERT INTO configuration_templates (
    industry_id,
    module_id,
    name,
    description,
    template_category,
    template_data,
    is_default,
    sort_order,
    dependencies,
    version
)
SELECT 
    i.id AS industry_id,
    m.id AS module_id,
    'Manufacturing Work Centers - Standard',
    'Standard work center configurations for manufacturing operations',
    'other',
    '{
        "workCenters": [
            {"code": "WC-100", "name": "Receiving Dock", "type": "receiving", "capacity": 1000, "unit": "pallets/day", "costRate": 15.00},
            {"code": "WC-200", "name": "Raw Material Storage", "type": "storage", "capacity": 5000, "unit": "sq_ft", "costRate": 5.00},
            {"code": "WC-300", "name": "Cutting & Machining", "type": "production", "capacity": 500, "unit": "parts/hour", "costRate": 85.00},
            {"code": "WC-310", "name": "CNC Machining", "type": "production", "capacity": 200, "unit": "parts/hour", "costRate": 125.00},
            {"code": "WC-320", "name": "Laser Cutting", "type": "production", "capacity": 150, "unit": "parts/hour", "costRate": 95.00},
            {"code": "WC-400", "name": "Assembly Line A", "type": "assembly", "capacity": 300, "unit": "units/hour", "costRate": 75.00},
            {"code": "WC-410", "name": "Assembly Line B", "type": "assembly", "capacity": 300, "unit": "units/hour", "costRate": 75.00},
            {"code": "WC-500", "name": "Quality Control", "type": "inspection", "capacity": 400, "unit": "units/hour", "costRate": 55.00},
            {"code": "WC-600", "name": "Packaging", "type": "packaging", "capacity": 500, "unit": "units/hour", "costRate": 45.00},
            {"code": "WC-700", "name": "Finished Goods Storage", "type": "storage", "capacity": 10000, "unit": "sq_ft", "costRate": 8.00},
            {"code": "WC-800", "name": "Shipping Dock", "type": "shipping", "capacity": 800, "unit": "pallets/day", "costRate": 18.00},
            {"code": "WC-900", "name": "Maintenance Workshop", "type": "maintenance", "capacity": 40, "unit": "hours/day", "costRate": 65.00}
        ]
    }'::jsonb,
    true,
    10,
    '["manufacturing"]'::jsonb,
    '1.0'
FROM industries i
CROSS JOIN modules m
WHERE i.code = 'manufacturing' AND m.code = 'manufacturing';

-- =====================================================
-- TEMPLATE 7: Real Estate Property Types
-- =====================================================
INSERT INTO configuration_templates (
    industry_id,
    module_id,
    name,
    description,
    template_category,
    template_data,
    is_default,
    sort_order,
    dependencies,
    version
)
SELECT 
    i.id AS industry_id,
    m.id AS module_id,
    'Real Estate Property Types - Standard',
    'Standard property type classifications for real estate management',
    'real_estate',
    '{
        "propertyTypes": [
            {"name": "Single Family Home", "code": "SFH", "category": "residential", "description": "Detached single-family residence", "defaultLeaseTermMonths": 12},
            {"name": "Multi-Family (2-4 units)", "code": "MF-SMALL", "category": "residential", "description": "2-4 unit residential building", "defaultLeaseTermMonths": 12},
            {"name": "Apartment Complex", "code": "APT", "category": "residential", "description": "5+ unit residential complex", "defaultLeaseTermMonths": 12},
            {"name": "Condominium", "code": "CONDO", "category": "residential", "description": "Individually owned unit in multi-unit building", "defaultLeaseTermMonths": 12},
            {"name": "Townhouse", "code": "TOWN", "category": "residential", "description": "Multi-floor attached residence", "defaultLeaseTermMonths": 12},
            {"name": "Office Building", "code": "OFFICE", "category": "commercial", "description": "Commercial office space", "defaultLeaseTermMonths": 36},
            {"name": "Retail Space", "code": "RETAIL", "category": "commercial", "description": "Store or shopping center space", "defaultLeaseTermMonths": 60},
            {"name": "Restaurant", "code": "RESTAURANT", "category": "commercial", "description": "Food service establishment", "defaultLeaseTermMonths": 60},
            {"name": "Warehouse", "code": "WAREHOUSE", "category": "industrial", "description": "Storage and distribution facility", "defaultLeaseTermMonths": 36},
            {"name": "Manufacturing Facility", "code": "MFG", "category": "industrial", "description": "Industrial production facility", "defaultLeaseTermMonths": 60},
            {"name": "Mixed-Use Development", "code": "MIXED", "category": "mixed", "description": "Combination of residential, commercial, and/or industrial", "defaultLeaseTermMonths": 24},
            {"name": "Land (Vacant)", "code": "LAND", "category": "mixed", "description": "Undeveloped land parcel"},
            {"name": "Senior Living", "code": "SENIOR", "category": "residential", "description": "Age-restricted senior housing", "defaultLeaseTermMonths": 12},
            {"name": "Student Housing", "code": "STUDENT", "category": "residential", "description": "College/university student housing", "defaultLeaseTermMonths": 9}
        ]
    }'::jsonb,
    true,
    10,
    '["real_estate"]'::jsonb,
    '1.0'
FROM industries i
CROSS JOIN modules m
WHERE i.code = 'real_estate' AND m.code = 'real_estate';

-- =====================================================
-- TEMPLATE 8: Construction Cost Codes
-- =====================================================
INSERT INTO configuration_templates (
    industry_id,
    module_id,
    name,
    description,
    template_category,
    template_data,
    is_default,
    sort_order,
    dependencies,
    version
)
SELECT 
    i.id AS industry_id,
    m.id AS module_id,
    'Construction Cost Codes - CSI MasterFormat',
    'Industry-standard cost code structure based on CSI MasterFormat divisions',
    'construction',
    '{
        "costCodes": [
            {"code": "01", "name": "General Requirements", "category": "General", "subcategory": "Project Management", "unit": "LS"},
            {"code": "01-1", "name": "Summary", "category": "General", "subcategory": "Documentation", "unit": "LS"},
            {"code": "01-2", "name": "Price and Payment Procedures", "category": "General", "subcategory": "Administration", "unit": "LS"},
            {"code": "01-3", "name": "Administrative Requirements", "category": "General", "subcategory": "Administration", "unit": "LS"},
            {"code": "02", "name": "Existing Conditions", "category": "Sitework", "unit": "LS"},
            {"code": "02-4", "name": "Demolition", "category": "Sitework", "subcategory": "Demolition", "unit": "SF", "estimatedCost": 5.50},
            {"code": "03", "name": "Concrete", "category": "Structure", "unit": "CY"},
            {"code": "03-1", "name": "Concrete Forming", "category": "Structure", "subcategory": "Formwork", "unit": "SF", "estimatedCost": 12.00},
            {"code": "03-2", "name": "Concrete Reinforcing", "category": "Structure", "subcategory": "Rebar", "unit": "TON", "estimatedCost": 850.00},
            {"code": "03-3", "name": "Cast-in-Place Concrete", "category": "Structure", "subcategory": "Concrete", "unit": "CY", "estimatedCost": 165.00},
            {"code": "04", "name": "Masonry", "category": "Structure", "unit": "SF"},
            {"code": "04-2", "name": "Unit Masonry", "category": "Structure", "subcategory": "CMU", "unit": "SF", "estimatedCost": 18.50},
            {"code": "05", "name": "Metals", "category": "Structure", "unit": "TON"},
            {"code": "05-1", "name": "Structural Steel", "category": "Structure", "subcategory": "Steel", "unit": "TON", "estimatedCost": 3500.00},
            {"code": "06", "name": "Wood, Plastics, Composites", "category": "Structure", "unit": "BF"},
            {"code": "06-1", "name": "Rough Carpentry", "category": "Structure", "subcategory": "Framing", "unit": "BF", "estimatedCost": 2.85},
            {"code": "07", "name": "Thermal and Moisture Protection", "category": "Envelope", "unit": "SF"},
            {"code": "07-2", "name": "Insulation", "category": "Envelope", "subcategory": "Insulation", "unit": "SF", "estimatedCost": 1.75},
            {"code": "07-5", "name": "Roofing", "category": "Envelope", "subcategory": "Roofing", "unit": "SQ", "estimatedCost": 425.00},
            {"code": "08", "name": "Openings", "category": "Envelope", "unit": "EA"},
            {"code": "08-1", "name": "Doors and Frames", "category": "Envelope", "subcategory": "Doors", "unit": "EA", "estimatedCost": 850.00},
            {"code": "08-5", "name": "Windows", "category": "Envelope", "subcategory": "Windows", "unit": "EA", "estimatedCost": 650.00},
            {"code": "09", "name": "Finishes", "category": "Interior", "unit": "SF"},
            {"code": "09-2", "name": "Plaster and Gypsum Board", "category": "Interior", "subcategory": "Drywall", "unit": "SF", "estimatedCost": 3.25},
            {"code": "09-3", "name": "Tiling", "category": "Interior", "subcategory": "Tile", "unit": "SF", "estimatedCost": 8.50},
            {"code": "09-6", "name": "Flooring", "category": "Interior", "subcategory": "Flooring", "unit": "SF", "estimatedCost": 6.75},
            {"code": "09-9", "name": "Painting and Coating", "category": "Interior", "subcategory": "Paint", "unit": "SF", "estimatedCost": 2.15},
            {"code": "21", "name": "Fire Suppression", "category": "MEP", "subcategory": "Fire Protection", "unit": "SF", "estimatedCost": 4.50},
            {"code": "22", "name": "Plumbing", "category": "MEP", "subcategory": "Plumbing", "unit": "SF", "estimatedCost": 12.50},
            {"code": "23", "name": "HVAC", "category": "MEP", "subcategory": "HVAC", "unit": "SF", "estimatedCost": 18.75},
            {"code": "26", "name": "Electrical", "category": "MEP", "subcategory": "Electrical", "unit": "SF", "estimatedCost": 14.25},
            {"code": "27", "name": "Communications", "category": "MEP", "subcategory": "Low Voltage", "unit": "SF", "estimatedCost": 3.50},
            {"code": "31", "name": "Earthwork", "category": "Sitework", "subcategory": "Excavation", "unit": "CY", "estimatedCost": 15.00},
            {"code": "32", "name": "Exterior Improvements", "category": "Sitework", "subcategory": "Paving", "unit": "SF"},
            {"code": "32-1", "name": "Paving", "category": "Sitework", "subcategory": "Asphalt", "unit": "SF", "estimatedCost": 4.25},
            {"code": "33", "name": "Utilities", "category": "Sitework", "subcategory": "Underground", "unit": "LF", "estimatedCost": 125.00}
        ]
    }'::jsonb,
    true,
    10,
    '["construction"]'::jsonb,
    '1.0'
FROM industries i
CROSS JOIN modules m
WHERE i.code = 'construction' AND m.code = 'construction';

-- Add comments
COMMENT ON TABLE configuration_templates IS 'Industry and module-specific configuration templates - now includes 8 templates covering Banking, Healthcare, Retail, SaaS, HR, Manufacturing, Real Estate, and Construction';
