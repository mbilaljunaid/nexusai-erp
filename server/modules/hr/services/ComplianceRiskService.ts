import { db } from "@db";
import { hrWorkRelationships, hrAssignments, hrPersons } from "@shared/schema";
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

        // --- Heuristic 1: Tenure Check (High Turnover Risk) ---
        if (data.personId) {
            const history = await db.select().from(hrWorkRelationships)
                .where(and(eq(hrWorkRelationships.personId, data.personId), eq(hrWorkRelationships.tenantId, tenantId)))
                .orderBy(desc(hrWorkRelationships.dateStart));

            if (history.length > 2) {
                score += 30;
                justification.push("Candidate has high frequency of work relationship changes (potential instability).");
            }
        }

        // --- Heuristic 2: Transaction Timing (Anomalous Events) ---
        const hour = new Date().getHours();
        if (hour < 6 || hour > 21) {
            score += 15;
            justification.push("Transaction initiated outside of standard business hours (potential unauthorized activity).");
        }

        // --- Heuristic 3: Role-Based Risk (Compliance Criticality) ---
        const sensitiveKeywords = ["finance", "payroll", "admin", "legal", "compliance", "executive"];
        const jobName = (data.jobName || "").toLowerCase();
        if (sensitiveKeywords.some(kw => jobName.includes(kw))) {
            score += 20;
            justification.push("Position involves access to sensitive financial or regulatory data.");
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
                score += 25;
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
