#!/usr/bin/env node
/**
 * Database Diagnostic Tool
 * Investigates the state of the database to understand migration failures
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    console.log('🔍 Database Diagnostic Tool\n');
    console.log('='.repeat(70));

    try {
        // Check if PostGIS is installed
        console.log('\n📦 Extensions:');
        const extensions = await pool.query(`
            SELECT extname, extversion 
            FROM pg_extension 
            WHERE extname IN ('postgis', 'uuid-ossp', 'postgis_topology')
        `);
        if (extensions.rows.length > 0) {
            extensions.rows.forEach(ext => {
                console.log(`   ✓ ${ext.extname} v${ext.extversion}`);
            });
        } else {
            console.log('   ⚠️  No PostGIS or UUID extensions found');
        }

        // Check for update_updated_at_column function
        console.log('\n🔧 Functions:');
        const functions = await pool.query(`
            SELECT proname, prokind 
            FROM pg_proc 
            WHERE proname = 'update_updated_at_column'
        `);
        if (functions.rows.length > 0) {
            console.log(`   ✓ update_updated_at_column() exists`);
        } else {
            console.log(`   ✗ update_updated_at_column() NOT FOUND`);
        }

        // Check for customers table
        console.log('\n📋 Core Tables:');
        const tables = ['customers', 'subscriptions'];
        for (const table of tables) {
            const exists = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = $1
                )
            `, [table]);

            if (exists.rows[0].exists) {
                const columns = await pool.query(`
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns
                    WHERE table_name = $1
                    ORDER BY ordinal_position
                `, [table]);

                console.log(`   ✓ ${table} (${columns.rows.length} columns)`);
                columns.rows.forEach(col => {
                    console.log(`      - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
                });
            } else {
                console.log(`   ✗ ${table} does not exist`);
            }
        }

        // Check for niche vertical tables that should exist
        console.log('\n🎯 Niche Vertical Tables (from previous runs):');
        const nicheVerticalTables = [
            'insurance_claims',
            'students',
            'vehicle_inventory',
            'mrr_movements',
            'customer_revenue_timeline'
        ];

        for (const table of nicheVerticalTables) {
            const exists = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = $1
                )
            `, [table]);
            console.log(`   ${exists.rows[0].exists ? '✓' : '✗'} ${table}`);
        }

        // Check for foreign key constraints
        console.log('\n🔗 Foreign Key Constraints:');
        const fks = await pool.query(`
            SELECT
                tc.table_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND (tc.table_name IN ('customers', 'subscriptions')
                OR ccu.table_name IN ('customers', 'subscriptions'))
            ORDER BY tc.table_name
        `);

        if (fks.rows.length > 0) {
            fks.rows.forEach(fk => {
                console.log(`   ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
            });
        } else {
            console.log('   No FK constraints found for customers/subscriptions');
        }

        // Test simple table creation
        console.log('\n🧪 Test: Can we create a simple test table?');
        try {
            await pool.query('DROP TABLE IF EXISTS test_diagnostic_table CASCADE');
            await pool.query(`
                CREATE TABLE test_diagnostic_table (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    name VARCHAR(100)
                )
            `);
            await pool.query('DROP TABLE test_diagnostic_table');
            console.log('   ✓ Simple table creation works');
        } catch (error) {
            console.log(`   ✗ Failed: ${error.message}`);
        }

        // Test geography type
        console.log('\n🌍 Test: Can we use geography type?');
        try {
            await pool.query('DROP TABLE IF EXISTS test_geography_table CASCADE');
            await pool.query(`
                CREATE TABLE test_geography_table (
                    id UUID PRIMARY KEY,
                    location GEOGRAPHY(POINT)
                )
            `);
            await pool.query('DROP TABLE test_geography_table');
            console.log('   ✓ Geography type works (PostGIS is functional)');
        } catch (error) {
            console.log(`   ✗ Failed: ${error.message}`);
        }

        // Test trigger function
        console.log('\n⚡ Test: Can we create and use trigger function?');
        try {
            await pool.query(`
                CREATE OR REPLACE FUNCTION test_trigger_func()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql
            `);
            console.log('   ✓ Trigger function creation works');
        } catch (error) {
            console.log(`   ✗ Failed: ${error.message}`);
        }

    } catch (error) {
        console.error('\n💥 Diagnostic error:', error.message);
    }

    console.log('\n' + '='.repeat(70));
    await pool.end();
}

main().catch(err => {
    console.error('\n💥 Fatal error:', err);
    process.exit(1);
});
