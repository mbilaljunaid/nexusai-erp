import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Services
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
const { Subinventory } = require('../backend/src/modules/inventory/entities/subinventory.entity.ts');
const { Locator } = require('../backend/src/modules/inventory/entities/locator.entity.ts');
const { Lot } = require('../backend/src/modules/inventory/entities/lot.entity.ts');
const { Serial } = require('../backend/src/modules/inventory/entities/serial.entity.ts');

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
                MaterialTransaction, CstCostDistribution, CostProfile,
                Subinventory, Locator, Lot, Serial
            ],
            synchronize: true,
        }),
        TypeOrmModule.forFeature([
            ApprovalRequest, MaterialTransaction, InventoryOrganization, Item, CostOrganization, CostProfile, CostBook,
            Subinventory, Locator, Lot, Serial
        ])
    ]
})
class SeedModule { }

async function seedLargeVolume() {
    console.log('Starting Scale Seeding (100k DB)...');
    const app = await NestFactory.createApplicationContext(SeedModule, { logger: ['error'] });
    await app.init();

    const dataSource = app.get(DataSource);
    const orgRepo = dataSource.getRepository(InventoryOrganization);
    const costOrgRepo = dataSource.getRepository(CostOrganization);
    const itemRepo = dataSource.getRepository(Item);
    const txnRepo = dataSource.getRepository(MaterialTransaction);
    const costProfileRepo = dataSource.getRepository(CostProfile);
    const costBookRepo = dataSource.getRepository(CostBook);

    try {
        console.log('1. Creating Orgs & Items...');
        // Create Orgs
        let org = await orgRepo.findOne({ where: { code: 'PERF_ORG' } });
        if (!org) {
            org = await orgRepo.save(orgRepo.create({ code: 'PERF_ORG', name: 'Performance Test Org' }));
        }

        let costOrg = await costOrgRepo.findOne({ where: { code: 'CST_PERF' } });
        if (!costOrg) {
            costOrg = await costOrgRepo.save(costOrgRepo.create({
                code: 'CST_PERF', name: 'Cost Perf Org', inventoryOrganizationId: org.id
            }));
        }

        // Setup Cost Profile/Book if needed for processor (it creates default book if missing, but cleaner to have)
        let costBook = await costBookRepo.findOne({ where: { costBookCode: 'PERF_BOOK' } });
        if (!costBook) {
            costBook = await costBookRepo.save(costBookRepo.create({ costBookCode: 'PERF_BOOK', description: 'Performance Book', currencyCode: 'USD' }));
        }



        // Create 100 Items
        const items: any[] = [];
        for (let i = 0; i < 100; i++) {
            items.push({
                organization: { id: org.id },
                itemNumber: `PERF-ITEM-${i}`,
                description: `Performance Item ${i}`,
                transactionUom: 'Ea'
            });
        }
        // Bulk Insert Items
        // Using save with chunking manually or just loop save if entity listeners matter (less likely here)
        // insert() is faster
        await itemRepo.createQueryBuilder().insert().values(items).orIgnore().execute();
        const savedItems = await itemRepo.find({ where: { organization: { id: org.id } } });
        console.log(`   Created ${savedItems.length} Items.`);

        console.log('2. Generating 100,000 Transactions...');

        const BATCH_SIZE = 5000;
        const TOTAL_RECORDS = 100000;
        let processed = 0;

        const txnsToInsert: any[] = [];

        for (let i = 0; i < TOTAL_RECORDS; i++) {
            const item = savedItems[i % 100];
            txnsToInsert.push({
                organization: { id: org.id },
                item: { id: item.id },
                transactionType: 'PO Receipt',
                transactionDate: new Date(),
                quantity: 10,
                uom: 'Ea',
                sourceDocumentType: 'PO',
                sourceDocumentId: `PO-${i}`,
                reference: `LargeVol-${i}`
            });

            if (txnsToInsert.length >= BATCH_SIZE) {
                await txnRepo.createQueryBuilder().insert().values(txnsToInsert).execute();
                processed += txnsToInsert.length;
                console.log(`   Inserted ${processed} / ${TOTAL_RECORDS}`);
                txnsToInsert.length = 0; // Clear array
            }
        }

        // Final batch
        if (txnsToInsert.length > 0) {
            await txnRepo.createQueryBuilder().insert().values(txnsToInsert).execute();
            processed += txnsToInsert.length;
        }

        console.log(`COMPLETE. ${processed} transactions inserted.`);

    } catch (e) {
        console.error('Seeding Failed:', e);
        process.exit(1);
    } finally {
        await app.close();
    }
}

seedLargeVolume();
