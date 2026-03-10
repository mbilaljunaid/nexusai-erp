import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function seed() {
    try {
        const query = `
        INSERT INTO cash_bank_accounts (ent_business_unit_id, name, account_number, bank_name, currency, active)
        SELECT '1', 'Operating Account', '1234567890', 'JPMorgan Chase', 'USD', true
        WHERE NOT EXISTS (SELECT 1 FROM cash_bank_accounts WHERE account_number = '1234567890');
        `;
        await pool.query(query);
        console.log("Bank account seeded successfully");
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
seed();
