
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as schema from '../shared/schema';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function deployProcurementSchema() {
    console.log('Deploying Procurement (RCV & AP) Schema...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 0. Drop
        await client.query('DROP TABLE IF EXISTS "scm_supplier_quotes" CASCADE');
        await client.query('DROP TABLE IF EXISTS "scm_rfq_lines" CASCADE');
        await client.query('DROP TABLE IF EXISTS "scm_rfq_headers" CASCADE');
        await client.query('DROP TABLE IF EXISTS "scm_approval_rules" CASCADE');
        await client.query('DROP TABLE IF EXISTS "ap_payments" CASCADE');

        // 0.1 RFQ
        await client.query(`
            CREATE TABLE IF NOT EXISTS "scm_rfq_headers" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "rfq_number" varchar NOT NULL UNIQUE,
                "title" varchar NOT NULL,
                "status" varchar DEFAULT 'Draft',
                "deadline" timestamp,
                "created_at" timestamp DEFAULT now()
            );
        `);
        console.log('Created scm_rfq_headers');

        await client.query(`
            CREATE TABLE IF NOT EXISTS "scm_rfq_lines" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "header_id" varchar NOT NULL,
                "description" text,
                "target_quantity" numeric(18, 2),
                "item_id" varchar,
                "created_at" timestamp DEFAULT now()
            );
        `);
        console.log('Created scm_rfq_lines');

        await client.query(`
            CREATE TABLE IF NOT EXISTS "scm_supplier_quotes" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "rfq_id" varchar NOT NULL,
                "supplier_id" varchar NOT NULL,
                "quote_amount" numeric(18, 2),
                "status" varchar DEFAULT 'Submitted',
                "created_at" timestamp DEFAULT now()
            );
        `);
        console.log('Created scm_supplier_quotes');

        // 0.2 Approval Rules
        await client.query('DROP TABLE IF EXISTS "ap_invoice_lines" CASCADE');
        await client.query('DROP TABLE IF EXISTS "ap_invoices" CASCADE');
        await client.query('DROP TABLE IF EXISTS "rcv_shipment_lines" CASCADE');
        await client.query('DROP TABLE IF EXISTS "rcv_shipment_headers" CASCADE');

        // 0. Approval Rules
        await client.query(`
            CREATE TABLE IF NOT EXISTS "scm_approval_rules" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "rule_name" varchar NOT NULL,
                "document_type" varchar NOT NULL,
                "min_amount" numeric(18, 2) DEFAULT 0,
                "max_amount" numeric(18, 2),
                "approver_id" varchar,
                "priority" integer DEFAULT 10,
                "category_filter" varchar DEFAULT 'ALL',
                "created_at" timestamp DEFAULT now()
            );
        `);
        console.log('Created scm_approval_rules');

        // 1. RCV Shipment Headers
        await client.query(`
            CREATE TABLE IF NOT EXISTS "rcv_shipment_headers" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "receipt_number" varchar NOT NULL UNIQUE,
                "shipment_number" varchar,
                "vendor_id" varchar,
                "shipped_date" timestamp,
                "expected_receipt_date" timestamp,
                "receipt_date" timestamp DEFAULT now(),
                "comments" text,
                "gross_weight" numeric,
                "net_weight" numeric,
                "packaging_code" varchar,
                "waybill_airbill_number" varchar,
                "created_at" timestamp DEFAULT now()
            );
        `);
        console.log('Created rcv_shipment_headers');

        // 2. RCV Shipment Lines
        await client.query(`
            CREATE TABLE IF NOT EXISTS "rcv_shipment_lines" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "shipment_header_id" varchar NOT NULL,
                "line_num" integer,
                "category_id" varchar,
                "quantity_shipped" numeric(18, 4),
                "quantity_received" numeric(18, 4),
                "uom" varchar,
                "item_description" varchar,
                "item_id" varchar,
                "po_header_id" varchar,
                "po_line_id" varchar,
                "po_distribution_id" varchar,
                "routing_header_id" varchar,
                "packing_slip" varchar,
                "from_organization_id" varchar,
                "to_organization_id" varchar,
                "deliver_to_person_id" varchar,
                "deliver_to_location_id" varchar,
                "destination_type_code" varchar DEFAULT 'RECEIVING',
                "created_at" timestamp DEFAULT now()
            );
        `);
        console.log('Created rcv_shipment_lines');

        // 3. AP Invoices
        await client.query(`
            CREATE TABLE IF NOT EXISTS "ap_invoices" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "invoice_number" varchar NOT NULL,
                "supplier_id" varchar NOT NULL,
                "site_id" varchar,
                "purchase_order_id" varchar,
                "invoice_date" timestamp NOT NULL,
                "due_date" timestamp,
                "payment_terms" varchar,
                "amount" numeric(18, 2) NOT NULL,
                "currency_code" varchar DEFAULT 'USD',
                "status" varchar DEFAULT 'Draft',
                "accounting_status" varchar DEFAULT 'Unaccounted',
                "description" text,
                "created_at" timestamp DEFAULT now(),
                "updated_at" timestamp DEFAULT now()
            );
        `);
        console.log('Created ap_invoices');

        // 4. AP Invoice Lines
        await client.query(`
            CREATE TABLE IF NOT EXISTS "ap_invoice_lines" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "invoice_id" varchar NOT NULL,
                "line_number" integer NOT NULL,
                "line_type" varchar DEFAULT 'ITEM',
                "description" text,
                "amount" numeric(18, 2) NOT NULL,
                "po_line_id" varchar,
                "rcv_transaction_id" varchar,
                "dist_code_combination_id" varchar,
                "created_at" timestamp DEFAULT now()
            );
        `);
        console.log('Created ap_invoice_lines');

        // 5. AP Payments
        await client.query(`
            CREATE TABLE IF NOT EXISTS "ap_payments" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "payment_number" varchar NOT NULL UNIQUE,
                "invoice_id" varchar NOT NULL,
                "amount" numeric(18, 2) NOT NULL,
                "currency_code" varchar DEFAULT 'USD',
                "payment_date" timestamp DEFAULT now(),
                "payment_method" varchar DEFAULT 'CHECK',
                "status" varchar DEFAULT 'ISSUED',
                "bank_account_id" varchar,
                "created_at" timestamp DEFAULT now()
            );
        `);
        console.log('Created ap_payments');

        await client.query('COMMIT');
        console.log('Procurement Schema Deployed Successfully.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Failed to deploy schema:', e);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

deployProcurementSchema();
