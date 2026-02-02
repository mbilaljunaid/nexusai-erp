import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Adding AP Prepayment tables and columns...");

    try {
        // 1. Add column to ap_invoices
        await db.execute(sql`
            ALTER TABLE ap_invoices 
            ADD COLUMN IF NOT EXISTS prepay_amount_remaining NUMERIC(18, 2);
        `);
        console.log("Added prepay_amount_remaining to ap_invoices");

        // 2. ap_prepay_applications
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS ap_prepay_applications (
                id SERIAL PRIMARY KEY,
                standard_invoice_id INTEGER NOT NULL,
                prepayment_invoice_id INTEGER NOT NULL,
                amount_applied NUMERIC(18, 2) NOT NULL,
                accounting_date TIMESTAMP NOT NULL DEFAULT NOW(),
                user_id VARCHAR(255) NOT NULL,
                status VARCHAR(20) DEFAULT 'APPLIED',
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log("Created/Verified ap_prepay_applications");

        // 3. SLA Event Class
        await db.execute(sql`
            INSERT INTO sla_event_classes (id, application_id, name, description)
            VALUES ('AP_PREPAY_APPLICATION', 'AP', 'Payables Prepayment Application', 'Application of a prepayment to an invoice')
            ON CONFLICT (id) DO NOTHING;
        `);
        console.log("Seeded SLA Event Class: AP_PREPAY_APPLICATION");

        console.log("Schema update complete!");
    } catch (e) {
        console.error("Failed to update schema:", e);
        process.exit(1);
    }
}

main();
