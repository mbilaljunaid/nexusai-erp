-- Phase 6: Configuration Templates - Seed Data (Priority 1)
-- Banking COA, Healthcare Appointment Types, Retail Categories, SaaS Plans

-- =====================================================
-- TEMPLATE 1: Banking Chart of Accounts
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
    'Banking Chart of Accounts - Standard',
    'Standard chart of accounts for banking institutions with core banking accounts',
    'finance',
    '{
        "accounts": [
            {"code": "1000", "name": "Assets", "type": "Asset", "category": "Header"},
            {"code": "1100", "name": "Cash and Cash Equivalents", "type": "Asset", "category": "Current Assets", "parentCode": "1000"},
            {"code": "1110", "name": "Cash on Hand", "type": "Asset", "category": "Current Assets", "parentCode": "1100"},
            {"code": "1120", "name": "Cash in Bank - Operating", "type": "Asset", "category": "Current Assets", "parentCode": "1100"},
            {"code": "1130", "name": "Cash in Bank - Reserve", "type": "Asset", "category": "Current Assets", "parentCode": "1100"},
            {"code": "1200", "name": "Loans Receivable", "type": "Asset", "category": "Current Assets", "parentCode": "1000"},
            {"code": "1210", "name": "Personal Loans", "type": "Asset", "category": "Current Assets", "parentCode": "1200"},
            {"code": "1220", "name": "Business Loans", "type": "Asset", "category": "Current Assets", "parentCode": "1200"},
            {"code": "1230", "name": "Mortgage Loans", "type": "Asset", "category": "Current Assets", "parentCode": "1200"},
            {"code": "1300", "name": "Investments", "type": "Asset", "category": "Current Assets", "parentCode": "1000"},
            {"code": "1310", "name": "Government Securities", "type": "Asset", "category": "Current Assets", "parentCode": "1300"},
            {"code": "1320", "name": "Corporate Bonds", "type": "Asset", "category": "Current Assets", "parentCode": "1300"},
            
            {"code": "2000", "name": "Liabilities", "type": "Liability", "category": "Header"},
            {"code": "2100", "name": "Customer Deposits", "type": "Liability", "category": "Current Liabilities", "parentCode": "2000"},
            {"code": "2110", "name": "Savings Deposits", "type": "Liability", "category": "Current Liabilities", "parentCode": "2100"},
            {"code": "2120", "name": "Fixed Deposits", "type": "Liability", "category": "Current Liabilities", "parentCode": "2100"},
            {"code": "2130", "name": "Current Accounts", "type": "Liability", "category": "Current Liabilities", "parentCode": "2100"},
            {"code": "2200", "name": "Borrowings", "type": "Liability", "category": "Current Liabilities", "parentCode": "2000"},
            {"code": "2210", "name": "Interbank Borrowing", "type": "Liability", "category": "Current Liabilities", "parentCode": "2200"},
            
            {"code": "3000", "name": "Equity", "type": "Equity", "category": "Header"},
            {"code": "3100", "name": "Share Capital", "type": "Equity", "category": "Equity", "parentCode": "3000"},
            {"code": "3200", "name": "Retained Earnings", "type": "Equity", "category": "Equity", "parentCode": "3000"},
            
            {"code": "4000", "name": "Revenue", "type": "Revenue", "category": "Header"},
            {"code": "4100", "name": "Interest Income", "type": "Revenue", "category": "Operating Revenue", "parentCode": "4000"},
            {"code": "4110", "name": "Interest on Loans", "type": "Revenue", "category": "Operating Revenue", "parentCode": "4100"},
            {"code": "4120", "name": "Interest on Investments", "type": "Revenue", "category": "Operating Revenue", "parentCode": "4100"},
            {"code": "4200", "name": "Fee Income", "type": "Revenue", "category": "Operating Revenue", "parentCode": "4000"},
            {"code": "4210", "name": "Service Charges", "type": "Revenue", "category": "Operating Revenue", "parentCode": "4200"},
            {"code": "4220", "name": "Processing Fees", "type": "Revenue", "category": "Operating Revenue", "parentCode": "4200"},
            
            {"code": "5000", "name": "Expenses", "type": "Expense", "category": "Header"},
            {"code": "5100", "name": "Interest Expense", "type": "Expense", "category": "Operating Expenses", "parentCode": "5000"},
            {"code": "5110", "name": "Interest on Deposits", "type": "Expense", "category": "Operating Expenses", "parentCode": "5100"},
            {"code": "5120", "name": "Interest on Borrowings", "type": "Expense", "category": "Operating Expenses", "parentCode": "5100"},
            {"code": "5200", "name": "Operating Expenses", "type": "Expense", "category": "Operating Expenses", "parentCode": "5000"},
            {"code": "5210", "name": "Salaries and Wages", "type": "Expense", "category": "Operating Expenses", "parentCode": "5200"},
            {"code": "5220", "name": "Rent and Utilities", "type": "Expense", "category": "Operating Expenses", "parentCode": "5200"},
            {"code": "5230", "name": "Technology and Systems", "type": "Expense", "category": "Operating Expenses", "parentCode": "5200"}
        ]
    }'::jsonb,
    true,
    10,
    '["finance"]'::jsonb,
    '1.0'
