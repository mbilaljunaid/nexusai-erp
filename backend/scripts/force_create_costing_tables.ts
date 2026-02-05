
import { DrizzleProvider } from '../src/database/drizzle.provider';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { sql } from 'drizzle-orm';

// Load .env explicitly
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

async function run() {
    console.log('🔌 Connecting to DB to force create costing tables...');
    const factory = (DrizzleProvider as any).useFactory;
    const db = await factory();

    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS cst_item_costs (
                id text PRIMARY KEY DEFAULT gen_random_uuid(),
                "inventoryOrganizationId" text,
                "itemId" text,
                "costBookId" text,
                "unitCost" numeric(18, 4) DEFAULT '0',
                "currencyCode" text NOT NULL,
                "createdAt" timestamp DEFAULT now(),
                "updatedAt" timestamp DEFAULT now()
            );

            CREATE TABLE IF NOT EXISTS cst_cost_organizations (
                id text PRIMARY KEY DEFAULT gen_random_uuid(),
                code text NOT NULL,
                name text NOT NULL,
                "inventoryOrganizationId" text NOT NULL,
                "createdAt" timestamp DEFAULT now()
            );

            CREATE TABLE IF NOT EXISTS cst_cost_distributions (
                id text PRIMARY KEY DEFAULT gen_random_uuid(),
                "transactionId" text,
                "costOrganizationId" text,
                "costElementId" text,
                "accountingLineType" text NOT NULL,
                "amount" numeric(18, 4) NOT NULL,
                "currencyCode" text NOT NULL,
                "unitCost" numeric(18, 4) NOT NULL,
                status text DEFAULT 'Draft',
                accounted boolean DEFAULT false,
                "glAccountId" text,
                "createdAt" timestamp DEFAULT now()
            );

            CREATE TABLE IF NOT EXISTS cmr_receipt_distributions (
                id text PRIMARY KEY DEFAULT gen_random_uuid(),
                "transactionId" text,
                "costOrganizationId" text,
                "accountingLineType" text NOT NULL,
                "amount" numeric(18, 4) NOT NULL,
                "currencyCode" text NOT NULL,
                "accountedAmount" numeric(18, 4),
                "glAccountId" text,
                status text DEFAULT 'Draft',
                "createdAt" timestamp DEFAULT now()
            );
        `);
        console.log('✅ Costing tables created or already exist.');
        process.exit(0);
    } catch (e) {
        console.error('❌ Failed to create tables:', e);
        process.exit(1);
    }
}

run();
