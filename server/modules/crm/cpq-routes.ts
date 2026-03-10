import { Router } from "express";
import { db } from "../../db";
import { cpqRules } from "../../../shared/schema";
import { eq } from "drizzle-orm";

export const cpqRoutes = Router();

// Get all CPQ rules
cpqRoutes.get("/rules", async (req, res) => {
    try {
        const rules = await db.select().from(cpqRules).orderBy(cpqRules.createdAt);
        res.json(rules);
    } catch (error) {
        console.error("Error fetching CPQ rules:", error);
        res.status(500).json({ error: "Failed to fetch CPQ rules" });
    }
});

// Create CPQ rule
cpqRoutes.post("/rules", async (req, res) => {
    try {
        const [rule] = await db.insert(cpqRules).values(req.body).returning();
        res.status(201).json(rule);
    } catch (error) {
        console.error("Error creating CPQ rule:", error);
        res.status(500).json({ error: "Failed to create CPQ rule" });
    }
});

// Delete CPQ rule
cpqRoutes.delete("/rules/:id", async (req, res) => {
    try {
        await db.delete(cpqRules).where(eq(cpqRules.id, req.params.id));
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting CPQ rule:", error);
        res.status(500).json({ error: "Failed to delete CPQ rule" });
    }
});
