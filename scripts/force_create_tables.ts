
import pg from "pg";

async function forceCreateTables() {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    try {
        console.log("Creating missing tables...");

        // 1. production_transactions
        await pool.query(`
            CREATE TABLE IF NOT EXISTS production_transactions (
                id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
                production_order_id VARCHAR(255) NOT NULL,
                transaction_type VARCHAR(255) NOT NULL,
                operation_seq INTEGER,
                product_id VARCHAR(255),
                quantity NUMERIC(18, 4) NOT NULL,
                transaction_date TIMESTAMP DEFAULT now(),
                created_by VARCHAR(255),
                created_at TIMESTAMP DEFAULT now()
            )
        `);
        console.log("✅ Table 'production_transactions' created/verified.");

        // 2. mfg_cost_anomalies
        await pool.query(`
            CREATE TABLE IF NOT EXISTS mfg_cost_anomalies (
                id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
                target_type VARCHAR(255) NOT NULL,
                target_id VARCHAR(255) NOT NULL,
                anomaly_type VARCHAR(255) NOT NULL,
                severity VARCHAR(255) NOT NULL,
                description TEXT,
                status VARCHAR(255) DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT now()
            )
        `);
        console.log("✅ Table 'mfg_cost_anomalies' created/verified.");

        // 3. revenue_periods (from previous turn)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS revenue_periods (
                id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
                ledger_id VARCHAR(255) NOT NULL,
                period_name VARCHAR(255) NOT NULL,
                start_date TIMESTAMP NOT NULL,
                end_date TIMESTAMP NOT NULL,
                status VARCHAR(255) DEFAULT 'Open',
                closed_at TIMESTAMP,
                closed_by VARCHAR(255),
                created_at TIMESTAMP DEFAULT now()
            )
        `);
        console.log("✅ Table 'revenue_periods' created/verified.");

    } finally {
        await pool.end();
    }
}

forceCreateTables();
