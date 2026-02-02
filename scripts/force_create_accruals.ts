
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function forceCreate() {
    console.log("🛠️ Force Creating 'hrm_accrual_policy_rules'...");

    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS hrm_accrual_policy_rules (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            name varchar NOT NULL,
            leave_type varchar NOT NULL,
            min_tenure_months integer DEFAULT 0,
            accrual_rate_per_year integer NOT NULL,
            max_cap_days integer DEFAULT 20,
            status varchar DEFAULT 'ACTIVE',
            created_at timestamp DEFAULT now()
        );
    `);

    console.log("✅ Table Created (if not exists).");
    process.exit(0);
}

forceCreate().catch((err) => {
    console.error(err);
    process.exit(1);
});
