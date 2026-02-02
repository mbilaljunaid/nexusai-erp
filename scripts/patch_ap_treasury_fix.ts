import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patch() {
    console.log("Applying patch: add bank_account_id to ap_payment_batches...");

    try {
        await db.execute(sql`ALTER TABLE ap_payment_batches ADD COLUMN IF NOT EXISTS bank_account_id varchar(50);`);
        console.log("Migration successful.");
    } catch (err) {
        console.error("Migration failed:", err);
    }

    process.exit(0);
}

patch();
