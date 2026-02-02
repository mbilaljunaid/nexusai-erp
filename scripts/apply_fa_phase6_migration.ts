
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function applyFaPhase6Migration() {
    console.log("🚀 Applying Fixed Assets Phase 6 Migration...");

    try {
        // 1. Add Lease ID to fa_assets
        console.log("Updating fa_assets...");
        await db.execute(sql`
            ALTER TABLE fa_assets 
            ADD COLUMN IF NOT EXISTS lease_id VARCHAR(100);
        `);

        // 2. Add Advanced Depreciation fields to fa_asset_books
        console.log("Updating fa_asset_books...");
        await db.execute(sql`
            ALTER TABLE fa_asset_books 
            ADD COLUMN IF NOT EXISTS total_units NUMERIC(20,2),
            ADD COLUMN IF NOT EXISTS units_consumed NUMERIC(20,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS db_rate NUMERIC(5,2);
        `);

        // 3. Create fa_leases table
        console.log("Creating fa_leases table...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS fa_leases (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                lease_number VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                lessor VARCHAR(200),
                lease_type VARCHAR(30) NOT NULL,
                start_date TIMESTAMP NOT NULL,
                end_date TIMESTAMP NOT NULL,
                term_months INTEGER NOT NULL,
                monthly_payment NUMERIC(20,2) NOT NULL,
                interest_rate NUMERIC(5,2) NOT NULL,
                pv_of_payments NUMERIC(20,2),
                status VARCHAR(20) DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        console.log("✅ Fixed Assets Phase 6 Migration Applied Successfully!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

applyFaPhase6Migration().then(() => process.exit(0));
