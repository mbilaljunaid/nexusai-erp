
import { Router } from "express";
import { orderManagementService } from "./OrderManagementService";
import { dropShipService } from "./DropShipService";
import { fulfillmentOptimizer } from "./FulfillmentOptimizer";
import { pricingService } from "./PricingService";
import { fulfillmentService } from "./FulfillmentService";
import { returnService } from "./ReturnService";

export const orderRouter = Router();

// --- Order Management ---

// list orders
orderRouter.get("/orders", async (req, res) => {
    try {
        // Todo: Add pagination and filtering from req.query
        // For now, simple list. Note: Service needs a list method.
        // Assuming OrderManagementService might not have a simple list method yet, we might need to add it or use db directly here.
        // Let's assume we implement a `findAll` in service or use direct DB query for now if service lacks it.
        // Checking OrderManagementService... it has create, book, transferToAR.
        // We'll add a temporary list handler here.
        const orders = await orderManagementService.findAll(); // We need to add this method to service or stub it
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

orderRouter.post("/orders", async (req, res) => {
    try {
        const order = await orderManagementService.createOrder(req.body);
        res.json(order);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

orderRouter.get("/orders/:id", async (req, res) => {
    try {
        const order = await orderManagementService.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });
        res.json(order);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Action: Book
orderRouter.post("/orders/:id/book", async (req, res) => {
    try {
        const result = await orderManagementService.bookOrder(req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Action: Transfer to AR
orderRouter.post("/orders/:id/invoice", async (req, res) => {
    try {
        const result = await orderManagementService.transferToAR(req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// --- Fulfillment ---

orderRouter.post("/orders/:id/ship", async (req, res) => {
    try {
        const result = await fulfillmentService.shipOrder(req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// --- Returns ---

orderRouter.post("/returns", async (req, res) => {
    try {
        const result = await returnService.createRMA(req.body.originalOrderId, req.body.lines);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- Advanced (Phase 6) ---

orderRouter.post("/orders/:id/dropship", async (req, res) => {
    try {
        const result = await dropShipService.generateDropShipPO(req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- Configuration (Phase 7) ---

import { orderConfigService } from "./OrderConfigService";
import { priceListService } from "./PriceListService";

orderConfigService; // access

orderRouter.get("/config/types", async (req, res) => {
    const types = await orderConfigService.getOrderTypes();
    res.json(types);
});

orderRouter.post("/config/types", async (req, res) => {
    const type = await orderConfigService.createOrderType(req.body);
    res.json(type);
});

orderRouter.get("/config/holds", async (req, res) => {
    const holds = await orderConfigService.getHoldDefinitions();
    res.json(holds);
});

orderRouter.post("/config/holds", async (req, res) => {
    const hold = await orderConfigService.createHoldDefinition(req.body);
    res.json(hold);
});

// --- Price Lists (Phase 7) ---

orderRouter.get("/pricelists", async (req, res) => {
    const lists = await priceListService.getPriceLists();
    res.json(lists);
});

orderRouter.post("/pricelists", async (req, res) => {
    const list = await priceListService.createPriceList(req.body);
    res.json(list);
});

