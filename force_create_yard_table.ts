
import "dotenv/config";
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function createTable() {
    console.log("🔨 Manually creating wms_dock_appointments table...");
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS wms_dock_appointments (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                warehouse_id varchar NOT NULL,
                dock_number varchar NOT NULL,
                carrier varchar NOT NULL,
                appointment_time timestamp NOT NULL,
                duration_minutes integer DEFAULT 60,
                status varchar DEFAULT 'SCHEDULED',
                reference_number varchar,
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
