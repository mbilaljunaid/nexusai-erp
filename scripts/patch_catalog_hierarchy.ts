
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patchCatalogHierarchy() {
    console.log("🛠️  Patching Schema for Catalog Hierarchy (Communities)...");

    // 1. Communities Table (Self-referencing for hierarchy)
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS hrm_learning_communities (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            title varchar NOT NULL,
            description text,
            parent_id varchar REFERENCES hrm_learning_communities(id),
            path text, -- e.g. "/root_id/parent_id"
            
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
    `);
    console.log("- Created hrm_learning_communities table");

    // 2. Update Courses to include community reference
    await db.execute(sql`
        ALTER TABLE hrm_learning_courses 
        ADD COLUMN IF NOT EXISTS community_id varchar REFERENCES hrm_learning_communities(id);
    `);
    console.log("- Linked hrm_learning_courses to hrm_learning_communities");

    console.log("✅ Catalog Hierarchy Schema Patched Successfully.");
    process.exit(0);
}

patchCatalogHierarchy().catch((err) => {
    console.error("❌ Patch Error:", err);
    process.exit(1);
});
