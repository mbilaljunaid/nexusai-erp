
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function run() {
    console.log("Checking gl_ledgers_v2 schema...");
    const res = await db.execute(sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'gl_ledgers_v2'
    `);
    console.log(res.rows);
    process.exit(0);
}

run();
