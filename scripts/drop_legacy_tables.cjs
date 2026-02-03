const { Client } = require('pg');

const DATABASE_URL = 'postgresql://nexusai:nexusai_dev@localhost:5432/nexusai';

async function dropLegacyTables() {
    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();

    console.log('--- Dropping Legacy Tables ---');
    try {
        await client.query('DROP TABLE IF EXISTS maint_meters CASCADE');
        console.log('Dropped maint_meters (if existed)');
        await client.query('DROP TABLE IF EXISTS maint_meter_readings CASCADE');
        console.log('Dropped maint_meter_readings (if existed)');
    } catch (err) {
        console.error('Error dropping tables:', err.message);
    }

    await client.end();
}

dropLegacyTables();
