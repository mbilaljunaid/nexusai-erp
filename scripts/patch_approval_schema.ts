
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patchApprovalSchema() {
    console.log("🛠️  Patching Approval Schema...");

    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS crm_approval_requests (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            entity_type varchar NOT NULL,
            entity_id varchar NOT NULL,
            requester_id varchar NOT NULL,
            approver_id varchar,
            status varchar DEFAULT 'Pending',
            reason text,
            comments text,
            requested_at timestamp DEFAULT now(),
            responded_at timestamp
        );
    `);
    console.log("- Created crm_approval_requests table");

    console.log("✅ Approval Schema Patched Successfully.");
    process.exit(0);
}

patchApprovalSchema().catch((err) => {
    console.error("❌ Patch Error:", err);
    process.exit(1);
});
