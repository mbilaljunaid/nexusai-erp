
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("🛠️ Bootstrapping Maintenance Costing Schema...");

    try {
        await db.execute(sql`
            DO $$ BEGIN
                CREATE TYPE "maint_cost_type" AS ENUM ('MATERIAL', 'LABOR', 'OVERHEAD', 'OUTSIDE_PROCESSING');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await db.execute(sql`
            DO $$ BEGIN
                CREATE TYPE "maint_gl_status" AS ENUM ('PENDING', 'POSTED', 'ERROR');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "maint_work_order_costs" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "work_order_id" uuid NOT NULL,
                "cost_type" "maint_cost_type" NOT NULL,
                "description" text,
                "quantity" numeric,
                "unit_cost" numeric,
                "total_cost" numeric NOT NULL,
                "currency" varchar(3) DEFAULT 'USD',
                "source_reference" varchar,
                "date" timestamp DEFAULT now(),
                "gl_status" "maint_gl_status" DEFAULT 'PENDING',
                "created_at" timestamp DEFAULT now()
            );
        `);

        console.log("✅ Maintenance Costing Schema Applied Successfully");
    } catch (error) {
        console.error("❌ Error bootstrapping schema:", error);
    }
}

main();
