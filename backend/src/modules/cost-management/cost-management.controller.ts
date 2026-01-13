import { Controller, Get, Param, Query, Inject, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CstItemCost } from './entities/cst-item-cost.entity';
import { CstCostDistribution } from './entities/cst-cost-distribution.entity';
import { CostManagementService } from './cost-management.service';
import { SlaService } from './sla.service';
import { CostPeriodService } from './cost-period.service';
import { ReconciliationService } from './reconciliation.service';

@Controller('api/cost-management')
export class CostManagementController {
    constructor(
        @InjectRepository(CstItemCost)
        private itemCostRepo: Repository<CstItemCost>,
        @InjectRepository(CstCostDistribution)
        private distributionRepo: Repository<CstCostDistribution>,
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
        return this.itemCostRepo.find({
            where: { inventoryOrganization: { id: orgId } },
            relations: ['item']
        });
    }

    @Get('item-costs/:orgId/:itemId')
    async getItemCostDetail(
        @Param('orgId') orgId: string,
        @Param('itemId') itemId: string
    ) {
        return this.itemCostRepo.findOne({
            where: {
                inventoryOrganization: { id: orgId },
                item: { id: itemId }
            },
            relations: ['item']
        });
    }

    @Get('valuation/:orgId')
    async getValuation(@Param('orgId') orgId: string) {
        return this.costManagementService.getWorkspaceValuation(orgId);
    }

    @Get('distributions')
    async getDistributions(@Query('transactionId') transactionId?: string) {
        const query = this.distributionRepo.createQueryBuilder('dist')
            .leftJoinAndSelect('dist.transaction', 'txn')
            .leftJoinAndSelect('txn.item', 'item')
            .orderBy('dist.createdAt', 'DESC');

        if (transactionId) {
            query.where('txn.id = :transactionId', { transactionId });
        }

        return query.take(100).getMany();
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
