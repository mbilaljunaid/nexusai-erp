import 'dotenv/config';
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function migrateApSchema() {
    console.log("Starting AP Schema Migration...");
    console.log("WARNING: This will DROP existing AP tables and data!");

    try {
        // 1. Drop existing tables (Reverse order of dependency)
        console.log("Dropping old tables...");
        await db.execute(sql`DROP TABLE IF EXISTS ap_approvals CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS ap_invoice_payments CASCADE`); // New table cleanup
        await db.execute(sql`DROP TABLE IF EXISTS ap_payments CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS ap_invoice_distributions CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS ap_invoice_lines CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS ap_invoices CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS ap_suppliers CASCADE`);

        // 2. Create new tables
        console.log("Creating ap_suppliers...");
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ap_suppliers (
        id SERIAL PRIMARY KEY,
        supplier_number VARCHAR(50) UNIQUE,
        name VARCHAR(255) NOT NULL,
        tax_organization_type VARCHAR(50),
        tax_id VARCHAR(100),
        enabled_flag BOOLEAN DEFAULT true,
        credit_hold BOOLEAN DEFAULT false,
        payment_terms_id VARCHAR(50),
        risk_category VARCHAR(50) DEFAULT 'Low',
        risk_score INTEGER,
        address TEXT,
        country VARCHAR(100),
        contact_email VARCHAR(255),
        parent_supplier_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

        console.log("Creating ap_invoices...");
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ap_invoices (
        id SERIAL PRIMARY KEY,
        invoice_id VARCHAR(50) UNIQUE,
        supplier_id INTEGER NOT NULL REFERENCES ap_suppliers(id),
        supplier_site_id INTEGER,
        invoice_number VARCHAR(100) NOT NULL,
        invoice_date TIMESTAMP NOT NULL,
        description TEXT,
        invoice_type VARCHAR(50) DEFAULT 'STANDARD',
        invoice_currency_code VARCHAR(10) NOT NULL DEFAULT 'USD',
        payment_currency_code VARCHAR(10) NOT NULL DEFAULT 'USD',
        invoice_amount NUMERIC(18, 2) NOT NULL,
        validation_status VARCHAR(50) DEFAULT 'NEVER VALIDATED',
        approval_status VARCHAR(50) DEFAULT 'REQUIRED',
        payment_status VARCHAR(50) DEFAULT 'UNPAID',
        accounting_status VARCHAR(50) DEFAULT 'UNACCOUNTED',
        cancelled_date TIMESTAMP,
        gl_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

        console.log("Creating ap_invoice_lines...");
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ap_invoice_lines (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER NOT NULL REFERENCES ap_invoices(id),
        line_number INTEGER NOT NULL,
        line_type VARCHAR(50) NOT NULL DEFAULT 'ITEM',
        amount NUMERIC(18, 2) NOT NULL,
        description TEXT,
        po_header_id VARCHAR(50),
        po_line_id VARCHAR(50),
        quantity_invoiced NUMERIC(18, 4),
        unit_price NUMERIC(18, 4),
        discarded_flag BOOLEAN DEFAULT false,
        cancelled_flag BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

        console.log("Creating ap_invoice_distributions...");
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ap_invoice_distributions (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER NOT NULL REFERENCES ap_invoices(id),
        invoice_line_id INTEGER NOT NULL REFERENCES ap_invoice_lines(id),
        dist_line_number INTEGER NOT NULL,
        amount NUMERIC(18, 2) NOT NULL,
        dist_code_combination_id VARCHAR(255) NOT NULL,
        accounting_date TIMESTAMP,
        description TEXT,
        posted_flag BOOLEAN DEFAULT false,
        reversal_flag BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

        console.log("Creating ap_payments...");
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ap_payments (
        id SERIAL PRIMARY KEY,
        payment_number SERIAL,
        check_number VARCHAR(100),
        payment_date TIMESTAMP NOT NULL,
        amount NUMERIC(18, 2) NOT NULL,
        currency_code VARCHAR(10) NOT NULL,
        payment_method_code VARCHAR(50) NOT NULL,
        supplier_id INTEGER NOT NULL REFERENCES ap_suppliers(id),
        status VARCHAR(50) DEFAULT 'NEGOTIABLE',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

        console.log("Creating ap_invoice_payments...");
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ap_invoice_payments (
        id SERIAL PRIMARY KEY,
        payment_id INTEGER NOT NULL REFERENCES ap_payments(id),
        invoice_id INTEGER NOT NULL REFERENCES ap_invoices(id),
        amount NUMERIC(18, 2) NOT NULL,
        accounting_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

        console.log("Creating ap_approvals...");
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ap_approvals (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER NOT NULL REFERENCES ap_invoices(id),
        approver_id INTEGER,
        status VARCHAR(50) DEFAULT 'Pending',
        decision VARCHAR(50) DEFAULT 'Pending',
        action_date TIMESTAMP,
        comments TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

        console.log("Schema Migration Completed Successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Migration Failed:", error);
        process.exit(1);
    }
}

migrateApSchema();
