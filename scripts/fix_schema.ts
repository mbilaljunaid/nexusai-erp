
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function fixSchema() {
    console.log("🛠️ Starting Manual Schema Fix...");

    try {
        // 1. Add ledger_id to gl_periods
        console.log("🔧 Adding ledger_id to gl_periods...");
        await db.execute(sql`
            ALTER TABLE gl_periods 
            ADD COLUMN IF NOT EXISTS ledger_id VARCHAR DEFAULT 'PRIMARY';
        `);

        // 2. Create gl_legal_entities
        console.log("🔧 Creating gl_legal_entities...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS gl_legal_entities (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR NOT NULL UNIQUE,
                tax_id VARCHAR,
                ledger_id VARCHAR NOT NULL,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        // 3. Create gl_ledger_relationships
        console.log("🔧 Creating gl_ledger_relationships...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS gl_ledger_relationships (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                primary_ledger_id VARCHAR NOT NULL,
                secondary_ledger_id VARCHAR NOT NULL,
                relationship_type VARCHAR NOT NULL, -- SECONDARY, REPORTING
                conversion_level VARCHAR DEFAULT 'JOURNAL', -- JOURNAL, SUBLEDGER, BALANCE
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        // 4. Create gl_ledgers_v2 if needed (it was added in schema)
        console.log("🔧 Creating gl_ledgers_v2...");
        await db.execute(sql`
           CREATE TABLE IF NOT EXISTS gl_ledgers_v2 (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR NOT NULL UNIQUE,
                currency_code VARCHAR NOT NULL DEFAULT 'USD',
                calendar_id VARCHAR,
                coa_id VARCHAR,
                description TEXT,
                ledger_category VARCHAR DEFAULT 'PRIMARY',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT now()
           );
        `);

        console.log("✅ Schema Fix Applied Successfully!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Schema Fix Failed:", error);
        process.exit(1);
    }
}

fixSchema();
