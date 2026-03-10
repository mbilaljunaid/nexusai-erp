-- =====================================================
-- Marketplace Platform + Returns Management + DAM
-- Modules: 2.2, 2.3, 2.4 - E-commerce Platform
-- =====================================================

-- =====================================================
-- MARKETPLACE PLATFORM
-- =====================================================

CREATE TABLE marketplace_vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    vendor_name VARCHAR(255) NOT NULL,
    seller_id UUID, -- Links to users table
    email VARCHAR(255),
    
    -- Business info
    business_name VARCHAR(255),
    tax_id VARCHAR(100),
    
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'suspended', 'rejected')),
    
    -- Commission
    commission_rate DECIMAL(5,2) DEFAULT 15.00, -- Percentage
    
    -- Bank details
    bank_details JSONB,
    
    -- Metrics
    total_sales DECIMAL(15,2) DEFAULT 0,
    total_orders INT DEFAULT 0,
    avg_rating DECIMAL(3,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE marketplace_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    vendor_id UUID NOT NULL REFERENCES marketplace_vendors(id),
    product_id UUID NOT NULL, -- Links to pim_products
    
    vendor_sku VARCHAR(100),
    commission_override DECIMAL(5,2), -- Can override vendor default
    
    approval_status VARCHAR(50) DEFAULT 'pending',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE marketplace_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    vendor_id UUID NOT NULL REFERENCES marketplace_vendors(id),
    order_id UUID NOT NULL,
    
    order_total DECIMAL(15,2),
    commission_rate DECIMAL(5,2),
    commission_amount DECIMAL(15,2),
    
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
    paid_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vendors_tenant ON marketplace_vendors(tenant_id);
CREATE INDEX idx_marketplace_products_vendor ON marketplace_products(vendor_id);
CREATE INDEX idx_commissions_vendor ON marketplace_commissions(vendor_id, status);

-- =====================================================
-- RETURNS MANAGEMENT (RMA)
-- =====================================================

CREATE TABLE rma_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    rma_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Order info
    order_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    
    -- Request details
    reason VARCHAR(50) CHECK (reason IN (
        'defective',
        'wrong_item',
        'not_as_described',
        'changed_mind',
        'damaged_shipping',
        'other'
    )),
    reason_description TEXT,
    
    -- Items
    items JSONB NOT NULL, -- [{product_id, qty, return_qty, reason}]
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending',
        'approved',
        'rejected',
        'received',
        'inspected',
        'refunded',
        'exchanged',
        'closed'
    )),
    
    -- Resolution
    resolution_type VARCHAR(50), -- 'refund', 'exchange', 'store_credit'
    refund_amount DECIMAL(15,2),
    restocking_fee DECIMAL(15,2) DEFAULT 0,
    
    -- Tracking
    return_shipping_label_url VARCHAR(500),
    tracking_number VARCHAR(100),
    received_date TIMESTAMP WITH TIME ZONE,
    
    -- Inspection
    inspection_notes TEXT,
    inspection_photos JSONB,
    
    -- Processing
    approved_by_user_id UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE rma_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rma_id UUID NOT NULL REFERENCES rma_requests(id) ON DELETE CASCADE,
    file_url VARCHAR(500),
    file_type VARCHAR(50),
    uploaded_by VARCHAR(50), -- 'customer', 'staff'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rma_tenant ON rma_requests(tenant_id, created_at DESC);
CREATE INDEX idx_rma_customer ON rma_requests(customer_id);
CREATE INDEX idx_rma_status ON rma_requests(status);

-- =====================================================
-- DIGITAL ASSET MANAGEMENT (DAM)
-- =====================================================

CREATE TABLE dam_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    
    -- File info
    filename VARCHAR(500) NOT NULL,
    file_type VARCHAR(50), -- 'image', 'video', 'document', 'audio'
    mime_type VARCHAR(100),
    file_size_bytes BIGINT,
    
    -- Storage
    storage_url VARCHAR(1000) NOT NULL,
    cdn_url VARCHAR(1000),
    thumbnail_url VARCHAR(1000),
    
    -- Media metadata
    width INT,
    height INT,
    duration_seconds INT, -- For video/audio
    
    -- Organization
    folder_id UUID,
    tags VARCHAR(100)[],
    
    -- Usage tracking
    usage_count INT DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- SEO
    alt_text TEXT,
    title VARCHAR(255),
    description TEXT,
    
    -- Status
    is_public BOOLEAN DEFAULT false,
    
    uploaded_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE dam_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES dam_folders(id),
    path VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE dam_transformations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES dam_assets(id) ON DELETE CASCADE,
    
    transformation_name VARCHAR(100), -- 'thumbnail', 'large', 'webp', etc.
    transformation_params JSONB, -- {width: 300, height: 300, format: 'webp'}
    
    output_url VARCHAR(1000),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_assets_tenant ON dam_assets(tenant_id, created_at DESC);
CREATE INDEX idx_assets_folder ON dam_assets(folder_id);
CREATE INDEX idx_assets_type ON dam_assets(file_type);
CREATE INDEX idx_assets_tags ON dam_assets USING GIN (tags);
CREATE INDEX idx_folders_tenant ON dam_folders(tenant_id);

-- =====================================================
-- RLS Policies
-- =====================================================

ALTER TABLE marketplace_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rma_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE dam_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dam_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_vendors ON marketplace_vendors
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE POLICY tenant_isolation_marketplace_products ON marketplace_products
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE POLICY tenant_isolation_commissions ON marketplace_commissions
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE POLICY tenant_isolation_rma ON rma_requests
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE POLICY tenant_isolation_dam_assets ON dam_assets
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE POLICY tenant_isolation_dam_folders ON dam_folders
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

-- Triggers
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON marketplace_vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rma_updated_at BEFORE UPDATE ON rma_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON dam_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data
INSERT INTO dam_folders (tenant_id, name, path) VALUES
('demo-tenant', 'Product Images', '/product-images'),
('demo-tenant', 'Marketing', '/marketing'),
('demo-tenant', 'Documents', '/documents');
