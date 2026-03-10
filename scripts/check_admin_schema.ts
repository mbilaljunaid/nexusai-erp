import { Client } from 'pg';

async function listAdminTables() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is missing');
        process.exit(1);
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });

    try {
        await client.connect();

        // Check what admin-related tables exist
        const tablesResult = await client.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY tablename;
        `);

        console.log('All tables in database:');
        tablesResult.rows.forEach(row => {
            console.log(`  - ${row.tablename}`);
        });

        console.log(`\nTotal: ${tablesResult.rows.length} tables`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

listAdminTables().catch(console.error);
