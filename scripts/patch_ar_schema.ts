
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patchArSchema() {
    console.log("🚀 Starting AR Schema Patch...");

    try {
        // Add status column if it doesn't exist
        await db.execute(sql`
      ALTER TABLE ar_invoices ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'Draft';
    `);
        console.log("✅ Added column 'status' to ar_invoices.");

    } catch (error) {
        console.error("❌ Schema Patch Failed:", error);
        process.exit(1);
    }

    console.log("🎉 AR Schema Patch Completed Successfully!");
    process.exit(0);
}

patchArSchema();
