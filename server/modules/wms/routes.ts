// @ts-nocheck
import { Express } from "express";

export function registerWMSRoutes(app: Express) {

    const getInvOrgId = (req: any): string =>
        (req.headers["x-inventory-org-id"] as string) || (req.query.warehouseId as string) || "W01";

    // ─── Directed Putaway ─────────────────────────────────────────────────────
    app.post("/api/wms/zones", async (req, res) => {
        try {
            const { directedPutawayService } = await import("./directed-putaway.service");
            const tenantId = (req as any).user?.tenantId || "default-tenant";
            const invOrgId = getInvOrgId(req);
            res.status(201).json(await directedPutawayService.createZone({ ...req.body, tenantId, entInventoryOrgId: invOrgId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/wms/zones", async (req, res) => {
        try {
            const { directedPutawayService } = await import("./directed-putaway.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            const invOrgId = getInvOrgId(req);
            res.json(await directedPutawayService.listZones(tenantId, invOrgId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/wms/bins", async (req, res) => {
        try {
            const { directedPutawayService } = await import("./directed-putaway.service");
            const tenantId = (req as any).user?.tenantId || "default-tenant";
            const invOrgId = getInvOrgId(req);
            res.status(201).json(await directedPutawayService.createBin({ ...req.body, tenantId, entInventoryOrgId: invOrgId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/wms/bins", async (req, res) => {
        try {
            const { directedPutawayService } = await import("./directed-putaway.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            const invOrgId = getInvOrgId(req);
            res.json(await directedPutawayService.listBins(tenantId, invOrgId, req.query.zoneId as string, req.query.availableOnly === 'true'));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/wms/putaway-rules", async (req, res) => {
        try {
            const { directedPutawayService } = await import("./directed-putaway.service");
            const tenantId = (req as any).user?.tenantId || "default-tenant";
            const invOrgId = getInvOrgId(req);
            res.status(201).json(await directedPutawayService.createRule({ ...req.body, tenantId, entInventoryOrgId: invOrgId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/wms/putaway-rules", async (req, res) => {
        try {
            const { directedPutawayService } = await import("./directed-putaway.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            const invOrgId = getInvOrgId(req);
            res.json(await directedPutawayService.listRules(tenantId, invOrgId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/wms/putaway-tasks", async (req, res) => {
        try {
            const { directedPutawayService } = await import("./directed-putaway.service");
            const tenantId = (req as any).user?.tenantId || "default-tenant";
            const invOrgId = getInvOrgId(req);
            res.status(201).json(await directedPutawayService.createPutawayTask({ ...req.body, tenantId, entInventoryOrgId: invOrgId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/wms/putaway-tasks", async (req, res) => {
        try {
            const { directedPutawayService } = await import("./directed-putaway.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            const invOrgId = getInvOrgId(req);
            res.json(await directedPutawayService.getPendingTasks(tenantId, invOrgId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/wms/putaway-tasks/:id/complete", async (req, res) => {
        try {
            const { directedPutawayService } = await import("./directed-putaway.service");
            res.json(await directedPutawayService.completePutaway(req.params.id, req.body.operatorId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/wms/utilization", async (req, res) => {
        try {
            const { directedPutawayService } = await import("./directed-putaway.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            const invOrgId = getInvOrgId(req);
            res.json(await directedPutawayService.getUtilizationReport(tenantId, invOrgId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── Yard Management ──────────────────────────────────────────────────────
    app.post("/api/wms/yard/docks", async (req, res) => {
        try {
            const { yardManagementService } = await import("./yard-management.service");
            const tenantId = (req as any).user?.tenantId || "default-tenant";
            const invOrgId = getInvOrgId(req);
            res.status(201).json(await yardManagementService.createDock({ ...req.body, tenantId, entInventoryOrgId: invOrgId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/wms/yard/docks", async (req, res) => {
        try {
            const { yardManagementService } = await import("./yard-management.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            const invOrgId = getInvOrgId(req);
            res.json(await yardManagementService.listDocks(tenantId, invOrgId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/wms/yard/docks/status", async (req, res) => {
        try {
            const { yardManagementService } = await import("./yard-management.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            const invOrgId = getInvOrgId(req);
            res.json(await yardManagementService.getDockStatus(tenantId, invOrgId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/wms/yard/appointments", async (req, res) => {
        try {
            const { yardManagementService } = await import("./yard-management.service");
            const tenantId = (req as any).user?.tenantId || "default-tenant";
            const invOrgId = getInvOrgId(req);
            res.status(201).json(await yardManagementService.scheduleAppointment({ ...req.body, tenantId, entInventoryOrgId: invOrgId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/wms/yard/appointments", async (req, res) => {
        try {
            const { yardManagementService } = await import("./yard-management.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            const invOrgId = getInvOrgId(req);
            res.json(await yardManagementService.listAppointments(tenantId, invOrgId, req.query.date as string, req.query.status as string));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/wms/yard/appointments/:id/checkin", async (req, res) => {
        try {
            const { yardManagementService } = await import("./yard-management.service");
            res.json(await yardManagementService.checkIn(req.params.id, req.body.trailerNumber));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/wms/yard/appointments/:id/activity", async (req, res) => {
        try {
            const { yardManagementService } = await import("./yard-management.service");
            res.json(await yardManagementService.startActivity(req.params.id, req.body.activity));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/wms/yard/appointments/:id/depart", async (req, res) => {
        try {
            const { yardManagementService } = await import("./yard-management.service");
            res.json(await yardManagementService.depart(req.params.id));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/wms/yard/appointments/:id/noshow", async (req, res) => {
        try {
            const { yardManagementService } = await import("./yard-management.service");
            res.json(await yardManagementService.markNoShow(req.params.id));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/wms/yard/utilization", async (req, res) => {
        try {
            const { yardManagementService } = await import("./yard-management.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            const invOrgId = getInvOrgId(req);
            res.json(await yardManagementService.getUtilizationReport(tenantId, invOrgId, req.query.from as string, req.query.to as string));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── Carrier Manifest + ZPL ───────────────────────────────────────────────
    app.post("/api/wms/manifests", async (req, res) => {
        try {
            const { carrierManifestService } = await import("./carrier-manifest.service");
            const tenantId = (req as any).user?.tenantId || "default-tenant";
            const invOrgId = getInvOrgId(req);
            res.status(201).json(await carrierManifestService.createManifest({ ...req.body, tenantId, entInventoryOrgId: invOrgId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/wms/manifests", async (req, res) => {
        try {
            const { carrierManifestService } = await import("./carrier-manifest.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            const invOrgId = getInvOrgId(req);
            res.json(await carrierManifestService.listManifests(tenantId, req.query.status as string, invOrgId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/wms/manifests/summary", async (req, res) => {
        try {
            const { carrierManifestService } = await import("./carrier-manifest.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string);
            const invOrgId = getInvOrgId(req);
            res.json(await carrierManifestService.getManifestSummary(tenantId, invOrgId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/wms/manifests/:id/packages", async (req, res) => {
        try {
            const { carrierManifestService } = await import("./carrier-manifest.service");
            res.status(201).json(await carrierManifestService.addPackage({ ...req.body, manifestId: req.params.id }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/wms/manifests/:id/packages", async (req, res) => {
        try {
            const { carrierManifestService } = await import("./carrier-manifest.service");
            res.json(await carrierManifestService.getManifestPackages(req.params.id));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/wms/manifests/:id/close", async (req, res) => {
        try {
            const { carrierManifestService } = await import("./carrier-manifest.service");
            res.json(await carrierManifestService.closeManifest(req.params.id));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/wms/manifests/:id/tender", async (req, res) => {
        try {
            const { carrierManifestService } = await import("./carrier-manifest.service");
            res.json(await carrierManifestService.tenderManifest(req.params.id));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/wms/packages/:id/print", async (req, res) => {
        try {
            const { carrierManifestService } = await import("./carrier-manifest.service");
            res.json(await carrierManifestService.printLabel(req.params.id));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
}
