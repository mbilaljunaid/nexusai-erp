import { Request, Response } from "express";
import { PpmService } from "./services/PpmService";
import { PpmBillingService } from "./services/PpmBillingService";
import { PpmPlanningService } from "./services/PpmPlanningService";

export class PpmController {
    private ppmService = new PpmService();
    private ppmBillingService = new PpmBillingService();
    private ppmPlanningService = new PpmPlanningService();

    // ----------------------------------------------------
    // PROJECT CRUD (BU-SCOPED)
    // ----------------------------------------------------

    getProjects = async (req: Request, res: Response) => {
        try {
            const buId = req.headers["x-business-unit-id"] as string | undefined;
            const projects = await this.ppmService.getProjects(buId);
            res.json(projects);
        } catch (error: any) {
            console.error("PPM getProjects Error:", error);
            res.status(500).json({ error: error.message || "Failed to fetch projects" });
        }
    }

    getProjectById = async (req: Request, res: Response) => {
        try {
            const buId = req.headers["x-business-unit-id"] as string | undefined;
            const project = await this.ppmService.getProjectById(req.params.id, buId);
            if (!project) return res.status(404).json({ error: "Project not found" });
            res.json(project);
        } catch (error: any) {
            console.error("PPM getProjectById Error:", error);
            res.status(500).json({ error: error.message || "Failed to fetch project" });
        }
    }

    createProject = async (req: Request, res: Response) => {
        try {
            const buId = req.headers["x-business-unit-id"] as string | undefined;
            const payload = { ...req.body };
            if (buId) payload.entBusinessUnitId = buId;
            const project = await this.ppmService.createProject(payload);
            res.status(201).json(project);
        } catch (error: any) {
            console.error("PPM createProject Error:", error);
            res.status(500).json({ error: error.message || "Failed to create project" });
        }
    }

    getSummary = async (req: Request, res: Response) => {
        try {
            const buId = req.headers["x-business-unit-id"] as string | undefined;
            const summary = await this.ppmService.getPortfolioSummary(buId);
            res.json(summary);
        } catch (error: any) {
            console.error("PPM getSummary Error:", error);
            res.status(500).json({ error: error.message || "Failed to fetch portfolio summary" });
        }
    }

    // ----------------------------------------------------
    // ALLOCATION RULES (Stub – full impl TBD)
    // ----------------------------------------------------

    getAllocationRules = async (_req: Request, res: Response) => {
        res.json([]);
    }

    createAllocationRule = async (req: Request, res: Response) => {
        res.status(201).json({ id: `rule-${Date.now()}`, ...req.body, status: "ACTIVE" });
    }

    updateAllocationRule = async (req: Request, res: Response) => {
        res.json({ id: req.params.id, ...req.body });
    }

    runAllocation = async (req: Request, res: Response) => {
        res.json({ success: true, ruleId: req.params.id, message: "Allocation run queued" });
    }

    getAllocationPreview = async (_req: Request, res: Response) => {
        res.json({ transfers: [], totalAmount: 0 });
    }

    // ----------------------------------------------------
    // PROJECT PERFORMANCE (EVM)
    // ----------------------------------------------------

    getProjectPerformance = async (req: Request, res: Response) => {
        try {
            const projectId = req.params.id;
            const metrics = await this.ppmService.getProjectPerformance(projectId);
            const health = await this.ppmService.checkProjectAlerts(projectId);
            res.json({
                ...metrics,
                status: health.status,
                alerts: health.alerts
            });
        } catch (error: any) {
            console.error("PPM Performance Error:", error);
            res.status(500).json({ error: error.message || "Failed to fetch performance metrics" });
        }
    }

    // ----------------------------------------------------
    // COST CAPTURE (IMPORT)
    // ----------------------------------------------------

