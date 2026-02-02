
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function applyPatch() {
    console.log("Applying schema patch for gl_ledger_controls...");

    // Add columns if not exist
    const queries = [
        `ALTER TABLE "gl_ledger_controls" ADD COLUMN IF NOT EXISTS "enforce_period_close" boolean DEFAULT true;`,
        `ALTER TABLE "gl_ledger_controls" ADD COLUMN IF NOT EXISTS "prevent_future_entry" boolean DEFAULT false;`,
        `ALTER TABLE "gl_ledger_controls" ADD COLUMN IF NOT EXISTS "allow_prior_period_entry" boolean DEFAULT true;`,
        `ALTER TABLE "gl_ledger_controls" ADD COLUMN IF NOT EXISTS "approval_limit" numeric(18, 2);`,
        `ALTER TABLE "gl_ledger_controls" ADD COLUMN IF NOT EXISTS "enforce_cvr" boolean DEFAULT true;`
    ];

    for (const q of queries) {
        try {
            await db.execute(sql.raw(q));
            console.log("Executed: " + q);
        } catch (e: any) {
            console.log("Error executing: " + q + " - " + e.message);
        }
    }

    console.log("Patch complete.");
    process.exit(0);
}

applyPatch();
