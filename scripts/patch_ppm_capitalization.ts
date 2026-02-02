import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function runCapitalizationPatch() {
    console.log("🚀 Running PPM Capitalization Schema Patch...");

    const patchSql = [
        // New Tables
        `CREATE TABLE IF NOT EXISTS "ppm_project_assets" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "project_id" varchar NOT NULL,
            "asset_name" varchar NOT NULL,
            "asset_description" text,
            "asset_number" varchar,
            "status" varchar DEFAULT 'DRAFT',
            "fa_asset_id" varchar,
            "asset_type" varchar DEFAULT 'EQUIPMENT',
            "created_at" timestamp DEFAULT now()
        );`,
        `CREATE TABLE IF NOT EXISTS "ppm_asset_lines" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "project_asset_id" varchar NOT NULL,
            "expenditure_item_id" varchar UNIQUE NOT NULL,
            "capitalized_amount" numeric(18, 2) NOT NULL,
            "status" varchar DEFAULT 'NEW',
            "created_at" timestamp DEFAULT now()
        );`,
        // Field Updates
        `ALTER TABLE "ppm_expenditure_items" ADD COLUMN IF NOT EXISTS "cap_status" varchar DEFAULT 'NOT_APPLICABLE';`
    ];

    try {
        for (const query of patchSql) {
            console.log(`   Executing Query...`);
            await db.execute(sql.raw(query));
        }
        console.log("✅ PPM Capitalization Schema Patch applied successfully!");
        process.exit(0);
    } catch (error: any) {
        console.error("❌ Patch Failed:", error.message || error);
        process.exit(1);
    }
}

runCapitalizationPatch();
