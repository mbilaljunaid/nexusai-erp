// @ts-nocheck
import { Express } from "express";

export function registerMfgInventoryRoutes(app: Express) {
    const tid = (req: any) => req.user?.tenantId || req.query?.tenantId || "default-tenant";

    // ─── Inventory Items (Module 18) ──────────────────────────────────────────
    app.get("/api/inventory/items", async (req: any, res: any) => {
        try {
            const inventoryOrgId = req.headers['x-inventory-org-id'] as string | undefined;
            const { Pool } = require('pg');
            const pool = new Pool({ connectionString: process.env.DATABASE_URL });
            let query = `SELECT * FROM inv_items`;
            const params: any[] = [];
            if (inventoryOrgId) {
                query += ` WHERE ent_inventory_org_id = $1 OR "organizationId" = $1`;
                params.push(inventoryOrgId);
            }
            query += ` ORDER BY "createdAt" DESC LIMIT 200`;
            const r = await pool.query(query, params);
            await pool.end();
            res.json(r.rows);
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

    app.post("/api/inventory/items", async (req: any, res: any) => {
        try {
            const inventoryOrgId = req.headers['x-inventory-org-id'] as string | undefined;
            const { itemNumber, description, primaryUomCode, quantityOnHand, minQuantity, maxQuantity } = req.body;
            const { Pool } = require('pg');
            const pool = new Pool({ connectionString: process.env.DATABASE_URL });
            const r = await pool.query(
                `INSERT INTO inv_items("itemNumber", description, "primaryUomCode", "quantityOnHand", min_quantity, max_quantity, "organizationId", ent_inventory_org_id)
                 VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [itemNumber, description, primaryUomCode, quantityOnHand || 0, minQuantity || 0, maxQuantity || 0, inventoryOrgId || null, inventoryOrgId || null]
            );
            await pool.end();
            res.status(201).json(r.rows[0]);
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

    app.delete("/api/inventory/items/:id", async (req: any, res: any) => {
        try {
            const { Pool } = require('pg');
            const pool = new Pool({ connectionString: process.env.DATABASE_URL });
            await pool.query(`DELETE FROM inv_items WHERE id = $1`, [req.params.id]);
            await pool.end();
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

            const { Pool } = require('pg');
            const pool = new Pool({ connectionString: process.env.DATABASE_URL });
            let query = `
                SELECT l.*, i."itemNumber", i.description 
                FROM inventory_lot_serial l
                JOIN inv_items i ON l.inventory_id = i.id
                WHERE l.lot_number IS NOT NULL
            `;
            const params: any[] = [];

            if (inventoryOrgId) {
                params.push(inventoryOrgId);
                query += ` AND (i.ent_inventory_org_id = $${params.length} OR i."organizationId" = $${params.length})`;
            }

            if (search) {
                params.push(`%${search}%`);
                query += ` AND (l.lot_number ILIKE $${params.length} OR i."itemNumber" ILIKE $${params.length})`;
            }

            query += ` ORDER BY l.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
            params.push(limit, offset);

            const r = await pool.query(query, params);
            await pool.end();

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
                total: r.rowCount // Simple total for now
            });
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

    app.post("/api/inventory/lots", async (req: any, res: any) => {
        try {
            const { inventoryId, lotNumber, quantity, status, expirationDate } = req.body;
            const { Pool } = require('pg');
            const pool = new Pool({ connectionString: process.env.DATABASE_URL });

            const r = await pool.query(
                `INSERT INTO inventory_lot_serial(inventory_id, lot_number, quantity, status, expiration_date)
                 VALUES($1, $2, $3, $4, $5) RETURNING *`,
                [inventoryId, lotNumber, quantity || 0, status || 'Active', expirationDate || null]
            );
            await pool.end();
            res.status(201).json(r.rows[0]);
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

            const { Pool } = require('pg');
            const pool = new Pool({ connectionString: process.env.DATABASE_URL });
            let query = `
                SELECT s.*, i."itemNumber", i.description 
                FROM inventory_lot_serial s
                JOIN inv_items i ON s.inventory_id = i.id
                WHERE s.serial_number IS NOT NULL
            `;
            const params: any[] = [];

            if (inventoryOrgId) {
                params.push(inventoryOrgId);
                query += ` AND (i.ent_inventory_org_id = $${params.length} OR i."organizationId" = $${params.length})`;
            }

            if (search) {
                params.push(`%${search}%`);
                query += ` AND (s.serial_number ILIKE $${params.length} OR i."itemNumber" ILIKE $${params.length})`;
            }

            query += ` ORDER BY s.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
            params.push(limit, offset);

            const r = await pool.query(query, params);
            await pool.end();

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
                total: r.rowCount // Simple total for now
            });
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

    app.post("/api/inventory/serials", async (req: any, res: any) => {
        try {
            const { inventoryId, serialNumber, status, currentLocatorId } = req.body;
            const { Pool } = require('pg');
            const pool = new Pool({ connectionString: process.env.DATABASE_URL });

            // Re-using quantity 1 for serials, and storing currentLocator in a suitable way 
            // the schema didn't have currentLocatorId natively on the table but UI expects it
            // We'll insert it as quantity 1.
            const r = await pool.query(
                `INSERT INTO inventory_lot_serial(inventory_id, serial_number, quantity, status)
                 VALUES($1, $2, 1, $3) RETURNING *`,
                [inventoryId, serialNumber, status || 'Active']
            );
            await pool.end();
            res.status(201).json(r.rows[0]);
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

}
