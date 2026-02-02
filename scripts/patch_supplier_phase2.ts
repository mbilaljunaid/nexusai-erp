import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("🚀 Applying Supplier Portal Phase 2 Schema Patches...");

    try {
        // 1. Create procurement_contracts
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS procurement_contracts (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        supplier_id VARCHAR NOT NULL,
        contract_number VARCHAR NOT NULL UNIQUE,
        title VARCHAR NOT NULL,
        status VARCHAR DEFAULT 'DRAFT',
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        total_amount_limit NUMERIC(18, 2),
        payment_terms VARCHAR,
        created_at TIMESTAMP DEFAULT now()
      );
    `);
        console.log("✅ Created procurement_contracts table");

        // 2. Create contract_clauses
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS contract_clauses (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR NOT NULL,
        clause_text TEXT NOT NULL,
        category VARCHAR NOT NULL,
        is_mandatory VARCHAR DEFAULT 'false',
        created_at TIMESTAMP DEFAULT now()
      );
    `);
        console.log("✅ Created contract_clauses table");

        // 3. Create contract_terms
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS contract_terms (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        contract_id VARCHAR NOT NULL REFERENCES procurement_contracts(id),
        clause_id VARCHAR NOT NULL REFERENCES contract_clauses(id),
        amended_text TEXT,
        created_at TIMESTAMP DEFAULT now()
      );
    `);
        console.log("✅ Created contract_terms table");

        console.log("🎉 Supplier Portal Phase 2 Schema Patches Applied Successfully!");
    } catch (error) {
        console.error("❌ Error applying schema patches:", error);
        process.exit(1);
    }
}

main();
