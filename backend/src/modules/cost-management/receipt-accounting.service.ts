import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CmrReceiptDistribution } from './entities/cmr-receipt-distribution.entity';
import { MaterialTransaction } from '../inventory/entities/material-transaction.entity';
import { CostOrganization } from './entities/cost-organization.entity';
import { CostPeriodService } from './cost-period.service';

@Injectable()
export class ReceiptAccountingService {
    private readonly logger = new Logger(ReceiptAccountingService.name);

    constructor(
        @InjectRepository(CmrReceiptDistribution)
        private distributionRepo: Repository<CmrReceiptDistribution>,
        @InjectRepository(CostOrganization)
        private costOrgRepo: Repository<CostOrganization>,
        @Inject(CostPeriodService)
        private periodService: CostPeriodService
    ) { }

    /**
     * Create Accrual Distributions for PO Receipt
     */
    async createReceiptDistributions(transaction: MaterialTransaction, unitCost: number): Promise<void> {
        this.logger.log(`Creating Receipt Distributions for Txn ${transaction.id} at Cost ${unitCost}`);

        if (!transaction.organization) {
            throw new Error('Transaction missing Inventory Organization');
        }

        // Validate Cost Period
        await this.periodService.validateTransactionDate(transaction.organization.id, transaction.transactionDate);

        // Resolve Cost Organization
        // Use QB or type cast to resolve
        const costOrg = await this.costOrgRepo.findOne({
            where: { inventoryOrganizationId: transaction.organization.id } as any
        });
        if (!costOrg) throw new Error(`No Cost Organization found for Inv Org ${transaction.organization.id}`);

        const totalAmount = Number(transaction.quantity) * unitCost;

        // 1. Debit Inventory Valuation
        const debitLine = new CmrReceiptDistribution();
        debitLine.transaction = transaction;
        debitLine.costOrganization = costOrg;
        debitLine.accountingLineType = 'Inventory Valuation';
        debitLine.amount = totalAmount;
        debitLine.currencyCode = 'USD'; // Placeholder
        debitLine.status = 'Draft';
        debitLine.glAccountId = '1410-000-0000'; // Inventory Asset Account

        // 2. Credit Accrual
        const creditLine = new CmrReceiptDistribution();
        creditLine.transaction = transaction;
        creditLine.costOrganization = costOrg;
        creditLine.accountingLineType = 'Accrual';
        creditLine.amount = totalAmount;
        creditLine.glAccountId = '2210-000-0000'; // Accrual Liability Account
        creditLine.currencyCode = 'USD';
        creditLine.status = 'Draft';

        await this.distributionRepo.save([debitLine, creditLine]);
    }
}
