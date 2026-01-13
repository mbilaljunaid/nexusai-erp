import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function runBurdeningPatch() {
    console.log("🚀 Running PPM Burdening Schema Patch...");

    const patchSql = [
        // New Tables
        `CREATE TABLE IF NOT EXISTS "ppm_burden_schedules" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "name" varchar NOT NULL UNIQUE,
            "description" text,
            "version" varchar DEFAULT '1.0',
            "active_flag" boolean DEFAULT true,
            "created_at" timestamp DEFAULT now()
        );`,
        `CREATE TABLE IF NOT EXISTS "ppm_burden_rules" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "schedule_id" varchar NOT NULL,
            "expenditure_type_id" varchar NOT NULL,
            "multiplier" numeric(18, 4) NOT NULL,
            "precedence" integer DEFAULT 1,
            "description" text,
            "created_at" timestamp DEFAULT now()
        );`,
        // Field Updates
        `ALTER TABLE "ppm_projects" ADD COLUMN IF NOT EXISTS "burden_schedule_id" varchar;`,
        `ALTER TABLE "ppm_tasks" ADD COLUMN IF NOT EXISTS "burden_schedule_id" varchar;`
    ];

    try {
        for (const query of patchSql) {
            console.log(`   Executing Query...`);
            await db.execute(sql.raw(query));
        }
        console.log("✅ PPM Burdening Schema Patch applied successfully!");
        process.exit(0);
    } catch (error: any) {
        console.error("❌ Patch Failed:", error.message || error);
        process.exit(1);
    }
}

runBurdeningPatch();
