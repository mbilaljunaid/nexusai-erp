import { Request, Response } from "express";
import { PpmService } from "./services/PpmService";
import { PpmBillingService } from "./services/PpmBillingService";
import { PpmPlanningService } from "./services/PpmPlanningService";

export class PpmController {
    private ppmService = new PpmService();
    private ppmBillingService = new PpmBillingService();
    private ppmPlanningService = new PpmPlanningService();

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

    importCosts = async (req: Request, res: Response) => {
        try {
            const apItems = await this.ppmService.collectFromAP();
            const laborItems = await this.ppmService.collectFromLabor();
            const invItems = await this.ppmService.collectFromInventory();

            res.json({
                success: true,
                summary: {
                    ap: apItems.length,
                    labor: laborItems.length,
                    inventory: invItems.length,
                    total: apItems.length + laborItems.length + invItems.length
                },
                details: { apItems, laborItems, invItems }
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
}

export const ppmController = new PpmController();
