
import 'dotenv/config';
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Checking existing tables...");
    try {
        const res = await db.execute(sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        console.log("Tables in DB:", res.rows.map((r: any) => r.table_name));

        // Check columns of a suspicious table if it exists
        const table = "gl_ledgers_new";
        const res2 = await db.execute(sql`
             SELECT column_name, data_type 
             FROM information_schema.columns 
             WHERE table_name = ${table};
        `);
        if (res2.rows.length > 0) {
            console.log(`Columns in ${table}:`, res2.rows);
        } else {
            console.log(`Table ${table} does not exist.`);
        }

    } catch (error) {
        console.error("Error checking tables:", error);
    }
    process.exit(0);
}

main();
