import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Services
const { WipCostingService } = require('../backend/src/modules/cost-management/wip-costing.service.ts');
const { StandardCostService } = require('../backend/src/modules/cost-management/standard-cost.service.ts');

// Entities
const { WorkOrder } = require('../backend/src/modules/manufacturing/entities/work-order.entity.ts');
const { WipTransaction } = require('../backend/src/modules/cost-management/entities/wip-transaction.entity.ts');
const { InventoryOrganization } = require('../backend/src/modules/inventory/entities/inventory-organization.entity.ts');
const { Item } = require('../backend/src/modules/inventory/entities/item.entity.ts');
const { CostOrganization } = require('../backend/src/modules/cost-management/entities/cost-organization.entity.ts');
const { CostScenario } = require('../backend/src/modules/cost-management/entities/cost-scenario.entity.ts');
const { CstStandardCost } = require('../backend/src/modules/cost-management/entities/cst-standard-cost.entity.ts');
const { CostElement } = require('../backend/src/modules/cost-management/entities/cost-element.entity.ts');
const { CstItemCost } = require('../backend/src/modules/cost-management/entities/cst-item-cost.entity.ts');
const { CostBook } = require('../backend/src/modules/cost-management/entities/cost-book.entity.ts');

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
                WorkOrder, WipTransaction, InventoryOrganization, Item,
                CostOrganization, CostScenario, CstStandardCost, CostElement, CstItemCost, CostBook
            ],
            synchronize: true,
        }),
        TypeOrmModule.forFeature([
            WorkOrder, WipTransaction, InventoryOrganization, Item,
            CostOrganization, CostScenario, CstStandardCost, CostElement, CstItemCost, CostBook
        ])
    ],
    providers: [WipCostingService, StandardCostService]
})
class TestModule { }

async function verifyWipCosting() {
    console.log('Starting WIP Costing Verification...');
    const app = await NestFactory.createApplicationContext(TestModule, { logger: ['error', 'warn'] });
    await app.init();

    const wipService = app.get(WipCostingService);
    const stdCostService = app.get(StandardCostService); // Need to set std cost first
    const dataSource = app.get(DataSource);
    const woRepo = dataSource.getRepository(WorkOrder);
    const orgRepo = dataSource.getRepository(InventoryOrganization);
    const itemRepo = dataSource.getRepository(Item);
    const costOrgRepo = dataSource.getRepository(CostOrganization);
    const elemRepo = dataSource.getRepository(CostElement);
    const scenarioRepo = dataSource.getRepository(CostScenario);

    try {
        // 1. Setup Data
        console.log('1. Setting up Test Data...');
        let org = await orgRepo.findOne({ where: {} });
        if (!org) {
            org = await orgRepo.save(orgRepo.create({ code: 'WIP_ORG', name: 'WIP Org' }));
        }

        let costOrg = await costOrgRepo.findOne({ where: { inventoryOrganizationId: org.id } });
        if (!costOrg) {
            costOrg = await costOrgRepo.save(costOrgRepo.create({
                code: 'CST_WIP',
                name: 'WIP Cost Org',
                inventoryOrganizationId: org.id
            }));
        }

        let item = await itemRepo.findOne({ where: { organization: { id: org.id } } });
        if (!item) {
            item = await itemRepo.save(itemRepo.create({
                organization: org,
                itemNumber: 'CMP-001',
                description: 'Component Item',
                uom: 'Ea'
            }));
        }

        let matElem = await elemRepo.findOne({ where: { costElementCode: 'MATERIAL' } });
        if (!matElem) {
            matElem = await elemRepo.save(elemRepo.create({
                costElementCode: 'MATERIAL',
                description: 'Material Cost',
                costComponent: 'Material' as any
            }));
        }

        // 2. Define Standard Cost for Component
        console.log('2. Defining Standard Cost...');
        // Create Scenario if Current doesn't exist
        let scenario = await scenarioRepo.findOne({
            where: { costOrganization: { id: costOrg.id }, scenarioType: 'Current' }
        });

        if (!scenario) {
            scenario = await stdCostService.createScenario(costOrg.id, '2026 Current', 'Active Costs');
            await stdCostService.publishScenario(scenario.id); // Hack to make it 'Current' quickly via service logic, or manually set it.
            // Actually publishScenario archives old 'Current' and sets THIS one to 'Current'. So perfect.
        }

        // Refetch to be sure or use ID from create/find.
        // Wait, publishScenario expects an ID. If we found one, it's already current.
        // If we didn't find one, we created a Pending one. Then publish it.

        // Define Cost: Component $5.00
        // But defineStandardCost works on Scenarios. If scenario is 'Current', we might need to be careful.
        // Ideally we define on Pending and Publish.
        // For test simplicity, let's insert a cost into the Current scenario directly if service allows, or create new -> publish.
        // Let's create a NEW Pending scenario to ensure clean state, define cost, publish.

        const newScenario = await stdCostService.createScenario(costOrg.id, 'WIP Test Scenario', 'Testing WIP');
        await stdCostService.defineStandardCost(newScenario.id, item.id, matElem.id, 5.00);
        await stdCostService.publishScenario(newScenario.id);
        console.log('   Standard Cost Published: $5.00 for Component');

        // 3. Create Work Order
        console.log('3. Creating Work Order...');
        let wo = await woRepo.findOne({ where: { workOrderNumber: 'WO-1001' } });
        if (!wo) {
            wo = await woRepo.save(woRepo.create({
                organization: org,
                workOrderNumber: 'WO-1001',
                item: item,
                quantity: 10,
                status: 'Released'
            }));
        }

        // 4. Issue Material
        console.log('4. Issuing Material...');
        // Issue 2 units of Component to WO
        const issueTxn = await wipService.processMaterialIssue(wo.id, item.id, 2);

        console.log('   Material Issued.');
        console.log(`   Txn Amount: ${issueTxn.totalCost}`);

        if (Number(issueTxn.totalCost) !== 10.00) {
            throw new Error(`WIP Issue Cost Mismatch. Expected 10.00 (2 * 5.00), got ${issueTxn.totalCost}`);
        }
        console.log('   WIP Material Issue Verified.');

        // 5. Resource Charge
        console.log('5. Charging Resource...');
        const resTxn = await wipService.processResourceCharge(wo.id, 'RES-LABOR', 5, 20.00); // 5 hrs @ $20
        console.log(`   Resource Charged: ${resTxn.totalCost}`);

        if (Number(resTxn.totalCost) !== 100.00) {
            throw new Error(`WIP Resource Cost Mismatch. Expected 100.00, got ${resTxn.totalCost}`);
        }
        console.log('   WIP Resource Charge Verified.');

    } catch (e) {
        console.error('Verification Failed:', e);
        process.exit(1);
    } finally {
        await app.close();
    }
}

verifyWipCosting();
