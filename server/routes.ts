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
  insertRevenueForecastSchema, insertBudgetAllocationSchema, insertTimeSeriesDataSchema, insertForecastModelSchema,
  insertScenarioSchema, insertScenarioVariableSchema, insertDashboardWidgetSchema, insertReportSchema, insertAuditLogSchema,
  insertAppSchema, insertAppReviewSchema, insertAppInstallationSchema, insertConnectorSchema, insertConnectorInstanceSchema, insertWebhookEventSchema,
  insertAbacRuleSchema, insertEncryptedFieldSchema, insertComplianceConfigSchema, insertSprintSchema, insertIssueSchema,
  insertDataLakeSchema, insertEtlPipelineSchema, insertBiDashboardSchema, insertFieldServiceJobSchema, insertPayrollConfigSchema,
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

  // PHASE 2: Revenue Forecasting
  app.get("/api/planning/revenue-forecasts", async (req, res) => {
    const forecasts = await storage.listRevenueForecasts();
    res.json(forecasts);
  });

  app.post("/api/planning/revenue-forecasts", async (req, res) => {
    try {
      const data = insertRevenueForecastSchema.parse(req.body);
      const forecast = await storage.createRevenueForecast(data);
      res.status(201).json(forecast);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create forecast" });
    }
  });

  // PHASE 2: Budget Allocations
  app.get("/api/planning/budgets", async (req, res) => {
    const year = req.query.year ? Number(req.query.year) : undefined;
    const budgets = await storage.listBudgetAllocations(year);
    res.json(budgets);
  });

  app.post("/api/planning/budgets", async (req, res) => {
    try {
      const data = insertBudgetAllocationSchema.parse(req.body);
      const budget = await storage.createBudgetAllocation(data);
      res.status(201).json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create budget" });
    }
  });

  // PHASE 2: Time Series Data
  app.get("/api/analytics/time-series/:metric", async (req, res) => {
    const data = await storage.getTimeSeriesData(req.params.metric);
    res.json(data);
  });

  app.post("/api/analytics/time-series", async (req, res) => {
    try {
      const data = insertTimeSeriesDataSchema.parse(req.body);
      const result = await storage.createTimeSeriesData(data);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create time series data" });
    }
  });

  // PHASE 2: Forecast Models
  app.get("/api/analytics/forecast-models", async (req, res) => {
    const models = await storage.listForecastModels();
    res.json(models);
  });

  app.post("/api/analytics/forecast-models", async (req, res) => {
    try {
      const data = insertForecastModelSchema.parse(req.body);
      const model = await storage.createForecastModel(data);
      res.status(201).json(model);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create forecast model" });
    }
  });

  // PHASE 2: Scenarios (What-If Analysis)
  app.get("/api/planning/scenarios", async (req, res) => {
    const scenarios = await storage.listScenarios();
    res.json(scenarios);
  });

  app.post("/api/planning/scenarios", async (req, res) => {
    try {
      const data = insertScenarioSchema.parse(req.body);
      const scenario = await storage.createScenario(data);
      res.status(201).json(scenario);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create scenario" });
    }
  });

  app.get("/api/planning/scenarios/:scenarioId/variables", async (req, res) => {
    const variables = await storage.getScenarioVariables(req.params.scenarioId);
    res.json(variables);
  });

  app.post("/api/planning/scenarios/variables", async (req, res) => {
    try {
      const data = insertScenarioVariableSchema.parse(req.body);
      const variable = await storage.addScenarioVariable(data);
      res.status(201).json(variable);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to add scenario variable" });
    }
  });

  // PHASE 2: Dashboard Widgets
  app.get("/api/analytics/dashboards/:dashboardId/widgets", async (req, res) => {
    const widgets = await storage.listDashboardWidgets(req.params.dashboardId);
    res.json(widgets);
  });

  app.post("/api/analytics/widgets", async (req, res) => {
    try {
      const data = insertDashboardWidgetSchema.parse(req.body);
      const widget = await storage.createDashboardWidget(data);
      res.status(201).json(widget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create widget" });
    }
  });

  // PHASE 2: Reports
  app.get("/api/analytics/reports", async (req, res) => {
    const reports = await storage.listReports();
    res.json(reports);
  });

  app.post("/api/analytics/reports", async (req, res) => {
    try {
      const data = insertReportSchema.parse(req.body);
      const report = await storage.createReport(data);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create report" });
    }
  });

  // PHASE 2: Audit Logs
  app.get("/api/governance/audit-logs", async (req, res) => {
    const userId = req.query.userId as string;
    const logs = await storage.listAuditLogs(userId);
    res.json(logs);
  });

  app.post("/api/governance/audit-logs", async (req, res) => {
    try {
      const data = insertAuditLogSchema.parse(req.body);
      const log = await storage.createAuditLog(data);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create audit log" });
    }
  });

  // PHASE 3: App Marketplace
  app.get("/api/marketplace/apps", async (req, res) => {
    const category = req.query.category as string;
    const apps = await storage.listApps(category);
    res.json(apps);
  });

  app.post("/api/marketplace/apps", async (req, res) => {
    try {
      const data = insertAppSchema.parse(req.body);
      const app = await storage.createApp(data);
      res.status(201).json(app);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create app" });
    }
  });

  app.post("/api/marketplace/apps/:appId/reviews", async (req, res) => {
    try {
      const data = insertAppReviewSchema.parse({ ...req.body, appId: req.params.appId });
      const review = await storage.createAppReview(data);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  app.get("/api/marketplace/apps/:appId/reviews", async (req, res) => {
    const reviews = await storage.listAppReviews(req.params.appId);
    res.json(reviews);
  });

  app.post("/api/marketplace/installations", async (req, res) => {
    try {
      const data = insertAppInstallationSchema.parse(req.body);
      const inst = await storage.createAppInstallation(data);
      res.status(201).json(inst);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create installation" });
    }
  });

  app.get("/api/marketplace/installations", async (req, res) => {
    const tenantId = req.query.tenantId as string;
    const insts = await storage.listAppInstallations(tenantId);
    res.json(insts);
  });

  // PHASE 3: Connectors
  app.get("/api/connectors", async (req, res) => {
    const type = req.query.type as string;
    const connectors = await storage.listConnectors(type);
    res.json(connectors);
  });

  app.post("/api/connectors", async (req, res) => {
    try {
      const data = insertConnectorSchema.parse(req.body);
      const connector = await storage.createConnector(data);
      res.status(201).json(connector);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create connector" });
    }
  });

  app.post("/api/connectors/instances", async (req, res) => {
    try {
      const data = insertConnectorInstanceSchema.parse(req.body);
      const inst = await storage.createConnectorInstance(data);
      res.status(201).json(inst);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create connector instance" });
    }
  });

  app.get("/api/connectors/instances", async (req, res) => {
    const tenantId = req.query.tenantId as string;
    const insts = await storage.listConnectorInstances(tenantId);
    res.json(insts);
  });

  // PHASE 3: Webhooks
  app.post("/api/webhooks/events", async (req, res) => {
    try {
      const data = insertWebhookEventSchema.parse(req.body);
      const event = await storage.createWebhookEvent(data);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create webhook event" });
    }
  });

  app.get("/api/webhooks/events", async (req, res) => {
    const appId = req.query.appId as string;
    const events = await storage.listWebhookEvents(appId);
    res.json(events);
  });

  // PHASE 4: Security - ABAC Rules
  app.get("/api/security/abac-rules", async (req, res) => {
    const resource = req.query.resource as string;
    const rules = await storage.listAbacRules(resource);
    res.json(rules);
  });

  app.post("/api/security/abac-rules", async (req, res) => {
    try {
      const data = insertAbacRuleSchema.parse(req.body);
      const rule = await storage.createAbacRule(data);
      res.status(201).json(rule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create ABAC rule" });
    }
  });

  // PHASE 4: Security - Encrypted Fields
  app.get("/api/security/encrypted-fields", async (req, res) => {
    const entityType = req.query.entityType as string;
    const fields = await storage.listEncryptedFields(entityType);
    res.json(fields);
  });

  app.post("/api/security/encrypted-fields", async (req, res) => {
    try {
      const data = insertEncryptedFieldSchema.parse(req.body);
      const field = await storage.createEncryptedField(data);
      res.status(201).json(field);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create encrypted field" });
    }
  });

  // PHASE 4: Compliance - Configuration
  app.get("/api/compliance/configs", async (req, res) => {
    const tenantId = req.query.tenantId as string;
    const configs = await storage.listComplianceConfigs(tenantId);
    res.json(configs);
  });

  app.post("/api/compliance/configs", async (req, res) => {
    try {
      const data = insertComplianceConfigSchema.parse(req.body);
      const config = await storage.createComplianceConfig(data);
      res.status(201).json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create compliance config" });
    }
  });

  // PHASE 4: Agile - Sprints
  app.get("/api/agile/sprints", async (req, res) => {
    const projectId = req.query.projectId as string;
    const sprints = await storage.listSprints(projectId);
    res.json(sprints);
  });

  app.post("/api/agile/sprints", async (req, res) => {
    try {
      const data = insertSprintSchema.parse(req.body);
      const sprint = await storage.createSprint(data);
      res.status(201).json(sprint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create sprint" });
    }
  });

  // PHASE 4: Agile - Issues
  app.get("/api/agile/issues", async (req, res) => {
    const sprintId = req.query.sprintId as string;
    const issues = await storage.listIssues(sprintId);
    res.json(issues);
  });

  app.post("/api/agile/issues", async (req, res) => {
    try {
      const data = insertIssueSchema.parse(req.body);
      const issue = await storage.createIssue(data);
      res.status(201).json(issue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create issue" });
    }
  });

  // PHASE 5: Data Warehouse
  app.get("/api/data-warehouse/lakes", async (req, res) => {
    const lakes = await storage.listDataLakes();
    res.json(lakes);
  });

  app.post("/api/data-warehouse/lakes", async (req, res) => {
    try {
      const data = insertDataLakeSchema.parse(req.body);
      const lake = await storage.createDataLake(data);
      res.status(201).json(lake);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create data lake" });
    }
  });

  // PHASE 5: ETL Pipelines
  app.get("/api/etl/pipelines", async (req, res) => {
    const pipelines = await storage.listEtlPipelines();
    res.json(pipelines);
  });

  app.post("/api/etl/pipelines", async (req, res) => {
    try {
      const data = insertEtlPipelineSchema.parse(req.body);
      const pipeline = await storage.createEtlPipeline(data);
      res.status(201).json(pipeline);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create ETL pipeline" });
    }
  });

  // PHASE 5: BI Dashboards
  app.get("/api/bi/dashboards", async (req, res) => {
    const dashboards = await storage.listBiDashboards();
    res.json(dashboards);
  });

  app.post("/api/bi/dashboards", async (req, res) => {
    try {
      const data = insertBiDashboardSchema.parse(req.body);
      const dashboard = await storage.createBiDashboard(data);
      res.status(201).json(dashboard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create BI dashboard" });
    }
  });

  // PHASE 5: Field Service
  app.get("/api/field-service/jobs", async (req, res) => {
    const status = req.query.status as string;
    const jobs = await storage.listFieldServiceJobs(status);
    res.json(jobs);
  });

  app.post("/api/field-service/jobs", async (req, res) => {
    try {
      const data = insertFieldServiceJobSchema.parse(req.body);
      const job = await storage.createFieldServiceJob(data);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create field service job" });
    }
  });

  // PHASE 5: Payroll Configuration
  app.get("/api/payroll/configs", async (req, res) => {
    const configs = await storage.listPayrollConfigs();
    res.json(configs);
  });

  app.post("/api/payroll/configs", async (req, res) => {
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

  return httpServer;
}
