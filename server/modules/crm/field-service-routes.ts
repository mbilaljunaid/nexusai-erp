
import { Router } from "express";
import { db } from "../../db";
import { serviceWorkOrders, insertServiceWorkOrderSchema } from "../../../shared/schema";
import { FieldServiceService } from "../../services/FieldServiceService";
import { eq, desc } from "drizzle-orm";

export const fieldServiceRoutes = Router();

// LIST ALL
fieldServiceRoutes.get("/", async (req, res) => {
    try {
        const result = await db.select().from(serviceWorkOrders).orderBy(desc(serviceWorkOrders.createdAt));
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DISPATCHER QUEUE
fieldServiceRoutes.get("/queue", async (req, res) => {
    try {
        const result = await FieldServiceService.getDispatcherQueue();
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE
fieldServiceRoutes.post("/", async (req, res) => {
    try {
        const data = insertServiceWorkOrderSchema.parse(req.body);
        const result = await FieldServiceService.createWorkOrder(data);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// DETAILS
fieldServiceRoutes.get("/:id", async (req, res) => {
    try {
        const result = await FieldServiceService.getWorkOrderDetails(req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ASSIGN
fieldServiceRoutes.post("/:id/assign", async (req, res) => {
    try {
        const { technicianId, start, end } = req.body;
        if (!technicianId || !start || !end) return res.status(400).json({ error: "Missing required fields" });

        const result = await FieldServiceService.assignTechnician(
            req.params.id,
            technicianId,
            new Date(start),
            new Date(end)
        );
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// COMPLETE
fieldServiceRoutes.post("/:id/complete", async (req, res) => {
    try {
        const result = await FieldServiceService.completeWorkOrder(req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// TECHNICIANS (Mock for now, or just users)
fieldServiceRoutes.get("/technicians/list", async (req, res) => {
    // Return mock technicians
    res.json([
        { id: "tech-1", name: "John Doe", skills: ["Electrical", "Plumbing"] },
        { id: "tech-2", name: "Jane Smith", skills: ["HVAC", "Safety"] },
        { id: "tech-3", name: "Bob Johnson", skills: ["General"] }
    ]);
});
