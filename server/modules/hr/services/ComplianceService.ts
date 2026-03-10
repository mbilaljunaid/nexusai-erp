// @ts-nocheck
import { db } from "@db";
import { hrComplianceRules, hrComplianceViolations, hrComplianceEvents, insertComplianceRuleSchema } from "@shared/schema/hr_compliance";
import { hrAssignments, hrWorkRelationships } from "@shared/schema/hr_worker";
import { eq, and, desc, inArray, or } from "drizzle-orm";
import { AorService } from "./AorService";

export class ComplianceService {
    static async listRules(tenantId: string) {
        return db.select().from(hrComplianceRules).where(eq(hrComplianceRules.tenantId, tenantId)).orderBy(hrComplianceRules.name);
    }

    static async createRule(data: any, tenantId: string) {
        const parseResult = insertComplianceRuleSchema.parse({
            ...data,
            tenantId,
            isActive: true
        });
        const [rule] = await db.insert(hrComplianceRules).values(parseResult).returning();
        return rule;
    }

    static async deleteRule(id: string, tenantId: string) {
        const [deleted] = await db.delete(hrComplianceRules)
            .where(and(eq(hrComplianceRules.id, id), eq(hrComplianceRules.tenantId, tenantId)))
            .returning();
        return !!deleted;
    }

    static async getAorConditions(tenantId: string, currentUserId?: string) {
        if (!currentUserId || currentUserId === "system") return [];

        const userAors = await AorService.getAorForUser(currentUserId, tenantId);
        if (userAors.length === 0) return [];

        const deptIds = userAors.filter(a => a.scopeType === 'DEPARTMENT').map(a => a.scopeValueId);
        const locIds = userAors.filter(a => a.scopeType === 'LOCATION').map(a => a.scopeValueId);
        const leIds = userAors.filter(a => a.scopeType === 'LEGAL_EMPLOYER').map(a => a.scopeValueId);

        const conditions = [];
        if (deptIds.length > 0) conditions.push(inArray(hrAssignments.departmentId, deptIds));
        if (locIds.length > 0) conditions.push(inArray(hrAssignments.locationId, locIds));
        if (leIds.length > 0) conditions.push(inArray(hrWorkRelationships.legalEmployerId, leIds));

        return conditions;
    }

    static async listViolations(tenantId: string, currentUserId?: string, page: number = 1, limit: number = 20) {
        // AOR Security filtering
        const conditions = await this.getAorConditions(tenantId, currentUserId);
        const aorConditions = conditions.length > 0 ? [or(...conditions)] : [];
        const offset = (page - 1) * limit;

        const whereClause = and(
            eq(hrComplianceViolations.tenantId, tenantId),
            ...aorConditions
        );

        // 1. Get Total Count
        const [totalCount] = await db.select({ count: sql<number>`count(*)` })
            .from(hrComplianceViolations)
            .leftJoin(hrComplianceEvents, eq(hrComplianceViolations.eventId, hrComplianceEvents.id))
            .leftJoin(hrAssignments, and(
                eq(hrComplianceEvents.entityId, hrAssignments.personId),
                eq(hrComplianceEvents.entityType, "PERSON"),
                eq(hrAssignments.primaryAssignmentFlag, true)
            ))
            .where(whereClause);

        // 2. Get Paginated Data
        const data = await db.select({
            id: hrComplianceViolations.id,
            ruleName: hrComplianceRules.name,
            entityType: hrComplianceEvents.entityType,
            entityId: hrComplianceEvents.entityId,
            status: hrComplianceViolations.status,
            severity: hrComplianceViolations.severity,
            description: hrComplianceViolations.description,
            createdAt: hrComplianceViolations.createdAt,
            remediationActions: hrComplianceViolations.remediationActions
        })
            .from(hrComplianceViolations)
            .leftJoin(hrComplianceRules, eq(hrComplianceViolations.ruleId, hrComplianceRules.id))
            .leftJoin(hrComplianceEvents, eq(hrComplianceViolations.eventId, hrComplianceEvents.id))
            // Join with worker structures for AOR filtering if it's a PERSON/ASSIGNMENT entity
            .leftJoin(hrAssignments, and(
                eq(hrComplianceEvents.entityId, hrAssignments.personId),
                eq(hrComplianceEvents.entityType, "PERSON"),
                eq(hrAssignments.primaryAssignmentFlag, true)
            ))
            .leftJoin(hrWorkRelationships, and(
                eq(hrComplianceEvents.entityId, hrWorkRelationships.personId),
                eq(hrComplianceEvents.entityType, "PERSON"),
                eq(hrWorkRelationships.primaryFlag, true)
            ))
            .where(whereClause)
            .orderBy(desc(hrComplianceViolations.createdAt))
            .limit(limit)
            .offset(offset);

        return {
            data,
            total: Number(totalCount?.count || 0),
            page,
            limit
        };
    }

    static async updateViolation(id: string, tenantId: string, data: { status?: string; resolutionNotes?: string }) {
        const updateData: any = { ...data };
        if (data.status === "resolved") {
            updateData.resolvedAt = new Date();
        }

        const [updated] = await db.update(hrComplianceViolations)
            .set(updateData)
            .where(and(eq(hrComplianceViolations.id, id), eq(hrComplianceViolations.tenantId, tenantId)))
            .returning();
        return updated;
    }
}
