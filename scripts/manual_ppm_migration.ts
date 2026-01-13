import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function runPpmMigration() {
    console.log("🚀 Running Manual PPM Migration...");

    const tables = [
        `CREATE TABLE IF NOT EXISTS "ppm_projects" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "project_number" varchar NOT NULL UNIQUE,
            "name" varchar NOT NULL,
            "description" text,
            "project_type" varchar NOT NULL,
            "organization_id" varchar,
            "currency_code" varchar DEFAULT 'USD' NOT NULL,
            "start_date" timestamp NOT NULL,
            "end_date" timestamp,
            "status" varchar DEFAULT 'DRAFT',
            "created_at" timestamp DEFAULT now()
        )`,
        `CREATE TABLE IF NOT EXISTS "ppm_tasks" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "project_id" varchar NOT NULL,
            "parent_task_id" varchar,
            "task_number" varchar NOT NULL,
            "name" varchar NOT NULL,
            "description" text,
            "billable_flag" boolean DEFAULT false,
            "chargeable_flag" boolean DEFAULT true,
            "capitalizable_flag" boolean DEFAULT false,
            "start_date" timestamp NOT NULL,
            "end_date" timestamp,
            "created_at" timestamp DEFAULT now()
        )`,
        `CREATE TABLE IF NOT EXISTS "ppm_expenditure_types" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "name" varchar NOT NULL UNIQUE,
            "uom" varchar NOT NULL,
            "description" text,
            "created_at" timestamp DEFAULT now()
        )`,
        `CREATE TABLE IF NOT EXISTS "ppm_expenditure_items" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "task_id" varchar NOT NULL,
            "expenditure_type_id" varchar NOT NULL,
            "exp_item_date" timestamp NOT NULL,
            "quantity" numeric(18, 2) NOT NULL,
            "unit_cost" numeric(18, 4),
            "raw_cost" numeric(18, 4) NOT NULL,
            "burdened_cost" numeric(18, 4),
            "status" varchar DEFAULT 'UNCOSTED',
            "transaction_source" varchar NOT NULL,
            "transaction_reference" varchar,
            "denom_currency_code" varchar DEFAULT 'USD' NOT NULL,
            "denom_raw_cost" numeric(18, 4),
            "created_at" timestamp DEFAULT now()
        )`,
        `CREATE TABLE IF NOT EXISTS "ppm_cost_distributions" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "expenditure_item_id" varchar NOT NULL,
            "dr_ccid" varchar NOT NULL,
            "cr_ccid" varchar NOT NULL,
            "amount" numeric(18, 2) NOT NULL,
            "accounting_period_id" varchar,
            "gl_journal_id" varchar,
            "status" varchar DEFAULT 'DRAFT',
            "line_type" varchar DEFAULT 'RAW',
            "created_at" timestamp DEFAULT now()
        )`
    ];

    try {
        for (const tableSql of tables) {
            console.log(`   Executing SQL...`);
            await db.execute(sql.raw(tableSql));
        }
        console.log("✅ PPM Tables Created Successfully!");
        process.exit(0);
    } catch (error: any) {
        console.error("❌ Migration Failed:", error.message || error);
        process.exit(1);
    }
}

runPpmMigration();
