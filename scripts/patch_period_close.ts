
import { db } from "@db";
import { sql } from "drizzle-orm";

async function patchPeriodClose() {
    console.log("🛠️ Patching DB with sla_period_statuses...");

    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS sla_period_statuses (
            id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
            application_id varchar(100) NOT NULL,
            ledger_id varchar(100) NOT NULL,
            period_name varchar(100) NOT NULL,
            status varchar(20) DEFAULT 'Open',
            updated_at timestamp DEFAULT now()
        );
    `);

    console.log("✅ Table created.");
    process.exit(0);
}

patchPeriodClose().catch(console.error);
