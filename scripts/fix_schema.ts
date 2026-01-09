
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function fixSchema() {
    console.log("🛠 Fixing Database Schema...");

    // 1. Add auto_reverse to gl_journals
    try {
        await db.execute(sql`
            ALTER TABLE "gl_journals_v2" 
            ADD COLUMN IF NOT EXISTS "auto_reverse" boolean DEFAULT false;
        `);
        console.log("✅ Added auto_reverse column");
    } catch (e: any) {
        console.error("⚠️ Failed to add auto_reverse:", e.message);
    }

    // 2. Create gl_recurring_journals table
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "gl_recurring_journals" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "name" varchar NOT NULL,
                "description" text,
                "ledger_id" varchar NOT NULL,
                "currency_code" varchar DEFAULT 'USD',
                "schedule_type" varchar NOT NULL,
                "next_run_date" timestamp NOT NULL,
                "last_run_date" timestamp,
                "status" varchar DEFAULT 'Active',
                "journal_template" jsonb NOT NULL,
                "created_at" timestamp DEFAULT now()
            );
        `);
        console.log("✅ Created gl_recurring_journals table");
    } catch (e: any) {
        console.error("⚠️ Failed to create gl_recurring_journals:", e.message);
    }

    process.exit(0);
}

fixSchema();
