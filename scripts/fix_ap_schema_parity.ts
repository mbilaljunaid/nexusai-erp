
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function fixDb() {
    try {
        console.log("Adding banking fields to ap_supplier_sites...");
        await db.execute(sql`ALTER TABLE ap_supplier_sites ADD COLUMN IF NOT EXISTS iban varchar(50)`);
        await db.execute(sql`ALTER TABLE ap_supplier_sites ADD COLUMN IF NOT EXISTS swift_code varchar(20)`);
        await db.execute(sql`ALTER TABLE ap_supplier_sites ADD COLUMN IF NOT EXISTS bank_account_name varchar(100)`);
        await db.execute(sql`ALTER TABLE ap_supplier_sites ADD COLUMN IF NOT EXISTS bank_account_number varchar(50)`);

        console.log("Creating ap_wht_groups table...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS ap_wht_groups (
                id SERIAL PRIMARY KEY,
                group_name varchar(100) UNIQUE NOT NULL,
                description text,
                enabled_flag boolean DEFAULT true,
                created_at timestamp DEFAULT now()
            )
        `);

        console.log("Creating ap_wht_rates table...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS ap_wht_rates (
                id SERIAL PRIMARY KEY,
                group_id integer NOT NULL,
                tax_authority_id integer,
                tax_rate_name varchar(100) NOT NULL,
                rate_percent numeric(5, 2) NOT NULL,
                priority integer DEFAULT 1,
                enabled_flag boolean DEFAULT true,
                created_at timestamp DEFAULT now()
            )
        `);

        console.log("✅ Parity schema updates applied.");
        process.exit(0);
    } catch (e) {
        console.error("❌ Schema update failed:", e);
        process.exit(1);
    }
}

fixDb();
