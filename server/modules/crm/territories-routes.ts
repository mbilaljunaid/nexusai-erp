
import { Router } from "express";
import { db } from "../../db";
import { territories, territoryRules, insertTerritorySchema, insertTerritoryRuleSchema } from "../../../shared/schema";
import { eq, desc } from "drizzle-orm";
import { TerritoryService } from "../../services/TerritoryService";

export const territoryRoutes = Router();

// --- Territories CRUD ---

// List Territories
territoryRoutes.get("/", async (req, res) => {
    try {
        const result = await db.select().from(territories).orderBy(desc(territories.createdAt));
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create Territory
territoryRoutes.post("/", async (req, res) => {
    try {
        const data = insertTerritorySchema.parse(req.body);
        const [newTerritory] = await db.insert(territories).values(data).returning();
        res.status(201).json(newTerritory);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// --- Rules CRUD ---

// Add Rule to Territory
territoryRoutes.post("/:id/rules", async (req, res) => {
    try {
        const territoryId = req.params.id;
        const data = insertTerritoryRuleSchema.parse({ ...req.body, territoryId });

        const [newRule] = await db.insert(territoryRules).values(data).returning();
        res.status(201).json(newRule);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// List Rules for Territory
territoryRoutes.get("/:id/rules", async (req, res) => {
    try {
        const rules = await db.select().from(territoryRules)
            .where(eq(territoryRules.territoryId, req.params.id))
            .orderBy(territoryRules.priority);
        res.json(rules);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- Assignment Logic ---

// Trigger Assignment for an Account (Debug/Admin tool)
territoryRoutes.post("/assign", async (req, res) => {
    try {
        const { accountId } = req.body;
        if (!accountId) return res.status(400).json({ error: "accountId is required" });

        const territoryId = await TerritoryService.assignAccount(accountId);
        res.json({ accountId, assignedTerritoryId: territoryId, status: territoryId ? "Assigned" : "No Match" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
