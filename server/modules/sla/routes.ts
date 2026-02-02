import { Router } from "express";
import { slaController } from "./sla.controller";

export const slaRouter = Router();

// Metadata Endpoints
slaRouter.get("/event-classes", slaController.getEventClasses);
slaRouter.get("/event-classes/:classId/types", slaController.getEventTypes);

// Configuration Endpoints
slaRouter.get("/event-classes/:classId/jlts", slaController.getJournalLineTypes);
slaRouter.post("/jlts", slaController.upsertJournalLineType);

// Transactional Endpoints
slaRouter.get("/accounting/:entityId", slaController.getAccounting);

// Accounting Rules (ADR)
slaRouter.get("/rules", slaController.getAccountingRules);
slaRouter.post("/rules", slaController.upsertAccountingRule);
slaRouter.delete("/rules/:id", slaController.deleteAccountingRule);

// Mapping Sets
slaRouter.get("/mapping-sets", slaController.getMappingSets);
slaRouter.post("/mapping-sets", slaController.upsertMappingSet);
slaRouter.get("/mapping-sets/:id/values", slaController.getMappingSetValues);
slaRouter.post("/mapping-sets/:id/values", slaController.upsertMappingSetValues);

// GL Transfer (Subledger -> GL)
slaRouter.post("/transfer", slaController.transferToGl);

// AI Explainability
slaRouter.post("/explain", slaController.explainAccounting);

// Phase 17: Manual Adjustments
slaRouter.post("/manual-journals", slaController.createManualJournal);

// Reporting Routes
slaRouter.post("/reports/account-analysis", slaController.getAccountAnalysis); // Using POST for filter body
slaRouter.get("/reports/reconciliation", slaController.getReconciliation);
