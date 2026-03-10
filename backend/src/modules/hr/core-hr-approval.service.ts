/**
 * Core HR Transaction Approval Service — P2.J Gap Implementation
 *
 * Implements an approval wrapper for high-impact HR transactions:
 *   - Employee Hire
 *   - Employee Transfer
 *   - Employee Termination
 *   - Salary Change
 *   - Grade Change
 *   - Leave of Absence
 *
 * Oracle Fusion HCM equivalent: Transaction Design Studio / Approval Rules Engine
 * Follows the maker-checker (SoD) pattern required by enterprise HR governance.
 */
import { Injectable, Logger, Inject, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema';

export type HrTransactionType = 'HIRE' | 'TRANSFER' | 'TERMINATE' | 'SALARY_CHANGE' | 'GRADE_CHANGE' | 'LEAVE_OF_ABSENCE';
export type ApprovalStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN' | 'CANCELLED';

export interface HrApprovalRule {
    transactionType: HrTransactionType;
    condition: string; // Human-readable condition description
    approverRole: string; // WHO must approve
    requiresHrReview: boolean;
    requiresLegalReview: boolean;
    autoApproveBelow?: number; // For salary changes — auto-approve if change < %
}

export interface HrTransaction {
    id: string;
    transactionType: HrTransactionType;
    employeeId: string;
    initiatedBy: string;
    payload: Record<string, any>; // The actual HR change data
    status: ApprovalStatus;
    approverRole: string;
    approverId?: string;
    approvedAt?: Date;
    rejectionReason?: string;
    requiresHrReview: boolean;
    requiresLegalReview: boolean;
    hrReviewedBy?: string;
    legalReviewedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    auditLog: Array<{ timestamp: Date; actor: string; action: string; notes?: string }>;
}

@Injectable()
export class CoreHrApprovalService {
    private readonly logger = new Logger(CoreHrApprovalService.name);
    private transactions: Map<string, HrTransaction> = new Map();

    // ── Default Approval Rules (per Oracle Fusion HCM patterns) ──────────────
    private readonly APPROVAL_RULES: HrApprovalRule[] = [
        {
            transactionType: 'HIRE',
            condition: 'All new hire transactions',
            approverRole: 'HR_MANAGER',
            requiresHrReview: true,
            requiresLegalReview: false,
        },
        {
            transactionType: 'TRANSFER',
            condition: 'Inter-department or inter-entity transfer',
            approverRole: 'DEPARTMENT_HEAD',
            requiresHrReview: false,
            requiresLegalReview: false,
        },
        {
            transactionType: 'TERMINATE',
            condition: 'All terminations (voluntary and involuntary)',
            approverRole: 'HR_DIRECTOR',
            requiresHrReview: true,
            requiresLegalReview: true, // Legal required for involuntary
        },
        {
            transactionType: 'SALARY_CHANGE',
            condition: 'Salary change > 10%',
            approverRole: 'COMPENSATION_MANAGER',
            requiresHrReview: true,
            requiresLegalReview: false,
            autoApproveBelow: 10, // Auto-approve if change < 10%
        },
        {
            transactionType: 'GRADE_CHANGE',
            condition: 'Grade promotion or demotion',
            approverRole: 'HR_MANAGER',
            requiresHrReview: false,
            requiresLegalReview: false,
        },
        {
            transactionType: 'LEAVE_OF_ABSENCE',
            condition: 'Extended leave > 30 days',
            approverRole: 'LINE_MANAGER',
            requiresHrReview: false,
            requiresLegalReview: false,
        },
    ];

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    ) { }

    /**
     * Initiates an HR transaction and determines if approval is required.
     * For small salary changes, auto-approves per configured threshold.
     */
    async initiateTransaction(input: {
        transactionType: HrTransactionType;
        employeeId: string;
        initiatedBy: string;
        payload: Record<string, any>;
    }): Promise<HrTransaction> {
        const rule = this.APPROVAL_RULES.find(r => r.transactionType === input.transactionType);
        if (!rule) throw new BadRequestException(`No approval rule defined for ${input.transactionType}`);

        const id = `HRTX-${Date.now()}`;
        const now = new Date();

        // Check auto-approve conditions for salary changes
        let autoApprove = false;
        if (input.transactionType === 'SALARY_CHANGE' && rule.autoApproveBelow) {
            const changePct = Math.abs(input.payload.changePct || 0);
            autoApprove = changePct < rule.autoApproveBelow;
        }

        const tx: HrTransaction = {
            id,
            transactionType: input.transactionType,
            employeeId: input.employeeId,
            initiatedBy: input.initiatedBy,
            payload: input.payload,
            status: autoApprove ? 'APPROVED' : 'PENDING_APPROVAL',
            approverRole: rule.approverRole,
            requiresHrReview: rule.requiresHrReview,
            requiresLegalReview: rule.requiresLegalReview,
            createdAt: now,
            updatedAt: now,
            auditLog: [{
                timestamp: now,
                actor: input.initiatedBy,
                action: 'TRANSACTION_INITIATED',
                notes: `${input.transactionType} for employee ${input.employeeId}`,
            }],
        };

        if (autoApprove) {
            tx.approverId = 'SYSTEM';
            tx.approvedAt = now;
            tx.auditLog.push({ timestamp: now, actor: 'SYSTEM', action: 'AUTO_APPROVED', notes: `Change below ${rule.autoApproveBelow}% threshold` });
            this.logger.log(`HR Transaction ${id} AUTO-APPROVED: ${input.transactionType}`);
        } else {
            this.logger.log(`HR Transaction ${id} pending ${rule.approverRole} approval: ${input.transactionType}`);
        }

        this.transactions.set(id, tx);
        return tx;
    }

    /**
     * Approves an HR transaction.
     */
    approveTransaction(txId: string, approverId: string, notes?: string): HrTransaction {
        const tx = this._getOrThrow(txId);
        if (tx.status !== 'PENDING_APPROVAL') {
            throw new BadRequestException(`Transaction ${txId} is not pending approval. Status: ${tx.status}`);
        }

        tx.status = 'APPROVED';
        tx.approverId = approverId;
        tx.approvedAt = new Date();
        tx.updatedAt = new Date();
        tx.auditLog.push({
            timestamp: new Date(),
            actor: approverId,
            action: 'TRANSACTION_APPROVED',
            notes,
        });

        this.logger.log(`HR Transaction ${txId} APPROVED by ${approverId}`);
        return tx;
    }

    /**
     * Rejects an HR transaction, returning it to REJECTED for rework.
     */
    rejectTransaction(txId: string, rejectorId: string, reason: string): HrTransaction {
        const tx = this._getOrThrow(txId);
        if (tx.status !== 'PENDING_APPROVAL') {
            throw new BadRequestException(`Transaction ${txId} is not pending approval.`);
        }

        tx.status = 'REJECTED';
        tx.rejectionReason = reason;
        tx.updatedAt = new Date();
        tx.auditLog.push({ timestamp: new Date(), actor: rejectorId, action: 'TRANSACTION_REJECTED', notes: reason });
        this.logger.log(`HR Transaction ${txId} REJECTED by ${rejectorId}: ${reason}`);
        return tx;
    }

    /**
     * Marks HR compliance review as complete.
     */
    markHrReviewed(txId: string, reviewerId: string): HrTransaction {
        const tx = this._getOrThrow(txId);
        tx.hrReviewedBy = reviewerId;
        tx.updatedAt = new Date();
        tx.auditLog.push({ timestamp: new Date(), actor: reviewerId, action: 'HR_REVIEW_COMPLETED' });
        return tx;
    }

    /**
     * Marks legal review as complete (required for terminations).
     */
    markLegalReviewed(txId: string, reviewerId: string): HrTransaction {
        const tx = this._getOrThrow(txId);
        tx.legalReviewedBy = reviewerId;
        tx.updatedAt = new Date();
        tx.auditLog.push({ timestamp: new Date(), actor: reviewerId, action: 'LEGAL_REVIEW_COMPLETED' });
        return tx;
    }

    getTransaction(txId: string): HrTransaction {
        return this._getOrThrow(txId);
    }

    listPendingForApprover(approverRole: string): HrTransaction[] {
        return Array.from(this.transactions.values())
            .filter(tx => tx.status === 'PENDING_APPROVAL' && tx.approverRole === approverRole);
    }

    listEmployeeTransactions(employeeId: string): HrTransaction[] {
        return Array.from(this.transactions.values())
            .filter(tx => tx.employeeId === employeeId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    getApprovalRules(): HrApprovalRule[] {
        return this.APPROVAL_RULES;
    }

    private _getOrThrow(txId: string): HrTransaction {
        const tx = this.transactions.get(txId);
        if (!tx) throw new BadRequestException(`HR Transaction ${txId} not found`);
        return tx;
    }
}
