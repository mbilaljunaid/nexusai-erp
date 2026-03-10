
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function fix() {
    console.log("Fixing duplicate companyName column in leads table...");
    try {
        await db.execute(sql`UPDATE leads SET company = COALESCE(company, "companyName") WHERE company IS NULL`);
        await db.execute(sql`ALTER TABLE leads DROP COLUMN IF EXISTS "companyName"`);
        console.log("Fixed.");
    } catch (e: any) {
        console.error("Error:", e.message);
    }
    process.exit(0);
}
fix();
