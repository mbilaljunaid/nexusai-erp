import { db } from "@db";
import { hrWorkRelationships, hrAssignments, hrPersons } from "@shared/schema";
import { hrRiskWeights } from "@shared/schema/hr_compliance";
import { eq, and, sql, desc } from "drizzle-orm";

export interface RiskAnalysis {
    score: number; // 0-100
    level: "low" | "medium" | "high" | "critical";
    justification: string[];
}

export class ComplianceRiskService {
    static async predictRisk(tenantId: string, transactionType: string, data: any): Promise<RiskAnalysis> {
        let score = 0;
        const justification: string[] = [];

        // Fetch configured weights
        const weights = await db.select()
            .from(hrRiskWeights)
            .where(and(eq(hrRiskWeights.tenantId, tenantId), eq(hrRiskWeights.isActive, true)));

        const getWeight = (category: string, key: string, defaultVal: number) => {
            const w = weights.find(w => w.category === category && w.conditionKey === key);
            return w ? w.weight : defaultVal;
        };

        // --- Heuristic 1: Tenure Check (High Turnover Risk) ---
        if (data.personId) {
            const history = await db.select().from(hrWorkRelationships)
                .where(and(eq(hrWorkRelationships.personId, data.personId), eq(hrWorkRelationships.tenantId, tenantId)))
                .orderBy(desc(hrWorkRelationships.dateStart));

            if (history.length > 2) {
                const w = getWeight('TENURE', 'job_hopping', 30);
                score += w;
                justification.push(`Candidate has high frequency of work relationship changes (Risk +${w}).`);
            }
        }

        // --- Heuristic 2: Transaction Timing (Anomalous Events) ---
        const hour = new Date().getHours();
        if (hour < 6 || hour > 21) {
            const w = getWeight('TIME', 'off_hours', 15);
            score += w;
            justification.push(`Transaction initiated outside of standard business hours (Risk +${w}).`);
        }

        // --- Heuristic 3: Role-Based Risk (Compliance Criticality) ---
        const sensitiveKeywords = ["finance", "payroll", "admin", "legal", "compliance", "executive"];
        const jobName = (data.jobName || "").toLowerCase();
        if (sensitiveKeywords.some(kw => jobName.includes(kw))) {
            const w = getWeight('ROLE', 'sensitive_role', 20);
            score += w;
            justification.push(`Position involves access to sensitive financial or regulatory data (Risk +${w}).`);
        }

        // --- Heuristic 4: Redundancy / Frequency check ---
        if (transactionType === "TRANSFER") {
            const recentTransfers = await db.select().from(hrAssignments)
                .where(and(
                    eq(hrAssignments.personId, data.personId),
                    eq(hrAssignments.tenantId, tenantId),
                    sql`${hrAssignments.updatedAt} > now() - interval '90 days'`
                ));
            if (recentTransfers.length > 1) {
                const w = getWeight('FREQUENCY', 'frequent_transfers', 25);
                score += w;
                justification.push(`Multiple transfers within a 90-day window detected (Risk +${w}).`);
            }
        }

        // --- Final Categorization ---
        let level: RiskAnalysis["level"] = "low";
        if (score >= 70) level = "critical";
        else if (score >= 50) level = "high";
        else if (score >= 25) level = "medium";

        if (justification.length === 0) {
            justification.push("No immediate compliance risks identified based on configured heuristics.");
        }

        return { score: Math.min(score, 100), level, justification };
    }
}
