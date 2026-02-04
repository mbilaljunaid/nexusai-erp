
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function setupSodDb() {
    console.log("🛠️ Setting up SoD Database Tables...");

    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS hr_sod_rules (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id VARCHAR NOT NULL,
                role_code_a VARCHAR NOT NULL,
                role_code_b VARCHAR NOT NULL,
                risk_level VARCHAR NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT now()
            );
        `);
        console.log("   ✅ Table 'hr_sod_rules' created.");
    } catch (error) {
        console.error("   ❌ Failed to create table:", error);
        process.exit(1);
    }

    process.exit(0);
}

setupSodDb();
