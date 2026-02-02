
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patchTreasuryPhase3() {
    console.log("🚀 Starting Treasury Phase 3 Schema Patch...");

    try {
        // 1. Create treasury_cash_forecasts
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS treasury_cash_forecasts (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        forecast_date TIMESTAMP NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        amount NUMERIC(20, 2) NOT NULL,
        source VARCHAR(50) NOT NULL,
        scenario VARCHAR(50) DEFAULT 'BASELINE',
        confidence NUMERIC(5, 2) DEFAULT 100,
        source_id VARCHAR,
        generated_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log("✅ Table 'treasury_cash_forecasts' created.");

    } catch (error) {
        console.error("❌ Schema Patch Failed:", error);
        process.exit(1);
    }

    console.log("🎉 Treasury Phase 3 Schema Patch Completed Successfully!");
    process.exit(0);
}

patchTreasuryPhase3();
