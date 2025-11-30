import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { subscriptions, plans, invoices, payments, credits } from "@shared/schema";
import { authMiddleware, AuthRequest } from "./auth";
import { z } from "zod";

const router = Router();

// Get all plans
router.get("/plans", async (req, res) => {
  try {
    const allPlans = await db.select().from(plans);
    res.json(allPlans);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get subscription
router.get("/subscription", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.tenantId, req.tenantId as any),
      with: {
        plan: true,
      },
    });

    res.json(subscription || {});
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create subscription
router.post("/subscription", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { planId } = z.object({ planId: z.string().uuid() }).parse(req.body);

    const [subscription] = await db
      .insert(subscriptions)
      .values({
        tenantId: req.tenantId as any,
        planId: planId as any,
        status: "active",
      })
      .returning();

    res.json(subscription);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get invoices
router.get("/invoices", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const tenantInvoices = await db.select().from(invoices).where(eq(invoices.tenantId, req.tenantId as any));
    res.json(tenantInvoices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get credits
router.get("/credits", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const credit = await db.query.credits.findFirst({
      where: eq(credits.tenantId, req.tenantId as any),
    });

    res.json(credit || { balance: 0, usedAmount: 0 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
