
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patchPpmBilling() {
    console.log("🛠️ Patching PPM Billing Schema...");

    // 1. Create ppm_billing_rules
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ppm_billing_rules (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id varchar NOT NULL,
            rule_type varchar NOT NULL,
            contract_amount numeric(18, 2),
            markup_percentage numeric(5, 2),
            description text,
            active_flag boolean DEFAULT true,
            created_at timestamp DEFAULT now()
        );
    `);
    console.log("   ✅ Table `ppm_billing_rules` checked/created.");

    // 2. Create ppm_billing_events
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ppm_billing_events (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id varchar NOT NULL,
            task_id varchar,
            event_type varchar NOT NULL,
            event_date timestamp DEFAULT now(),
            amount numeric(18, 2) NOT NULL,
            currency varchar DEFAULT 'USD',
            description text,
            expenditure_item_id varchar,
            billing_rule_id varchar,
            billed_flag boolean DEFAULT false,
            invoice_id varchar,
            created_at timestamp DEFAULT now()
        );
    `);
    console.log("   ✅ Table `ppm_billing_events` checked/created.");

    // 3. Create ppm_project_invoices
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ppm_project_invoices (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            invoice_number varchar NOT NULL UNIQUE,
            project_id varchar NOT NULL,
            customer_id varchar,
            bill_to_site_id varchar,
            invoice_date timestamp NOT NULL,
            status varchar DEFAULT 'DRAFT',
            amount numeric(18, 2) DEFAULT 0,
            currency varchar DEFAULT 'USD',
            ar_invoice_id varchar,
            transfer_status varchar DEFAULT 'PENDING',
            transfer_date timestamp,
            transfer_error text,
            created_at timestamp DEFAULT now()
        );
    `);
    console.log("   ✅ Table `ppm_project_invoices` checked/created.");

    // 4. Create ppm_project_invoice_lines
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ppm_project_invoice_lines (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            invoice_id varchar NOT NULL,
            line_number integer NOT NULL,
            event_id varchar NOT NULL,
            amount numeric(18, 2) NOT NULL,
            description text,
            tax_amount numeric(18, 2),
            created_at timestamp DEFAULT now()
        );
    `);
    console.log("   ✅ Table `ppm_project_invoice_lines` checked/created.");

    console.log("✅ Schema Patch Completed.");
    process.exit(0);
}

patchPpmBilling().catch(err => {
    console.error("Patch Failed:", err);
    process.exit(1);
});
