
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patchBillingEvents() {
    console.log("🛠️ Patching Billing Events Table...");

    try {
        await db.execute(sql`
            ALTER TABLE billing_events 
            ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(18, 2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS tax_lines JSONB,
            ADD COLUMN IF NOT EXISTS batch_id VARCHAR(255),
            ADD COLUMN IF NOT EXISTS invoice_id VARCHAR(255),
            ADD COLUMN IF NOT EXISTS error_code VARCHAR(255),
            ADD COLUMN IF NOT EXISTS gl_status VARCHAR(255) DEFAULT 'Pending',
            ADD COLUMN IF NOT EXISTS gl_date TIMESTAMP,
            ADD COLUMN IF NOT EXISTS gl_import_ref VARCHAR(255);
        `);
        console.log("✅ Billing Events Table Patched.");
        process.exit(0);

    } catch (e) {
        console.error("❌ Patch Failed:", e);
        process.exit(1);
    }
}

patchBillingEvents();
