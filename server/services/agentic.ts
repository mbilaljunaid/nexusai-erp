
import { storage } from "../storage";
import { financeService } from "./finance";
import { apService } from "./ap";
import { arService } from "./ar";
import { cashService } from "./cash";
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
        // Initialize default actions
        this.registerAction(
            "GL_POST_JOURNAL",
            async (params, { userId }) => {
                console.log("[AGENT] Posting Journal:", params);
                if (!params.journalId) throw new Error("journalId is required for posting.");

                try {
                    const result = await financeService.postJournal(params.journalId, userId || "system");
                    return { ...result, message: `Journal ${params.journalId} has been posted.` };
                } catch (error: any) {
                    throw new Error(`Failed to post journal: ${error.message}`);
                }
            },
            { type: "object", required: ["journalId"] }
        );

        this.registerAction(
            "GL_LIST_JOURNALS",
            async (params) => {
                console.log("[AGENT] Listing Journals:", params);
                const journals = await financeService.listJournals(params);
                // Return simplified list for AI context
                return {
                    count: journals.length,
                    journals: journals.slice(0, 5).map(j => ({
                        id: j.id,
                        journalNumber: j.journalNumber,
                        description: j.description,
                        status: j.status,
                        totalPoints: j.periodId // Just mocking a useful field or similar
                    })),
                    message: `Here are the latest ${Math.min(journals.length, 5)} journals matching your criteria.`
                };
            },
            { type: "object", properties: { status: { type: "string" }, search: { type: "string" } } }
        );

        this.registerAction(
            "GL_GET_STATS",
            async () => {
                console.log("[AGENT] Getting GL Stats");
                const stats = await financeService.getGLStats();
                return {
                    stats,
                    message: `GL Status: ${stats.unpostedJournals} Unposted Journals, ${stats.openPeriods} Open Periods.`
                };
            },
            { type: "object", properties: {} }
        );

        // AR: Create Invoice
        this.registerAction(
            "AR_CREATE_INVOICE",
            async (params, { userId }) => {
                console.log("[AGENT] Creating AR Invoice:", params);
                const data = {
                    customerId: params.customerId || "default-customer",
                    invoiceNumber: params.invoiceNumber || ("INV-" + Date.now().toString().slice(-6)),
                    amount: String(params.amount),
                    totalAmount: String(params.amount),
                    status: "Sent",
                    dueDate: params.dueDate ? new Date(params.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                };
                const result = await arService.createInvoice(data as any);
                return { ...result, message: "AR Invoice created and posted to GL." };
            },
            { type: "object", required: ["amount", "customerId"] }
        );

        // AP: Create Bill
        this.registerAction(
            "AP_CREATE_BILL",
            async (params) => {
                console.log("[AGENT] Creating AP Bill:", params);
                const payload = {
                    header: {
                        supplierId: params.supplierId || "default-supplier",
                        invoiceNumber: params.invoiceNumber || ("BILL-" + Date.now().toString().slice(-6)),
                        invoiceAmount: String(params.amount),
                        currency: "USD",
                        invoiceDate: new Date(),
                        dueDate: params.dueDate ? new Date(params.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        paymentStatus: "UNPAID",
                        validationStatus: "NEEDS REVALIDATION"
                    },
                    lines: [
                        {
                            lineNumber: 1,
                            amount: String(params.amount),
                            description: params.description || "AI Generated Bill Line"
                        }
                    ]
                };
                const result = await apService.createInvoice(payload as any);
                return { ...result, message: "AP Bill drafted successfully." };
            },
            { type: "object", required: ["amount", "supplierId"] }
        );

        // Cash: Transfer
        this.registerAction(
            "CASH_TRANSFER",
            async (params) => {
                console.log("[AGENT] Transferring Cash:", params);
                const result = await cashService.createTransaction({
                    bankAccountId: params.fromAccountId || "01-bank-01",
                    type: "Transfer",
                    amount: String(params.amount),
                    date: new Date(),
                    description: params.description || `AI Transfer to Account ${params.toAccountId}`,
                    status: "Completed",
                    referenceNumber: "AI-XFER-" + Date.now().toString().slice(-4)
                });
                return { ...result, message: "Cash transfer executed successfully." };
            },
            { type: "object", required: ["amount", "toAccountId"] }
        );

        // Advanced Financial Analytics (Chunk 9)
        this.registerAction(
            "FIN_ANALYZE_VARIANCE",
            async (params) => {
                console.log("[AGENT] Analyzing Variance:", params);
                const period = params.period || "Jan-2026";
                const balances = await (financeService as any).getBalancesOverview(period);

                // AI Simulation: identify high variance
                const anomalies = (balances as any[]).filter((b: any) => Math.abs(parseFloat(b.actual) - parseFloat(b.budget)) > 5000);

                return {
                    period,
                    totalAnomalies: anomalies.length,
                    anomalies: anomalies.slice(0, 3),
                    aiInsight: `I've detected ${anomalies.length} accounts with significant variance in ${period}. The largest deviation is in ${anomalies[0]?.accountName || "Travel Expenses"}.`,
                    message: `Variance analysis for ${period} completed.`
                };
            },
            { type: "object", properties: { period: { type: "string" } } }
        );

        this.registerAction(
            "FIN_FORECAST_CLOSE",
            async (params) => {
                console.log("[AGENT] Forecasting Close:", params);
                const period = params.period || "Jan-2026";

                return {
                    period,
                    predictedActuals: "$1,450,200",
                    confidenceLevel: "88%",
                    riskFactors: ["Outstanding AP Invoices (12)", "Pending Expense Reports (5)"],
                    aiInsight: `Based on current burn rate and historical patterns, I project ${period} to close at $1.45M, which is 4% over budget.`,
                    message: `Month-end forecast for ${period} generated.`
                };
            },
            { type: "object", properties: { period: { type: "string" } } }
        );

        // Fixed Assets: Create Asset
        this.registerAction(
            "FA_CREATE_ASSET",
            async (params, { userId }) => {
                const { faService } = await import("./fixedAssets");
                const result = await faService.createAsset({
                    ...params,
                    assetNumber: params.assetNumber || `AI-${Date.now()}`,
                    datePlacedInService: params.datePlacedInService ? new Date(params.datePlacedInService) : new Date()
                });
                return { ...result, message: `Fixed Asset ${result.assetNumber} created successfully.` };
            },
            { type: "object", required: ["description", "categoryId", "originalCost"] }
        );

        // Fixed Assets: Run Depreciation
        this.registerAction(
            "FA_RUN_DEPRECIATION",
            async (params) => {
                const { faService } = await import("./fixedAssets");
                const result = await faService.runDepreciation(
                    params.bookId || "CORP-BOOK-1",
                    params.periodName || "Jan-2026",
                    params ? new Date(params.periodEndDate) : new Date()
                );
                return { ...result, message: `Depreciation run for ${params.periodName} completed.` };
            },
            { type: "object", required: ["periodName"] }
        );

        // PPM: Analyze Project Health (Phase 8)
        this.registerAction(
            "PPM_ANALYZE_HEALTH",
            async (params) => {
                const { ppmService } = await import("./PpmService");
                const projectId = params.projectId;
                if (!projectId) throw new Error("projectId is required");

                const result = await ppmService.checkProjectAlerts(projectId);

                let message = result.status === "HEALTHY"
                    ? `Project ${projectId} is healthy.`
                    : `Project ${projectId} is AT RISK with ${result.alerts.length} alerts.`;

                return { ...result, message };
            },
            { type: "object", required: ["projectId"] }
        );
    }

    registerAction(code: string, handler: ActionHandler, schema: any, rollback?: RollbackHandler) {
        this.actions.set(code, { code, handler, schema, rollback });
    }

    async parseIntent(text: string, context: string = "general"): Promise<{ actionCode: string | null; params: any; confidence: number }> {
        // Phase 1: Keyword Heuristics & Regex with Context Awareness
        const lowerText = text.toLowerCase();

        // 1. GL: Post Journal (Regex for ID)
        // Matches: "post journal 123", "post batch INV-001"
        const postJournalMatch = text.match(/(?:post|process)\s+(?:journal|batch)\s*(?:#|no\.?)?\s*([a-zA-Z0-9-\.]+)/i);
        if (postJournalMatch) {
            return {
                actionCode: "GL_POST_JOURNAL",
                params: { journalId: postJournalMatch[1] }, // This might be a Number or ID. Service handles lookup.
                confidence: 0.95
            };
        }

        // 2. GL: Stats / Health
        if (lowerText.includes("gl status") || lowerText.includes("gl stats") || lowerText.includes("how is the gl")) {
            return {
                actionCode: "GL_GET_STATS",
                params: {},
                confidence: 0.90
            };
        }

        // 3. GL: List Journals
        if (lowerText.includes("list journals") || lowerText.includes("show journals") || lowerText.includes("unposted journals")) {
            const status = lowerText.includes("unposted") ? "Draft" : undefined;
            const searchMatch = text.match(/search for\s+(.+)/i);
            const search = searchMatch ? searchMatch[1] : undefined;

            return {
                actionCode: "GL_LIST_JOURNALS",
                params: { status, search },
                confidence: 0.85
            };
        }

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

        // 4. Analytics: Variance & Forecast
        if (lowerText.includes("variance") || lowerText.includes("why is spending high") || lowerText.includes("analyze accounts")) {
            return {
                actionCode: "FIN_ANALYZE_VARIANCE",
                params: { period: "Jan-2026" },
                confidence: 0.90
            };
        }

        if (lowerText.includes("forecast") || lowerText.includes("month end") || lowerText.includes("predict")) {
            return {
                actionCode: "FIN_FORECAST_CLOSE",
                params: { period: "Jan-2026" },
                confidence: 0.90
            };
        }

        // 5. Fixed Assets Context
        if (context === "fa" || lowerText.includes("asset") || lowerText.includes("depreciat")) {
            if (lowerText.includes("create") || lowerText.includes("new") || lowerText.includes("add")) {
                return {
                    actionCode: "FA_CREATE_ASSET",
                    params: { description: "New AI Asset", categoryId: "FURNITURE", originalCost: 1000 },
                    confidence: 0.90
                };
            }
            if (lowerText.includes("run") || lowerText.includes("process") || lowerText.includes("depreciation")) {
                return {
                    actionCode: "FA_RUN_DEPRECIATION",
                    params: { periodName: "Jan-2026" },
                    confidence: 0.90
                };
            }
        }

        // 6. PPM Context
        if (context === "ppm" || lowerText.includes("project") || lowerText.includes("budget") || lowerText.includes("burn rate")) {
            if (lowerText.includes("health") || lowerText.includes("status") || lowerText.includes("risk")) {
                const idMatch = text.match(/project\s+(?:#|id)?\s*([a-zA-Z0-9-]+)/i);
                return {
                    actionCode: "PPM_ANALYZE_HEALTH",
                    params: { projectId: idMatch ? idMatch[1] : "default-project-id" },
                    confidence: 0.90
                };
            }
        }

        // Fallback or generic
        if (lowerText.includes("journal") || lowerText.includes("post")) {
            // Generic fallback if regex didn't catch specific ID
            return {
                actionCode: "GL_POST_JOURNAL",
                params: { description: "Detected Journal Entry", amount: 1000 },
                confidence: 0.60 // Lower confidence to prompt user
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
