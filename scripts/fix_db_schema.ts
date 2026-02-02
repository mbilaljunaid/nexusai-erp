
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function fixSchema() {
    console.log("🧹 Cleaning up problematic tables to allow schema push...");

    try {
        await db.execute(sql`TRUNCATE TABLE sla_period_statuses CASCADE;`);
        console.log("✅ Truncated sla_period_statuses.");
    } catch (e) {
        console.log("⚠️ Could not truncate sla_period_statuses (might not exist yet):", e.message);
    }

    process.exit(0);
}

fixSchema();
