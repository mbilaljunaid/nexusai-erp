import { db } from "../db";
import {
    constructionContracts,
    constructionVariations,
    constructionPayApps,
    constructionContractLines
} from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

export class ConstructionRiskService {

    async getProjectRiskOverview(projectId: string) {
        const contracts = await db.select()
            .from(constructionContracts)
            .where(eq(constructionContracts.projectId, projectId));

        const insights = await Promise.all(contracts.map(async (c: any) => {
            const risk = await this.analyzeContractRisk(c.id);
            return {
                contractId: c.id,
                contractNumber: c.contractNumber,
                subject: c.subject,
                riskScore: risk.score, // 0-100
                riskLevel: risk.level, // Low, Medium, High
                topFactors: risk.factors,
                variationExposure: risk.exposure
            };
        }));

        return insights;
    }

    async analyzeContractRisk(contractId: string) {
        // 1. Fetch Variations
        const variations = await db.select()
            .from(constructionVariations)
            .where(eq(constructionVariations.contractId, contractId));

        const pendingCount = variations.filter((v: any) => v.status === "PENDING" || v.status === "DRAFT").length;
        const pendingAmount = variations
            .filter((v: any) => v.status === "PENDING")
            .reduce((sum: number, v: any) => sum + Number(v.amount || 0), 0);

        // 2. Fetch Progress
        const payApps = await db.select()
            .from(constructionPayApps)
            .where(eq(constructionPayApps.contractId, contractId));

        const latestApp = payApps.sort((a: any, b: any) => (b.applicationNumber || 0) - (a.applicationNumber || 0))[0];
        // Simplified percent complete: Completed vs Scheduled Value (not implemented here perfectly but provides a baseline)
        const percentComplete = latestApp ? (Number(latestApp.totalCompleted) / 100000 * 100) : 0;

        // 3. Logic for Risk Score
        let score = 20; // Base score
        const factors: string[] = [];

        if (pendingCount > 5) {
            score += 30;
            factors.push("High volume of pending variations");
        } else if (pendingCount > 2) {
            score += 15;
            factors.push("Frequent change requests");
        }

        if (pendingAmount > 50000) {
            score += 25;
            factors.push("Significant financial exposure in PCOs");
        }

        // Determine Level
        let level = "LOW";
        if (score > 70) level = "HIGH";
        else if (score > 40) level = "MEDIUM";

        return {
            score: Math.min(score, 100),
            level,
            factors,
            exposure: pendingAmount.toString()
        };
    }
}
