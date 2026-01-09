
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Checking row counts...");
    try {
        const lines = await db.execute(sql`SELECT COUNT(*) FROM gl_journal_lines_v2`);
        console.log("gl_journal_lines_v2 count:", lines.rows[0].count);

        const journals = await db.execute(sql`SELECT COUNT(*) FROM gl_journals_v2`);
        console.log("gl_journals_v2 count:", journals.rows[0].count);
    } catch (e) {
        console.log("Error checking counts (table might not exist):", e.message);
    }
    process.exit(0);
}

main();
