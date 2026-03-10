
import { Request, Response } from "express";
import { ConstructionService } from "../../services/ConstructionService";
import { ConstructionRiskService } from "../../services/ConstructionRiskService";
import { ConstructionCostService } from "../../services/ConstructionCostService";

export class ConstructionController {
    private constructionService: ConstructionService;
    private riskService: ConstructionRiskService;
    private costService: ConstructionCostService;

    constructor() {
        this.constructionService = new ConstructionService();
        this.riskService = new ConstructionRiskService();
        this.costService = new ConstructionCostService();
    }

    // -- Contracts --

    createContract = async (req: Request, res: Response) => {
        try {
            const buId = req.headers['x-business-unit-id'] as string | undefined;
            const contract = await this.constructionService.createContract({
                ...req.body,
                ...(buId ? { entBusinessUnitId: buId } : {})
            });
            res.json(contract);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    getContractsByProject = async (req: Request, res: Response) => {
        try {
            const buId = req.headers['x-business-unit-id'] as string | undefined;
            const contracts = await this.constructionService.getContracts(req.params.projectId, buId);
            res.json(contracts);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    getContract = async (req: Request, res: Response) => {
        try {
            const contract = await this.constructionService.getContract(req.params.id);
            if (!contract) return res.status(404).json({ error: "Contract not found" });
            res.json(contract);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    getContractLines = async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;
            const result = await this.constructionService.getContractLines(req.params.id, page, limit);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // -- Lines (SOV) --

    addContractLine = async (req: Request, res: Response) => {
        try {
            const line = await this.constructionService.addContractLine({
                ...req.body,
                contractId: req.params.id
            });
            res.json(line);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    bulkImportLines = async (req: Request, res: Response) => {
        try {
            const result = await this.constructionService.bulkImportLines(req.params.id, req.body.lines);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // -- Variations --

    createVariation = async (req: Request, res: Response) => {
        try {
            const variation = await this.constructionService.createVariation(req.body);
            res.json(variation);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    approveVariation = async (req: Request, res: Response) => {
        try {
            const variation = await this.constructionService.approveVariation(req.params.id);
            res.json(variation);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // -- Pay Apps (Progress Billing) --

    createPayApp = async (req: Request, res: Response) => {
        try {
            const payApp = await this.constructionService.createPayApp({
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
    }

    getPayApps = async (req: Request, res: Response) => {
        try {
            const apps = await this.constructionService.getPayApps(req.params.id);
            res.json(apps);
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ error: "Failed to fetch pay applications" });
        }
    }

    getPayApp = async (req: Request, res: Response) => {
        try {
            const app = await this.constructionService.getPayApp(req.params.id);
            if (!app) return res.status(404).json({ error: "Pay App not found" });
            res.json(app);
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ error: "Failed to fetch pay application details" });
        }
    }

    getPayAppLines = async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;
            const result = await this.constructionService.getPayAppLines(req.params.id, page, limit);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    updatePayAppLine = async (req: Request, res: Response) => {
        try {
            const line = await this.constructionService.updatePayAppLine(req.params.id, req.body);
            res.json(line);
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ error: "Failed to update line" });
        }
    }

    calculatePayApp = async (req: Request, res: Response) => {
        try {
            await this.constructionService.calculatePayApp(req.params.id);
            const app = await this.constructionService.getPayApp(req.params.id);
            res.json(app);
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ error: "Failed to recalculate pay app" });
        }
    }

    // -- Certification --

    submitPayApp = async (req: Request, res: Response) => {
        try {
            const app = await this.constructionService.submitPayApp(req.params.id);
            res.json(app);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    approveByArchitect = async (req: Request, res: Response) => {
        try {
            const app = await this.constructionService.approveByArchitect(req.params.id, req.body.user || "Architect-User");
            res.json(app);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    approveByEngineer = async (req: Request, res: Response) => {
        try {
            const app = await this.constructionService.approveByEngineer(req.params.id, req.body.user || "Engineer-User");
            res.json(app);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    certifyPayApp = async (req: Request, res: Response) => {
        try {
            const app = await this.constructionService.certifyPayApp(req.params.id, req.body.user || "GC-User");
            res.json(app);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // -- Setup --

    getSetup = async (req: Request, res: Response) => {
        try {
            const setup = await this.constructionService.getSetup();
            res.json(setup);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    updateSetup = async (req: Request, res: Response) => {
        try {
            const { configKey, configValue, category, description } = req.body;
            const entry = await this.constructionService.updateSetup(configKey, configValue, category, description);
            res.json(entry);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // -- Field Operations --

    createDailyLog = async (req: Request, res: Response) => {
        try {
            const log = await this.constructionService.createDailyLog({
                ...req.body,
                projectId: req.params.projectId,
                logDate: new Date(req.body.logDate)
            });
            res.status(201).json(log);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    getDailyLogs = async (req: Request, res: Response) => {
        try {
            const logs = await this.constructionService.getDailyLogs(req.params.projectId);
            res.json(logs);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    getLaborLines = async (req: Request, res: Response) => {
        try {
            const lines = await this.constructionService.getLaborLines(req.params.id);
            res.json(lines);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    getEquipmentLines = async (req: Request, res: Response) => {
        try {
            const lines = await this.constructionService.getEquipmentLines(req.params.id);
            res.json(lines);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    addEquipmentLines = async (req: Request, res: Response) => {
        try {
            const lines = await this.constructionService.addEquipmentLines(req.params.id, req.body.lines);
            res.status(201).json(lines);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    syncCosts = async (req: Request, res: Response) => {
        try {
            const result = await this.costService.importDailyLogCosts(req.params.id);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    createRFI = async (req: Request, res: Response) => {
        try {
            const rfi = await this.constructionService.createRFI({
                ...req.body,
                projectId: req.params.projectId
            });
            res.status(201).json(rfi);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    getRFIs = async (req: Request, res: Response) => {
        try {
            const rfis = await this.constructionService.getRFIs(req.params.projectId);
            res.json(rfis);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    createSubmittal = async (req: Request, res: Response) => {
        try {
            const sub = await this.constructionService.createSubmittal({
                ...req.body,
                projectId: req.params.projectId
            });
            res.status(201).json(sub);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    getSubmittals = async (req: Request, res: Response) => {
        try {
            const subs = await this.constructionService.getSubmittals(req.params.projectId);
            res.json(subs);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // -- Cost Codes --

    getCostCodes = async (req: Request, res: Response) => {
        try {
            const codes = await this.constructionService.getCostCodes();
            res.json(codes);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    createCostCode = async (req: Request, res: Response) => {
        try {
            const code = await this.constructionService.createCostCode(req.body);
            res.json(code);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    updateCostCode = async (req: Request, res: Response) => {
        try {
            const code = await this.constructionService.updateCostCode(req.params.id, req.body);
            res.json(code);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // -- Compliance --

    createComplianceRecord = async (req: Request, res: Response) => {
        try {
            const resu = await this.constructionService.createComplianceRecord({
                ...req.body,
                contractId: req.params.id
            });
            res.status(201).json(resu);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    getComplianceRecords = async (req: Request, res: Response) => {
        try {
            const records = await this.constructionService.getComplianceRecords(req.params.id);
            res.json(records);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // -- AI & Risk --

    getProjectRisk = async (req: Request, res: Response) => {
        try {
            const insights = await this.riskService.getProjectRiskOverview(req.params.projectId);
            res.json(insights);
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ error: "Failed to fetch risk analysis" });
        }
    }

    simulateVariation = async (req: Request, res: Response) => {
        try {
            const analysis = await this.riskService.simulateVariationImpact(req.params.id, req.body);
            res.json(analysis);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // -- Claims --

    getClaims = async (req: Request, res: Response) => {
        try {
            const claims = await this.constructionService.getClaims(req.params.id);
            res.json(claims);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    createClaim = async (req: Request, res: Response) => {
        try {
            const claim = await this.constructionService.createClaim({
                ...req.body,
                contractId: req.params.id
            });
            res.json(claim);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    settleClaim = async (req: Request, res: Response) => {
        try {
            const { amountApproved } = req.body;
            const claim = await this.constructionService.settleClaim(req.params.id, amountApproved);
            res.json(claim);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // -- Resources --

    getResources = async (req: Request, res: Response) => {
        try {
            const resources = await this.constructionService.getResources();
            res.json(resources);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    createResource = async (req: Request, res: Response) => {
        try {
            const resource = await this.constructionService.createResource(req.body);
            res.json(resource);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    getResourceAllocations = async (req: Request, res: Response) => {
        try {
            const allocations = await this.constructionService.getResourceAllocations(req.params.projectId);
            res.json(allocations);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    allocateResource = async (req: Request, res: Response) => {
        try {
            const allocation = await this.constructionService.allocateResource(req.body);
            res.json(allocation);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    getResourceTelemetry = async (req: Request, res: Response) => {
        try {
            const telemetry = await this.constructionService.getResourceUsageTelemetry(req.params.id);
            if (!telemetry) return res.status(404).json({ error: "Telemetry not available for this resource type" });
            res.json(telemetry);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export const constructionController = new ConstructionController();
