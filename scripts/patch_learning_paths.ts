
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patchLearningPaths() {
    console.log("🛠️  Patching Schema for Learning Paths...");

    // 1. Curricula Table
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS hrm_learning_curricula (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            title varchar NOT NULL,
            description text,
            provider varchar DEFAULT 'Internal',
            category varchar,
            
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
    `);
    console.log("- Created hrm_learning_curricula table");

    // 2. Curriculum Members (Join Table)
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS hrm_learning_curriculum_members (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            
            curriculum_id varchar NOT NULL REFERENCES hrm_learning_curricula(id),
            course_id varchar NOT NULL REFERENCES hrm_learning_courses(id),
            
            sequence_order integer DEFAULT 0,
            is_required boolean DEFAULT true,
            
            created_at timestamp DEFAULT now()
        );
    `);
    console.log("- Created hrm_learning_curriculum_members table");

    console.log("✅ Learning Paths Schema Patched Successfully.");
    process.exit(0);
}

patchLearningPaths().catch((err) => {
    console.error("❌ Patch Error:", err);
    process.exit(1);
});
