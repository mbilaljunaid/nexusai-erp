import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function deploySchema() {
    console.log("🚀 Manual Schema Deployment started...");

    // List of tables to ensure exist
    const tables = [
        `CREATE TABLE IF NOT EXISTS "bom_items" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "bom_id" varchar NOT NULL,
            "product_id" varchar NOT NULL,
            "quantity" numeric(18, 4) NOT NULL,
            "uom" varchar DEFAULT 'EA',
            "scrap_factor" numeric(5, 2) DEFAULT '0',
            "created_at" timestamp DEFAULT now()
        )`,
        `CREATE TABLE IF NOT EXISTS "manufacturing_resources" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "resource_code" varchar NOT NULL UNIQUE,
            "name" varchar NOT NULL,
            "type" varchar NOT NULL,
            "status" varchar DEFAULT 'active',
            "capacity_per_hour" numeric(18, 2),
            "cost_per_hour" numeric(18, 2),
            "created_at" timestamp DEFAULT now()
        )`,
        `CREATE TABLE IF NOT EXISTS "routings" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "routing_number" varchar NOT NULL UNIQUE,
            "product_id" varchar NOT NULL,
            "status" varchar DEFAULT 'active',
            "created_at" timestamp DEFAULT now()
        )`,
        `CREATE TABLE IF NOT EXISTS "routing_operations" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "routing_id" varchar NOT NULL,
            "operation_seq" integer NOT NULL,
            "work_center_id" varchar NOT NULL,
            "standard_operation_id" varchar,
            "description" varchar,
            "setup_time" numeric(10, 2) DEFAULT '0',
            "run_time" numeric(10, 2) DEFAULT '0',
            "resource_id" varchar,
            "created_at" timestamp DEFAULT now()
        )`,
        `CREATE TABLE IF NOT EXISTS "mfg_cost_elements" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "code" varchar NOT NULL UNIQUE,
            "name" varchar NOT NULL,
            "type" varchar NOT NULL,
            "fixed_or_variable" varchar DEFAULT 'VARIABLE',
            "gl_account_id" varchar,
            "status" varchar DEFAULT 'active',
            "created_at" timestamp DEFAULT now()
        )`,
        `CREATE TABLE IF NOT EXISTS "mfg_overhead_rules" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "cost_element_id" varchar NOT NULL,
            "basis" varchar NOT NULL,
            "rate_or_percentage" numeric(10, 4) NOT NULL,
            "status" varchar DEFAULT 'active',
            "created_at" timestamp DEFAULT now()
        )`,
        `CREATE TABLE IF NOT EXISTS "mfg_standard_costs" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "target_type" varchar NOT NULL,
            "target_id" varchar NOT NULL,
            "cost_element_id" varchar NOT NULL,
            "unit_cost" numeric(18, 4) NOT NULL,
            "effective_date" timestamp DEFAULT now(),
            "is_active" boolean DEFAULT true,
            "created_at" timestamp DEFAULT now()
        )`,
        `CREATE TABLE IF NOT EXISTS "mfg_wip_balances" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "production_order_id" varchar NOT NULL,
            "cost_element_id" varchar NOT NULL,
            "balance" numeric(18, 4) DEFAULT '0',
            "last_updated" timestamp DEFAULT now()
        )`,
        `CREATE TABLE IF NOT EXISTS "mfg_variance_journals" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "production_order_id" varchar NOT NULL,
            "variance_type" varchar NOT NULL,
            "amount" numeric(18, 4) NOT NULL,
            "description" text,
            "gl_posted" boolean DEFAULT false,
            "transaction_date" timestamp DEFAULT now(),
            "created_at" timestamp DEFAULT now()
        )`,
        `DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory' AND column_name='tracking_method') THEN
                ALTER TABLE "inventory" ADD COLUMN "tracking_method" varchar DEFAULT 'NONE';
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='production_orders' AND column_name='routing_id') THEN
                ALTER TABLE "production_orders" ADD COLUMN "routing_id" varchar;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='production_orders' AND column_name='bom_id') THEN
                ALTER TABLE "production_orders" ADD COLUMN "bom_id" varchar;
            END IF;
        END $$;`
    ];

    for (const tableSql of tables) {
        try {
            console.log(`Executing SQL: ${tableSql.substring(0, 40)}...`);
            await db.execute(sql.raw(tableSql));
        } catch (error) {
            console.error(`❌ Error executing SQL:`, error);
        }
    }

    console.log("✅ Schema deployment completed!");
    process.exit(0);
}

deploySchema();
