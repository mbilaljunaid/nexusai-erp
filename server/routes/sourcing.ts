
import { Router } from "express";
import { sourcingService } from "../services/SourcingService";
import { enforceRBAC } from "../middleware/auth";

const router = Router();

/**
 * List all RFQs
 */
router.get("/rfqs", enforceRBAC("scm_read"), async (req, res) => {
    try {
        const rfqs = await sourcingService.listRfqs();
        res.json(rfqs);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * Get RFQ details
 */
router.get("/rfqs/:id", enforceRBAC("scm_read"), async (req, res) => {
    try {
        const rfq = await sourcingService.getRFQDetails(req.params.id);
        if (!rfq) return res.status(404).json({ error: "RFQ not found" });
        res.json(rfq);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * Create RFQ
 */
router.post("/rfqs", enforceRBAC("scm_write"), async (req, res) => {
    try {
        const rfq = await sourcingService.createRFQ(req.body);
        res.json(rfq);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * Publish RFQ
 */
router.post("/rfqs/:id/publish", enforceRBAC("scm_write"), async (req, res) => {
    try {
        const rfq = await sourcingService.publishRFQ(req.params.id);
        res.json(rfq);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * Compare Bids for RFQ
 */
router.get("/rfqs/:id/compare-bids", enforceRBAC("scm_read"), async (req, res) => {
    try {
        const comparison = await sourcingService.compareBids(req.params.id);
        res.json(comparison);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * Award RFQ
 */
router.post("/rfqs/:id/award", enforceRBAC("scm_write"), async (req, res) => {
    try {
        const result = await sourcingService.awardRFQ(req.params.id, req.body.bidId);
        res.json(result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * AI: Analyze RFQ Bids
 */
router.get("/rfqs/:id/analysis", enforceRBAC("scm_read"), async (req, res) => {
    try {
        const { sourcingAIService } = await import("../services/SourcingAIService");
        const analysis = await sourcingAIService.analyzeRFQ(req.params.id);
        res.json(analysis);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
