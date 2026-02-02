
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function createTable() {
    console.log("Creating gl_ledger_controls table...");
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "gl_ledger_controls" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "ledger_id" varchar NOT NULL UNIQUE,
                "enable_suspense" boolean DEFAULT false,
                "suspense_ccid" varchar,
                "rounding_ccid" varchar,
                "threshold_amount" numeric(18, 2) DEFAULT '0',
                "auto_post_journals" boolean DEFAULT false,
                "auto_reverse_journals" boolean DEFAULT false,
                "enforce_period_close" boolean DEFAULT true,
                "prevent_future_entry" boolean DEFAULT false,
                "allow_prior_period_entry" boolean DEFAULT true,
                "approval_limit" numeric(18, 2),
                "enforce_cvr" boolean DEFAULT true,
                "updated_at" timestamp DEFAULT now()
            );
        `);
        console.log("Table created.");
    } catch (e: any) {
        console.error("Error creating table:", e.message);
    }
    process.exit(0);
}

createTable();
