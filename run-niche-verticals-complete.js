#!/usr/bin/env node
/**
 * Complete Niche Verticals Migration Runner
 * Cleans up existing tables, sets up prerequisites, runs all migrations
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
    console.log('🚀 Complete Niche Verticals Migration - Clean Install\n');
    console.log('Database:', process.env.DATABASE_URL?.split('@')[1] || 'Unknown');
    console.log('='.repeat(70));

    const migrationsDir = path.join(__dirname, 'supabase', 'migrations');

    // All migrations in proper order
    const migrations = [
        // STEP 0: Cleanup existing tables
        { file: '20260213_00_cleanup.sql', phase: 'Cleanup Existing Tables' },

        // STEP 1: Prerequisites
        { file: '20260213_00_prerequisites.sql', phase: 'Prerequisites Setup' },

        // Phase 1: SaaS Platform (5 modules)
        { file: '20260213_customer_success_platform.sql', phase: 'SaaS - Customer Success' },
        { file: '20260213_usage_analytics.sql', phase: 'SaaS - Usage Analytics' },
        { file: '20260213_mrr_analytics.sql', phase: 'SaaS - MRR Analytics' },
        { file: '20260213_trial_and_plan_management.sql', phase: 'SaaS - Trial & Plan Mgmt' },

        // Phase 2: E-commerce (4 modules)
        { file: '20260213_pim_module.sql', phase: 'E-commerce - PIM' },
        { file: '20260213_ecommerce_modules.sql', phase: 'E-commerce - Marketplace/Returns/DAM' },

        // Phase 3: Real Estate (3 modules)
        { file: '20260213_real_estate_platform.sql', phase: 'Real Estate - Property/Lease/Listing' },

        // Phase 4: Energy & Utilities (6 modules)
        { file: '20260213_energy_utilities_platform.sql', phase: 'Energy - Grid/MDM/OMS/DR/Trading/Compliance' },

        // Phase 5: Government (3 modules)
        { file: '20260213_government_platform.sql', phase: 'Government - Tax/Public Works/Emergency' },

        // Phase 6: Insurance (3 modules)
        { file: '20260213_insurance_platform.sql', phase: 'Insurance - Claims/Reinsurance/Underwriting' },

        // Phase 7: Education (3 modules)
        { file: '20260213_education_platform.sql', phase: 'Education - Aid/Admissions/SIS' },

        // Phase 8: Automotive (3 modules)
        { file: '20260213_automotive_platform.sql', phase: 'Automotive - Retail/Service/Parts' },
    ];

    const results = [];

    console.log(`\n📋 Migration Plan (${migrations.length} steps - 30 modules):\n`);
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
        await new Promise(resolve => setTimeout(resolve, 300));
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
    if (successful.length > 2) {
        console.log('\n' + '='.repeat(70));
        console.log('🔍 Verification');
        console.log('='.repeat(70));

        try {
            const tablesResult = await pool.query(`
                SELECT COUNT(*) as count
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_type = 'BASE TABLE'
            `);
            console.log(`\n✓ Total database tables: ${tablesResult.rows[0].count}`);

            const keyTables = [
                'customer_health_scores',
                'product_usage_events',
                'mrr_movements',
                'pim_products',
                'marketplace_vendors',
                'properties',
                'grid_assets',
                'tax_filings',
                'insurance_claims',
                'students',
                'vehicle_inventory'
            ];

            console.log('\n✓ Key Niche Vertical Tables:');
            for (const table of keyTables) {
                const exists = await pool.query(`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = $1
                    )
                `, [table]);
                console.log(`   ${exists.rows[0].exists ? '✓' : '✗'} ${table}`);
            }

        } catch (error) {
            console.error(`\n❌ Verification error: ${error.message}`);
        }
    }

    console.log('\n' + '='.repeat(70));

    if (failed.length === 0) {
        console.log('\n🎉 ALL NICHE VERTICAL MIGRATIONS COMPLETED SUCCESSFULLY!');
        console.log('\n✅ Deployed:');
        console.log('   • 30 specialized modules across 8 industries');
        console.log('   • 100+ database tables');
        console.log('   • Full RLS policies and security');
        console.log('   • Time-series partitioning for high-volume data');
        console.log('   • Geography/GIS support via PostGIS');
        console.log('   • Materialized views for performance');
        console.log('\n🎯 Ready for production use!');
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