FROM industries i
CROSS JOIN modules m
WHERE i.code = 'banking' AND m.code = 'finance';

-- =====================================================
-- TEMPLATE 2: Healthcare Appointment Types
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
    'Healthcare Appointment Types - Standard',
    'Standard appointment types for healthcare facilities',
    'scheduling',
    '{
        "appointmentTypes": [
            {"name": "New Patient Consultation", "duration": 60, "color": "#4CAF50", "description": "Initial consultation for new patients", "requiresPreparation": false, "allowsWalkIn": false},
            {"name": "Follow-up Visit", "duration": 30, "color": "#2196F3", "description": "Routine follow-up appointment", "requiresPreparation": false, "allowsWalkIn": true},
            {"name": "Annual Physical Examination", "duration": 45, "color": "#9C27B0", "description": "Comprehensive annual health checkup", "requiresPreparation": true, "allowsWalkIn": false},
            {"name": "Urgent Care Visit", "duration": 30, "color": "#FF5722", "description": "Urgent medical attention needed", "requiresPreparation": false, "allowsWalkIn": true},
            {"name": "Telehealth Consultation", "duration": 20, "color": "#00BCD4", "description": "Virtual appointment via video call", "requiresPreparation": false, "allowsWalkIn": false},
            {"name": "Lab Work / Blood Draw", "duration": 15, "color": "#FFC107", "description": "Laboratory tests and procedures", "requiresPreparation": true, "allowsWalkIn": true},
            {"name": "Vaccination / Immunization", "duration": 15, "color": "#8BC34A", "description": "Vaccine administration", "requiresPreparation": false, "allowsWalkIn": true},
            {"name": "Specialist Consultation", "duration": 45, "color": "#E91E63", "description": "Consultation with medical specialist", "requiresPreparation": false, "allowsWalkIn": false},
            {"name": "Procedure / Minor Surgery", "duration": 90, "color": "#673AB7", "description": "Minor surgical procedures", "requiresPreparation": true, "allowsWalkIn": false},
            {"name": "Diagnostic Imaging", "duration": 30, "color": "#FF9800", "description": "X-ray, ultrasound, or other imaging", "requiresPreparation": true, "allowsWalkIn": false},
            {"name": "Physical Therapy Session", "duration": 45, "color": "#009688", "description": "Physical rehabilitation session", "requiresPreparation": false, "allowsWalkIn": false},
            {"name": "Wellness Checkup", "duration": 30, "color": "#CDDC39", "description": "Preventive care and wellness visit", "requiresPreparation": false, "allowsWalkIn": true}
        ]
    }'::jsonb,
    true,
    10,
    '["scheduling"]'::jsonb,
    '1.0'
FROM industries i
CROSS JOIN modules m
WHERE i.code = 'healthcare' AND m.code = 'scheduling';

