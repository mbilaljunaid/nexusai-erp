import { Router } from "express";
import { storage } from "../storage";
import { insertTaxCodeSchema, insertTaxJurisdictionSchema, insertTaxExemptionSchema } from "@shared/schema";
import { taxService } from "../services/tax";

const router = Router();

// Tax Codes
router.get("/codes", async (req, res) => {
    const codes = await storage.listTaxCodes();
    res.json(codes);
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
    const jurisdictions = await storage.listTaxJurisdictions();
    res.json(jurisdictions);
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
    const items = await storage.listTaxExemptions();
    res.json(items);
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
