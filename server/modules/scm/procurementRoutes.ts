// @ts-nocheck
import { Router } from "express";
import { db } from "../../db";
import { purchaseOrders, purchaseOrderLines, suppliers } from "../../../shared/schema/scm";
import { eq, desc, and, sql } from "drizzle-orm";
import { procurementService } from "./ProcurementService";
import { Pool } from "pg";

export const procurementRouter = Router();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Get all Purchase Orders with Supplier Name — filtered by BU
procurementRouter.get("/purchase-orders", async (req: any, res: any) => {
    try {
        const buId = req.headers["x-business-unit-id"] as string | undefined;
        let query = `
            SELECT po.id, po.order_number AS "poNumber", po.supplier_id AS "supplierId",
                   po.status, po.total_amount AS "totalAmount", po.due_date AS "dueDate",
                   po.compliance_status AS "complianceStatus", po.compliance_reason AS "complianceReason",
                   po.created_at AS "createdAt", po.ent_business_unit_id AS "entBusinessUnitId",
                   s.name AS "supplierName"
            FROM purchase_orders po
            LEFT JOIN scm_suppliers s ON po.supplier_id = s.id`;
        const params: any[] = [];
        if (buId) {
            query += ` WHERE po.ent_business_unit_id = $1`;
            params.push(buId);
        }
        query += ` ORDER BY po.created_at DESC`;
        const r = await pool.query(query, params);
        res.json(r.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create Purchase Order — stamp BU
procurementRouter.post("/purchase-orders", async (req: any, res: any) => {
    try {
        const buId = req.headers["x-business-unit-id"] as string | undefined;
        const po = await procurementService.createPurchaseOrder({ ...req.body, entBusinessUnitId: buId || null });
        // Stamp BU column separately if service doesn't handle it
        if (buId && po?.id) {
            await pool.query(`UPDATE purchase_orders SET ent_business_unit_id = $1 WHERE id = $2`, [buId, po.id]);
        }
        res.json(po);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get Purchase Order Lines by PO ID
procurementRouter.get("/purchase-orders/:id/lines", async (req: any, res: any) => {
    try {
        const lines = await db.select()
            .from(purchaseOrderLines)
            .where(eq(purchaseOrderLines.poHeaderId, req.params.id))
            .orderBy(purchaseOrderLines.lineNumber);
        res.json(lines);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get SCM Suppliers for Picker — filtered by BU
procurementRouter.get("/suppliers", async (req: any, res: any) => {
    try {
        const buId = req.headers["x-business-unit-id"] as string | undefined;
        let query = `SELECT *, ent_business_unit_id AS "entBusinessUnitId" FROM scm_suppliers`;
        const params: any[] = [];
        if (buId) {
            query += ` WHERE ent_business_unit_id = $1`;
            params.push(buId);
        }
        query += ` ORDER BY name`;
        const r = await pool.query(query, params);
        res.json(r.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- Supplier Negotiation Mock Endpoints (MVP) ---
procurementRouter.post("/negotiations/:id/open-round", async (req: any, res: any) => {
    try {
        res.json({ success: true, message: "Next bid round opened" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

procurementRouter.post("/negotiations/:id/close", async (req: any, res: any) => {
    try {
        res.json({ success: true, message: "Bids sealed and closed" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

procurementRouter.post("/negotiations/:id/award", async (req: any, res: any) => {
    try {
        const { supplier } = req.body;
        // In a real flow, this generates a Purchase Order or CPA
        res.json({ success: true, message: `Awarded to ${supplier}`, supplier });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
