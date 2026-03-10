import { Router } from "express";
import { storage } from "../storage";
import { insertTaxCodeSchema, insertTaxJurisdictionSchema, insertTaxExemptionSchema } from "@shared/schema";
import { taxService } from "../services/tax";

const router = Router();

// Tax Codes
router.get("/codes", async (req, res) => {
    try {
        const legalEntityId = req.headers['x-legal-entity-id'] as string | undefined;
        const codes = await storage.listTaxCodes(legalEntityId);
        res.json(codes);
    } catch (error) {
        res.status(500).json({ message: "Failed to list tax codes" });
    }
});

router.post("/codes", async (req, res) => {
    try {
        const data = insertTaxCodeSchema.parse(req.body);
        const code = await storage.createTaxCode(data);
        res.json(code);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.get("/codes/:id", async (req, res) => {
    const code = await storage.getTaxCode(req.params.id);
    if (!code) return res.status(404).json({ error: "Tax Code not found" });
    res.json(code);
});

// Tax Jurisdictions
router.get("/jurisdictions", async (req, res) => {
    try {
        const legalEntityId = req.headers['x-legal-entity-id'] as string | undefined;
        const jurisdictions = await storage.listTaxJurisdictions(legalEntityId);
        res.json(jurisdictions);
    } catch (error) {
        res.status(500).json({ message: "Failed to list tax jurisdictions" });
    }
});

router.post("/jurisdictions", async (req, res) => {
    try {
        const data = insertTaxJurisdictionSchema.parse(req.body);
        const item = await storage.createTaxJurisdiction(data);
        res.json(item);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.get("/jurisdictions/:id", async (req, res) => {
    const item = await storage.getTaxJurisdiction(req.params.id);
    if (!item) return res.status(404).json({ error: "Jurisdiction not found" });
    res.json(item);
});

// Tax Exemptions
router.get("/exemptions", async (req, res) => {
    try {
        const legalEntityId = req.headers['x-legal-entity-id'] as string | undefined;
        const items = await storage.listTaxExemptions(legalEntityId);
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: "Failed to list tax exemptions" });
    }
});

router.post("/exemptions", async (req, res) => {
    try {
        const data = insertTaxExemptionSchema.parse(req.body);
        const item = await storage.createTaxExemption(data);
        res.json(item);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Tax Simulation (Preview)
router.post("/simulate", async (req, res) => {
    try {
        const { customerId, siteId, amount } = req.body;

        if (!customerId || !siteId || !amount) {
            return res.status(400).json({ error: "Missing required fields: customerId, siteId, amount" });
        }

        const result = await taxService.simulateTaxCalculation(customerId, siteId, Number(amount));
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Calculate Logic
router.post("/calculate/:invoiceId", async (req, res) => {
    try {
        const result = await taxService.calculateTaxForInvoice(req.params.invoiceId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
