
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patchTreasuryPhase4() {
    console.log("🚀 Starting Treasury Phase 4 Schema Patch (Netting)...");

    try {
        // 1. treasury_internal_accounts
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS treasury_internal_accounts (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_name VARCHAR(100) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        balance NUMERIC(20, 2) DEFAULT '0',
        status VARCHAR(20) DEFAULT 'ACTIVE',
        linked_gl_account VARCHAR(50),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);
        console.log("✅ Created table: treasury_internal_accounts");

        // 2. treasury_netting_batches
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS treasury_netting_batches (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        batch_number VARCHAR(50) NOT NULL UNIQUE,
        settlement_date TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'DRAFT',
        total_payables NUMERIC(20, 2) DEFAULT '0',
        total_receivables NUMERIC(20, 2) DEFAULT '0',
        currency VARCHAR(3) DEFAULT 'USD',
        created_by VARCHAR,
        created_at TIMESTAMP DEFAULT now()
      );
    `);
        console.log("✅ Created table: treasury_netting_batches");

        // 3. treasury_netting_lines
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS treasury_netting_lines (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        batch_id VARCHAR NOT NULL, -- FK logic logic usually handled by app or future migration
        source_type VARCHAR(50) NOT NULL,
        source_id VARCHAR NOT NULL,
        entity_id VARCHAR NOT NULL,
        amount NUMERIC(20, 2) NOT NULL,
        original_currency VARCHAR(3),
        exchange_rate NUMERIC(10, 6) DEFAULT '1',
        base_amount NUMERIC(20, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING'
      );
    `);
        console.log("✅ Created table: treasury_netting_lines");

    } catch (error) {
        console.error("❌ Schema Patch Failed:", error);
        process.exit(1);
    }

    console.log("🎉 Treasury Phase 4 Patch Completed Successfully!");
    process.exit(0);
}

patchTreasuryPhase4();
