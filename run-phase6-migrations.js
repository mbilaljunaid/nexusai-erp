#!/usr/bin/env node
/**
 * Database Migration Runner
 * Runs Phase 6 Configuration Template migrations
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runMigration(filePath) {
    const fileName = path.basename(filePath);
    console.log(`\n📄 Running migration: ${fileName}`);

    try {
        const sql = fs.readFileSync(filePath, 'utf8');

        // Split by empty lines to get individual statements
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            if (statement.trim()) {
                await pool.query(statement + ';');
            }
        }

        console.log(`✅ Migration ${fileName} completed successfully`);
        return true;
    } catch (error) {
        console.error(`❌ Migration ${fileName} failed:`);
        console.error(error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Phase 6 Configuration Templates - Database Migration Runner\n');
    console.log('Database:', process.env.DATABASE_URL?.split('@')[1] || 'Unknown');

    const migrationsDir = path.join(__dirname, 'supabase', 'migrations');

    // Phase 6 migrations in order
    const migrations = [
        '20260212_configuration_templates_schema.sql',
        '20260212_configuration_templates_seed.sql',
        '20260212_additional_templates_phase65.sql',
    ];

    let successCount = 0;
    let failCount = 0;

    for (const migration of migrations) {
        const filePath = path.join(migrationsDir, migration);

        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  Migration file not found: ${migration}`);
            failCount++;
            continue;
        }

        const success = await runMigration(filePath);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📝 Total: ${migrations.length}`);
    console.log('='.repeat(60));

    if (failCount === 0) {
        console.log('\n🎉 All migrations completed successfully!');
        console.log('\n📦 Database now has:');
        console.log('   - Enhanced configuration_templates table');
        console.log('   - template_applications audit table');
        console.log('   - 8 production templates (147 total items)');
    } else {
        console.log('\n⚠️  Some migrations failed. Please review errors above.');
        process.exit(1);
    }

    await pool.end();
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
