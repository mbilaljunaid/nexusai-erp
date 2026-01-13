import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Services
const { LcmService } = require('../backend/src/modules/cost-management/lcm.service.ts');

// Entities
const { LandedCostCharge } = require('../backend/src/modules/cost-management/entities/landed-cost.entity.ts');
const { InventoryOrganization } = require('../backend/src/modules/inventory/entities/inventory-organization.entity.ts');
const { PurchaseOrder } = require('../backend/src/modules/procurement/entities/purchase-order.entity.ts');

const { Supplier } = require('../backend/src/modules/procurement/entities/supplier.entity.ts');
const { SupplierSite } = require('../backend/src/modules/procurement/entities/supplier-site.entity.ts');
const { PurchaseOrderLine } = require('../backend/src/modules/procurement/entities/purchase-order-line.entity.ts');
const { PurchaseOrderDistribution } = require('../backend/src/modules/procurement/entities/purchase-order-distribution.entity.ts');

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
                LandedCostCharge, InventoryOrganization, PurchaseOrder,
                Supplier, SupplierSite, PurchaseOrderLine, PurchaseOrderDistribution
            ],
            synchronize: true,
        }),
        TypeOrmModule.forFeature([
            LandedCostCharge, InventoryOrganization, PurchaseOrder,
            Supplier, SupplierSite, PurchaseOrderLine, PurchaseOrderDistribution
        ])
    ],
    providers: [LcmService]
})
class TestModule { }

async function verifyLcm() {
    console.log('Starting LCM Verification...');
    const app = await NestFactory.createApplicationContext(TestModule, { logger: ['error', 'warn'] });
    await app.init();

    const lcmService = app.get(LcmService);
    const dataSource = app.get(DataSource);
    const chargeRepo = dataSource.getRepository(LandedCostCharge);
    const poRepo = dataSource.getRepository(PurchaseOrder);
    const orgRepo = dataSource.getRepository(InventoryOrganization);

    try {
        // 1. Setup Data
        console.log('1. Setting up Test Data...');
        let org = await orgRepo.findOne({ where: {} });
        if (!org) {
            org = await orgRepo.save(orgRepo.create({ code: 'LCM_TEST_ORG', name: 'LCM Org' }));
        }

        let po = await poRepo.save(poRepo.create({
            poNumber: 'PO-LCM-001',
            status: 'OPEN',
            currencyCode: 'USD',
            totalAmount: 1000 // Placeholder
        }));

        // 2. Create Charges
        console.log('2. Creating Charges...');
        await chargeRepo.save(chargeRepo.create({
            organization: org,
            purchaseOrder: po,
            chargeType: 'Freight',
            amount: 50.00,
            currencyCode: 'USD',
            allocationBasis: 'Quantity',
            isEstimated: true
        }));

        await chargeRepo.save(chargeRepo.create({
            organization: org,
            purchaseOrder: po,
            chargeType: 'Insurance',
            amount: 20.00,
            currencyCode: 'USD',
            allocationBasis: 'Value',
            isEstimated: true
        }));

        // 3. Simulate Receipt Allocation
        console.log('3. Allocating Charges to Receipt...');

        // Mock Receipt Structure
        const mockReceipt = {
            receiptNumber: 'REC-001',
            purchaseOrder: { id: po.id },
            lines: [
                { id: 'line-1', quantityShipped: 5, unitPrice: 100 }, // Value: 500
                { id: 'line-2', quantityShipped: 5, unitPrice: 100 }  // Value: 500
            ]
        };
        // Total Qty: 10, Total Value: 1000

        const allocation = await lcmService.allocateChargesToReceipt(mockReceipt);

        console.log('4. verifying Allocation...');
        console.log('   Line 1 Allocation:', allocation.get('line-1'));
        console.log('   Line 2 Allocation:', allocation.get('line-2'));

        // Expected:
        // Freight ($50) via Qty (5/10 = 0.5) -> $25 per line
        // Insurance ($20) via Value (500/1000 = 0.5) -> $10 per line
        // Total per line: $35.

        if (allocation.get('line-1') !== 35) {
            throw new Error(`Line 1 Allocation Mismatch. Expected 35, got ${allocation.get('line-1')}`);
        }
        if (allocation.get('line-2') !== 35) {
            throw new Error(`Line 2 Allocation Mismatch. Expected 35, got ${allocation.get('line-2')}`);
        }

        console.log('SUCCESS: LCM Allocation Verified.');

    } catch (e) {
        console.error('Verification Failed:', e);
        process.exit(1);
    } finally {
        await app.close();
    }
}

verifyLcm();
