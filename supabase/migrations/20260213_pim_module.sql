-- =====================================================
-- Product Information Management (PIM) - Database Schema
-- Module: 2.1 - Advanced E-commerce Product Catalog
-- Phase: 2 of Niche Verticals Implementation
-- =====================================================

-- =====================================================
-- Table: pim_products
-- Purpose: Enhanced product master with PIM capabilities
-- =====================================================
CREATE TABLE pim_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    
    -- Basic info
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500), -- URL-friendly
    
    -- Classification
    category_id UUID,
    brand_id UUID,
    product_type VARCHAR(100), -- 'simple', 'configurable', 'bundle', 'grouped'
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN (
        'draft',
        'pending_review',
        'approved',
        'published',
        'archived'
    )),
    
    -- Multi-channel attributes (JSONB for flexibility)
    attributes JSONB DEFAULT '{}'::jsonb,
    -- Example: {
    --   "color": "Blue",
    --   "size": "Large",
    --   "material": "Cotton",
    --   "weight_kg": 0.5,
    --   "dimensions": {"length": 10, "width": 8, "height": 2}
    -- }
    
    -- Channel-specific content
    channel_content JSONB DEFAULT '{}'::jsonb,
    -- Example: {
    --   "web": {"description": "...", "short_desc": "...", "meta_title": "..."},
    --   "amazon": {"description": "...", "bullet_points": [...]},
    --   "ebay": {"description": "...", "item_specifics": {...}}
    -- }
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords VARCHAR(500),
    
    -- Media
    images JSONB DEFAULT '[]'::jsonb, -- [{url, alt, sort_order, is_primary}]
    videos JSONB DEFAULT '[]'::jsonb,
    documents JSONB DEFAULT '[]'::jsonb,
    
    -- Variants (for configurable products)
    has_variants BOOLEAN DEFAULT false,
    variant_attributes VARCHAR(100)[], -- ['color', 'size']
    
    -- Workflow
    created_by_user_id UUID,
    approved_by_user_id UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, sku)
);

CREATE INDEX idx_pim_products_tenant ON pim_products(tenant_id, status);
CREATE INDEX idx_pim_products_sku ON pim_products(sku);
CREATE INDEX idx_pim_products_category ON pim_products(category_id);
CREATE INDEX idx_pim_products_type ON pim_products(product_type);
CREATE INDEX idx_pim_products_attributes ON pim_products USING GIN (attributes);

-- =====================================================
-- Table: pim_product_variants
-- Purpose: Product variants (color/size combinations)
-- =====================================================
CREATE TABLE pim_product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    parent_product_id UUID NOT NULL REFERENCES pim_products(id) ON DELETE CASCADE,
    
    -- Variant identity
    sku VARCHAR(100) NOT NULL,
    variant_attributes JSONB NOT NULL,
    -- Example: {"color": "Blue", "size": "Large"}
    
    -- Pricing (can override parent)
    price DECIMAL(15,2),
    compare_at_price DECIMAL(15,2),
    cost DECIMAL(15,2),
    
    -- Inventory
    inventory_qty INT DEFAULT 0,
    low_stock_threshold INT,
    
    -- Media
    images JSONB DEFAULT '[]'::jsonb,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, sku)
);

CREATE INDEX idx_variants_parent ON pim_product_variants(parent_product_id);
CREATE INDEX idx_variants_sku ON pim_product_variants(sku);
CREATE INDEX idx_variants_attrs ON pim_product_variants USING GIN (variant_attributes);

-- =====================================================
-- Table: pim_attribute_definitions
-- Purpose: Define custom product attributes
-- =====================================================
CREATE TABLE pim_attribute_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    
    attribute_code VARCHAR(100) NOT NULL,
    attribute_label VARCHAR(255) NOT NULL,
    
    -- Data type
    data_type VARCHAR(50) CHECK (data_type IN (
        'text',
        'textarea',
        'number',
        'decimal',
        'boolean',
        'date',
        'select',
        'multiselect',
        'image',
        'file'
    )),
    
    -- For select/multiselect
    options JSONB DEFAULT '[]'::jsonb,
    -- Example: [{"value": "red", "label": "Red"}, {"value": "blue", "label": "Blue"}]
    
    -- Validation
    is_required BOOLEAN DEFAULT false,
    is_unique BOOLEAN DEFAULT false,
    validation_rules JSONB DEFAULT '{}'::jsonb,
    
    -- Grouping
    attribute_group VARCHAR(100), -- 'general', 'technical', 'marketing', etc.
    sort_order INT DEFAULT 0,
    
    -- Usage
    is_variant_attribute BOOLEAN DEFAULT false,
    is_searchable BOOLEAN DEFAULT false,
    is_filterable BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, attribute_code)
);

CREATE INDEX idx_attr_defs_tenant ON pim_attribute_definitions(tenant_id);
CREATE INDEX idx_attr_defs_group ON pim_attribute_definitions(attribute_group);

