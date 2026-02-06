import { Injectable, Logger, BadRequestException, OnModuleInit, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, sql, not } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema';
import { CostApprovalService } from './approval.service';

@Injectable()
export class StandardCostService implements OnModuleInit {
    private readonly logger = new Logger(StandardCostService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
        @Inject(CostApprovalService) private approvalService: CostApprovalService
    ) { }

    onModuleInit() {
        // Register callback for auto-publishing upon approval
        this.approvalService.registerCallback('COST_SCENARIO', this.executePublish.bind(this));
    }

    async createScenario(costOrgId: string, name: string, description?: string): Promise<typeof schema.cstCostScenarios.$inferSelect> {
        const [scenario] = await this.db.insert(schema.cstCostScenarios).values({
            costOrganizationId: costOrgId,
            name,
            description,
            scenarioType: 'Pending'
        }).returning();
        return scenario;
    }

    async defineStandardCost(scenarioId: string, itemId: string, elementId: string, unitCost: number): Promise<typeof schema.cstStandardCosts.$inferSelect> {
        // Find existing to update or insert
        const [existing] = await this.db.select().from(schema.cstStandardCosts)
            .where(and(
                eq(schema.cstStandardCosts.scenarioId, scenarioId),
                eq(schema.cstStandardCosts.itemId, itemId),
                eq(schema.cstStandardCosts.costElementId, elementId)
            ));

        if (existing) {
            const [updated] = await this.db.update(schema.cstStandardCosts)
                .set({ unitCost: unitCost.toString(), updatedAt: new Date() })
                .where(eq(schema.cstStandardCosts.id, existing.id))
                .returning();
            return updated;
        } else {
            const [created] = await this.db.insert(schema.cstStandardCosts).values({
                scenarioId,
                itemId,
                costElementId: elementId,
                unitCost: unitCost.toString()
            }).returning();
            return created;
        }
    }

    async getScenarioRollup(scenarioId: string, itemId: string): Promise<number> {
        const [result] = await this.db.select({
            total: sql<number>`SUM(${schema.cstStandardCosts.unitCost})`
        })
            .from(schema.cstStandardCosts)
            .where(and(
                eq(schema.cstStandardCosts.scenarioId, scenarioId),
                eq(schema.cstStandardCosts.itemId, itemId)
            ));

        return Number(result?.total || 0);
    }

    async publishScenario(scenarioId: string, requesterId: string = 'SYS'): Promise<any> {
        const [scenario] = await this.db.select().from(schema.cstCostScenarios).where(eq(schema.cstCostScenarios.id, scenarioId));

        if (!scenario) throw new BadRequestException('Scenario not found');
        if (scenario.scenarioType === 'Frozen' || scenario.scenarioType === 'Historical') {
            throw new BadRequestException(`Cannot publish ${scenario.scenarioType} scenario.`);
        }

        const approvalRequired = true; // Mock Config

        if (approvalRequired) {
            this.logger.log(`Approval Required for Scenario ${scenario.name}. Creating Request...`);
            return this.approvalService.submitRequest(requesterId, 'COST_SCENARIO', scenarioId, { action: 'PUBLISH' });
        } else {
            return this.executePublish(scenarioId);
        }
    }

    async executePublish(scenarioId: string): Promise<void> {
        const [scenario] = await this.db.select().from(schema.cstCostScenarios).where(eq(schema.cstCostScenarios.id, scenarioId));
        if (!scenario) throw new BadRequestException('Scenario not found (in execute)');

        const costOrgId = scenario.costOrganizationId; // FK assumed valid if scenario exists
        this.logger.log(`Publishing Scenario ${scenario.name} for Org ${costOrgId}`);

        // Fetch Org to get InvOrgId (needed for ItemCost table)
        const [costOrg] = await this.db.select().from(schema.cstCostOrganizations).where(eq(schema.cstCostOrganizations.id, costOrgId!));
        if (!costOrg) throw new BadRequestException('Cost Org not found');

        const targetInvOrgId = costOrg.inventoryOrganizationId;

        return this.db.transaction(async (tx) => {
            // 1. Fetch all costs in Scenario
            const newCosts = await tx.select().from(schema.cstStandardCosts)
                .where(eq(schema.cstStandardCosts.scenarioId, scenarioId));

            // 2. Aggregate new costs by Item
            const itemTotals = new Map<string, number>();
            for (const nc of newCosts) {
                const current = itemTotals.get(nc.itemId!) || 0;
                itemTotals.set(nc.itemId!, current + Number(nc.unitCost));
            }

            // 3. Update Active Costs
            const [costBook] = await tx.select().from(schema.cstCostBooks).limit(1);
            const costBookId = costBook ? costBook.id : '00000000-0000-0000-0000-000000000000';

            for (const [itemId, totalCost] of itemTotals) {
                const [active] = await tx.select().from(schema.cstItemCosts)
                    .where(and(
                        eq(schema.cstItemCosts.inventoryOrganizationId, targetInvOrgId),
                        eq(schema.cstItemCosts.itemId, itemId)
                    ));

                if (!active) {
                    await tx.insert(schema.cstItemCosts).values({
                        inventoryOrganizationId: targetInvOrgId,
                        itemId: itemId,
                        unitCost: totalCost.toString(),
                        currencyCode: 'USD',
                        costBookId: costBookId
                    });
                } else {
                    await tx.update(schema.cstItemCosts)
                        .set({
                            unitCost: totalCost.toString(),
                            updatedAt: new Date()
                        })
                        .where(eq(schema.cstItemCosts.id, active.id));
                }
            }

            // 4. Mark Scenario as Current
            await tx.update(schema.cstCostScenarios)
                .set({
                    scenarioType: 'Current',
                    effectiveDate: new Date(),
                    updatedAt: new Date()
                })
                .where(eq(schema.cstCostScenarios.id, scenarioId));

            // 5. Archive old Current
            if (costOrgId) {
                await tx.update(schema.cstCostScenarios)
                    .set({ scenarioType: 'Historical', updatedAt: new Date() })
                    .where(and(
                        eq(schema.cstCostScenarios.costOrganizationId, costOrgId),
                        not(eq(schema.cstCostScenarios.id, scenarioId)),
                        eq(schema.cstCostScenarios.scenarioType, 'Current')
                    ));
            }

            this.logger.log('Scenario Published Successfully.');
        });
    }
}
