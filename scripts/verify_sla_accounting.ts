import { NestFactory } from '@nestjs/core';
import { AppModule } from '../backend/src/app.module';

import { SlaService } from '../backend/src/modules/cost-management/sla.service';
import { InventoryOrganizationService } from '../backend/src/modules/inventory/inventory-organization.service';
import { ReceiptAccountingService } from '../backend/src/modules/cost-management/receipt-accounting.service';

import { MaterialTransaction } from '../backend/src/modules/inventory/entities/material-transaction.entity';
import { InventoryOrganization } from '../backend/src/modules/inventory/entities/inventory-organization.entity';
import { Item } from '../backend/src/modules/inventory/entities/item.entity';

import { DataSource } from 'typeorm';
import { GLEntry } from '../backend/src/modules/erp/entities/gl-entry.entity';

async function verifySLA() {
    console.log('Initializing NestJS Context...');
    const app = await NestFactory.createApplicationContext(AppModule);

    // Get Services
    const slaService = app.get(SlaService);
    const receiptService = app.get(ReceiptAccountingService);
    const dataSource = app.get(DataSource);

    // Create Transactional EntityManager
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        console.log('Creating Test Data...');
        const manager = queryRunner.manager;

        // 1. Mock Org & Item
        // For simplicity, we assume org-1 and item-1 exist, or create temporary?
        // Let's create temporary unique ones to avoid FK issues if empty DB.

        let org = await manager.findOne(InventoryOrganization, { where: { code: 'SLA_TEST_ORG' } });
        if (!org) {
            org = manager.create(InventoryOrganization, {
                code: 'SLA_TEST_ORG',
                name: 'SLA Test Organization',
                locationCode: 'LOC-SLA'
            });
            await manager.save(org);
        }

        let item = await manager.findOne(Item, { where: { itemNumber: 'SLA_ITEM_01' } });
        if (!item) {
            item = manager.create(Item, {
                itemNumber: 'SLA_ITEM_01',
                description: 'Test Item for SLA',
                organization: org,
                uom: 'EA', // Add required fields
                status: 'Active'
            });
            await manager.save(item);
        }

        // 2. Create Material Transaction
        const txn = manager.create(MaterialTransaction, {
            organization: org,
            item: item,
            transactionType: 'PO Receipt',
            quantity: 10,
            transactionDate: new Date(),
            sourceDocumentType: 'Purchase Order',
            sourceDocumentId: 'PO-999',
            reference: 'Ref-123'
        });
        await manager.save(txn);

        console.log(`Transaction Created: ${txn.id}`);

        // 3. Create Distributions (Simulate Receipt Accounting)
        // Note: receiptService.createReceiptDistributions expects Entity, but we are inside queryRunner.
        // If we call service, it uses its OWN repo (which is auto-injected).
        // Mixing Transaction Manager and Service calls is tricky.
        // For Verification, we can just let Service verify it.
        // But we need to COMMIT the txn data first so Service can see it if it uses a fresh connection?
        // No, standard TypeORM services use the default connection. 
        // So commit here.
        await queryRunner.commitTransaction();

        console.log('Triggering Receipt Accounting...');
        await receiptService.createReceiptDistributions(txn, 100); // 10 Qty * $100 Cost = $1000

        console.log('Triggering SLA Run...');
        const processed = await slaService.createAccounting(org.id);
        console.log(`SLA Processed Count: ${processed}`);

        // 4. Verify Journals
        const journal = await manager.findOne(GLEntry, {
            where: { description: `[COST] SLA Import: PO Receipt #${txn.id}` }
        });

        if (journal) {
            console.log('SUCCESS: GL Journal Created!');
            console.log(journal);
        } else {
            console.error('FAILURE: GL Journal NOT Found.');
        }

    } catch (err) {
        console.error('Test Failed:', err);
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
    } finally {
        await queryRunner.release();
        await app.close();
    }
}

verifySLA();
