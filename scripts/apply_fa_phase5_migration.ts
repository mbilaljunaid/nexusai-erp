
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function applyFaPhase5Migration() {
    console.log("🚀 Applying Fixed Assets Phase 5 Migration...");

    try {
        // 1. Add Location and CCID to fa_asset_books
        console.log("Updating fa_asset_books...");
        await db.execute(sql`
            ALTER TABLE fa_asset_books 
            ADD COLUMN IF NOT EXISTS location_id VARCHAR(100),
            ADD COLUMN IF NOT EXISTS ccid VARCHAR(100);
        `);

        // 2. Add Approval fields to fa_retirements
        console.log("Updating fa_retirements...");
        await db.execute(sql`
            ALTER TABLE fa_retirements 
            ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'PENDING',
            ADD COLUMN IF NOT EXISTS approved_by VARCHAR(100),
            ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
        `);

        // 3. Create fa_transfers table
        console.log("Creating fa_transfers table...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS fa_transfers (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                asset_book_id VARCHAR NOT NULL REFERENCES fa_asset_books(id),
                transaction_date TIMESTAMP NOT NULL,
                from_location_id VARCHAR(100),
                to_location_id VARCHAR(100),
                from_ccid VARCHAR(100),
                to_ccid VARCHAR(100),
                units NUMERIC DEFAULT 1,
                description TEXT,
                created_by VARCHAR(100),
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        console.log("✅ Fixed Assets Phase 5 Migration Applied Successfully!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

applyFaPhase5Migration().then(() => process.exit(0));
