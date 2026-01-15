
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function bootstrapSCMIntegration() {
    console.log("🚀 Bootstrapping Maintenance SCM Integration...");

    // 10. Work Order Materials
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS maint_work_order_materials (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            work_order_id varchar NOT NULL REFERENCES maint_work_orders(id),
            inventory_id varchar NOT NULL REFERENCES inventory(id),
            planned_quantity integer DEFAULT 1,
            actual_quantity integer DEFAULT 0,
            unit_cost numeric(10, 2),
            is_reserved varchar DEFAULT 'false',
            created_at timestamp DEFAULT now()
        );
    `);
    console.log("✅ maint_work_order_materials");
}

bootstrapSCMIntegration()
    .then(() => {
        console.log("✨ Done!");
        process.exit(0);
    })
    .catch(e => {
        console.error("❌ Failed:", e);
        process.exit(1);
    });
