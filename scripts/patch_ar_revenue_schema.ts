import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patchArRevenueSchema() {
    console.log("🚀 Patching AR Revenue Schema...");

    try {
        // 1. Create ar_revenue_rules
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS ar_revenue_rules (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR NOT NULL,
                description TEXT,
                duration_periods INTEGER DEFAULT 1,
                recognition_method VARCHAR DEFAULT 'Straight Line',
                enabled_flag BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT now()
            );
        `);
        console.log("✅ Created ar_revenue_rules table.");

        // 2. Create ar_revenue_schedules
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS ar_revenue_schedules (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                invoice_id VARCHAR NOT NULL,
                schedule_date TIMESTAMP NOT NULL,
                amount NUMERIC(18, 2) NOT NULL,
                account_class VARCHAR DEFAULT 'Revenue',
                status VARCHAR DEFAULT 'Pending',
                period_name VARCHAR,
                rule_id VARCHAR,
                created_at TIMESTAMP DEFAULT now()
            );
        `);
        console.log("✅ Created ar_revenue_schedules table.");

        // 3. Alter ar_invoices
        await db.execute(sql`
            ALTER TABLE ar_invoices 
            ADD COLUMN IF NOT EXISTS revenue_rule_id VARCHAR;
        `);
        console.log("✅ Updated ar_invoices table.");

        console.log("✨ AR Revenue Schema Patch Successful!");
        process.exit(0);

    } catch (error: any) {
        console.error("❌ Patch Failed:", error.message);
        process.exit(1);
    }
}

patchArRevenueSchema();
