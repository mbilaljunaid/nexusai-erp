
import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function deployHrSchema() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    console.log('Deploying HR Schema...');

    try {
        await client.query('BEGIN');

        // Drop tables if needed (optional, for clean state)
        // await client.query('DROP TABLE IF EXISTS "leave_requests" CASCADE');
        // await client.query('DROP TABLE IF EXISTS "time_entries" CASCADE');
        // await client.query('DROP TABLE IF EXISTS "payroll" CASCADE');
        // await client.query('DROP TABLE IF EXISTS "employees" CASCADE');

        // 1. Employees
        await client.query(`
            CREATE TABLE IF NOT EXISTS "employees" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "first_name" varchar NOT NULL,
                "last_name" varchar NOT NULL,
                "email" varchar UNIQUE,
                "department" varchar,
                "hire_date" timestamp,
                "status" varchar DEFAULT 'active',
                "created_at" timestamp DEFAULT now()
            );
        `);
        console.log('Created employees');

        // 2. Payroll
        await client.query(`
            CREATE TABLE IF NOT EXISTS "payroll" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "employee_id" varchar NOT NULL,
                "salary" numeric(18, 2),
                "bonus" numeric(18, 2) DEFAULT 0,
                "deductions" numeric(18, 2) DEFAULT 0,
                "net_pay" numeric(18, 2),
                "pay_period" varchar,
                "created_at" timestamp DEFAULT now()
            );
        `);
        console.log('Created payroll');

        // 3. Payroll Configs
        await client.query(`
            CREATE TABLE IF NOT EXISTS "payroll_configs" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "tenant_id" varchar NOT NULL,
                "pay_period" varchar DEFAULT 'monthly',
                "pay_day" integer,
                "tax_settings" jsonb,
                "benefit_settings" jsonb,
                "overtime_rules" jsonb,
                "is_active" boolean DEFAULT true,
                "created_at" timestamp DEFAULT now(),
                "updated_at" timestamp DEFAULT now()
            );
        `);
        console.log('Created payroll_configs');

        // 4. Time Entries
        await client.query(`
            CREATE TABLE IF NOT EXISTS "time_entries" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "employee_id" varchar NOT NULL,
                "project_id" varchar NOT NULL,
                "task_id" varchar NOT NULL,
                "date" timestamp NOT NULL,
                "hours" numeric(5, 2) NOT NULL,
                "description" varchar,
                "billable_flag" boolean DEFAULT false,
                "cost_rate" numeric(18, 2),
                "status" varchar DEFAULT 'SUBMITTED',
                "created_at" timestamp DEFAULT now()
            );
        `);
        console.log('Created time_entries');

        // 5. Leave Requests
        await client.query(`
            CREATE TABLE IF NOT EXISTS "leave_requests" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "employee_id" varchar NOT NULL,
                "leave_type" varchar NOT NULL,
                "start_date" timestamp NOT NULL,
                "end_date" timestamp NOT NULL,
                "reason" varchar,
                "status" varchar DEFAULT 'PENDING',
                "created_at" timestamp DEFAULT now()
            );
        `);
        console.log('Created leave_requests');

        await client.query('COMMIT');
        console.log('HR Schema Deployed Successfully.');

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Deployment Failed', e);
        process.exit(1);
    } finally {
        await client.end();
    }
}

deployHrSchema();
