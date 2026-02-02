import { Router } from "express";
import { db } from "../../db";
import { competitors, opportunityCompetitors, insertCompetitorSchema, insertOpportunityCompetitorSchema } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

export const competitorRoutes = Router();

// --- Competitors CRUD ---

// List all competitors
competitorRoutes.get("/", async (req, res) => {
    try {
        const allCompetitors = await db.select().from(competitors).orderBy(desc(competitors.createdAt));
        res.json(allCompetitors);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create a competitor
competitorRoutes.post("/", async (req, res) => {
    try {
        const data = insertCompetitorSchema.parse(req.body);
        const [newCompetitor] = await db.insert(competitors).values(data).returning();
        res.json(newCompetitor);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: error.message });
    }
});

// Get a single competitor
competitorRoutes.get("/:id", async (req, res) => {
    try {
        const [competitor] = await db.select().from(competitors).where(eq(competitors.id, req.params.id));
        if (!competitor) return res.status(404).json({ error: "Competitor not found" });
        res.json(competitor);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- Opportunity Competitors Links ---

// List competitors for an opportunity
competitorRoutes.get("/opportunity/:opportunityId", async (req, res) => {
    try {
        const oppCompetitors = await db
            .select({
                id: opportunityCompetitors.id,
                opportunityId: opportunityCompetitors.opportunityId,
                competitorId: opportunityCompetitors.competitorId,
                status: opportunityCompetitors.status,
                notes: opportunityCompetitors.notes,
                competitorName: competitors.name,
                competitorStrengths: competitors.strengths,
                competitorWeaknesses: competitors.weaknesses,
            })
            .from(opportunityCompetitors)
            .leftJoin(competitors, eq(opportunityCompetitors.competitorId, competitors.id))
            .where(eq(opportunityCompetitors.opportunityId, req.params.opportunityId));

        res.json(oppCompetitors);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Link a competitor to an opportunity
competitorRoutes.post("/opportunity", async (req, res) => {
    try {
        const data = insertOpportunityCompetitorSchema.parse(req.body);
        const [link] = await db.insert(opportunityCompetitors).values(data).returning();
        res.json(link);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Remove a competitor from an opportunity
competitorRoutes.delete("/opportunity/:linkId", async (req, res) => {
    try {
        await db.delete(opportunityCompetitors).where(eq(opportunityCompetitors.id, req.params.linkId));
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
