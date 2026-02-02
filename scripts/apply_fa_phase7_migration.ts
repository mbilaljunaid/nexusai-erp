
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function applyFaPhase7Migration() {
    console.log("🚀 Applying Fixed Assets Phase 7 Migration...");

    try {
        // 1. Add QR Code and lastVerifiedAt to fa_assets
        console.log("Updating fa_assets...");
        await db.execute(sql`
            ALTER TABLE fa_assets 
            ADD COLUMN IF NOT EXISTS qr_code TEXT,
            ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMP;
        `);

        // 2. Create fa_physical_inventory table
        console.log("Creating fa_physical_inventory table...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS fa_physical_inventory (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                inventory_name VARCHAR(255) NOT NULL,
                status VARCHAR(20) DEFAULT 'OPEN',
                start_date TIMESTAMP NOT NULL,
                end_date TIMESTAMP,
                description TEXT,
                created_by VARCHAR(100),
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        // 3. Create fa_inventory_scans table
        console.log("Creating fa_inventory_scans table...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS fa_inventory_scans (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                inventory_id VARCHAR NOT NULL REFERENCES fa_physical_inventory(id),
                asset_id VARCHAR NOT NULL REFERENCES fa_assets(id),
                scan_date TIMESTAMP DEFAULT now(),
                scanned_location_id VARCHAR(100),
                scanned_by VARCHAR(100),
                condition VARCHAR(50),
                notes TEXT,
                reconciliation_status VARCHAR(20) DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        console.log("✅ Fixed Assets Phase 7 Migration Applied Successfully!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

applyFaPhase7Migration().then(() => process.exit(0));
