
import { Router } from "express";
import { db } from "../../db";
import { purchaseOrders, suppliers } from "../../../shared/schema/scm";
import { eq, desc } from "drizzle-orm";
import { procurementService } from "./ProcurementService";

export const procurementRouter = Router();

// Get all Purchase Orders with Supplier Name
procurementRouter.get("/purchase-orders", async (req, res) => {
    try {
        const results = await db.select({
            id: purchaseOrders.id,
            poNumber: purchaseOrders.orderNumber,
            supplierId: purchaseOrders.supplierId,
            status: purchaseOrders.status,
            totalAmount: purchaseOrders.totalAmount,
            dueDate: purchaseOrders.dueDate,
            complianceStatus: purchaseOrders.complianceStatus,
            complianceReason: purchaseOrders.complianceReason,
            createdAt: purchaseOrders.createdAt,
            supplierName: suppliers.name // Join field
        })
            .from(purchaseOrders)
            .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
            .orderBy(desc(purchaseOrders.createdAt));

        res.json(results);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create Purchase Order
procurementRouter.post("/purchase-orders", async (req, res) => {
    try {
        const po = await procurementService.createPurchaseOrder(req.body);
        res.json(po);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get SCM Suppliers for Picker
procurementRouter.get("/suppliers", async (req, res) => {
    try {
        const results = await db.select().from(suppliers);
        res.json(results);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
