
import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function deploySchema() {
    console.log('Deploying Inventory Schema...');
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL missing');
        process.exit(1);
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    try {
        console.log('Creating inv_reservations...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "inv_reservations" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "organizationId" varchar NOT NULL,
                "itemId" varchar NOT NULL,
                "demandSourceType" varchar NOT NULL,
                "demandSourceHeaderId" varchar NOT NULL,
                "demandSourceLineId" varchar,
                "subinventoryId" varchar,
                "locatorId" varchar,
                "lotId" varchar,
                "serialId" varchar,
                "quantity" numeric(18, 4) NOT NULL,
                "uom" varchar NOT NULL,
                "reservationType" varchar DEFAULT 'Hard',
                "createdAt" timestamp DEFAULT now(),
                "updatedAt" timestamp DEFAULT now()
            );
        `);

        console.log('Creating inv_cycle_count_headers...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "inv_cycle_count_headers" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "organizationId" varchar NOT NULL,
                "cycleCountName" varchar NOT NULL,
                "subinventoryId" varchar,
                "status" varchar DEFAULT 'Draft',
                "createdAt" timestamp DEFAULT now()
            );
        `);

        console.log('Creating inv_cycle_count_entries...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "inv_cycle_count_entries" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "headerId" varchar NOT NULL,
                "itemId" varchar NOT NULL,
                "subinventoryId" varchar NOT NULL,
                "locatorId" varchar,
                "systemQuantity" numeric(18, 4) NOT NULL,
                "countedQuantity" numeric(18, 4),
                "status" varchar DEFAULT 'Pending',
                "updatedAt" timestamp DEFAULT now()
            );
        `);

        console.log('Schema deployed successfully.');
    } catch (e) {
        console.error('Migration Failed', e);
        process.exit(1);
    } finally {
        await client.end();
    }
}

deploySchema();
