import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Services
const { ApprovalService } = require('../backend/src/modules/cost-management/approval.service.ts');
const { StandardCostService } = require('../backend/src/modules/cost-management/standard-cost.service.ts');

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
                InventoryOrganization, Item, CostElement, CstItemCost, CostBook
            ],
            synchronize: true,
        }),
        TypeOrmModule.forFeature([
            ApprovalRequest, CstStandardCost, CostScenario, CostOrganization,
            InventoryOrganization, Item, CostElement, CstItemCost, CostBook
        ])
    ],
    providers: [
        ApprovalService,
        StandardCostService
    ]
})
class TestModule { }

async function verifyApproval() {
    console.log('Starting Approval Workflow Verification...');
    const app = await NestFactory.createApplicationContext(TestModule, { logger: ['error', 'warn'] });
    await app.init();

    const approvalService = app.get(ApprovalService);
    const stdCostService = app.get(StandardCostService); // This triggers onModuleInit -> registerCallback
    const dataSource = app.get(DataSource);

    const scenarioRepo = dataSource.getRepository(CostScenario);
    const orgRepo = dataSource.getRepository(InventoryOrganization);
    const costOrgRepo = dataSource.getRepository(CostOrganization);
    const approvalRepo = dataSource.getRepository(ApprovalRequest);

    try {
        // 1. Setup Test Data
        console.log('1. Setting up Test Data...');
        const org = await orgRepo.save(orgRepo.create({ code: 'WF_ORG', name: 'Workflow Test Org' }));
        const costOrg = await costOrgRepo.save(costOrgRepo.create({
            code: 'CST_WF', name: 'Cost WF Org', inventoryOrganizationId: org.id
        }));

        const scenario = await stdCostService.createScenario(costOrg.id, 'WF_Scenario', 'Testing Workflow');
        console.log(`   Scenario Created: ${scenario.name} (${scenario.id})`);

        // 2. Attempt Publish (Should Create Request)
        console.log('2. Requesting Publish (Should be Pending)...');
        await stdCostService.publishScenario(scenario.id, 'jdoe');

        const request = await approvalRepo.findOne({
            where: { entityType: 'COST_SCENARIO', entityId: scenario.id, status: 'PENDING' }
        });

        if (!request) {
            throw new Error('Approval Request NOT created!');
        }
        console.log(`   Approval Request Created: ${request.id}`);

        // Verify Scenario is NOT 'Current' yet
        const pendingScenario = await scenarioRepo.findOne({ where: { id: scenario.id } });
        if (pendingScenario!.scenarioType === 'Current') {
            throw new Error('Scenario published prematurely!');
        }
        console.log('   Scenario check: Still Pending.');

        // 3. Approve Request
        console.log('3. Approving Request...');
        const managerId = 'manager_001';
        await approvalService.approve(request.id, managerId);
        console.log('   Request Approved.');

        // 4. Verify Publish Execution
        console.log('4. Verifying Scenario Execution...');
        // Wait a small tick if async - but here simple await should work as callback is await-ed in approve()
        const activeScenario = await scenarioRepo.findOne({ where: { id: scenario.id } });

        if (activeScenario!.scenarioType !== 'Current') {
            throw new Error('Scenario NOT published after approval!');
        }
        console.log(`   Scenario Status: ${activeScenario!.scenarioType} (SUCCESS)`);

        console.log('outcome: SUCCESS');

    } catch (e) {
        console.error('Verification Failed:', e);
        process.exit(1);
    } finally {
        await app.close();
    }
}

verifyApproval();
