
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function createCloseTables() {
    console.log("Creating Period Close tables...");

    // 14.1 Templates
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "gl_period_close_checklist_templates" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "ledger_id" varchar NOT NULL,
                "task_name" varchar NOT NULL,
                "description" text,
                "is_required" boolean DEFAULT true,
                "sequence" integer DEFAULT 10,
                "created_at" timestamp DEFAULT now()
            );
        `);
        console.log("Created: gl_period_close_checklist_templates");
    } catch (e: any) {
        console.error("Error creating template table:", e.message);
    }

    // 14.2 Status
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "gl_period_close_status" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "ledger_id" varchar NOT NULL,
                "period_id" varchar NOT NULL,
                "total_tasks" integer DEFAULT 0,
                "completed_tasks" integer DEFAULT 0,
                "blocking_exceptions" integer DEFAULT 0,
                "last_updated" timestamp DEFAULT now()
            );
        `);
        console.log("Created: gl_period_close_status");
    } catch (e: any) {
        console.error("Error creating status table:", e.message);
    }

    process.exit(0);
}

createCloseTables();
