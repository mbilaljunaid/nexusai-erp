
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function bootstrapPM() {
    console.log("🚀 Bootstrapping PM Tables...");

    // 8. PM Definitions
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS maint_pm_definitions (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            name varchar(100) NOT NULL,
            description text,
            asset_id varchar NOT NULL REFERENCES fa_assets(id),
            work_definition_id varchar NOT NULL REFERENCES maint_work_definitions(id),
            effective_start_date timestamp DEFAULT now(),
            effective_end_date timestamp,
            active boolean DEFAULT true,
            trigger_type varchar(20) DEFAULT 'TIME',
            frequency integer,
            frequency_uom varchar(20),
            meter_id varchar REFERENCES maint_meters(id),
            interval_value numeric(20, 2),
            last_generated_date timestamp,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
    `);
    console.log("✅ maint_pm_definitions");
}

bootstrapPM()
    .then(() => {
        console.log("✨ Done!");
        process.exit(0);
    })
    .catch(e => {
        console.error("❌ Failed:", e);
        process.exit(1);
    });
