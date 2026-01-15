
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patchTreasurySchema() {
    console.log("🚀 Starting Treasury Schema Patch...");

    try {
        // 1. Treasury Counterparties
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS treasury_counterparties (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL,
                short_name VARCHAR(50),
                tax_id VARCHAR(50),
                swift_code VARCHAR(11),
                address TEXT,
                active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log("✅ Table 'treasury_counterparties' created.");

        // 2. Treasury Deals
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS treasury_deals (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                deal_number VARCHAR(50) NOT NULL UNIQUE,
                type VARCHAR(50) NOT NULL,
                sub_type VARCHAR(50),
                counterparty_id VARCHAR NOT NULL REFERENCES treasury_counterparties(id),
                bank_account_id VARCHAR REFERENCES cash_bank_accounts(id),
                principal_amount NUMERIC(20, 2) NOT NULL,
                currency VARCHAR(10) DEFAULT 'USD',
                interest_rate NUMERIC(10, 6),
                interest_type VARCHAR(20) DEFAULT 'FIXED',
                basis_points_spread INTEGER DEFAULT 0,
                day_count_convention VARCHAR(20) DEFAULT '30/360',
                start_date TIMESTAMP NOT NULL,
                maturity_date TIMESTAMP,
                term_months INTEGER,
                status VARCHAR(20) DEFAULT 'DRAFT',
                valuation_method VARCHAR(20) DEFAULT 'AMORTIZED_COST',
                legal_entity_id VARCHAR,
                ledger_id VARCHAR,
                description TEXT,
                metadata JSONB,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log("✅ Table 'treasury_deals' created.");

        // 3. Treasury Installments
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS treasury_installments (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                deal_id VARCHAR NOT NULL REFERENCES treasury_deals(id),
                sequence_number INTEGER NOT NULL,
                due_date TIMESTAMP NOT NULL,
                principal_amount NUMERIC(20, 2) NOT NULL,
                interest_amount NUMERIC(20, 2) NOT NULL,
                total_amount NUMERIC(20, 2) NOT NULL,
                remaining_principal NUMERIC(20, 2),
                status VARCHAR(20) DEFAULT 'PENDING',
                payment_id VARCHAR,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log("✅ Table 'treasury_installments' created.");

        console.log("🎉 Treasury Schema Patch Completed Successfully!");
    } catch (error) {
        console.error("❌ Error applying treasury schema patch:", error);
        process.exit(1);
    }
}

patchTreasurySchema();
