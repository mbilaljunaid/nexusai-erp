
import { FinanceGlIntegrationService } from '../src/modules/finance/gl-integration.service';
import { SlaService } from '../src/modules/cost-management/sla.service';
import { DRIZZLE_DB } from '../src/database/drizzle.provider';
import * as schema from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

async function runVerification() {
    console.log("Starting Finance Migration Verification...");

    const connectionString = process.env.DATABASE_URL;
    console.log("DB URL:", connectionString?.substring(0, 15) + "...");

    const pool = new Pool({
        connectionString: connectionString,
    });
    const db = drizzle(pool, { schema });

    // Debug Raw Query
    try {
        const res = await pool.query("SELECT count(*) FROM public.gl_entries");
        console.log("Raw Query Success. Count:", res.rows[0].count);
    } catch (e) {
        console.error("Raw Query Failed:", e);
    }

    // Mock GL Service if we wanted unit test, but we want integration test.
    // We will instantiate them manually with the DB connection.

    const glService = new FinanceGlIntegrationService(db);
    const slaService = new SlaService(db, glService);

    console.log("Services Instantiated.");

    // Setup Test Data
    const txId = crypto.randomUUID();
    const distId = crypto.randomUUID();

    // 1. Create a dummy Cost Distribution (Unaccounted)
    // We need a dummy transaction ID usually, but SlaService checks transactionId column.
    // We might need to insert a parent transaction to satisfy potential FK if strictly enforced?
    // Drizzle schema defines foreign keys? 'transactionId'. 
    // Let's assume loose coupling for this test or insert minimal transaction.

    // Check if we need to insert cst_transactions?
    // In schema/costing.ts: cstTransactions?
    // Let's check schema/inventory.ts for inventoryTransactions (which costing uses).
    // SlaService loop: `distributions[0].transactionId` -> join?
    // `distributions` query fetches `cstCostDistributions`.
    // The previous code had `leftJoinAndSelect('dist.transaction')`.
    // Drizzle implementation fetches `cstCostDistributions` and expects `transactionId`.
    // It doesn't seemingly join for description yet?
    // `description: SLA: Transaction #${txId}`. It assumes generic.

    try {
        console.log("Creating Test Data...");
        await db.insert(schema.cstCostDistributions).values({
            id: distId,
            transactionId: txId,
            amount: "100.00",
            currencyCode: "USD",
            accounted: false,
            // Add other required fields
            accountingLineType: "Valuation",
            unitCost: "10.00",
            costElementId: "CORE", // Dummy
            level: 1,
            // organizationId might not be in schema if inconsistent, checking force_create...
            // force_create doesn't have organizationId in table def!
            // schema/costing.ts probably doesn't either?
            // "costOrganizationId" is in table def.
            costOrganizationId: "ORG-1",
            // itemId not in cst_cost_distributions force_create def?
            // "itemId"
        });

        console.log("Test Distribution Created. Running SLA Engine...");

        // 2. Run Create Accounting
        const processed = await slaService.createAccounting();

        console.log(`SLA Engine Finished. Processed: ${processed}`);

        if (processed !== 1) {
            throw new Error(`Expected 1 processed transaction, got ${processed}`);
        }

        // 3. Verify GL Entry
        const glEntries = await db.select().from(schema.glEntries)
            .where(
                eq(schema.glEntries.description, `[COST] SLA: Transaction #${txId}`)
            );

        console.log(`GL Entries Found: ${glEntries.length}`);
        if (glEntries.length !== 1) {
            throw new Error("GL Entry was not created!");
        }
        console.log("GL Entry Verified:", glEntries[0].id);

        // 4. Verify Distribution Accounted Flag
        const [dist] = await db.select().from(schema.cstCostDistributions)
            .where(eq(schema.cstCostDistributions.id, distId));

        console.log(`Distribution Accounted: ${dist.accounted}`);
        if (dist.accounted !== true) {
            throw new Error("Cost Distribution was not marked as accounted!");
        }

        console.log("SUCCESS: Finance Migration Verified Atomically.");

    } catch (e) {
        console.error("VERIFICATION FAILED:", e);
    } finally {
        // Cleanup
        console.log("Cleaning up...");
        await db.delete(schema.glEntries).where(eq(schema.glEntries.description, `[COST] SLA: Transaction #${txId}`));
        await db.delete(schema.cstCostDistributions).where(eq(schema.cstCostDistributions.id, distId));
        await pool.end();
    }
}

runVerification();
