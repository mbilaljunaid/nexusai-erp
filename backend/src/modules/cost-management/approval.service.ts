import { Injectable, Logger, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema';

@Injectable()
export class CostApprovalService {
    private readonly logger = new Logger(CostApprovalService.name);
    // Registry of callbacks for different entity types
    private readonly approvalCallbacks = new Map<string, (id: string) => Promise<void>>();

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>
    ) { }

    /**
     * Submit a new approval request.
     */
    async submitRequest(requesterId: string, entityType: string, entityId: string, payload?: any): Promise<typeof schema.cstApprovalRequests.$inferSelect> {
        this.logger.log(`Submitting approval request for ${entityType} ID: ${entityId}`);

        // Check for existing pending request
        const [existing] = await this.db.select().from(schema.cstApprovalRequests)
            .where(and(
                eq(schema.cstApprovalRequests.entityType, entityType),
                eq(schema.cstApprovalRequests.entityId, entityId),
                eq(schema.cstApprovalRequests.status, 'PENDING')
            ));

        if (existing) {
            throw new BadRequestException('A pending approval request already exists for this entity.');
        }

        const [request] = await this.db.insert(schema.cstApprovalRequests).values({
            requesterId,
            entityType,
            entityId,
            payload: payload ? JSON.stringify(payload) : undefined,
            status: 'PENDING'
        }).returning();

        return request;
    }

    /**
     * Approve a request and trigger the callback action.
     */
    async approve(requestId: string, approverId: string): Promise<typeof schema.cstApprovalRequests.$inferSelect> {
        const [request] = await this.db.select().from(schema.cstApprovalRequests).where(eq(schema.cstApprovalRequests.id, requestId));

        if (!request) throw new NotFoundException('Approval request not found');
        if (request.status !== 'PENDING') throw new BadRequestException('Request is not pending');

        const [saved] = await this.db.update(schema.cstApprovalRequests)
            .set({
                status: 'APPROVED',
                approverId,
                updatedAt: new Date()
            })
            .where(eq(schema.cstApprovalRequests.id, requestId))
            .returning();

        this.logger.log(`Request ${requestId} Approved. Triggering callback...`);
        await this.triggerCallback(request.entityType, request.entityId);

        return saved;
    }

    /**
     * Reject a request.
     */
    async reject(requestId: string, approverId: string, reason: string): Promise<typeof schema.cstApprovalRequests.$inferSelect> {
        const [request] = await this.db.select().from(schema.cstApprovalRequests).where(eq(schema.cstApprovalRequests.id, requestId));
        if (!request) throw new NotFoundException('Approval request not found');
        if (request.status !== 'PENDING') throw new BadRequestException('Request is not pending');

        const [saved] = await this.db.update(schema.cstApprovalRequests)
            .set({
                status: 'REJECTED',
                approverId,
                rejectionReason: reason,
                updatedAt: new Date()
            })
            .where(eq(schema.cstApprovalRequests.id, requestId))
            .returning();

        return saved;
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
