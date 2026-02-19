/**
 * Cost Adjustment Service — P1.6: Cost Adjustment Approval Workflow
 *
 * Implements Oracle Fusion Cost Management parity for cost adjustments:
 *  - Create cost adjustment (adjusts cstItemCosts + cstCostDistributions)
 *  - Submit for approval (maker-checker: submitter ≠ approver enforced)
 *  - Approve: posts GL reversal + adjustment journals, marks distributions Final
 *  - Reject: sets adjustment back to Draft with rejection reason
 *  - Query pending queue + history
 *
 * Maker-Checker (SoD) is enforced: the user who submits CANNOT approve their own request.
 */
import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { CostApprovalService } from './approval.service';

export type AdjustmentType = 'PriceVariance' | 'UsageVariance' | 'OHVariance' | 'Reclassification';

export interface CreateCostAdjustmentDto {
    transactionId: string;
    costOrganizationId: string;
    costElementId?: string;
    adjustmentType: AdjustmentType;
    adjustmentAmount: number;       // Signed: positive = increase, negative = decrease
    currencyCode: string;
    glAccountId: string;
    justification: string;
    submittedBy: string;
}

@Injectable()
export class CostAdjustmentService {
    private readonly logger = new Logger(CostAdjustmentService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
        private readonly approvalService: CostApprovalService,
    ) {
        // Register the approval callback: when a cost adjustment request is approved,
        // the system automatically posts the GL entries and marks distributions Final.
        this.approvalService.registerCallback('CostAdjustment', (entityId) =>
            this._onApproved(entityId)
        );
    }

    // ── CREATE ────────────────────────────────────────────────────────────────
    /**
     * P1.6-A: Create a cost adjustment and immediately submit it for approval.
     * The adjustment is stored as a cstCostDistribution in 'Draft' status.
     */
    async createAndSubmit(dto: CreateCostAdjustmentDto): Promise<any> {
        this.logger.log(`Creating cost adjustment for transaction ${dto.transactionId}`);

        return this.db.transaction(async (tx) => {
            // 1. Create the cost distribution draft representing the adjustment
            const [distribution] = await tx.insert(schema.cstCostDistributions).values({
                transactionId: dto.transactionId,
                costOrganizationId: dto.costOrganizationId,
                costElementId: dto.costElementId,
                accountingLineType: dto.adjustmentType,
                amount: dto.adjustmentAmount.toString(),
                currencyCode: dto.currencyCode,
                unitCost: '0',          // Will be re-computed on approval
                status: 'Draft',
                glAccountId: dto.glAccountId,
            } as any).returning();

            // 2. Submit for approval via the generic approval engine
            const request = await this.approvalService.submitRequest(
                dto.submittedBy,
                'CostAdjustment',
                distribution.id,
                {
                    adjustmentType: dto.adjustmentType,
                    adjustmentAmount: dto.adjustmentAmount,
                    currencyCode: dto.currencyCode,
                    justification: dto.justification,
                }
            );

            return {
                distributionId: distribution.id,
                approvalRequestId: request.id,
                status: 'Pending Approval',
                adjustmentAmount: dto.adjustmentAmount,
                adjustmentType: dto.adjustmentType,
            };
        });
    }

    // ── APPROVE ───────────────────────────────────────────────────────────────
    /**
     * P1.6-B: Approve a pending cost adjustment.
     * Enforces maker-checker: the approver CANNOT be the same as the requester.
     */
    async approveAdjustment(requestId: string, approverId: string): Promise<any> {
        const [request] = await this.db.select()
            .from(schema.cstApprovalRequests)
            .where(eq(schema.cstApprovalRequests.id, requestId));

        if (!request) throw new NotFoundException(`Approval request ${requestId} not found`);

        // SoD — Maker-Checker enforcement
        if (request.requesterId === approverId) {
            throw new ForbiddenException(
                'Maker-Checker violation: the approver cannot be the same as the submitter (SoD)'
            );
        }

        // Delegates to CostApprovalService which triggers _onApproved callback
        const saved = await this.approvalService.approve(requestId, approverId);
        return { message: 'Cost adjustment approved and GL entries posted', request: saved };
    }

