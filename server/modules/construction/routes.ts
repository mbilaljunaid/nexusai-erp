
import { Router } from "express";
import { constructionController } from "./construction.controller";

export const constructionRouter = Router();

// -- Contracts --
constructionRouter.post("/contracts", constructionController.createContract);
constructionRouter.get("/projects/:projectId/contracts", constructionController.getContractsByProject);
constructionRouter.get("/contracts/:id", constructionController.getContract);
constructionRouter.get("/contracts/:id/lines", constructionController.getContractLines);

// -- Lines (SOV) --
constructionRouter.post("/contracts/:id/lines", constructionController.addContractLine);
constructionRouter.post("/contracts/:id/bulk-import", constructionController.bulkImportLines);

// -- Variations --
constructionRouter.post("/variations", constructionController.createVariation);
constructionRouter.post("/variations/:id/approve", constructionController.approveVariation);

// -- Pay Apps (Progress Billing) --
constructionRouter.post("/contracts/:id/pay-apps", constructionController.createPayApp);
constructionRouter.get("/contracts/:id/pay-apps", constructionController.getPayApps);
constructionRouter.get("/pay-apps/:id", constructionController.getPayApp);
constructionRouter.get("/pay-apps/:id/lines", constructionController.getPayAppLines);
constructionRouter.patch("/pay-apps/lines/:id", constructionController.updatePayAppLine);
constructionRouter.post("/pay-apps/:id/calculate", constructionController.calculatePayApp);

// -- Certification Workflow --
constructionRouter.post("/pay-apps/:id/submit", constructionController.submitPayApp);
constructionRouter.post("/pay-apps/:id/approve-architect", constructionController.approveByArchitect);
constructionRouter.post("/pay-apps/:id/approve-engineer", constructionController.approveByEngineer);
constructionRouter.post("/pay-apps/:id/certify", constructionController.certifyPayApp);

// -- Setup & Config --
constructionRouter.get("/setup", constructionController.getSetup);
constructionRouter.post("/setup", constructionController.updateSetup);

// -- Phase 6: Field Operations --

// Daily Logs
constructionRouter.post("/projects/:projectId/daily-logs", constructionController.createDailyLog);
constructionRouter.get("/projects/:projectId/daily-logs", constructionController.getDailyLogs);

constructionRouter.get("/daily-logs/:id/labor", constructionController.getLaborLines);
constructionRouter.get("/daily-logs/:id/equipment", constructionController.getEquipmentLines);
constructionRouter.post("/daily-logs/:id/equipment", constructionController.addEquipmentLines);
constructionRouter.post("/daily-logs/:id/sync-costs", constructionController.syncCosts);

// RFIs
constructionRouter.post("/projects/:projectId/rfis", constructionController.createRFI);
constructionRouter.get("/projects/:projectId/rfis", constructionController.getRFIs);

// Submittals
constructionRouter.post("/projects/:projectId/submittals", constructionController.createSubmittal);
constructionRouter.get("/projects/:projectId/submittals", constructionController.getSubmittals);

// -- Cost Codes --
constructionRouter.get("/cost-codes", constructionController.getCostCodes);
constructionRouter.post("/cost-codes", constructionController.createCostCode);
constructionRouter.put("/cost-codes/:id", constructionController.updateCostCode);

// -- Compliance --
constructionRouter.post("/contracts/:id/compliance", constructionController.createComplianceRecord);
constructionRouter.get("/contracts/:id/compliance", constructionController.getComplianceRecords);

// -- AI & Risk Insights --
constructionRouter.get("/projects/:projectId/risk", constructionController.getProjectRisk);
constructionRouter.post("/contracts/:id/variations/simulate", constructionController.simulateVariation);

// -- Claims & Disputes --
constructionRouter.get("/contracts/:id/claims", constructionController.getClaims);
constructionRouter.post("/contracts/:id/claims", constructionController.createClaim);
constructionRouter.patch("/claims/:id/settle", constructionController.settleClaim);

// -- Resources & Equipment --
constructionRouter.get("/resources", constructionController.getResources);
constructionRouter.post("/resources", constructionController.createResource);
constructionRouter.get("/projects/:projectId/resource-allocations", constructionController.getResourceAllocations);
constructionRouter.post("/resource-allocations", constructionController.allocateResource);
constructionRouter.get("/resources/:id/telemetry", constructionController.getResourceTelemetry);
