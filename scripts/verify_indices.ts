import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function verifyIndices() {
    console.log("Verifying Schema Indices...");

    // Check for gl_balances index
    const balancesIdx = await db.execute(sql`
        SELECT indexname, indexdef 
        FROM pg_indexes 
        WHERE tablename = 'gl_balances_v2' 
        AND indexname = 'gl_balances_ledger_period_idx';
    `);

    console.log("gl_balances Index:", balancesIdx.rows.length > 0 ? "EXISTS" : "MISSING");
    if (balancesIdx.rows.length === 0) {
        console.warn("   -> Expected Index: gl_balances_ledger_period_idx");
    }

    // Check for gl_daily_rates index
    const ratesIdx = await db.execute(sql`
        SELECT indexname, indexdef 
        FROM pg_indexes 
        WHERE tablename = 'gl_daily_rates' 
        AND indexname = 'gl_daily_rates_lookup_idx';
    `);

    console.log("gl_daily_rates Index:", ratesIdx.rows.length > 0 ? "EXISTS" : "MISSING");
    if (ratesIdx.rows.length === 0) {
        console.warn("   -> Expected Index: gl_daily_rates_lookup_idx");
    }
}

verifyIndices().catch(console.error);
