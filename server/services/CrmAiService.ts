
import { db } from "../db";
import { openai } from "./ai"; // Reuse the configured OpenAI instance
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

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are a helpful CRM AI Assistant. Return JSON only." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error("No response from AI");

            return JSON.parse(content);
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
