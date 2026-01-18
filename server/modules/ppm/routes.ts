
import { Express, Request, Response } from "express";
import { PpmService } from "../../services/PpmService";
import { insertPpmExpenditureItemSchema } from "../../../shared/schema";

const ppmService = new PpmService();

export function registerPpmRoutes(app: Express) {
    // ----------------------------------------------------
    // PROJECT PERFORMANCE (EVM)
    // ----------------------------------------------------

    // GET /api/ppm/projects/:id/performance
    // Returns CPI, SPI, EV, PV, AC and alerts
    app.get("/api/ppm/projects/:id/performance", async (req, res) => {
        try {
            const projectId = req.params.id;
            // Get performance metrics
            const metrics = await ppmService.getProjectPerformance(projectId);
            // Get health alerts
            const health = await ppmService.checkProjectAlerts(projectId);

            res.json({
                ...metrics,
                status: health.status,
                alerts: health.alerts
            });
        } catch (error: any) {
            console.error("PPM Performance Error:", error);
            res.status(500).json({ error: error.message || "Failed to fetch performance metrics" });
        }
    });

    // ----------------------------------------------------
    // COST CAPTURE (IMPORT)
    // ----------------------------------------------------

    // POST /api/ppm/costs/import
    // Trigger import from AP, Inventory, and Labor
    app.post("/api/ppm/costs/import", async (req, res) => {
        try {
            // Import from AP
            const apItems = await ppmService.collectFromAP();
            // Import from Labor (Time Cards)
            const laborItems = await ppmService.collectFromLabor();
            // Import from Inventory
            const invItems = await ppmService.collectFromInventory();

            res.json({
                success: true,
                summary: {
                    ap: apItems.length,
                    labor: laborItems.length,
                    inventory: invItems.length,
                    total: apItems.length + laborItems.length + invItems.length
                },
                details: {
                    apItems,
                    laborItems,
                    invItems
                }
            });
        } catch (error: any) {
            console.error("PPM Cost Import Error:", error);
            res.status(500).json({ error: error.message || "Failed to import costs" });
        }
    });

    // GET /api/ppm/expenditures
    // List expenditure items with pagination and filters
    app.get("/api/ppm/expenditures", async (req, res) => {
        try {
            const page = parseInt(req.query.page as string || "1");
            const limit = parseInt(req.query.limit as string || "20");
            const projectId = req.query.projectId as string | undefined;

            const result = await ppmService.getExpenditureItems(page, limit, projectId);

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
    });

    // ----------------------------------------------------
    // COST PROCESSING (BURDENING & ACCOUNTING)
    // ----------------------------------------------------

    // POST /api/ppm/costs/:id/distribute
    // Generate Accounting Distributions (SLA)
    app.post("/api/ppm/costs/:id/distribute", async (req, res) => {
        try {
            const expItemId = req.params.id;
            const { drCcid, crCcid } = req.body;

            if (!drCcid || !crCcid) {
                return res.status(400).json({ error: "Debit and Credit CCIDs are required" });
            }

            const dist = await ppmService.generateDistributions(expItemId, drCcid, crCcid);
            res.json(dist);
        } catch (error: any) {
            console.error("PPM Distribution Error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    // POST /api/ppm/costs/:id/burden
    // Apply overhead rules
    app.post("/api/ppm/costs/:id/burden", async (req, res) => {
        try {
            const expItemId = req.params.id;
            const updatedItem = await ppmService.applyBurdening(expItemId);
            res.json(updatedItem);
        } catch (error: any) {
            console.error("PPM Burden Error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    // ----------------------------------------------------
    // ASSET CAPITALIZATION (CIP)
    // ----------------------------------------------------

    // POST /api/ppm/assets/:id/generate-lines
    // Group CIP costs into Asset Lines
    app.post("/api/ppm/assets/:id/generate-lines", async (req, res) => {
        try {
            const projectAssetId = req.params.id;
            const lines = await ppmService.generateAssetLines(projectAssetId);
            res.json({
                success: true,
                linesGenerated: lines.length,
                lines
            });
        } catch (error: any) {
            console.error("PPM Asset Line Gen Error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    // POST /api/ppm/assets/:id/capitalize
    // Push lines to Fixed Assets
    app.post("/api/ppm/assets/:id/capitalize", async (req, res) => {
        try {
            const projectAssetId = req.params.id;
            const result = await ppmService.interfaceToFA(projectAssetId);
            res.json(result);
        } catch (error: any) {
            console.error("PPM Capitalization Error:", error);
            res.status(500).json({ error: error.message });
        }
    });
}
