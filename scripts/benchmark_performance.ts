import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Services
const { CostProcessorService } = require('../backend/src/modules/cost-management/cost-processor.service.ts');
const { SlaService } = require('../backend/src/modules/cost-management/sla.service.ts');
const { CostManagementService } = require('../backend/src/modules/cost-management/cost-management.service.ts');
const { ReceiptAccountingService } = require('../backend/src/modules/cost-management/receipt-accounting.service.ts');
const { CostPeriodService } = require('../backend/src/modules/cost-management/cost-period.service.ts');
const { ReconciliationService } = require('../backend/src/modules/cost-management/reconciliation.service.ts');
const { StandardCostService } = require('../backend/src/modules/cost-management/standard-cost.service.ts');
const { GlIntegrationService } = require('../backend/src/modules/finance/gl-integration.service.ts');
const { LcmService } = require('../backend/src/modules/cost-management/lcm.service.ts');
const { WipCostingService } = require('../backend/src/modules/cost-management/wip-costing.service.ts');
const { CostAnomalyService } = require('../backend/src/modules/cost-management/cost-anomaly.service.ts');
const { ApprovalService } = require('../backend/src/modules/cost-management/approval.service.ts');

// Entities
const { ApprovalRequest } = require('../backend/src/modules/cost-management/entities/approval-request.entity.ts');
const { CstStandardCost } = require('../backend/src/modules/cost-management/entities/cst-standard-cost.entity.ts');
const { CostScenario } = require('../backend/src/modules/cost-management/entities/cost-scenario.entity.ts');
const { CostOrganization } = require('../backend/src/modules/cost-management/entities/cost-organization.entity.ts');
const { InventoryOrganization } = require('../backend/src/modules/inventory/entities/inventory-organization.entity.ts');
const { Item } = require('../backend/src/modules/inventory/entities/item.entity.ts');
const { CostElement } = require('../backend/src/modules/cost-management/entities/cost-element.entity.ts');
const { CstItemCost } = require('../backend/src/modules/cost-management/entities/cst-item-cost.entity.ts');
const { CostBook } = require('../backend/src/modules/cost-management/entities/cost-book.entity.ts');
const { MaterialTransaction } = require('../backend/src/modules/inventory/entities/material-transaction.entity.ts');
const { CstCostDistribution } = require('../backend/src/modules/cost-management/entities/cst-cost-distribution.entity.ts');
const { CostProfile } = require('../backend/src/modules/cost-management/entities/cost-profile.entity.ts');
const { CostPeriod } = require('../backend/src/modules/cost-management/entities/cost-period.entity.ts');
const { CmrReceiptDistribution } = require('../backend/src/modules/cost-management/entities/cmr-receipt-distribution.entity.ts');
const { GLEntry } = require('../backend/src/modules/erp/entities/gl-entry.entity.ts');
const { LandedCostCharge } = require('../backend/src/modules/cost-management/entities/landed-cost.entity.ts');
const { CostAnomaly } = require('../backend/src/modules/cost-management/entities/cost-anomaly.entity.ts');
const { OnHandBalance } = require('../backend/src/modules/inventory/entities/on-hand-balance.entity.ts');
const { WorkOrder } = require('../backend/src/modules/manufacturing/entities/work-order.entity.ts');
const { WipTransaction } = require('../backend/src/modules/cost-management/entities/wip-transaction.entity.ts');
const { Subinventory } = require('../backend/src/modules/inventory/entities/subinventory.entity.ts');
const { Locator } = require('../backend/src/modules/inventory/entities/locator.entity.ts');
const { Lot } = require('../backend/src/modules/inventory/entities/lot.entity.ts');
const { Serial } = require('../backend/src/modules/inventory/entities/serial.entity.ts');
const { PurchaseOrder } = require('../backend/src/modules/procurement/entities/purchase-order.entity.ts');
const { PurchaseOrderLine } = require('../backend/src/modules/procurement/entities/purchase-order-line.entity.ts');
const { PurchaseOrderDistribution } = require('../backend/src/modules/procurement/entities/purchase-order-distribution.entity.ts');
const { Supplier } = require('../backend/src/modules/procurement/entities/supplier.entity.ts');
const { SupplierSite } = require('../backend/src/modules/procurement/entities/supplier-site.entity.ts');


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
                ApprovalRequest, CstStandardCost, CostScenario, CostOrganization,
                InventoryOrganization, Item, CostElement, CstItemCost, CostBook,
                MaterialTransaction, CstCostDistribution, CostProfile, CostPeriod,
                CmrReceiptDistribution, GLEntry, LandedCostCharge, CostAnomaly,
                OnHandBalance, WorkOrder, WipTransaction, CostElement,
                Subinventory, Locator, Lot, Serial,
                PurchaseOrder, PurchaseOrderLine, PurchaseOrderDistribution, Supplier, SupplierSite
            ],
            synchronize: true,
        }),
        TypeOrmModule.forFeature([
            ApprovalRequest, MaterialTransaction, InventoryOrganization, Item, CostOrganization, CostProfile, CostBook,
            CstCostDistribution, CstItemCost, OnHandBalance, CmrReceiptDistribution, GLEntry,
            CostPeriod, CstStandardCost, CostScenario, LandedCostCharge, CostAnomaly, WorkOrder, WipTransaction, CostElement,
            Subinventory, Locator, Lot, Serial,
            PurchaseOrder, PurchaseOrderLine, PurchaseOrderDistribution, Supplier, SupplierSite
        ])
    ],
    providers: [
        CostProcessorService,
        SlaService,
        CostManagementService,
        ReceiptAccountingService,
        CostPeriodService,
        ReconciliationService,
        StandardCostService,
        GlIntegrationService,
        LcmService,
        WipCostingService,
        CostAnomalyService,
        ApprovalService
    ]
})
class BenchmarkModule { }

