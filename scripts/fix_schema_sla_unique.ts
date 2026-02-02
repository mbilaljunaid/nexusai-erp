
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Applying Schema Fix: Unique Index on sla_period_statuses...");
    try {
        await db.execute(sql`
            CREATE UNIQUE INDEX IF NOT EXISTS sla_period_statuses_unq 
            ON sla_period_statuses (ledger_id, period_name, application_id);
        `);
        console.log("Success: Unique Index Created.");
    } catch (e: any) {
        console.error("Error creating index:", e);
    }
    process.exit(0);
}

main();
