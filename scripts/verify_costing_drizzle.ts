
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema/index.ts';
import * as dotenv from 'dotenv';
import { eq, and } from 'drizzle-orm';
dotenv.config();

/**
 * Verify Cost Management Drizzle Migration
 * 1. Creates prerequisite data (Items, Orgs, Cost Orgs, Periods)
 * 2. Simulates an Inventory Transaction receipt.
 * 3. Calls Cost Processor (simulated).
 * 4. Verifies Cost Records and Distributions are created.
 */
async function verifyCostingDrizzle() {
    console.log('Verifying Cost Management Drizzle Migration...');

    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL missing');
        process.exit(1);
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });

    const orgId = 'VFY-COST-ORG-001';
    const costOrgId = 'VFY-CST-ORG-001'; // Primary key UUID
    const itemId = 'VFY-ITEM-COST-001';
    const subinvId = 'VFY-SUBINV-001';

    try {
        await db.transaction(async (tx) => {
            console.log('1. Setting up Prerequisite Data...');

            // 1. Inventory Organization
            await tx.insert(schema.inventoryOrganizations).values({ id: orgId, code: 'VCM', name: 'Verify Cost Mgmt' }).onConflictDoNothing();

            // 2. Cost Organization
            await tx.insert(schema.cstCostOrganizations).values({
                id: costOrgId,
                code: 'VCM-CST',
                name: 'Verify Cost Org',
                inventoryOrganizationId: orgId
            }).onConflictDoNothing();

            // 3. Cost Period
            const today = new Date();
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            const end = new Date(today.getFullYear(), today.getMonth() + 1, 0); // End of month

            await tx.insert(schema.cstCostPeriods).values({
                costOrganizationId: costOrgId,
                periodName: `VFY-${today.getMonth() + 1}-${today.getFullYear()}`,
                startDate: start,
                endDate: end,
                status: 'Open'
            }).onConflictDoNothing();

            // 4. Item
            await tx.insert(schema.inventory).values({ id: itemId, itemNumber: 'VCM-100', organizationId: orgId, quantityOnHand: '0' }).onConflictDoNothing();

            // 5. Subinventory
            await tx.insert(schema.inventorySubinventories).values({ id: subinvId, organizationId: orgId, code: 'Stores', name: 'Stores' }).onConflictDoNothing();

            console.log('2. Creating Inventory Transaction (PO Receipt)...');
            const [txn] = await tx.insert(schema.inventoryTransactions).values({
                itemId,
                transactionType: 'PO Receipt',
                quantity: '10',
                subinventoryId: subinvId
            }).returning();

            console.log('3. Simulating Receipt Accounting (Manual Logic for Verification)...');
            // Assuming Service Logic:
            // - Debit Inventory Valuation (1410)
            // - Credit Accrual (2210)
            const unitCost = 15.00;
            const total = 10 * unitCost;

            await tx.insert(schema.cmrReceiptDistributions).values({
                transactionId: txn.id,
                costOrganizationId: costOrgId,
                accountingLineType: 'Inventory Valuation',
                amount: total.toString(),
                currencyCode: 'USD',
                status: 'Draft',
                glAccountId: '1410-000-0000'
            });

            await tx.insert(schema.cmrReceiptDistributions).values({
                transactionId: txn.id,
                costOrganizationId: costOrgId,
                accountingLineType: 'Accrual',
                amount: (-total).toString(),
                currencyCode: 'USD',
                status: 'Draft',
                glAccountId: '2210-000-0000'
            });

            console.log('4. Simulating Cost Processor (Average Cost Update)...');
            // Check existing cost
            let [cost] = await tx.select().from(schema.cstItemCosts).where(and(eq(schema.cstItemCosts.itemId, itemId), eq(schema.cstItemCosts.inventoryOrganizationId, orgId)));
            if (!cost) {
                [cost] = await tx.insert(schema.cstItemCosts).values({
                    itemId,
                    inventoryOrganizationId: orgId,
                    unitCost: '0',
                    currencyCode: 'USD'
                }).returning();
            }

            // Update Cost (Simulated)
            const newCost = unitCost; // Simple initial purchase
            await tx.update(schema.cstItemCosts)
                .set({ unitCost: newCost.toString() })
                .where(eq(schema.cstItemCosts.id, cost.id));


            // VERIFICATION
            console.log('5. Verifying Results...');

            const dists = await tx.select().from(schema.cmrReceiptDistributions).where(eq(schema.cmrReceiptDistributions.transactionId, txn.id));
            if (dists.length !== 2) throw new Error(`Expected 2 Distributions, found ${dists.length}`);
            console.log('✅ Receipt Distributions Created');

            const [updatedCost] = await tx.select().from(schema.cstItemCosts).where(eq(schema.cstItemCosts.id, cost.id));
            if (Number(updatedCost.unitCost) !== 15.00) throw new Error(`Expected Cost 15.00, found ${updatedCost.unitCost}`);
            console.log('✅ Item Cost Updated');

            // Rollback to clean up
            console.log('Verification Success! Rolling back...');
            tx.rollback();
            return; // Explicit return after rollback to ensure flow stops
        });
    } catch (e) {
        if (e.message === 'Rollback') { // Expected from tx.rollback()
            console.log('Verification Complete (Simulated Rollback).');
        } else {
            console.error('Verification Failed', e);
            process.exit(1);
        }
    } finally {
        await pool.end();
    }
}

verifyCostingDrizzle();
