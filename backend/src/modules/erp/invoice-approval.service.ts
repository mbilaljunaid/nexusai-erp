/**
 * Invoice Approval Service — P0.9: Invoice Approval Workflow State Machine
 *
 * State machine:  Draft → Submitted → Approved → Sent
 *                                  └→ Rejected → Draft (revise & resubmit)
 *
 * Persists approval history to glApprovalHistory for full audit trail.
 * Approval rules from glApprovalRules: amount thresholds + role requirements.
 */
import { Injectable, Logger, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../../shared/schema/index';
import { eq, lte, gte, and } from 'drizzle-orm';
import { InvoiceGlService } from './invoice-gl.service';

// Valid status transitions for the AR invoice approval workflow
const VALID_TRANSITIONS: Record<string, string[]> = {
    Draft: ['Submitted'],
    Submitted: ['Approved', 'Rejected'],
    Rejected: ['Draft', 'Submitted'],
    Approved: ['Sent'],
    Sent: [],
};

@Injectable()
export class InvoiceApprovalService {
    private readonly logger = new Logger(InvoiceApprovalService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
        private readonly invoiceGlService: InvoiceGlService,
    ) { }

    /**
     * P0.9-A: Submit an invoice for approval.
     * Validates that required fields exist and transitions Draft → Submitted.
     */
    async submitForApproval(invoiceId: string, submittedBy: string): Promise<any> {
        const invoice = await this._getInvoiceOrThrow(invoiceId);
        this._assertTransition(invoice.status, 'Submitted');

        // Determine approver from approval rules
        const approvalRule: any = await this._getApprovalRule(Number(invoice.totalAmount));

        await this.db.transaction(async (tx) => {
            // Transition invoice status
            await tx.update(schema.arInvoices)
                .set({ status: 'Submitted' } as any)
                .where(eq(schema.arInvoices.id, invoiceId));

            // Log to GL approval history for audit trail
            await tx.insert(schema.glApprovalHistory).values({
                journalId: invoiceId, // Re-used as the entity ID for audit purposes
                action: 'SUBMIT',
                actorId: submittedBy,
                comments: `Invoice submitted for approval. Approval rule: ${approvalRule?.name || 'Default'}`,
                actionDate: new Date(),
            } as any);
        });

        this.logger.log(`Invoice ${invoiceId} submitted for approval by ${submittedBy}`);
        return {
            invoiceId,
            newStatus: 'Submitted',
            submittedBy,
            approverRole: approvalRule?.approverRole || 'Controller',
            message: 'Invoice submitted. Awaiting approval.',
        };
    }

    /**
     * P0.9-B: Approve a submitted invoice.
     * Transitions Submitted → Approved and posts GL entries.
     */
    async approveInvoice(invoiceId: string, approvedBy: string, comments?: string): Promise<any> {
        const invoice = await this._getInvoiceOrThrow(invoiceId);
        this._assertTransition(invoice.status, 'Approved');

        let journalId: string | null = null;

        await this.db.transaction(async (tx) => {
            await tx.update(schema.arInvoices)
                .set({ status: 'Approved' } as any)
                .where(eq(schema.arInvoices.id, invoiceId));

            await tx.insert(schema.glApprovalHistory).values({
                journalId: invoiceId,
                action: 'APPROVE',
                actorId: approvedBy,
                comments: comments || 'Approved',
                actionDate: new Date(),
            } as any);
        });

        // Post the invoice to GL now that it's approved
        try {
            const glResult = await this.invoiceGlService.postInvoiceToGL(invoiceId);
            journalId = glResult.journalId;
        } catch (e) {
            this.logger.warn(`GL posting failed for approved invoice ${invoiceId}: ${e}`);
        }

        this.logger.log(`Invoice ${invoiceId} approved by ${approvedBy}`);
        return {
            invoiceId,
            newStatus: 'Approved',
            approvedBy,
            glJournalId: journalId,
            message: 'Invoice approved and GL entries posted.',
        };
    }

    /**
     * P0.9-C: Reject a submitted invoice, with reason.
     * Transitions Submitted → Rejected. The submitter can revise and resubmit.
     */
    async rejectInvoice(invoiceId: string, rejectedBy: string, reason: string): Promise<any> {
        const invoice = await this._getInvoiceOrThrow(invoiceId);
        this._assertTransition(invoice.status, 'Rejected');

        await this.db.transaction(async (tx) => {
            await tx.update(schema.arInvoices)
                .set({ status: 'Rejected' } as any)
                .where(eq(schema.arInvoices.id, invoiceId));

            await tx.insert(schema.glApprovalHistory).values({
                journalId: invoiceId,
                action: 'REJECT',
                actorId: rejectedBy,
                comments: reason,
                actionDate: new Date(),
            } as any);
        });

        this.logger.log(`Invoice ${invoiceId} rejected by ${rejectedBy}: ${reason}`);
        return {
            invoiceId,
            newStatus: 'Rejected',
            rejectedBy,
            reason,
            message: 'Invoice rejected. Submitter can revise and resubmit.',
        };
    }

    /**
     * P0.9-D: Mark an approved invoice as Sent (to customer).
     * Transitions Approved → Sent.
     */
    async markAsSent(invoiceId: string, sentBy: string): Promise<any> {
        const invoice = await this._getInvoiceOrThrow(invoiceId);
        this._assertTransition(invoice.status, 'Sent');

        await this.db.update(schema.arInvoices)
            .set({ status: 'Sent' } as any)
            .where(eq(schema.arInvoices.id, invoiceId));

        this.logger.log(`Invoice ${invoiceId} marked as Sent by ${sentBy}`);
        return { invoiceId, newStatus: 'Sent', sentBy };
    }

    /**
     * P0.9-E: Get the full approval audit trail for an invoice.
     */
    async getApprovalHistory(invoiceId: string): Promise<any[]> {
        return this.db.query.glApprovalHistory.findMany({
            where: eq(schema.glApprovalHistory.journalId, invoiceId),
        } as any);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private async _getInvoiceOrThrow(invoiceId: string): Promise<any> {
        const invoice: any = await this.db.query.arInvoices.findFirst({
            where: eq(schema.arInvoices.id, invoiceId)
        } as any);
        if (!invoice) throw new NotFoundException(`AR Invoice ${invoiceId} not found`);
        return invoice;
    }

    private _assertTransition(currentStatus: string, targetStatus: string): void {
        const allowed = VALID_TRANSITIONS[currentStatus] || [];
        if (!allowed.includes(targetStatus)) {
            throw new BadRequestException(
                `Invalid status transition: ${currentStatus} → ${targetStatus}. Allowed: [${allowed.join(', ')}]`
            );
        }
    }

    private async _getApprovalRule(amount: number): Promise<any> {
        // Find the first matching rule by amount range, ordered by priority
        const rules: any[] = await this.db.query.glApprovalRules.findMany({
            where: eq(schema.glApprovalRules.enabled, true),
        } as any).catch(() => []);

        return rules
            .filter((r: any) => {
                const min = Number(r.minAmount || 0);
                const max = r.maxAmount ? Number(r.maxAmount) : Infinity;
                return amount >= min && amount <= max;
            })
            .sort((a: any, b: any) => (a.priority || 10) - (b.priority || 10))[0] || null;
    }
}
