import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalRequest, ApprovalStatus } from './entities/approval-request.entity';

@Injectable()
export class ApprovalService {
    private readonly logger = new Logger(ApprovalService.name);
    // Registry of callbacks for different entity types
    private readonly approvalCallbacks = new Map<string, (id: string) => Promise<void>>();

    constructor(
        @InjectRepository(ApprovalRequest)
        private approvalRepo: Repository<ApprovalRequest>
    ) { }

    /**
     * Submit a new approval request.
     */
    async submitRequest(requesterId: string, entityType: string, entityId: string, payload?: any): Promise<ApprovalRequest> {
        this.logger.log(`Submitting approval request for ${entityType} ID: ${entityId}`);

        // Check for existing pending request
        const existing = await this.approvalRepo.findOne({
            where: { entityType, entityId, status: ApprovalStatus.PENDING }
        });

        if (existing) {
            throw new BadRequestException('A pending approval request already exists for this entity.');
        }

        const request = this.approvalRepo.create({
            requesterId,
            entityType,
            entityId,
            payload: payload ? JSON.stringify(payload) : undefined,
            status: ApprovalStatus.PENDING
        });

        return this.approvalRepo.save(request);
    }

    /**
     * Approve a request and trigger the callback action.
     */
    async approve(requestId: string, approverId: string): Promise<ApprovalRequest> {
        const request = await this.approvalRepo.findOne({ where: { id: requestId } });
        if (!request) throw new NotFoundException('Approval request not found');
        if (request.status !== ApprovalStatus.PENDING) throw new BadRequestException('Request is not pending');

        request.status = ApprovalStatus.APPROVED;
        request.approverId = approverId;
        const saved = await this.approvalRepo.save(request);

        this.logger.log(`Request ${requestId} Approved. Triggering callback...`);
        await this.triggerCallback(request.entityType, request.entityId);

        return saved;
    }

    /**
     * Reject a request.
     */
    async reject(requestId: string, approverId: string, reason: string): Promise<ApprovalRequest> {
        const request = await this.approvalRepo.findOne({ where: { id: requestId } });
        if (!request) throw new NotFoundException('Approval request not found');
        if (request.status !== ApprovalStatus.PENDING) throw new BadRequestException('Request is not pending');

        request.status = ApprovalStatus.REJECTED;
        request.approverId = approverId;
        request.rejectionReason = reason;

        return this.approvalRepo.save(request);
    }

    /**
     * Register a callback function to be executed upon approval execution.
     */
    registerCallback(entityType: string, callback: (id: string) => Promise<void>) {
        this.approvalCallbacks.set(entityType, callback);
    }

    private async triggerCallback(entityType: string, entityId: string) {
        const callback = this.approvalCallbacks.get(entityType);
        if (callback) {
            await callback(entityId);
        } else {
            this.logger.warn(`No callback registered for entity type: ${entityType}`);
        }
    }
}
