
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function migrateGlCvr() {
    console.log("Starting Manual GL CVR Migration...");

    try {
        // 1. is_enabled (Renaming from enabled if exists, or creating)
        try {
            await db.execute(sql`ALTER TABLE gl_cross_validation_rules_v2 RENAME COLUMN enabled TO is_enabled`);
            console.log("✅ Renamed 'enabled' to 'is_enabled'");
        } catch (e: any) {
            if (e.message.includes("does not exist")) {
                // Maybe already renamed or didn't exist? Try adding it.
                try {
                    await db.execute(sql`ALTER TABLE gl_cross_validation_rules_v2 ADD COLUMN is_enabled boolean DEFAULT true`);
                    console.log("✅ Added 'is_enabled' column");
                } catch (e2: any) {
                    console.log("ℹ️ 'is_enabled' likely already exists or error:", e2.message);
                }
            } else {
                console.log("ℹ️ Rename failed (likely already renamed):", e.message);
            }
        }

        // 2. condition_filter
        try {
            await db.execute(sql`ALTER TABLE gl_cross_validation_rules_v2 ADD COLUMN condition_filter text`);
            console.log("✅ Added 'condition_filter'");
        } catch (e: any) {
            console.log("ℹ️ 'condition_filter' likely already exists:", e.message);
        }

        // 3. validation_filter
        try {
            await db.execute(sql`ALTER TABLE gl_cross_validation_rules_v2 ADD COLUMN validation_filter text`);
            console.log("✅ Added 'validation_filter'");
        } catch (e: any) {
            console.log("ℹ️ 'validation_filter' likely already exists:", e.message);
        }

        // 4. error_action
        try {
            await db.execute(sql`ALTER TABLE gl_cross_validation_rules_v2 ADD COLUMN error_action varchar(50) DEFAULT 'Error'`);
            console.log("✅ Added 'error_action'");
        } catch (e: any) {
            console.log("ℹ️ 'error_action' likely already exists:", e.message);
        }

        // 5. gl_ledger_sets (If missing)
        try {
            await db.execute(sql`
            CREATE TABLE IF NOT EXISTS gl_ledger_sets (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR NOT NULL UNIQUE,
                description TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
            console.log("✅ Created 'gl_ledger_sets' table if missing");
        } catch (e: any) {
            console.error("❌ Failed to create gl_ledger_sets:", e.message);
        }

        // 6. gl_ledger_set_assignments
        try {
            await db.execute(sql`
            CREATE TABLE IF NOT EXISTS gl_ledger_set_assignments (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                ledger_set_id VARCHAR NOT NULL REFERENCES gl_ledger_sets(id),
                ledger_id VARCHAR NOT NULL REFERENCES gl_ledgers_v2(id),
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
            console.log("✅ Created 'gl_ledger_set_assignments' table if missing");
        } catch (e: any) {
            console.error("❌ Failed to create gl_ledger_set_assignments:", e.message);
        }


        console.log("Migration Complete.");
        process.exit(0);
    } catch (error) {
        console.error("Migration Fatal Error:", error);
        process.exit(1);
    }
}

migrateGlCvr();
