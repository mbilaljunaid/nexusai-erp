// @ts-nocheck
import { Express, Request, Response } from "express";
import { storage } from "../../storage";
import { insertInvoiceSchema, insertPaymentSchema, insertGlAutoPostRuleSchema, insertGlDataAccessSetSchema, glCloseTasks, insertGlCloseTaskSchema, glEliminationDefinitions } from "../../../shared/schema";
import { financeService } from "../../services/finance";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { ConsolidationService } from "./consolidation.service";
import { allocationsService } from "../intercompany/allocations.service";

export function registerFinanceRoutes(app: Express) {
    // Invoices
    app.get("/api/invoices", async (req, res) => {
        try {
            const invoices = await storage.listInvoices();
            res.json(invoices);
        } catch (error) {
            res.status(500).json({ error: "Failed to list invoices" });
        }
    });

    app.get("/api/invoices/:id", async (req, res) => {
        try {
            const invoice = await storage.getInvoice(req.params.id);
            if (!invoice) return res.status(404).json({ error: "Invoice not found" });
            res.json(invoice);
        } catch (error) {
            res.status(500).json({ error: "Failed to get invoice" });
        }
    });

    app.post("/api/invoices", async (req, res) => {
        try {
            const parseResult = insertInvoiceSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const invoice = await storage.createInvoice(parseResult.data);
            res.status(201).json(invoice);
        } catch (error) {
            res.status(500).json({ error: "Failed to create invoice" });
        }
    });

    // Payments
    app.get("/api/payments", async (req, res) => {
        try {
            const payments = await storage.listPayments(req.query.invoiceId as string);
            res.json(payments);
        } catch (error) {
            res.status(500).json({ error: "Failed to list payments" });
        }
    });

    app.post("/api/payments", async (req, res) => {
        try {
            const parseResult = insertPaymentSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const payment = await storage.createPayment(parseResult.data);
            res.status(201).json(payment);
        } catch (error) {
            res.status(500).json({ error: "Failed to create payment" });
        }
    });




    // Financial Reporting (FSG)
    // Replaced all /api/gl with /api/finance/gl
    app.get("/api/finance/gl/reports", async (req, res) => {
        try {
            const reports = await financeService.listReports();
            res.json(reports);
        } catch (error) {
            res.status(500).json({ error: "Failed to list reports" });
        }
    });

    app.get("/api/finance/gl/ledgers", async (req, res) => {
        try {
            const ledgers = await financeService.listLedgers();
            res.json(ledgers);
        } catch (error) {
            res.status(500).json({ error: "Failed to list ledgers" });
        }
    });

    app.get("/api/finance/gl/periods", async (req, res) => {
        try {
            const periods = await financeService.listPeriods();
            res.json(periods);
        } catch (error) {
            res.status(500).json({ error: "Failed to list periods" });
        }
    });

    app.post("/api/gl/reports/generate", async (req, res) => {
        try {
            const { reportId, periodName, ledgerId } = req.body;
            if (!reportId || !periodName) {
                return res.status(400).json({ error: "reportId and periodName are required" });
            }
            const report = await financeService.generateFinancialReport(reportId, periodName, ledgerId);
            res.json(report);
        } catch (error) {
            console.error("FSG Generation Error:", error);
            res.status(500).json({ error: "Failed to generate report" });
        }
    });
    // Revaluation
    app.get("/api/gl/revaluations", async (req, res) => {
        try {
            const ledgerId = (req.query.ledgerId as string) || "primary-ledger-001";
            const runs = await storage.listRevaluations(ledgerId);
            res.json(runs);
        } catch (error) {
            res.status(500).json({ error: "Failed to list revaluation runs" });
        }
    });

    app.post("/api/gl/revaluation", async (req, res) => {
        try {
            const { ledgerId, periodName, currencyCode, rateType, unrealizedGainLossAccountId } = req.body;
            if (!periodName || !currencyCode || !unrealizedGainLossAccountId) {
                return res.status(400).json({ error: "Missing required fields" });
            }
            // Default ledger if missing
            const lid = ledgerId || "primary-ledger-001";
            const result = await financeService.runRevaluation(lid, periodName, currencyCode, rateType || "Spot", unrealizedGainLossAccountId);
            res.json(result);
        } catch (error: any) {
            console.error("Revaluation Error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    // Intercompany Rules
    app.get("/api/gl/intercompany-rules", async (req, res) => {
        try {
            const rules = await financeService.listIntercompanyRules();
            res.json(rules);
        } catch (error) {
            res.status(500).json({ error: "Failed to list intercompany rules" });
        }
    });

    app.post("/api/gl/intercompany-rules", async (req, res) => {
        try {
            const rule = await financeService.createIntercompanyRule(req.body);
            res.status(201).json(rule);
        } catch (error) {
            res.status(500).json({ error: "Failed to create intercompany rule" });
        }
    });

    // Budgetary Control - Budgets
    app.get("/api/gl/budgets", async (req, res) => {
        try {
            const ledgerId = (req.query.ledgerId as string) || "primary-ledger-001";
            const budgets = await storage.listGlBudgets(ledgerId);
            res.json(budgets);
        } catch (error) {
            res.status(500).json({ error: "Failed to list budgets" });
        }
    });

    app.post("/api/gl/budgets", async (req, res) => {
        try {
            const budget = await storage.createGlBudget(req.body);
            res.status(201).json(budget);
        } catch (error) {
            res.status(500).json({ error: "Failed to create budget" });
        }
    });

    // Budgetary Control - Rules
    app.get("/api/gl/budget-control-rules", async (req, res) => {
        try {
            const ledgerId = (req.query.ledgerId as string) || "primary-ledger-001";
            const rules = await storage.listGlBudgetControlRules(ledgerId);
            res.json(rules);
        } catch (error) {
            res.status(500).json({ error: "Failed to list control rules" });
        }
    });

    app.post("/api/gl/budget-control-rules", async (req, res) => {
        try {
            const rule = await storage.createGlBudgetControlRule(req.body);
            res.status(201).json(rule);
        } catch (error) {
            res.status(500).json({ error: "Failed to create control rule" });
        }
    });

    // Cross Validation Rules (CVR)
    app.get("/api/gl/cross-validation-rules", async (req, res) => {
        try {
            const ledgerId = (req.query.ledgerId as string) || "primary-ledger-001";
            const rules = await storage.listGlCrossValidationRules(ledgerId);
            res.json(rules);
        } catch (error) {
            res.status(500).json({ error: "Failed to list cross validation rules" });
        }
    });

    app.post("/api/gl/cross-validation-rules", async (req, res) => {
        try {
            const rule = await storage.createGlCrossValidationRule(req.body);
            res.status(201).json(rule);
        } catch (error) {
            res.status(500).json({ error: "Failed to create cross validation rule" });
        }
    });

    app.patch("/api/gl/cross-validation-rules/:id", async (req, res) => {
        try {
            const rule = await storage.updateGlCrossValidationRule(req.params.id, req.body);
            if (!rule) return res.status(404).json({ error: "Rule not found" });
            res.json(rule);
        } catch (error) {
            res.status(500).json({ error: "Failed to update cross validation rule" });
        }
    });

    app.delete("/api/gl/cross-validation-rules/:id", async (req, res) => {
        try {
            const success = await storage.deleteGlCrossValidationRule(req.params.id);
            if (!success) return res.status(404).json({ error: "Rule not found" });
            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: "Failed to delete cross validation rule" });
        }
    });
    // Auto-Post Rules (Chunk 5)
    app.get("/api/gl/posting-rules", async (req, res) => {
        try {
            const ledgerId = (req.query.ledgerId as string) || "primary-ledger-001";
            const rules = await storage.listGlAutoPostRules(ledgerId);
            res.json(rules);
        } catch (error) {
            res.status(500).json({ error: "Failed to list posting rules" });
        }
    });

    app.post("/api/gl/posting-rules", async (req, res) => {
        try {
            const parseResult = insertGlAutoPostRuleSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const rule = await storage.createGlAutoPostRule(parseResult.data);
            res.status(201).json(rule);
        } catch (error) {
            res.status(500).json({ error: "Failed to create posting rule" });
        }
    });

    app.delete("/api/gl/posting-rules/:id", async (req, res) => {
        try {
            const success = await storage.deleteGlAutoPostRule(req.params.id);
            if (!success) return res.status(404).json({ error: "Rule not found" });
            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: "Failed to delete posting rule" });
        }
    });

    // Data Access Sets (Chunk 4)
    app.get("/api/gl/access-sets", async (req, res) => {
        try {
            const sets = await storage.listGlDataAccessSets();
            res.json(sets);
        } catch (error) {
            res.status(500).json({ error: "Failed to list access sets" });
        }
    });

    app.post("/api/gl/access-sets", async (req, res) => {
        try {
            const parseResult = insertGlDataAccessSetSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const set = await storage.createGlDataAccessSet(parseResult.data);
            res.status(201).json(set);
        } catch (error) {
            res.status(500).json({ error: "Failed to create access set" });
        }
    });

    // CVR Alias (For strict frontend parity)
    app.get("/api/gl/cvr", async (req, res) => {
        try {
            const ledgerId = (req.query.ledgerId as string) || "primary-ledger-001";
            const rules = await storage.listGlCrossValidationRules(ledgerId);
            res.json(rules);
        } catch (error) {
            res.status(500).json({ error: "Failed to list CVRs" });
        }
    });

    app.post("/api/gl/cvr", async (req, res) => {
        try {
            const rule = await storage.createGlCrossValidationRule(req.body);
            res.status(201).json(rule);
        } catch (error) {
            res.status(500).json({ error: "Failed to create CVR" });
        }
    });

    // ================= REVENUE RECOGNITION (L12) =================
    app.post("/api/gl/revenue/schedule", async (req, res) => {
        try {
            // Manual trigger for testing
            const { sourceType, sourceId, totalAmount, ruleId, startDate } = req.body;
            const { RevenueRecognitionService } = await import("../../services/RevenueRecognitionService");

            const result = await RevenueRecognitionService.generateSchedule(
                sourceType,
                sourceId,
                Number(totalAmount),
                ruleId,
                new Date(startDate)
            );
            res.status(201).json(result);
        } catch (error) {
            console.error("RevRec Error:", error);
            res.status(500).json({ error: String(error) });
        }
    });

    app.post("/api/gl/revenue/recognize", async (req, res) => {
        try {
            const { periodName, ledgerId } = req.body;
            const { RevenueRecognitionService } = await import("../../services/RevenueRecognitionService");
            const result = await RevenueRecognitionService.recognizeRevenueForPeriod(periodName, ledgerId || 'PRIMARY');
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: String(error) });
        }
    });

    // 4. Period Management (Close Engine)
    // -----------------------------------------------------

    // Close Period
    app.post("/api/finance/gl/periods/:periodName/close", async (req, res) => {
        try {
            const { closeEngine } = await import("../../services/period-close/CloseEngine");
            const { ledgerId, applicationId, force } = req.body;
            const result = await closeEngine.closePeriod(ledgerId || "PRIMARY", req.params.periodName, applicationId || "GL", force);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    // Open Period
    app.post("/api/finance/gl/periods/:periodName/open", async (req, res) => {
        try {
            const { closeEngine } = await import("../../services/period-close/CloseEngine");
            const { ledgerId, applicationId } = req.body;
            const result = await closeEngine.openPeriod(ledgerId || "PRIMARY", req.params.periodName, applicationId || "GL");
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    // Sweep Events
    app.post("/api/finance/gl/periods/sweep", async (req, res) => {
        try {
            const { closeEngine } = await import("../../services/period-close/CloseEngine");
            const { ledgerId, fromPeriodName, toPeriodName } = req.body;
            const result = await closeEngine.sweepEvents(ledgerId || "PRIMARY", fromPeriodName, toPeriodName);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    // List Statuses
    app.get("/api/finance/gl/period-statuses", async (req, res) => {
        try {
            const { closeEngine } = await import("../../services/period-close/CloseEngine");
            const { ledgerId } = req.query;
            const result = await closeEngine.getCloseStatus((ledgerId as string) || "PRIMARY");
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    // AI Close Prediction
    app.get("/api/gl/predict-close", async (req, res) => {
        try {
            const { closeEngine } = await import("../../services/period-close/CloseEngine");
            const { ledgerId, periodName } = req.query;
            if (!periodName) return res.status(400).json({ error: "Period Name required" });

            const result = await closeEngine.predictCloseDelays((ledgerId as string) || "PRIMARY", periodName as string);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    // 5. Close Task Management
    // -----------------------------------------------------

    // List Tasks
    app.get("/api/finance/gl/close-tasks", async (req, res) => {
        try {
            const { ledgerId, periodId } = req.query;
            const conditions = [];
            if (ledgerId) conditions.push(eq(glCloseTasks.ledgerId, ledgerId as string));
            if (periodId) conditions.push(eq(glCloseTasks.periodId, periodId as string));

            const results = await db.select().from(glCloseTasks)
                .where(and(...conditions))
                .orderBy(desc(glCloseTasks.dueDate)); // Sort by due date
            res.json(results);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // Create Task
    app.post("/api/finance/gl/close-tasks", async (req, res) => {
        try {
            const data = insertGlCloseTaskSchema.parse(req.body);
            const [newTask] = await db.insert(glCloseTasks).values(data).returning();
            res.json(newTask);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    // Update Task
    app.patch("/api/finance/gl/close-tasks/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const data = req.body; // Partial update
            const [updated] = await db.update(glCloseTasks)
                .set({ ...data, completedAt: data.status === "COMPLETED" ? new Date() : undefined })
                .where(eq(glCloseTasks.id, id))
                .returning();
            res.json(updated);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    // Delete Task
    app.delete("/api/finance/gl/close-tasks/:id", async (req, res) => {
        try {
            const { id } = req.params;
            await db.delete(glCloseTasks).where(eq(glCloseTasks.id, id));
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });


    // ================= REPORTING (L11) =================
    app.post("/api/gl/reports/account-analysis", async (req, res) => {
        try {
            const { ledgerId, periodName, segment1, segment3 } = req.body;
            const { reportingService } = await import("./reporting.service");
            const result = await reportingService.generateAccountAnalysis(
                ledgerId || "PRIMARY",
                periodName,
                { segment1, segment3 }
            );
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });
    // ================= JOURNAL APPROVALS (Phase 9) =================
    // Bulk Import Journals
    app.post("/api/gl/journals/import", async (req, res) => {
        try {
            const { journalService } = await import("./journal.service");
            // The generic importer sends an array of records
            // We need to group them by Journal Number (if provided) or treat each row as a line?
            // For simplicity in this "Wizard-like" import, let's assume the user imports LINES for a single batch, 
            // OR multiple batches. 
            // Let's assume the Excel has "JournalNumber", "Description", "Account", "Debit", "Credit".
            const records = req.body;
            if (!Array.isArray(records)) throw new Error("Expected array of records");

            // Group by Journal Number
            const batches: Record<string, any[]> = {};
            records.forEach((r: any) => {
                const jNum = r['Journal Number'] || r['JournalNumber'] || `IMPORT-${Date.now()}`;
                if (!batches[jNum]) batches[jNum] = [];
                batches[jNum].push(r);
            });

            const results = [];
            for (const [jNum, lines] of Object.entries(batches)) {
                // Create Journal Header from first line
                const first = lines[0];
                const header = {
                    journalNumber: jNum,
                    description: first['Journal Description'] || first['Description'] || "Imported Journal",
                    ledgerId: first['Ledger'] || "PRIMARY",
                    currencyCode: first['Currency'] || "USD",
                    source: "Spreadsheet",
                    status: "Draft" as "Draft",
                    lines: lines.map((l: any) => ({
                        accountId: l['Account'] || l['Account Code'],
                        enteredDebit: Number(l['Debit'] || 0),
                        enteredCredit: Number(l['Credit'] || 0),
                        description: l['Line Description'] || l['Description'] || ""
                    }))
                };
                const created = await financeService.createJournal(header, header.lines, "import-system");
                results.push(created);
            }

            res.json({ message: `Imported ${results.length} journals`, count: results.length });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    app.post("/api/gl/journals/:id/submit", async (req, res) => {
        try {
            const userId = (req.user as any)?.id || "system";
            const result = await financeService.submitJournalForApproval(req.params.id, userId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    app.post("/api/gl/journals/:id/approve", async (req, res) => {
        try {
            const { comments } = req.body;
            const userId = (req.user as any)?.id || "approver-user-id";
            const result = await financeService.approveJournal(req.params.id, userId, comments);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    app.post("/api/gl/journals/:id/reject", async (req, res) => {
        try {
            const { comments } = req.body;
            const userId = (req.user as any)?.id || "approver-user-id";
            const result = await financeService.rejectJournal(req.params.id, userId, comments);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    app.get("/api/gl/journals/:id/audit", async (req, res) => {
        try {
            const logs = await financeService.getAuditLogs(req.params.id);
            res.json(logs);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/api/gl/approvals/pending", async (req, res) => {
        try {
            const userId = (req.user as any)?.id || "approver-user-id";
            const result = await financeService.getPendingApprovals(userId);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // Elimination Rules CRUD
    app.get("/api/gl/elimination-rules", async (req, res) => {
        try {
            const rules = await db.select().from(glEliminationDefinitions);
            res.json(rules);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/gl/elimination-rules", async (req, res) => {
        try {
            const [rule] = await db.insert(glEliminationDefinitions).values(req.body).returning();
            res.json(rule);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.put("/api/gl/elimination-rules/:id", async (req, res) => {
        try {
            const [rule] = await db.update(glEliminationDefinitions)
                .set(req.body)
                .where(eq(glEliminationDefinitions.id, req.params.id))
                .returning();
            res.json(rule);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.delete("/api/gl/elimination-rules/:id", async (req, res) => {
        try {
            await db.delete(glEliminationDefinitions)
                .where(eq(glEliminationDefinitions.id, req.params.id));
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // Allocations CRUD (Phase 4)
    app.post("/api/finance/gl/allocations", async (req, res) => {
        try {
            const rule = await allocationsService.createRule(req.body);
            res.json(rule);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    });

    app.get("/api/finance/gl/allocations", async (req, res) => {
        try {
            const rules = await allocationsService.getRules(req.query.orgId as string);
            res.json(rules);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    });

    app.get("/api/finance/gl/allocations/:id", async (req, res) => {
        try {
            const rule = await allocationsService.getRule(req.params.id);
            if (!rule) return res.status(404).json({ message: "Rule not found" });
            res.json(rule);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    });

    app.put("/api/finance/gl/allocations/:id", async (req, res) => {
        try {
            const rule = await allocationsService.updateRule(req.params.id, req.body);
            res.json(rule);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    });

    app.delete("/api/finance/gl/allocations/:id", async (req, res) => {
        try {
            await allocationsService.deleteRule(req.params.id);
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    });

    // ================= CONSOLIDATION =================
    const consolidationService = new ConsolidationService();

    app.post("/api/gl/consolidation/run", async (req, res) => {
        try {
            const { ledgerSetId, periodId } = req.body;
            const userId = (req.user as any)?.id || "system";
            const result = await consolidationService.runConsolidation(ledgerSetId, periodId, userId);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/api/gl/consolidation/history", async (req, res) => {
        try {
            const history = await consolidationService.getConsolidationHistory(req.query.ledgerSetId as string);
            res.json(history);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/api/gl/consolidation/discrepancies", async (req, res) => {
        try {
            const { periodName } = req.query;
            if (!periodName) return res.status(400).json({ error: "periodName required" });
            const result = await consolidationService.getICBalanceDiscrepancies(periodName as string);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // ================= P1-B: TAX PROVISIONS (FC-OG-02) =================
    app.post("/api/finance/tax-provisions/compute", async (req, res) => {
        try {
            const { taxProvisionService } = await import("./tax-provision.service");
            const userId = (req.user as any)?.id || "system";
            const result = await taxProvisionService.computeProvision({
                ...req.body,
                computedBy: userId,
            });
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/api/finance/tax-provisions", async (req, res) => {
        try {
            const { taxProvisionService } = await import("./tax-provision.service");
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            const year = req.query.year ? parseInt(req.query.year as string) : undefined;
            const result = await taxProvisionService.listProvisions(tenantId, year);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.patch("/api/finance/tax-provisions/:id/status", async (req, res) => {
        try {
            const { taxProvisionService } = await import("./tax-provision.service");
            const result = await taxProvisionService.updateStatus(req.params.id, req.body.status);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // ================= P1-B: ACCOUNT CERTIFICATIONS (FC-OG-01) =================
    app.post("/api/finance/account-certs", async (req, res) => {
        try {
            const { accountCertificationService } = await import("./account-cert.service");
            const result = await accountCertificationService.createCertification(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/api/finance/account-certs", async (req, res) => {
        try {
            const { accountCertificationService } = await import("./account-cert.service");
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            const period = req.query.period as string;
            if (!period) return res.status(400).json({ error: "period required" });
            const result = await accountCertificationService.getCertificationsByPeriod(tenantId, period);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/api/finance/account-certs/summary", async (req, res) => {
        try {
            const { accountCertificationService } = await import("./account-cert.service");
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            const period = req.query.period as string;
            if (!period) return res.status(400).json({ error: "period required" });
            const result = await accountCertificationService.getSummary(tenantId, period);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/finance/account-certs/:id/certify", async (req, res) => {
        try {
            const { accountCertificationService } = await import("./account-cert.service");
            const userId = (req.user as any)?.id || "system";
            const result = await accountCertificationService.certify(req.params.id, userId);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/finance/account-certs/:id/reject", async (req, res) => {
        try {
            const { accountCertificationService } = await import("./account-cert.service");
            const userId = (req.user as any)?.id || "system";
            const result = await accountCertificationService.reject(req.params.id, userId, req.body.reason);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/finance/account-certs/:id/escalate", async (req, res) => {
        try {
            const { accountCertificationService } = await import("./account-cert.service");
            const result = await accountCertificationService.escalate(req.params.id, req.body.reason);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // ================= P1-B: FSG REPORTS (GL-OG-01) =================
    app.post("/api/finance/fsg-reports", async (req, res) => {
        try {
            const { fsgReportingService } = await import("./fsg-reporting.service");
            const userId = (req.user as any)?.id || "system";
            const tenantId = (req.user as any)?.tenantId || req.body.tenantId;
            const result = await fsgReportingService.saveReportDefinition(tenantId, { ...req.body, createdBy: userId });
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/api/finance/fsg-reports", async (req, res) => {
        try {
            const { fsgReportingService } = await import("./fsg-reporting.service");
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            const result = await fsgReportingService.listReports(tenantId);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/finance/fsg-reports/run", async (req, res) => {
        try {
            const { fsgReportingService } = await import("./fsg-reporting.service");
            const userId = (req.user as any)?.id || "system";
            const result = await fsgReportingService.runReport({ ...req.body, generatedBy: userId });
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/api/finance/fsg-reports/output/:outputId", async (req, res) => {
        try {
            const { fsgReportingService } = await import("./fsg-reporting.service");
            const result = await fsgReportingService.getOutput(req.params.outputId);
            if (!result) return res.status(404).json({ error: "Output not found" });
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // ─── P1-E: Payment Terms ──────────────────────────────────────────────────
    app.get("/api/finance/payment-terms", async (req, res) => {
        try {
            const { paymentTermsService } = await import("./payment-terms.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            res.json(await paymentTermsService.listTerms(tenantId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/finance/payment-terms", async (req, res) => {
        try {
            const { paymentTermsService } = await import("./payment-terms.service");
            const tenantId = (req as any).user?.tenantId || "default-tenant";
            res.status(201).json(await paymentTermsService.createTerm({ ...req.body, tenantId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/finance/payment-terms/schedule", async (req, res) => {
        try {
            const { paymentTermsService } = await import("./payment-terms.service");
            const tenantId = (req as any).user?.tenantId || "default-tenant";
            res.json(await paymentTermsService.generateSchedule({ ...req.body, tenantId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/finance/payment-terms/overdue", async (req, res) => {
        try {
            const { paymentTermsService } = await import("./payment-terms.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            res.json(await paymentTermsService.getOverdue(tenantId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── P1-E: Lockbox ────────────────────────────────────────────────────────
    app.post("/api/finance/lockbox/batches", async (req, res) => {
        try {
            const { lockboxService } = await import("./lockbox.service");
            const tenantId = (req as any).user?.tenantId || "default-tenant";
            const importedBy = (req as any).user?.id || "system";
            res.status(201).json(await lockboxService.importBatch({ ...req.body, tenantId, importedBy }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/finance/lockbox/batches", async (req, res) => {
        try {
            const { lockboxService } = await import("./lockbox.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            res.json(await lockboxService.getBatches(tenantId, req.query.status as string));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/finance/lockbox/batches/:id/items", async (req, res) => {
        try {
            const { lockboxService } = await import("./lockbox.service");
            res.json(await lockboxService.getItems(req.params.id, req.query.matchStatus as string));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/finance/lockbox/summary", async (req, res) => {
        try {
            const { lockboxService } = await import("./lockbox.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            res.json(await lockboxService.getSummary(tenantId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── P1-E: AutoInvoice ────────────────────────────────────────────────────
    app.post("/api/finance/autoinvoice/validate", async (req, res) => {
        try {
            const { autoInvoiceService } = await import("./autoinvoice.service");
            const tenantId = (req as any).user?.tenantId || "default-tenant";
            const runBy = (req as any).user?.id || "system";
            res.json(await autoInvoiceService.runValidation({ ...req.body, tenantId, runBy }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/finance/autoinvoice/import/:runId", async (req, res) => {
        try {
            const { autoInvoiceService } = await import("./autoinvoice.service");
            const tenantId = (req as any).user?.tenantId || "default-tenant";
            res.json(await autoInvoiceService.importInvoices(req.params.runId, tenantId, req.body.lines ?? []));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/finance/autoinvoice/runs", async (req, res) => {
        try {
            const { autoInvoiceService } = await import("./autoinvoice.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            res.json(await autoInvoiceService.listRuns(tenantId, req.query.status as string));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/finance/autoinvoice/rules", async (req, res) => {
        try {
            const { autoInvoiceService } = await import("./autoinvoice.service");
            res.json(autoInvoiceService.getRules());
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── P1-E: FX Revaluation ─────────────────────────────────────────────────
    app.post("/api/finance/fx-revaluation/run", async (req, res) => {
        try {
            const { fxRevaluationService } = await import("./fx-revaluation.service");
            const tenantId = (req as any).user?.tenantId || "default-tenant";
            const runBy = (req as any).user?.id || "system";
            res.json(await fxRevaluationService.runRevaluation({ ...req.body, tenantId, runBy }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/finance/fx-revaluation/runs", async (req, res) => {
        try {
            const { fxRevaluationService } = await import("./fx-revaluation.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            res.json(await fxRevaluationService.listRuns(tenantId, req.query.periodName as string));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/finance/fx-revaluation/runs/:id/lines", async (req, res) => {
        try {
            const { fxRevaluationService } = await import("./fx-revaluation.service");
            res.json(await fxRevaluationService.getRunLines(req.params.id));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/finance/fx-revaluation/runs/:id/reverse", async (req, res) => {
        try {
            const { fxRevaluationService } = await import("./fx-revaluation.service");
            res.json(await fxRevaluationService.reverseRevaluation(req.params.id));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
}

