
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function createTables() {
    console.log("🔨 Creating Subscription Tables...");

    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS subscription_contracts (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                contract_number TEXT NOT NULL UNIQUE,
                customer_id TEXT,
                status TEXT NOT NULL DEFAULT 'Draft',
                start_date TIMESTAMP NOT NULL,
                end_date TIMESTAMP,
                renewal_type TEXT DEFAULT 'Manual',
                currency TEXT DEFAULT 'USD',
                payment_terms TEXT DEFAULT 'Net 30',
                billing_frequency TEXT DEFAULT 'Monthly',
                total_tcv NUMERIC DEFAULT '0',
                total_mrr NUMERIC DEFAULT '0',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                created_by TEXT
            );
        `);
        console.log("✅ subscription_contracts created");

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS subscription_products (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                subscription_id TEXT REFERENCES subscription_contracts(id),
                item_id TEXT NOT NULL,
                item_name TEXT NOT NULL,
                quantity NUMERIC NOT NULL DEFAULT '1',
                unit_price NUMERIC NOT NULL,
                discount_percent NUMERIC DEFAULT '0',
                amount NUMERIC NOT NULL,
                billing_type TEXT DEFAULT 'Recurring',
                start_date TIMESTAMP,
                end_date TIMESTAMP,
                status TEXT DEFAULT 'Active'
            );
        `);
        console.log("✅ subscription_products created");

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS subscription_actions (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                subscription_id TEXT REFERENCES subscription_contracts(id),
                action_type TEXT NOT NULL,
                action_date TIMESTAMP DEFAULT NOW(),
                reason TEXT,
                changes JSONB,
                performed_by TEXT
            );
        `);
        console.log("✅ subscription_actions created");

        process.exit(0);
    } catch (e) {
        console.error("❌ Failed to create tables:", e);
        process.exit(1);
    }
}

createTables();
