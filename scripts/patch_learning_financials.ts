
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patchLearningFinancials() {
    console.log("🛠️  Patching Learning Financials Schema...");

    // ADD PRICE & CURRENCY TO OFFERINGS
    await db.execute(sql`
        ALTER TABLE hrm_learning_offerings 
        ADD COLUMN IF NOT EXISTS price numeric DEFAULT 0,
        ADD COLUMN IF NOT EXISTS currency varchar DEFAULT 'USD';
    `);
    console.log("- Added price/currency to hrm_learning_offerings");

    console.log("✅ Learning Financials Schema Patched Successfully.");
    process.exit(0);
}

patchLearningFinancials().catch((err) => {
    console.error("❌ Patch Error:", err);
    process.exit(1);
});
