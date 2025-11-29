import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBomSchema, 
  insertBomLineSchema, 
  insertWorkOrderSchema,
  insertProductionOrderSchema,
  insertQualityCheckSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Manufacturing: BOMs
  app.get("/api/manufacturing/boms", async (req, res) => {
    const boms = await storage.listBoms();
    res.json(boms);
  });

  app.get("/api/manufacturing/boms/:id", async (req, res) => {
    const bom = await storage.getBom(req.params.id);
    if (!bom) {
      return res.status(404).json({ error: "BOM not found" });
    }
    res.json(bom);
  });

  app.post("/api/manufacturing/boms", async (req, res) => {
    try {
      const data = insertBomSchema.parse(req.body);
      const bom = await storage.createBom(data);
      res.status(201).json(bom);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create BOM" });
    }
  });

  app.patch("/api/manufacturing/boms/:id", async (req, res) => {
    try {
      const data = insertBomSchema.partial().parse(req.body);
      const bom = await storage.updateBom(req.params.id, data);
      if (!bom) {
        return res.status(404).json({ error: "BOM not found" });
      }
      res.json(bom);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update BOM" });
    }
  });

  app.delete("/api/manufacturing/boms/:id", async (req, res) => {
    const success = await storage.deleteBom(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "BOM not found" });
    }
    res.json({ success: true });
  });

  // BOM Lines
  app.get("/api/manufacturing/boms/:bomId/lines", async (req, res) => {
    const lines = await storage.getBomLines(req.params.bomId);
    res.json(lines);
  });

  app.post("/api/manufacturing/bom-lines", async (req, res) => {
    try {
      const data = insertBomLineSchema.parse(req.body);
      const line = await storage.addBomLine(data);
      res.status(201).json(line);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create BOM line" });
    }
  });

  // Work Orders
  app.get("/api/manufacturing/work-orders", async (req, res) => {
    const workOrders = await storage.listWorkOrders();
    res.json(workOrders);
  });

  app.get("/api/manufacturing/work-orders/:id", async (req, res) => {
    const wo = await storage.getWorkOrder(req.params.id);
    if (!wo) {
      return res.status(404).json({ error: "Work Order not found" });
    }
    res.json(wo);
  });

  app.post("/api/manufacturing/work-orders", async (req, res) => {
    try {
      const data = insertWorkOrderSchema.parse(req.body);
      const wo = await storage.createWorkOrder(data);
      res.status(201).json(wo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create Work Order" });
    }
  });

  app.patch("/api/manufacturing/work-orders/:id", async (req, res) => {
    try {
      const data = insertWorkOrderSchema.partial().parse(req.body);
      const wo = await storage.updateWorkOrder(req.params.id, data);
      if (!wo) {
        return res.status(404).json({ error: "Work Order not found" });
      }
      res.json(wo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update Work Order" });
    }
  });

  // Production Orders
  app.get("/api/manufacturing/production-orders", async (req, res) => {
    const pos = await storage.listProductionOrders();
    res.json(pos);
  });

  app.get("/api/manufacturing/production-orders/:id", async (req, res) => {
    const po = await storage.getProductionOrder(req.params.id);
    if (!po) {
      return res.status(404).json({ error: "Production Order not found" });
    }
    res.json(po);
  });

  app.post("/api/manufacturing/production-orders", async (req, res) => {
    try {
      const data = insertProductionOrderSchema.parse(req.body);
      const po = await storage.createProductionOrder(data);
      res.status(201).json(po);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create Production Order" });
    }
  });

  app.patch("/api/manufacturing/production-orders/:id", async (req, res) => {
    try {
      const data = insertProductionOrderSchema.partial().parse(req.body);
      const po = await storage.updateProductionOrder(req.params.id, data);
      if (!po) {
        return res.status(404).json({ error: "Production Order not found" });
      }
      res.json(po);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update Production Order" });
    }
  });

  // Quality Checks
  app.get("/api/manufacturing/quality-checks", async (req, res) => {
    const { workOrderId } = req.query;
    const checks = await storage.listQualityChecks(
      workOrderId ? String(workOrderId) : undefined
    );
    res.json(checks);
  });

  app.post("/api/manufacturing/quality-checks", async (req, res) => {
    try {
      const data = insertQualityCheckSchema.parse(req.body);
      const qc = await storage.createQualityCheck(data);
      res.status(201).json(qc);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create Quality Check" });
    }
  });

  return httpServer;
}
