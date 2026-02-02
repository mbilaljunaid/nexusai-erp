
import "dotenv/config";
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function createTables() {
    console.log("🔨 Manually creating Phase 32 tables...");
    try {
        // Handling Unit Types
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS wms_handling_unit_types (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                warehouse_id varchar NOT NULL,
                code varchar NOT NULL,
                description varchar,
                length numeric,
                width numeric,
                height numeric,
                max_weight numeric,
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("✅ wms_handling_unit_types created.");

        // Wave Templates
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS wms_wave_templates (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                warehouse_id varchar NOT NULL,
                name varchar NOT NULL,
                criteria_json text NOT NULL,
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("✅ wms_wave_templates created.");

        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to create tables:", error);
        process.exit(1);
    }
}

createTables();
