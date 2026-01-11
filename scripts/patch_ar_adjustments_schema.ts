import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patch() {
    console.log("Applying AR Adjustments Schema...");

    // 1. ar_adjustments
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ar_adjustments (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            invoice_id VARCHAR NOT NULL references ar_invoices(id),
            adjustment_type VARCHAR NOT NULL,
            amount NUMERIC(18, 2) NOT NULL,
            reason TEXT NOT NULL,
            status VARCHAR DEFAULT 'Pending',
            gl_account_id VARCHAR,
            created_at TIMESTAMP DEFAULT NOW(),
            created_by VARCHAR
        );
    `);
    console.log("- ar_adjustments created/verified.");

    console.log("Schema patch completed successfully.");
    process.exit(0);
}

patch().catch(err => {
    console.error("Patch failed:", err);
    process.exit(1);
});
