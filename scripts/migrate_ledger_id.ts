
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Adding ledger_id to gl_journals_v2...");
    try {
        await db.execute(sql`
            ALTER TABLE gl_journals_v2 
            ADD COLUMN IF NOT EXISTS ledger_id varchar NOT NULL DEFAULT 'PRIMARY';
        `);
        console.log("Column added successfully.");
    } catch (e: any) {
        console.error("Migration failed:", e.message);
    }
    process.exit(0);
}

main();
