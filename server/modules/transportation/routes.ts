import { Router } from "express";
import { db } from "../../db";
import {
    tlCarriers, tlShipments, tlLanes, tlRateAgreements, tlMilestones, tlFreightCharges,
    insertTlCarrierSchema, insertTlShipmentSchema, insertTlLaneSchema, insertTlRateAgreementSchema,
    insertTlMilestoneSchema, insertTlFreightChargeSchema
} from "../../../shared/schema/transportation";
import { eq, desc, asc } from "drizzle-orm";
import { tlOptimizationService } from "../../services/TLOptimizationService";
import { carrierRatingService } from "../../services/CarrierRatingService";
import { freightSettlementService } from "../../services/FreightSettlementService";
import { freightAccountingService } from "../../services/FreightAccountingService";

export const transportationRouter = Router();

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
// --- Shipments ---
transportationRouter.get("/shipments", async (req, res) => {
    // 1. Fetch Shipments
    const shipments = await db.select().from(tlShipments).orderBy(desc(tlShipments.createdAt));

    // 2. Fetch Locations
    const locationIds = new Set<string>();
    shipments.forEach(s => {
        if (s.sourceLocationId) locationIds.add(s.sourceLocationId);
        if (s.destinationLocationId) locationIds.add(s.destinationLocationId);
    });

    const { tlLocations } = await import("../../../shared/schema/transportation");
    let locations: any[] = [];
    if (locationIds.size > 0) {
        const { inArray } = await import("drizzle-orm");
        locations = await db.select().from(tlLocations).where(inArray(tlLocations.id, Array.from(locationIds)));
    }

    const locMap = new Map(locations.map(l => [l.id, l]));

    // 3. Merge Data
    const data = shipments.map(s => {
        const source = s.sourceLocationId ? locMap.get(s.sourceLocationId) : null;
        const dest = s.destinationLocationId ? locMap.get(s.destinationLocationId) : null;

        return {
            ...s,
            sourceLat: source?.latitude || null,
            sourceLng: source?.longitude || null,
            sourceCity: source?.city || null,
            sourceCode: source?.code || null,
            destLat: dest?.latitude || null,
            destLng: dest?.longitude || null,
            destCity: dest?.city || null,
            destCode: dest?.code || null
        };
    });

    res.json(data);
});

transportationRouter.post("/shipments/plan", async (req, res) => {
    const { orderId, sourceModule } = req.body;
    const shipment = await tlOptimizationService.planShipment(orderId, sourceModule);
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
    const data = await db.select().from(tlFreightCharges).orderBy(desc(tlFreightCharges.createdAt));
    res.json(data);
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
    // In a real app, this might accept filters or a list of IDs
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
    const data = await db.select().from(tlLanes);
    res.json(data);
});

transportationRouter.post("/lanes", async (req, res) => {
    const validated = insertTlLaneSchema.parse(req.body);
    const [result] = await db.insert(tlLanes).values(validated).returning();
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
