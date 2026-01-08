import { storage } from "../storage";
import { financeService } from "./finance";
import { AiAction, InsertAiAction, InsertAiAuditLog } from "@shared/schema";

export class AIService {

    // Initialize default actions if they don't exist
    async initialize() {
        const defaultActions: InsertAiAction[] = [
            {
                module: "finance",
                actionName: "gl_create_journal",
                description: "Create a new General Ledger Journal Entry",
                requiredPermissions: ["finance.write"],
                inputSchema: {
                    type: "object",
                    properties: {
                        description: { type: "string" },
                        amount: { type: "number" },
                        accountId: { type: "string" }
                    }
                },
                isEnabled: true
            },
            {
                module: "finance",
                actionName: "gl_detect_anomalies",
                description: "Detect anomalies in GL journals",
                requiredPermissions: ["finance.read"],
                inputSchema: { type: "object", properties: {} },
                isEnabled: true
            },
            {
                module: "finance",
                actionName: "gl_explain_variance",
                description: "Analyze variances between two fiscal periods",
                requiredPermissions: ["finance.read"],
                inputSchema: {
                    type: "object",
                    properties: {
                        periodId: { type: "string" },
                        benchmarkPeriodId: { type: "string" }
                    }
                },
                isEnabled: true
            },
            {
                module: "crm",
                actionName: "crm_score_lead",
                description: "Calculate a health score for a lead based on interactions",
                requiredPermissions: ["crm.read"],
                inputSchema: {
                    type: "object",
                    properties: {
                        leadId: { type: "string" }
                    }
                },
                isEnabled: true
            }
        ];

        for (const action of defaultActions) {
            const existing = await storage.getAiAction(action.actionName);
            if (!existing) {
                await storage.createAiAction(action);
                console.log(`[AI] Registered action: ${action.actionName}`);
            }
        }
    }

    // Mock NLP Parser - In a real implementation, this would call an LLM
    async parseIntent(prompt: string, userId: string): Promise<{ action: AiAction | undefined, confidence: number, params: any }> {
        const lowerPrompt = prompt.toLowerCase();

        // Simple heuristic matching
        if (lowerPrompt.includes("journal") || lowerPrompt.includes("post entry")) {
            const action = await storage.getAiAction("gl_create_journal");
            return {
                action,
                confidence: 0.9,
                params: {
                    description: "Auto-generated journal from AI",
                    amount: 0, // Needs extraction logic
                    accountId: "UNKNOWN"
                }
            };
        }

        if (lowerPrompt.includes("variance") || (lowerPrompt.includes("compare") && lowerPrompt.includes("period"))) {
            const action = await storage.getAiAction("gl_explain_variance");
            // Mock Period ID extraction for now
            return {
                action,
                confidence: 0.85,
                params: {
                    periodId: "CURRENT_PERIOD_ID", // Would be extracted from "Jan 2026"
                    benchmarkPeriodId: "PREV_PERIOD_ID"
                }
            };
        }

        if (lowerPrompt.includes("anomal") || lowerPrompt.includes("fraud") || lowerPrompt.includes("check")) {
            const action = await storage.getAiAction("gl_detect_anomalies");
            return {
                action,
                confidence: 0.95,
                params: {}
            };
        }

        if (lowerPrompt.includes("score") && lowerPrompt.includes("lead")) {
            const action = await storage.getAiAction("crm_score_lead");
            return {
                action,
                confidence: 0.85,
                params: { leadId: "EXTRACTED_ID" }
            };
        }

        return { action: undefined, confidence: 0, params: {} };
    }

    // Execute an AI Action
    async executeAction(userId: string, actionName: string, params: any): Promise<any> {
        const start = Date.now();
        let status = "success";
        let errorMsg = null;
        let result = null;

        try {
            // 1. Fetch Action
            const action = await storage.getAiAction(actionName);
            if (!action) throw new Error(`Action ${actionName} not found`);
            if (!action.isEnabled) throw new Error(`Action ${actionName} is disabled`);

            // 2. Validate Permissions (Stub)
            // verifyPermissions(userId, action.requiredPermissions);

            // 3. Execute Logic (Switch based on actionName)
            // This maps the "Intent" to the actual "Service Call"
            switch (actionName) {
                case "gl_create_journal":
                    // map params to match createJournal signature
                    // const journalData = { ...params.header, source: 'AI_AGENT' };
                    // const linesData = params.lines;
                    // result = await financeService.createJournal(journalData, linesData);

                    // Mock for now as NLP params parsing is hard without a real LLM
                    result = { message: "Journal Drafted", details: params };
                    break;
                case "gl_detect_anomalies":
                    result = await financeService.detectAnomalies();
                    break;
                case "gl_explain_variance":
                    // Needs dynamic ID resolution usually
                    const p1 = params.periodId === "CURRENT_PERIOD_ID" ? (await financeService.listPeriods())[0]?.id : params.periodId;
                    const p2 = params.benchmarkPeriodId === "PREV_PERIOD_ID" ? (await financeService.listPeriods())[1]?.id : params.benchmarkPeriodId;

                    if (!p1 || !p2) throw new Error("Could not resolve periods for comparison");

                    result = await financeService.explainVariance(p1, p2);
                    break;
                case "crm_score_lead":
                    // Call CRM Service
                    result = { leadId: params.leadId, score: 85, reason: "High engagement" };
                    break;
                default:
                    throw new Error(`No handler implementation for ${actionName}`);
            }

        } catch (error: any) {
            status = "failed";
            errorMsg = error.message;
            throw error;
        } finally {
            // 4. Audit Log
            const log: InsertAiAuditLog = {
                userId,
                actionName,
                inputPrompt: JSON.stringify(params), // logging params as prompt for direct exec
                structuredIntent: params,
                status,
                errorMessage: errorMsg,
                executionTimeMs: Date.now() - start
            };
            await storage.createAiAuditLog(log);
        }

        return result;
    }
}

export const aiService = new AIService();
