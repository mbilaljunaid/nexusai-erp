// @ts-nocheck
import { Express } from "express";
import { db } from "../../db";
import { inventory, inventoryLotSerial } from "../../../shared/schema/scm";
import { eq, or, desc, and, isNotNull, ilike, sql } from "drizzle-orm";

export function registerMfgInventoryRoutes(app: Express) {
    const tid = (req: any) => req.user?.tenantId || req.query?.tenantId || "default-tenant";

    // ─── Inventory Items (Module 18) ──────────────────────────────────────────
    app.get("/api/inventory/items", async (req: any, res: any) => {
        try {
            const inventoryOrgId = req.headers['x-inventory-org-id'] as string | undefined;
            const tenantId = tid(req);

            let query = db.select().from(inventory);
            let results;

            if (inventoryOrgId) {
                results = await query.where(
                    or(
                        eq(inventory.entInventoryOrgId, inventoryOrgId),
                        eq(inventory.organizationId, inventoryOrgId)
                    )
                ).orderBy(desc(inventory.createdAt)).limit(200);
            } else {
                results = await query.orderBy(desc(inventory.createdAt)).limit(200);
            }

            res.json(results);
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

    app.post("/api/inventory/items", async (req: any, res: any) => {
        try {
            const inventoryOrgId = req.headers['x-inventory-org-id'] as string | undefined;
            const { itemNumber, description, primaryUomCode, quantityOnHand, minQuantity, maxQuantity } = req.body;

            const [newItem] = await db.insert(inventory).values({
                itemNumber,
                description,
                primaryUomCode,
                quantityOnHand: quantityOnHand || 0,
                minQuantity: minQuantity || 0,
                maxQuantity: maxQuantity || 0,
                organizationId: inventoryOrgId || null,
                entInventoryOrgId: inventoryOrgId || null,
                tenantId: tid(req)
            }).returning();

            res.status(201).json(newItem);
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

    app.delete("/api/inventory/items/:id", async (req: any, res: any) => {
        try {
            await db.delete(inventory).where(eq(inventory.id, req.params.id));
            res.json({ success: true });
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

    // ─── ECO ─────────────────────────────────────────────────────────────────
    app.post("/api/mfg/eco", async (req, res) => { try { const { ecoService: s } = await import("./eco-and-ops.service"); res.status(201).json(await s.createECO({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.post("/api/mfg/eco/:id/action", async (req, res) => { try { const { ecoService: s } = await import("./eco-and-ops.service"); res.json(await s.advance(req.params.id, req.body.action, req.body.actor, req.body.comments)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.get("/api/mfg/eco", async (req, res) => { try { const { ecoService: s } = await import("./eco-and-ops.service"); res.json(await s.list(tid(req), req.query.status as string, req.query.priority as string)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.get("/api/mfg/eco/summary", async (req, res) => { try { const { ecoService: s } = await import("./eco-and-ops.service"); res.json(await s.getSummary(tid(req))); } catch (e: any) { res.status(500).json({ error: e.message }); } });

    // ─── Outside Processing ───────────────────────────────────────────────────
    app.post("/api/mfg/outside-processing", async (req, res) => { try { const { outsideProcessingService: s } = await import("./eco-and-ops.service"); res.status(201).json(await s.createOp({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.post("/api/mfg/outside-processing/:id/receive", async (req, res) => { try { const { outsideProcessingService: s } = await import("./eco-and-ops.service"); res.json(await s.receiveBack(req.params.id, req.body.qtyReceived, req.body.actualCost, req.body.qualityResult, req.body.notes)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.get("/api/mfg/outside-processing", async (req, res) => { try { const { outsideProcessingService: s } = await import("./eco-and-ops.service"); res.json(await s.list(tid(req), req.query.workOrderId as string, req.query.status as string)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.get("/api/mfg/outside-processing/variance", async (req, res) => { try { const { outsideProcessingService: s } = await import("./eco-and-ops.service"); res.json(await s.getVarianceReport(tid(req))); } catch (e: any) { res.status(500).json({ error: e.message }); } });

    // ─── Capacity Planning ────────────────────────────────────────────────────
    app.post("/api/mfg/capacity", async (req, res) => { try { const { capacityPlanningService: s } = await import("./eco-and-ops.service"); res.json(await s.upsertCapacity({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.get("/api/mfg/capacity/utilization", async (req, res) => { try { const { capacityPlanningService: s } = await import("./eco-and-ops.service"); res.json(await s.getUtilization(tid(req), req.query.from as string, req.query.to as string, req.query.workCenter as string)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.get("/api/mfg/capacity/bottlenecks", async (req, res) => { try { const { capacityPlanningService: s } = await import("./eco-and-ops.service"); res.json(await s.getBottlenecks(tid(req), req.query.from as string, req.query.to as string)); } catch (e: any) { res.status(500).json({ error: e.message }); } });

    // ─── WIP Costing ─────────────────────────────────────────────────────────
    app.post("/api/mfg/wip/transactions", async (req, res) => { try { const { wipCostingService: s } = await import("./eco-and-ops.service"); res.status(201).json(await s.postTransaction({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.post("/api/mfg/wip/transactions/:id/reverse", async (req, res) => { try { const { wipCostingService: s } = await import("./eco-and-ops.service"); res.json(await s.reverseTransaction(req.params.id, tid(req))); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.get("/api/mfg/wip/work-orders/:id/cost", async (req, res) => { try { const { wipCostingService: s } = await import("./eco-and-ops.service"); res.json(await s.getWorkOrderCost(tid(req), req.params.id)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.get("/api/mfg/wip/summary", async (req, res) => { try { const { wipCostingService: s } = await import("./eco-and-ops.service"); res.json(await s.getWIPSummary(tid(req))); } catch (e: any) { res.status(500).json({ error: e.message }); } });

    // ─── Lot Genealogy ────────────────────────────────────────────────────────
    app.post("/api/mfg/lots", async (req, res) => { try { const { lotGenealogyService: s } = await import("./inventory-ops.service"); res.status(201).json(await s.createLot({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.post("/api/mfg/lots/:lot/trace-event", async (req, res) => { try { const { lotGenealogyService: s } = await import("./inventory-ops.service"); res.json(await s.addTraceEvent(req.params.lot, tid(req), req.body)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.post("/api/mfg/lots/:lot/status", async (req, res) => { try { const { lotGenealogyService: s } = await import("./inventory-ops.service"); res.json(await s.updateStatus(req.params.lot, tid(req), req.body.status)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.get("/api/mfg/lots", async (req, res) => { try { const { lotGenealogyService: s } = await import("./inventory-ops.service"); res.json(await s.list(tid(req), req.query.item as string, req.query.status as string, req.query.type as string)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.get("/api/mfg/lots/:lot", async (req, res) => { try { const { lotGenealogyService: s } = await import("./inventory-ops.service"); res.json(await s.getLot(req.params.lot, tid(req))); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.get("/api/mfg/lots/:lot/trace-up", async (req, res) => { try { const { lotGenealogyService: s } = await import("./inventory-ops.service"); res.json(await s.traceUp(req.params.lot, tid(req))); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.get("/api/mfg/lots/:lot/trace-down", async (req, res) => { try { const { lotGenealogyService: s } = await import("./inventory-ops.service"); res.json(await s.traceDown(req.params.lot, tid(req))); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.get("/api/mfg/lots/expiring", async (req, res) => { try { const { lotGenealogyService: s } = await import("./inventory-ops.service"); res.json(await s.getExpiringLots(tid(req), Number(req.query.days ?? 30))); } catch (e: any) { res.status(500).json({ error: e.message }); } });

    // ─── Quality Hold ─────────────────────────────────────────────────────────
    app.post("/api/mfg/quality-holds", async (req, res) => { try { const { qualityHoldService: s } = await import("./inventory-ops.service"); res.status(201).json(await s.initiateHold({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.post("/api/mfg/quality-holds/:id/review", async (req, res) => { try { const { qualityHoldService: s } = await import("./inventory-ops.service"); res.json(await s.review(req.params.id, req.body.reviewedBy, req.body.rootCause)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.post("/api/mfg/quality-holds/:id/dispose", async (req, res) => { try { const { qualityHoldService: s } = await import("./inventory-ops.service"); res.json(await s.dispose(req.params.id, req.body.approvedBy, req.body.disposition, req.body.notes)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.get("/api/mfg/quality-holds", async (req, res) => { try { const { qualityHoldService: s } = await import("./inventory-ops.service"); res.json(await s.list(tid(req), req.query.status as string, req.query.severity as string)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.get("/api/mfg/quality-holds/summary", async (req, res) => { try { const { qualityHoldService: s } = await import("./inventory-ops.service"); res.json(await s.getSummary(tid(req))); } catch (e: any) { res.status(500).json({ error: e.message }); } });

    // ─── Physical Inventory ───────────────────────────────────────────────────
    app.post("/api/mfg/physical-inventory/cycles", async (req, res) => { try { const { physicalInventoryService: s } = await import("./inventory-ops.service"); res.status(201).json(await s.createCycle({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.post("/api/mfg/physical-inventory/cycles/:id/lines", async (req, res) => { try { const { physicalInventoryService: s } = await import("./inventory-ops.service"); res.json(await s.addLines(req.params.id, tid(req), req.body.lines)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.post("/api/mfg/physical-inventory/lines/:id/count", async (req, res) => { try { const { physicalInventoryService: s } = await import("./inventory-ops.service"); res.json(await s.recordCount(req.params.id, req.body.countQuantity, req.body.countedBy)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.post("/api/mfg/physical-inventory/cycles/:id/approve", async (req, res) => { try { const { physicalInventoryService: s } = await import("./inventory-ops.service"); res.json(await s.approveCycle(req.params.id, req.body.approvedBy)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.get("/api/mfg/physical-inventory/cycles", async (req, res) => { try { const { physicalInventoryService: s } = await import("./inventory-ops.service"); res.json(await s.listCycles(tid(req), req.query.status as string)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.get("/api/mfg/physical-inventory/cycles/:id/variance", async (req, res) => { try { const { physicalInventoryService: s } = await import("./inventory-ops.service"); res.json(await s.getVarianceSummary(req.params.id)); } catch (e: any) { res.status(500).json({ error: e.message }); } });

    // ─── Consignment ──────────────────────────────────────────────────────────
    app.post("/api/mfg/consignment", async (req, res) => { try { const { consignmentService: s } = await import("./inventory-ops.service"); res.status(201).json(await s.upsertRecord({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.post("/api/mfg/consignment/:id/consume", async (req, res) => { try { const { consignmentService: s } = await import("./inventory-ops.service"); res.json(await s.recordConsumption(req.params.id, req.body.qtyConsumed)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.post("/api/mfg/consignment/:id/replenish", async (req, res) => { try { const { consignmentService: s } = await import("./inventory-ops.service"); res.json(await s.replenish(req.params.id, req.body.qtyAdded)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.get("/api/mfg/consignment", async (req, res) => { try { const { consignmentService: s } = await import("./inventory-ops.service"); res.json(await s.list(tid(req), req.query.type as string, req.query.status as string)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.get("/api/mfg/consignment/alerts", async (req, res) => { try { const { consignmentService: s } = await import("./inventory-ops.service"); res.json(await s.getReplenishmentAlerts(tid(req))); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    app.get("/api/mfg/consignment/summary", async (req, res) => { try { const { consignmentService: s } = await import("./inventory-ops.service"); res.json(await s.getConsumptionSummary(tid(req))); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    // ─── Lots & Serials (Module 18) ──────────────────────────────────────────
    app.get("/api/inventory/lots", async (req: any, res: any) => {
        try {
            const inventoryOrgId = req.headers['x-inventory-org-id'] as string | undefined;
            const search = req.query.search as string;
            const limit = parseInt(req.query.limit as string) || 100;
            const offset = parseInt(req.query.offset as string) || 0;

            let conditions = [isNotNull(inventoryLotSerial.lotNumber)];

            if (inventoryOrgId) {
                // To do this properly with Drizzle requires a join, but for simplicity of the refactoring 
                // we will stick to raw query using db.execute to avoid pulling in full schema relations right now
                // However, we MUST use the drizzle connection, not require('pg')
            }

            const query = `
                SELECT l.*, i."itemNumber", i.description 
                FROM inventory_lot_serial l
                JOIN inv_items i ON l.inventory_id = i.id
                WHERE l.lot_number IS NOT NULL
                ${inventoryOrgId ? `AND (i.ent_inventory_org_id = $1 OR i."organizationId" = $1)` : ''}
                ${search ? `AND (l.lot_number ILIKE $${inventoryOrgId ? 2 : 1} OR i."itemNumber" ILIKE $${inventoryOrgId ? 2 : 1})` : ''}
                ORDER BY l.created_at DESC LIMIT $${search ? (inventoryOrgId ? 3 : 2) : (inventoryOrgId ? 2 : 1)} OFFSET $${search ? (inventoryOrgId ? 4 : 3) : (inventoryOrgId ? 3 : 2)}
            `;

            const params = [];
            if (inventoryOrgId) params.push(inventoryOrgId);
            if (search) params.push(`%${search}%`);
            params.push(limit, offset);

            const r = await db.execute(sql.raw(query), params); // Need to import sql from drizzle-orm

            res.json({
                data: r.rows.map(row => ({
                    id: row.id,
                    inventoryId: row.inventory_id,
                    lotNumber: row.lot_number,
                    quantity: row.quantity,
                    status: row.status,
                    expirationDate: row.expiration_date,
                    item: {
                        id: row.inventory_id,
                        itemNumber: row.itemNumber,
                        description: row.description
                    }
                })),
                total: r.rowCount
            });
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

    app.post("/api/inventory/lots", async (req: any, res: any) => {
        try {
            const { inventoryId, lotNumber, quantity, status, expirationDate } = req.body;

            const [newLot] = await db.insert(inventoryLotSerial).values({
                inventoryId,
                lotNumber,
                quantity: quantity || 0,
                status: status || 'Active',
                expirationDate: expirationDate ? new Date(expirationDate) : null
            }).returning();

            res.status(201).json(newLot);
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

    app.get("/api/inventory/serials", async (req: any, res: any) => {
        try {
            const inventoryOrgId = req.headers['x-inventory-org-id'] as string | undefined;
            const search = req.query.search as string;
            const limit = parseInt(req.query.limit as string) || 100;
            const offset = parseInt(req.query.offset as string) || 0;

            let conditions = [isNotNull(inventoryLotSerial.serialNumber)];

            const query = `
                SELECT s.*, i."itemNumber", i.description 
                FROM inventory_lot_serial s
                JOIN inv_items i ON s.inventory_id = i.id
                WHERE s.serial_number IS NOT NULL
                ${inventoryOrgId ? `AND (i.ent_inventory_org_id = $1 OR i."organizationId" = $1)` : ''}
                ${search ? `AND (s.serial_number ILIKE $${inventoryOrgId ? 2 : 1} OR i."itemNumber" ILIKE $${inventoryOrgId ? 2 : 1})` : ''}
                ORDER BY s.created_at DESC LIMIT $${search ? (inventoryOrgId ? 3 : 2) : (inventoryOrgId ? 2 : 1)} OFFSET $${search ? (inventoryOrgId ? 4 : 3) : (inventoryOrgId ? 3 : 2)}
            `;

            const params = [];
            if (inventoryOrgId) params.push(inventoryOrgId);
            if (search) params.push(`%${search}%`);
            params.push(limit, offset);

            const r = await db.execute(sql.raw(query), params); // Need to import sql from drizzle-orm

            res.json({
                data: r.rows.map(row => ({
                    id: row.id,
                    inventoryId: row.inventory_id,
                    serialNumber: row.serial_number,
                    quantity: row.quantity,
                    status: row.status,
                    currentLocatorId: row.current_locator_id,
                    item: {
                        id: row.inventory_id,
                        itemNumber: row.itemNumber,
                        description: row.description
                    }
                })),
                total: r.rowCount
            });
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

    app.post("/api/inventory/serials", async (req: any, res: any) => {
        try {
            const { inventoryId, serialNumber, status, currentLocatorId } = req.body;

            const [newSerial] = await db.insert(inventoryLotSerial).values({
                inventoryId,
                serialNumber,
                quantity: 1,
                status: status || 'Active',
                currentLocatorId: currentLocatorId || null
            }).returning();

            res.status(201).json(newSerial);
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

}
