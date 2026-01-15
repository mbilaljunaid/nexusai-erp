
import { Router } from "express";
import { maintenanceService } from "../../services/MaintenanceService";
import { maintenanceCostingService } from "../../services/MaintenanceCostingService";
import { maintenancePlanningService } from "../../services/MaintenancePlanningService";
import { maintenanceQualityService } from "../../services/MaintenanceQualityService";
import { maintenanceAccountingService } from "../../services/MaintenanceAccountingService";
import { maintenanceMeterService } from "../../services/MaintenanceMeterService";
import { maintenanceLibraryService } from "../../services/MaintenanceLibraryService";
import { failureAnalysisService } from "../../services/FailureAnalysisService";
import { maintenanceSCMService } from "../../services/MaintenanceSCMService";
import { assetHealthService } from "../../services/AssetHealthService";









const router = Router();

// Work Orders
router.get("/work-orders", async (req, res) => {
    try {
        const { limit, offset, status, assignedToId } = req.query;
        const wos = await maintenanceService.listWorkOrders(
            Number(limit) || undefined,
            Number(offset) || undefined,
            {
                status: status as string,
                assignedToId: assignedToId === 'null' ? null : (assignedToId as string)
            }
        );
        res.json(wos);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/supervisors/technicians", async (req, res) => {
    try {
        const techs = await maintenanceService.listTechnicians();
        res.json(techs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});


router.post("/work-orders", async (req, res) => {
    try {
        const wo = await maintenanceService.createWorkOrder(req.body);
        res.json(wo);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.patch("/work-orders/:id/status", async (req, res) => {
    try {
        const wo = await maintenanceService.updateWorkOrderStatus(req.params.id, req.body.status);
        res.json(wo);
    } catch (error: any) {
        res.status(400).json({ error: error.message }); // 400 for validation error
    }
});

router.get("/work-orders/:id", async (req, res) => {
    try {
        const wo = await maintenanceService.getWorkOrder(req.params.id);
        if (!wo) return res.status(404).json({ error: "Work Order not found" });
        res.json(wo);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/work-orders/:id/operations", async (req, res) => {
    try {
        const op = await maintenanceService.addOperation(req.params.id, req.body);
        res.json(op);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.patch("/operations/:id", async (req, res) => {
    try {
        const op = await maintenanceService.updateOperation(req.params.id, req.body);
        res.json(op);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Assets (Operational)
router.get("/assets", async (req, res) => {
    try {
        const assets = await maintenanceService.listOperationalAssets();
        res.json(assets);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/assets/:id/extension", async (req, res) => {
    try {
        const ext = await maintenanceService.upsertAssetExtension({ ...req.body, assetId: req.params.id });
        res.json(ext);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// PM Definitions
router.get("/pm-definitions", async (req, res) => {
    try {
        const pms = await maintenanceService.listPMDefinitions();
        res.json(pms);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/pm-definitions", async (req, res) => {
    try {
        const pm = await maintenanceService.createPMDefinition(req.body);
        res.json(pm);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/pm-generate", async (req, res) => {
    try {
        const count = await maintenanceService.generatePMWorkOrders();
        res.json({ generated: count.length, workOrders: count });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Service Requests
router.get("/service-requests", async (req, res) => {
    try {
        const srs = await maintenanceService.listServiceRequests();
        res.json(srs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/service-requests", async (req, res) => {
    try {
        const sr = await maintenanceService.createServiceRequest(req.body);
        res.json(sr);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/service-requests/:id/convert", async (req, res) => {
    try {
        const wo = await maintenanceService.convertSRtoWO(req.params.id, req.body);
        res.json(wo);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Materials
router.post("/work-orders/:id/materials", async (req, res) => {
    try {
        const mat = await maintenanceService.addMaterialToWorkOrder(req.params.id, req.body);
        res.json(mat);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/materials/:id/issue", async (req, res) => {
    try {
        const mat = await maintenanceService.issueMaterial(req.params.id);
        res.json(mat);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});



// Resources
router.post("/work-orders/:id/resources", async (req, res) => {
    try {
        const resAss = await maintenanceService.assignTechnician(req.params.id, req.body);
        res.json(resAss);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/resources/:id/log-hours", async (req, res) => {
    try {
        // body: { hours: 2.5 }
        const resLog = await maintenanceService.logLaborHours(req.params.id, req.body.hours);
        res.json(resLog);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Stub for fetching technicians (users)
// In real app, filtered by role 'TECHNICIAN'
router.get("/technicians-stub", async (req, res) => {
    // Return mock users for now as we might not have users with 'TECHNICIAN' role in seed
    res.json([
        { id: "user-1", username: "john.doe", fullName: "John Doe" },
        { id: "user-2", username: "sarah.connor", fullName: "Sarah Connor" },
        { id: "user-3", username: "mike.ross", fullName: "Mike Ross" }
    ]);
});

router.get("/work-orders/:id/costs", async (req, res) => {
    try {
        const costs = await maintenanceCostingService.getWorkOrderCosts(req.params.id);
        res.json(costs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/work-orders/:id/costs/post", async (req, res) => {
    try {
        const result = await maintenanceAccountingService.postWorkOrderCosts(req.params.id, "system"); // TODO: Use req.user.id
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});


// --- Planning ---

router.get("/planning/schedule", async (req, res) => {
    try {
        const start = new Date(req.query.start as string || new Date().toISOString());
        const end = new Date(req.query.end as string || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
        const schedule = await maintenancePlanningService.getSchedule(start, end);
        res.json(schedule);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/planning/forecast", async (req, res) => {
    try {
        const start = new Date(req.query.start as string || new Date().toISOString());
        const end = new Date(req.query.end as string || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
        const forecast = await maintenancePlanningService.getForecast(start, end);
        res.json(forecast);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});


router.patch("/operations/:id/schedule", async (req, res) => {
    try {
        const scheduledDate = new Date(req.body.scheduledDate);
        const op = await maintenancePlanningService.scheduleOperation(req.params.id, scheduledDate, req.body.workCenterId);
        res.json(op);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/work-centers", async (req, res) => {
    try {
        const wcs = await maintenancePlanningService.getWorkCenters();
        res.json(wcs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- Quality & Safety ---

router.get("/quality/templates", async (req, res) => {
    try {
        const tmpls = await maintenanceQualityService.listInspectionTemplates();
        res.json(tmpls);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/quality/inspections", async (req, res) => {
    try {
        const insp = await maintenanceQualityService.createInspection(req.body);
        res.json(insp);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.patch("/quality/inspections/:id", async (req, res) => {
    try {
        const { results, status } = req.body;
        const insp = await maintenanceQualityService.submitInspectionResults(req.params.id, results, status);
        res.json(insp);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/work-orders/:id/inspections", async (req, res) => {
    try {
        const insps = await maintenanceQualityService.getInspectionsForWorkOrder(req.params.id);
        res.json(insps);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Permits
router.post("/work-orders/:id/permits", async (req, res) => {
    try {
        const permit = await maintenanceQualityService.createPermit({ ...req.body, workOrderId: req.params.id });
        res.json(permit);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/work-orders/:id/permits", async (req, res) => {
    try {
        const permits = await maintenanceQualityService.getPermitsForWorkOrder(req.params.id);
        res.json(permits);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- Meters ---
router.post("/meters", async (req, res) => {
    try {
        const meter = await maintenanceMeterService.createMeter(req.body);
        res.json(meter);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/assets/:id/meters", async (req, res) => {
    try {
        const meters = await maintenanceMeterService.getMetersForAsset(req.params.id);
        res.json(meters);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/meters/:id/readings", async (req, res) => {
    try {
        const { value, source, workOrderId } = req.body;
        const reading = await maintenanceMeterService.logReading(req.params.id, value, source, workOrderId);
        res.json(reading);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/meters/:id/readings", async (req, res) => {
    try {
        const readings = await maintenanceMeterService.getReadingHistory(req.params.id);
        res.json(readings);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- Library (Work Definitions) ---
router.get("/library/definitions", async (req, res) => {
    try {
        const defs = await maintenanceLibraryService.listWorkDefinitions();
        res.json(defs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/library/definitions", async (req, res) => {
    try {
        const def = await maintenanceLibraryService.createWorkDefinition(req.body);
        res.json(def);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/library/definitions/:id/apply/:workOrderId", async (req, res) => {
    try {
        const result = await maintenanceLibraryService.applyWorkDefinition(req.params.workOrderId, req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- Failure Analysis ---
router.get("/failure-codes", async (req, res) => {
    try {
        const { type, parentId } = req.query;
        const codes = await failureAnalysisService.listFailureCodes(type as string, parentId as string);
        res.json(codes);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.patch("/work-orders/:id/failure", async (req, res) => {
    try {
        const { problemId, causeId, remedyId } = req.body;
        const wo = await maintenanceService.updateWorkOrderFailure(req.params.id, {
            failureProblemId: problemId,
            failureCauseId: causeId,
            failureRemedyId: remedyId
        });
        res.json(wo);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/materials/:id/raise-pr", async (req, res) => {
    try {
        const result = await maintenanceSCMService.raisePRForMaterial(req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/assets/:id/health", async (req, res) => {
    try {
        const health = await assetHealthService.getAssetHealth(req.params.id);
        res.json(health);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export const maintenanceRouter = router;












