import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Use require for backend imports to avoid ESM/TS strictness issues with TypeORM entities
const { CostManagementService } = require('../backend/src/modules/cost-management/cost-management.service.ts');
const { CostPeriodService } = require('../backend/src/modules/cost-management/cost-period.service.ts');
const { ReceiptAccountingService } = require('../backend/src/modules/cost-management/receipt-accounting.service.ts');
const { ReconciliationService } = require('../backend/src/modules/cost-management/reconciliation.service.ts');
const { SlaService } = require('../backend/src/modules/cost-management/sla.service.ts');
const { CostProcessorService } = require('../backend/src/modules/cost-management/cost-processor.service.ts');
const { GlIntegrationService } = require('../backend/src/modules/finance/gl-integration.service.ts');

const { CostPeriod } = require('../backend/src/modules/cost-management/entities/cost-period.entity.ts');
const { MaterialTransaction } = require('../backend/src/modules/inventory/entities/material-transaction.entity.ts');
const { InventoryOrganization } = require('../backend/src/modules/inventory/entities/inventory-organization.entity.ts');
const { Item } = require('../backend/src/modules/inventory/entities/item.entity.ts');
const { OnHandBalance } = require('../backend/src/modules/inventory/entities/on-hand-balance.entity.ts');
const { Subinventory } = require('../backend/src/modules/inventory/entities/subinventory.entity.ts');
const { Locator } = require('../backend/src/modules/inventory/entities/locator.entity.ts');
const { Lot } = require('../backend/src/modules/inventory/entities/lot.entity.ts');
const { Serial } = require('../backend/src/modules/inventory/entities/serial.entity.ts');

const { GLEntry } = require('../backend/src/modules/erp/entities/gl-entry.entity.ts');
const { CstCostDistribution } = require('../backend/src/modules/cost-management/entities/cst-cost-distribution.entity.ts');
const { CmrReceiptDistribution } = require('../backend/src/modules/cost-management/entities/cmr-receipt-distribution.entity.ts');
const { CstItemCost } = require('../backend/src/modules/cost-management/entities/cst-item-cost.entity.ts');
const { CostOrganization } = require('../backend/src/modules/cost-management/entities/cost-organization.entity.ts');
const { CostBook } = require('../backend/src/modules/cost-management/entities/cost-book.entity.ts');
const { CostElement } = require('../backend/src/modules/cost-management/entities/cost-element.entity.ts');
const { CostProfile } = require('../backend/src/modules/cost-management/entities/cost-profile.entity.ts');


@Module({
    imports: [
        ConfigModule.forRoot({ envFilePath: '.env' }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'nexusai',
            entities: [
                MaterialTransaction, InventoryOrganization, Item, OnHandBalance,
                Subinventory, Locator, Lot, Serial,
                GLEntry, CstCostDistribution, CmrReceiptDistribution, CstItemCost,
                CostOrganization, CostPeriod, CostBook, CostElement, CostProfile
            ],
            synchronize: true,
        }),
        TypeOrmModule.forFeature([
            CostPeriod, CmrReceiptDistribution, MaterialTransaction,
            CstItemCost, GLEntry, CostOrganization, InventoryOrganization, Item,
            CstCostDistribution, OnHandBalance, CostBook, CostElement, CostProfile
        ])
    ],
    providers: [
        CostPeriodService,
        ReceiptAccountingService,
        ReconciliationService,
        CostManagementService,
        GlIntegrationService,
        SlaService,
        CostProcessorService
    ]
})
class TestModule { }