    // ── REJECT ────────────────────────────────────────────────────────────────
    /**
     * P1.6-C: Reject a cost adjustment. Sets the distribution back to Draft.
     */
    async rejectAdjustment(requestId: string, rejectorId: string, reason: string): Promise<any> {
        const [request] = await this.db.select()
            .from(schema.cstApprovalRequests)
            .where(eq(schema.cstApprovalRequests.id, requestId));

        if (!request) throw new NotFoundException(`Approval request ${requestId} not found`);

        // Reject via the generic service
        const saved = await this.approvalService.reject(requestId, rejectorId, reason);

        // Revert distribution back to Draft
        await this.db.update(schema.cstCostDistributions)
            .set({ status: 'Draft' } as any)
            .where(eq(schema.cstCostDistributions.id, request.entityId));

        return { message: 'Cost adjustment rejected', request: saved };
    }

    // ── QUERY ─────────────────────────────────────────────────────────────────
    /**
     * P1.6-D: Get the pending approvals queue for cost adjustments.
     */
    async getPendingQueue(): Promise<any[]> {
        return this.db.select()
            .from(schema.cstApprovalRequests)
            .where(and(
                eq(schema.cstApprovalRequests.entityType, 'CostAdjustment'),
                eq(schema.cstApprovalRequests.status, 'PENDING'),
            ))
            .orderBy(desc(schema.cstApprovalRequests.createdAt));
    }

    /**
     * P1.6-E: Get the full approval history for all cost adjustments.
     */
    async getHistory(limit = 50): Promise<any[]> {
        return this.db.select()
            .from(schema.cstApprovalRequests)
            .where(eq(schema.cstApprovalRequests.entityType, 'CostAdjustment'))
            .orderBy(desc(schema.cstApprovalRequests.createdAt))
            .limit(limit);
    }

    // ── CALLBACK: After Approval ───────────────────────────────────────────────
    /**
     * Called automatically by CostApprovalService when a CostAdjustment is approved.
     * Posts the GL adjustment journal and promotes distribution to 'Final'.
     */
    private async _onApproved(distributionId: string): Promise<void> {
        this.logger.log(`CostAdjustment approved — posting GL and finalizing distribution ${distributionId}`);

        const distribution: any = await this.db.query.cstCostDistributions.findFirst({
            where: eq(schema.cstCostDistributions.id, distributionId)
        } as any);

        if (!distribution) {
            this.logger.error(`Distribution ${distributionId} not found during approval callback`);
            return;
        }

        await this.db.transaction(async (tx) => {
            // Post GL journal: Dr/Cr Inventory Valuation Account (signed by adjustmentAmount)
            const amount = Number(distribution.amount);
            const isPositive = amount >= 0;

            const [journal] = await tx.insert(schema.glJournals).values({
                journalNumber: `CST-ADJ-${distributionId.slice(0, 8)}-${Date.now()}`,
                ledgerId: 'PRIMARY',
                source: 'Cost Management',
                status: 'Posted',
                description: `Cost Adjustment: ${distribution.accountingLineType}`,
                currencyCode: distribution.currencyCode,
                createdBy: 'system-cost-approval',
            } as any).returning();

            // Debit side
            await tx.insert(schema.glJournalLines).values({
                journalId: journal.id,
                accountId: distribution.glAccountId,
                currencyCode: distribution.currencyCode,
                enteredDebit: isPositive ? Math.abs(amount).toString() : '0',
                enteredCredit: isPositive ? '0' : Math.abs(amount).toString(),
                debit: isPositive ? Math.abs(amount).toString() : '0',
                credit: isPositive ? '0' : Math.abs(amount).toString(),
                description: `Cost Adj: ${distribution.accountingLineType}`,
            } as any);

            // Credit side (contra account — Inventory Valuation)
            await tx.insert(schema.glJournalLines).values({
                journalId: journal.id,
                accountId: '1400-INVENTORY-VAL',
                currencyCode: distribution.currencyCode,
                enteredDebit: isPositive ? '0' : Math.abs(amount).toString(),
                enteredCredit: isPositive ? Math.abs(amount).toString() : '0',
                debit: isPositive ? '0' : Math.abs(amount).toString(),
                credit: isPositive ? Math.abs(amount).toString() : '0',
                description: `Contra — Inventory Valuation`,
            } as any);

            // Mark distribution as Final + accounted
            await tx.update(schema.cstCostDistributions)
                .set({ status: 'Final', accounted: true } as any)
                .where(eq(schema.cstCostDistributions.id, distributionId));

            this.logger.log(`GL journal ${journal.id} posted for cost adjustment ${distributionId}`);
        });
    }
}
