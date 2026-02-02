
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Manually recreating GL Security & Audit tables...");

    try {
        // Drop New Tables
        await db.execute(sql`DROP TABLE IF EXISTS gl_data_access_set_assignments CASCADE;`);
        await db.execute(sql`DROP TABLE IF EXISTS gl_data_access_sets CASCADE;`);
        await db.execute(sql`DROP TABLE IF EXISTS gl_audit_logs CASCADE;`);
        console.log("Dropped tables.");

        // Create gl_audit_logs
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS gl_audit_logs (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                action varchar NOT NULL,
                entity varchar NOT NULL,
                entity_id varchar NOT NULL,
                user_id varchar NOT NULL,
                details jsonb,
                before_state jsonb,
                after_state jsonb,
                timestamp timestamp DEFAULT now() NOT NULL
            );
        `);
        console.log("Created gl_audit_logs");

        // Create gl_data_access_sets
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS gl_data_access_sets (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                name varchar NOT NULL UNIQUE,
                description text,
                ledger_id varchar NOT NULL,
                access_level varchar DEFAULT 'Read/Write',
                segment_security jsonb,
                is_active boolean DEFAULT true,
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("Created gl_data_access_sets");

        // Create gl_data_access_set_assignments
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS gl_data_access_set_assignments (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id varchar NOT NULL,
                data_access_set_id varchar NOT NULL,
                assigned_by varchar,
                assigned_at timestamp DEFAULT now()
            );
        `);
        console.log("Created gl_data_access_set_assignments");

        // Create gl_journals_v2
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS gl_journals_v2 (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                journal_number varchar NOT NULL UNIQUE,
                batch_id varchar,
                period_id varchar,
                description text,
                source varchar DEFAULT 'Manual',
                status varchar DEFAULT 'Draft',
                approval_status varchar DEFAULT 'Not Required',
                reversal_journal_id varchar,
                posted_date timestamp,
                created_by varchar,
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("Created gl_journals_v2");

        // Create gl_journal_lines_v2
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS gl_journal_lines_v2 (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                journal_id varchar NOT NULL,
                account_id varchar NOT NULL,
                description text,
                currency_code varchar DEFAULT 'USD' NOT NULL,
                entered_debit numeric(18,2),
                entered_credit numeric(18,2),
                accounted_debit numeric(18,2),
                accounted_credit numeric(18,2),
                exchange_rate numeric(20,10) DEFAULT '1',
                debit numeric(18,2) DEFAULT '0',
                credit numeric(18,2) DEFAULT '0'
            );
        `);
        console.log("Created gl_journal_lines_v2");

        console.log("Manual creation successful.");
    } catch (e) {
        console.error("Error creating tables:", e);
    }
    process.exit(0);
}

main();
