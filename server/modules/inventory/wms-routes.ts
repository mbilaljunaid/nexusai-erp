
import { Router } from "express";
import { wmsTaskService } from "./wms-task.service";
import { wmsWaveService } from "./wms-wave.service";
import { wmsPackingService } from "./wms-packing.service";
import { wmsShippingService } from "./wms-shipping.service";
import { wmsSlottingService } from "./wms-slotting.service";
import { wmsMasterDataService } from "./wms-master-data.service";
import { wmsYardService } from "./wms-yard.service";
import { wmsStrategyService } from "./wms-strategy.service";
import { wmsLaborService } from "./wms-labor.service";
import { wmsUnitTypeService } from "./wms-unit-type.service";

export const wmsRoutes = Router();

// --- MASTER DATA (ZONES) ---

wmsRoutes.get("/zones", async (req, res) => {
    try {
        const warehouseId = req.query.warehouseId as string;
        if (!warehouseId) return res.status(400).json({ error: "Warehouse ID required" });
        const zones = await wmsMasterDataService.listZones(warehouseId);
        res.json(zones);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

wmsRoutes.post("/zones", async (req, res) => {
    try {
        const zone = await wmsMasterDataService.createZone(req.body);
        res.json(zone);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

wmsRoutes.put("/zones/:id", async (req, res) => {
    try {
        const zone = await wmsMasterDataService.updateZone(req.params.id, req.body);
        res.json(zone);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

wmsRoutes.delete("/zones/:id", async (req, res) => {
    try {
        await wmsMasterDataService.deleteZone(req.params.id);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- YARD / DOCKS ---

wmsRoutes.get("/dock-appointments", async (req, res) => {
    try {
        const warehouseId = req.query.warehouseId as string;
        const dateStr = req.query.date as string;
        if (!warehouseId || !dateStr) return res.status(400).json({ error: "Warehouse ID & Date required" });

        const appts = await wmsYardService.listAppointments(warehouseId, new Date(dateStr));
        res.json(appts);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

wmsRoutes.post("/dock-appointments", async (req, res) => {
    try {
        const appt = await wmsYardService.createAppointment(req.body);
        res.json(appt);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});



// --- STRATEGIES ---

wmsRoutes.get("/strategies", async (req, res) => {
    try {
        const warehouseId = req.query.warehouseId as string;
        if (!warehouseId) return res.status(400).json({ error: "Warehouse ID required" });
        const strats = await wmsStrategyService.listStrategies(warehouseId);
        res.json(strats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

wmsRoutes.post("/strategies", async (req, res) => {
    try {
        const strat = await wmsStrategyService.createStrategy(req.body);
        res.json(strat);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});



// --- LABOR ---

wmsRoutes.get("/labor/metrics", async (req, res) => {
    try {
        const warehouseId = req.query.warehouseId as string;
        if (!warehouseId) return res.status(400).json({ error: "Warehouse ID required" });
        const metrics = await wmsLaborService.getProductivityMetrics(warehouseId);
        res.json(metrics);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- UNIT TYPES ---

wmsRoutes.get("/unit-types", async (req, res) => {
    try {
        const warehouseId = req.query.warehouseId as string;
        if (!warehouseId) return res.status(400).json({ error: "Warehouse ID required" });
        const result = await wmsUnitTypeService.list(warehouseId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

wmsRoutes.post("/unit-types", async (req, res) => {
    try {
        const result = await wmsUnitTypeService.create(req.body);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

wmsRoutes.delete("/unit-types/:id", async (req, res) => {
    try {
        await wmsUnitTypeService.delete(req.params.id);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Template Management
wmsRoutes.get("/wave-templates", async (req, res) => {
    try {
        const warehouseId = req.query.warehouseId as string;
        if (!warehouseId) return res.status(400).json({ error: "Warehouse ID required" });
        const results = await wmsWaveService.listTemplates(warehouseId);
        res.json(results);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

wmsRoutes.post("/wave-templates", async (req, res) => {
    try {
        const result = await wmsWaveService.createTemplate(req.body);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- WAVES ---

// List Waves
wmsRoutes.get("/waves", async (req, res) => {
    try {
        const warehouseId = req.query.warehouseId as string;
        if (!warehouseId) return res.status(400).json({ error: "Warehouse ID required" });
        const waves = await wmsWaveService.listWaves(warehouseId);
        res.json(waves);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create Wave (Plan)
wmsRoutes.post("/waves", async (req, res) => {
    try {
        const { warehouseId, carrier, limit } = req.body;
        const result = await wmsWaveService.createWave({ warehouseId, carrier, limit });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Release Wave
wmsRoutes.post("/waves/:id/release", async (req, res) => {
    try {
        const wave = await wmsWaveService.releaseWave(req.params.id);
        res.json(wave);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- TASKS ---

// List Tasks
wmsRoutes.get("/tasks", async (req, res) => {
    try {
        const filters = {
            warehouseId: req.query.warehouseId as string,
            taskType: req.query.taskType as string,
            status: req.query.status as string,
            page: req.query.page ? Number(req.query.page) : 1,
            limit: req.query.limit ? Number(req.query.limit) : 50
        };
        const result = await wmsTaskService.listTasks(filters);
        res.json(result);
        // NOTE: Frontend 'WmsTaskWorkbench' and 'verify_outbound_flow' might expect array directly.
        // This break verification if they do strictly `Array.isArray(res)`.
        // I must update them OR wrap response differently?
        // Standard pattern: { data: [], pagination: {} }
        // BUT for parity with existing simple calls, I might break existing clients.
        // Let's check 'verify_outbound_flow.ts' usage of listTasks.
        // "const tasks = await wmsTaskService.listTasks(...)"
        // If it expects array, this breaks.
        // I will update 'verify_outbound_flow.ts' (deleted) and 'verify_wms_pagination.ts'.
        // Wait, I deleted verify_outbound_flow.
        // 'verify_wms_e2e.ts' uses it!
        // "const tasks = await wmsTaskService.listTasks..." -> "const res = ...; const tasks = res.data;"
        // I should fix verify_wms_e2e.ts BEFORE running next verification.
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create Task (Manual or System)
wmsRoutes.post("/tasks", async (req, res) => {
    try {
        const task = await wmsTaskService.createTask(req.body);
        res.json(task);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Complete Task
wmsRoutes.post("/tasks/:id/complete", async (req, res) => {
    try {
        const { actualQuantity, toLocatorId } = req.body;
        // Assuming user context is available in req.user (mocking for now)
        const userId = "current-user-id";
        const task = await wmsTaskService.completeTask(req.params.id, userId, actualQuantity, toLocatorId);
        res.json(task);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- PACKING ---

wmsRoutes.post("/packing/pack", async (req, res) => {
    try {
        const { warehouseId, lpnNumber, itemId, quantity } = req.body;
        const result = await wmsPackingService.packItem(warehouseId, lpnNumber, itemId, quantity);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

wmsRoutes.post("/packing/lpn/:id/close", async (req, res) => {
    try {
        const result = await wmsPackingService.closeLpn(req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

wmsRoutes.get("/packing/lpn/:lpnNumber", async (req, res) => {
    try {
        const result = await wmsPackingService.getLpnDetails(req.params.lpnNumber);
        if (!result) return res.status(404).json({ error: "LPN not found" });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- SHIPPING ---

// --- SHIPPING ---

wmsRoutes.post("/shipping/confirm", async (req, res) => {
    try {
        const { orderId, carrier, tracking } = req.body;
        const result = await wmsShippingService.shipConfirm({ orderId, carrier, tracking });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- OPTIMIZATION ---

wmsRoutes.get("/optimization/slotting", async (req, res) => {
    try {
        const warehouseId = req.query.warehouseId as string;
        if (!warehouseId) return res.status(400).json({ error: "Warehouse ID required" });

        const suggestions = await wmsSlottingService.generateMoveSuggestions(warehouseId);
        res.json(suggestions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
