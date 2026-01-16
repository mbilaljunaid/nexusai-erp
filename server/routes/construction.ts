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

// Bulk Import SOV Lines
constructionRouter.post("/contracts/:id/bulk-import", async (req, res) => {
    try {
        const result = await constructionService.bulkImportLines(req.params.id, req.body.lines);
        res.json(result);
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

// -- Certification Workflow (L11) --

constructionRouter.post("/pay-apps/:id/submit", async (req, res) => {
    try {
        const app = await constructionService.submitPayApp(req.params.id);
        res.json(app);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

constructionRouter.post("/pay-apps/:id/approve-architect", async (req, res) => {
    try {
        const app = await constructionService.approveByArchitect(req.params.id, req.body.user || "Architect-User");
        res.json(app);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

constructionRouter.post("/pay-apps/:id/approve-engineer", async (req, res) => {
    try {
        const app = await constructionService.approveByEngineer(req.params.id, req.body.user || "Engineer-User");
        res.json(app);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

constructionRouter.post("/pay-apps/:id/certify", async (req, res) => {
    try {
        const app = await constructionService.certifyPayApp(req.params.id, req.body.user || "GC-User");
        res.json(app);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// -- Setup & Config --

constructionRouter.get("/setup", async (req, res) => {
    try {
        const setup = await constructionService.getSetup();
        res.json(setup);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// -- Phase 6: Field Operations --

// Daily Logs
constructionRouter.post("/projects/:projectId/daily-logs", async (req, res) => {
    try {
        const log = await constructionService.createDailyLog({
            ...req.body,
            projectId: req.params.projectId,
            logDate: new Date(req.body.logDate)
        });
        res.status(201).json(log);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

constructionRouter.get("/projects/:projectId/daily-logs", async (req, res) => {
    try {
        const logs = await constructionService.getDailyLogs(req.params.projectId);
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// RFIs
constructionRouter.post("/projects/:projectId/rfis", async (req, res) => {
    try {
        const rfi = await constructionService.createRFI({
            ...req.body,
            projectId: req.params.projectId
        });
        res.status(201).json(rfi);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

constructionRouter.get("/projects/:projectId/rfis", async (req, res) => {
    try {
        const rfis = await constructionService.getRFIs(req.params.projectId);
        res.json(rfis);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Submittals
constructionRouter.post("/projects/:projectId/submittals", async (req, res) => {
    try {
        const sub = await constructionService.createSubmittal({
            ...req.body,
            projectId: req.params.projectId
        });
        res.status(201).json(sub);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

constructionRouter.get("/projects/:projectId/submittals", async (req, res) => {
    try {
        const subs = await constructionService.getSubmittals(req.params.projectId);
        res.json(subs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Compliance
constructionRouter.post("/contracts/:id/compliance", async (req, res) => {
    try {
        const resu = await constructionService.createComplianceRecord({
            ...req.body,
            contractId: req.params.id
        });
        res.status(201).json(resu);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

constructionRouter.get("/contracts/:id/compliance", async (req, res) => {
    try {
        const records = await constructionService.getComplianceRecords(req.params.id);
        res.json(records);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

constructionRouter.post("/setup", async (req, res) => {
    try {
        const { configKey, configValue, category, description } = req.body;
        const entry = await constructionService.updateSetup(configKey, configValue, category, description);
        res.json(entry);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
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
