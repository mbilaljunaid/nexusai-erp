
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function bootstrapMaintenance() {
    console.log("🚀 Bootstrapping Maintenance Tables...");

    // 1. Parameters
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS maint_parameters (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            org_id varchar NOT NULL UNIQUE,
            enable_auto_wo_num boolean DEFAULT true,
            wo_prefix varchar(10) DEFAULT 'WO-',
            wo_starting_num integer DEFAULT 1000,
            default_work_def_id varchar,
            default_maint_org_id varchar,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
    `);
    console.log("✅ maint_parameters");

    // 2. Asset Extension
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS maint_assets_extension (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            asset_id varchar NOT NULL UNIQUE REFERENCES fa_assets(id),
            criticality varchar(20) DEFAULT 'NORMAL',
            maintainable boolean DEFAULT true,
            parent_asset_id varchar,
            location_id varchar,
            serial_number varchar,
            meter_id varchar,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
    `);
    console.log("✅ maint_assets_extension");

    // 3. Work Definitions
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS maint_work_definitions (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            name varchar(100) NOT NULL,
            description text,
            version integer DEFAULT 1,
            type varchar(30) DEFAULT 'STANDARD',
            status varchar(20) DEFAULT 'ACTIVE',
            asset_id varchar REFERENCES fa_assets(id),
            category_id varchar,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
    `);
    console.log("✅ maint_work_definitions");

    // 4. Work Definition Operations
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS maint_work_definition_ops (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            work_definition_id varchar NOT NULL REFERENCES maint_work_definitions(id),
            sequence integer NOT NULL,
            operation_code varchar(30),
            description text NOT NULL,
            labor_hours numeric(10, 2) DEFAULT 0,
            technician_count integer DEFAULT 1,
            created_at timestamp DEFAULT now()
        );
    `);
    console.log("✅ maint_work_definition_ops");

    // 5. Work Orders
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS maint_work_orders (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            work_order_number varchar(50) NOT NULL UNIQUE,
            description text NOT NULL,
            asset_id varchar NOT NULL REFERENCES fa_assets(id),
            work_definition_id varchar REFERENCES maint_work_definitions(id),
            status varchar(30) DEFAULT 'DRAFT',
            type varchar(30) DEFAULT 'CORRECTIVE',
            priority varchar(20) DEFAULT 'NORMAL',
            scheduled_start_date timestamp,
            scheduled_completion_date timestamp,
            actual_start_date timestamp,
            actual_completion_date timestamp,
            costed_flag boolean DEFAULT false,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
    `);
    console.log("✅ maint_work_orders");

    // 6. Work Order Operations
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS maint_work_order_operations (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            work_order_id varchar NOT NULL REFERENCES maint_work_orders(id),
            sequence integer NOT NULL,
            description text NOT NULL,
            status varchar(30) DEFAULT 'PENDING',
            actual_duration_hours numeric(10, 2),
            assigned_to_user_id varchar,
            completed_by_user_id varchar,
            completed_at timestamp,
            comments text,
            created_at timestamp DEFAULT now()
        );
    `);
    console.log("✅ maint_work_order_operations");

    // 7. Meters
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS maint_meters (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            name varchar NOT NULL,
            uom varchar(20) NOT NULL,
            asset_id varchar NOT NULL REFERENCES fa_assets(id),
            created_at timestamp DEFAULT now()
        );
    `);
    console.log("✅ maint_meters");

    // 8. Meter Readings
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS maint_meter_readings (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            meter_id varchar NOT NULL REFERENCES maint_meters(id),
            reading_date timestamp DEFAULT now(),
            reading_value numeric(20, 2) NOT NULL,
            delta_value numeric(20, 2),
            reported_by_user_id varchar,
            work_order_id varchar REFERENCES maint_work_orders(id),
            created_at timestamp DEFAULT now()
        );
    `);
    console.log("✅ maint_meter_readings");
}

bootstrapMaintenance()
    .then(() => {
        console.log("✨ Done!");
        process.exit(0);
    })
    .catch(e => {
        console.error("❌ Failed:", e);
        process.exit(1);
    });
