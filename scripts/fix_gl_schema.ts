
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Dropping GL Audit and Security tables to fix schema conflict...");

    try {
        await db.execute(sql`DROP TABLE IF EXISTS gl_journal_lines_v2 CASCADE;`);
        console.log("Dropped gl_journal_lines_v2");

        await db.execute(sql`DROP TABLE IF EXISTS gl_journals_v2 CASCADE;`);
        console.log("Dropped gl_journals_v2");

        await db.execute(sql`DROP TABLE IF EXISTS gl_data_access_set_assignments CASCADE;`);
        console.log("Dropped gl_data_access_set_assignments");

        await db.execute(sql`DROP TABLE IF EXISTS gl_data_access_sets CASCADE;`);
        console.log("Dropped gl_data_access_sets");

        await db.execute(sql`DROP TABLE IF EXISTS gl_audit_logs CASCADE;`);
        console.log("Dropped gl_audit_logs");

        console.log("Cleanup complete. running db:push should work now.");
    } catch (error) {
        console.error("Error during cleanup:", error);
    }
    process.exit(0);
}

main();
