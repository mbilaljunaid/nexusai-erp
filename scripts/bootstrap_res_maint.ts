
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function bootstrapResourceIntegration() {
    console.log("🚀 Bootstrapping Maintenance Resource Integration...");

    // 11. Work Order Resources
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS maint_work_order_resources (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            work_order_id varchar NOT NULL REFERENCES maint_work_orders(id),
            user_id varchar NOT NULL REFERENCES users(id),
            planned_hours numeric(5, 2) DEFAULT 0,
            actual_hours numeric(5, 2) DEFAULT 0,
            hourly_rate numeric(10, 2),
            status varchar DEFAULT 'ASSIGNED',
            created_at timestamp DEFAULT now()
        );
    `);
    console.log("✅ maint_work_order_resources");
}

bootstrapResourceIntegration()
    .then(() => {
        console.log("✨ Done!");
        process.exit(0);
    })
    .catch(e => {
        console.error("❌ Failed:", e);
        process.exit(1);
    });
