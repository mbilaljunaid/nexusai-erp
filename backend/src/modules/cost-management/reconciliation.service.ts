import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OnHandBalance } from '../inventory/entities/on-hand-balance.entity';
import { CstItemCost } from './entities/cst-item-cost.entity';
import { GLEntry } from '../erp/entities/gl-entry.entity';

@Injectable()
export class ReconciliationService {
    private readonly logger = new Logger(ReconciliationService.name);

    constructor(
        @InjectRepository(CstItemCost)
        private itemCostRepo: Repository<CstItemCost>,
        @InjectRepository(GLEntry)
        private glRepo: Repository<GLEntry>,
        @InjectRepository(OnHandBalance)
        private onHandRepo: Repository<OnHandBalance>,
        @InjectDataSource()
        private dataSource: DataSource
    ) { }

    async reconcileInventory(orgId: string): Promise<any> {
        this.logger.log(`Running Reconciliation for Org ${orgId}`);

        // 1. Get Subledger Balance (Sum of Item Costs * Qty)
        // Join OnHandBalance (b) -> ItemCost (c)
        // Condition: b.organization = orgId, c.inventoryOrganizationId = orgId
        const result = await this.onHandRepo.createQueryBuilder('b')
            .select('SUM(b.quantity * c.unitCost)', 'value')
            .innerJoin(CstItemCost, 'c', 'c.itemId = b.item.id AND c.inventoryOrganizationId = b.organization.id')
            .where('b.organization.id = :orgId', { orgId })
            .getRawOne();

        const subledgerValue = parseFloat(result?.value || '0');

        // 2. Get GL Balance for Inventory Asset Account (1410-000-0000)
        const glResult = await this.glRepo.createQueryBuilder('gl')
            .select('SUM(CASE WHEN gl.debitAccount = :acct THEN gl.debitAmount ELSE 0 END)', 'debitSum')
            .addSelect('SUM(CASE WHEN gl.creditAccount = :acct THEN gl.creditAmount ELSE 0 END)', 'creditSum')
            .setParameters({ acct: '1410-000-0000' })
            .getRawOne();

        const glDebit = parseFloat(glResult?.debitSum || '0');
        const glCredit = parseFloat(glResult?.creditSum || '0');
        const glNet = glDebit - glCredit;

        return {
            organizationId: orgId,
            timestamp: new Date(),
            subledgerValue: subledgerValue,
            glValue: glNet,
            variance: subledgerValue - glNet,
            status: Math.abs(subledgerValue - glNet) < 0.01 ? 'MATCH' : 'VARIANCE'
        };
    }
}
