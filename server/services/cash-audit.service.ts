
import { db } from "../db";
import { glAuditLogs } from "@shared/schema";

export class CashAuditService {
    async logAction(params: {
        action: string;
        entity: string;
        entityId: string;
        userId: string;
        details?: any;
    }) {
        try {
            await db.insert(glAuditLogs).values({
                action: params.action,
                entity: params.entity,
                entityId: params.entityId,
                userId: params.userId,
                details: params.details || {},
                timestamp: new Date()
            });
        } catch (error) {
            console.error("Failed to log audit action:", error);
            // Don't throw, audit logging shouldn't break the main flow
        }
    }
}

export const cashAuditService = new CashAuditService();
