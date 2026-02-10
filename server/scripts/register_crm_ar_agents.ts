
import { db } from "../db";
import { aiCapabilities, aiTools } from "@shared/schema/nexus_ai";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Starting CRM & AR Agent Registration...");

    const agents = [
        {
            name: "CRM Opportunity Analyzer",
            module: "crm",
            description: "Analyzes sales opportunities for win probability and risks.",
            systemPrompt: "You are a seasoned Sales Director AI. Your goal is to objectively analyze sales opportunities, identify risks, and suggest next steps to increase win rates.",
            tools: [
                {
                    name: "analyze_opportunity",
                    description: "Analyzes a specific opportunity.",
                    schema: {
                        type: "object",
                        properties: {
                            opportunityId: { type: "string" }
                        },
                        required: ["opportunityId"]
                    }
                }
            ]
        },
        {
            name: "AR Collection Officer",
            module: "finance",
            description: "Assists with collections strategy and email generation.",
            systemPrompt: "You are an expert accounts receivable and collections assistant. You draft professional, empathetic, yet firm collection emails and suggest collection strategies.",
            tools: [
                {
                    name: "generate_collection_email",
                    description: "Generates a collection email for an invoice.",
                    schema: {
                        type: "object",
                        properties: {
                            invoiceId: { type: "string" },
                            customerId: { type: "string" }
                        },
                        required: ["invoiceId", "customerId"]
                    }
                },
                {
                    name: "recommend_strategy",
                    description: "Recommends a collection strategy for a customer.",
                    schema: {
                        type: "object",
                        properties: {
                            customerId: { type: "string" }
                        },
                        required: ["customerId"]
                    }
                }
            ]
        }
    ];

    for (const agent of agents) {
        console.log(`Processing Agent: ${agent.name}...`);

        // 1. Upsert Capability
        const existing = await db.select().from(aiCapabilities).where(eq(aiCapabilities.name, agent.name)).limit(1);
        let capabilityId = existing[0]?.id;

        if (!existing.length) {
            console.log(`Creating capability: ${agent.name}`);
            const [inserted] = await db.insert(aiCapabilities).values({
                name: agent.name,
                moduleId: agent.module,
                moduleName: agent.module.toUpperCase(),
                description: agent.description,
                isActive: true,
                systemPrompt: agent.systemPrompt
            }).returning();
            capabilityId = inserted.id;
        } else {
            console.log(`Updating capability: ${agent.name}`);
            await db.update(aiCapabilities)
                .set({ systemPrompt: agent.systemPrompt, moduleId: agent.module })
                .where(eq(aiCapabilities.id, capabilityId));
        }

        // 2. Register Tools
        for (const tool of agent.tools) {
            const toolName = `${agent.module}_${tool.name}`;
            const [existingTool] = await db.select().from(aiTools).where(eq(aiTools.name, toolName)).limit(1);

            if (!existingTool) {
                console.log(`  + Registering tool: ${toolName}`);
                await db.insert(aiTools).values({
                    capabilityId,
                    name: toolName,
                    description: tool.description,
                    parameters: tool.schema,
                    requiredPermission: "ai.execute",
                    isActive: true
                });
            }
        }
    }

    console.log("Registration Complete.");
    process.exit(0);
}

main().catch(err => {
    console.error("Error:", err);
    process.exit(1);
});
