// @ts-nocheck
import { Router } from "express";
import { db } from "../../db";
import {
    tlCarriers, tlShipments, tlLanes, tlRateAgreements, tlMilestones, tlFreightCharges,
    insertTlCarrierSchema, insertTlShipmentSchema, insertTlLaneSchema, insertTlRateAgreementSchema,
    insertTlMilestoneSchema, insertTlFreightChargeSchema
} from "../../../shared/schema/transportation";
import { eq, desc, asc, and, sql } from "drizzle-orm";
import { tlOptimizationService } from "../../services/TLOptimizationService";
import { carrierRatingService } from "../../services/CarrierRatingService";
import { freightSettlementService } from "../../services/FreightSettlementService";
import { freightAccountingService } from "../../services/FreightAccountingService";
import { Pool } from "pg";

export const transportationRouter = Router();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const getBuId = (req: any) => req.headers["x-business-unit-id"] as string | undefined;
const getInvOrgId = (req: any) => req.headers["x-inventory-org-id"] as string | undefined;

// --- Carriers ---
transportationRouter.get("/carriers", async (req, res) => {
    const data = await carrierRatingService.listCarriers();
    res.json(data);
});

transportationRouter.post("/carriers", async (req, res) => {
    const validated = insertTlCarrierSchema.parse(req.body);
    const result = await carrierRatingService.createCarrier(validated);
    res.json(result);
});

transportationRouter.get("/carriers/:id/scorecard", async (req, res) => {
    const scorecard = await carrierRatingService.getCarrierScorecard(req.params.id);
    res.json(scorecard);
});

// --- Shipments ---
transportationRouter.get("/shipments", async (req, res) => {
    try {
        const buId = getBuId(req);
        const invOrgId = getInvOrgId(req);

        // Build scoped query with raw SQL (new columns not in Drizzle schema)
        let whereClause = "1=1";
        const params: any[] = [];
        if (buId) {
            params.push(buId);
            whereClause += ` AND s.ent_business_unit_id = $${params.length}`;
        }
        if (invOrgId) {
            params.push(invOrgId);
            whereClause += ` AND s.ent_inventory_org_id = $${params.length}`;
        }

        const result = await pool.query(`
            SELECT s.*,
                   sl.latitude AS "sourceLat", sl.longitude AS "sourceLng", sl.city AS "sourceCity", sl.code AS "sourceCode",
                   dl.latitude AS "destLat", dl.longitude AS "destLng", dl.city AS "destCity", dl.code AS "destCode"
            FROM tl_shipments s
            LEFT JOIN tl_locations sl ON s.source_location_id = sl.id
            LEFT JOIN tl_locations dl ON s.destination_location_id = dl.id
            WHERE ${whereClause}
            ORDER BY s.created_at DESC
        `, params);

        res.json(result.rows);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

transportationRouter.post("/shipments/plan", async (req, res) => {
    const { orderId, sourceModule } = req.body;
    const shipment = await tlOptimizationService.planShipment(orderId, sourceModule);
    // Stamp scoping columns after creation
    const buId = getBuId(req);
    const invOrgId = getInvOrgId(req);
    if (shipment?.id && (buId || invOrgId)) {
        await pool.query(
            `UPDATE tl_shipments SET ent_business_unit_id = $1, ent_inventory_org_id = $2 WHERE id = $3`,
            [buId || null, invOrgId || null, shipment.id]
        );
    }
    res.json(shipment);
});

transportationRouter.post("/shipments/:id/optimize", async (req, res) => {
    const result = await tlOptimizationService.optimizeRoute(req.params.id);
    res.json(result);
});

transportationRouter.get("/shipments/:id", async (req, res) => {
    const [shipment] = await db.select().from(tlShipments).where(eq(tlShipments.id, req.params.id)).limit(1);
    if (!shipment) return res.status(404).json({ error: "Shipment not found" });

    const milestones = await db.select().from(tlMilestones)
        .where(eq(tlMilestones.shipmentId, req.params.id))
        .orderBy(asc(tlMilestones.plannedDate));

    res.json({ ...shipment, milestones });
});

transportationRouter.post("/shipments/:id/milestones", async (req, res) => {
    const validated = insertTlMilestoneSchema.parse({ ...req.body, shipmentId: req.params.id });
    const [result] = await db.insert(tlMilestones).values(validated).returning();
    res.json(result);
});

// --- Freight settlement ---
transportationRouter.get("/charges", async (req, res) => {
    try {
        const buId = getBuId(req);
        let query = `SELECT * FROM tl_freight_charges`;
        const params: any[] = [];
        if (buId) {
            query += ` WHERE ent_business_unit_id = $1`;
            params.push(buId);
        }
        query += ` ORDER BY created_at DESC`;
        const r = await pool.query(query, params);
        res.json(r.rows);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

transportationRouter.post("/charges/:id/reconcile", async (req, res) => {
    const { invoiceAmount } = req.body;
    const result = await freightSettlementService.reconcileCharge(req.params.id, invoiceAmount);
    res.json(result);
});

transportationRouter.post("/charges/:id/interface", async (req, res) => {
    await freightSettlementService.interfaceToAP(req.params.id);
    res.json({ success: true });
});

transportationRouter.get("/settlement/accruals", async (req, res) => {
    const total = await freightSettlementService.getAccruedLiability();
    res.json({ total });
});

transportationRouter.post("/charges/batch-post", async (req, res) => {
    const result = await freightAccountingService.postBatch();
    res.json(result);
});

transportationRouter.post("/charges/:id/post", async (req, res) => {
    const journal = await freightAccountingService.generateAccrualJournal(req.params.id);
    res.json(journal);
});

transportationRouter.get("/shipments/:id/risk", async (req, res) => {
    const risk = await tlOptimizationService.predictDelayRisk(req.params.id);
    res.json(risk);
});

// --- Lanes & Rates ---
transportationRouter.get("/lanes", async (req, res) => {
    try {
        const buId = getBuId(req);
        let query = `SELECT * FROM tl_lanes`;
        const params: any[] = [];
        if (buId) {
            query += ` WHERE ent_business_unit_id = $1`;
            params.push(buId);
        }
        const r = await pool.query(query, params);
        res.json(r.rows);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

transportationRouter.post("/lanes", async (req, res) => {
    const validated = insertTlLaneSchema.parse(req.body);
    const [result] = await db.insert(tlLanes).values(validated).returning();
    // Stamp BU
    const buId = getBuId(req);
    if (buId && result?.id) {
        await pool.query(`UPDATE tl_lanes SET ent_business_unit_id = $1 WHERE id = $2`, [buId, result.id]);
    }
    res.json(result);
});

transportationRouter.get("/rates", async (req, res) => {
    const data = await db.select().from(tlRateAgreements);
    res.json(data);
});

transportationRouter.post("/rates", async (req, res) => {
    const validated = insertTlRateAgreementSchema.parse(req.body);
    const [result] = await db.insert(tlRateAgreements).values(validated).returning();
    res.json(result);
});

export default transportationRouter;
