
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function debug() {
    try {
        const result = await db.execute(sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'leads' AND column_name ILIKE '%company%';
        `);
        console.table(result.rows);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
debug();
