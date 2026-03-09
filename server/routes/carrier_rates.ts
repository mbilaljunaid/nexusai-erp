import express from "express";
import { CarrierRateService } from "../services/CarrierRateService";

const router = express.Router();

// ========== RATE CARD MANAGEMENT ==========

// GET /api/carrier-rates - List rate cards
router.get("/carrier-rates", async (req, res) => {
    try {
        const { carrierId, status } = req.query;

        const rateCards = await CarrierRateService.getRateCards({
            carrierId: carrierId as string,
            status: status as string
        });

        res.json(rateCards);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/carrier-rates - Create rate card
router.post("/carrier-rates", async (req, res) => {
    try {
        const rateCard = await CarrierRateService.createRateCard(req.body);
        res.status(201).json(rateCard);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/carrier-rates/bulk - Bulk create/update rate cards
router.post("/carrier-rates/bulk", async (req, res) => {
    try {
        const { lines } = req.body;
        const results = await CarrierRateService.bulkUpsertRateCards(lines);
        res.status(200).json(results);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/carrier-rates/:id - Update rate card
router.put("/carrier-rates/:id", async (req, res) => {
    try {
        const updated = await CarrierRateService.updateRateCard(req.params.id, req.body);
        res.json(updated);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/carrier-rates/:id - Delete (soft) rate card
router.delete("/carrier-rates/:id", async (req, res) => {
    try {
        const deleted = await CarrierRateService.deleteRateCard(req.params.id);
        res.json({ success: true, deleted });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ========== QUOTE GENERATION & COMPARISON ==========

// POST /api/carrier-rates/quote - Generate quote
router.post("/carrier-rates/quote", async (req, res) => {
    try {
        const quote = await CarrierRateService.generateQuote(req.body);
        res.json(quote);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/carrier-rates/compare/:shipmentId - Compare quotes
router.get("/carrier-rates/compare/:shipmentId", async (req, res) => {
    try {
        const quotes = await CarrierRateService.compareQuotes(req.params.shipmentId);
        res.json(quotes);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ========== CONTRACT UPLOAD ==========

// POST /api/carrier-rates/upload-contract - Upload contract rates
router.post("/carrier-rates/upload-contract", async (req, res) => {
    try {
        const { contractNumber, carrierId, fileName, effectiveDate, expiryDate, ratesCount } = req.body;
        const uploadedBy = (req as any).user?.userId || "system";

        const contract = await CarrierRateService.uploadContractRates({
            contractNumber,
            carrierId,
            fileName,
            uploadedBy,
            effectiveDate: new Date(effectiveDate),
            expiryDate: new Date(expiryDate),
            ratesCount: parseInt(ratesCount) || 0
        });

        res.status(201).json(contract);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/carrier-rates/contracts - List contracts
router.get("/carrier-rates/contracts", async (req, res) => {
    try {
        const { carrierId } = req.query;
        const contracts = await CarrierRateService.getContracts(carrierId as string);
        res.json(contracts);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
