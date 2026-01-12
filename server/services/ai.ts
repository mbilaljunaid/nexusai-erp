import { storage } from "../storage";
import { financeService } from "./finance";
import { apService } from "./ap";
import { arService } from "./ar";
import { AiAction, InsertAiAction, InsertAiAuditLog } from "@shared/schema";
import OpenAI from "openai";
import ExcelJS from "exceljs";

const openai = new OpenAI({
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1",
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "dummy-key",
});

export class AIService {

    async processInvoiceExtraction(file: Buffer, mimeType: string, fileName: string): Promise<any> {
        console.log(`[AI] Extracting invoice from ${fileName} (${mimeType})`);
        let extractedText = "";

        // 1. Convert to text based on type
        if (mimeType.startsWith("audio/")) {
            const transcription = await openai.audio.transcriptions.create({
                file: await OpenAI.toFile(file, fileName),
                model: "whisper-1",
            });
            extractedText = transcription.text;
        } else if (mimeType.includes("excel") || mimeType.includes("spreadsheetml") || fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(file);
            const worksheet = workbook.worksheets[0];
            const rows: any[] = [];
            worksheet.eachRow((row) => {
                rows.push(row.values);
            });
            extractedText = JSON.stringify(rows);
        } else if (mimeType.startsWith("image/") || mimeType === "application/pdf") {
            // For images and PDFs, we use Vision
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert invoice processing agent. Extract the following information from the invoice image/PDF: Supplier Name, Invoice Number, Date, Total Amount, Currency, and Line Items (Description, Quantity, Unit Price, Amount). Return ONLY valid JSON."
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Please extract the invoice details from this file." },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${mimeType};base64,${file.toString("base64")}`,
                                },
                            },
                        ],
                    },
                ],
                response_format: { type: "json_object" },
            });
            return JSON.parse(response.choices[0].message.content || "{}");
        }

        // 2. If we have text (from audio or excel), process with GPT-4o
        if (extractedText) {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert invoice processing agent. From the provided text, extract: Supplier Name, Invoice Number, Date, Total Amount, Currency, and Line Items. Return ONLY valid JSON."
                    },
                    {
                        role: "user",
                        content: extractedText
                    }
                ],
                response_format: { type: "json_object" },
            });
            return JSON.parse(response.choices[0].message.content || "{}");
        }

        throw new Error("Unsupported file type or extraction failed");
    }

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
                module: "finance",
                actionName: "gl_configure_system",
                description: "Configure GL system parameters (e.g. Open/Close Periods)",
                requiredPermissions: ["finance.write"],
                inputSchema: {
                    type: "object",
                    properties: {
                        target: { type: "string" }, // e.g., "Period"
                        action: { type: "string" }, // "Close", "Open"
                        value: { type: "string" }   // Period Name
                    }
                },
                isEnabled: true
            },
            {
                module: "finance",
                actionName: "gl_lookup_account",
                description: "Find GL accounts by description or natural language",
                requiredPermissions: ["finance.read"],
                inputSchema: {
                    type: "object",
                    properties: {
                        query: { type: "string" }
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
            },
            {
                module: "ap",
                actionName: "ap_create_invoice",
                description: "Create a new supplier invoice",
                requiredPermissions: ["ap.write"],
                inputSchema: { type: "object" },
                isEnabled: true
            },
            {
                module: "ap",
                actionName: "ap_check_status",
                description: "Check status of an invoice or payment",
                requiredPermissions: ["ap.read"],
                inputSchema: { type: "object" },
                isEnabled: true
            },
            {
                module: "ar",
                actionName: "ar_create_customer",
                description: "Create a new AR customer",
                requiredPermissions: ["ar.write"],
                inputSchema: { type: "object" },
                isEnabled: true
            },
            {
                module: "ar",
                actionName: "ar_check_balance",
                description: "Check customer outstanding balance",
                requiredPermissions: ["ar.read"],
                inputSchema: { type: "object" },
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
    async parseIntent(prompt: string, userId: string, context: string = "general"): Promise<{ action: AiAction | undefined, confidence: number, params: any }> {
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

        // GL Configuration (e.g., "Close Jan-2026")
        if (lowerPrompt.includes("close") && (lowerPrompt.includes("period") || lowerPrompt.includes("jan") || lowerPrompt.includes("feb"))) {
            const action = await storage.getAiAction("gl_configure_system");
            // Extract period name heuristic
            const words = lowerPrompt.split(" ");
            const periodName = words.find(w => w.includes("-202")) || "Jan-2026"; // Mock extraction
            return {
                action,
                confidence: 0.9,
                params: { target: "Period", action: "Close", value: periodName }
            };
        }

        // Account Lookup (e.g., "Find travel account")
        if (lowerPrompt.includes("find") && (lowerPrompt.includes("account") || lowerPrompt.includes("code"))) {
            const action = await storage.getAiAction("gl_lookup_account");
            return {
                action,
                confidence: 0.88,
                params: { query: lowerPrompt.replace("find", "").replace("account", "").trim() }
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

        // AP Context
        if (context === "ap") {
            if (lowerPrompt.includes("invoice") && (lowerPrompt.includes("create") || lowerPrompt.includes("add"))) {
                const action = await storage.getAiAction("ap_create_invoice");
                return {
                    action: action as AiAction,
                    confidence: 0.9,
                    params: {
                        supplierId: "SUP_MOCK_001",
                        amount: 1500,
                        currency: "USD"
                    }
                };
            }

            if (lowerPrompt.includes("status") || lowerPrompt.includes("check")) {
                const action = await storage.getAiAction("ap_check_status");
                return {
                    action: action as AiAction,
                    confidence: 0.85,
                    params: { invoiceNumber: "INV-RECENT" }
                };
            }

            if (lowerPrompt.includes("simulate") || lowerPrompt.includes("payment run")) {
                return {
                    action: undefined,
                    confidence: 0.95,
                    params: { simulationType: "payment_run" }
                };
            }
        }

        // AR Context
        if (context === "ar") {
            if (lowerPrompt.includes("customer") && (lowerPrompt.includes("create") || lowerPrompt.includes("add"))) {
                const action = await storage.getAiAction("ar_create_customer");
                return {
                    action: action as AiAction,
                    confidence: 0.9,
                    params: {
                        name: "New AI Customer",
                        customerType: "Commercial",
                        creditLimit: "5000"
                    }
                };
            }

            if (lowerPrompt.includes("balance") || lowerPrompt.includes("outstanding") || lowerPrompt.includes("owe")) {
                const action = await storage.getAiAction("ar_check_balance");
                return {
                    action: action as AiAction,
                    confidence: 0.85,
                    params: { customerName: "Globex Corp" }
                };
            }

            if (lowerPrompt.includes("simulate") || lowerPrompt.includes("collection") || lowerPrompt.includes("remind")) {
                return {
                    action: undefined,
                    confidence: 0.95,
                    params: { simulationType: "collection_run" }
                };
            }
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

            // 2. Execute Logic
            switch (actionName) {
                case "gl_create_journal":
                    // 1. Get default ledger and period for demo
                    const ledgers = await financeService.listLedgers();
                    const targetLedger = ledgers[0];
                    if (!targetLedger) throw new Error("No ledger found");

                    const periods = await financeService.listPeriods(targetLedger.id);
                    const targetPeriod = periods.find(p => p.status === "Open") || periods[0];
                    if (!targetPeriod) throw new Error("No open period found");

                    // 2. Resolve account (Try to find CCID)
                    let ccid = params.accountId;
                    if (!ccid || ccid === "UNKNOWN") {
                        if (params.segmentString) {
                            const cc = await financeService.getOrCreateCodeCombination(targetLedger.id, params.segmentString);
                            ccid = cc.id;
                        } else {
                            // Fallback to first available account for demo
                            const combinations = await financeService.listGlCodeCombinations(targetLedger.id);
                            ccid = combinations[0]?.id || "default-ccid";
                        }
                    }

                    const journal = await financeService.createJournal({
                        ledgerId: targetLedger.id,
                        periodId: targetPeriod.id,
                        journalNumber: "AI-" + Date.now().toString().slice(-6),
                        description: params.description || "AI Generated Journal",
                        source: "AI Agent",
                        currencyCode: targetLedger.currencyCode,
                        status: "Draft"
                    }, [
                        { accountId: ccid, enteredDebit: String(params.amount || 0), enteredCredit: "0" },
                        { accountId: ccid, enteredDebit: "0", enteredCredit: String(params.amount || 0) } // Balanced entry
                    ], userId);

                    result = {
                        message: `I've drafted journal ${journal.journalNumber} for you.`,
                        journalId: journal.id,
                        details: {
                            description: journal.description,
                            amount: params.amount,
                            status: "Draft"
                        }
                    };
                    break;
                case "gl_detect_anomalies":
                    result = await financeService.detectAnomalies();
                    break;
                case "gl_explain_variance":
                    const p1 = params.periodId === "CURRENT_PERIOD_ID" ? (await financeService.listPeriods())[0]?.id : params.periodId;
                    const p2 = params.benchmarkPeriodId === "PREV_PERIOD_ID" ? (await financeService.listPeriods())[1]?.id : params.benchmarkPeriodId;
                    if (!p1 || !p2) throw new Error("Could not resolve periods for comparison");
                    result = await financeService.explainVariance(p1, p2);
                    break;
                case "gl_configure_system":
                    if (params.target === "Period" && params.action === "Close") {
                        // Find period by name
                        const periods = await financeService.listPeriods();
                        const period = periods.find(p => p.periodName?.toLowerCase() === params.value?.toLowerCase());
                        if (!period) throw new Error(`Period '${params.value}' not found.`);

                        // Close it
                        await financeService.closePeriod(period.id, userId);
                        result = { message: `Period ${period.periodName} has been successfully closed.` };
                    } else {
                        result = { message: "I can currently only help with closing periods." };
                    }
                    break;
                case "gl_lookup_account":
                    const allCombs = await financeService.listGlCodeCombinations(params.ledgerId || "primary-ledger-id"); // In real app, resolve ledger from context
                    // Fuzzy match description
                    const matches = allCombs.filter(c => c.codeString.includes(params.query) || "Travel Expense".toLowerCase().includes(params.query.toLowerCase())); // Mock description check
                    result = {
                        message: `Found ${matches.length} matching accounts.`,
                        data: matches.slice(0, 5)
                    };
                    break;
                case "crm_score_lead":
                    result = { leadId: params.leadId, score: 85, reason: "High engagement" };
                    break;
                case "ap_create_invoice":
                    const invData = {
                        supplierId: params.supplierId || "unknown",
                        invoiceNumber: "INV-" + Date.now(),
                        amount: String(params.amount || 1000),
                        currency: params.currency || "USD",
                        dueDate: new Date()
                    };
                    const createdInvoice = await apService.createInvoice(invData as any);
                    result = { ...createdInvoice, message: "I've drafted the invoice for you." };
                    break;
                case "ap_check_status":
                    const apInvoices = await apService.listInvoices();
                    const apInv = apInvoices.find(i => i.invoiceNumber === params.invoiceNumber);
                    if (!apInv) {
                        result = { message: `Invoice ${params.invoiceNumber} not found.` };
                    } else {
                        result = {
                            invoice: apInv.invoiceNumber,
                            amount: apInv.invoiceAmount,
                            status: apInv.paymentStatus || "Pending",
                            date: apInv.invoiceDate
                        };
                    }
                    break;
                case "ar_create_customer":
                    const custData = {
                        name: params.name || "New AI Customer",
                        customerType: params.customerType || "Commercial",
                        creditLimit: params.creditLimit || "5000",
                        balance: "0",
                        status: "Active"
                    };
                    const createdCust = await arService.createCustomer(custData as any);
                    result = { ...createdCust, message: "I've created the customer profile for you." };
                    break;
                case "ar_check_balance":
                    const customers = await arService.listCustomers();
                    const customer = customers.find(c => c.name.toLowerCase().includes((params.customerName || "").toLowerCase()));
                    if (!customer) {
                        result = { message: `I couldn't find a customer named '${params.customerName}'.` };
                    } else {
                        const balanceData = await arService.getCustomerBalance(customer.id);
                        result = {
                            customer: customer.name,
                            balance: balanceData.outstanding.toFixed(2),
                            overdue: "0.00",
                            status: customer.creditHold ? "Credit Hold" : "Good Standing",
                            details: balanceData
                        };
                    }
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
                inputPrompt: JSON.stringify(params),
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