async function verifyPeriodAndRecon() {
    console.log('Starting Verification Context...');
    const app = await NestFactory.createApplicationContext(TestModule, { logger: ['error'] });
    await app.init();

    const periodService = app.get(CostPeriodService);
    const receiptService = app.get(ReceiptAccountingService);
    const reconService = app.get(ReconciliationService);
    const dataSource = app.get(DataSource);

    // Use an existing Org or Mock one
    const orgId = '75d137bc-3343-4217-9118-8096f2a00c61'; // Use a real ID if possible, or query
    const orgRepo = dataSource.getRepository(InventoryOrganization);
    let org = await orgRepo.findOne({ where: {} });
    if (!org) {
        console.log('No Organization found. Creating one...');
        org = orgRepo.create({ code: 'TEST_ORG', name: 'Test Org' });
        await orgRepo.save(org);
    }
    const TEST_ORG_ID = org.id;

    // Check for associated Cost Organization
    const costOrgRepo = dataSource.getRepository(CostOrganization);
    let costOrg = await costOrgRepo.findOne({ where: { inventoryOrganizationId: TEST_ORG_ID } });
    if (!costOrg) {
        console.log('No Cost Organization found. Creating one linked to Inventory Org...');
        costOrg = costOrgRepo.create({
            code: 'CST_TEST',
            name: 'Test Cost Org',
            inventoryOrganizationId: TEST_ORG_ID,
            isActive: true
        });
        await costOrgRepo.save(costOrg);
    }
    const COST_ORG_ID = costOrg.id;

    console.log(`Running Verification for Org: ${TEST_ORG_ID} (Cost Org: ${COST_ORG_ID})`);

    try {
        // 1. Open Period 'Jan-2099'
        console.log('1. Opening Period Name: Jan-2099');
        let period = await dataSource.getRepository(CostPeriod).findOne({ where: { costOrganization: { id: COST_ORG_ID }, periodName: 'Jan-2099' } });
        if (!period) {
            console.log('   Creating new period...');
            // Note: createPeriod now expects CostOrgId (based on our decision to keep setup explicit)
            period = await periodService.createPeriod(COST_ORG_ID, 'Jan-2099', new Date('2099-01-01'), new Date('2099-01-31'));
        }
        await periodService.openPeriod(TEST_ORG_ID, 'Jan-2099');
        console.log('   Period Open Success.');

        // 2. Mock Transaction
        const txnRepo = dataSource.getRepository(MaterialTransaction);
        const txn = txnRepo.create({
            organization: org,
            transactionDate: new Date('2099-01-15'),
            quantity: 10,
            transactionType: 'PO Receipt',
            sourceDocumentType: 'PO',
            sourceDocumentId: '999'
        });
        await txnRepo.save(txn);

        // 3. Process Transaction (Expect Success)
        console.log('2. Processing Transaction in Open Period...');
        // We need a unitCost. We'll simulate 100.
        // Also note: createReceiptDistributions might need saving transaction first? 
        // It uses transaction.organization.id, so we need to ensure relation is loaded or ID present.
        // It checks transaction.organization (if present).

        await receiptService.createReceiptDistributions(txn, 100);
        console.log('   Transaction Processed Success.');

        // 4. Close Period
        console.log('3. Closing Period...');
        await periodService.closePeriod(TEST_ORG_ID, 'Jan-2099');
        console.log('   Period Closed.');

        // 5. Try Process Transaction (Expect Failure)
        console.log('4. Attempting Transaction in Closed Period...');
        const txn2 = txnRepo.create({
            organization: org,
            transactionDate: new Date('2099-01-16'),
            quantity: 5,
            transactionType: 'PO Receipt'
        });

        let errorCaught = false;
        try {
            await receiptService.createReceiptDistributions(txn2, 100);
        } catch (e: any) {
            console.log(`   Caught Expected Error: ${e.message}`);
            if (e.message.includes('Closed') || e.message.includes('Status')) errorCaught = true;
        }

        if (!errorCaught) {
            console.error('FAILURE: Transaction should have been blocked!');
        } else {
            console.log('SUCCESS: Transaction Blocked in Closed Period.');
        }

        // 6. Run Reconciliation
        console.log('5. Running Reconciliation...');
        const report = await reconService.reconcileInventory(TEST_ORG_ID);
        console.log('   Reconciliation Report:', JSON.stringify(report, null, 2));

    } catch (err) {
        console.error('Verification Error:', err);
    } finally {
        await app.close();
    }
}

verifyPeriodAndRecon();
