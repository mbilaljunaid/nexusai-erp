
import "dotenv/config";
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function createTable() {
    console.log("🔨 Manually creating wms_strategies table...");
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS wms_strategies (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                warehouse_id varchar NOT NULL,
                type varchar NOT NULL,
                name varchar NOT NULL,
                description varchar,
                algorithm varchar NOT NULL,
                is_active boolean DEFAULT true,
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("✅ Table created successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to create table:", error);
        process.exit(1);
    }
}

createTable();
