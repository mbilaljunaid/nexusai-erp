-- Process Manufacturing Tables Initialization
-- Based on shared/schema/manufacturing.ts

-- 1. Formulas
CREATE TABLE IF NOT EXISTS mfg_formulas (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    formula_number VARCHAR(255) NOT NULL UNIQUE,
    product_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(255) DEFAULT '1.0',
    status VARCHAR(255) DEFAULT 'active',
    total_batch_size NUMERIC(18, 4) NOT NULL,
    uom VARCHAR(255) NOT NULL,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- 2. Formula Ingredients
CREATE TABLE IF NOT EXISTS mfg_formula_ingredients (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    formula_id VARCHAR(255) NOT NULL REFERENCES mfg_formulas(id),
    product_id VARCHAR(255) NOT NULL,
    quantity NUMERIC(18, 4) NOT NULL,
    percentage NUMERIC(5, 2),
    loss_factor NUMERIC(5, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT now()
);

-- 3. Recipes
CREATE TABLE IF NOT EXISTS mfg_recipes (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_number VARCHAR(255) NOT NULL UNIQUE,
    formula_id VARCHAR(255) NOT NULL REFERENCES mfg_formulas(id),
    routing_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(255) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT now()
);

-- 4. Batches
CREATE TABLE IF NOT EXISTS mfg_batches (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_number VARCHAR(255) NOT NULL UNIQUE,
    recipe_id VARCHAR(255) NOT NULL REFERENCES mfg_recipes(id),
    target_quantity NUMERIC(18, 4) NOT NULL,
    actual_quantity NUMERIC(18, 4) DEFAULT 0,
    status VARCHAR(255) DEFAULT 'planned',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

-- 5. Batch Transactions
CREATE TABLE IF NOT EXISTS mfg_batch_transactions (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id VARCHAR(255) NOT NULL REFERENCES mfg_batches(id),
    transaction_type VARCHAR(255) NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    quantity NUMERIC(18, 4) NOT NULL,
    lot_number VARCHAR(255),
    parent_lot_id VARCHAR(255),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mfg_quality_results (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id VARCHAR(255) NOT NULL,
    parameter_name VARCHAR(255) NOT NULL,
    min_value DECIMAL(18, 4),
    max_value DECIMAL(18, 4),
    actual_value DECIMAL(18, 4) NOT NULL,
    uom VARCHAR(50),
    result VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Standard Data for Discrete (If missing)
CREATE TABLE IF NOT EXISTS mfg_demand_forecasts (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    forecast_date TIMESTAMP NOT NULL,
    period VARCHAR(255) DEFAULT 'WEEKLY',
    confidence NUMERIC(5, 4) DEFAULT 1.0,
    status VARCHAR(255) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mfg_mrp_plans (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name VARCHAR(255) NOT NULL,
    description TEXT,
    plan_date TIMESTAMP DEFAULT now(),
    horizon_start_date TIMESTAMP,
    horizon_end_date TIMESTAMP,
    status VARCHAR(255) DEFAULT 'draft',
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mfg_mrp_recommendations (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id VARCHAR(255) NOT NULL REFERENCES mfg_mrp_plans(id),
    product_id VARCHAR(255) NOT NULL,
    recommendation_type VARCHAR(255) NOT NULL,
    suggested_quantity NUMERIC(18, 4) NOT NULL,
    suggested_date TIMESTAMP,
    source_order_type VARCHAR(255),
    source_order_id VARCHAR(255),
    status VARCHAR(255) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT now()
);

-- Ensure inventory exists matching verification script
-- (Verification script uses 'inventory' table from scm.ts)
CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name VARCHAR(255) NOT NULL,
    sku VARCHAR(255) UNIQUE,
    quantity INTEGER DEFAULT 0,
    reorder_level INTEGER,
    location VARCHAR(255),
    tracking_method VARCHAR(255) DEFAULT 'NONE',
    uom VARCHAR(255) DEFAULT 'EA',
    created_at TIMESTAMP DEFAULT now()
);
