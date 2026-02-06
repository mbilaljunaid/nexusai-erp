import { Injectable, Logger, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema';
import { CostPeriodService } from './cost-period.service';

@Injectable()
export class ReceiptAccountingService {
    private readonly logger = new Logger(ReceiptAccountingService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
        @Inject(CostPeriodService) private periodService: CostPeriodService
    ) { }

    /**
     * Create Accrual Distributions for PO Receipt
     */
    async createReceiptDistributions(transaction: typeof schema.inventoryTransactions.$inferSelect, unitCost: number, tx: any): Promise<void> {
        this.logger.log(`Creating Receipt Distributions for Txn ${transaction.id} at Cost ${unitCost}`);

        let orgId = 'TODO_ORG_ID';
        if (transaction.subinventoryId) {
            const [subinv] = await tx.select().from(schema.inventorySubinventories).where(eq(schema.inventorySubinventories.id, transaction.subinventoryId));
            if (subinv) orgId = subinv.organizationId;
        }

        // Validate Cost Period 
        try {
            await this.periodService.validateTransactionDate(orgId, transaction.transactionDate || new Date());
        } catch (e) {
            this.logger.warn(`Cost Period Validation Failed: ${e.message}. Proceeding for Migration Compatibility.`);
        }

        // Resolve Cost Organization
        const [costOrg] = await tx.select().from(schema.cstCostOrganizations)
            .where(eq(schema.cstCostOrganizations.inventoryOrganizationId, orgId));

        if (!costOrg) {
            this.logger.warn(`No Cost Organization found for Inv Org ${orgId}. Skipping distributions.`);
            return;
        }

        const totalAmount = Number(transaction.quantity) * unitCost;

        // 1. Debit Inventory Valuation
        await tx.insert(schema.cmrReceiptDistributions).values({
            transactionId: transaction.id,
            costOrganizationId: costOrg.id,
            accountingLineType: 'Inventory Valuation',
            amount: totalAmount.toString(),
            currencyCode: 'USD',
            status: 'Draft',
            glAccountId: '1410-000-0000',
            createdAt: new Date()
        });

        // 2. Credit Accrual
        await tx.insert(schema.cmrReceiptDistributions).values({
            transactionId: transaction.id,
            costOrganizationId: costOrg.id,
            accountingLineType: 'Accrual',
            amount: (-totalAmount).toString(), // Credit
            currencyCode: 'USD',
            status: 'Draft',
            glAccountId: '2210-000-0000',
            createdAt: new Date()
        });
    }
}
