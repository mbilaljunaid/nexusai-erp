
import { db } from "@db";
import { sql } from "drizzle-orm";

async function patchPeriodCloseConstraint() {
    console.log("🛠️ Adding unique constraint to sla_period_statuses...");

    // Unique constraint on (ledger_id, period_name, application_id)
    await db.execute(sql`
        ALTER TABLE sla_period_statuses 
        ADD CONSTRAINT sla_period_statuses_unique 
        UNIQUE (ledger_id, period_name, application_id);
    `);

    console.log("✅ Unique Constraint added.");
    process.exit(0);
}

patchPeriodCloseConstraint().catch(console.error);
