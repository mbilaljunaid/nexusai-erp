// Simple migration runner using node-postgres (ES Module)
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Read migration file
        const migrationSQL = fs.readFileSync(
            path.join(__dirname, '../migrations/admin_tables_simple.sql'),
            'utf8'
        );

        console.log('🔄 Running migration...');
        await client.query(migrationSQL);

        console.log('✅ Migration completed successfully!');
        console.log('\nTables created:');
        console.log('  - affiliates');
        console.log('  - affiliate_referrals');
        console.log('  - system_config');
        console.log('  - feature_flags');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
