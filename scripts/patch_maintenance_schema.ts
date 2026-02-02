
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function applyPatch() {
    console.log("🛠️ Applying Manual Schema Patch (Direct Procurement)...");

    try {
        // --- DROP OLD TABLES (Force Refresh) ---
        await db.execute(sql`DROP TABLE IF EXISTS maint_work_order_costs CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS maint_asset_meter_readings CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS maint_asset_meters CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS maint_work_definition_materials CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS maint_work_definition_ops CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS maint_work_definitions CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS mfg_calendar_exceptions CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS maint_failure_codes CASCADE`);

        // SCM PRs
        await db.execute(sql`DROP TABLE IF EXISTS purchase_requisition_lines CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS purchase_requisitions CASCADE`);

        // 1. maint_asset_meters
        await db.execute(sql`
            CREATE TABLE maint_asset_meters (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                asset_id varchar NOT NULL,
                name text NOT NULL,
                description text,
                unit_of_measure text NOT NULL,
                reading_type text DEFAULT 'ABSOLUTE',
                current_value numeric(15, 2) DEFAULT '0',
                last_reading_date timestamp,
                is_active boolean DEFAULT true,
                created_at timestamp DEFAULT now(),
                updated_at timestamp DEFAULT now()
            );
        `);

        // 2. maint_asset_meter_readings
        await db.execute(sql`
            CREATE TABLE maint_asset_meter_readings (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                meter_id varchar NOT NULL,
                reading_value numeric(15, 2) NOT NULL,
                reading_date timestamp DEFAULT now() NOT NULL,
                delta_value numeric(15, 2),
                source text DEFAULT 'MANUAL',
                work_order_id varchar,
                created_by_id text
            );
        `);

        // 3. maint_work_definitions
        await db.execute(sql`
            CREATE TABLE maint_work_definitions (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                code text NOT NULL,
                name text NOT NULL,
                description text,
                type text DEFAULT 'STANDARD',
                status text DEFAULT 'ACTIVE',
                version integer DEFAULT 1,
                created_at timestamp DEFAULT now(),
                updated_at timestamp DEFAULT now()
            );
        `);

        // 4. maint_work_definition_ops
        await db.execute(sql`
            CREATE TABLE maint_work_definition_ops (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                work_definition_id varchar NOT NULL,
                sequence_number integer NOT NULL,
                name text NOT NULL,
                description text,
                long_description text,
                standard_hours numeric(10, 2) DEFAULT '0',
                required_head_count integer DEFAULT 1
            );
        `);

        // 5. maint_work_definition_materials
        await db.execute(sql`
            CREATE TABLE maint_work_definition_materials (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                work_definition_id varchar NOT NULL,
                operation_sequence integer,
                item_id varchar NOT NULL,
                quantity numeric(10, 2) NOT NULL
            );
        `);

        // 6. maint_work_order_costs
        await db.execute(sql`
            CREATE TABLE maint_work_order_costs (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                work_order_id varchar NOT NULL REFERENCES maint_work_orders(id),
                cost_type varchar(30) NOT NULL,
                description text,
                quantity numeric,
                unit_cost numeric,
                total_cost numeric NOT NULL,
                currency varchar(3) DEFAULT 'USD',
                source_reference varchar,
                gl_status varchar(20) DEFAULT 'PENDING',
                date timestamp DEFAULT now(),
                created_at timestamp DEFAULT now()
            );
        `);

        // 7. mfg_calendar_exceptions
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS mfg_calendar_exceptions (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                calendar_id varchar NOT NULL,
                exception_date timestamp NOT NULL,
                exception_type varchar NOT NULL,
                description varchar,
                created_at timestamp DEFAULT now()
            );
        `);

        // 8. maint_failure_codes
        await db.execute(sql`
            CREATE TABLE maint_failure_codes (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                code varchar(50) NOT NULL UNIQUE,
                name varchar(150) NOT NULL,
                description text,
                type varchar(20) NOT NULL,
                parent_id varchar,
                active varchar(1) DEFAULT 'Y',
                created_at timestamp DEFAULT now()
            );
        `);

        // 11. purchase_requisitions
        await db.execute(sql`
            CREATE TABLE purchase_requisitions (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                requisition_number varchar NOT NULL UNIQUE,
                requester_id varchar,
                description text,
                status varchar DEFAULT 'draft',
                source_module varchar DEFAULT 'SCM',
                source_id varchar,
                created_at timestamp DEFAULT now()
            );
        `);

        // 12. purchase_requisition_lines
        await db.execute(sql`
            CREATE TABLE purchase_requisition_lines (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                requisition_id varchar NOT NULL REFERENCES purchase_requisitions(id),
                line_number integer NOT NULL,
                item_id varchar,
                item_description text NOT NULL,
                quantity numeric(18, 4) NOT NULL,
                unit_of_measure varchar,
                estimated_price numeric(18, 4),
                status varchar DEFAULT 'PENDING',
                need_by_date timestamp,
                created_at timestamp DEFAULT now()
            );
        `);

        // 9. Work Order Alterations
        await db.execute(sql`ALTER TABLE maint_work_orders ADD COLUMN IF NOT EXISTS failure_problem_id varchar;`);
        await db.execute(sql`ALTER TABLE maint_work_orders ADD COLUMN IF NOT EXISTS failure_cause_id varchar;`);
        await db.execute(sql`ALTER TABLE maint_work_orders ADD COLUMN IF NOT EXISTS failure_remedy_id varchar;`);

        await db.execute(sql`ALTER TABLE maint_work_order_materials ADD COLUMN IF NOT EXISTS pr_line_id varchar;`);

        // 10. PM Alterations
        await db.execute(sql`ALTER TABLE maint_pm_definitions ADD COLUMN IF NOT EXISTS trigger_type varchar(20) DEFAULT 'TIME';`);
        await db.execute(sql`ALTER TABLE maint_pm_definitions ADD COLUMN IF NOT EXISTS is_floating boolean DEFAULT false;`);
        await db.execute(sql`ALTER TABLE maint_pm_definitions ADD COLUMN IF NOT EXISTS meter_id varchar;`);
        await db.execute(sql`ALTER TABLE maint_pm_definitions ADD COLUMN IF NOT EXISTS interval_value numeric(20, 2);`);
        await db.execute(sql`ALTER TABLE maint_pm_definitions ADD COLUMN IF NOT EXISTS last_meter_reading numeric(20, 2);`);

        // Fix FK to point to new maint_asset_meters
        try {
            await db.execute(sql`ALTER TABLE maint_pm_definitions DROP CONSTRAINT IF EXISTS maint_pm_definitions_meter_id_fkey;`);
        } catch (e) { }

        await db.execute(sql`ALTER TABLE maint_pm_definitions ALTER COLUMN meter_id TYPE varchar USING meter_id::text;`);
        await db.execute(sql`UPDATE maint_pm_definitions SET meter_id = NULL;`);
        await db.execute(sql`ALTER TABLE maint_pm_definitions ADD CONSTRAINT maint_pm_definitions_meter_id_fkey FOREIGN KEY (meter_id) REFERENCES maint_asset_meters(id);`);

        console.log("✨ Final Schema Patch Applied Successfully!");
        process.exit(0);

    } catch (e) {
        console.error("❌ Patch Failed:", e);
        process.exit(1);
    }
}

applyPatch();
