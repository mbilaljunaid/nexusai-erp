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

    async simulateVariationImpact(contractId: string, variationData: { amount: number, type: string, description: string }) {
        const contract = await db.select().from(constructionContracts).where(eq(constructionContracts.id, contractId));
        if (!contract.length) throw new Error("Contract not found");

        const history = await db.select().from(constructionVariations).where(eq(constructionVariations.contractId, contractId));

        // 1. Cost Impact Analysis
        const avgVariation = history.length > 0
            ? history.reduce((s, v) => s + Number(v.amount || 0), 0) / history.length
            : 0;

        const costRiskScore = variationData.amount > avgVariation * 2 ? "HIGH" :
            variationData.amount > avgVariation ? "MEDIUM" : "LOW";

        // 2. Schedule Impact Prediction (Simulated AI Logic)
        let predictedDelayDays = 0;
        if (variationData.type === "SCOPE_CHANGE") predictedDelayDays = 14;
        if (variationData.type === "UNFORESEEN") predictedDelayDays = 7;
        if (variationData.amount > 100000) predictedDelayDays += 21;

        // 3. Recommended Actions
        const recommendations = [];
        if (costRiskScore === "HIGH") recommendations.push("Conduct secondary architectural review to verify scope necessity.");
        if (predictedDelayDays > 10) recommendations.push("Verify critical path impact with site scheduler.");
        recommendations.push("Ensure evidence (photos/logs) are attached to the variation before approval.");

        return {
            costRiskScore,
            predictedDelayDays,
            financialImpactPercent: (variationData.amount / 1000000) * 100, // Normalized to typical contract size
            recommendations,
            simulationTimestamp: new Date().toISOString()
        };
    }
}
