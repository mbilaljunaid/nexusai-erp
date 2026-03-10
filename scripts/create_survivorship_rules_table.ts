
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function createTable() {
    console.log("Trace: Manually creating hz_survivorship_rules table...");
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS hz_survivorship_rules (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                rule_name VARCHAR NOT NULL,
                description TEXT,
                source_system VARCHAR,
                confidence_score INTEGER DEFAULT 50,
                logic_type VARCHAR DEFAULT 'SOURCE_CONFIDENCE',
                active_flag BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT now(),
                updated_at TIMESTAMP DEFAULT now()
            );
        `);
        console.log("✅ Table hz_survivorship_rules created successfully.");
    } catch (e) {
        console.error("❌ Failed to create table:", e);
        process.exit(1);
    }
    process.exit(0);
}

createTable();
