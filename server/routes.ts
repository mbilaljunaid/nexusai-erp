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
  insertCopilotConversationSchema, insertCopilotMessageSchema, insertMobileDeviceSchema, insertOfflineSyncSchema,
} from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Domain-specific AI prompts
const systemPrompts: Record<string, string> = {
  crm: "You are an expert CRM assistant. Help users with sales strategies, lead scoring, pipeline management, and customer insights.",
  erp: "You are an expert ERP assistant. Help users with inventory management, procurement, financial planning, and supply chain optimization.",
  hr: "You are an expert HR assistant. Help users with recruitment, compensation planning, performance management, and employee development.",
  manufacturing: "You are an expert manufacturing assistant. Help users with production planning, quality control, supply chain, and cost optimization.",
  general: "You are an enterprise AI assistant. Help users with business insights, analytics, and operational optimization.",
};

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

  // PHASE 1: AI Copilot
  app.get("/api/copilot/conversations", async (req, res) => {
    const userId = req.query.userId as string;
    const convs = await storage.listCopilotConversations(userId);
    res.json(convs);
  });

  app.post("/api/copilot/conversations", async (req, res) => {
    try {
      const data = insertCopilotConversationSchema.parse(req.body);
      const conv = await storage.createCopilotConversation(data);
      res.status(201).json(conv);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.get("/api/copilot/messages/:conversationId", async (req, res) => {
    const messages = await storage.listCopilotMessages(req.params.conversationId);
    res.json(messages);
  });

  app.post("/api/copilot/messages", async (req, res) => {
    try {
      const data = insertCopilotMessageSchema.parse(req.body);
      const msg = await storage.createCopilotMessage(data);
      res.status(201).json(msg);
      
      // Get conversation context
      const conv = await storage.getCopilotConversation(data.conversationId);
      const context = conv?.context || "general";
      const systemPrompt = systemPrompts[context] || systemPrompts.general;
      
      // Fetch recent messages for context
      const recentMessages = await storage.listCopilotMessages(data.conversationId);
      const messages = recentMessages.slice(-10).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      
      // Add current user message if not already there
      if (messages[messages.length - 1]?.content !== data.content) {
        messages.push({ role: "user", content: data.content });
      }
      
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          max_tokens: 500,
        });
        
        const aiResponse = completion.choices[0]?.message?.content || "I couldn't generate a response.";
        
        await storage.createCopilotMessage({
          conversationId: data.conversationId,
          role: "assistant",
          content: aiResponse,
        });
      } catch (aiError) {
        console.error("OpenAI API error:", aiError);
        // Still allow user message to be saved even if AI fails
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // PHASE 1: Mobile Devices
  app.get("/api/mobile/devices", async (req, res) => {
    const userId = req.query.userId as string;
    const devices = await storage.listMobileDevices(userId);
    res.json(devices);
  });

  app.post("/api/mobile/register", async (req, res) => {
    try {
      const data = insertMobileDeviceSchema.parse(req.body);
      const device = await storage.registerMobileDevice(data);
      res.status(201).json(device);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to register device" });
    }
  });

  app.post("/api/mobile/sync/:deviceId", async (req, res) => {
    const device = await storage.updateMobileDeviceSync(req.params.deviceId);
    if (!device) return res.status(404).json({ error: "Device not found" });
    res.json(device);
  });

  // PHASE 1: Offline Sync Queue
  app.get("/api/mobile/sync-queue/:deviceId", async (req, res) => {
    const queue = await storage.getOfflineSyncQueue(req.params.deviceId);
    res.json(queue);
  });

  app.post("/api/mobile/sync-queue", async (req, res) => {
    try {
      const data = insertOfflineSyncSchema.parse(req.body);
      const sync = await storage.addToOfflineQueue(data);
      res.status(201).json(sync);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to queue sync" });
    }
  });

  return httpServer;
}
