
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Applying Revenue Recognition schema patch...");

    try {
        // 20. Revenue Rules
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "gl_revenue_rules" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "description" text,
        "type" varchar DEFAULT 'Daily',
        "duration" integer,
        "recognition_start" varchar DEFAULT 'Start Date',
        "enabled" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now()
      );
    `);

        // 21. Revenue Schedules
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "gl_revenue_schedules" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "source_type" varchar NOT NULL,
        "source_id" varchar NOT NULL,
        "rule_id" varchar NOT NULL,
        "total_amount" numeric(18, 2) NOT NULL,
        "recognized_amount" numeric(18, 2) DEFAULT '0',
        "status" varchar DEFAULT 'Active',
        "start_date" timestamp,
        "end_date" timestamp,
        "created_at" timestamp DEFAULT now()
      );
    `);

        // 22. Revenue Schedule Lines
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "gl_revenue_schedule_lines" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "schedule_id" varchar NOT NULL,
        "period_name" varchar NOT NULL,
        "amount" numeric(18, 2) NOT NULL,
        "status" varchar DEFAULT 'Pending',
        "journal_id" varchar,
        "posting_date" timestamp,
        "created_at" timestamp DEFAULT now()
      );
    `);

        // Seed Default Rules
        await db.execute(sql`
      INSERT INTO "gl_revenue_rules" ("name", "description", "type", "duration")
      SELECT 'Immediate', 'Recognize immediately upon invoicing', 'Immediate', 0
      WHERE NOT EXISTS (SELECT 1 FROM "gl_revenue_rules" WHERE "name" = 'Immediate');

      INSERT INTO "gl_revenue_rules" ("name", "description", "type", "duration")
      SELECT 'Ratablc Daily', 'Recognize daily over the service period', 'Daily', 12
      WHERE NOT EXISTS (SELECT 1 FROM "gl_revenue_rules" WHERE "name" = 'Ratable Daily');
    `);

        console.log("✅ Revenue Recognition Schema applied successfully!");
    } catch (error) {
        console.error("❌ Schema patch failed:", error);
        process.exit(1);
    }

    process.exit(0);
}

main();
