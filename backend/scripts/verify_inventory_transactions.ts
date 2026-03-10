
import { DrizzleProvider } from '../src/database/drizzle.provider';
import { ItemService } from '../src/modules/inventory/item.service';
import { InventoryOrganizationService } from '../src/modules/inventory/inventory-organization.service';
import { InventoryTransactionService } from '../src/modules/inventory/inventory-transaction.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import * as schema from '../../shared/schema';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env explicitly
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

// Mock dependencies
const mockCostingService = {
    // Stub
} as any;

const mockModuleRef = {
    get: (token: any) => { return null; }
} as any;

async function verify() {
    console.log('🔌 Initializing Inventory Transaction Verification (Manual)...');

    try {
        // 1. Initialize DB
        const factory = (DrizzleProvider as any).useFactory;
        const db = await factory();
        console.log('✅ DB Connected.');

        // 2. Instantiate Services
        const orgService = new InventoryOrganizationService(db);
        const itemService = new ItemService(db);

        // Mock CostPeriodService (Legacy TypeORM dependency)
        const mockPeriodService = {
            validateTransactionDate: async () => { console.log('   (Mock) Period Validation Passed'); }
        } as any;

        // Instantiate Dependencies
        const { ReceiptAccountingService } = await import('../src/modules/cost-management/receipt-accounting.service');
        const { CostProcessorService } = await import('../src/modules/cost-management/cost-processor.service');

        const receiptService = new ReceiptAccountingService(db, mockPeriodService);
        const costProcessor = new CostProcessorService(db);

        // Pass dependencies to Txn Service
        const txnService = new InventoryTransactionService(db, mockCostingService, mockModuleRef, receiptService, costProcessor);

        console.log('✅ Services instantiated.');

        // 3. Setup Data
        console.log('🏭 Setup: Creating Organization...');
        const orgCode = `TXN_ORG_${Date.now().toString().substring(8)}`;
        const org = await orgService.create({
            code: orgCode,
            name: 'Transaction Test Org',
            active: true
        });
        console.log(`   -> Org ID: ${org.id}`);

        console.log('📦 Setup: Creating Item...');
        const itemNumber = `TXN_ITEM-${Date.now().toString().substring(8)}`;
        const item = await itemService.create({
            itemNumber,
            description: 'Transaction Test Item',
            organizationId: org.id,
            primaryUomCode: 'EA',
            quantityOnHand: 0
        });
        console.log(`   -> Item ID: ${item.id}`);

        console.log('🏪 Setup: Creating Subinventory (Raw SQL insert for speed)...');
        const [subinv] = await db.insert(schema.inventorySubinventories).values({
            organizationId: org.id,
            code: 'Stores',
            name: 'Main Stores',
            active: true
        }).returning();
        console.log(`   -> Subinv ID: ${subinv.id}`);

        // 4. Execute Transaction (Misc Receipt)
        console.log('🔄 Executing Misc Receipt (+50)...');
        const txn = await txnService.executeTransaction({
            organizationId: org.id,
            itemId: item.id,
            subinventoryId: subinv.id,
            transactionType: 'Misc Receipt',
            quantity: 50,
            uom: 'EA',
            reference: 'Test Verification'
        });
        console.log(`✅ Transaction Created: ${txn.id}`);

        // 5. Verify Balance
        console.log('🔍 Verifying On-Hand Balance...');
        // We can use the service or raw query. Since updateBalance is private, we check raw or via ItemService if it aggregated (ItemService currently aggregates from inv_items.quantityOnHand which we also updated!)
        // Let's check inv_items aggregation first
        const updatedItem = await itemService.findOne(item.id);
        console.log(`   -> Item Aggregate Qty: ${updatedItem.quantityOnHand}`);

        if (Number(updatedItem.quantityOnHand) !== 50) {
            throw new Error(`Item Aggregate Quantity Mismatch. Expected 50, got ${updatedItem.quantityOnHand}`);
        }

        // Check Detailed Balance Table
        const [balance] = await db.select().from(schema.inventoryOnHandQuantities)
            .where(and(
                eq(schema.inventoryOnHandQuantities.itemId, item.id),
                eq(schema.inventoryOnHandQuantities.subinventoryId, subinv.id)
            ));

        console.log(`   -> Detailed Balance Qty: ${balance?.quantity}`);

        if (!balance || Number(balance.quantity) !== 50) {
            throw new Error(`Detailed Balance Mismatch. Expected 50, got ${balance?.quantity}`);
        }

        // 5b. Execute PO Receipt (Testing Costing Integration)
        console.log('🔄 Executing PO Receipt (+10)...');

        // We need a generic Cost Org for this to work (since ReceiptAccountingService looks it up)
        // Create Stub Cost Org
        console.log('   -> Setup: Creating Stub Cost Org...');
        const [costOrg] = await db.insert(schema.cstCostOrganizations).values({
            code: 'COST_ORG_1',
            name: 'Test Cost Org',
            inventoryOrganizationId: org.id
        }).returning();

        const poTxn = await txnService.executeTransaction({
            organizationId: org.id,
            itemId: item.id,
            subinventoryId: subinv.id,
            transactionType: 'PO Receipt',
            quantity: 10,
            uom: 'EA',
            reference: 'PO Verification'
        });
        console.log(`✅ PO Transaction Created: ${poTxn.id}`);

        // Verify Cost Distributions
        const distributions = await db.select().from(schema.cmrReceiptDistributions)
            .where(eq(schema.cmrReceiptDistributions.transactionId, poTxn.id));

        console.log(`   -> Cost Distributions Created: ${distributions.length}`);
        if (distributions.length !== 2) {
            throw new Error(`Costing Verification Failed. Expected 2 distributions (Debit/Credit), got ${distributions.length}`);
        }

        // 6. Cleanup
        await db.delete(schema.cmrReceiptDistributions).where(eq(schema.cmrReceiptDistributions.transactionId, poTxn.id));
        await db.delete(schema.cstCostOrganizations).where(eq(schema.cstCostOrganizations.id, costOrg.id));

        await db.delete(schema.inventoryOnHandQuantities).where(eq(schema.inventoryOnHandQuantities.itemId, item.id));
        await db.delete(schema.inventoryTransactions).where(eq(schema.inventoryTransactions.itemId, item.id));
        await itemService.remove(item.id);
        await orgService.remove(org.id);
        // cleanup subinv
        await db.delete(schema.inventorySubinventories).where(eq(schema.inventorySubinventories.id, subinv.id));

        console.log('🧹 Cleanup complete.');
        process.exit(0);

    } catch (e) {
        console.error('❌ Verification Failed:', e);
        process.exit(1);
    }
}

verify();
