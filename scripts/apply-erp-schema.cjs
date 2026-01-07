const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const applySchema = async () => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || 'postgres://neondb_owner:npg_6M0btqPoxvTy@ep-purple-recipe-a8596645-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
    });

    try {
        await client.connect();
        console.log('Connected to database...');

        // ==========================================
        // 1. CORE ERP SCHEMAS
        // ==========================================
        await client.query(`CREATE SCHEMA IF NOT EXISTS erp_inventory;`);
        await client.query(`CREATE SCHEMA IF NOT EXISTS erp_procurement;`);
        await client.query(`CREATE SCHEMA IF NOT EXISTS erp_projects;`);

        // ==========================================
        // 2. INDUSTRY VERTICAL SCHEMAS
        // ==========================================
        await client.query(`CREATE SCHEMA IF NOT EXISTS mfg_production;`);
        await client.query(`CREATE SCHEMA IF NOT EXISTS logistics_fleet;`);

        // ==========================================
        // MANUFACTURING MODULE TABLES
        // ==========================================

        // 1. Work Centers
        await client.query(`
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
    `);

        // 2. Bill of Materials (BOM)
        await client.query(`
      CREATE TABLE IF NOT EXISTS mfg_production.boms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        product_item_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        version VARCHAR(20) DEFAULT '1.0',
        is_active BOOLEAN DEFAULT TRUE
      );
    `);

        // 3. Production Orders
        await client.query(`
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
    `);

        // ==========================================
        // LOGISTICS MODULE TABLES
        // ==========================================

        // 1. Vehicles
        await client.query(`
      CREATE TABLE IF NOT EXISTS logistics_fleet.vehicles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        vin VARCHAR(50),
        plate_number VARCHAR(20) NOT NULL,
        type VARCHAR(50) DEFAULT 'TRUCK',
        status VARCHAR(20) DEFAULT 'AVAILABLE'
      );
    `);

        console.log('Schema applied successfully!');
    } catch (err) {
        console.error('Error applying schema:', err);
    } finally {
        await client.end();
    }
};

applySchema();
