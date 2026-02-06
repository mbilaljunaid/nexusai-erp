
import { Controller, Get, Param, Query, Inject, Post, Body } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../../shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { CostManagementService } from './cost-management.service';
import { SlaService } from './sla.service';
import { CostPeriodService } from './cost-period.service';
import { ReconciliationService } from './reconciliation.service';

@Controller('api/cost-management')
export class CostManagementController {
    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
        @Inject(CostManagementService)
        private costManagementService: CostManagementService,
        @Inject(SlaService)
        private slaService: SlaService,
        @Inject(CostPeriodService)
        private periodService: CostPeriodService,
        @Inject(ReconciliationService)
        private reconService: ReconciliationService
    ) { }

    @Get('item-costs/:orgId')
    async getItemCosts(@Param('orgId') orgId: string) {
        return this.db.query.cstItemCosts.findMany({
            where: eq(schema.cstItemCosts.inventoryOrganizationId, orgId),
            // Note: relations not defined in schema yet, fetching raw
        });
    }

    @Get('item-costs/:orgId/:itemId')
    async getItemCostDetail(
        @Param('orgId') orgId: string,
        @Param('itemId') itemId: string
    ) {
        return this.db.query.cstItemCosts.findFirst({
            where: and(
                eq(schema.cstItemCosts.inventoryOrganizationId, orgId),
                eq(schema.cstItemCosts.itemId, itemId)
            )
        });
    }

    @Get('valuation/:orgId')
    async getValuation(@Param('orgId') orgId: string) {
        return this.costManagementService.getWorkspaceValuation(orgId);
    }

    @Get('distributions')
    async getDistributions(@Query('transactionId') transactionId?: string) {
        // Drizzle Query equivalent
        // Left join transaction and item... sticking to simple findMany for cleanup if no relations
        if (transactionId) {
            return this.db.query.cstCostDistributions.findMany({
                where: eq(schema.cstCostDistributions.transactionId, transactionId),
                orderBy: [desc(schema.cstCostDistributions.createdAt)],
                limit: 100
            });
        }
        return this.db.query.cstCostDistributions.findMany({
            orderBy: [desc(schema.cstCostDistributions.createdAt)],
            limit: 100
        });
    }

    @Post('sla/run')
    async runSla(@Body() body: { orgId?: string }) {
        const count = await this.slaService.createAccounting(body.orgId);
        return { message: 'SLA Run Completed', processedCount: count };
    }

    @Post('periods/open')
    async openPeriod(@Body() body: { orgId: string, periodName: string }) {
        const period = await this.periodService.openPeriod(body.orgId, body.periodName);
        return { message: 'Period Opened', period };
    }

    @Post('periods/close')
    async closePeriod(@Body() body: { orgId: string, periodName: string }) {
        const period = await this.periodService.closePeriod(body.orgId, body.periodName);
        return { message: 'Period Closed', period };
    }

    @Get('reconciliation/:orgId')
    async reconcile(@Param('orgId') orgId: string) {
        return this.reconService.reconcileInventory(orgId);
    }
}