async function benchmark() {
    console.log('Starting Scale Benchmark...');
    const app = await NestFactory.createApplicationContext(BenchmarkModule, { logger: ['log', 'error', 'warn'] });
    await app.init();

    const processor = app.get(CostProcessorService);
    const sla = app.get(SlaService);
    const dataSource = app.get(DataSource);
    const orgRepo = dataSource.getRepository(InventoryOrganization);

    try {
        const org = await orgRepo.findOne({ where: { code: 'PERF_ORG' } });
        if (!org) throw new Error('Perfect Org PERF_ORG not found. Run seeder first.');

        console.log(`Target Organization: ${org.name} (${org.id})`);

        // --- TEST 1: COST PROCESSOR ---
        console.log('--- TEST 1: COST PROCESSOR ---');
        const start1 = Date.now();
        const processedCount = await processor.processTransactions(org.id);
        const end1 = Date.now();
        const duration1 = (end1 - start1) / 1000;

        console.log(`Processed ${processedCount} records in ${duration1.toFixed(2)} seconds.`);
        console.log(`Rate: ${(processedCount / duration1).toFixed(2)} txns/sec`);

        // --- TEST 2: SLA ENGINE ---
        console.log('--- TEST 2: SLA ENGINE ---');
        const start2 = Date.now();
        // createAccounting usually runs for all eligible distributions
        const accountingResult = await sla.createAccounting();
        const end2 = Date.now();
        const duration2 = (end2 - start2) / 1000;

        // SLA Result is usually void or summary, assuming it processed the distributions from above
        console.log(`SLA Run completed in ${duration2.toFixed(2)} seconds.`);
        // Assuming correlation (1txn = 1 or more dists), Rate is approximate

        console.log('--- RESULTS ---');
        console.log(`Cost Processor Time: ${duration1.toFixed(2)}s`);
        console.log(`SLA Engine Time:     ${duration2.toFixed(2)}s`);

    } catch (e) {
        console.error('Benchmark Failed:', e);
        process.exit(1);
    } finally {
        await app.close();
    }
}

benchmark();
