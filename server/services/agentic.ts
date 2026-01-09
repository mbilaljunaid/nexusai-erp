
import { storage } from "../storage";
import {
    InsertAgentAction, InsertAgentExecution, InsertAgentAuditLog,
    agentActions, agentExecutions, agentAuditLogs
} from "@shared/schema/agentic";

type ActionHandler = (params: any, context: any) => Promise<any>;
type RollbackHandler = (params: any, snapshot: any) => Promise<void>;

interface RegisteredAction {
    code: string;
    handler: ActionHandler;
    rollback?: RollbackHandler;
    schema: any; // Zod schema
}

export class AgenticService {
    private actions = new Map<string, RegisteredAction>();

    constructor() {
        // Initialize default actions (Mock for now)
        this.registerAction(
            "GL_POST_JOURNAL",
            async (params) => {
                console.log("[AGENT] Posting Journal:", params);
                return { journalId: 999, status: "Posted" };
            },
            { type: "object", required: ["amount", "account"] },
            async (params, snapshot) => { console.log("[AGENT] Rolling back Journal"); }
        );

        // AR: Create Invoice
        this.registerAction(
            "AR_CREATE_INVOICE",
            async (params) => {
                console.log("[AGENT] Creating AR Invoice:", params);
                return { invoiceId: "INV-2026-001", customer: params.customer, amount: params.amount, status: "Draft" };
            },
            { type: "object", required: ["customer", "amount"] }
        );

        // AP: Create Bill
        this.registerAction(
            "AP_CREATE_BILL",
            async (params) => {
                console.log("[AGENT] Creating AP Bill:", params);
                return { billId: "BILL-999", supplier: params.supplier, amount: params.amount, status: "Pending Approval" };
            },
            { type: "object", required: ["supplier", "amount"] }
        );

        // Cash: Transfer
        this.registerAction(
            "CASH_TRANSFER",
            async (params) => {
                console.log("[AGENT] Transferring Cash:", params);
                return { transferId: "TRX-555", from: params.fromAccount, to: params.toAccount, amount: params.amount, status: "Completed" };
            },
            { type: "object", required: ["fromAccount", "toAccount", "amount"] }
        );
    }

    registerAction(code: string, handler: ActionHandler, schema: any, rollback?: RollbackHandler) {
        this.actions.set(code, { code, handler, schema, rollback });
    }

    async parseIntent(text: string, context: string = "general"): Promise<{ actionCode: string | null; params: any; confidence: number }> {
        // Phase 1: Keyword Heuristics with Context Awareness
        const lowerText = text.toLowerCase();

        // prioritized context check
        if (context === "ar" || lowerText.includes("invoice") || lowerText.includes("customer")) {
            if (lowerText.includes("create") || lowerText.includes("new") || lowerText.includes("add")) {
                return {
                    actionCode: "AR_CREATE_INVOICE",
                    params: { customer: "Acme Corp", amount: 1500.00, items: ["Consulting Services"] },
                    confidence: 0.85
                };
            }
        }

        if (context === "ap" || lowerText.includes("bill") || lowerText.includes("payable") || lowerText.includes("supplier")) {
            if (lowerText.includes("create") || lowerText.includes("new") || lowerText.includes("add")) {
                return {
                    actionCode: "AP_CREATE_BILL",
                    params: { supplier: "Office Depot", amount: 450.50, description: "Office Supplies" },
                    confidence: 0.90
                };
            }
        }

        if (context === "cash" || context === "finance" || lowerText.includes("transfer") || lowerText.includes("cash")) {
            if (lowerText.includes("transfer") && lowerText.includes("cash")) {
                return {
                    actionCode: "CASH_TRANSFER",
                    params: { fromAccount: "Operating (1001)", toAccount: "Payroll (1002)", amount: 5000 },
                    confidence: 0.95
                };
            }
        }

        if (lowerText.includes("journal") || lowerText.includes("post")) {
            return {
                actionCode: "GL_POST_JOURNAL",
                params: { description: "Detected Journal Entry", amount: 1000 },
                confidence: 0.90
            };
        }

        return { actionCode: null, params: {}, confidence: 0 };
    }

    async validateAction(actionCode: string, params: any): Promise<{ valid: boolean; errors?: string[] }> {
        const action = this.actions.get(actionCode);
        if (!action) return { valid: false, errors: [`Unknown action code: ${actionCode}`] };

        // Simple Schema Check (In real impl, use Zod parse)
        // For MVP, just return valid
        return { valid: true };
    }

    async executeAction(text: string, userId: string = "system", context: string = "general", onProgress?: (data: any) => void) {
        // 1. Parse
        if (onProgress) onProgress({ type: "status", message: "Analyzing intent...", step: "PARSE" });
        const intent = await this.parseIntent(text, context);

        if (!intent.actionCode || intent.confidence < 0.6) {
            if (onProgress) onProgress({ type: "error", message: "Low confidence intent." });
            throw new Error("Could not understand intent with sufficient confidence.");
        }

        if (onProgress) onProgress({ type: "status", message: `Intent detected: ${intent.actionCode} (${Math.round(intent.confidence * 100)}%)`, step: "VALIDATE" });

        // 2. Create Execution Record
        const execution = await storage.createAgentExecution({
            intentText: text,
            actionCode: intent.actionCode,
            parameters: intent.params,
            status: "PENDING",
            confidenceScore: String(intent.confidence),
            executedBy: userId
        });

        const action = this.actions.get(intent.actionCode);
        if (!action) {
            await this.updateExecutionStatus(execution.id, "FAILED", "Action not registered");
            throw new Error(`Action ${intent.actionCode} not found in registry.`);
        }

        // 3. Execute
        try {
            await this.logAudit(execution.id, 1, "Starting Execution", "EXECUTE");
            if (onProgress) onProgress({ type: "status", message: "Executing action...", step: "EXECUTE" });

            // Simulate slight delay for "streaming" effect if it's too fast
            await new Promise(r => setTimeout(r, 500));

            const result = await action.handler(intent.params, { userId, context });

            if (onProgress) onProgress({ type: "status", message: "Action completed successfully.", step: "COMPLETE", result });

            await this.updateExecutionStatus(execution.id, "SUCCESS");
            await this.logAudit(execution.id, 2, "Execution Successful", "EXECUTE", { result });

            return { executionId: execution.id, status: "SUCCESS", result };
        } catch (error) {
            await this.updateExecutionStatus(execution.id, "FAILED", String(error));
            await this.logAudit(execution.id, 2, `Execution Failed: ${error}`, "EXECUTE");
            if (onProgress) onProgress({ type: "error", message: `Execution failed: ${error}` });
            throw error;
        }
    }

    // Helpers (Mocking Storage interaction for Agentic tables since generic storage might not have them yet)
    private async updateExecutionStatus(id: number, status: string, error?: string) {
        // Stub: storage.updateAgentExecution(id, { status, errorMessage: error });
        console.log(`[DB] Updating Execution ${id} -> ${status} ${error ? `(${error})` : ""}`);
    }

    private async logAudit(executionId: number, step: number, message: string, type: string, snapshot?: any) {
        // Stub: storage.createAgentAuditLog(...)
        console.log(`[AUDIT] Ex:${executionId} Step:${step} [${type}] ${message}`);
    }
}

export const agenticService = new AgenticService();
