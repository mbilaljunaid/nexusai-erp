-- ==========================================
-- NexusAI Operations Platform - Master Migration
-- Version: 2.0.0
-- Generated: 2026-01-08
-- ==========================================

-- 1. CORE ERP SCHEMAS
CREATE SCHEMA IF NOT EXISTS erp_crm;
CREATE SCHEMA IF NOT EXISTS erp_hr;
CREATE SCHEMA IF NOT EXISTS erp_finance;
CREATE SCHEMA IF NOT EXISTS erp_inventory;
CREATE SCHEMA IF NOT EXISTS erp_procurement;
CREATE SCHEMA IF NOT EXISTS erp_projects;

-- 2. INDUSTRY VERTICAL SCHEMAS
CREATE SCHEMA IF NOT EXISTS mfg_production;
CREATE SCHEMA IF NOT EXISTS logistics_fleet;
CREATE SCHEMA IF NOT EXISTS epm_planning;

-- ==========================================
-- CORE ERP TABLES
-- ==========================================

-- CRM: Leads
CREATE TABLE IF NOT EXISTS erp_crm.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'NEW',
    potential_value DECIMAL(18, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HR: Employees
CREATE TABLE IF NOT EXISTS erp_hr.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    join_date DATE
);

-- Finance: Invoices
CREATE TABLE IF NOT EXISTS erp_finance.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT',
    due_date DATE
);

-- Inventory: Items
CREATE TABLE IF NOT EXISTS erp_inventory.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    cost DECIMAL(18, 2) DEFAULT 0,
    price DECIMAL(18, 2) DEFAULT 0,
    stock_level INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Procurement: Suppliers
CREATE TABLE IF NOT EXISTS erp_procurement.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Procurement: Purchase Orders
CREATE TABLE IF NOT EXISTS erp_procurement.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    supplier_id UUID NOT NULL,
    total_amount DECIMAL(18, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_supplier FOREIGN KEY (supplier_id) REFERENCES erp_procurement.suppliers(id)
);

-- Projects: Projects
CREATE TABLE IF NOT EXISTS erp_projects.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PLANNED',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects: Tasks
CREATE TABLE IF NOT EXISTS erp_projects.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    project_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'TODO',
    assigned_to UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES erp_projects.projects(id)
);

-- ==========================================
-- MANUFACTURING MODULE TABLES
-- ==========================================

-- Work Centers
CREATE TABLE IF NOT EXISTS mfg_production.work_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL, 
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    capacity_per_hour DECIMAL(10,2) DEFAULT 0,
    cost_per_hour DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bill of Materials (BOM)
CREATE TABLE IF NOT EXISTS mfg_production.boms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    product_item_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(20) DEFAULT '1.0',
    is_active BOOLEAN DEFAULT TRUE
);

-- Production Orders
CREATE TABLE IF NOT EXISTS mfg_production.production_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    product_item_id UUID NOT NULL,
    bom_id UUID, 
    quantity DECIMAL(10,2) NOT NULL,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'PLANNED',
    priority VARCHAR(20) DEFAULT 'MEDIUM'
);

-- ==========================================
-- LOGISTICS MODULE TABLES
-- ==========================================

-- Vehicles
CREATE TABLE IF NOT EXISTS logistics_fleet.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    vin VARCHAR(50),
    plate_number VARCHAR(20) NOT NULL,
    type VARCHAR(50) DEFAULT 'TRUCK',
    status VARCHAR(20) DEFAULT 'AVAILABLE'
);

-- ==========================================
-- EPM & FORECASTING TABLES
-- ==========================================

-- Forecasts
CREATE TABLE IF NOT EXISTS epm_planning.forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    scenario_name VARCHAR(255) NOT NULL,
    data JSONB,
    status VARCHAR(20) DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
