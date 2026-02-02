import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function applyConstructionSchema() {
    console.log("🏗️  Applying Construction Schema Manually...");

    try {
        // 1. Contracts
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS construction_contracts (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                project_id varchar NOT NULL,
                contract_number varchar NOT NULL UNIQUE,
                vendor_id varchar,
                type varchar DEFAULT 'PRIME',
                status varchar DEFAULT 'DRAFT',
                subject varchar NOT NULL,
                description text,
                awarded_date timestamp,
                start_date timestamp,
                completion_date timestamp,
                original_amount numeric(18, 2) DEFAULT '0.00',
                revised_amount numeric(18, 2) DEFAULT '0.00',
                retention_percentage numeric(5, 2) DEFAULT '10.00',
                created_at timestamp DEFAULT now(),
                updated_at timestamp DEFAULT now()
            );
        `);
        console.log("   - construction_contracts created.");

        // 2. Contract Lines (SOV)
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS construction_contract_lines (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                contract_id varchar NOT NULL,
                line_number integer NOT NULL,
                task_id varchar,
                description varchar NOT NULL,
                uom varchar DEFAULT 'LS',
                quantity numeric(18, 4) DEFAULT '1',
                unit_rate numeric(18, 2) DEFAULT '0.00',
                scheduled_value numeric(18, 2) NOT NULL,
                status varchar DEFAULT 'APPROVED',
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("   - construction_contract_lines created.");

        // 3. Variations
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS construction_variations (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                contract_id varchar NOT NULL,
                variation_number varchar NOT NULL,
                title varchar NOT NULL,
                description text,
                type varchar DEFAULT 'PCO',
                status varchar DEFAULT 'DRAFT',
                amount numeric(18, 2) DEFAULT '0.00',
                schedule_impact_days integer DEFAULT 0,
                approved_date timestamp,
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("   - construction_variations created.");

        // 4. Pay Apps
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS construction_pay_apps (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                contract_id varchar NOT NULL,
                application_number integer NOT NULL,
                period_start timestamp NOT NULL,
                period_end timestamp NOT NULL,
                status varchar DEFAULT 'DRAFT',
                total_completed numeric(18, 2) DEFAULT '0.00',
                retention_amount numeric(18, 2) DEFAULT '0.00',
                previous_payments numeric(18, 2) DEFAULT '0.00',
                current_payment_due numeric(18, 2) DEFAULT '0.00',
                certified_by varchar,
                certified_date timestamp,
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("   - construction_pay_apps created.");

        // 5. Pay App Lines
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS construction_pay_app_lines (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                pay_app_id varchar NOT NULL,
                contract_line_id varchar NOT NULL,
                work_completed_this_period numeric(18, 2) DEFAULT '0.00',
                materials_stored numeric(18, 2) DEFAULT '0.00',
                total_completed_to_date numeric(18, 2) DEFAULT '0.00',
                percentage_complete numeric(5, 2) DEFAULT '0.00',
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("   - construction_pay_app_lines created.");

        console.log("✅ Schema Applied Successfully.");
        process.exit(0);

    } catch (error) {
        console.error("❌ Schema Application Failed:", error);
        process.exit(1);
    }
}

applyConstructionSchema();
