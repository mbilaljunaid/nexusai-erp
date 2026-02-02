import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});

async function run() {
    const client = await pool.connect();
    try {
        console.log("🚀 Starting Revenue Schema Creation & Remediation...");

        // Ensure uuid-ossp or pgcrypto is available for gen_random_uuid()
        await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

        // 1. revenue_ssp_books
        console.log("Creating 'revenue_ssp_books'...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS revenue_ssp_books (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
                name VARCHAR NOT NULL,
                currency VARCHAR DEFAULT 'USD',
                effective_from TIMESTAMP NOT NULL,
                effective_to TIMESTAMP,
                status VARCHAR DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        // 2. revenue_ssp_lines
        console.log("Creating 'revenue_ssp_lines'...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS revenue_ssp_lines (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
                book_id VARCHAR NOT NULL,
                item_id VARCHAR,
                item_group VARCHAR,
                ssp_value NUMERIC(18, 2) NOT NULL,
                min_quantity NUMERIC(18, 2) DEFAULT 0,
                max_quantity NUMERIC(18, 2),
                region VARCHAR,
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        // 3. revenue_contracts (with Phase A updates)
        console.log("Creating 'revenue_contracts'...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS revenue_contracts (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
                contract_number VARCHAR NOT NULL UNIQUE,
                status VARCHAR DEFAULT 'Draft',
                customer_id VARCHAR NOT NULL,
                ledger_id VARCHAR NOT NULL,
                legal_entity_id VARCHAR,
                org_id VARCHAR,
                currency VARCHAR DEFAULT 'USD',
                total_transaction_price NUMERIC(18, 2) DEFAULT 0,
                total_allocated_price NUMERIC(18, 2) DEFAULT 0,
                approval_status VARCHAR DEFAULT 'Pending',
                contract_sign_date TIMESTAMP,
                version_number INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        // 4. performance_obligations
        console.log("Creating 'performance_obligations'...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS performance_obligations (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
                contract_id VARCHAR NOT NULL,
                name VARCHAR NOT NULL,
                item_type VARCHAR,
                transaction_price NUMERIC(18, 2) DEFAULT 0,
                ssp_price NUMERIC(18, 2) DEFAULT 0,
                allocated_price NUMERIC(18, 2) DEFAULT 0,
                satisfaction_method VARCHAR DEFAULT 'PointInTime',
                start_date TIMESTAMP,
                end_date TIMESTAMP,
                status VARCHAR DEFAULT 'Open',
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        // 5. revenue_recognitions
        console.log("Creating 'revenue_recognitions'...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS revenue_recognitions (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
                pob_id VARCHAR NOT NULL,
                contract_id VARCHAR NOT NULL,
                period_name VARCHAR NOT NULL,
                schedule_date TIMESTAMP NOT NULL,
                amount NUMERIC(18, 2) NOT NULL,
                account_type VARCHAR DEFAULT 'Revenue',
                status VARCHAR DEFAULT 'Pending',
                gl_journal_id VARCHAR,
                event_type VARCHAR DEFAULT 'Schedule',
                description TEXT,
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        // 6. revenue_source_events (with Phase A updates)
        console.log("Creating 'revenue_source_events'...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS revenue_source_events (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
                source_system VARCHAR NOT NULL,
                source_id VARCHAR NOT NULL,
                event_type VARCHAR NOT NULL,
                event_date TIMESTAMP NOT NULL,
                item_id VARCHAR,
                quantity NUMERIC(18, 2),
                amount NUMERIC(18, 2),
                currency VARCHAR,
                reference_number VARCHAR,
                processing_status VARCHAR DEFAULT 'Pending',
                contract_id VARCHAR,
                error_message TEXT,
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        // 7. revenue_gl_accounts
        console.log("Creating 'revenue_gl_accounts'...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS revenue_gl_accounts (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
                ledger_id VARCHAR NOT NULL,
                revenue_account_ccid VARCHAR NOT NULL,
                deferred_revenue_account_ccid VARCHAR NOT NULL,
                contract_asset_account_ccid VARCHAR,
                clearing_account_ccid VARCHAR,
                description TEXT,
                last_updated TIMESTAMP DEFAULT now()
            );
        `);

        // 8. revenue_identification_rules
        console.log("Creating 'revenue_identification_rules'...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS revenue_identification_rules (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
                name VARCHAR NOT NULL,
                description TEXT,
                grouping_criteria JSONB NOT NULL,
                priority INTEGER DEFAULT 1,
                status VARCHAR DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        // 9. performance_obligation_rules
        console.log("Creating 'performance_obligation_rules'...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS performance_obligation_rules (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
                name VARCHAR NOT NULL,
                description TEXT,
                attribute_name VARCHAR NOT NULL,
                attribute_value VARCHAR NOT NULL,
                pob_name VARCHAR NOT NULL,
                satisfaction_method VARCHAR DEFAULT 'Ratable',
                default_duration_months INTEGER DEFAULT 12,
                priority INTEGER DEFAULT 1,
                status VARCHAR DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        console.log("🎊 Revenue schema creation & remediation complete!");
    } catch (e) {
        console.error("❌ Error during remediation:", e);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
