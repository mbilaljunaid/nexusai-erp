
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function fix() {
    console.log("Fixing duplicate lastName column in leads table...");
    try {
        // 1. Migrate data just in case
        // Note: "lastName" key usage depends on if quoting works in the driver with Drizzle raw SQL. 
        // Using sql template usually handles it, but let's be explicitly quoted for mixed case.
        await db.execute(sql`UPDATE leads SET last_name = COALESCE(last_name, "lastName") WHERE last_name IS NULL`);

        // 2. Drop the camelCase column
        await db.execute(sql`ALTER TABLE leads DROP COLUMN IF EXISTS "lastName"`);

        console.log("Fixed.");
    } catch (e: any) {
        console.error("Error:", e.message);
    }
    process.exit(0);
}
fix();
