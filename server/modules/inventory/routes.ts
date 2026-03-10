import { Router } from "express";
import { wmsController } from "./wms.controller";

export const wmsRouter = Router();

// --- MASTER DATA (ZONES) ---
wmsRouter.get("/zones", wmsController.getZones);
wmsRouter.post("/zones", wmsController.createZone);
wmsRouter.put("/zones/:id", wmsController.updateZone);
wmsRouter.delete("/zones/:id", wmsController.deleteZone);

// --- YARD / DOCKS ---
wmsRouter.get("/dock-appointments", wmsController.getDockAppointments);
wmsRouter.post("/dock-appointments", wmsController.createDockAppointment);

// --- STRATEGIES ---
wmsRouter.get("/strategies", wmsController.getStrategies);
wmsRouter.post("/strategies", wmsController.createStrategy);

// --- LABOR ---
wmsRouter.get("/labor/metrics", wmsController.getLaborMetrics);

// --- UNIT TYPES ---
wmsRouter.get("/unit-types", wmsController.getUnitTypes);
wmsRouter.post("/unit-types", wmsController.createUnitType);
wmsRouter.delete("/unit-types/:id", wmsController.deleteUnitType);

// --- WAVES & TEMPLATES ---
wmsRouter.get("/wave-templates", wmsController.getWaveTemplates);
wmsRouter.post("/wave-templates", wmsController.createWaveTemplate);

wmsRouter.get("/waves", wmsController.getWaves);
wmsRouter.post("/waves", wmsController.createWave);
wmsRouter.post("/waves/:id/release", wmsController.releaseWave);

// --- TASKS ---
wmsRouter.get("/tasks", wmsController.getTasks);
wmsRouter.post("/tasks", wmsController.createTask);
wmsRouter.post("/tasks/:id/complete", wmsController.completeTask);

// --- PACKING ---
wmsRouter.post("/packing/pack", wmsController.packItem);
wmsRouter.post("/packing/lpn/:id/close", wmsController.closeLpn);
wmsRouter.get("/packing/lpn/:lpnNumber", wmsController.getLpnDetails);

// --- SHIPPING ---
wmsRouter.post("/shipping/confirm", wmsController.shipConfirm);
wmsRouter.post("/shipping/:id/rate-shop", wmsController.rateShop);
wmsRouter.post("/shipping/:id/generate-bol", wmsController.generateBol);

// --- OPTIMIZATION ---
wmsRouter.get("/optimization/slotting", wmsController.getSlottingSuggestions);
// --- ITEM MASTER (MULTI-ORG) ---
wmsRouter.put("/item-master", wmsController.updateItemMaster);

// --- UOM CONVERSIONS ---
wmsRouter.post("/uom-conversions", wmsController.createUomConversion);
