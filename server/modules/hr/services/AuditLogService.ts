import { db } from "@db";
import { hrAuditLogs, HrAuditLog } from "@shared/schema/hr_audit";
import { hrAssignments, hrWorkRelationships } from "@shared/schema/hr_worker";
import { eq, and, desc, inArray, or } from "drizzle-orm";
import { AorService } from "./AorService";

export class AuditLogService {
    /**
     * Logs a simple action on an entity.
     */
    static async log(params: {
        tenantId: string;
        actorId: string;
        entityType: string;
        entityId: string;
        action: string;
        changes?: Record<string, any>;
    }, tx?: any) {
        const executor = tx || db;
        const [log] = await executor.insert(hrAuditLogs).values({
            tenantId: params.tenantId,
            actorId: params.actorId,
            entityType: params.entityType,
            entityId: params.entityId,
            action: params.action,
            changes: params.changes || {},
            timestamp: new Date()
        }).returning();
        return log;
    }

    /**
     * Logs an update action with automatic field diffing.
     */
    static async logUpdate(params: {
        tenantId: string;
        actorId: string;
        entityType: string;
        entityId: string;
        oldData: any;
        newData: any;
        ignoredFields?: string[];
    }, tx?: any) {
        const { oldData, newData, ignoredFields = ['id', 'tenantId', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy'] } = params;
        const changes: Record<string, { old: any; new: any }> = {};

        const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

        for (const key of allKeys) {
            if (ignoredFields.includes(key)) continue;

            const oldVal = oldData[key];
            const newVal = newData[key];

            // Simple shallow comparison for now
            if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                changes[key] = {
                    old: oldVal,
                    new: newVal
                };
            }
        }

        if (Object.keys(changes).length === 0) return null;

        return this.log({
            tenantId: params.tenantId,
            actorId: params.actorId,
            entityType: params.entityType,
            entityId: params.entityId,
            action: "UPDATED",
            changes
        }, tx);
    }

    /**
     * Fetches audit logs with AOR security filtering.
     */
    static async listLogs(tenantId: string, currentUserId?: string, limit: number = 100) {
        // AOR Security filtering logic (Oracle Fusion Parity)
        const aorConditions = [];
        if (currentUserId) {
            const userAors = await AorService.getAorForUser(currentUserId, tenantId);

            if (userAors.length > 0) {
                const deptIds = userAors.filter(a => a.scopeType === 'DEPARTMENT').map(a => a.scopeValueId);
                const locIds = userAors.filter(a => a.scopeType === 'LOCATION').map(a => a.scopeValueId);
                const leIds = userAors.filter(a => a.scopeType === 'LEGAL_EMPLOYER').map(a => a.scopeValueId);

                const conditions = [];
                // PERSON entity logs linked via assignments/relationships
                if (deptIds.length > 0) conditions.push(inArray(hrAssignments.departmentId, deptIds));
                if (locIds.length > 0) conditions.push(inArray(hrAssignments.locationId, locIds));
                if (leIds.length > 0) conditions.push(inArray(hrWorkRelationships.legalEmployerId, leIds));

                if (conditions.length > 0) {
                    aorConditions.push(or(...conditions));
                }
            }
        }

        const query = db.select({
            id: hrAuditLogs.id,
            entityType: hrAuditLogs.entityType,
            entityId: hrAuditLogs.entityId,
            action: hrAuditLogs.action,
            actorId: hrAuditLogs.actorId,
            timestamp: hrAuditLogs.timestamp,
            changes: hrAuditLogs.changes
        })
            .from(hrAuditLogs)
            // Join with worker structures for AOR filtering if entity is a PERSON
            .leftJoin(hrAssignments, and(
                eq(hrAuditLogs.entityId, hrAssignments.personId),
                eq(hrAuditLogs.entityType, "PERSON"),
                eq(hrAssignments.primaryAssignmentFlag, true)
            ))
            .leftJoin(hrWorkRelationships, and(
                eq(hrAuditLogs.entityId, hrWorkRelationships.personId),
                eq(hrAuditLogs.entityType, "PERSON"),
                eq(hrWorkRelationships.primaryFlag, true)
            ))
            .where(and(
                eq(hrAuditLogs.tenantId, tenantId),
                ...aorConditions
            ))
            .orderBy(desc(hrAuditLogs.timestamp))
            .limit(limit);

        return query;
    }
}
