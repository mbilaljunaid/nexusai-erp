import { db } from "@db";
import {
    hrComplianceRules,
    hrComplianceEvents,
    hrComplianceViolations,
    HrComplianceRule
} from "@shared/schema/hr_compliance";
import { eq, and, or } from "drizzle-orm";

export interface EvaluationResult {
    isCompliant: boolean;
    reason?: string;
    metadata?: any;
    remediation?: string[];
}

export interface IRuleStrategy {
    evaluate(rule: HrComplianceRule, data: any): Promise<EvaluationResult>;
}

class MinAgeStrategy implements IRuleStrategy {
    async evaluate(rule: HrComplianceRule, data: any): Promise<EvaluationResult> {
        const logic = rule.ruleLogic as any;
        const birthDate = new Date(data.dateOfBirth);
        const age = this.calculateAge(birthDate);

        if (age < logic.threshold) {
            return {
                isCompliant: false,
                reason: `Person age (${age}) is below the legal threshold of ${logic.threshold} for jurisdiction ${rule.legislationCode}.`,
                metadata: { age, threshold: logic.threshold },
                remediation: ["Request proof of age", "Terminate transaction"]
            };
        }
        return { isCompliant: true, metadata: { age } };
    }

    private calculateAge(birthday: Date) {
        const ageDifMs = Date.now() - birthday.getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }
}

class RequiredFieldStrategy implements IRuleStrategy {
    async evaluate(rule: HrComplianceRule, data: any): Promise<EvaluationResult> {
        const logic = rule.ruleLogic as any;
        if (!data[logic.field]) {
            return {
                isCompliant: false,
                reason: `Mandatory field '${logic.field}' is missing.`,
                metadata: { field: logic.field },
                remediation: [`Collect ${logic.field} from candidate`]
            };
        }
        return { isCompliant: true, metadata: {} };
    }
}

export class ComplianceEngineService {
    private static strategies: Record<string, IRuleStrategy> = {
        "MIN_AGE": new MinAgeStrategy(),
        "REQUIRED_FIELD": new RequiredFieldStrategy(),
    };

    /**
     * Evaluates HR rules against a transaction entity.
     */
    static async evaluateTransaction(tenantId: string, entityType: string, entityId: string, data: any, legislationCode: string = "GLOBAL") {
        const activeRules = await db.select()
            .from(hrComplianceRules)
            .where(and(
                eq(hrComplianceRules.tenantId, tenantId),
                eq(hrComplianceRules.isActive, true),
                or(
                    eq(hrComplianceRules.legislationCode, "GLOBAL"),
                    eq(hrComplianceRules.legislationCode, legislationCode)
                )
            ));

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

    private static async evaluateRule(rule: HrComplianceRule, data: any): Promise<EvaluationResult> {
        const logic = rule.ruleLogic as any;
        if (!logic || !logic.type) return { isCompliant: true, metadata: {} };

        const strategy = this.strategies[logic.type];
        if (!strategy) {
            // Unknown logic type defaults to compliant for safety in mock/MVP
            console.warn(`No strategy found for rule type: ${logic.type}`);
            return { isCompliant: true, metadata: { warning: "Unrecognized rule type" } };
        }

        return strategy.evaluate(rule, data);
    }
}
