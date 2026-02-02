
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function resetTable() {
    console.log("Dropping gl_auto_post_rules...");
    await db.execute(sql`DROP TABLE IF EXISTS gl_auto_post_rules CASCADE`);
    console.log("Creating gl_auto_post_rules...");
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "gl_auto_post_rules" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "criteria_name" text NOT NULL,
            "ledger_id" varchar NOT NULL,
            "source" varchar,
            "category" varchar,
            "amount_limit" numeric(18, 2),
            "effective_date_from" timestamp,
            "enabled" boolean DEFAULT true,
            "created_at" timestamp DEFAULT now()
        );
    `);
    console.log("Table reset complete.");
    process.exit(0);
}

resetTable();
