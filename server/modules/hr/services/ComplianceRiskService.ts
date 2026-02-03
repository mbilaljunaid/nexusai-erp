import { db } from "@db";
import { hrWorkRelationships, hrAssignments, hrPersons } from "@shared/schema";
import { hrRiskConfigurations } from "@shared/schema/hr_compliance";
import { eq, and, sql, desc } from "drizzle-orm";

export interface RiskAnalysis {
    score: number; // 0-100
    level: "low" | "medium" | "high" | "critical";
    justification: string[];
}

export class ComplianceRiskService {
    static async predictRisk(tenantId: string, transactionType: string, data: any): Promise<RiskAnalysis> {
        const justification: string[] = [];

        // --- Fetch Dynamic Weights ---
        const configs = await db.select().from(hrRiskConfigurations)
            .where(and(eq(hrRiskConfigurations.tenantId, tenantId), eq(hrRiskConfigurations.isActive, true)));

        const weights: Record<string, number> = {
            TENURE_VOLATILITY: 30,
            TRANSACTION_TIMING: 15,
            ROLE_SENSITIVITY: 20,
            TRANSFER_FREQUENCY: 25
        };

        configs.forEach(c => {
            weights[c.factorKey] = c.weight;
        });

        let score = 0;

        // --- Heuristic 1: Tenure Check (High Turnover Risk) ---
        if (data.isTenureVolatile || data.personId) {
            let isVolatile = data.isTenureVolatile === true;
            if (!isVolatile && data.personId) {
                const history = await db.select().from(hrWorkRelationships)
                    .where(and(eq(hrWorkRelationships.personId, data.personId), eq(hrWorkRelationships.tenantId, tenantId)))
                    .orderBy(desc(hrWorkRelationships.dateStart));
                if (history.length > 2) isVolatile = true;
            }

            if (isVolatile) {
                score += weights.TENURE_VOLATILITY;
                justification.push("Candidate has high frequency of work relationship changes (potential instability).");
            }
        }

        // --- Heuristic 2: Transaction Timing (Anomalous Events) ---
        const hour = data.testHour !== undefined ? data.testHour : new Date().getHours();
        if (hour < 6 || hour > 21) {
            score += weights.TRANSACTION_TIMING;
            justification.push("Transaction initiated outside of standard business hours (potential unauthorized activity).");
        }

        // --- Heuristic 3: Role-Based Risk (Compliance Criticality) ---
        const sensitiveKeywords = ["finance", "payroll", "admin", "legal", "compliance", "executive"];
        const jobName = (data.jobName || data.role || "").toLowerCase();
        if (sensitiveKeywords.some(kw => jobName.includes(kw))) {
            score += weights.ROLE_SENSITIVITY;
            justification.push("Position involves access to sensitive financial or regulatory data.");
        }

        // --- Heuristic 4: Redundancy / Frequency check ---
        if (transactionType === "TRANSFER") {
            let isFrequent = data.isFrequentTransfer === true;
            if (!isFrequent && data.personId) {
                const recentTransfers = await db.select().from(hrAssignments)
                    .where(and(
                        eq(hrAssignments.personId, data.personId),
                        eq(hrAssignments.tenantId, tenantId),
                        sql`${hrAssignments.updatedAt} > now() - interval '90 days'`
                    ));
                if (recentTransfers.length > 1) isFrequent = true;
            }
            if (isFrequent) {
                score += weights.TRANSFER_FREQUENCY;
                justification.push("Multiple transfers within a 90-day window detected.");
            }
        }

        // --- Final Categorization ---
        let level: RiskAnalysis["level"] = "low";
        if (score >= 70) level = "critical";
        else if (score >= 50) level = "high";
        else if (score >= 25) level = "medium";

        if (justification.length === 0) {
            justification.push("No immediate compliance risks identified based on available heuristics.");
        }

        return { score: Math.min(score, 100), level, justification };
    }
}
