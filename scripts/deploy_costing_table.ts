
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function deploy() {
    console.log("Creating cst_transactions table...");
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS cst_transactions (
            id text PRIMARY KEY DEFAULT gen_random_uuid(),
            transaction_type text NOT NULL,
            item_id text NOT NULL,
            quantity numeric(16, 4) NOT NULL,
            unit_cost numeric(16, 4) DEFAULT '0',
            total_cost numeric(16, 2) DEFAULT '0',
            source_type text,
            source_id text,
            source_line_id text,
            org_id text NOT NULL,
            transaction_date timestamp DEFAULT now(),
            gl_status text DEFAULT 'PENDING'
        );
    `);
    console.log("Done.");
    process.exit(0);
}

deploy();
