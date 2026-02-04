
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function setupHrComplianceDb() {
    console.log("🛠️ Setting up HR Compliance Database Tables...");

    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS hr_policy_acknowledgements (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id VARCHAR NOT NULL,
                person_id VARCHAR NOT NULL,
                policy_code VARCHAR NOT NULL,
                consent_version VARCHAR NOT NULL,
                ip_address VARCHAR,
                user_agent TEXT,
                acknowledged_at TIMESTAMP DEFAULT now()
            );
        `);
        console.log("   ✅ Table 'hr_policy_acknowledgements' created.");
    } catch (error) {
        console.error("   ❌ Failed to create table:", error);
        process.exit(1);
    }

    process.exit(0);
}

setupHrComplianceDb();
