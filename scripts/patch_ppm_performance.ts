import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function runPerformancePatch() {
    console.log("🚀 Running PPM Performance (EVM) Schema Patch...");

    const patchSql = [
        // Table Updates
        `ALTER TABLE "ppm_projects" ADD COLUMN IF NOT EXISTS "budget" numeric(18, 2) DEFAULT 0.00;`,
        `ALTER TABLE "ppm_projects" ADD COLUMN IF NOT EXISTS "percent_complete" numeric(5, 2) DEFAULT 0.00;`,

        // New Table
        `CREATE TABLE IF NOT EXISTS "ppm_performance_snapshots" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "project_id" varchar NOT NULL,
            "snapshot_date" timestamp DEFAULT now(),
            "pv" numeric(18, 2) NOT NULL,
            "ac" numeric(18, 2) NOT NULL,
            "ev" numeric(18, 2) NOT NULL,
            "cpi" numeric(10, 4),
            "spi" numeric(10, 4),
            "etc" numeric(18, 2),
            "eac" numeric(18, 2),
            "created_at" timestamp DEFAULT now()
        );`
    ];

    try {
        for (const query of patchSql) {
            console.log(`   Executing Query...`);
            await db.execute(sql.raw(query));
        }
        console.log("✅ PPM Performance Schema Patch applied successfully!");
        process.exit(0);
    } catch (error: any) {
        console.error("❌ Patch Failed:", error.message || error);
        process.exit(1);
    }
}

runPerformancePatch();
