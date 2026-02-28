import "dotenv/config";
import { db } from "./db";
import { sql } from "drizzle-orm";

async function runMigration() {
    try {
        console.log("Adding business_unit_id to ar_customers...");
        await db.execute(sql`ALTER TABLE "ar_customers" ADD COLUMN IF NOT EXISTS "business_unit_id" character varying;`);

        console.log("Adding business_unit_id and advanced fields to ar_invoices...");
        await db.execute(sql`ALTER TABLE "ar_invoices" ADD COLUMN IF NOT EXISTS "business_unit_id" character varying;`);
        await db.execute(sql`ALTER TABLE "ar_invoices" ADD COLUMN IF NOT EXISTS "transaction_class" character varying DEFAULT 'INV';`);
        await db.execute(sql`ALTER TABLE "ar_invoices" ADD COLUMN IF NOT EXISTS "source_transaction_id" character varying;`);
        await db.execute(sql`ALTER TABLE "ar_invoices" ADD COLUMN IF NOT EXISTS "exchange_rate_type" character varying DEFAULT 'Corporate';`);
        await db.execute(sql`ALTER TABLE "ar_invoices" ADD COLUMN IF NOT EXISTS "exchange_rate_date" timestamp without time zone;`);
        await db.execute(sql`ALTER TABLE "ar_invoices" ADD COLUMN IF NOT EXISTS "exchange_rate" numeric(15, 5) DEFAULT '1';`);
        await db.execute(sql`ALTER TABLE "ar_invoices" ADD COLUMN IF NOT EXISTS "transaction_type_id" character varying;`);
        await db.execute(sql`ALTER TABLE "ar_invoices" ADD COLUMN IF NOT EXISTS "batch_source_id" character varying;`);

        console.log("Adding advanced fields to ar_invoice_lines...");
        await db.execute(sql`ALTER TABLE "ar_invoice_lines" ADD COLUMN IF NOT EXISTS "line_type" character varying DEFAULT 'LINE';`);
        await db.execute(sql`ALTER TABLE "ar_invoice_lines" ADD COLUMN IF NOT EXISTS "memo_line_id" character varying;`);
        await db.execute(sql`ALTER TABLE "ar_invoice_lines" ADD COLUMN IF NOT EXISTS "inventory_item_id" character varying;`);
        await db.execute(sql`ALTER TABLE "ar_invoice_lines" ADD COLUMN IF NOT EXISTS "tax_classification_code" character varying;`);
        await db.execute(sql`ALTER TABLE "ar_invoice_lines" ADD COLUMN IF NOT EXISTS "ccid" character varying;`);

        console.log("Adding advanced fields to ar_receipts and applications...");
        await db.execute(sql`ALTER TABLE "ar_receipts" ADD COLUMN IF NOT EXISTS "currency" character varying DEFAULT 'USD';`);
        await db.execute(sql`ALTER TABLE "ar_receipts" ADD COLUMN IF NOT EXISTS "type" character varying DEFAULT 'Standard';`);
        await db.execute(sql`ALTER TABLE "ar_receipts" ADD COLUMN IF NOT EXISTS "exchange_rate_type" character varying DEFAULT 'Corporate';`);
        await db.execute(sql`ALTER TABLE "ar_receipts" ADD COLUMN IF NOT EXISTS "exchange_rate_date" timestamp without time zone;`);
        await db.execute(sql`ALTER TABLE "ar_receipts" ADD COLUMN IF NOT EXISTS "exchange_rate" numeric(15, 5) DEFAULT '1';`);

        await db.execute(sql`ALTER TABLE "ar_receipt_applications" ADD COLUMN IF NOT EXISTS "allocated_receipt_amount" numeric(18, 2);`);
        await db.execute(sql`ALTER TABLE "ar_receipt_applications" ADD COLUMN IF NOT EXISTS "fx_gain_loss" numeric(18, 2) DEFAULT '0';`);
        await db.execute(sql`ALTER TABLE "ar_receipt_applications" ADD COLUMN IF NOT EXISTS "gl_date" timestamp without time zone;`);

        console.log("Adding missing columns to SLA tables if any...");
        await db.execute(sql`ALTER TABLE "sla_journal_headers" ADD COLUMN IF NOT EXISTS "business_unit_id" character varying;`);
        await db.execute(sql`ALTER TABLE "sla_journal_lines" ADD COLUMN IF NOT EXISTS "third_party_id" character varying;`);
        await db.execute(sql`ALTER TABLE "sla_journal_lines" ADD COLUMN IF NOT EXISTS "third_party_site_id" character varying;`);
        console.log("Migration complete.");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}
runMigration();
