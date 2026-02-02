
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patchSchema() {
    console.log("🛠️ Patching SLA Schema: Adding priority...");
    try {
        await db.execute(sql`
            ALTER TABLE sla_journal_line_types 
            ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
        `);
        console.log("✅ Success.");
    } catch (e) {
        console.error("❌ Failed:", e);
    }
    process.exit(0);
}

patchSchema();
