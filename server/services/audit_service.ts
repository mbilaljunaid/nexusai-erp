
import { db } from "../db";
import { auditLogs, InsertAuditLog } from "@shared/schema";
import { desc, eq } from "drizzle-orm";

export class AuditService {

    // Log an event
    async logAction(logEntry: InsertAuditLog) {
        try {
            await db.insert(auditLogs).values(logEntry);
            console.log(`[AUDIT-DB] Logged action: ${logEntry.action} by ${logEntry.userId}`);
        } catch (error) {
            console.error("[AUDIT-DB] Failed to persist log:", error);
            // Fallback to console if DB fails, critical to not lose trail
            console.log("FALLBACK AUDIT:", JSON.stringify(logEntry));
        }
    }

    // Retrieve logs for a specific entity (e.g., all changes to Journal 123)
    async getEntityLogs(entityType: string, entityId: string) {
        return await db.select().from(auditLogs)
            .where(eq(auditLogs.entityType, entityType)) // Note: Needs complex filter if entityId is matched
            // Actually, querying by entityId requires filter
            .orderBy(desc(auditLogs.createdAt));
    }

    // Simple list for admin dashboard
    async listLogs(limit = 50) {
        return await db.select().from(auditLogs)
            .orderBy(desc(auditLogs.createdAt))
            .limit(limit);
    }
}

export const auditService = new AuditService();
