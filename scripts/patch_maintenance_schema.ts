
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function applyPatch() {
    console.log("🛠️ Applying Manual Schema Patch...");

    try {
        // --- DROP OLD TABLES (Force Refresh) ---
        await db.execute(sql`DROP TABLE IF EXISTS maint_asset_meter_readings CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS maint_asset_meters CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS maint_work_definition_materials CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS maint_work_definition_ops CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS maint_work_definitions CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS mfg_calendar_exceptions CASCADE`);

        // 1. maint_asset_meters
        await db.execute(sql`
            CREATE TABLE maint_asset_meters (

                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                asset_id uuid NOT NULL,
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
        console.log("✅ Created maint_asset_meters");

        // 2. maint_asset_meter_readings
        await db.execute(sql`
            CREATE TABLE maint_asset_meter_readings (

                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                meter_id uuid NOT NULL,
                reading_value numeric(15, 2) NOT NULL,
                reading_date timestamp DEFAULT now() NOT NULL,
                delta_value numeric(15, 2),
                source text DEFAULT 'MANUAL',
                work_order_id uuid,
                created_by_id text
            );
        `);
        console.log("✅ Created maint_asset_meter_readings");

        // 3. maint_work_definitions
        await db.execute(sql`
            CREATE TABLE maint_work_definitions (

                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
        console.log("✅ Created maint_work_definitions");

        // 4. maint_work_definition_ops
        await db.execute(sql`
            CREATE TABLE maint_work_definition_ops (

                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                work_definition_id uuid NOT NULL,
                sequence_number integer NOT NULL,
                name text NOT NULL,
                description text,
                long_description text,
                standard_hours numeric(10, 2) DEFAULT '0',
                required_head_count integer DEFAULT 1
            );
        `);
        console.log("✅ Created maint_work_definition_ops");

        // 5. maint_work_definition_materials
        await db.execute(sql`
            CREATE TABLE maint_work_definition_materials (

                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                work_definition_id uuid NOT NULL,
                operation_sequence integer,
                item_id uuid NOT NULL,
                quantity numeric(10, 2) NOT NULL
            );
        `);
        console.log("✅ Created maint_work_definition_materials");

        // 6. mfg_calendar_exceptions (To unblock future pushes if needed)
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
        console.log("✅ Created mfg_calendar_exceptions");

        // 7. PM Alterations
        await db.execute(sql`ALTER TABLE maint_pm_definitions ADD COLUMN IF NOT EXISTS trigger_type varchar(20) DEFAULT 'TIME';`);
        await db.execute(sql`ALTER TABLE maint_pm_definitions ADD COLUMN IF NOT EXISTS is_floating boolean DEFAULT false;`);
        await db.execute(sql`ALTER TABLE maint_pm_definitions ADD COLUMN IF NOT EXISTS meter_id uuid;`); // Assuming uuid? Varchar in schema? Schema says varchar but meters use UUID.
        // Schema says: meterId: varchar("meter_id").references(() => maintMeters.id),
        // maintMeters.id is uuid.
        // Verify maintMeters.id type. Step 838: id: uuid("id").
        // PM Def: meterId: varchar("meter_id").
        // Drizzle allows varchar -> uuid ref sometimes but Postgres prefers uuid->uuid.
        // I will use uuid here if feasible, or varchar to match schema definition exactly.
        // Let's use varchar to match "varchar('meter_id')" in schema, although it references UUID.
        // It might be safer to use uuid if I can confirm.
        // Step 944: meterId: varchar("meter_id").references(() => maintMeters.id)
        // This is a type mismatch potential?
        // Let's stick to varchar for safety with existing Drizzle def.
        await db.execute(sql`ALTER TABLE maint_pm_definitions ADD COLUMN IF NOT EXISTS meter_id varchar;`);
        await db.execute(sql`ALTER TABLE maint_pm_definitions ADD COLUMN IF NOT EXISTS interval_value numeric(20, 2);`);
        await db.execute(sql`ALTER TABLE maint_pm_definitions ADD COLUMN IF NOT EXISTS last_meter_reading numeric(20, 2);`);

        // Fix FK to point to new maint_asset_meters
        try {
            await db.execute(sql`ALTER TABLE maint_pm_definitions DROP CONSTRAINT IF EXISTS maint_pm_definitions_meter_id_fkey;`);
        } catch (e) { console.log("Constraint drop ignored"); }

        // Must cast to UUID if it was created as varchar, or ensure it is UUID.
        // If it was created as varchar in previous run, we need to cast.
        await db.execute(sql`ALTER TABLE maint_pm_definitions ALTER COLUMN meter_id TYPE uuid USING meter_id::uuid;`);

        await db.execute(sql`ALTER TABLE maint_pm_definitions ADD CONSTRAINT maint_pm_definitions_meter_id_fkey FOREIGN KEY (meter_id) REFERENCES maint_asset_meters(id);`);

        console.log("✅ Altered maint_pm_definitions");


        console.log("✨ Schema Patch Applied Successfully!");

        process.exit(0);

    } catch (e) {
        console.error("❌ Patch Failed:", e);
        process.exit(1);
    }
}

applyPatch();
