
import { db } from "../../db";
import { auditLogs, insertAuditLogSchema } from "../../../shared/schema/common";

export class SlaAuditService {

    /**
     * Log a Configuration Change (Rule or JLT)
     */
    async logConfigChange(
        action: "CREATE" | "UPDATE" | "DELETE",
        entityType: "SLA_RULE" | "SLA_JLT" | "SLA_MAPPING",
        entityId: string,
        oldValue: any,
        newValue: any,
        userId: string = "system"
    ) {
        try {
            await db.insert(auditLogs).values({
                userId,
                action: `${action}_${entityType}`,
                entityType: entityType,
                entityId: entityId,
                oldValue: oldValue || {},
                newValue: newValue || {},
                ipAddress: "127.0.0.1",
                userAgent: "NexusAI ERP System",
                createdAt: new Date()
            });
            console.log(`[SLA-AUDIT] Logged ${action} on ${entityType} ${entityId}`);
        } catch (err) {
            console.error("[SLA-AUDIT] Failed to log audit entry:", err);
            // Don't fail the transaction just because audit failed (soft fail)
        }
    }
}

export const slaAuditService = new SlaAuditService();
