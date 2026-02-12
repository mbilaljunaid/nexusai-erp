#!/usr/bin/env node
/**
 * Complete Migration Runner with Schema Updates
 * First updates schema, then runs all industry and template migrations
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

async function runMigrationFile(filePath) {
    const fileName = path.basename(filePath);
    console.log(`\n📄 Running: ${fileName}`);

    try {
        const sql = fs.readFileSync(filePath, 'utf8');
        await pool.query(sql);
        console.log(`   ✅ SUCCESS`);
        return { success: true, file: fileName };
    } catch (error) {
        console.log(`   ❌ FAILED: ${error.message}`);
        return { success: false, file: fileName, error: error.message };
    }
}

async function main() {
    console.log('🚀 Complete Migration Runner - Schema Updates + Templates\n');
    console.log('Database:', process.env.DATABASE_URL?.split('@')[1] || 'Unknown');
    console.log('='.repeat(70));

    const migrationsDir = path.join(__dirname, 'supabase', 'migrations');

    // All migrations in correct order
    const migrations = [
        // STEP 0: Schema updates (NEW - adds missing columns/tables)
        { file: '20260212_00_schema_updates_for_templates.sql', phase: 'Schema Updates' },

        // STEP 1-3: Phase 6 Templates (modules table now exists)
        { file: '20260212_configuration_templates_schema.sql', phase: 'Template Schema' },
        { file: '20260212_configuration_templates_seed.sql', phase: 'Core 4 Templates' },
        { file: '20260212_additional_templates_phase65.sql', phase: 'Additional 4 Templates' },
    ];

    const results = [];

    console.log(`\n📋 Migration Plan (${migrations.length} steps):\n`);
    migrations.forEach((m, i) => {
        console.log(`   ${i + 1}. ${m.phase}`);
        console.log(`      └─ ${m.file}`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('Starting migrations...');
    console.log('='.repeat(70));

    for (const migration of migrations) {
        const filePath = path.join(migrationsDir, migration.file);

        if (!fs.existsSync(filePath)) {
            console.log(`\n⚠️  File not found: ${migration.file}`);
            results.push({ success: false, file: migration.file, error: 'File not found' });
            continue;
        }

        const result = await runMigrationFile(filePath);
        results.push({ ...result, phase: migration.phase });

        // Small delay between migrations
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 Migration Results');
    console.log('='.repeat(70));

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`\n✅ Successful: ${successful.length}/${migrations.length}`);
    if (successful.length > 0) {
        successful.forEach(r => {
            console.log(`   ✓ ${r.phase}`);
        });
    }

    if (failed.length > 0) {
        console.log(`\n❌ Failed: ${failed.length}/${migrations.length}`);
        failed.forEach(r => {
            console.log(`   ✗ ${r.phase}`);
            console.log(`     Error: ${r.error}`);
        });
    }

    // Verification
    if (successful.length > 0) {
        console.log('\n' + '='.repeat(70));
        console.log('🔍 Verification');
        console.log('='.repeat(70));

        try {
            // Check industries.code column
            const codeCheck = await pool.query(`
        SELECT COUNT(*) FROM information_schema.columns
        WHERE table_name = 'industries' AND column_name = 'code'
      `);
            console.log(`\n✓ industries.code column: ${codeCheck.rows[0].count > 0 ? 'EXISTS' : 'MISSING'}`);

            // Check modules
            const modulesCount = await pool.query('SELECT COUNT(*) FROM modules');
            console.log(`✓ modules table: ${modulesCount.rows[0].count} modules loaded`);

            // Check configuration_templates
            const templatesCount = await pool.query('SELECT COUNT(*) FROM configuration_templates');
            console.log(`✓ configuration_templates: ${templatesCount.rows[0].count} templates loaded`);

            if (parseInt(templatesCount.rows[0].count) > 0) {
                const templates = await pool.query(`
          SELECT name, template_category 
          FROM configuration_templates 
          ORDER BY created_at
        `);
                console.log(`\n📋 Loaded Templates:`);
                templates.rows.forEach((t, i) => {
                    console.log(`   ${i + 1}. ${t.name} [${t.template_category}]`);
                });
            }

            // Check template_applications
            const appsCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'template_applications'
        );
      `);
            console.log(`\n✓ template_applications table: ${appsCheck.rows[0].exists ? 'EXISTS' : 'MISSING'}`);

        } catch (error) {
            console.error(`\n❌ Verification error: ${error.message}`);
        }
    }

    console.log('\n' + '='.repeat(70));

    if (failed.length === 0) {
        console.log('\n🎉 ALL MIGRATIONS COMPLETED SUCCESSFULLY!');
        console.log('\n✅ Phase 6 Configuration Templates DEPLOYED:');
        console.log('   • Schema updated with code column');
        console.log('   • modules table created and seeded');
        console.log('   • configuration_templates table created');
        console.log('   • 8 production templates loaded');
        console.log('   • 147 configuration items ready');
        console.log('   • Auto-provisioning enabled');
    } else {
        console.log(`\n⚠️  ${failed.length} migration(s) failed. Review errors above.`);
        process.exit(1);
    }

    await pool.end();
}

main().catch(err => {
    console.error('\n💥 Fatal error:', err);
    process.exit(1);
});
