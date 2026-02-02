
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patchPpmMasterData() {
    console.log("Applying Schema Patch: PPM Master Data (Templates & Bill Rates)...");

    try {
        // 1. Create Project Templates Table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS ppm_project_templates (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR NOT NULL UNIQUE,
                description TEXT,
                project_type VARCHAR NOT NULL,
                default_burden_schedule_id VARCHAR,
                active_flag BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log("   ✅ Created table: ppm_project_templates");

        // 2. Create Bill Rate Schedules Table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS ppm_bill_rate_schedules (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR NOT NULL UNIQUE,
                currency_code VARCHAR DEFAULT 'USD',
                description TEXT,
                active_flag BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log("   ✅ Created table: ppm_bill_rate_schedules");

        // 3. Create Bill Rates Table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS ppm_bill_rates (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                schedule_id VARCHAR NOT NULL,
                person_id VARCHAR,
                job_title VARCHAR,
                expenditure_type_id VARCHAR,
                rate NUMERIC(18, 2) NOT NULL,
                start_date TIMESTAMP DEFAULT NOW(),
                end_date TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log("   ✅ Created table: ppm_bill_rates");

    } catch (error) {
        console.error("Patch Failed:", error);
    }
}

patchPpmMasterData();
