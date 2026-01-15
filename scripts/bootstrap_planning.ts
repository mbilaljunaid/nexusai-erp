
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("🛠️ Bootstrapping Maintenance Planning Schema...");

    try {
        // 1. Create Work Centers Table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "maint_work_centers" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "code" varchar(50) NOT NULL UNIQUE,
                "name" varchar(100) NOT NULL,
                "plant_id" varchar,
                "capacity_per_day" numeric DEFAULT '24',
                "active" boolean DEFAULT true,
                "created_at" timestamp DEFAULT now(),
                "updated_at" timestamp DEFAULT now()
            );
        `);

        // 2. Add Columns to Operations
        await db.execute(sql`
            DO $$ BEGIN
                ALTER TABLE "maint_work_order_operations" ADD COLUMN "work_center_id" uuid;
            EXCEPTION
                WHEN duplicate_column THEN null;
            END $$;
        `);

        await db.execute(sql`
            DO $$ BEGIN
                ALTER TABLE "maint_work_order_operations" ADD COLUMN "scheduled_date" timestamp;
            EXCEPTION
                WHEN duplicate_column THEN null;
            END $$;
        `);

        // 3. Seed Default Work Centers
        await db.execute(sql`
            INSERT INTO "maint_work_centers" ("code", "name", "capacity_per_day")
            VALUES 
                ('MECH', 'Mechanical Shop', '40'),
                ('ELEC', 'Electrical Shop', '24'),
                ('INST', 'Instrumentation', '16')
            ON CONFLICT ("code") DO NOTHING;
        `);

        console.log("✅ Maintenance Planning Schema Applied Successfully");
    } catch (error) {
        console.error("❌ Error bootstrapping schema:", error);
    }
}

main();
