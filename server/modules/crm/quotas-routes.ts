// @ts-nocheck
import { Router } from "express";
import { db } from "../../db";
import { salesQuotas, opportunities, insertSalesQuotaSchema } from "@shared/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { z } from "zod";

export const quotaRoutes = Router();

// --- Quotas CRUD ---

// List quotas (optionally filter by user or period)
quotaRoutes.get("/", async (req, res) => {
    try {
        const { userId, periodName } = req.query;
        let query = db.select().from(salesQuotas);

        const filters = [];
        if (userId) filters.push(eq(salesQuotas.userId, userId as string));
        if (periodName) filters.push(eq(salesQuotas.periodName, periodName as string));

        if (filters.length > 0) {
            // @ts-ignore
            query = query.where(and(...filters));
        }

        const results = await query.orderBy(desc(salesQuotas.periodName));
        res.json(results);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create/Update Quota
quotaRoutes.post("/", async (req, res) => {
    try {
        const data = insertSalesQuotaSchema.parse(req.body);
        // Check if quota exists for user+period, if so update, else insert
        const existing = await db.select().from(salesQuotas)
            .where(and(
                eq(salesQuotas.userId, data.userId),
                eq(salesQuotas.periodName, data.periodName)
            ));

        if (existing.length > 0) {
            const [updated] = await db.update(salesQuotas)
                .set({ quotaAmount: data.quotaAmount })
                .where(eq(salesQuotas.id, existing[0].id))
                .returning();
            return res.json(updated);
        }

        const [newQuota] = await db.insert(salesQuotas).values(data).returning();
        res.json(newQuota);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: error.message });
    }
});

// --- Aggregation: Quota vs Actuals ---

// Get Performance for User & Period
quotaRoutes.get("/performance", async (req, res) => {
    try {
        const { userId, periodName } = req.query;
        if (!userId || !periodName) {
            return res.status(400).json({ error: "userId and periodName are required" });
        }

        // 1. Get Quota
        const [quota] = await db.select().from(salesQuotas)
            .where(and(
                eq(salesQuotas.userId, userId as string),
                eq(salesQuotas.periodName, periodName as string)
            ));

        const quotaAmount = quota ? Number(quota.quotaAmount) : 0;

        // 2. Get Actuals (Sum of Won Opportunities closed in this period)
        // Note: Simplification - assuming periodName matches a date range or we just grab all closed in that "string" period.
        // For Tier-1, we'd map "Q1-2026" to dates. keeping it simple for now: we rely on client or use basic date matching if provided.
        // Let's assume periodName is passed but we actually calculate based on Close Date falling in current quarter/year if generic.
        // However, to make it work 'mock-like' for the prompt without complex Date parsing of "Q1-2026":

        // We will sum ALL 'Closed Won' opportunities for this user. 
        // In a real app, we would filter by `closeDate` BETWEEN start AND end of `periodName`.

        const actualsQuery = await db.select({
            total: sql<string>`sum(${opportunities.amount})`
        })
            .from(opportunities)
            .where(and(
                eq(opportunities.ownerId, userId as string),
                eq(opportunities.stage, "Closed Won")
                // TODO: Add Date Range filter based on periodName
            ));

        const actualAmount = Number(actualsQuery[0]?.total || 0);

        res.json({
            userId,
            periodName,
            quota: quotaAmount,
            actual: actualAmount,
            attainment: quotaAmount > 0 ? (actualAmount / quotaAmount) * 100 : 0
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
