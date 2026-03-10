import { db } from "./server/db";
import { sql } from "drizzle-orm";

const run = async () => {
    try {
        console.log("Creating lockbox tables directly...");

        await db.execute(sql`DROP TABLE IF EXISTS ar_lockbox_items;`);
        await db.execute(sql`DROP TABLE IF EXISTS ar_lockbox_batches;`);

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS ar_lockbox_batches (
                id VARCHAR(36) PRIMARY KEY,
                tenant_id VARCHAR(36) NOT NULL DEFAULT '1',
                bank_account_id VARCHAR(36),
                batch_date TIMESTAMP NOT NULL,
                total_amount NUMERIC(20, 2) NOT NULL,
                item_count INTEGER NOT NULL,
                currency_code VARCHAR(3) DEFAULT 'USD',
                status VARCHAR(50) DEFAULT 'Pending',
                imported_by VARCHAR(255) DEFAULT 'System',
                raw_file TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log("Created ar_lockbox_batches");

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS ar_lockbox_items (
                id VARCHAR(36) PRIMARY KEY,
                batch_id VARCHAR(36) NOT NULL REFERENCES ar_lockbox_batches(id),
                check_number VARCHAR(100),
                remittance_ref VARCHAR(100),
                payer_name VARCHAR(255),
                payer_account VARCHAR(100),
                amount NUMERIC(20, 2) NOT NULL,
                item_date TIMESTAMP NOT NULL,
                matched_invoice_id VARCHAR(36),
                match_method VARCHAR(50),
                match_status VARCHAR(50) DEFAULT 'Unmatched',
                unapplied_amount NUMERIC(20, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log("Created ar_lockbox_items");

    } catch (e) {
        console.error("Test error:", e);
    }
    process.exit(0);
}
run();
