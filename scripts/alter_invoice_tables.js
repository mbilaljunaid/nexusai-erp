// scripts/alter_invoice_tables.js
import { db } from "../server/db";

async function main() {
    // Add invoiceStatus column to ap_invoices
    await db.execute(`ALTER TABLE ap_invoices ADD COLUMN IF NOT EXISTS "invoiceStatus" varchar(50) DEFAULT 'DRAFT';`);
    // Add hold_type column to ap_holds
    await db.execute(`ALTER TABLE ap_holds ADD COLUMN IF NOT EXISTS "hold_type" varchar(50) NOT NULL DEFAULT 'GENERAL';`);
    console.log('Migration completed');
}

main().catch(e => {
    console.error('Migration failed', e);
    process.exit(1);
});
