
import "dotenv/config";
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function createLcmTables() {
    console.log("🔨 Manually creating LCM tables...");
    try {
        // 1. Cost Components
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS lcm_cost_components (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                name varchar NOT NULL,
                description text,
                component_type varchar NOT NULL,
                allocation_basis varchar DEFAULT 'VALUE',
                is_active boolean DEFAULT true,
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("✅ lcm_cost_components created.");

        // 2. Trade Operations
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS lcm_trade_operations (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                operation_number varchar NOT NULL UNIQUE,
                name varchar,
                status varchar DEFAULT 'OPEN',
                description text,
                supplier_id varchar,
                carrier varchar,
                vessel varchar,
                bill_of_lading varchar,
                departure_date timestamp,
                arrival_date timestamp,
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("✅ lcm_trade_operations created.");

        // 3. Shipment Lines
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS lcm_shipment_lines (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                trade_operation_id varchar NOT NULL,
                po_line_id varchar NOT NULL,
                quantity numeric NOT NULL,
                net_weight numeric,
                volume numeric,
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("✅ lcm_shipment_lines created.");

        // 4. Charges
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS lcm_charges (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                trade_operation_id varchar NOT NULL,
                cost_component_id varchar NOT NULL,
                amount numeric NOT NULL,
                currency varchar DEFAULT 'USD',
                vendor_id varchar,
                reference_number varchar,
                is_actual boolean DEFAULT false,
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("✅ lcm_charges created.");

        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to force create tables:", error);
        process.exit(1);
    }
}

createLcmTables();
