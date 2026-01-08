import { Express, Request, Response } from "express";
import { storage } from "../../storage";
import { insertWorkOrderSchema } from "../../../shared/schema";

export function registerManufacturingRoutes(app: Express) {
    // Work Orders
    app.get("/api/manufacturing/work-orders", async (req, res) => {
        try {
            const orders = await storage.listWorkOrders();
            res.json(orders);
        } catch (error) {
            res.status(500).json({ error: "Failed to list work orders" });
        }
    });

    app.get("/api/manufacturing/work-orders/:id", async (req, res) => {
        try {
            const order = await storage.getWorkOrder(req.params.id);
            if (!order) return res.status(404).json({ error: "Work order not found" });
            res.json(order);
        } catch (error) {
            res.status(500).json({ error: "Failed to get work order" });
        }
    });

    app.post("/api/manufacturing/work-orders", async (req, res) => {
        try {
            const parseResult = insertWorkOrderSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const order = await storage.createWorkOrder(parseResult.data);
            res.status(201).json(order);
        } catch (error) {
            res.status(500).json({ error: "Failed to create work order" });
        }
    });
}
