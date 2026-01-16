import { Router } from "express";
import { ConstructionService } from "../services/ConstructionService";
import { ConstructionRiskService } from "../services/ConstructionRiskService";

export const constructionRouter = Router();
const constructionService = new ConstructionService();
const riskService = new ConstructionRiskService();

// -- Contracts --

// Create Contract
constructionRouter.post("/contracts", async (req, res) => {
    try {
        const contract = await constructionService.createContract(req.body);
        res.json(contract);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// List Contracts by Project
constructionRouter.get("/projects/:projectId/contracts", async (req, res) => {
    try {
        const contracts = await constructionService.getContracts(req.params.projectId);
        res.json(contracts);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get Contract Detail (with lines/variations)
constructionRouter.get("/contracts/:id", async (req, res) => {
    try {
        const contract = await constructionService.getContract(req.params.id);
        if (!contract) return res.status(404).json({ error: "Contract not found" });
        res.json(contract);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// -- Lines (SOV) --

// Add SOV Line
constructionRouter.post("/contracts/:id/lines", async (req, res) => {
    try {
        const line = await constructionService.addContractLine({
            ...req.body,
            contractId: req.params.id
        });
        res.json(line);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// -- Variations --

// Create Variation
constructionRouter.post("/variations", async (req, res) => {
    try {
        const variation = await constructionService.createVariation(req.body);
        res.json(variation);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Approve Variation
constructionRouter.post("/variations/:id/approve", async (req, res) => {
    try {
        const variation = await constructionService.approveVariation(req.params.id);
        res.json(variation);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// -- Pay Apps (Progress Billing) --

// Create Pay App
constructionRouter.post("/contracts/:id/pay-apps", async (req, res) => {
    try {
        const payApp = await constructionService.createPayApp({
            ...req.body,
            contractId: req.params.id,
            periodStart: new Date(req.body.periodStart),
            periodEnd: new Date(req.body.periodEnd),
        });
        res.status(201).json(payApp);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: "Failed to create pay application" });
    }
});

// Get Pay Apps for Contract
constructionRouter.get("/contracts/:id/pay-apps", async (req, res) => {
    try {
        const apps = await constructionService.getPayApps(req.params.id);
        res.json(apps);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch pay applications" });
    }
});

// Get Single Pay App with Lines
constructionRouter.get("/pay-apps/:id", async (req, res) => {
    try {
        const app = await constructionService.getPayApp(req.params.id);
        if (!app) return res.status(404).json({ error: "Pay App not found" });
        res.json(app);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch pay application details" });
    }
});

// Update Pay App Line (Progress)
constructionRouter.patch("/pay-apps/lines/:id", async (req, res) => {
    try {
        const line = await constructionService.updatePayAppLine(req.params.id, req.body);
        res.json(line);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: "Failed to update line" });
    }
});

// Recalculate Pay App
constructionRouter.post("/pay-apps/:id/calculate", async (req, res) => {
    try {
        await constructionService.calculatePayApp(req.params.id);
        const app = await constructionService.getPayApp(req.params.id);
        res.json(app);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: "Failed to recalculate pay app" });
    }
});

// -- AI & Risk Insights --

constructionRouter.get("/projects/:projectId/risk", async (req, res) => {
    try {
        const insights = await riskService.getProjectRiskOverview(req.params.projectId);
        res.json(insights);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch risk analysis" });
    }
});
