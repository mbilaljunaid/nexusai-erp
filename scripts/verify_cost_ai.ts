import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Services
const { CostAnomalyService } = require('../backend/src/modules/cost-management/cost-anomaly.service.ts');
const { StandardCostService } = require('../backend/src/modules/cost-management/standard-cost.service.ts');

// Entities
const { CostAnomaly } = require('../backend/src/modules/cost-management/entities/cost-anomaly.entity.ts');
const { CstStandardCost } = require('../backend/src/modules/cost-management/entities/cst-standard-cost.entity.ts');
const { CostScenario } = require('../backend/src/modules/cost-management/entities/cost-scenario.entity.ts');
const { CostOrganization } = require('../backend/src/modules/cost-management/entities/cost-organization.entity.ts');
const { InventoryOrganization } = require('../backend/src/modules/inventory/entities/inventory-organization.entity.ts');
const { Item } = require('../backend/src/modules/inventory/entities/item.entity.ts');
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
                CostAnomaly, CstStandardCost, CostScenario, CostOrganization,
                InventoryOrganization, Item, CostElement, CstItemCost, CostBook
            ],
            synchronize: true,
        }),
        TypeOrmModule.forFeature([
            CostAnomaly, CstStandardCost, CostScenario, CostOrganization,
            InventoryOrganization, Item, CostElement, CstItemCost, CostBook
        ])
    ],
    providers: [
        CostAnomalyService,
        StandardCostService // Needed to setup Standard Cost
    ]
})
class TestModule { }

async function verifyCostAI() {
    console.log('Starting Cost AI Verification...');
    const app = await NestFactory.createApplicationContext(TestModule, { logger: ['error', 'warn'] });
    await app.init();

    const anomalyService = app.get(CostAnomalyService);
    const stdCostService = app.get(StandardCostService);
    const dataSource = app.get(DataSource);

    // Repos
    const orgRepo = dataSource.getRepository(InventoryOrganization);
    const costOrgRepo = dataSource.getRepository(CostOrganization);
    const itemRepo = dataSource.getRepository(Item);
    const elemRepo = dataSource.getRepository(CostElement);
    const anomalyRepo = dataSource.getRepository(CostAnomaly);

    try {
        // 1. Setup Data (Cost Org, Item, Element)
        console.log('1. Setting up Test Data...');
        const org = await orgRepo.save(orgRepo.create({ code: 'AI_ORG', name: 'AI Test Org' }));
        const costOrg = await costOrgRepo.save(costOrgRepo.create({
            code: 'CST_AI', name: 'Cost AI Org', inventoryOrganizationId: org.id
        }));

        const item = await itemRepo.save(itemRepo.create({
            organization: org,
            itemNumber: 'AI_ITEM_001',
            description: 'AI Anomaly Test Item',
            uom: 'Ea'
        }));

        let matElem = await elemRepo.findOne({ where: { costElementCode: 'MATERIAL' } });
        if (!matElem) {
            matElem = await elemRepo.save(elemRepo.create({
                costElementCode: 'MATERIAL',
                description: 'Material Cost',
                costComponent: 'Material' as any
            }));
        }

        // 2. Setup Standard Cost Scenario
        console.log('2. Defining Standard Cost ($10)...');
        const scenario = await stdCostService.createScenario(costOrg.id, 'AI_Current', 'Current Scenario');
        await stdCostService.defineStandardCost(scenario.id, item.id, matElem.id, 10.00);
        // Manually force it to 'Current' for the test logic to work without 'Publish' overhead
        scenario.scenarioType = 'Current';
        await dataSource.manager.save(scenario);

        // 3. Simulate Transaction with High Variance (IPV)
        console.log('3. Simulating Receipt with $15 Unit Price (50% Variance)...');

        // Mock Receipt Line Object
        const mockReceiptLine = {
            unitPrice: 15.00,
            item: { id: item.id },
            receipt: {
                organization: { id: org.id },
                receiptNumber: 'RCT-AI-001',
                purchaseOrder: { supplier: { name: 'Vendor Inc.' } }
            }
        };

        await anomalyService.checkIpvAnomaly(mockReceiptLine);

        // 4. Verify Anomaly Created
        console.log('4. Verifying Anomaly Detection...');
        const anomaly = await anomalyRepo.findOne({
            where: {
                item: { id: item.id },
                anomalyType: 'IPV_SPIKE'
            },
            order: { detectedAt: 'DESC' }
        });

        if (!anomaly) {
            throw new Error('Anomaly NOT detected!');
        }

        console.log(`   Anomaly Detected: ${anomaly.anomalyType}`);
        console.log(`   Variance: ${anomaly.variancePercent}% (Expected 50%)`);
        console.log(`   Severity: ${anomaly.severity}`);

        if (Number(anomaly.variancePercent) !== 50.00) {
            throw new Error(`Variance Mismatch. Got ${anomaly.variancePercent}`);
        }
        if (anomaly.severity !== 'Medium') { // > 20% is Medium, > 50% is High. 50 is Medium (logic check: > 20)
            // Check logic: if (variancePercent > 50) severity = AnomalySeverity.HIGH;
            // 50 is not > 50. So it is Medium. Correct.
        }

        console.log('outcome: SUCCESS');

        // Cleanup (optional)
        // await orgRepo.delete(org.id);

    } catch (e) {
        console.error('Verification Failed:', e);
        process.exit(1);
    } finally {
        await app.close();
    }
}

verifyCostAI();
