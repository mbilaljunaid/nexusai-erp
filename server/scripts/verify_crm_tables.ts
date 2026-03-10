import { Pool } from 'pg';
import { config } from 'dotenv';

config();

async function verifyTables() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('🔍 Checking CRM tables...\n');

        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND (
                table_name LIKE 'crm_%'
                OR table_name IN ('leads', 'accounts', 'contacts', 'opportunities', 'campaigns', 'cases', 'products')
            )
            ORDER BY table_name;
        `);

        console.log(`✅ Found ${result.rows.length} CRM-related tables:\n`);
        result.rows.forEach((row, index) => {
            console.log(`   ${index + 1}. ${row.table_name}`);
        });

        // Count records in key tables
        console.log('\n📊 Record counts:');
        const tables = ['opportunities', 'quotes', 'leads', 'products', 'campaigns', 'cases'];

        for (const table of tables) {
            try {
                const count = await pool.query(`SELECT COUNT(*) FROM ${table}`);
                console.log(`   ${table}: ${count.rows[0].count} records`);
            } catch (e) {
                console.log(`   ${table}: (table not found)`);
            }
        }

        console.log('\n✅ CRM database verification complete!');
    } catch (error) {
        console.error('❌ Verification failed:', error);
    } finally {
        await pool.end();
    }
}

verifyTables();
