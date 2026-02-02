
import { db } from "../db";
import { hrmLearningAuditLogs } from "@shared/schema/talent_learning";

export class AuditService {
    static async log(
        tenantId: string,
        action: string,
        entityType: string,
        entityId: string,
        changes: { previous?: any, new?: any },
        actorId: string = "SYSTEM"
    ) {
        try {
            await db.insert(hrmLearningAuditLogs).values({
                tenantId,
                action,
                entityType,
                entityId,
                previousValue: changes.previous ? JSON.stringify(changes.previous) : null,
                newValue: changes.new ? JSON.stringify(changes.new) : null,
                actorId
            });
            console.log(`[AUDIT] ${action} on ${entityType} ${entityId} by ${actorId}`);
        } catch (err) {
            console.error("[AUDIT FAILED]", err);
            // Non-blocking fail (or blocking if strict audit required)
        }
    }
}
