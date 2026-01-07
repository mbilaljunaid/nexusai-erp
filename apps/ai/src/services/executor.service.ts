import { Injectable, Logger } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { AIAction, ActionStatus, ActionResponse } from '@contracts/ai/schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ExecutorService {
    private readonly logger = new Logger(ExecutorService.name);

    constructor(private readonly actionsService: ActionsService) { }

    async executeAction(userId: string, tenantId: string, actionKey: string, payload: any, userRole: string = 'viewer'): Promise<AIAction> {
        this.logger.log(`Executing action ${actionKey} for user ${userId} (${userRole})`);

        const actionDef = this.actionsService.getAction(actionKey);
        if (!actionDef) {
            throw new Error(`Action ${actionKey} not found`);
        }

        // 1. Zod Validation
        if (actionDef.schema) {
            const validation = actionDef.schema.safeParse(payload);
            if (!validation.success) {
                throw new Error(`Validation Failed: ${validation.error}`);
            }
        }

        // 2. Safety / RBAC Check
        // If action requires approval and user is not admin/manager, we flag it.
        // For now, we simple block if requiresApproval is true and no approval token is present (mock logic)
        // Or we just mark it as PENDING_APPROVAL if logic dictates.

        let status = ActionStatus.IN_PROGRESS;
        let requiresApproval = false; // Default

        // Check definition
        // Note: In a real system, we'd check actionDef.requiresApproval vs userRole
        // For this 'All-In' implementation, we'll assume 'viewer' cannot execute anything except 'list' (if we had list actions)
        // But here we are executing intentions.

        if (userRole === 'viewer') {
            throw new Error('Viewers cannot execute AI actions.');
        }

        // Create Action Record
        const actionRecord: AIAction = {
            id: uuidv4(),
            tenantId,
            userId,
            actionType: actionKey,
            payload,
            status,
            confidenceScore: 1.0,
            requiresApproval,
            reversible: true,
            createdAt: new Date().toISOString(),
        };

        try {
            // Execute Handler
            const result = await actionDef.handler(payload);

            actionRecord.status = ActionStatus.EXECUTED;
            actionRecord.executedAt = new Date().toISOString();

            this.logger.log(`Action ${actionKey} executed successfully`);
            return actionRecord;
        } catch (error: any) {
            this.logger.error(`Action ${actionKey} failed: ${error.message}`);
            actionRecord.status = ActionStatus.FAILED;
            actionRecord.error = error.message;
            return actionRecord;
        }
    }
}
