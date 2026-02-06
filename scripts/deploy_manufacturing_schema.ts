
import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function deployManufacturingSchema() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    console.log('Deploying Manufacturing Schema...');

    try {
        await client.query('BEGIN');

        // 1. Production Orders (Work Orders)
        await client.query(`
            CREATE TABLE IF NOT EXISTS "production_orders" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "order_number" varchar NOT NULL UNIQUE,
                "product_id" varchar,
                "quantity" integer,
                "project_id" varchar,
                "task_id" varchar,
                "status" varchar DEFAULT 'planned',
                "scheduled_date" timestamp,
                "routing_id" varchar,
                "bom_id" varchar,
                "created_at" timestamp DEFAULT now()
            );
        `);
        console.log('Created production_orders');

        // 2. Production Transactions
        await client.query(`
            CREATE TABLE IF NOT EXISTS "production_transactions" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "production_order_id" varchar NOT NULL,
                "transaction_type" varchar NOT NULL,
                "operation_seq" integer,
                "product_id" varchar,
                "quantity" numeric(18, 4) NOT NULL,
                "actual_cost" numeric(18, 4),
                "resource_id" varchar,
                "transaction_date" timestamp DEFAULT now(),
                "created_by" varchar,
                "created_at" timestamp DEFAULT now()
            );
        `);
        console.log('Created production_transactions');

        await client.query('COMMIT');
        console.log('Manufacturing Schema Deployed Successfully.');

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Deployment Failed', e);
        process.exit(1);
    } finally {
        await client.end();
    }
}

deployManufacturingSchema();
