-- RETAIL SCHEMA (Postgres)
-- Multi-tenant with RLS

CREATE SCHEMA IF NOT EXISTS retail;

-- PRODUCTS (PIM)
CREATE TABLE retail.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    sku VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    category_id UUID, -- Ref to common.categories or retail-specific
    price DECIMAL(18, 2) NOT NULL DEFAULT 0,
    cost DECIMAL(18, 2) NOT NULL DEFAULT 0,
    is_taxable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, sku)
);

-- INVENTORY (Real-time snapshot)
CREATE TABLE retail.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    product_id UUID NOT NULL REFERENCES retail.products(id),
    location_id UUID NOT NULL, -- Store or Warehouse ID
    quantity INT NOT NULL DEFAULT 0,
    type VARCHAR(20) NOT NULL CHECK (type IN ('AVAILABLE', 'ALLOCATED', 'DAMAGED', 'IN_TRANSIT')),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, product_id, location_id, type)
);

-- ORDERS (OMS)
CREATE TABLE retail.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    customer_id UUID NOT NULL, -- Ref to Common Customer
    status VARCHAR(20) NOT NULL CHECK (status IN ('PLACED', 'FRAUD_CHECK', 'ALLOCATED', 'PICKED', 'SHIPPED', 'DELIVERED', 'RETURNED')),
    total_amount DECIMAL(18, 2) NOT NULL,
    shipping_address_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER ITEMS
CREATE TABLE retail.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES retail.orders(id),
    product_id UUID NOT NULL REFERENCES retail.products(id),
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(18, 2) NOT NULL
);

-- RLS
ALTER TABLE retail.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_products ON retail.products
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
