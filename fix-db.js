import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function fix() {
    try {
        const query = `
        ALTER TABLE ap_invoices 
            ADD COLUMN IF NOT EXISTS invoice_id VARCHAR(50),
            ADD COLUMN IF NOT EXISTS legal_entity_id VARCHAR(255),
            ADD COLUMN IF NOT EXISTS invoice_type VARCHAR(50) DEFAULT 'STANDARD',
            ADD COLUMN IF NOT EXISTS invoice_currency_code VARCHAR(10) DEFAULT 'USD',
            ADD COLUMN IF NOT EXISTS payment_currency_code VARCHAR(10) DEFAULT 'USD',
            ADD COLUMN IF NOT EXISTS validation_status VARCHAR(50) DEFAULT 'NEVER VALIDATED',
            ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'REQUIRED',
            ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'UNPAID',
            ADD COLUMN IF NOT EXISTS accounting_status VARCHAR(50) DEFAULT 'UNACCOUNTED',
            ADD COLUMN IF NOT EXISTS invoice_status VARCHAR(50) DEFAULT 'DRAFT',
            ADD COLUMN IF NOT EXISTS due_date TIMESTAMP,
            ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(100) DEFAULT 'Net 30',
            ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(18,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS withholding_tax_amount NUMERIC(18,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS cancelled_date TIMESTAMP,
            ADD COLUMN IF NOT EXISTS gl_date TIMESTAMP,
            ADD COLUMN IF NOT EXISTS transaction_date TIMESTAMP,
            ADD COLUMN IF NOT EXISTS terms_date TIMESTAMP,
            ADD COLUMN IF NOT EXISTS goods_received_date TIMESTAMP,
            ADD COLUMN IF NOT EXISTS invoice_received_date TIMESTAMP,
            ADD COLUMN IF NOT EXISTS control_amount NUMERIC(18,2),
            ADD COLUMN IF NOT EXISTS pay_group VARCHAR(50),
            ADD COLUMN IF NOT EXISTS payment_method_override VARCHAR(50),
            ADD COLUMN IF NOT EXISTS document_category VARCHAR(50),
            ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(18,6),
            ADD COLUMN IF NOT EXISTS audio_url TEXT,
            ADD COLUMN IF NOT EXISTS document_url TEXT,
            ADD COLUMN IF NOT EXISTS ai_extraction_status VARCHAR(50),
            ADD COLUMN IF NOT EXISTS prepay_amount_remaining NUMERIC(18,2),
            ADD COLUMN IF NOT EXISTS extracted_json JSONB;
        `;
        await pool.query(query);
        console.log("Columns added successfully");
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
fix();
