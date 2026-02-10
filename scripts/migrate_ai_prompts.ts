
import { db } from "../server/db";
import { aiCapabilities } from "../shared/schema/nexus_ai";
import { eq } from "drizzle-orm";

async function migratePrompts() {
    console.log("Migrating AI Prompts to DB...");

    // 1. CRM Opportunity Analyzer
    const crmPrompt = `
You are a seasoned Sales Director AI. Analyze this opportunity and provide:
1. Win Probability (0-100 score).
2. Key Risks (bullet points).
3. Recommended Next Steps.
4. Sentiment Analysis (Positive, Neutral, Negative).

Return ONLY valid JSON in this format:
{
    "winProbability": number,
    "risks": string[],
    "nextSteps": string[],
    "sentiment": string,
    "reasoning": string
}
`;

    await db.update(aiCapabilities)
        .set({ systemPrompt: crmPrompt })
        .where(eq(aiCapabilities.name, "CRM Opportunity Analyzer")); // Assuming this exists or I should upsert

    // Upsert logic for CRM
    const existingCrm = await db.query.aiCapabilities.findFirst({
        where: eq(aiCapabilities.name, "CRM Opportunity Analyzer")
    });

    if (existingCrm) {
        await db.update(aiCapabilities)
            .set({ systemPrompt: crmPrompt })
            .where(eq(aiCapabilities.id, existingCrm.id));
        console.log("Updated CRM Opportunity Analyzer prompt");
    } else {
        await db.insert(aiCapabilities).values({
            moduleId: "crm",
            moduleName: "CRM",
            name: "CRM Opportunity Analyzer",
            description: "Analyzes sales opportunities for risks and win probability.",
            systemPrompt: crmPrompt,
            isActive: true
        });
        console.log("Inserted CRM Opportunity Analyzer capability");
    }

    // 2. AR Collection Email
    const arPrompt = `
You are a professional collections officer for NexusAI Enterprise. Generate a professional collections email for an overdue invoice.

Tone Guidelines:
- < 30 days: Courteous reminder. Assume it might have been an oversight.
- < 60 days: Firm follow-up. Express concern and request immediate payment.
- > 60 days: Urgent demand. Mention potential impact on credit terms or service.

Requirements:
1. Clearly state the overdue amount and invoice number.
2. Request payment within 3 business days.
3. Include a clear, professional subject line at the start.
4. Do not use placeholders; use the data provided.
`;

    const existingAr = await db.query.aiCapabilities.findFirst({
        where: eq(aiCapabilities.name, "AR Collection Officer")
    });

    if (existingAr) {
        await db.update(aiCapabilities)
            .set({ systemPrompt: arPrompt })
            .where(eq(aiCapabilities.id, existingAr.id));
        console.log("Updated AR Collection Officer prompt");
    } else {
        await db.insert(aiCapabilities).values({
            moduleId: "ar",
            moduleName: "Accounts Receivable",
            name: "AR Collection Officer",
            description: "Generates professional collection emails based on invoice age.",
            systemPrompt: arPrompt,
            isActive: true
        });
        console.log("Inserted AR Collection Officer capability");
    }

    console.log("Migration complete.");
    process.exit(0);
}

migratePrompts().catch(console.error);
