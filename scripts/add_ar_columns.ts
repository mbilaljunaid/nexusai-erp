
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function migrate() {
    console.log("Applying manual schema update for AR Invoices...");
    try {
        await db.execute(sql`
            ALTER TABLE ar_invoices 
            ADD COLUMN IF NOT EXISTS payment_terms varchar(255) DEFAULT 'Net 30';
        `);
        console.log("✅ Added payment_terms column.");
        process.exit(0);
    } catch (e) {
        console.error("❌ Migration failed:", e);
        process.exit(1);
    }
}

migrate();
