
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patchLearningAuditSchema() {
    console.log("🛠️  Patching Learning Audit Schema...");

    // AUDIT LOGS
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS hrm_learning_audit_logs (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            
            entity_type varchar NOT NULL, -- ENROLLMENT, COURSE, OFFERING
            entity_id varchar NOT NULL,
            
            action varchar NOT NULL, -- UPDATE, CREATE, DELETE, AUTO_RENEWAL
            
            previous_value text,
            new_value text,
            
            actor_id varchar, -- Who did it? (System or User ID)
            
            created_at timestamp DEFAULT now()
        );
    `);
    console.log("- Checked/Created hrm_learning_audit_logs");

    console.log("✅ Learning Audit Schema Patched Successfully.");
    process.exit(0);
}

patchLearningAuditSchema().catch((err) => {
    console.error("❌ Patch Error:", err);
    process.exit(1);
});
