
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patchPpmPlanning() {
    console.log("🛠️ Patching PPM Planning Schema...");

    // 1. Create ppm_control_rules
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ppm_control_rules (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id varchar NOT NULL,
            control_level varchar DEFAULT 'PROJECT',
            control_type varchar DEFAULT 'ADVISORY',
            tolerance_percentage numeric(5, 2) DEFAULT 0,
            description text,
            active_flag boolean DEFAULT true,
            created_at timestamp DEFAULT now()
        );
    `);
    console.log("   ✅ Table `ppm_control_rules` checked/created.");

    // 2. Create ppm_budget_versions
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ppm_budget_versions (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id varchar NOT NULL,
            version_name varchar NOT NULL,
            version_type varchar DEFAULT 'Liabilities',
            status varchar DEFAULT 'DRAFT',
            current_flag boolean DEFAULT false,
            baseline_date timestamp,
            description text,
            created_at timestamp DEFAULT now()
        );
    `);
    console.log("   ✅ Table `ppm_budget_versions` checked/created.");

    // 3. Create ppm_budget_lines
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ppm_budget_lines (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            version_id varchar NOT NULL,
            task_id varchar,
            period_name varchar,
            resource_id varchar,
            currency_code varchar DEFAULT 'USD',
            amount numeric(18, 2) NOT NULL,
            quantity numeric(18, 2),
            created_at timestamp DEFAULT now()
        );
    `);
    console.log("   ✅ Table `ppm_budget_lines` checked/created.");

    console.log("✅ Planning Patch Completed.");
    process.exit(0);
}

patchPpmPlanning().catch(err => {
    console.error("Patch Failed:", err);
    process.exit(1);
});
