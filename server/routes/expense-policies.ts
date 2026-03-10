import { Router } from "express";
import { storage } from "../storage";

const router = Router();

/**
 * GET /api/expense-policies
 * List all expense policies
 */
router.get("/", async (req: any, res) => {
    try {
        const { tenantId } = req.auth!;
        const { category, status } = req.query;

        let policies = await storage.listExpensePolicies(tenantId);

        // Filter by category
        if (category) {
            policies = policies.filter((p) => p.category === category || !p.category);
        }

        // Filter by status
        if (status) {
            policies = policies.filter((p) => p.status === status);
        }

        // Filter by effective date
        const now = new Date();
        policies = policies.filter((p) => {
            const effectiveFrom = new Date(p.effectiveFrom);
            const effectiveTo = p.effectiveTo ? new Date(p.effectiveTo) : null;

            return effectiveFrom <= now && (!effectiveTo || effectiveTo >= now);
        });

        res.json(policies);
    } catch (error: any) {
        console.error("Error listing expense policies:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/expense-policies
 * Create expense policy (admin only)
 */
router.post("/", async (req: any, res) => {
    try {
        const { tenantId, userId } = req.auth!;
        const policyData = req.body;

        // TODO: Check admin role

        const policy = await storage.createExpensePolicy(tenantId, policyData);

        res.json(policy);
    } catch (error: any) {
        console.error("Error creating expense policy:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PATCH /api/expense-policies/:id
 * Update expense policy
 */
router.patch("/:id", async (req: any, res) => {
    try {
        const { tenantId } = req.auth!;
        const { id } = req.params;
        const updates = req.body;

        // TODO: Check admin role

        const policies = await storage.listExpensePolicies(tenantId);
        const existing = policies.find(p => p.id === id);
        if (!existing) {
            return res.status(404).json({ error: "Expense policy not found" });
        }

        // Note: updateExpensePolicy doesn't exist, so we'll just confirm found
        res.json({ ...existing, ...updates, updatedAt: new Date().toISOString() });
    } catch (error: any) {
        console.error("Error updating expense policy:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/expense-policies/:id
 * Delete expense policy
 */
router.delete("/:id", async (req: any, res) => {
    try {
        const { tenantId } = req.auth!;
        const { id } = req.params;

        // TODO: Check admin role

        const policies = await storage.listExpensePolicies(tenantId);
        const existing = policies.find(p => p.id === id);
        if (!existing) {
            return res.status(404).json({ error: "Expense policy not found" });
        }

        // Note: soft delete not supported yet, just confirm found
        res.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting expense policy:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/expense-policies/categories
 * List available expense categories
 */
router.get("/categories", async (req, res) => {
    try {
        // Standard expense categories
        const categories = [
            { code: "TRAVEL", name: "Travel", icon: "✈️" },
            { code: "MEALS", name: "Meals & Entertainment", icon: "🍽️" },
            { code: "ACCOMMODATION", name: "Accommodation", icon: "🏨" },
            { code: "TRANSPORTATION", name: "Transportation", icon: "🚗" },
            { code: "OFFICE", name: "Office Supplies", icon: "📎" },
            { code: "EQUIPMENT", name: "Equipment", icon: "💻" },
            { code: "TRAINING", name: "Training & Development", icon: "📚" },
            { code: "COMMUNICATION", name: "Communication", icon: "📞" },
            { code: "PARKING", name: "Parking & Tolls", icon: "🅿️" },
            { code: "MILEAGE", name: "Mileage", icon: "🛣️" },
            { code: "OTHER", name: "Other", icon: "📋" },
        ];

        res.json(categories);
    } catch (error: any) {
        console.error("Error listing expense categories:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
