
import { db } from "../db";
import { callAIJson, getCapabilityPrompt } from "./nexus-ai-gateway";
import { opportunities, accounts, interactions, leads } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export class CrmAiService {

    static async analyzeOpportunity(opportunityId: string) {
        // 1. Gather Context
        const opportunity = await db.query.opportunities.findFirst({
            where: eq(opportunities.id, opportunityId),
            with: {
                // If relations are set up in schema relations...
                // Assuming basic fetch first, then separate queries if needed for safety since schema.ts might not have relations defined in `relations()`
            }
        });

        if (!opportunity) throw new Error("Opportunity not found");

        const account = opportunity.accountId
            ? await db.query.accounts.findFirst({ where: eq(accounts.id, opportunity.accountId) })
            : null;

        // Fetch recent interactions
        const recentInteractions = await db.select().from(interactions)
            .where(eq(interactions.entityId, opportunityId))
            .orderBy(desc(interactions.createdAt))
            .limit(5);

        // Construct Prompt
        const context = {
            opportunity: {
                name: opportunity.name,
                stage: opportunity.stage,
                amount: opportunity.amount,
                probability: opportunity.probability,
                closeDate: opportunity.closeDate
            },
            account: account ? {
                name: account.name,
                industry: account.industry,
                rating: account.rating
            } : "Unknown Account",
            recentActivity: recentInteractions.map(i => `${i.type}: ${i.summary}`).join("; ")
        };

        const prompt = `
        You are a seasoned Sales Director AI. Analyze this opportunity and provide:
        1. Win Probability (0-100 score).
        2. Key Risks (bullet points).
        3. Recommended Next Steps.
        4. Sentiment Analysis (Positive, Neutral, Negative).

        Context: ${JSON.stringify(context, null, 2)}

        Return ONLY valid JSON in this format:
        {
            "winProbability": number,
            "risks": string[],
            "nextSteps": string[],
            "sentiment": string,
            "reasoning": string
        }
        `;


        const systemPrompt = await getCapabilityPrompt(
            "CRM Opportunity Analyzer",
            "You are a seasoned Sales Director AI."
        );

        try {
            // Use the centralized AI gateway instead of calling executeTool (which would be circular)
            const result = await callAIJson<{
                winProbability: number,
                risks: string[],
                nextSteps: string[],
                sentiment: string,
                reasoning: string
            }>([
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ], { jsonMode: true });

            return result;
        } catch (error) {
            console.error("AI Analysis Failed:", error);
            // Graceful Degradation (Tier-1 Requirement)
            return {
                winProbability: opportunity.probability || 50,
                risks: ["AI Analysis unavailable due to connectivity issues."],
                nextSteps: ["Review manually."],
                sentiment: "Neutral",
                reasoning: "System fallback."
            };
        }
    }
}
