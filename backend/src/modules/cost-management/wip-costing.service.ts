import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WipTransaction, WipTransactionType } from './entities/wip-transaction.entity';
import { WorkOrder } from '../manufacturing/entities/work-order.entity';
import { CstStandardCost } from './entities/cst-standard-cost.entity';
import { CostOrganization } from './entities/cost-organization.entity';

@Injectable()
export class WipCostingService {
    private readonly logger = new Logger(WipCostingService.name);

    constructor(
        @InjectRepository(WipTransaction)
        private wipTxnRepo: Repository<WipTransaction>,
        @InjectRepository(WorkOrder)
        private woRepo: Repository<WorkOrder>,
        @InjectDataSource() // Add decorator
        private dataSource: DataSource
    ) { }

    async processMaterialIssue(woId: string, itemId: string, quantity: number): Promise<WipTransaction> {
        return this.dataSource.transaction(async manager => {
            const wo = await manager.findOne(WorkOrder, {
                where: { id: woId },
                relations: ['organization']
            });
            if (!wo) throw new Error('Work Order not found');

            // 1. Get Standard Cost for Component Item
            // Simplified: Fetching latest current standard cost.
            // Real world: Need Cost Scenario context.
            const stdCost = await manager.findOne(CstStandardCost, {
                where: {
                    item: { id: itemId },
                    scenario: {
                        scenarioType: 'Current',
                        costOrganization: { inventoryOrganizationId: wo.organization.id } as any
                    }
                }
            });

            const unitCost = stdCost ? Number(stdCost.unitCost) : 0;
            const totalCost = unitCost * quantity;

            // 2. Create WIP Transaction
            const txn = manager.create(WipTransaction, {
                organization: wo.organization,
                workOrder: wo,
                transactionType: 'Material Issue',
                item: { id: itemId },
                quantity: quantity,
                uom: 'Ea', // Placeholder
                unitCost: unitCost,
                totalCost: totalCost,
                currencyCode: 'USD'
            });

            this.logger.log(`WIP Material Issue: WO ${wo.workOrderNumber}, Item ${itemId}, Qty ${quantity} @ ${unitCost} = ${totalCost}`);
            return await manager.save(txn);
        });
    }

    async processResourceCharge(woId: string, resourceId: string, hours: number, rate: number): Promise<WipTransaction> {
        return this.dataSource.transaction(async manager => {
            const wo = await manager.findOne(WorkOrder, {
                where: { id: woId },
                relations: ['organization']
            });
            if (!wo) throw new Error('Work Order not found');

            const totalCost = hours * rate;

            const txn = manager.create(WipTransaction, {
                organization: wo.organization,
                workOrder: wo,
                transactionType: 'Resource Charge',
                quantity: hours,
                uom: 'Hr',
                unitCost: rate,
                totalCost: totalCost,
                currencyCode: 'USD'
            });

            this.logger.log(`WIP Resource Charge: WO ${wo.workOrderNumber}, ${hours} hrs @ ${rate} = ${totalCost}`);
            return await manager.save(txn);
        });
    }
}
