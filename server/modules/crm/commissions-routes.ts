
import { Router } from "express";
import { db } from "../../db";
import { commissionPlans, commissionAssignments, commissions, insertCommissionPlanSchema, insertCommissionAssignmentSchema } from "../../../shared/schema";
import { eq, desc } from "drizzle-orm";
import { CommissionService } from "../../services/CommissionService";

export const commissionRoutes = Router();

// --- Plans (Admin) ---

commissionRoutes.get("/plans", async (req, res) => {
    try {
        const result = await db.select().from(commissionPlans).orderBy(desc(commissionPlans.createdAt));
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

commissionRoutes.post("/plans", async (req, res) => {
    try {
        const data = insertCommissionPlanSchema.parse(req.body);
        const [newPlan] = await db.insert(commissionPlans).values(data).returning();
        res.status(201).json(newPlan);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// --- Assignments ---

commissionRoutes.post("/assign", async (req, res) => {
    try {
        const data = insertCommissionAssignmentSchema.parse(req.body);
        // Remove existing assignment for simplicity (1 active plan per user)
        await db.delete(commissionAssignments).where(eq(commissionAssignments.userId, data.userId));

        const [assignment] = await db.insert(commissionAssignments).values(data).returning();
        res.status(201).json(assignment);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// --- Commission Records ---

// Get commissions for a user
commissionRoutes.get("/user/:userId", async (req, res) => {
    try {
        const result = await db.select().from(commissions)
            .where(eq(commissions.userId, req.params.userId))
            .orderBy(desc(commissions.generatedAt));
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Trigger Calculation (Manual/Debug)
commissionRoutes.post("/calculate/:opportunityId", async (req, res) => {
    try {
        const result = await CommissionService.calculateCommission(req.params.opportunityId);
        res.json({ status: "Calculated", result });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