-- =====================================================
-- TEMPLATE 3: Retail Product Categories
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
    'Retail Product Categories - Standard',
    'Standard product categorization for retail operations',
    'inventory',
    '{
        "productCategories": [
            {"name": "Electronics", "code": "ELEC", "description": "Electronic devices and accessories", "isActive": true},
            {"name": "Computers", "code": "ELEC-COMP", "parentCode": "ELEC", "attributes": ["brand", "processor", "ram", "storage"], "isActive": true},
            {"name": "Mobile Phones", "code": "ELEC-MOBL", "parentCode": "ELEC", "attributes": ["brand", "model", "storage", "color"], "isActive": true},
            {"name": "Audio Equipment", "code": "ELEC-AUDI", "parentCode": "ELEC", "attributes": ["brand", "type", "connectivity"], "isActive": true},
            
            {"name": "Clothing & Apparel", "code": "CLTH", "description": "Clothing and fashion items", "isActive": true},
            {"name": "Men''s Clothing", "code": "CLTH-MEN", "parentCode": "CLTH", "attributes": ["size", "color", "material"], "isActive": true},
            {"name": "Women''s Clothing", "code": "CLTH-WMN", "parentCode": "CLTH", "attributes": ["size", "color", "material"], "isActive": true},
            {"name": "Children''s Clothing", "code": "CLTH-KID", "parentCode": "CLTH", "attributes": ["age", "size", "color"], "isActive": true},
            
            {"name": "Home & Garden", "code": "HOME", "description": "Home improvement and garden supplies", "isActive": true},
            {"name": "Furniture", "code": "HOME-FURN", "parentCode": "HOME", "attributes": ["material", "style", "dimensions"], "isActive": true},
            {"name": "Kitchenware", "code": "HOME-KTCH", "parentCode": "HOME", "attributes": ["material", "capacity"], "isActive": true},
            {"name": "Garden Tools", "code": "HOME-GRDN", "parentCode": "HOME", "attributes": ["type", "power"], "isActive": true},
            
            {"name": "Sports & Outdoors", "code": "SPRT", "description": "Sports equipment and outdoor gear", "isActive": true},
            {"name": "Fitness Equipment", "code": "SPRT-FITN", "parentCode": "SPRT", "attributes": ["type", "weight"], "isActive": true},
            {"name": "Outdoor Gear", "code": "SPRT-OUTD", "parentCode": "SPRT", "attributes": ["season", "activity"], "isActive": true},
            
            {"name": "Books & Media", "code": "BOOK", "description": "Books, magazines, and media", "isActive": true},
            {"name": "Fiction Books", "code": "BOOK-FICT", "parentCode": "BOOK", "attributes": ["author", "genre"], "isActive": true},
            {"name": "Non-Fiction Books", "code": "BOOK-NFCT", "parentCode": "BOOK", "attributes": ["author", "subject"], "isActive": true},
            
            {"name": "Health & Beauty", "code": "HLTH", "description": "Health and beauty products", "isActive": true},
            {"name": "Skincare", "code": "HLTH-SKIN", "parentCode": "HLTH", "attributes": ["skin_type", "brand"], "isActive": true},
            {"name": "Cosmetics", "code": "HLTH-COSM", "parentCode": "HLTH", "attributes": ["shade", "brand"], "isActive": true}
        ]
    }'::jsonb,
    true,
    10,
    '["inventory"]'::jsonb,
    '1.0'
FROM industries i
CROSS JOIN modules m
WHERE i.code = 'retail' AND m.code = 'inventory';

-- =====================================================
-- TEMPLATE 4: SaaS Subscription Plans
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
    'SaaS Subscription Plans - Standard Tiers',
    'Standard subscription plan tiers for SaaS businesses',
    'subscriptions',
    '{
        "subscriptionPlans": [
            {
                "name": "Free",
                "price": 0,
                "billingCycle": "monthly",
                "features": ["Basic features", "1 user", "Community support", "5 projects"],
                "limits": {"users": 1, "storage": "1GB", "apiCalls": 1000, "projects": 5},
                "isPopular": false,
                "trialDays": 0
            },
            {
                "name": "Starter",
                "price": 29,
                "billingCycle": "monthly",
                "features": ["All basic features", "5 users", "Email support", "25 projects", "Basic analytics"],
                "limits": {"users": 5, "storage": "10GB", "apiCalls": 10000, "projects": 25},
                "isPopular": false,
                "trialDays": 14
            },
            {
                "name": "Professional",
                "price": 99,
                "billingCycle": "monthly",
                "features": ["All starter features", "25 users", "Priority support", "Unlimited projects", "Advanced analytics", "Custom integrations"],
                "limits": {"users": 25, "storage": "100GB", "apiCalls": 100000, "projects": -1},
                "isPopular": true,
                "trialDays": 14
            },
            {
                "name": "Enterprise",
                "price": 299,
                "billingCycle": "monthly",
                "features": ["All pro features", "Unlimited users", "Dedicated support", "SLA guarantee", "Custom development", "White labeling", "Advanced security"],
                "limits": {"users": -1, "storage": "1TB", "apiCalls": -1, "projects": -1},
                "isPopular": false,
                "trialDays": 30
            }
        ]
    }'::jsonb,
    true,
    10,
    '["subscription_mgmt"]'::jsonb,
    '1.0'
FROM industries i
CROSS JOIN modules m
WHERE i.code = 'saas' AND m.code = 'subscription_mgmt';

-- Add comments
COMMENT ON TABLE configuration_templates IS 'Industry and module-specific configuration templates with 4 initial templates (Banking COA, Healthcare appointments, Retail categories, SaaS plans)';
