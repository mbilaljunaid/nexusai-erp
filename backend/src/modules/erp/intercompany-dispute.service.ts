/**
 * Intercompany Dispute Service — P2.G Gap Implementation
 *
 * Implements full ic_disputes object model (beyond simple "Reject with Reason"):
 *  - Full dispute lifecycle: RAISED → UNDER_REVIEW → RESOLVED / ESCALATED
 *  - Counterparty acknowledgement
 *  - Resolution proposals and acceptance
 *  - Audit trail for all state transitions
 *
 * Oracle Fusion AGIS equivalent: Intercompany Dispute Management
 */
import { Injectable, Logger, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema';

export type DisputeStatus = 'RAISED' | 'ACKNOWLEDGED' | 'UNDER_REVIEW' | 'RESOLUTION_PROPOSED' | 'RESOLVED' | 'ESCALATED' | 'CLOSED';
export type DisputeType = 'PRICING' | 'QUANTITY' | 'TIMING' | 'UNAUTHORIZED' | 'DUPLICATE' | 'OTHER';

export interface IcDispute {
    id: string;
    batchId: string;
    transactionId?: string;
    disputeType: DisputeType;
    raisedByOrgId: string;
    respondentOrgId: string;
    raisedByUserId: string;
    disputedAmount: number;
    currencyCode: string;
    description: string;
    status: DisputeStatus;
    resolutionNotes?: string;
    resolvedAmount?: number;
    resolvedAt?: Date;
    escalatedToUserId?: string;
    createdAt: Date;
    updatedAt: Date;
    auditTrail: DisputeAuditEntry[];
}

export interface DisputeAuditEntry {
    timestamp: Date;
    actor: string;
    action: string;
    fromStatus?: DisputeStatus;
    toStatus?: DisputeStatus;
    notes?: string;
}

@Injectable()
export class IntercompanyDisputeService {
    private readonly logger = new Logger(IntercompanyDisputeService.name);
    private disputes: Map<string, IcDispute> = new Map();

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    ) { }

    /**
     * Raise a new dispute against an intercompany batch or specific transaction.
     */
    raiseDispute(input: {
        batchId: string;
        transactionId?: string;
        disputeType: DisputeType;
        raisedByOrgId: string;
        respondentOrgId: string;
        raisedByUserId: string;
        disputedAmount: number;
        currencyCode: string;
        description: string;
    }): IcDispute {
        const id = `DISP-${Date.now()}`;
        const now = new Date();

        const dispute: IcDispute = {
            ...input,
            id,
            status: 'RAISED',
            createdAt: now,
            updatedAt: now,
            auditTrail: [{
                timestamp: now,
                actor: input.raisedByUserId,
                action: 'DISPUTE_RAISED',
                toStatus: 'RAISED',
                notes: input.description,
            }],
        };

        this.disputes.set(id, dispute);
        this.logger.log(`IC Dispute ${id} raised: batch=${input.batchId}, type=${input.disputeType}, amount=${input.disputedAmount} ${input.currencyCode}`);
        return dispute;
    }

    /**
     * Respondent acknowledges the dispute (moves to ACKNOWLEDGED).
     */
    acknowledgeDispute(disputeId: string, respondentUserId: string, notes?: string): IcDispute {
        const dispute = this._getOrThrow(disputeId);
        if (dispute.status !== 'RAISED') {
            throw new BadRequestException(`Dispute ${disputeId} must be in RAISED status to acknowledge. Current: ${dispute.status}`);
        }
        this._transition(dispute, 'ACKNOWLEDGED', respondentUserId, 'ACKNOWLEDGED_BY_RESPONDENT', notes);
        return dispute;
    }

    /**
     * Initiates a formal review (ACKNOWLEDGED → UNDER_REVIEW).
     */
    startReview(disputeId: string, reviewerUserId: string, notes?: string): IcDispute {
        const dispute = this._getOrThrow(disputeId);
        if (dispute.status !== 'ACKNOWLEDGED') {
            throw new BadRequestException(`Dispute must be ACKNOWLEDGED before review. Current: ${dispute.status}`);
        }
        this._transition(dispute, 'UNDER_REVIEW', reviewerUserId, 'REVIEW_STARTED', notes);
        return dispute;
    }

    /**
     * Propose a resolution (UNDER_REVIEW → RESOLUTION_PROPOSED).
     */
    proposeResolution(disputeId: string, proposerUserId: string, resolvedAmount: number, resolutionNotes: string): IcDispute {
        const dispute = this._getOrThrow(disputeId);
        if (dispute.status !== 'UNDER_REVIEW') {
            throw new BadRequestException(`Dispute must be UNDER_REVIEW to propose resolution. Current: ${dispute.status}`);
        }
        dispute.resolvedAmount = resolvedAmount;
        dispute.resolutionNotes = resolutionNotes;
        this._transition(dispute, 'RESOLUTION_PROPOSED', proposerUserId, 'RESOLUTION_PROPOSED',
            `Proposed amount: ${resolvedAmount} ${dispute.currencyCode}. ${resolutionNotes}`);
        return dispute;
    }

    /**
     * Accepts a resolution proposal (RESOLUTION_PROPOSED → RESOLVED).
     */
    acceptResolution(disputeId: string, acceptingUserId: string, notes?: string): IcDispute {
        const dispute = this._getOrThrow(disputeId);
        if (dispute.status !== 'RESOLUTION_PROPOSED') {
            throw new BadRequestException(`Dispute must have a RESOLUTION_PROPOSED. Current: ${dispute.status}`);
        }
        dispute.resolvedAt = new Date();
        this._transition(dispute, 'RESOLVED', acceptingUserId, 'RESOLUTION_ACCEPTED', notes);
        this.logger.log(`IC Dispute ${disputeId} RESOLVED: amount=${dispute.resolvedAmount} ${dispute.currencyCode}`);
        return dispute;
    }

    /**
     * Rejects a resolution proposal (returns to UNDER_REVIEW).
     */
    rejectResolution(disputeId: string, rejectingUserId: string, reason: string): IcDispute {
        const dispute = this._getOrThrow(disputeId);
        if (dispute.status !== 'RESOLUTION_PROPOSED') {
            throw new BadRequestException(`No resolution to reject. Current: ${dispute.status}`);
        }
        dispute.resolvedAmount = undefined;
        this._transition(dispute, 'UNDER_REVIEW', rejectingUserId, 'RESOLUTION_REJECTED', reason);
        return dispute;
    }

    /**
     * Escalates a stalled dispute to senior management.
     */
    escalate(disputeId: string, escalatingUserId: string, escalateTo: string, reason: string): IcDispute {
        const dispute = this._getOrThrow(disputeId);
        dispute.escalatedToUserId = escalateTo;
        this._transition(dispute, 'ESCALATED', escalatingUserId, 'DISPUTE_ESCALATED',
            `Escalated to ${escalateTo}: ${reason}`);
        this.logger.warn(`IC Dispute ${disputeId} ESCALATED to ${escalateTo}`);
        return dispute;
    }

    /**
     * Closes a resolved dispute (archives it).
     */
    close(disputeId: string, closingUserId: string): IcDispute {
        const dispute = this._getOrThrow(disputeId);
        if (dispute.status !== 'RESOLVED') {
            throw new BadRequestException(`Only RESOLVED disputes can be closed. Current: ${dispute.status}`);
        }
        this._transition(dispute, 'CLOSED', closingUserId, 'DISPUTE_CLOSED');
        return dispute;
    }

    getDispute(disputeId: string): IcDispute {
        return this._getOrThrow(disputeId);
    }

    listDisputesByBatch(batchId: string): IcDispute[] {
        return Array.from(this.disputes.values()).filter(d => d.batchId === batchId);
    }

    listOpenDisputes(): IcDispute[] {
        return Array.from(this.disputes.values())
            .filter(d => !['RESOLVED', 'CLOSED'].includes(d.status));
    }

    getDisputeSummary(): {
        total: number;
        byStatus: Record<DisputeStatus, number>;
        totalDisputedAmount: number;
        totalResolvedAmount: number;
    } {
        const all = Array.from(this.disputes.values());
        const byStatus = {} as Record<DisputeStatus, number>;
        for (const d of all) {
            byStatus[d.status] = (byStatus[d.status] || 0) + 1;
        }
        return {
            total: all.length,
            byStatus,
            totalDisputedAmount: all.reduce((s, d) => s + d.disputedAmount, 0),
            totalResolvedAmount: all.filter(d => d.resolvedAmount).reduce((s, d) => s + (d.resolvedAmount || 0), 0),
        };
    }

    // ── Private Helpers ────────────────────────────────────────────────────────
    private _getOrThrow(id: string): IcDispute {
        const d = this.disputes.get(id);
        if (!d) throw new NotFoundException(`Dispute ${id} not found`);
        return d;
    }

    private _transition(dispute: IcDispute, newStatus: DisputeStatus, actor: string, action: string, notes?: string): void {
        const entry: DisputeAuditEntry = {
            timestamp: new Date(),
            actor,
            action,
            fromStatus: dispute.status,
            toStatus: newStatus,
            notes,
        };
        dispute.status = newStatus;
        dispute.updatedAt = new Date();
        dispute.auditTrail.push(entry);
    }
}
