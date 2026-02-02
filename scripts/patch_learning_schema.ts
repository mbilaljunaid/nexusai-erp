
import { db } from "@db";
import { sql } from "drizzle-orm";

async function patchLearningSchema() {
    console.log("🛠️ Patching Learning & Training Schema...");

    // 1. Update hrm_learning_courses
    console.log("  - Updating hrm_learning_courses...");
    await db.execute(sql`
        ALTER TABLE hrm_learning_courses 
        ADD COLUMN IF NOT EXISTS validity_months integer,
        ADD COLUMN IF NOT EXISTS renewal_rule varchar;
    `);

    // 2. Create hrm_learning_content_items
    console.log("  - Creating hrm_learning_content_items...");
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS hrm_learning_content_items (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            title varchar NOT NULL,
            type varchar NOT NULL, -- SCORM_12, VIDEO, PDF, LINK
            url text,
            launch_data text,
            created_at timestamp DEFAULT now()
        );
    `);

    // 3. Create hrm_learning_certifications
    console.log("  - Creating hrm_learning_certifications...");
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS hrm_learning_certifications (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            title varchar NOT NULL,
            description text,
            validity_period_days integer,
            renewal_window_days integer,
            owner_id varchar, 
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
    `);

    console.log("✅ Learning Schema patched successfully.");
    process.exit(0);
}

patchLearningSchema().catch(console.error);
