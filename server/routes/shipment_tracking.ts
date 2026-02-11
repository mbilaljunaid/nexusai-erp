import express from "express";
import { ShipmentTrackingService } from "../services/ShipmentTrackingService";

const router = express.Router();

// ========== TRACKING STATUS ==========

// GET /api/shipment-tracking/:shipmentId - Get tracking details
router.get("/shipment-tracking/:shipmentId", async (req, res) => {
    try {
        const tracking = await ShipmentTrackingService.getTracking(req.params.shipmentId);
        res.json(tracking);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/shipment-tracking/:shipmentId/update - Update location
router.post("/shipment-tracking/:shipmentId/update", async (req, res) => {
    try {
        const { latitude, longitude, currentLocationId } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ error: "Latitude and longitude required" });
        }

        const updated = await ShipmentTrackingService.updateLocation(req.params.shipmentId, {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            currentLocationId
        });

        res.json(updated);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ========== MILESTONES ==========

// GET /api/shipment-tracking/:shipmentId/milestones - Get milestone history
router.get("/shipment-tracking/:shipmentId/milestones", async (req, res) => {
    try {
        const milestones = await ShipmentTrackingService.getMilestones(req.params.shipmentId);
        res.json(milestones);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/shipment-tracking/:shipmentId/milestones - Create milestone
router.post("/shipment-tracking/:shipmentId/milestones", async (req, res) => {
    try {
        const milestone = await ShipmentTrackingService.createMilestone(req.params.shipmentId, req.body);
        res.status(201).json(milestone);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ========== ALERTS ==========

// GET /api/shipment-tracking/alerts - Get alerts
router.get("/shipment-tracking/alerts", async (req, res) => {
    try {
        const { severity, resolved, limitDays } = req.query;

        const alerts = await ShipmentTrackingService.getAlerts({
            severity: severity as string,
            resolved: resolved === "true",
            limitDays: limitDays ? parseInt(limitDays as string) : undefined
        });

        res.json(alerts);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/shipment-tracking/alerts/:alertId/acknowledge - Acknowledge alert
router.post("/shipment-tracking/alerts/:alertId/acknowledge", async (req, res) => {
    try {
        const acknowledgedBy = (req as any).user?.userId || "user";
        const updated = await ShipmentTrackingService.acknowledgeAlert(req.params.alertId, acknowledgedBy);
        res.json(updated);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/shipment-tracking/alerts/:alertId/resolve - Resolve alert
router.post("/shipment-tracking/alerts/:alertId/resolve", async (req, res) => {
    try {
        const updated = await ShipmentTrackingService.resolveAlert(req.params.alertId);
        res.json(updated);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ========== ACTIVE SHIPMENTS & ETA ==========

// GET /api/shipment-tracking/active - Get active shipments
router.get("/shipment-tracking/active", async (req, res) => {
    try {
        const activeShipments = await ShipmentTrackingService.getActiveShipments();
        res.json(activeShipments);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/shipment-tracking/:shipmentId/eta - Calculate ETA
router.get("/shipment-tracking/:shipmentId/eta", async (req, res) => {
    try {
        const eta = await ShipmentTrackingService.calculateETA(req.params.shipmentId);
        res.json(eta);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
