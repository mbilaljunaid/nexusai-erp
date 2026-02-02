import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function initArTables() {
    console.log("🛠 Initializing AR Tables...");
    try {
        await db.execute(sql`DROP TABLE IF EXISTS ar_customer_sites;`);
        await db.execute(sql`DROP TABLE IF EXISTS ar_customer_accounts;`);

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS ar_customer_accounts (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                customer_id varchar NOT NULL,
                account_number varchar NOT NULL UNIQUE,
                account_name varchar NOT NULL,
                credit_limit numeric(18, 2) DEFAULT '0',
                balance numeric(18, 2) DEFAULT '0',
                credit_hold boolean DEFAULT false,
                risk_category varchar DEFAULT 'Low',
                ledger_id varchar,
                status varchar DEFAULT 'Active',
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("✅ ar_customer_accounts table ensured.");

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS ar_customer_sites (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                account_id varchar NOT NULL,
                site_name varchar NOT NULL,
                address text NOT NULL,
                is_bill_to boolean DEFAULT true,
                is_ship_to boolean DEFAULT false,
                primary_flag boolean DEFAULT false,
                status varchar DEFAULT 'Active',
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("✅ ar_customer_sites table ensured.");

        // Update ar_invoices and ar_receipts to have the new columns if they don't
        await db.execute(sql`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ar_invoices' AND column_name='account_id') THEN
                    ALTER TABLE ar_invoices ADD COLUMN account_id varchar;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ar_invoices' AND column_name='site_id') THEN
                    ALTER TABLE ar_invoices ADD COLUMN site_id varchar;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ar_receipts' AND column_name='account_id') THEN
                    ALTER TABLE ar_receipts ADD COLUMN account_id varchar;
                END IF;
            END $$;
        `);
        console.log("✅ ar_invoices and ar_receipts columns verified.");

        console.log("✨ AR Tables Initialization Complete!");
    } catch (error: any) {
        console.error("❌ Initialization Failed:", error.message);
        process.exit(1);
    }
}

initArTables();
