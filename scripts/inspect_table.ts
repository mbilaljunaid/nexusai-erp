
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Inspecting gl_journal_lines_v2 columns...");
    const result1 = await db.execute(sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'gl_journal_lines_v2';
    `);
    console.table(result1.rows);

    console.log("Inspecting gl_audit_logs columns...");
    const result2 = await db.execute(sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'gl_audit_logs';
    `);
    console.table(result2.rows);

    process.exit(0);
}

main();