    validateImportCosts = async (req: Request, res: Response) => {
        try {
            const { rows, mappings } = req.body;
            if (!rows || !mappings) {
                return res.status(400).json({ error: "Missing rows or mappings" });
            }

            const validated = rows.map((row: any, idx: number) => {
                const values = row.values || [];
                const parsed: any = { id: idx, rowNumber: idx + 2, status: "pending", errors: [] };

                mappings.forEach((mapping: any, i: number) => {
                    if (mapping.targetField && values[i]) {
                        parsed[mapping.targetField] = values[i];
                    }
                });

                // Validation rules
                if (!parsed.taskId) parsed.errors.push("Task ID is required");
                if (!parsed.expenditureTypeId) parsed.errors.push("Expenditure Type is required");
                if (!parsed.expenditureItemDate) parsed.errors.push("Date is required");
                if (!parsed.quantity || isNaN(Number(parsed.quantity))) parsed.errors.push("Valid quantity is required");
                if (!parsed.rawCost || isNaN(Number(parsed.rawCost))) parsed.errors.push("Valid cost is required");
                if (!parsed.transactionSource) parsed.errors.push("Transaction source is required");

                parsed.status = parsed.errors.length === 0 ? "valid" : "error";
                return parsed;
            });

            res.json({ validated });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    importCosts = async (req: Request, res: Response) => {
        try {
            let manualItems: any[] = [];
            if (req.body && Array.isArray(req.body.costs) && req.body.costs.length > 0) {
                const mapData = req.body.costs.map((c: any) => ({
                    taskId: c.taskId,
                    expenditureTypeId: c.expenditureTypeId,
                    expenditureItemDate: new Date(c.expenditureItemDate),
                    quantity: c.quantity.toString(),
                    rawCost: c.rawCost.toString(),
                    transactionSource: c.transactionSource || "MANUAL_CSV",
                    transactionReference: c.transactionReference || "CSV_IMPORT",
                    denomCurrencyCode: "USD",
                    status: "UNCOSTED"
                }));
                manualItems = await this.ppmService.importExpenditureItems(mapData);
            }

            const apItems = await this.ppmService.collectFromAP();
            const laborItems = await this.ppmService.collectFromLabor();
            const invItems = await this.ppmService.collectFromInventory();

            const importedCount = manualItems.length + apItems.length + laborItems.length + invItems.length;

            res.json({
                success: true,
                imported: importedCount,
                summary: {
                    manual: manualItems.length,
                    ap: apItems.length,
                    labor: laborItems.length,
                    inventory: invItems.length,
                    total: importedCount
                },
                details: { manualItems, apItems, laborItems, invItems }
            });
        } catch (error: any) {
            console.error("PPM Cost Import Error:", error);
            res.status(500).json({ error: error.message || "Failed to import costs" });
        }
    }

    getExpenditures = async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string || "1");
            const limit = parseInt(req.query.limit as string || "20");
            const projectId = req.query.projectId as string | undefined;

            const result = await this.ppmService.getExpenditureItems(page, limit, projectId);

            res.json({
                data: result.items,
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit)
            });
        } catch (error: any) {
            console.error("PPM Expenditure List Error:", error);
            res.status(500).json({ error: "Failed to list expenditures" });
        }
    }

    // ----------------------------------------------------
    // BURDEN SCHEDULES
    // ----------------------------------------------------

    getBurdenSchedules = async (req: Request, res: Response) => {
        try {
            const schedules = await this.ppmService.getBurdenSchedules();
            res.json(schedules);
        } catch (error: any) {
            console.error("PPM getBurdenSchedules Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    createBurdenSchedule = async (req: Request, res: Response) => {
        try {
            const schedule = await this.ppmService.createBurdenSchedule(req.body);
            res.status(201).json(schedule);
        } catch (error: any) {
            console.error("PPM createBurdenSchedule Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    updateBurdenTiers = async (req: Request, res: Response) => {
        try {
            const scheduleId = req.params.id;
            const updatedRules = await this.ppmService.updateBurdenRules(scheduleId, req.body.tiers || req.body);
            res.json(updatedRules);
        } catch (error: any) {
            console.error("PPM updateBurdenTiers Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    simulateBurdenSchedule = async (req: Request, res: Response) => {
        try {
            const result = await this.ppmService.simulateBurdenSchedule(req.params.id);
            res.json(result);
        } catch (error: any) {
            console.error("PPM simulateBurdenSchedule Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    // ----------------------------------------------------
    // COST PROCESSING (BURDENING & ACCOUNTING)
    // ----------------------------------------------------

    distributeCosts = async (req: Request, res: Response) => {
        try {
            const expItemId = req.params.id;
            // No manual CCIDs required; handled by SLA engine
            const dist = await this.ppmService.generateDistributions(expItemId);
            res.json(dist);
        } catch (error: any) {
            console.error("PPM Distribution Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    burdenCosts = async (req: Request, res: Response) => {
        try {
            const expItemId = req.params.id;
            const updatedItem = await this.ppmService.applyBurdening(expItemId);
            res.json(updatedItem);
        } catch (error: any) {
            console.error("PPM Burden Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    // ----------------------------------------------------
    // ASSET CAPITALIZATION (CIP)
    // ----------------------------------------------------

    getProjectAssets = async (req: Request, res: Response) => {
        try {
            const assets = await this.ppmService.getProjectAssets(req.params.id);
            res.json(assets);
        } catch (error: any) {
            console.error("PPM getProjectAssets Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    getPortfolioAssets = async (req: Request, res: Response) => {
        try {
            const buId = req.headers["x-business-unit-id"] as string | undefined;
            const assets = await this.ppmService.getPortfolioAssets(buId);
            res.json(assets);
        } catch (error: any) {
            console.error("PPM getPortfolioAssets Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    consolidateAssets = async (req: Request, res: Response) => {
        try {
            const { assetIds } = req.body;
            if (!assetIds || !Array.isArray(assetIds)) {
                return res.status(400).json({ error: "assetIds array is required" });
            }
            const result = await this.ppmService.consolidateAssets(assetIds);
            res.json(result);
        } catch (error: any) {
            console.error("PPM consolidateAssets Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    generateAssetLines = async (req: Request, res: Response) => {
        try {
            const projectAssetId = req.params.id;
            const lines = await this.ppmService.generateAssetLines(projectAssetId);
            res.json({
                success: true,
                linesGenerated: lines.length,
                lines
            });
        } catch (error: any) {
            console.error("PPM Asset Line Gen Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    capitalizeAssets = async (req: Request, res: Response) => {
        try {
            const projectAssetId = req.params.id;
            const result = await this.ppmService.interfaceToFA(projectAssetId);
            res.json(result);
        } catch (error: any) {
            console.error("PPM Capitalization Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    // ----------------------------------------------------
    // PROJECT BILLING (INVOICING)
    // ----------------------------------------------------

    getBillingSummary = async (req: Request, res: Response) => {
        try {
            const summary = await this.ppmBillingService.getBillingSummary();
            res.json(summary);
        } catch (error: any) {
            console.error("PPM getBillingSummary Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    getUnbilledEvents = async (req: Request, res: Response) => {
        try {
            const projectId = req.params.projectId;
            const events = await this.ppmBillingService.getUnbilledEvents(projectId);
            res.json(events);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    getProjectInvoices = async (req: Request, res: Response) => {
        try {
            const projectId = req.params.projectId;
            const invoices = await this.ppmBillingService.getProjectInvoices(projectId);
            res.json(invoices);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    getInvoiceLines = async (req: Request, res: Response) => {
        try {
            const { invoiceId } = req.params;
            const lines = await db.select().from(ppmProjectInvoiceLines).where(eq(ppmProjectInvoiceLines.invoiceId, invoiceId)).orderBy(ppmProjectInvoiceLines.lineNumber);
            res.json(lines);
        } catch (error: any) {
            console.error("PPM Get Invoice Lines Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    generateBillingEvents = async (req: Request, res: Response) => {
        try {
            const projectId = req.params.projectId;
            const events = await this.ppmBillingService.generateBillingEvents(projectId);
            res.json({
                success: true,
                count: events.length,
                events
            });
        } catch (error: any) {
            console.error("PPM Generate Events Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    generateDraftInvoice = async (req: Request, res: Response) => {
        try {
            const projectId = req.params.projectId;
            const result = await this.ppmBillingService.generateDraftInvoice(projectId);
            if (!result) {
                return res.json({ success: false, message: "No unbilled events found" });
            }
            res.json({
                success: true,
                invoice: result.invoice,
                lineCount: result.lines.length
            });
        } catch (error: any) {
            console.error("PPM Generate Invoice Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    approveInvoice = async (req: Request, res: Response) => {
        try {
            const invoiceId = req.params.id;
            const updated = await this.ppmBillingService.approveInvoice(invoiceId);
            res.json(updated);
        } catch (error: any) {
            console.error("PPM Invoice Approve Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    submitInvoiceToAr = async (req: Request, res: Response) => {
        try {
            const invoiceId = req.params.id;
            const updated = await this.ppmBillingService.interfaceToAR(invoiceId);
            await this.ppmBillingService.interfaceToRevenue(invoiceId);
            res.json(updated);
        } catch (error: any) {
            console.error("PPM Invoice Submit AR Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    // ----------------------------------------------------
    // PROJECT PLANNING (BUDGET & CONTROL)
    // ----------------------------------------------------

    getBudgetSummary = async (req: Request, res: Response) => {
        try {
            const versions = await this.ppmPlanningService.getBudgetSummary(req.params.projectId);
            res.json(versions);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    getBudgetLines = async (req: Request, res: Response) => {
        try {
            const lines = await this.ppmPlanningService.getBudgetLines(req.params.versionId);
            res.json(lines);
        } catch (error: any) {
            console.error("PPM getBudgetLines Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    createBudgetVersion = async (req: Request, res: Response) => {
        try {
            const { name, description } = req.body;
            const version = await this.ppmPlanningService.createBudgetVersion(req.params.projectId, name, description);
            res.json(version);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    addBudgetLines = async (req: Request, res: Response) => {
        try {
            const { lines } = req.body;
            const inserted = await this.ppmPlanningService.addBudgetLines(req.params.versionId, lines);
            res.json({ success: true, count: inserted.length });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    baselineBudget = async (req: Request, res: Response) => {
        try {
            const result = await this.ppmPlanningService.baselineBudget(req.params.versionId);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    setControlRule = async (req: Request, res: Response) => {
        try {
            const { type, level } = req.body;
            const result = await this.ppmPlanningService.setControlRule(req.params.projectId, type, level);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    checkFunds = async (req: Request, res: Response) => {
        try {
            const { amount, taskId } = req.body;
            const result = await this.ppmPlanningService.checkFunds(req.params.projectId, Number(amount), taskId);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // ----------------------------------------------------
    // INTEGRATIONS (ERP & WEBHOOKS)
    // ----------------------------------------------------

    getConnections = async (req: Request, res: Response) => {
        try {
            const result = await this.ppmService.getConnections();
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    configureConnection = async (req: Request, res: Response) => {
        try {
            const result = await this.ppmService.configureConnection(req.body);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    getIntegrationHistory = async (req: Request, res: Response) => {
        try {
            const result = await this.ppmService.getIntegrationHistory();
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    syncConnection = async (req: Request, res: Response) => {
        try {
            const { connectionId } = req.body;
            const result = await this.ppmService.syncConnection(connectionId);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export const ppmController = new PpmController();
