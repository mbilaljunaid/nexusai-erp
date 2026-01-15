
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patchTreasuryPhase2() {
    console.log("🚀 Starting Treasury Phase 2 Schema Patch...");

    try {
        // 1. Create treasury_fx_deals
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS treasury_fx_deals (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        deal_number VARCHAR(50) NOT NULL UNIQUE,
        deal_type VARCHAR(20) NOT NULL,
        counterparty_id VARCHAR NOT NULL,
        portfolio_id VARCHAR,
        buy_currency VARCHAR(3) NOT NULL,
        sell_currency VARCHAR(3) NOT NULL,
        buy_amount NUMERIC(20, 2) NOT NULL,
        sell_amount NUMERIC(20, 2) NOT NULL,
        exchange_rate NUMERIC(12, 6) NOT NULL,
        spot_rate NUMERIC(12, 6),
        value_date TIMESTAMP NOT NULL,
        trade_date TIMESTAMP DEFAULT NOW(),
        status VARCHAR(20) DEFAULT 'DRAFT',
        mark_to_market NUMERIC(20, 2) DEFAULT 0,
        last_revaluation_date TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log("✅ Table 'treasury_fx_deals' created.");

        // 2. Create treasury_market_rates
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS treasury_market_rates (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        rate_type VARCHAR(20) NOT NULL,
        currency_pair VARCHAR(7),
        rate NUMERIC(12, 6) NOT NULL,
        date TIMESTAMP NOT NULL,
        source VARCHAR(50) DEFAULT 'MANUAL',
        uploaded_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log("✅ Table 'treasury_market_rates' created.");

        // 3. Create treasury_risk_limits
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS treasury_risk_limits (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        counterparty_id VARCHAR NOT NULL,
        limit_type VARCHAR(50) DEFAULT 'GLOBAL_EXPOSURE',
        currency VARCHAR(3) DEFAULT 'USD',
        max_amount NUMERIC(20, 2) NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log("✅ Table 'treasury_risk_limits' created.");

    } catch (error) {
        console.error("❌ Schema Patch Failed:", error);
        process.exit(1);
    }

    console.log("🎉 Treasury Phase 2 Schema Patch Completed Successfully!");
    process.exit(0);
}

patchTreasuryPhase2();
