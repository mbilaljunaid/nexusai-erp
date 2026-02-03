import { db } from "@db";
import {
    hrComplianceRules,
    hrComplianceEvents,
    hrComplianceViolations,
    HrComplianceRule
} from "@shared/schema/hr_compliance";
import { eq, and } from "drizzle-orm";

export class ComplianceEngineService {
    /**
     * Evaluates HR rules against a transaction entity.
     */
    static async evaluateTransaction(tenantId: string, entityType: string, entityId: string, data: any) {
        // 1. Fetch active rules for this tenant and entity type
        // Note: For now, we fetch all active rules and filter in memory or via simple flags.
        // In a real system, we'd have a more sophisticated mapping.
        const activeRules = await db.select()
            .from(hrComplianceRules)
            .where(and(eq(hrComplianceRules.tenantId, tenantId), eq(hrComplianceRules.isActive, true)));

        const results = [];

        for (const rule of activeRules) {
            const evaluation = await this.evaluateRule(rule, data);

            // 2. Log the event
            const [event] = await db.insert(hrComplianceEvents).values({
                tenantId,
                ruleId: rule.id,
                entityType,
                entityId,
                evaluationResult: evaluation.isCompliant ? "COMPLIANT" : "NON_COMPLIANT",
                metadata: evaluation.metadata,
            }).returning();

            // 3. If non-compliant, create a violation
            if (!evaluation.isCompliant) {
                await db.insert(hrComplianceViolations).values({
                    tenantId,
                    eventId: event.id,
                    ruleId: rule.id,
                    status: "open",
                    severity: rule.severity,
                    description: evaluation.reason || `Violation of rule: ${rule.name}`,
                    remediationActions: evaluation.remediation || [],
                });
            }

            results.push({ ruleId: rule.id, isCompliant: evaluation.isCompliant });
        }

        return results;
    }

    private static async evaluateRule(rule: HrComplianceRule, data: any) {
        const logic = rule.ruleLogic as any;

        // Simplistic rule engine implementation
        if (!logic || !logic.type) return { isCompliant: true, metadata: {} };

        switch (logic.type) {
            case "MIN_AGE":
                const birthDate = new Date(data.dateOfBirth);
                const age = this.calculateAge(birthDate);
                if (age < logic.threshold) {
                    return {
                        isCompliant: false,
                        reason: `Person age (${age}) is below the legal threshold of ${logic.threshold}.`,
                        metadata: { age, threshold: logic.threshold },
                        remediation: ["Request proof of age", "Terminate transaction"]
                    };
                }
                break;

            case "REQUIRED_FIELD":
                if (!data[logic.field]) {
                    return {
                        isCompliant: false,
                        reason: `Mandatory field '${logic.field}' is missing.`,
                        metadata: { field: logic.field },
                        remediation: [`Collect ${logic.field} from candidate`]
                    };
                }
                break;

            default:
                // Unknown logic type defaults to compliant for safety in mock/MVP
                break;
        }

        return { isCompliant: true, metadata: {} };
    }

    private static calculateAge(birthday: Date) {
        const ageDifMs = Date.now() - birthday.getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }
}
