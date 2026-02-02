import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Services
const { StandardCostService } = require('../backend/src/modules/cost-management/standard-cost.service.ts');

// Entities
const { CostScenario } = require('../backend/src/modules/cost-management/entities/cost-scenario.entity.ts');
const { CstStandardCost } = require('../backend/src/modules/cost-management/entities/cst-standard-cost.entity.ts');
const { CostOrganization } = require('../backend/src/modules/cost-management/entities/cost-organization.entity.ts');
const { CstItemCost } = require('../backend/src/modules/cost-management/entities/cst-item-cost.entity.ts');
const { CostElement } = require('../backend/src/modules/cost-management/entities/cost-element.entity.ts');
const { Item } = require('../backend/src/modules/inventory/entities/item.entity.ts');
const { InventoryOrganization } = require('../backend/src/modules/inventory/entities/inventory-organization.entity.ts');
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
                CostScenario, CstStandardCost, CostOrganization, CstItemCost,
                CostElement, Item, InventoryOrganization, CostBook
            ],
            synchronize: true, // Allow schema updates for new entities
        }),
        TypeOrmModule.forFeature([
            CostScenario, CstStandardCost, CostOrganization, CstItemCost,
            CostElement, Item, InventoryOrganization, CostBook
        ])
    ],
    providers: [
        StandardCostService
    ]
})
class TestModule { }

async function verifyStandardCosting() {
    console.log('Starting Standard Costing Verification...');
    const app = await NestFactory.createApplicationContext(TestModule, { logger: ['error', 'warn'] }); // Less verbose
    await app.init();

    const stdCostService = app.get(StandardCostService);
    const dataSource = app.get(DataSource);

    // Setup Managers
    const orgRepo = dataSource.getRepository(InventoryOrganization);
    const costOrgRepo = dataSource.getRepository(CostOrganization);
    const costBookRepo = dataSource.getRepository(CostBook);
    const itemRepo = dataSource.getRepository(Item);
    const elemRepo = dataSource.getRepository(CostElement);
    const activeCostRepo = dataSource.getRepository(CstItemCost);

    try {
        // 1. Setup Data
        console.log('1. Setting up Test Data...');
        let org = await orgRepo.findOne({ where: {} });
        if (!org) {
            org = await orgRepo.save(orgRepo.create({ code: 'STD_TEST_ORG', name: 'Std Cost Org' }));
        }

        let costOrg = await costOrgRepo.findOne({ where: { inventoryOrganizationId: org.id } });
        if (!costOrg) {
            costOrg = await costOrgRepo.save(costOrgRepo.create({
                code: 'CST_STD',
                name: 'Standard Cost Org',
                inventoryOrganizationId: org.id
            }));
        }

        let costBook = await costBookRepo.findOne({ where: {} });
        if (!costBook) {
            costBook = await costBookRepo.save(costBookRepo.create({
                costBookCode: 'STD_BOOK',
                description: 'Standard Cost Book',
                currencyCode: 'USD',
                isActive: true
            }));
        }

        let item = await itemRepo.findOne({ where: { organization: { id: org.id } } });
        if (!item) {
            item = await itemRepo.save(itemRepo.create({
                organization: org,
                itemNumber: 'STD-ITEM-001',
                description: 'Standard Cost Test Item',
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

        let ohElem = await elemRepo.findOne({ where: { costElementCode: 'OVERHEAD' } });
        if (!ohElem) {
            ohElem = await elemRepo.save(elemRepo.create({
                costElementCode: 'OVERHEAD',
                description: 'Overhead Cost',
                costComponent: 'Overhead' as any
            }));
        }

        // 2. Define Scenario
        console.log('2. Creating Cost Scenario...');
        const scenario = await stdCostService.createScenario(costOrg.id, '2026 Standard', 'Pending 2026 Costs');
        console.log(`   Scenario Created: ${scenario.name} (${scenario.id})`);

        // 3. Define Costs
        console.log('3. Defining Standard Costs...');
        await stdCostService.defineStandardCost(scenario.id, item.id, matElem.id, 10.00); // Material $10
        await stdCostService.defineStandardCost(scenario.id, item.id, ohElem.id, 2.50);   // Overhead $2.50
        console.log('   Costs Defined.');

        // 4. Rollup Verification
        console.log('4. Verifying Rollup...');
        const rollup = await stdCostService.getScenarioRollup(scenario.id, item.id);
        console.log(`   Rollup Total: ${rollup}`);

        if (rollup !== 12.50) {
            throw new Error(`Rollup Mismatch. Expected 12.50, got ${rollup}`);
        }
        console.log('   Rollup Verified.');

        // 5. Publish
        console.log('5. Publishing Scenario...');
        await stdCostService.publishScenario(scenario.id);
        console.log('   Scenario Published.');

        // 6. Verify Active Cost
        console.log('6. Verifying Active Item Cost...');
        const activeCost = await activeCostRepo.findOne({
            where: { inventoryOrganization: { id: org.id }, item: { id: item.id } }
        });

        if (!activeCost) {
            throw new Error('Active Cost not found after publish!');
        }

        console.log(`   Active Cost: ${activeCost.unitCost}`);

        if (Number(activeCost.unitCost) !== 12.50) {
            throw new Error(`Active Cost Mismatch. Expected 12.50, got ${activeCost.unitCost}`);
        }
        console.log('   Active Cost Verified.');

    } catch (e) {
        console.error('Verification Failed:', e);
        process.exit(1);
    } finally {
        await app.close();
    }
}

verifyStandardCosting();
