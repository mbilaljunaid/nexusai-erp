import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patchSchema() {
    console.log("🔨 Patching Transportation & Logistics Schema...");

    try {
        // 1. Patch tl_freight_charges
        console.log("- Patching tl_freight_charges...");

        // Add planned_amount if it doesn't exist, otherwise rename amount to planned_amount
        await db.execute(sql`
            DO $$ 
            BEGIN 
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tl_freight_charges' AND column_name='amount') THEN
                    ALTER TABLE tl_freight_charges RENAME COLUMN amount TO planned_amount;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tl_freight_charges' AND column_name='actual_amount') THEN
                    ALTER TABLE tl_freight_charges ADD COLUMN actual_amount numeric(18,2);
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tl_freight_charges' AND column_name='variance_amount') THEN
                    ALTER TABLE tl_freight_charges ADD COLUMN variance_amount numeric(18,2);
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tl_freight_charges' AND column_name='status') THEN
                    ALTER TABLE tl_freight_charges ADD COLUMN status varchar DEFAULT 'ACCRUED';
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tl_freight_charges' AND column_name='reconciled_at') THEN
                    ALTER TABLE tl_freight_charges ADD COLUMN reconciled_at timestamp;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tl_freight_charges' AND column_name='reconciled_by') THEN
                    ALTER TABLE tl_freight_charges ADD COLUMN reconciled_by varchar;
                END IF;
            END $$;
        `);

        console.log("✅ Schema patch SUCCESSFUL!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Schema patch FAILED:", error);
        process.exit(1);
    }
}

patchSchema();
