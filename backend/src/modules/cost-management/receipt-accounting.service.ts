import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CmrReceiptDistribution } from './entities/cmr-receipt-distribution.entity';
import { MaterialTransaction } from '../inventory/entities/material-transaction.entity';
import { CostOrganization } from './entities/cost-organization.entity';

@Injectable()
export class ReceiptAccountingService {
    private readonly logger = new Logger(ReceiptAccountingService.name);

    constructor(
        @InjectRepository(CmrReceiptDistribution)
        private distributionRepo: Repository<CmrReceiptDistribution>,
    ) { }

    /**
     * Create Accrual Distributions for PO Receipt
     * Dr Inventory Valuation (at PO Price)
     * Cr Expense / Accrual (at PO Price)
     */
    async createReceiptDistributions(transaction: MaterialTransaction, unitCost: number): Promise<void> {
        this.logger.log(`Creating Receipt Distributions for Txn ${transaction.id} at Cost ${unitCost}`);

        const totalAmount = Number(transaction.quantity) * unitCost;

        // 1. Debit Inventory Valuation
        const debitLine = new CmrReceiptDistribution();
        debitLine.transaction = transaction;
        // debitLine.costOrganization = ... (Need to resolve from Inventory Org)
        debitLine.accountingLineType = 'Inventory Valuation';
        debitLine.amount = totalAmount;
        debitLine.currencyCode = 'USD'; // Placeholder
        debitLine.status = 'Draft';
        debitLine.glAccountId = '1410-000-0000'; // Inventory Asset Account

        // 2. Credit Accrual
        const creditLine = new CmrReceiptDistribution();
        creditLine.transaction = transaction;
        creditLine.accountingLineType = 'Accrual';
        creditLine.amount = totalAmount; // Positive amount, will be treated as Credit by SLA logic derived from line type or just pairing
        // For simple pairing in SlaService, we assume strict PAIRS.
        // We need to ensure SlaService logic handles this. 
        // SlaService uses glAccountId from here.

        creditLine.glAccountId = '2210-000-0000'; // Accrual Liability Account
        creditLine.currencyCode = 'USD';
        creditLine.status = 'Draft';

        await this.distributionRepo.save([debitLine, creditLine]);
    }
}
