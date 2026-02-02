import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function applyIndices() {
    console.log("Applying Performance Indices (Phase 14)...");

    try {
        console.log("1. Creating gl_balances_ledger_period_idx...");
        await db.execute(sql`
            CREATE INDEX IF NOT EXISTS gl_balances_ledger_period_idx 
            ON gl_balances_v2 (ledger_id, period_name);
        `);
        console.log("   -> Done.");

        console.log("2. Deduplicating gl_daily_rates...");
        // Delete duplicates, keeping the latest one
        await db.execute(sql`
            DELETE FROM gl_daily_rates a USING gl_daily_rates b
            WHERE a.id < b.id 
            AND a.from_currency = b.from_currency 
            AND a.to_currency = b.to_currency 
            AND a.conversion_date = b.conversion_date;
        `);
        console.log("   -> Done.");

        console.log("3. Creating gl_daily_rates_lookup_idx...");
        await db.execute(sql`
            CREATE UNIQUE INDEX IF NOT EXISTS gl_daily_rates_lookup_idx 
            ON gl_daily_rates (from_currency, to_currency, conversion_date);
        `);
        console.log("   -> Done.");

        console.log("Indices applied successfully.");
        process.exit(0);

    } catch (error: any) {
        console.error("Error applying indices:", error);
        process.exit(1);
    }
}

applyIndices();
