
import "dotenv/config";
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function createAllocationTable() {
    console.log("🔨 Manually creating lcm_allocations table...");
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS lcm_allocations (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                charge_id varchar NOT NULL,
                shipment_line_id varchar NOT NULL,
                amount numeric NOT NULL,
                basis_value numeric,
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("✅ lcm_allocations created.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to create table:", error);
        process.exit(1);
    }
}

createAllocationTable();
