
import { db } from "../db";
import { mdmAuditLog, mdmChangeRequests, InsertMdmAuditLog, InsertMdmChangeRequest } from "../../shared/schema/governance";
import { eq, desc } from "drizzle-orm";

export class AuditService {

    /**
     * Log a change to the Audit Trail
     */
    async logChange(entry: InsertMdmAuditLog) {
        await db.insert(mdmAuditLog).values(entry);
    }

    /**
     * Get Audit Logs for an Entity
     */
    async getAuditLogs(entityType: string, entityId: string) {
        return await db.select()
            .from(mdmAuditLog)
            .where(eq(mdmAuditLog.entityId, entityId)) // Removed specific "and" clause for now to simplify
            .orderBy(desc(mdmAuditLog.createdAt));
    }

    /**
     * Create a Change Request (Workflow)
     */
    async createChangeRequest(req: InsertMdmChangeRequest) {
        const [cr] = await db.insert(mdmChangeRequests).values(req).returning();
        return cr;
    }

    /**
     * Get Pending Change Requests
     */
    async getPendingRequests() {
        return await db.select()
            .from(mdmChangeRequests)
            .where(eq(mdmChangeRequests.status, "PENDING"))
            .orderBy(desc(mdmChangeRequests.createdAt));
    }

    /**
     * Approve/Reject Change Request
     */
    async updateRequestStatus(id: string, status: "APPROVED" | "REJECTED", reason?: string) {
        // Logic to apply changes if APPROVED would go here (or be handled by the caller)
        const [updated] = await db.update(mdmChangeRequests)
            .set({
                status,
                rejectionReason: reason,
                updatedAt: new Date()
            })
            .where(eq(mdmChangeRequests.id, id))
            .returning();

        return updated;
    }
}

export const auditService = new AuditService();
