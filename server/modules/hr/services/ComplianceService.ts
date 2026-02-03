import { db } from "@db";
import { hrComplianceRules, hrComplianceViolations, hrComplianceEvents, insertComplianceRuleSchema } from "@shared/schema/hr_compliance";
import { eq, and, desc } from "drizzle-orm";

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

    static async listViolations(tenantId: string) {
        return db.select({
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
            .where(eq(hrComplianceViolations.tenantId, tenantId))
            .orderBy(desc(hrComplianceViolations.createdAt));
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
