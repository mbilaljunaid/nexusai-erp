
import 'dotenv/config';
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Starting GL Advanced Reporting Migration...");

    try {
        // Phase 3 Chunk 2: GL Reporting Tables
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS gl_ledger_sets (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar NOT NULL UNIQUE,
        description text,
        created_at timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS gl_ledger_set_assignments (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        ledger_set_id varchar NOT NULL,
        ledger_id varchar NOT NULL,
        created_at timestamp DEFAULT now()
      );
    `);

        console.log("✅ GL Reporting tables created successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

main();
