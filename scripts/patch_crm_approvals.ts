
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Applying CRM Approvals schema patch...");

    try {
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "crm_approval_requests" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "entity_type" varchar NOT NULL,
        "entity_id" varchar NOT NULL,
        "requester_id" varchar NOT NULL,
        "approver_id" varchar,
        "status" varchar DEFAULT 'Pending',
        "reason" text,
        "comments" text,
        "requested_at" timestamp DEFAULT now(),
        "responded_at" timestamp
      );
    `);

        console.log("✅ Custom Schema applied successfully!");
    } catch (error) {
        console.error("❌ Schema patch failed:", error);
        process.exit(1);
    }

    process.exit(0);
}

main();
