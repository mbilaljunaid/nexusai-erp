
import { Router } from "express";
import { db } from "../../db";
import { campaigns, insertCampaignSchema } from "../../../shared/schema";
import { CampaignService } from "../../services/CampaignService";
import { eq, desc } from "drizzle-orm";

export const campaignRoutes = Router();

// LIST
campaignRoutes.get("/", async (req, res) => {
    try {
        const result = await db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE
campaignRoutes.post("/", async (req, res) => {
    try {
        const data = insertCampaignSchema.parse(req.body);
        const [newItem] = await db.insert(campaigns).values(data).returning();
        res.json(newItem);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// GET STATS (ROI)
campaignRoutes.get("/:id/stats", async (req, res) => {
    try {
        const result = await CampaignService.getCampaignStats(req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ADD MEMBER
campaignRoutes.post("/:id/members", async (req, res) => {
    try {
        const { memberId, type } = req.body; // type: 'lead' | 'contact'
        if (!memberId || !type) return res.status(400).json({ error: "Missing memberId or type" });

        const result = await CampaignService.addMember(req.params.id, memberId, type);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
