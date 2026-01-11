import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patch() {
    console.log("Patching ar_revenue_schedules to add account_class, period_name, rule_id...");
    try {
        await db.execute(sql`
            ALTER TABLE ar_revenue_schedules 
            ADD COLUMN IF NOT EXISTS account_class VARCHAR DEFAULT 'Revenue',
            ADD COLUMN IF NOT EXISTS period_name VARCHAR,
            ADD COLUMN IF NOT EXISTS rule_id VARCHAR,
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
        `);

        await db.execute(sql`
            ALTER TABLE ar_revenue_schedules 
            ALTER COLUMN invoice_id TYPE VARCHAR;
        `);
        console.log("Done.");
    } catch (e) {
        console.error("Patch failed:", e);
    }
    process.exit(0);
}

patch().catch(console.error);
