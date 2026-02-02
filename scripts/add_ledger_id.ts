
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function run() {
    console.log("Adding ledger_id to gl_ledger_sets...");
    try {
        await db.execute(sql`
            ALTER TABLE gl_ledger_sets ADD COLUMN IF NOT EXISTS ledger_id varchar;
        `);
        console.log("Column added successfully.");
    } catch (e: any) {
        console.error("Error adding column:", e.message);
    }
    process.exit(0);
}

run();
