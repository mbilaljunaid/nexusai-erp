
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("🛠️ Manually creating revenue_contract_versions table...");

    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "revenue_contract_versions" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "contract_id" varchar NOT NULL,
            "version_number" integer NOT NULL,
            "snapshot_date" timestamp DEFAULT now(),
            "change_reason" text,
            "total_transaction_price" numeric(18, 2),
            "total_allocated_price" numeric(18, 2),
            "status" varchar
        );
    `);

    console.log("✅ Table created successfully.");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error creating table:", err);
    process.exit(1);
});
