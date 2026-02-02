
import { Router } from "express";
import { insertDealRegistrationSchema } from "../../../shared/schema";
import { PartnerService } from "../../services/PartnerService";

export const partnerRoutes = Router();

// Register Deal
partnerRoutes.post("/register", async (req, res) => {
    try {
        const data = insertDealRegistrationSchema.parse(req.body);
        const result = await PartnerService.registerDeal(data);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Get Partner Deals - PAGINATED? (Ideally yes, but Service signature needs check)
partnerRoutes.get("/deals", async (req, res) => {
    try {
        const partnerId = req.query.partnerId as string;
        if (!partnerId) return res.status(400).json({ error: "partnerId required" });

        // Service.getPartnerDeals is currently just a select(), we should paginate it too eventually.
        // For now, let's just call it. Phase 33 Plan said "getAllDeals", which is for Admin.
        const result = await PartnerService.getPartnerDeals(partnerId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Deals (Admin) - PAGINATED
partnerRoutes.get("/deals/all", async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;
        const result = await PartnerService.getAllDeals(page, limit);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update Status (Internal Admin)
partnerRoutes.patch("/deals/:id", async (req, res) => {
    try {
        const { status, notes } = req.body;
        const result = await PartnerService.updateDealStatus(req.params.id, status, notes);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Helper: Ensure Partner (for Dev/Test)
partnerRoutes.post("/ensure", async (req, res) => {
    try {
        const { name, email } = req.body;
        const result = await PartnerService.ensurePartner(name, email);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
