import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Adding AP Reporting and Control tables...");

    try {
        // 1. ap_audit_logs
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS ap_audit_logs (
                id SERIAL PRIMARY KEY,
                action VARCHAR(100) NOT NULL,
                entity VARCHAR(50) NOT NULL,
                entity_id VARCHAR(50) NOT NULL,
                user_id VARCHAR(255) NOT NULL,
                before_state JSONB,
                after_state JSONB,
                details TEXT,
                timestamp TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log("Created/Verified ap_audit_logs");

        // 2. ap_period_statuses
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS ap_period_statuses (
                id SERIAL PRIMARY KEY,
                period_id VARCHAR(255) NOT NULL,
                status VARCHAR(20) DEFAULT 'OPEN',
                closed_date TIMESTAMP,
                closed_by VARCHAR(255),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log("Created/Verified ap_period_statuses");

        console.log("Schema update complete!");
    } catch (e) {
        console.error("Failed to update schema:", e);
        process.exit(1);
    }
}

main();
