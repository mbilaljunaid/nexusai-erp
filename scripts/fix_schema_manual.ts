
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function fixSchema() {
    console.log("Applying manual schema fix...");
    try {
        await db.execute(sql`
            ALTER TABLE ap_suppliers 
            ADD COLUMN IF NOT EXISTS supplier_type VARCHAR(50) DEFAULT 'STANDARD';
        `);
        console.log("Successfully added 'supplier_type' to ap_suppliers.");
    } catch (error) {
        console.error("Error adding column:", error);
        process.exit(1);
    }
    process.exit(0);
}

fixSchema();
