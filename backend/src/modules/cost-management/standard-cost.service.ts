import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { CostScenario } from './entities/cost-scenario.entity';
import { CstStandardCost } from './entities/cst-standard-cost.entity';
import { Item } from '../inventory/entities/item.entity';
import { CostElement } from './entities/cost-element.entity';
import { CostOrganization } from './entities/cost-organization.entity';
import { CstItemCost } from './entities/cst-item-cost.entity';
import { CostBook } from './entities/cost-book.entity';

@Injectable()
export class StandardCostService {
    private readonly logger = new Logger(StandardCostService.name);

    constructor(
        @InjectRepository(CostScenario)
        private scenarioRepo: Repository<CostScenario>,
        @InjectRepository(CstStandardCost)
        private standardCostRepo: Repository<CstStandardCost>,
        @InjectRepository(CstItemCost)
        private activeCostRepo: Repository<CstItemCost>,
        @InjectRepository(CostOrganization)
        private costOrgRepo: Repository<CostOrganization>,
        @InjectDataSource()
        private dataSource: DataSource
    ) { }

    async createScenario(costOrgId: string, name: string, description?: string): Promise<CostScenario> {
        const scenario = this.scenarioRepo.create({
            costOrganization: { id: costOrgId } as any,
            name,
            description,
            scenarioType: 'Pending'
        });
        return this.scenarioRepo.save(scenario);
    }

    async defineStandardCost(scenarioId: string, itemId: string, elementId: string, unitCost: number): Promise<CstStandardCost> {
        // Upsert logic
        let cost = await this.standardCostRepo.findOne({
            where: {
                scenario: { id: scenarioId },
                item: { id: itemId },
                costElement: { id: elementId }
            }
        });

        if (cost) {
            cost.unitCost = unitCost;
        } else {
            cost = this.standardCostRepo.create({
                scenario: { id: scenarioId } as any,
                item: { id: itemId } as any,
                costElement: { id: elementId } as any,
                unitCost
            });
        }
        return this.standardCostRepo.save(cost);
    }

    async getScenarioRollup(scenarioId: string, itemId: string): Promise<number> {
        // Sum of all elements for this item in this scenario
        const result = await this.standardCostRepo.createQueryBuilder('c')
            .select('SUM(c.unitCost)', 'total')
            .where('c.scenario.id = :scenarioId', { scenarioId })
            .andWhere('c.item.id = :itemId', { itemId })
            .getRawOne();

        return parseFloat(result?.total || '0');
    }

    async publishScenario(scenarioId: string): Promise<void> {
        const scenario = await this.scenarioRepo.findOne({
            where: { id: scenarioId },
            relations: ['costOrganization']
        });
        if (!scenario) throw new BadRequestException('Scenario not found');
        if (scenario.scenarioType === 'Frozen' || scenario.scenarioType === 'Historical') {
            throw new BadRequestException(`Cannot publish ${scenario.scenarioType} scenario.`);
        }

        const costOrgId = scenario.costOrganization.id;
        this.logger.log(`Publishing Scenario ${scenario.name} for Org ${costOrgId}`);

        // Transactional Update
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Fetch all costs in Scenario
            const newCosts = await this.standardCostRepo.find({
                where: { scenario: { id: scenarioId } },
                relations: ['item', 'costElement']
            });

            // 2. Update CstItemCost (Active Costs)
            // Strategy: Loop and upsert. For bulk, we'd use raw SQL or batching.
            // MVP: Loop is fine for < 1000 items. 
            // Careful: CstItemCost tracks 'Active Standard'. If we delete, we lose history?
            // Actually CstItemCost is just the CURRENT cost table. History is in snapshots or txn logs.
            // We'll upsert.

            // Refactored Logic:
            // 1. Aggregate new costs by Item
            const itemTotals = new Map<string, number>();
            for (const nc of newCosts) {
                const current = itemTotals.get(nc.item.id) || 0;
                itemTotals.set(nc.item.id, current + Number(nc.unitCost));
            }

            // 2. Update Active Costs
            // Resolve Default Cost Book
            // In a real system, this comes from Cost Profile or Default setup.
            // MVP: Pick the first CostBook available.
            const costBook = await queryRunner.manager.findOne(CostBook, {
                where: {}
            });

            // If specific cost book logic is needed, add it here.
            // valid uuid fallback for test if none found (but should exist)
            const costBookId = costBook ? costBook.id : '00000000-0000-0000-0000-000000000000';

            const targetInvOrgId = scenario.costOrganization.inventoryOrganizationId;

            for (const [itemId, totalCost] of itemTotals) {
                let active = await queryRunner.manager.findOne(CstItemCost, {
                    where: {
                        inventoryOrganization: { id: targetInvOrgId },
                        item: { id: itemId }
                    }
                });

                if (!active) {
                    active = queryRunner.manager.create(CstItemCost, {
                        inventoryOrganization: { id: targetInvOrgId },
                        item: { id: itemId },
                        unitCost: totalCost,
                        currencyCode: 'USD',
                        costBook: { id: costBookId }
                    });
                } else {
                    active.unitCost = totalCost;
                }
                await queryRunner.manager.save(active);
            }

            // 3. Mark Scenario as Current
            scenario.scenarioType = 'Current';
            scenario.effectiveDate = new Date();
            await queryRunner.manager.save(scenario);

            // 4. Archive old Current
            await queryRunner.manager.createQueryBuilder()
                .update(CostScenario)
                .set({ scenarioType: 'Historical' })
                .where('costOrganizationId = :orgId', { orgId: costOrgId })
                .andWhere('id != :id', { id: scenarioId })
                .andWhere('scenarioType = :type', { type: 'Current' })
                .execute();

            await queryRunner.commitTransaction();
            this.logger.log('Scenario Published Successfully.');

        } catch (e) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Failed to publish scenario', e);
            throw e;
        } finally {
            await queryRunner.release();
        }
    }
}
