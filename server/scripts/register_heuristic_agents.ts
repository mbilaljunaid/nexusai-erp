
import { db } from "../db";
import { aiCapabilities, aiTools, aiQuickActions } from "@shared/schema/nexus_ai";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Starting Heuristic Agent Registration...");

    const agents = [
        {
            name: "Learning Assistant",
            module: "talent",
            description: "Assists with skill extraction and course recommendations.",
            systemPrompt: "You are an expert Learning & Development assistant. Your goal is to analyze employee skills and recommend relevant training courses.",
            tools: [
                {
                    name: "extract_skills",
                    description: "Extracts professional skills from a given text or resume.",
                    schema: {
                        type: "object",
                        properties: {
                            text: { type: "string", description: "The text to analyze." }
                        },
                        required: ["text"]
                    }
                },
                {
                    name: "get_recommendations",
                    description: "Get course recommendations for a specific person.",
                    schema: {
                        type: "object",
                        properties: {
                            personId: { type: "string", description: "The ID of the person." }
                        },
                        required: ["personId"]
                    }
                }
            ]
        },
        {
            name: "Workforce Planner",
            module: "hr",
            description: "Provides schedule forecasting and fatigue risk analysis.",
            systemPrompt: "You are a Workforce Planning assistant. You help managers forecast staffing needs and identify fatigue risks to ensure compliance and well-being.",
            tools: [
                {
                    name: "generate_schedule_forecast",
                    description: "Forecasts staffing needs for a specific date and department.",
                    schema: {
                        type: "object",
                        properties: {
                            targetDate: { type: "string", description: "YYYY-MM-DD" },
                            departmentId: { type: "string" }
                        },
                        required: ["targetDate", "departmentId"]
                    }
                },
                {
                    name: "predict_fatigue_risk",
                    description: "Analyzes work patterns to predict fatigue risk for an employee.",
                    schema: {
                        type: "object",
                        properties: {
                            personId: { type: "string" }
                        },
                        required: ["personId"]
                    }
                }
            ]
        },
        {
            name: "Lease Analyst",
            module: "finance",
            description: "Extracts structured data from lease documents.",
            systemPrompt: "You are a Lease Analysis AI. Your job is to extract key financial and date terms from lease contracts with high precision.",
            tools: [
                {
                    name: "extract_lease_data",
                    description: "Extracts lease terms (rent, dates, parties) from text.",
                    schema: {
                        type: "object",
                        properties: {
                            text: { type: "string" }
                        },
                        required: ["text"]
                    }
                }
            ]
        }
    ];

    for (const agent of agents) {
        console.log(`Processing Agent: ${agent.name}...`);

        // 1. Check if capability exists
        let [capability] = await db.select().from(aiCapabilities).where(eq(aiCapabilities.name, agent.name)).limit(1);

        if (!capability) {
            console.log(`Creating capability: ${agent.name}`);
            [capability] = await db.insert(aiCapabilities).values({
                name: agent.name,
                moduleId: agent.module,
                moduleName: agent.module.charAt(0).toUpperCase() + agent.module.slice(1), // Simple capitalization
                description: agent.description,
                isActive: true,
                // icon: agent.icon, // Removed: Not in schema
                systemPrompt: agent.systemPrompt
            }).returning();
        } else {
            console.log(`Updating capability: ${agent.name}`);
            await db.update(aiCapabilities)
                .set({ systemPrompt: agent.systemPrompt, moduleId: agent.module })
                .where(eq(aiCapabilities.id, capability.id));
        }

        // 2. Register Tools
        for (const tool of agent.tools) {
            const toolName = `${agent.module}_${tool.name}`;

            const [existingTool] = await db.select().from(aiTools).where(eq(aiTools.name, toolName)).limit(1);

            if (!existingTool) {
                console.log(`  + Registering tool: ${toolName}`);
                await db.insert(aiTools).values({
                    capabilityId: capability.id,
                    name: toolName,
                    description: tool.description,
                    // method: tool.method, // Removed: Not in schema
                    parameters: tool.schema,
                    requiredPermission: "ai.execute", // Default permission
                    isActive: true
                });
            } else {
                console.log(`  . Tool ${toolName} exists.`);
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
