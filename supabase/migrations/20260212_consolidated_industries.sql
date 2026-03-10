-- Comprehensive Industry List - Consolidating ALL Industry Sources
-- Merging industries from:
-- 1. Original seed data (11 industries)
-- 2. industryConfig.ts (12 industries)  
-- 3. Phase 5 additions (4 industries)
-- Result: 18 unique industries total

-- =====================================================
-- COMPLETE INDUSTRIES LIST
-- =====================================================
INSERT INTO industries (code, name, description, tagline, icon, color) VALUES
-- Original 11 from seed data
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
('energy', 'Energy & Utilities', 'Grid Ops & Trading', 'Energy & Utilities Management', 'flame', 'from-red-500/10 to-orange-500/10'),

-- Phase 5 additions (4 new)
('real_estate', 'Real Estate', 'Property & Asset Management', 'Complete Real Estate & Property Management Solution', 'building-2', 'from-emerald-500/10 to-teal-500/10'),
('construction', 'Construction', 'Project & Site Management', 'Construction Project & Site Management Solution', 'hard-hat', 'from-amber-500/10 to-yellow-500/10'),
('saas', 'SaaS', 'Subscription & Customer Success', 'SaaS Business Management Solution', 'cloud', 'from-sky-500/10 to-blue-500/10'),
('ecommerce', 'E-commerce', 'Online Store & Fulfillment', 'E-commerce Platform Management Solution', 'shopping-cart', 'from-purple-500/10 to-pink-500/10'),

-- From industryConfig.ts - Additional Industries (3 new)
('manufacturing', 'Manufacturing', 'Production & Supply Chain', 'Manufacturing Operations & Supply Chain Solution', 'factory', 'from-gray-500/10 to-slate-500/10'),
('financial_services', 'Financial Services', 'Investment & Wealth Management', 'Financial Services & Investment Management', 'trending-up', 'from-green-500/10 to-teal-500/10'),
('technology', 'Technology & Software', 'Software Development & IT', 'Technology & Software Development Solution', 'code', 'from-indigo-500/10 to-violet-500/10')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- Industry Consolidation Notes
-- ===================================================== 
-- Total: 18 Unique Industries
--
-- Duplicates Resolved:
-- - "retail" merged with potential "ecommerce_retail" 
-- - "banking" vs "financial_services" kept as separate (different focus)
-- - "construction" already in both lists (kept)
-- -"manufacturing" added from industryConfig.ts
-- - "technology" added as new industry
--
-- Coverage:
-- ✅ Healthcare & Life Sciences
-- ✅ Financial Services (Banking, Insurance, Finance)
-- ✅ Retail & E-commerce
-- ✅ Technology & Software
-- ✅ Manufacturing & Automotive
-- ✅ Transportation & Logistics  
-- ✅ Real Estate & Construction
-- ✅ Hospitality & Tourism
-- ✅ Energy & Utilities
-- ✅ Telecom & Communications
-- ✅ Government & Public Sector
-- ✅ Education & Training
-- ✅ SaaS & Cloud Services
-- =====================================================

COMMENT ON TABLE industries IS '18 comprehensive industry verticals covering all major business sectors';
