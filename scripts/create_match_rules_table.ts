
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function createTable() {
    console.log("Trace: Manually creating hz_match_rules table...");
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS hz_match_rules (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                rule_name VARCHAR NOT NULL,
                description TEXT,
                match_type VARCHAR DEFAULT 'FUZZY',
                match_score_threshold INTEGER DEFAULT 80,
                config_json JSONB,
                active_flag BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT now(),
                updated_at TIMESTAMP DEFAULT now()
            );
        `);
        console.log("✅ Table hz_match_rules created successfully.");
    } catch (e) {
        console.error("❌ Failed to create table:", e);
        process.exit(1);
    }
    process.exit(0);
}

createTable();
