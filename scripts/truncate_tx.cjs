const { Client } = require('pg');

const DATABASE_URL = 'postgresql://nexusai:nexusai_dev@localhost:5432/nexusai';

async function truncateTable() {
    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();
    try {
        console.log('Truncating inv_material_transactions...');
        await client.query('TRUNCATE TABLE inv_material_transactions CASCADE;');
        console.log('Success.');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await client.end();
    }
}

truncateTable();
