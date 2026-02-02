
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function fixDb() {
    try {
        console.log("Adding withholding_tax_amount to ap_invoices...");
        await db.execute(sql`ALTER TABLE ap_invoices ADD COLUMN IF NOT EXISTS withholding_tax_amount numeric(18, 2) DEFAULT '0'`);

        console.log("Adding columns to ap_suppliers...");
        await db.execute(sql`ALTER TABLE ap_suppliers ADD COLUMN IF NOT EXISTS allow_withholding_tax boolean DEFAULT false`);
        await db.execute(sql`ALTER TABLE ap_suppliers ADD COLUMN IF NOT EXISTS withholding_tax_group_id varchar(50)`);

        console.log("Adding amount_tolerance to ap_system_parameters...");
        await db.execute(sql`ALTER TABLE ap_system_parameters ADD COLUMN IF NOT EXISTS amount_tolerance numeric DEFAULT '10.00'`);

        console.log("Adding org_id to ap_supplier_sites...");
        await db.execute(sql`ALTER TABLE ap_supplier_sites ADD COLUMN IF NOT EXISTS org_id integer DEFAULT 1`);

        console.log("Removing residual invoiceStatus column from ap_invoices...");
        await db.execute(sql`ALTER TABLE ap_invoices DROP COLUMN IF EXISTS "invoiceStatus"`);

        console.log("✅ Manual fixes applied.");
        process.exit(0);
    } catch (e) {
        console.error("❌ Fix failed:", e);
        process.exit(1);
    }
}

fixDb();
