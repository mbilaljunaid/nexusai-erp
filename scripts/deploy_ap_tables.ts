import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function deployTables() {
    console.log("Deploying AP Payment Terms and WHT tables directly...");

    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ap_payment_terms(
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), 
            term_name VARCHAR(100) UNIQUE NOT NULL, 
            description TEXT, 
            due_days INTEGER NOT NULL, 
            discount_days INTEGER, 
            discount_percent NUMERIC(5,2), 
            enabled_flag BOOLEAN DEFAULT true, 
            created_at TIMESTAMP DEFAULT now(), 
            updated_at TIMESTAMP DEFAULT now()
        ); 
        CREATE TABLE IF NOT EXISTS ap_wht_groups(
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), 
            group_name VARCHAR(100) UNIQUE NOT NULL, 
            description TEXT, 
            enabled_flag BOOLEAN DEFAULT true, 
            created_at TIMESTAMP DEFAULT now(), 
            updated_at TIMESTAMP DEFAULT now()
        ); 
        CREATE TABLE IF NOT EXISTS ap_wht_rates(
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(), 
            group_id VARCHAR NOT NULL, 
            priority INTEGER NOT NULL DEFAULT 1, 
            tax_rate_name VARCHAR(100) NOT NULL, 
            rate_percent NUMERIC(5,2) NOT NULL, 
            created_at TIMESTAMP DEFAULT now()
        );
    `);

    console.log("✅ Tables deployed successfully.");
    process.exit(0);
}

deployTables().catch(err => {
    console.error(err);
    process.exit(1);
});
