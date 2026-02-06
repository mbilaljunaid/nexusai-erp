
import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function deployCostingSchema() {
    console.log('Deploying Costing Schema...');
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL missing');
        process.exit(1);
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    try {
        // 1. Cost Books
        console.log('Creating cst_cost_books...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "cst_cost_books" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "costBookCode" varchar NOT NULL UNIQUE,
                "description" varchar NOT NULL,
                "currencyCode" varchar NOT NULL,
                "isActive" boolean DEFAULT true,
                "createdAt" timestamp DEFAULT now(),
                "updatedAt" timestamp DEFAULT now()
            );
        `);

        // 2. Cost Organizations (already existed?) - Ensure columns
        console.log('Ensuring cst_cost_organizations...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "cst_cost_organizations" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "code" varchar NOT NULL,
                "name" varchar NOT NULL,
                "inventoryOrganizationId" varchar NOT NULL,
                "createdAt" timestamp DEFAULT now()
            );
        `);

        // 3. Cost Periods
        console.log('Creating cst_cost_periods...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "cst_cost_periods" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "costOrganizationId" varchar,
                "periodName" varchar NOT NULL,
                "startDate" timestamp NOT NULL,
                "endDate" timestamp NOT NULL,
                "status" varchar DEFAULT 'Open',
                "createdAt" timestamp DEFAULT now(),
                "updatedAt" timestamp DEFAULT now()
            );
        `);

        // 4. Cost Scenarios
        console.log('Creating cst_cost_scenarios...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "cst_cost_scenarios" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "costOrganizationId" varchar,
                "name" varchar NOT NULL,
                "description" varchar,
                "scenarioType" varchar DEFAULT 'Pending',
                "effectiveDate" timestamp,
                "createdAt" timestamp DEFAULT now(),
                "updatedAt" timestamp DEFAULT now()
            );
        `);

        // 5. Cost Elements
        console.log('Creating cst_cost_elements...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "cst_cost_elements" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "costElementCode" varchar NOT NULL UNIQUE,
                "description" varchar NOT NULL,
                "elementType" varchar DEFAULT 'Material',
                "isActive" boolean DEFAULT true,
                "createdAt" timestamp DEFAULT now()
            );
        `);

        // 6. Cost Profiles
        console.log('Creating cst_cost_profiles...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "cst_cost_profiles" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "profileName" varchar NOT NULL UNIQUE,
                "description" varchar NOT NULL,
                "costMethod" varchar DEFAULT 'Average',
                "isDefault" boolean DEFAULT true,
                "createdAt" timestamp DEFAULT now(),
                "updatedAt" timestamp DEFAULT now()
            );
        `);

        // 7. Standard Costs
        console.log('Creating cst_standard_costs...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "cst_standard_costs" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "scenarioId" varchar,
                "itemId" varchar,
                "costElementId" varchar,
                "unitCost" numeric(18, 4) NOT NULL,
                "createdAt" timestamp DEFAULT now(),
                "updatedAt" timestamp DEFAULT now()
            );
        `);

        // 8. Landed Costs
        console.log('Creating cst_landed_costs...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "cst_landed_costs" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "organizationId" varchar,
                "purchaseOrderId" varchar,
                "chargeType" varchar NOT NULL,
                "amount" numeric(18, 4) NOT NULL,
                "currencyCode" varchar NOT NULL,
                "allocationBasis" varchar DEFAULT 'Value',
                "isEstimated" boolean DEFAULT false,
                "vendorName" varchar,
                "createdAt" timestamp DEFAULT now(),
                "updatedAt" timestamp DEFAULT now()
            );
        `);

        // 9. Anomalies
        console.log('Creating cst_anomalies...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "cst_anomalies" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "organizationId" varchar,
                "itemId" varchar,
                "anomalyType" varchar NOT NULL,
                "detectedValue" numeric(10, 2),
                "expectedValue" numeric(10, 2),
                "variancePercent" numeric(5, 2),
                "severity" varchar DEFAULT 'Medium',
                "details" text,
                "status" varchar DEFAULT 'Open',
                "detectedAt" timestamp DEFAULT now()
            );
        `);

        // 10. Approval Requests
        console.log('Creating cst_approval_requests...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "cst_approval_requests" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "requesterId" varchar NOT NULL,
                "approverId" varchar,
                "status" varchar DEFAULT 'PENDING',
                "entityType" varchar NOT NULL,
                "entityId" varchar NOT NULL,
                "payload" text,
                "rejectionReason" text,
                "createdAt" timestamp DEFAULT now(),
                "updatedAt" timestamp DEFAULT now()
            );
        `);


        console.log('Costing Schema deployed successfully.');
    } catch (e) {
        console.error('Migration Failed', e);
        process.exit(1);
    } finally {
        await client.end();
    }
}

deployCostingSchema();
