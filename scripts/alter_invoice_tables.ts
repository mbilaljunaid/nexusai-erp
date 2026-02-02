// scripts/alter_invoice_tables.ts
import { db } from "../server/db.ts";

async function main() {
    // Add invoice_status column to ap_invoices
    await db.execute(`ALTER TABLE ap_invoices ADD COLUMN IF NOT EXISTS "invoice_status" varchar(50) DEFAULT 'DRAFT';`);
    // Add hold_type column to ap_holds
    await db.execute(`ALTER TABLE ap_holds ADD COLUMN IF NOT EXISTS "hold_type" varchar(50) NOT NULL DEFAULT 'GENERAL';`);
    console.log('Migration completed');
}

main().catch(e => {
    console.error('Migration failed', e);
    process.exit(1);
});