-- =====================================================
-- Table: pim_categories
-- Purpose: Product category hierarchy
-- =====================================================
CREATE TABLE pim_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    description TEXT,
    
    -- Hierarchy
    parent_id UUID REFERENCES pim_categories(id) ON DELETE CASCADE,
    path VARCHAR(1000), -- e.g., "/electronics/computers/laptops"
    level INT DEFAULT 0,
    
    -- Display
    image_url VARCHAR(500),
    icon VARCHAR(100),
    sort_order INT DEFAULT 0,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_categories_tenant ON pim_categories(tenant_id);
CREATE INDEX idx_categories_parent ON pim_categories(parent_id);
CREATE INDEX idx_categories_path ON pim_categories(path);

-- =====================================================
-- Table: pim_brands
-- Purpose: Product brands
-- =====================================================
CREATE TABLE pim_brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    description TEXT,
    
    logo_url VARCHAR(500),
    website_url VARCHAR(500),
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, name)
);

CREATE INDEX idx_brands_tenant ON pim_brands(tenant_id);

-- =====================================================
-- Table: pim_product_relationships
-- Purpose: Related products, bundles, upsells, cross-sells
-- =====================================================
CREATE TABLE pim_product_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    
    product_id UUID NOT NULL REFERENCES pim_products(id) ON DELETE CASCADE,
    related_product_id UUID NOT NULL REFERENCES pim_products(id) ON DELETE CASCADE,
    
    relationship_type VARCHAR(50) CHECK (relationship_type IN (
        'related',
        'upsell',
        'cross_sell',
        'bundle_item',
        'accessory',
        'alternative'
    )),
    
    sort_order INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_relationships_product ON pim_product_relationships(product_id, relationship_type);

-- =====================================================
-- Table: pim_bulk_operations
-- Purpose: Track bulk import/export/update operations
-- =====================================================
CREATE TABLE pim_bulk_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    
    operation_type VARCHAR(50) CHECK (operation_type IN (
        'import',
        'export',
        'bulk_update',
        'bulk_delete',
        'publish',
        'unpublish'
    )),
    
    -- Processing
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending',
        'processing',
        'completed',
        'failed',
        'cancelled'
    )),
    
    -- Stats
    total_items INT DEFAULT 0,
    processed_items INT DEFAULT 0,
    succeeded_items INT DEFAULT 0,
    failed_items INT DEFAULT 0,
    
    -- Files
    input_file_url VARCHAR(500),
    output_file_url VARCHAR(500),
    error_log_url VARCHAR(500),
    
    -- Error details
    errors JSONB DEFAULT '[]'::jsonb,
    
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bulk_ops_tenant ON pim_bulk_operations(tenant_id, created_at DESC);
CREATE INDEX idx_bulk_ops_status ON pim_bulk_operations(status);

-- =====================================================
-- Row Level Security
-- =====================================================

ALTER TABLE pim_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pim_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE pim_attribute_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pim_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pim_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE pim_product_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE pim_bulk_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_pim_products ON pim_products
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_variants ON pim_product_variants
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_attr_defs ON pim_attribute_definitions
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_categories ON pim_categories
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_brands ON pim_brands
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_relationships ON pim_product_relationships
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_bulk_ops ON pim_bulk_operations
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

-- =====================================================
-- Triggers
-- =====================================================

CREATE TRIGGER update_pim_products_updated_at BEFORE UPDATE ON pim_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_variants_updated_at BEFORE UPDATE ON pim_product_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON pim_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Functions
-- =====================================================

-- Generate SKU
CREATE OR REPLACE FUNCTION generate_sku(
    p_prefix VARCHAR(10),
    p_category_code VARCHAR(10)
) RETURNS VARCHAR(100) AS $$
DECLARE
    next_number INT;
    new_sku VARCHAR(100);
BEGIN
    -- Get next sequence number
    SELECT COALESCE(MAX(CAST(SUBSTRING(sku FROM '[0-9]+$') AS INT)), 0) + 1
    INTO next_number
    FROM pim_products
    WHERE sku LIKE p_prefix || '%';
    
    new_sku := p_prefix || '-' || p_category_code || '-' || LPAD(next_number::TEXT, 6, '0');
    RETURN new_sku;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Sample Data
-- =====================================================

INSERT INTO pim_categories (tenant_id, name, slug, level) VALUES
('demo-tenant', 'Electronics', 'electronics', 0),
('demo-tenant', 'Clothing', 'clothing', 0),
('demo-tenant', 'Home & Garden', 'home-garden', 0);

INSERT INTO pim_brands (tenant_id, name, slug) VALUES
('demo-tenant', 'TechBrand', 'techbrand'),
('demo-tenant', 'FashionCo', 'fashionco');

INSERT INTO pim_attribute_definitions (tenant_id, attribute_code, attribute_label, data_type, is_variant_attribute, options) VALUES
('demo-tenant', 'color', 'Color', 'select', true, '[{"value":"red","label":"Red"},{"value":"blue","label":"Blue"},{"value":"green","label":"Green"}]'::jsonb),
('demo-tenant', 'size', 'Size', 'select', true, '[{"value":"s","label":"Small"},{"value":"m","label":"Medium"},{"value":"l","label":"Large"}]'::jsonb),
('demo-tenant', 'material', 'Material', 'text', false, '[]'::jsonb),
('demo-tenant', 'warranty_years', 'Warranty (Years)', 'number', false, '[]'::jsonb);
