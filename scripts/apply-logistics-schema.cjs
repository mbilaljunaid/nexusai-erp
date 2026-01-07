const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applySchema() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL is not set');
        process.exit(1);
    }

    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('Connected to database');

        const schemaPath = path.resolve(process.cwd(), 'docs/specs/logistics/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Applying schema...');

        await client.query('BEGIN');
        await client.query(schemaSql);
        await client.query('COMMIT');

        console.log('Schema applied successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error applying schema:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

applySchema();
