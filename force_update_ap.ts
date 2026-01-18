
import "dotenv/config";
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function forceUpdateApLines() {
    console.log("🔨 Adding Landed Cost columns to ap_invoice_lines...");
    try {
        await db.execute(sql`
            ALTER TABLE ap_invoice_lines 
            ADD COLUMN IF NOT EXISTS is_landed_cost boolean DEFAULT false,
            ADD COLUMN IF NOT EXISTS trade_operation_id varchar,
            ADD COLUMN IF NOT EXISTS cost_component_id varchar;
        `);
        console.log("✅ Columns added successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to add columns:", error);
        process.exit(1);
    }
}

forceUpdateApLines();
