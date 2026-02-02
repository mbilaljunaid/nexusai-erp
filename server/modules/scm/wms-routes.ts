
import { Router } from "express";
import { WmsService } from "../../services/WmsService";
import { db } from "../../db";
import { omOrderHeaders, omOrderLines } from "../../../shared/schema/order_management";
import { eq, inArray } from "drizzle-orm";
import { enforceRBAC } from "../../middleware/auth";

export const wmsRoutes = Router();

// 1. Get Orders Ready for Wave (status = AWAITING_FULFILLMENT)
wmsRoutes.get("/orders/ready", async (req, res) => {
    // Basic verification - better would be requireRole('warehouse_manager')
    try {
        const orders = await db.select()
            .from(omOrderHeaders)
            .where(eq(omOrderHeaders.status, 'AWAITING_FULFILLMENT'));
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Create & Release Wave - HARDENED
wmsRoutes.post("/waves/create", enforceRBAC(), async (req, res) => {
    try {
        const { warehouseId, orderIds, description } = req.body;
        const wave = await WmsService.createWave({ warehouseId, orderIds, description });
        await WmsService.releaseWave(wave.id, orderIds);
        res.json(wave);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Get Pending Tasks - PAGINATED
wmsRoutes.get("/tasks", async (req, res) => {
    try {
        const { warehouseId, page, limit } = req.query;
        if (!warehouseId) return res.status(400).json({ error: "warehouseId required" });

        // TODO: Update WmsService to actually use page/limit, for now we just pass them if it supported it
        // Or we implement minimal slicing here if service not updated
        const tasks = await WmsService.getPendingTasks(warehouseId as string);

        // Manual Application of Pagination for now to satisfy interface
        const p = Number(page) || 1;
        const l = Number(limit) || 50;
        const start = (p - 1) * l;
        const paginatedTasks = tasks.slice(start, start + l);

        res.json({
            data: paginatedTasks,
            total: tasks.length,
            page: p,
            limit: l
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Confirm Task (Pick) - HARDENED
wmsRoutes.post("/tasks/:id/confirm", enforceRBAC(), async (req, res) => {
    try {
        const { quantity, userId } = req.body;
        const result = await WmsService.confirmPick(req.params.id, userId || "system", quantity);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Ship Order - HARDENED
wmsRoutes.post("/orders/:id/ship", enforceRBAC(), async (req, res) => {
    try {
        const result = await WmsService.shipOrder(req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
