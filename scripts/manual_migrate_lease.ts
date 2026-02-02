
import "dotenv/config";
import { db } from "@db";
import { sql } from "drizzle-orm";

async function manualMigrate() {
    console.log("Forcing Schema Update for Lease Headers...");
    try {
        await db.execute(sql`
            ALTER TABLE lease_headers 
            ADD COLUMN IF NOT EXISTS is_modified BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS modification_date TIMESTAMP,
            ADD COLUMN IF NOT EXISTS previous_liability NUMERIC(18, 2),
            ADD COLUMN IF NOT EXISTS modification_reason VARCHAR;
        `);
        console.log("✅ Columns added successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

manualMigrate();
