import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function runApPpmPatch() {
    console.log("🚀 Running AP-PPM Schema Patch...");

    const patchSql = `
        ALTER TABLE "ap_invoice_lines" 
        ADD COLUMN IF NOT EXISTS "ppm_project_id" varchar,
        ADD COLUMN IF NOT EXISTS "ppm_task_id" varchar,
        ADD COLUMN IF NOT EXISTS "ppm_exp_item_id" varchar;
    `;

    try {
        console.log(`   Executing SQL...`);
        await db.execute(sql.raw(patchSql));
        console.log("✅ AP-PPM Schema Patch applied successfully!");
        process.exit(0);
    } catch (error: any) {
        console.error("❌ Patch Failed:", error.message || error);
        process.exit(1);
    }
}

runApPpmPatch();
