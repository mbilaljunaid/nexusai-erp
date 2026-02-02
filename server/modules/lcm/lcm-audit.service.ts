
import { db } from "@db";
import { lcmAuditLogs } from "@shared/schema/lcm";
import { eq, desc } from "drizzle-orm";

export class LcmAuditService {

    /**
     * Logs an action to the audit trail.
     * @param table Name of the table (e.g., 'lcm_trade_operations')
     * @param entityId ID of the entity
     * @param action Action type (CREATE, UPDATE, DELETE, ALLOCATE, CLOSE)
     * @param changedFields Object containing old and new values { old: ..., new: ... }, or detailed description.
     * @param userId ID of the user performing the action (optional, default 'SYSTEM')
     */
    async logAction(
        table: string,
        entityId: string,
        action: string,
        changedFields: Record<string, any> | null,
        userId: string = 'SYSTEM'
    ) {
        try {
            await db.insert(lcmAuditLogs).values({
                entityTable: table,
                entityId: entityId,
                action: action,
                changedFields: changedFields,
                performedBy: userId
            });
        } catch (error) {
            console.error("Failed to log audit entry:", error);
            // Non-blocking: We don't want to crash the transaction if logging fails, 
            // though in strictly compliant systems we might want to throw.
            // For now, logging to console is sufficient safety net.
        }
    }

    /**
     * Retrieves audit logs for a specific entity.
     */
    async getLogsForEntity(table: string, entityId: string) {
        return await db.select()
            .from(lcmAuditLogs)
            .where(eq(lcmAuditLogs.entityId, entityId))
            .orderBy(desc(lcmAuditLogs.createdAt));
    }
}

export const lcmAuditService = new LcmAuditService();
