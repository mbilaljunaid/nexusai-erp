import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
config();

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script to run CRM database migration
 * This applies the 001_crm_schema.sql migration to create all CRM tables
 */

async function runMigration() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        console.error('❌ ERROR: DATABASE_URL environment variable is not set');
        console.log('Please set DATABASE_URL in your .env file or environment');
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: databaseUrl,
    });

    try {
        console.log('🔄 Connecting to database...');
        const client = await pool.connect();

        console.log('✅ Connected successfully');
        console.log('📁 Reading migration file...');

        const migrationPath = path.join(__dirname, '../../supabase/migrations/001_crm_schema.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

        console.log('🚀 Applying CRM schema migration...');
        console.log('Creating 11 CRM tables with RLS policies and indexes...');

        await client.query(migrationSQL);

        console.log('✅ Migration completed successfully!');
        console.log('\n📊 Verifying tables...');

        // Verify tables were created
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE 'crm_%'
            ORDER BY table_name;
        `);

        console.log(`\n✅ Created ${result.rows.length} CRM tables:`);
        result.rows.forEach((row, index) => {
            console.log(`   ${index + 1}. ${row.table_name}`);
        });

        client.release();
        console.log('\n🎉 CRM database migration complete!');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run the migration
runMigration();
