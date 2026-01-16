import { Router } from "express";
import { treasuryService } from "../../services/TreasuryService";
import { cashForecastService } from "../../services/CashForecastService";
import { nettingService } from "../../services/NettingService";
import {
    insertTreasuryCounterpartySchema,
    insertTreasuryDealSchema,
    insertTreasuryFxDealSchema,
    insertTreasuryMarketRateSchema
} from "@shared/schema";
import { ZodError } from "zod";

const router = Router();

// --- Counterparties ---
router.get("/counterparties", async (req, res) => {
    try {
        const counterparties = await treasuryService.listCounterparties();
        res.json(counterparties);
    } catch (error) {
        res.status(500).json({ message: "Failed to list counterparties" });
    }
});

router.post("/counterparties", async (req, res) => {
    try {
        const data = insertTreasuryCounterpartySchema.parse(req.body);
        const counterparty = await treasuryService.createCounterparty(data);
        res.status(201).json(counterparty);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ message: "Invalid counterparty data", errors: error.errors });
        } else {
            res.status(500).json({ message: "Failed to create counterparty" });
        }
    }
});

// --- Deals ---
router.get("/deals", async (req, res) => {
    try {
        const filters = {
            type: req.query.type as string,
            status: req.query.status as string
        };
        const deals = await treasuryService.listDeals(filters);
        res.json(deals);
    } catch (error) {
        res.status(500).json({ message: "Failed to list deals" });
    }
});

router.get("/deals/:id", async (req, res) => {
    try {
        const deal = await treasuryService.getDeal(req.params.id);
        res.json(deal);
    } catch (error) {
        res.status(404).json({ message: "Deal not found" });
    }
});

router.post("/deals", async (req, res) => {
    try {
        const data = insertTreasuryDealSchema.parse(req.body);
        const deal = await treasuryService.createDeal(data);
        res.status(201).json(deal);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ message: "Invalid deal data", errors: error.errors });
        } else {
            console.error("Deal Create Error", error);
            res.status(500).json({ message: "Failed to create deal" });
        }
    }
});

router.patch("/deals/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ message: "Status is required" });
        const deal = await treasuryService.updateDealStatus(req.params.id, status);
        res.json(deal);
    } catch (error) {
        res.status(500).json({ message: "Failed to update deal status" });
    }
});

// --- FX & Risk Routes ---
router.get("/fx-deals", async (req, res) => {
    try {
        const deals = await treasuryService.listFxDeals();
        res.json(deals);
    } catch (error) {
        res.status(500).json({ message: "Failed to list FX deals" });
    }
});

router.post("/fx-deals", async (req, res) => {
    try {
        const data = insertTreasuryFxDealSchema.parse(req.body);
        const deal = await treasuryService.createFxDeal(data);
        res.status(201).json(deal);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ message: "Invalid FX deal data", errors: error.errors });
        } else if (error instanceof Error && error.message.includes("Limit Breached")) {
            res.status(403).json({ message: error.message });
        } else {
            console.error("FX Deal Create Error", error);
            res.status(500).json({ message: "Failed to create FX deal" });
        }
    }
});

router.post("/fx-deals/:id/revalue", async (req, res) => {
    try {
        const mtm = await treasuryService.calculateMarkToMarket(req.params.id);
        res.json({ markToMarket: mtm });
    } catch (error) {
        res.status(500).json({ message: "Failed to revalue deal" });
    }
});

router.post("/market-rates", async (req, res) => {
    try {
        const data = insertTreasuryMarketRateSchema.parse(req.body);
        await treasuryService.updateMarketRates([data]);
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Failed to update market rates" });
    }
});

router.get("/risk-limits", async (req, res) => {
    try {
        const limits = await treasuryService.listRiskLimits();
        res.json(limits);
    } catch (error) {
        res.status(500).json({ message: "Failed to list risk limits" });
    }
});

// --- Phase 5: Advanced Parity & Compliance ---

router.get("/risk-metrics", async (req, res) => {
    try {
        const metrics = await treasuryService.calculateRiskMetrics();
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch risk metrics" });
    }
});

router.post("/deals/:id/confirm", async (req, res) => {
    try {
        const userId = req.headers["x-user-id"] as string || "SYSTEM_BO";
        const deal = await treasuryService.confirmDeal(req.params.id, userId);
        res.json(deal);
    } catch (error) {
        if (error instanceof Error && error.message.includes("Violation")) {
            res.status(403).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Failed to confirm deal" });
        }
    }
});

router.post("/fx-deals/:id/confirm", async (req, res) => {
    try {
        const userId = req.headers["x-user-id"] as string || "SYSTEM_BO";
        const deal = await treasuryService.confirmDeal(req.params.id, userId, true);
        res.json(deal);
    } catch (error) {
        if (error instanceof Error && error.message.includes("Violation")) {
            res.status(403).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Failed to confirm FX deal" });
        }
    }
});

router.post("/deals/:id/settle", async (req, res) => {
    try {
        const deal = await treasuryService.settleDeal(req.params.id);
        res.json(deal);
    } catch (error) {
        res.status(500).json({ message: "Failed to settle deal" });
    }
});

router.post("/fx-deals/:id/settle", async (req, res) => {
    try {
        const deal = await treasuryService.settleDeal(req.params.id, true);
        res.json(deal);
    } catch (error) {
        res.status(500).json({ message: "Failed to settle FX deal" });
    }
});

router.get("/hedges", async (req, res) => {
    try {
        const dealId = req.query.dealId as string;
        const hedges = await treasuryService.listHedgeRelationships(dealId);
        res.json(hedges);
    } catch (error) {
        res.status(500).json({ message: "Failed to list hedge relationships" });
    }
});

router.post("/hedges", async (req, res) => {
    try {
        const { dealId, sourceType, sourceId, amount } = req.body;
        const hedge = await treasuryService.createHedgeRelationship(dealId, sourceType, sourceId, Number(amount));
        res.status(201).json(hedge);
    } catch (error) {
        res.status(500).json({ message: "Failed to create hedge relationship" });
    }
});

// --- Cash Forecasting & AI Routes ---

router.post("/forecast/generate", async (req, res) => {
    try {
        const result = await cashForecastService.generateForecast(90);
        res.json(result);
    } catch (error) {
        console.error("Forecast Generation Error", error);
        res.status(500).json({ message: "Failed to generate forecast" });
    }
});

router.get("/forecast", async (req, res) => {
    try {
        const data = await cashForecastService.getForecastData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch forecast data" });
    }
});

router.get("/anomalies", async (req, res) => {
    try {
        const anomalies = await cashForecastService.detectAnomalies();
        res.json(anomalies);
    } catch (error) {
        res.status(500).json({ message: "Failed to detect anomalies" });
    }
});

// --- In-House Banking & Netting Routes ---

router.post("/netting/batches", async (req, res) => {
    try {
        const batch = await nettingService.createNettingBatch(new Date());
        res.json(batch);
    } catch (error) {
        console.error("Netting Create Error", error);
        res.status(500).json({ message: "Failed to create netting batch" });
    }
});

router.get("/netting/batches/:id/positions", async (req, res) => {
    try {
        const positions = await nettingService.getNetPositions(req.params.id);
        res.json(positions);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch positions" });
    }
});

router.post("/netting/batches/:id/settle", async (req, res) => {
    try {
        const result = await nettingService.settleBatch(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Failed to settle batch" });
    }
});

export default router;
