import { Router } from "express";
import { nettingService } from "../services/netting";
import { insertNettingAgreementSchema, insertNettingSettlementSchema } from "@shared/schema/netting";
import { ZodError } from "zod";

const router = Router();

// Agreements
router.get("/agreements", async (req, res) => {
    try {
        const agreements = await nettingService.getAgreements();
        res.json(agreements);
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
});

router.post("/agreements", async (req, res) => {
    try {
        const data = insertNettingAgreementSchema.parse(req.body);
        const agreement = await nettingService.createAgreement(data);
        res.status(201).json(agreement);
    } catch (e: any) {
        if (e instanceof ZodError) {
            res.status(400).json({ message: "Invalid agreement data", errors: e.errors });
        } else {
            res.status(500).json({ message: e.message });
        }
    }
});

// Proposals
router.get("/agreements/:id/proposal", async (req, res) => {
    try {
        const proposal = await nettingService.calculateProposal(req.params.id);
        res.json(proposal);
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
});

// Settlements
router.post("/settlements", async (req, res) => {
    try {
        const data = insertNettingSettlementSchema.parse(req.body);
        const settlement = await nettingService.executeSettlement(data);
        res.status(201).json(settlement);
    } catch (e: any) {
        if (e instanceof ZodError) {
            res.status(400).json({ message: "Invalid settlement data", errors: e.errors });
        } else {
            res.status(500).json({ message: e.message });
        }
    }
});

export default router;
