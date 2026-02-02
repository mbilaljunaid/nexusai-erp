
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patchArColumns() {
    console.log("🛠️ Patching AR Schema Columns...");

    // array of columns to check/add for ar_invoices
    // We use explicit individual ALTER statements to be safe

    const cmds = [
        "ALTER TABLE ar_invoices ADD COLUMN IF NOT EXISTS gl_status varchar DEFAULT 'Pending'",
        "ALTER TABLE ar_invoices ADD COLUMN IF NOT EXISTS recognition_status varchar DEFAULT 'Pending'",
        "ALTER TABLE ar_invoices ADD COLUMN IF NOT EXISTS revenue_rule_id varchar",
        "ALTER TABLE ar_invoices ADD COLUMN IF NOT EXISTS revenue_schedule_id varchar",
        "ALTER TABLE ar_invoices ADD COLUMN IF NOT EXISTS gl_account_id varchar",
        "ALTER TABLE ar_invoices ADD COLUMN IF NOT EXISTS gl_date timestamp",
        "ALTER TABLE ar_invoices ADD COLUMN IF NOT EXISTS gl_posted_date timestamp",
        "ALTER TABLE ar_invoices ADD COLUMN IF NOT EXISTS transaction_class varchar DEFAULT 'INV'",
        "ALTER TABLE ar_invoices ADD COLUMN IF NOT EXISTS source_transaction_id varchar",
        "ALTER TABLE ar_invoice_lines ADD COLUMN IF NOT EXISTS billing_event_id varchar"
    ];

    for (const cmd of cmds) {
        try {
            await db.execute(sql.raw(cmd));
            console.log(`   ✅ Executed: ${cmd}`);
        } catch (e: any) {
            console.log(`   ⚠️ Failed: ${cmd} - ${e.message}`);
        }
    }

    console.log("✅ AR Patch Completed.");
    process.exit(0);
}

patchArColumns().catch(err => {
    console.error("Patch Failed:", err);
    process.exit(1);
});
