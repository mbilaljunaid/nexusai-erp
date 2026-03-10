// @ts-nocheck
import { Express } from "express";

export function registerLogisticsRoutes(app: Express) {

    // ─── Load Tender (EDI 204/990) ────────────────────────────────────────────
    app.post("/api/logistics/tenders", async (req, res) => {
        try {
            const { loadTenderService } = await import("./load-tender.service");
            const tenantId = (req as any).user?.tenantId || "default-tenant";
            res.status(201).json(await loadTenderService.createTender({ ...req.body, tenantId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/logistics/tenders", async (req, res) => {
        try {
            const { loadTenderService } = await import("./load-tender.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            res.json(await loadTenderService.listTenders(tenantId, req.query.status as string));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/logistics/tenders/:id", async (req, res) => {
        try {
            const { loadTenderService } = await import("./load-tender.service");
            res.json(await loadTenderService.getTenderWithStops(req.params.id));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/logistics/tenders/:id/send", async (req, res) => {
        try {
            const { loadTenderService } = await import("./load-tender.service");
            res.json(await loadTenderService.sendTender(req.params.id));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/logistics/tenders/:id/edi990", async (req, res) => {
        try {
            const { loadTenderService } = await import("./load-tender.service");
            res.json(await loadTenderService.processEDI990({ tenderId: req.params.id, ...req.body }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/logistics/tenders/:id/cancel", async (req, res) => {
        try {
            const { loadTenderService } = await import("./load-tender.service");
            res.json(await loadTenderService.cancelTender(req.params.id));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/logistics/tenders/summary", async (req, res) => {
        try {
            const { loadTenderService } = await import("./load-tender.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            res.json(await loadTenderService.getSummary(tenantId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── Carrier Tracking (EDI 214) ───────────────────────────────────────────
    app.post("/api/logistics/shipments", async (req, res) => {
        try {
            const { carrierTrackingService } = await import("./carrier-tracking.service");
            const tenantId = (req as any).user?.tenantId || "default-tenant";
            res.status(201).json(await carrierTrackingService.createShipment({ ...req.body, tenantId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/logistics/shipments/edi214", async (req, res) => {
        try {
            const { carrierTrackingService } = await import("./carrier-tracking.service");
            const tenantId = (req as any).user?.tenantId || "default-tenant";
            res.json(await carrierTrackingService.processEDI214({ ...req.body, tenantId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/logistics/shipments", async (req, res) => {
        try {
            const { carrierTrackingService } = await import("./carrier-tracking.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            res.json(await carrierTrackingService.listShipments(tenantId, req.query.status as string, req.query.carrierId as string));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/logistics/shipments/:id", async (req, res) => {
        try {
            const { carrierTrackingService } = await import("./carrier-tracking.service");
            res.json(await carrierTrackingService.getShipmentStatus(req.params.id));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/logistics/shipments/exceptions", async (req, res) => {
        try {
            const { carrierTrackingService } = await import("./carrier-tracking.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            res.json(await carrierTrackingService.getExceptions(tenantId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/logistics/shipments/performance", async (req, res) => {
        try {
            const { carrierTrackingService } = await import("./carrier-tracking.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            res.json(await carrierTrackingService.getDeliveryPerformance(tenantId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/logistics/shipments/summary", async (req, res) => {
        try {
            const { carrierTrackingService } = await import("./carrier-tracking.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            res.json(await carrierTrackingService.getSummary(tenantId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── Mode Optimizer ───────────────────────────────────────────────────────
    app.post("/api/logistics/mode-optimizer/optimize", async (req, res) => {
        try {
            const { modeOptimizerService } = await import("./mode-optimizer.service");
            const tenantId = (req as any).user?.tenantId || "default-tenant";
            const runBy = (req as any).user?.id || "system";
            res.json(await modeOptimizerService.optimizeMode({ ...req.body, tenantId, runBy }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/logistics/mode-optimizer/runs", async (req, res) => {
        try {
            const { modeOptimizerService } = await import("./mode-optimizer.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            res.json(await modeOptimizerService.listRuns(tenantId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/logistics/mode-optimizer/modes", async (req, res) => {
        try {
            const { modeOptimizerService } = await import("./mode-optimizer.service");
            res.json(await modeOptimizerService.getDefaultModes());
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
}
