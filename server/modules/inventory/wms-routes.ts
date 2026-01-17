
import { Router } from "express";
import { wmsTaskService } from "./wms-task.service";
import { wmsWaveService } from "./wms-wave.service";
import { wmsPackingService } from "./wms-packing.service";
import { wmsShippingService } from "./wms-shipping.service";

export const wmsRoutes = Router();

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
        };
        const tasks = await wmsTaskService.listTasks(filters);
        res.json(tasks);
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

wmsRoutes.post("/shipping/confirm", async (req, res) => {
    try {
        const { orderId, carrier, tracking } = req.body;
        const result = await wmsShippingService.shipConfirm({ orderId, carrier, tracking });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
