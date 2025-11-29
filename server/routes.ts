import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBomSchema, insertBomLineSchema, insertWorkOrderSchema, insertProductionOrderSchema, insertQualityCheckSchema,
  insertRoutingSchema, insertRoutingOperationSchema, insertWorkCenterSchema, insertMrpForecastSchema,
  insertReplenishmentRuleSchema, insertWarehouseSchema, insertStockLocationSchema, insertStockMoveSchema,
  insertMaintenanceSchema, insertProductionCostSchema,
  insertTaxRuleSchema, insertConsolidationRuleSchema, insertFxTranslationSchema,
  insertLeadScoreSchema, insertCpqPricingRuleSchema, insertTerritorySchema,
  insertBenefitsPlanSchema, insertPayrollConfigSchema, insertSuccessionPlanSchema,
  insertLearningPathSchema, insertCompensationPlanSchema,
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

  // ERP: Tax Rules
  app.get("/api/erp/tax-rules", async (req, res) => {
    const rules = await storage.listTaxRules();
    res.json(rules);
  });

  app.post("/api/erp/tax-rules", async (req, res) => {
    try {
      const data = insertTaxRuleSchema.parse(req.body);
      const rule = await storage.createTaxRule(data);
      res.status(201).json(rule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create tax rule" });
    }
  });

  // ERP: Consolidation Rules
  app.get("/api/erp/consolidation-rules", async (req, res) => {
    const rules = await storage.listConsolidationRules();
    res.json(rules);
  });

  app.post("/api/erp/consolidation-rules", async (req, res) => {
    try {
      const data = insertConsolidationRuleSchema.parse(req.body);
      const rule = await storage.createConsolidationRule(data);
      res.status(201).json(rule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create consolidation rule" });
    }
  });

  // ERP: FX Translations
  app.get("/api/erp/fx-translations", async (req, res) => {
    const translations = await storage.listFxTranslations();
    res.json(translations);
  });

  app.post("/api/erp/fx-translations", async (req, res) => {
    try {
      const data = insertFxTranslationSchema.parse(req.body);
      const translation = await storage.createFxTranslation(data);
      res.status(201).json(translation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create FX translation" });
    }
  });

  // CRM: Lead Scores
  app.get("/api/crm/lead-scores", async (req, res) => {
    const scores = await storage.listLeadScores();
    res.json(scores);
  });

  app.post("/api/crm/lead-scores", async (req, res) => {
    try {
      const data = insertLeadScoreSchema.parse(req.body);
      const score = await storage.createLeadScore(data);
      res.status(201).json(score);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create lead score" });
    }
  });

  // CRM: CPQ Pricing Rules
  app.get("/api/crm/cpq-pricing-rules", async (req, res) => {
    const rules = await storage.listCpqPricingRules();
    res.json(rules);
  });

  app.post("/api/crm/cpq-pricing-rules", async (req, res) => {
    try {
      const data = insertCpqPricingRuleSchema.parse(req.body);
      const rule = await storage.createCpqPricingRule(data);
      res.status(201).json(rule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create CPQ pricing rule" });
    }
  });

  // CRM: Territories
  app.get("/api/crm/territories", async (req, res) => {
    const territories = await storage.listTerritories();
    res.json(territories);
  });

  app.post("/api/crm/territories", async (req, res) => {
    try {
      const data = insertTerritorySchema.parse(req.body);
      const territory = await storage.createTerritory(data);
      res.status(201).json(territory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create territory" });
    }
  });

  // HR: Benefits Plans
  app.get("/api/hr/benefits-plans", async (req, res) => {
    const plans = await storage.listBenefitsPlans();
    res.json(plans);
  });

  app.post("/api/hr/benefits-plans", async (req, res) => {
    try {
      const data = insertBenefitsPlanSchema.parse(req.body);
      const plan = await storage.createBenefitsPlan(data);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create benefits plan" });
    }
  });

  // HR: Payroll Configs
  app.get("/api/hr/payroll-configs", async (req, res) => {
    const configs = await storage.listPayrollConfigs();
    res.json(configs);
  });

  app.post("/api/hr/payroll-configs", async (req, res) => {
    try {
      const data = insertPayrollConfigSchema.parse(req.body);
      const config = await storage.createPayrollConfig(data);
      res.status(201).json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create payroll config" });
    }
  });

  // HR: Succession Plans
  app.get("/api/hr/succession-plans", async (req, res) => {
    const plans = await storage.listSuccessionPlans();
    res.json(plans);
  });

  app.post("/api/hr/succession-plans", async (req, res) => {
    try {
      const data = insertSuccessionPlanSchema.parse(req.body);
      const plan = await storage.createSuccessionPlan(data);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create succession plan" });
    }
  });

  // HR: Learning Paths
  app.get("/api/hr/learning-paths", async (req, res) => {
    const paths = await storage.listLearningPaths();
    res.json(paths);
  });

  app.post("/api/hr/learning-paths", async (req, res) => {
    try {
      const data = insertLearningPathSchema.parse(req.body);
      const path = await storage.createLearningPath(data);
      res.status(201).json(path);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create learning path" });
    }
  });

  // HR: Compensation Plans
  app.get("/api/hr/compensation-plans", async (req, res) => {
    const plans = await storage.listCompensationPlans();
    res.json(plans);
  });

  app.post("/api/hr/compensation-plans", async (req, res) => {
    try {
      const data = insertCompensationPlanSchema.parse(req.body);
      const plan = await storage.createCompensationPlan(data);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create compensation plan" });
    }
  });

  return httpServer;
}
