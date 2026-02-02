
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patchSchema() {
    console.log("🛠️ Patching SLA Schema: Adding transaction_source...");
    try {
        await db.execute(sql`
            ALTER TABLE sla_journal_headers 
            ADD COLUMN IF NOT EXISTS transaction_source VARCHAR;
        `);
        console.log("✅ Success.");
    } catch (e) {
        console.error("❌ Failed:", e);
    }
    process.exit(0);
}

patchSchema();
