
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function bootstrapSR() {
    console.log("🚀 Bootstrapping Service Request Tables...");

    // 9. Service Requests
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS maint_service_requests (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            request_number varchar(50) NOT NULL UNIQUE,
            description text NOT NULL,
            priority varchar(20) DEFAULT 'NORMAL',
            status varchar(20) DEFAULT 'NEW',
            asset_id varchar NOT NULL REFERENCES fa_assets(id),
            requested_by varchar REFERENCES users(id),
            work_order_id varchar REFERENCES maint_work_orders(id),


            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
    `);
    console.log("✅ maint_service_requests");
}

bootstrapSR()
    .then(() => {
        console.log("✨ Done!");
        process.exit(0);
    })
    .catch(e => {
        console.error("❌ Failed:", e);
        process.exit(1);
    });
