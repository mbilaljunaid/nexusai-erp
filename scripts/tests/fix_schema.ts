import "dotenv/config";
import { db } from "../../server/db";
import { sql } from "drizzle-orm";

async function fixSchema() {
    try {
        console.log("Adding org_id to ar_customer_sites...");
        await db.execute(sql`
            ALTER TABLE ar_customer_sites
            ADD COLUMN IF NOT EXISTS org_id VARCHAR(255) DEFAULT '1';
        `);
        console.log("✅ Added org_id to ar_customer_sites.");

        console.log("Adding Phase 5 columns to existing AR tables...");
        await db.execute(sql`
            ALTER TABLE ar_receipts ADD COLUMN IF NOT EXISTS remittance_batch_id VARCHAR(255);
            ALTER TABLE ar_receipt_applications ADD COLUMN IF NOT EXISTS earned_discount_amount NUMERIC(18, 2) DEFAULT '0';
            ALTER TABLE ar_receipt_applications ADD COLUMN IF NOT EXISTS unearned_discount_amount NUMERIC(18, 2) DEFAULT '0';
        `);
        console.log("✅ Added Phase 5 columns to AR tables.");

        // Also ensure Phase 5 tables exist
        console.log("Checking for Phase 5 tables...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS ar_remittance_batches (
                id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                bank_account_id VARCHAR(255),
                batch_date TIMESTAMP NOT NULL,
                total_amount NUMERIC(20, 2) NOT NULL,
                item_count INTEGER NOT NULL,
                status VARCHAR(255) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS ar_promises_to_pay (
                id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
                customer_id VARCHAR(255) NOT NULL,
                invoice_id VARCHAR(255) NOT NULL,
                promised_amount NUMERIC(18, 2) NOT NULL,
                promised_date TIMESTAMP NOT NULL,
                status VARCHAR(255) DEFAULT 'Open',
                notes TEXT,
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS ar_disputes (
                id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
                invoice_id VARCHAR(255) NOT NULL,
                customer_id VARCHAR(255) NOT NULL,
                dispute_reason VARCHAR(255) NOT NULL,
                disputed_amount NUMERIC(15, 2),
                description TEXT,
                status VARCHAR(255) DEFAULT 'Open',
                admin_response TEXT,
                resolved_by VARCHAR(255),
                resolved_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT now(),
                updated_at TIMESTAMP DEFAULT now()
            );
        `);

        console.log("✅ Phase 5 tables verified/created.");

    } catch (e: any) {
        console.error("Error fixing schema:", e.message);
    } finally {
        process.exit(0);
    }
}

fixSchema();
