
import { db } from "./db";
import { sql } from "drizzle-orm";

async function runMigration() {
    console.log("Starting Manual Schema Migration...");

    try {
        // 1. ap_suppliers extensions
        console.log("Migrating ap_suppliers...");
        await db.execute(sql`
      ALTER TABLE ap_suppliers 
      ADD COLUMN IF NOT EXISTS credit_hold boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS risk_category varchar(50) DEFAULT 'Low',
      ADD COLUMN IF NOT EXISTS parent_supplier_id integer,
      ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();
    `);

        // 2. ap_invoices extensions
        console.log("Migrating ap_invoices...");
        await db.execute(sql`
      ALTER TABLE ap_invoices 
      ADD COLUMN IF NOT EXISTS tax_amount numeric(12,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS payment_terms varchar(100),
      ADD COLUMN IF NOT EXISTS recognition_status varchar(50) DEFAULT 'Pending',
      ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();
    `);

        // 3. ap_payments extensions
        console.log("Migrating ap_payments...");
        await db.execute(sql`
      ALTER TABLE ap_payments 
      ADD COLUMN IF NOT EXISTS invoice_id integer,
      ADD COLUMN IF NOT EXISTS payment_method varchar(50) DEFAULT 'BankTransfer',
      ADD COLUMN IF NOT EXISTS applied_invoice_ids jsonb DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS payment_date timestamp DEFAULT now();
    `);

        // 4. Create ar_revenue_schedules
        console.log("Creating ar_revenue_schedules...");
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ar_revenue_schedules (
        id serial PRIMARY KEY,
        invoice_id integer NOT NULL,
        schedule_date timestamp NOT NULL,
        amount numeric(12,2) NOT NULL,
        status varchar(20) DEFAULT 'Pending'
      );
    `);

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

runMigration();
