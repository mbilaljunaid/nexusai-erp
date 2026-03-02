import { Request, Response } from "express";
import { wmsMasterDataService } from "./wms-master-data.service";
import { wmsYardService } from "./wms-yard.service";
import { wmsStrategyService } from "./wms-strategy.service";
import { wmsLaborService } from "./wms-labor.service";
import { wmsUnitTypeService } from "./wms-unit-type.service";
import { wmsWaveService } from "./wms-wave.service";
import { wmsTaskService } from "./wms-task.service";
import { wmsPackingService } from "./wms-packing.service";
import { wmsShippingService } from "./wms-shipping.service";
import { wmsSlottingService } from "./wms-slotting.service";

export class WmsController {

    // --- MASTER DATA (ZONES) ---
    getZones = async (req: Request, res: Response) => {
        try {
            const warehouseId = (req.headers["x-inventory-org-id"] || req.query.warehouseId) as string;
            if (!warehouseId) return res.status(400).json({ error: "Warehouse ID required" });
            const zones = await wmsMasterDataService.listZones(warehouseId);
            res.json(zones);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    createZone = async (req: Request, res: Response) => {
        try {
            const zone = await wmsMasterDataService.createZone(req.body);
            res.json(zone);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    updateZone = async (req: Request, res: Response) => {
        try {
            const zone = await wmsMasterDataService.updateZone(req.params.id, req.body);
            res.json(zone);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    deleteZone = async (req: Request, res: Response) => {
        try {
            await wmsMasterDataService.deleteZone(req.params.id);
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // --- YARD / DOCKS ---
    getDockAppointments = async (req: Request, res: Response) => {
        try {
            const warehouseId = (req.headers["x-inventory-org-id"] || req.query.warehouseId) as string;
            const dateStr = req.query.date as string;
            if (!warehouseId || !dateStr) return res.status(400).json({ error: "Warehouse ID & Date required" });

            const appts = await wmsYardService.listAppointments(warehouseId, new Date(dateStr));
            res.json(appts);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    createDockAppointment = async (req: Request, res: Response) => {
        try {
            const appt = await wmsYardService.createAppointment(req.body);
            res.json(appt);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // --- STRATEGIES ---
    getStrategies = async (req: Request, res: Response) => {
        try {
            const warehouseId = (req.headers["x-inventory-org-id"] || req.query.warehouseId) as string;
            if (!warehouseId) return res.status(400).json({ error: "Warehouse ID required" });
            const strats = await wmsStrategyService.listStrategies(warehouseId);
            res.json(strats);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    createStrategy = async (req: Request, res: Response) => {
        try {
            const strat = await wmsStrategyService.createStrategy(req.body);
            res.json(strat);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // --- LABOR ---
    getLaborMetrics = async (req: Request, res: Response) => {
        try {
            const warehouseId = (req.headers["x-inventory-org-id"] || req.query.warehouseId) as string;
            if (!warehouseId) return res.status(400).json({ error: "Warehouse ID required" });
            const metrics = await wmsLaborService.getProductivityMetrics(warehouseId);
            res.json(metrics);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // --- UNIT TYPES ---
    getUnitTypes = async (req: Request, res: Response) => {
        try {
            const warehouseId = (req.headers["x-inventory-org-id"] || req.query.warehouseId) as string;
            if (!warehouseId) return res.status(400).json({ error: "Warehouse ID required" });
            const result = await wmsUnitTypeService.list(warehouseId);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    createUnitType = async (req: Request, res: Response) => {
        try {
            const result = await wmsUnitTypeService.create(req.body);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    deleteUnitType = async (req: Request, res: Response) => {
        try {
            await wmsUnitTypeService.delete(req.params.id);
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // --- WAVES & TEMPLATES ---
    getWaveTemplates = async (req: Request, res: Response) => {
        try {
            const warehouseId = (req.headers["x-inventory-org-id"] || req.query.warehouseId) as string;
            if (!warehouseId) return res.status(400).json({ error: "Warehouse ID required" });
            const results = await wmsWaveService.listTemplates(warehouseId);
            res.json(results);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    createWaveTemplate = async (req: Request, res: Response) => {
        try {
            const result = await wmsWaveService.createTemplate(req.body);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    getWaves = async (req: Request, res: Response) => {
        try {
            const warehouseId = (req.headers["x-inventory-org-id"] || req.query.warehouseId) as string;
            if (!warehouseId) return res.status(400).json({ error: "Warehouse ID required" });
            const waves = await wmsWaveService.listWaves(warehouseId);
            res.json(waves);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    createWave = async (req: Request, res: Response) => {
        try {
            const { warehouseId, carrier, limit } = req.body;
            const result = await wmsWaveService.createWave({ warehouseId, carrier, limit });
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    releaseWave = async (req: Request, res: Response) => {
        try {
            const wave = await wmsWaveService.releaseWave(req.params.id);
            res.json(wave);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // --- TASKS ---
    getTasks = async (req: Request, res: Response) => {
        try {
            const filters = {
                warehouseId: (req.headers["x-inventory-org-id"] || req.query.warehouseId) as string,
                taskType: req.query.taskType as string,
                status: req.query.status as string,
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 50
            };
            const result = await wmsTaskService.listTasks(filters);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    createTask = async (req: Request, res: Response) => {
        try {
            const task = await wmsTaskService.createTask(req.body);
            res.json(task);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    completeTask = async (req: Request, res: Response) => {
        try {
            const { actualQuantity, toLocatorId } = req.body;
            // Assuming user context is available in req.user (mocking for now)
            const userId = "current-user-id";
            const task = await wmsTaskService.completeTask(req.params.id, userId, actualQuantity, toLocatorId);
            res.json(task);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // --- PACKING ---
    packItem = async (req: Request, res: Response) => {
        try {
            const { warehouseId, lpnNumber, itemId, quantity } = req.body;
            const result = await wmsPackingService.packItem(warehouseId, lpnNumber, itemId, quantity);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    closeLpn = async (req: Request, res: Response) => {
        try {
            const result = await wmsPackingService.closeLpn(req.params.id);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    getLpnDetails = async (req: Request, res: Response) => {
        try {
            const result = await wmsPackingService.getLpnDetails(req.params.lpnNumber);
            if (!result) return res.status(404).json({ error: "LPN not found" });
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // --- SHIPPING ---
    shipConfirm = async (req: Request, res: Response) => {
        try {
            const { orderId, carrier, tracking } = req.body;
            const result = await wmsShippingService.shipConfirm({ orderId, carrier, tracking });
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // --- OPTIMIZATION ---
    getSlottingSuggestions = async (req: Request, res: Response) => {
        try {
            const warehouseId = (req.headers["x-inventory-org-id"] || req.query.warehouseId) as string;
            if (!warehouseId) return res.status(400).json({ error: "Warehouse ID required" });

            const suggestions = await wmsSlottingService.generateMoveSuggestions(warehouseId);
            res.json(suggestions);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export const wmsController = new WmsController();
