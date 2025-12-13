import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { dbStorage } from "./storage-db";
import { db } from "./db";
import { eq, and, like, desc, sql } from "drizzle-orm";
import * as XLSX from "xlsx";
import PDFDocument from "pdfkit";
import { Packer, Document, Paragraph } from "docx";
import Papa from "papaparse";
import { 
  insertProjectSchema, insertInvoiceSchema, insertLeadSchema, insertWorkOrderSchema, insertEmployeeSchema,
  insertMobileDeviceSchema, insertOfflineSyncSchema,
  insertCopilotConversationSchema, insertCopilotMessageSchema,
  insertRevenueForecastSchema, insertBudgetAllocationSchema, insertTimeSeriesDataSchema, insertForecastModelSchema,
  insertScenarioSchema, insertScenarioVariableSchema, insertDashboardWidgetSchema, insertReportSchema, insertAuditLogSchema,
  insertAppSchema, insertAppReviewSchema, insertAppInstallationSchema, insertConnectorSchema, insertConnectorInstanceSchema, insertWebhookEventSchema,
  insertAbacRuleSchema, insertEncryptedFieldSchema, insertComplianceConfigSchema, insertSprintSchema, insertIssueSchema,
  insertDataLakeSchema, insertEtlPipelineSchema, insertBiDashboardSchema, insertFieldServiceJobSchema, insertPayrollConfigSchema,
  insertDemoSchema, formData as formDataTable, smartViews, reports, contactSubmissions, insertContactSubmissionSchema,
  insertPartnerSchema, partners as partnersTable, insertUserFeedbackSchema,
  industries as industriesTable, industryDeployments as industryDeploymentsTable,
  insertIndustrySchema, insertIndustryDeploymentSchema, tenants as tenantsTable,
  marketplaceDevelopers, marketplaceCategories, marketplaceApps, marketplaceAppVersions,
  marketplaceInstallations, marketplaceTransactions, marketplaceSubscriptions, marketplaceReviews,
  marketplacePayouts, marketplaceCommissionSettings, marketplaceAuditLogs, marketplaceLicenses, marketplaceAppDependencies,
  insertMarketplaceDeveloperSchema, insertMarketplaceAppSchema, insertMarketplaceInstallationSchema,
  insertMarketplaceReviewSchema, insertMarketplaceCommissionSettingSchema,
  userDashboardWidgets, insertUserDashboardWidgetSchema,
  userBadges, badgeDefinitions, userActivityPoints,
  developerSpotlight, userNotifications, insertUserNotificationSchema,
  communitySpaces, communityPosts, communityComments, communityVotes,
  userTrustLevels, reputationEvents, communityBadgeProgress,
  insertCommunityPostSchema, insertCommunityCommentSchema, insertCommunityVoteSchema,
  communityFlags, insertCommunityFlagSchema,
  communityModerationActions, insertCommunityModerationActionSchema,
  userEarnedBadges, insertUserEarnedBadgeSchema,
  users,
  serviceCategories, servicePackages, serviceOrders, serviceReviews,
  insertServiceCategorySchema, insertServicePackageSchema, insertServiceOrderSchema, insertServiceReviewSchema,
  communityVoteEvents, communityVoteAnomalies, communityAIRecommendations,
  insertCommunityVoteEventSchema, insertCommunityVoteAnomalySchema, insertCommunityAIRecommendationSchema,
} from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import { lemonSqueezySetup, createCheckout, listProducts, getAuthenticatedUser } from "@lemonsqueezy/lemonsqueezy.js";
import crypto from "crypto";
import { generateDemoData, marketplaceDeveloperSeeds, marketplaceAppSeeds } from "./demoSeeds";
import analyticsRoutes from "./routes/analyticsRoutes";
import templateRoutes from "./routes/templateRoutes";
import migrationRoutes from "./routes/migrationRoutes";
import { validateRequest, errorResponse, ErrorCode, sanitizeInput } from "./security";
import { setupPlatformAuth, isPlatformAuthenticated } from "./platformAuth";

// Generic form data storage (in-memory)
const formDataStore: Map<string, any[]> = new Map();

// Using Replit AI Integrations for OpenAI (no API key needed, billed to credits)
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1",
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "dummy-key",
});

// Domain-specific AI prompts
const systemPrompts: Record<string, string> = {
  crm: "You are an expert CRM assistant. Help users with sales strategies, lead scoring, pipeline management, and customer insights.",
  erp: "You are an expert ERP assistant. Help users with inventory management, procurement, financial planning, and supply chain optimization.",
  hr: "You are an expert HR assistant. Help users with recruitment, compensation planning, performance management, and employee development.",
  manufacturing: "You are an expert manufacturing assistant. Help users with production planning, quality control, supply chain, and cost optimization.",
  general: "You are an enterprise AI assistant. Help users with business insights, analytics, and operational optimization.",
};

// In-memory storage for Phase 1 features
const invoicesStore: any[] = [];
const quotesStore: any[] = [];
const paymentsStore: any[] = [];
const approvalsStore: any[] = [];
const apInvoicesStore: any[] = [];
const bankTransactionsStore: any[] = [];
const paymentSchedulesStore: any[] = [];
const agingDataStore: any[] = [];
const sprintsStore: any[] = [];
const tasksStore: any[] = [];
const workflowsStore: any[] = [];
const collaborationsStore: any[] = [];
const payrollRunsStore: any[] = [];
const leaveRequestsStore: any[] = [];
const performanceReviewsStore: any[] = [];
const onboardingWorkflowsStore: any[] = [];
const budgetsStore: any[] = [];
const consolidationsStore: any[] = [];
const variancesStore: any[] = [];
const predictionsStore: any[] = [];
const ragJobsStore: any[] = [];
const copilotChatsStore: any[] = [];
const errorEventsStore: any[] = [];
const knowledgeEntitiesStore: any[] = [];

// PHASE 1: Enterprise Foundation
const tenantsStore: any[] = [
  { id: "tenant1", name: "Acme Corp", slug: "acme", status: "active", createdAt: new Date().toISOString() }
];
const plansStore: any[] = [
  { id: "plan1", name: "Starter", price: "99", billingCycle: "monthly", features: ["Core Features", "5 Users", "Basic Support"], status: "active", createdAt: new Date().toISOString() },
  { id: "plan2", name: "Professional", price: "299", billingCycle: "monthly", features: ["All Features", "25 Users", "Priority Support", "Analytics"], status: "active", createdAt: new Date().toISOString() },
  { id: "plan3", name: "Enterprise", price: "999", billingCycle: "monthly", features: ["All Features", "Unlimited Users", "24/7 Support", "Custom Integration"], status: "active", createdAt: new Date().toISOString() }
];
const subscriptionsStore: any[] = [];
const paymentsPhase1Store: any[] = [];

// RBAC Enforcement Middleware
const enforceRBAC = (requiredPermission?: string) => {
  return async (req: any, res: any, next: any) => {
    const tenantId = req.headers["x-tenant-id"] as string;
    const userId = req.headers["x-user-id"] as string;
    
    if (!tenantId || !userId) {
      return res.status(401).json({ error: "Missing tenant or user context" });
    }
    
    req.tenantId = tenantId;
    req.userId = userId;
    req.role = req.headers["x-user-role"] || "viewer";
    
    // Simple role-based check
    if (requiredPermission) {
      const rolePermissions: Record<string, string[]> = {
        admin: ["read", "write", "delete", "admin"],
        editor: ["read", "write"],
        viewer: ["read"],
      };
      const allowedPerms = rolePermissions[req.role] || [];
      if (!allowedPerms.includes(requiredPermission)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
    }
    
    next();
  };
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Setup Platform Auth (email/password authentication)
  await setupPlatformAuth(app);

  // Apply RBAC middleware to all /api routes (except health check, auth, and public demo routes)
  app.use("/api", (req, res, next) => {
    if (req.path === "/health") return next();
    if (req.path.startsWith("/auth")) return next();
    if (req.path === "/login") return next();
    if (req.path === "/logout") return next();
    if (req.path === "/callback") return next();
    if (req.path === "/demos/industries") return next();
    if (req.path === "/demos/request") return next();
    if (req.path === "/demos/list") return next();
    if (req.path.startsWith("/copilot")) return next();
    if (req.path === "/feedback") return next();
    if (req.path === "/auth/user") return next();
    if (req.path === "/marketplace/categories") return next();
    if (req.path === "/marketplace/apps") return next();
    if (req.path.match(/^\/marketplace\/apps\/[^/]+$/)) return next();
    if (req.path.match(/^\/marketplace\/apps\/[^/]+\/reviews$/)) return next();
    if (req.path.match(/^\/marketplace\/apps\/[^/]+\/dependencies$/)) return next();
    if (req.path.startsWith("/community")) return next();
    enforceRBAC()(req, res, next);
  });

  // ========== AUTH USER ENDPOINT (for frontend auth check) ==========
  app.get("/api/auth/user", (req: any, res) => {
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      const claims = req.user.claims || {};
      return res.json({
        isAuthenticated: true,
        user: {
          id: claims.sub || req.user.id,
          email: claims.email,
          firstName: claims.first_name,
          lastName: claims.last_name,
          profileImageUrl: claims.profile_image_url,
        }
      });
    }
    return res.json({ isAuthenticated: false, user: null });
  });

  // ========== USER FEEDBACK ROUTE ==========
  app.post("/api/feedback", async (req, res) => {
    try {
      const parseResult = insertUserFeedbackSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message).join(", ");
        return res.status(400).json({ error: errors });
      }

      const feedback = await storage.createUserFeedback(parseResult.data);
      console.log(`Feedback submitted: ${feedback.id} - ${feedback.title}`);
      
      res.status(201).json({ success: true, feedback });
    } catch (error: any) {
      console.error("Feedback submission error:", error);
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  app.get("/api/feedback", async (req, res) => {
    try {
      const feedbackList = await storage.listUserFeedback();
      res.json(feedbackList);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  // ========== AI COPILOT CHAT ROUTE ==========
  app.post("/api/copilot/chat", async (req, res) => {
    try {
      const { message, context = "general" } = req.body;
      
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      const systemPrompt = systemPrompts[context] || systemPrompts.general;
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
      
      res.json({ response: aiResponse });
    } catch (error: any) {
      console.error("Copilot chat error:", error);
      res.status(500).json({ 
        error: "Failed to get AI response",
        message: error.message || "Unknown error"
      });
    }
  });

  // ========== PUBLIC DEMO ROUTES ==========
  app.get("/api/demos/industries", (req, res) => {
    const industries = [
      "Audit & Compliance", "Automotive", "Banking & Finance", "Business Services",
      "Carrier & Shipping", "Clinical & Healthcare", "Credit & Lending", "Education",
      "Energy & Utilities", "Equipment & Manufacturing", "Events & Conferences", "Export & Import",
      "Fashion & Apparel", "Finance & Investment", "Food & Beverage", "Freight & Logistics",
      "Government & Public Sector", "Healthcare & Life Sciences", "Hospitality & Travel",
      "Insurance", "Laboratory Services", "Laboratory Technology", "Logistics & Transportation",
      "Manufacturing & Operations", "Marketing & Advertising", "Media & Entertainment",
      "Pharmacy & Pharmaceuticals", "Portal & Digital Services", "Property & Real Estate",
      "Real Estate & Construction", "Retail & E-Commerce", "Security & Defense",
      "Shipment Management", "Shipping & Maritime", "Telecom & Technology",
      "Training & Development", "Transportation & Mobility", "Travel & Tourism",
      "Vehicle & Automotive", "Warehouse & Storage", "Wholesale & Distribution"
    ];
    res.json(industries);
  });

  // In-memory fallback for demos
  const demosStore: any[] = [];

  app.get("/api/demos/list", async (req, res) => {
    try {
      const dbDemos = await dbStorage.listDemos();
      // Combine DB demos with any in-memory fallback demos
      const allDemos = [...dbDemos, ...demosStore];
      res.json(allDemos);
    } catch (error) {
      // Return only in-memory fallback demos when DB unavailable
      console.warn("Database unavailable for demos list, using in-memory fallback");
      res.json(demosStore);
    }
  });
  
  app.post("/api/demos/request", validateRequest(insertDemoSchema.omit({ id: true, createdAt: true })), async (req, res) => {
    try {
      const data = sanitizeInput((req as any).validatedData);
      const demoData = {
        email: data.email,
        industry: data.industry,
        company: data.company || "Demo Company",
        status: "active" as const,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
      
      try {
        const demo = await dbStorage.createDemo(demoData);
        res.status(201).json({ success: true, id: demo.id, message: "Demo created successfully" });
      } catch (dbError) {
        // Fallback to in-memory storage
        console.warn("Database unavailable, using in-memory storage:", dbError);
        const memDemo = { ...demoData, id: `demo-${Date.now()}`, createdAt: new Date() };
        demosStore.push(memDemo);
        res.status(201).json({ success: true, id: memDemo.id, message: "Demo created successfully" });
      }
    } catch (error: any) {
      console.error("Demo creation error:", error);
      res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, "Failed to create demo", undefined, (req as any).id));
    }
  });

  // PHASE 1: Invoices
  app.get("/api/invoices", async (req, res) => {
    const invoices = await dbStorage.listInvoices();
    res.json(invoices);
  });

  app.post("/api/invoices", validateRequest(insertInvoiceSchema), async (req, res) => {
    try {
      const data = sanitizeInput((req as any).validatedData);
      const invoice = await dbStorage.createInvoice({
        invoiceNumber: data.invoiceNumber || `INV-${Math.random().toString(36).substr(2, 9)}`,
        customerId: data.customerId || "CUST-001",
        amount: data.amount || "0",
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: data.status || "draft",
      });
      res.status(201).json({ success: true, data: invoice });
    } catch (error: any) {
      res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, "Failed to create invoice", undefined, (req as any).id));
    }
  });

  app.post("/api/invoices/:id/send", async (req, res) => {
    const invoice = invoicesStore.find(i => i.id === req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    invoice.status = "sent";
    res.json(invoice);
  });

  // PHASE 1: Quotes
  app.get("/api/quotes", async (req, res) => {
    res.json(quotesStore);
  });

  app.post("/api/quotes", async (req, res) => {
    try {
      const data = sanitizeInput(req.body);
      if (!data.opportunityId || !data.total) {
        return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, "Missing required fields: opportunityId, total", undefined, (req as any).id));
      }
      const quote = {
        id: `quote-${Date.now()}`,
        opportunityId: data.opportunityId,
        lineItems: data.lineItems || [],
        discountAmount: data.discountAmount || "0",
        total: data.total,
        status: data.status || "draft",
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };
      quotesStore.push(quote);
      res.status(201).json({ success: true, data: quote });
    } catch (error: any) {
      res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, "Failed to create quote", undefined, (req as any).id));
    }
  });

  // Generic form endpoints
  app.get("/api/:formId", async (req, res) => {
    const { formId } = req.params;
    try {
      const records = await db.query.formData.findMany({
        where: (formData) => eq(formData.formId, formId),
      });
      res.json(records);
    } catch (dbError) {
      console.warn("Database query failed:", dbError);
      const items = formDataStore.get(formId) || [];
      res.json(items);
    }
  });

  app.post("/api/:formId", async (req, res) => {
    const { formId } = req.params;
    try {
      const data = sanitizeInput(req.body);
      const result = await db.insert(formDataTable).values({
        formId,
        data,
        status: "draft",
        submittedBy: (req as any).userId || "anonymous",
      }).returning();

      const id = result[0]?.id;
      const items = formDataStore.get(formId) || [];
      items.push({ ...data, id, status: "draft" });
      formDataStore.set(formId, items);

      res.status(201).json({ success: true, data: result[0] || { ...data, id } });
    } catch (error) {
      res.status(500).json({ error: "Failed to create item" });
    }
  });

  app.patch("/api/:formId/:id", async (req, res) => {
    const { formId, id } = req.params;
    try {
      const items = formDataStore.get(formId) || [];
      const index = items.findIndex((i: any) => i.id === id);
      if (index === -1) return res.status(404).json({ error: "Item not found" });

      const data = sanitizeInput(req.body);
      items[index] = { ...items[index], ...data };
      formDataStore.set(formId, items);

      try {
        await db.update(formDataTable).set({
          data: items[index],
          updatedAt: new Date(),
        }).where(eq(formDataTable.id, id)).execute();
      } catch (dbError) {
        console.warn("Database update failed, using memory storage:", dbError);
      }
      
      res.json(items[index]);
    } catch (error) {
      res.status(500).json({ error: "Failed to update item" });
    }
  });

  app.delete("/api/:formId/:id", async (req, res) => {
    const { formId, id } = req.params;
    try {
      const items = formDataStore.get(formId) || [];
      const filtered = items.filter((i: any) => i.id !== id);
      formDataStore.set(formId, filtered);
      
      try {
        await db.delete(formDataTable).where(eq(formDataTable.id, id)).execute();
      } catch (dbError) {
        console.warn("Database delete failed, using memory storage:", dbError);
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete item" });
    }
  });

  // ========== EXCEL EXPORT/IMPORT & SMARTVIEWS ==========
  app.get("/api/export/:formId", async (req, res) => {
    try {
      const { formId } = req.params;
      const records = await db.query.formData.findMany({
        where: (formData) => eq(formData.formId, formId),
      });
      const flatRecords = records.map((record: any) => ({
        id: record.id,
        ...(record.data as Record<string, any>),
        status: record.status,
        submittedAt: record.submittedAt,
        submittedBy: record.submittedBy,
      }));
      const ws = XLSX.utils.json_to_sheet(flatRecords);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="${formId}-export.xlsx"`);
      res.send(buffer);
    } catch (error: any) {
      res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, "Export failed", undefined, (req as any).id));
    }
  });

  app.post("/api/import/:formId", async (req, res) => {
    try {
      const { formId } = req.params;
      const { records } = req.body;
      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, "No records to import", undefined, (req as any).id));
      }
      const imported = [];
      for (const record of records) {
        const result = await db.insert(formDataTable).values({
          formId,
          data: record,
          status: "draft",
          submittedBy: (req as any).userId || "anonymous",
        }).returning();
        imported.push(result[0]);
      }
      res.status(201).json({ success: true, imported: imported.length, data: imported });
    } catch (error: any) {
      res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, "Import failed", undefined, (req as any).id));
    }
  });

  app.get("/api/smartviews", async (req, res) => {
    try {
      const formId = req.query.formId as string;
      if (!formId) {
        return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, "formId required", undefined, (req as any).id));
      }
      const views = await db.query.smartViews.findMany({
        where: (smartViews) => eq(smartViews.formId, formId),
      });
      res.json(views);
    } catch (error: any) {
      res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, "Failed to fetch SmartViews", undefined, (req as any).id));
    }
  });

  app.post("/api/smartviews", async (req, res) => {
    try {
      const data = sanitizeInput(req.body);
      const view = await db.insert(smartViews).values({
        formId: data.formId,
        name: data.name,
        description: data.description,
        filters: data.filters || [],
        sortBy: data.sortBy || [],
        visibleColumns: data.visibleColumns,
      }).returning();
      res.status(201).json(view[0]);
    } catch (error: any) {
      res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, "Failed to create SmartView", undefined, (req as any).id));
    }
  });

  app.delete("/api/smartviews/:viewId", async (req, res) => {
    try {
      const { viewId } = req.params;
      await db.delete(smartViews).where(eq(smartViews.id, viewId));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, "Failed to delete SmartView", undefined, (req as any).id));
    }
  });

  // ========== REPORTS ==========
  app.get("/api/reports", async (req, res) => {
    try {
      const module = req.query.module as string;
      const reportsData = await db.query.reports.findMany({
        where: (reports) => eq(reports.module, module),
      });
      res.json(reportsData);
    } catch (error: any) {
      res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, "Failed to fetch reports", undefined, (req as any).id));
    }
  });

  app.post("/api/reports", async (req, res) => {
    try {
      const data = sanitizeInput(req.body);
      const report = await db.insert(reports).values({
        name: data.name,
        module: data.module,
        type: data.type,
        config: data.config,
        layout: data.layout,
        template: data.template || false,
      }).returning();
      res.status(201).json(report[0]);
    } catch (error: any) {
      res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, "Failed to create report", undefined, (req as any).id));
    }
  });

  app.delete("/api/reports/:reportId", async (req, res) => {
    try {
      const { reportId } = req.params;
      await db.delete(reports).where(eq(reports.id, reportId));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, "Failed to delete report", undefined, (req as any).id));
    }
  });

  app.get("/api/reports/:reportId/export", async (req, res) => {
    try {
      const { reportId } = req.params;
      const format = req.query.format as string || "pdf";
      
      const report = await db.query.reports.findFirst({
        where: (reports) => eq(reports.id, reportId),
      });

      if (!report) return res.status(404).json({ error: "Report not found" });

      const columns = (report.config as any)?.columns || [];
      
      if (format === "csv") {
        const headers = columns.map((c: any) => c.label);
        const csv = Papa.unparse([headers]);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="${report.name}.csv"`);
        res.send(csv);
      } else if (format === "pdf") {
        const doc = new PDFDocument();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${report.name}.pdf"`);
        doc.pipe(res);
        doc.fontSize(16).text(report.name, { underline: true });
        doc.fontSize(12).text(`Type: ${report.type} | Module: ${report.module}`, { margin: [10, 0] });
        doc.moveDown();
        doc.fontSize(11).text("Columns:");
        columns.forEach((col: any) => {
          doc.text(`  • ${col.label} (${col.type})`);
        });
        doc.end();
      } else if (format === "docx") {
        const docContent = [
          new Paragraph({ text: report.name, bold: true, size: 32 }),
          new Paragraph({ text: `Type: ${report.type} | Module: ${report.module}`, size: 22 }),
          new Paragraph({ text: "Columns:", bold: true, size: 24 }),
          ...columns.map((col: any) => new Paragraph({ text: `${col.label} (${col.type})`, size: 22 })),
        ];
        const doc = new Document({ sections: [{ children: docContent }] });
        const blob = await Packer.toBlob(doc);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", `attachment; filename="${report.name}.docx"`);
        res.send(Buffer.from(await blob.arrayBuffer()));
      } else {
        res.status(400).json({ error: "Invalid format" });
      }
    } catch (error: any) {
      res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, "Export failed", undefined, (req as any).id));
    }
  });

  // ========== CONTACT FORM SUBMISSION ==========
  app.post("/api/contact", async (req, res) => {
    try {
      const validation = insertContactSubmissionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validation.error.errors 
        });
      }

      const submission = validation.data;
      
      // Save to database
      const [saved] = await db.insert(contactSubmissions).values({
        name: submission.name,
        email: submission.email,
        company: submission.company || null,
        subject: submission.subject,
        message: submission.message,
        status: "new",
      }).returning();

      // Send email notification (using environment variable for recipient)
      const recipientEmail = process.env.CONTACT_EMAIL || "mbilaljum@gmail.com";
      
      // Log the contact submission (email sending would require SMTP setup)
      console.log(`[Contact Form] New submission from ${submission.name} (${submission.email})`);
      console.log(`[Contact Form] Subject: ${submission.subject}`);
      console.log(`[Contact Form] Would send to: ${recipientEmail}`);

      res.json({ 
        success: true, 
        message: "Thank you for your message. We'll get back to you soon!",
        id: saved.id 
      });
    } catch (error: any) {
      console.error("[Contact Form] Error:", error);
      res.status(500).json({ error: "Failed to submit contact form" });
    }
  });

  // Get contact submissions (admin only)
  app.get("/api/contact/submissions", isPlatformAuthenticated, async (req, res) => {
    try {
      const submissions = await db.select().from(contactSubmissions).orderBy(contactSubmissions.createdAt);
      res.json(submissions);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  });

  // ========== LEMONSQUEEZY PAYMENT ROUTES ==========
  
  // Initialize LemonSqueezy (if API key is available)
  const initLemonSqueezy = () => {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (apiKey) {
      lemonSqueezySetup({
        apiKey,
        onError: (error) => console.error("[LemonSqueezy] Error:", error),
      });
      return true;
    }
    return false;
  };

  // Create checkout session for sponsorship
  app.post("/api/payments/checkout", async (req, res) => {
    try {
      if (!initLemonSqueezy()) {
        return res.status(503).json({ 
          error: "Payment system not configured",
          message: "LemonSqueezy API key not set. Please configure LEMONSQUEEZY_API_KEY."
        });
      }

      const { amount, email, name } = req.body;
      
      if (!amount || amount < 1) {
        return res.status(400).json({ error: "Invalid amount. Minimum is $1." });
      }

      const storeId = process.env.LEMONSQUEEZY_STORE_ID;
      const variantId = process.env.LEMONSQUEEZY_VARIANT_ID;

      if (!storeId || !variantId) {
        return res.status(503).json({ 
          error: "Payment configuration incomplete",
          message: "LemonSqueezy store/variant IDs not configured."
        });
      }

      const { data, error } = await createCheckout(storeId, variantId, {
        checkoutData: {
          email: email || undefined,
          name: name || undefined,
          custom: {
            amount: amount.toString(),
            type: "sponsorship",
          },
        },
        productOptions: {
          name: `NexusAI Sponsorship - $${amount}`,
          description: "Thank you for supporting NexusAI open source development!",
        },
        checkoutOptions: {
          embed: false,
          media: false,
        },
      });

      if (error) {
        console.error("[LemonSqueezy] Checkout error:", error);
        return res.status(500).json({ error: "Failed to create checkout session" });
      }

      res.json({ 
        success: true, 
        checkoutUrl: data?.data?.attributes?.url,
        checkoutId: data?.data?.id
      });
    } catch (error: any) {
      console.error("[LemonSqueezy] Error:", error);
      res.status(500).json({ error: "Payment processing failed" });
    }
  });

  // Get available products (for displaying pricing)
  app.get("/api/payments/products", async (req, res) => {
    try {
      if (!initLemonSqueezy()) {
        return res.json({ 
          products: [],
          configured: false,
          message: "Payment system not configured"
        });
      }

      const storeId = process.env.LEMONSQUEEZY_STORE_ID;
      if (!storeId) {
        return res.json({ products: [], configured: false });
      }

      const { data, error } = await listProducts({
        filter: { storeId },
        include: ["variants"],
      });

      if (error) {
        console.error("[LemonSqueezy] Products error:", error);
        return res.json({ products: [], configured: true });
      }

      res.json({ 
        products: data?.data || [], 
        configured: true 
      });
    } catch (error: any) {
      console.error("[LemonSqueezy] Error:", error);
      res.json({ products: [], configured: false });
    }
  });

  // Webhook endpoint for LemonSqueezy events
  app.post("/api/payments/webhook", async (req, res) => {
    try {
      const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
      
      if (!webhookSecret) {
        console.warn("[LemonSqueezy] Webhook secret not configured");
        return res.status(500).json({ error: "Webhook not configured" });
      }

      // Verify webhook signature
      const signature = req.headers["x-signature"] as string;
      const rawBody = JSON.stringify(req.body);
      
      const hash = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (hash !== signature) {
        console.warn("[LemonSqueezy] Invalid webhook signature");
        return res.status(401).json({ error: "Invalid signature" });
      }

      const event = req.body;
      const eventName = event?.meta?.event_name;

      console.log(`[LemonSqueezy] Webhook received: ${eventName}`);

      // Handle different event types
      switch (eventName) {
        case "order_created":
          console.log("[LemonSqueezy] New order:", event.data?.id);
          // Process the order - could save to database, send thank you email, etc.
          break;
        case "subscription_created":
          console.log("[LemonSqueezy] New subscription:", event.data?.id);
          break;
        case "subscription_updated":
          console.log("[LemonSqueezy] Subscription updated:", event.data?.id);
          break;
        case "subscription_cancelled":
          console.log("[LemonSqueezy] Subscription cancelled:", event.data?.id);
          break;
        default:
          console.log(`[LemonSqueezy] Unhandled event: ${eventName}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error("[LemonSqueezy] Webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // ========== PARTNERS & TRAINERS ==========
  // Public route - list approved partners/trainers
  app.get("/api/partners/public", async (req, res) => {
    try {
      const { type, tier, search, page = "1", limit = "20" } = req.query;
      const partners = await storage.listPartners({
        type: type as string,
        tier: tier as string,
        isApproved: true,
        search: search as string
      });
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const start = (pageNum - 1) * limitNum;
      const paginated = partners.filter(p => p.isActive).slice(start, start + limitNum);
      res.json({
        partners: paginated,
        total: partners.filter(p => p.isActive).length,
        page: pageNum,
        totalPages: Math.ceil(partners.filter(p => p.isActive).length / limitNum)
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch partners" });
    }
  });

  // Public route - submit partner/trainer application
  app.post("/api/partners/apply", async (req, res) => {
    try {
      const data = req.body;
      const partner = await storage.createPartner({
        ...data,
        isApproved: false,
        isActive: true
      });
      res.status(201).json({ success: true, id: partner.id, message: "Application submitted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  // Admin routes for partner management
  app.get("/api/partners", async (req, res) => {
    try {
      const { type, tier, isApproved, search } = req.query;
      const partners = await storage.listPartners({
        type: type as string,
        tier: tier as string,
        isApproved: isApproved === "true" ? true : isApproved === "false" ? false : undefined,
        search: search as string
      });
      res.json(partners);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch partners" });
    }
  });

  app.get("/api/partners/:id", async (req, res) => {
    const partner = await storage.getPartner(req.params.id);
    if (!partner) return res.status(404).json({ error: "Partner not found" });
    res.json(partner);
  });

  app.post("/api/partners", async (req, res) => {
    try {
      const partner = await storage.createPartner(req.body);
      res.status(201).json(partner);
    } catch (error) {
      res.status(500).json({ error: "Failed to create partner" });
    }
  });

  app.patch("/api/partners/:id", async (req, res) => {
    try {
      const partner = await storage.updatePartner(req.params.id, req.body);
      if (!partner) return res.status(404).json({ error: "Partner not found" });
      res.json(partner);
    } catch (error) {
      res.status(500).json({ error: "Failed to update partner" });
    }
  });

  app.delete("/api/partners/:id", async (req, res) => {
    try {
      const success = await storage.deletePartner(req.params.id);
      if (!success) return res.status(404).json({ error: "Partner not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete partner" });
    }
  });

  // Check payment system status
  app.get("/api/payments/status", async (req, res) => {
    try {
      const hasApiKey = !!process.env.LEMONSQUEEZY_API_KEY;
      const hasStoreId = !!process.env.LEMONSQUEEZY_STORE_ID;
      const hasVariantId = !!process.env.LEMONSQUEEZY_VARIANT_ID;
      
      if (!hasApiKey) {
        return res.json({ 
          configured: false, 
          provider: "lemonsqueezy",
          message: "Payment system not configured" 
        });
      }

      // Test API connection
      initLemonSqueezy();
      const { data, error } = await getAuthenticatedUser();
      
      res.json({
        configured: hasApiKey && hasStoreId && hasVariantId,
        provider: "lemonsqueezy",
        connected: !error,
        user: data?.data?.attributes?.name || null,
      });
    } catch (error: any) {
      res.json({ configured: false, provider: "lemonsqueezy" });
    }
  });

  // ========== MARKETPLACE API ROUTES ==========

  // 1. GET /api/marketplace/categories - List all active categories
  app.get("/api/marketplace/categories", async (req, res) => {
    try {
      const categories = await db.select().from(marketplaceCategories)
        .where(eq(marketplaceCategories.isActive, true))
        .orderBy(marketplaceCategories.sortOrder);
      res.json(categories);
    } catch (error: any) {
      console.error("Error fetching marketplace categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // 2. GET /api/marketplace/apps - List approved apps with filters
  app.get("/api/marketplace/apps", async (req, res) => {
    try {
      const { category, search, pricing } = req.query;
      let query = db.select().from(marketplaceApps)
        .where(eq(marketplaceApps.status, "approved"));
      
      const apps = await query.orderBy(desc(marketplaceApps.totalInstalls));
      
      let filteredApps = apps;
      if (category) {
        filteredApps = filteredApps.filter(app => app.categoryId === category);
      }
      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredApps = filteredApps.filter(app => 
          app.name.toLowerCase().includes(searchLower) ||
          (app.shortDescription && app.shortDescription.toLowerCase().includes(searchLower))
        );
      }
      if (pricing) {
        filteredApps = filteredApps.filter(app => app.pricingModel === pricing);
      }
      
      res.json(filteredApps);
    } catch (error: any) {
      console.error("Error fetching marketplace apps:", error);
      res.status(500).json({ error: "Failed to fetch apps" });
    }
  });

  // 3. GET /api/marketplace/apps/:id - Get single app details
  app.get("/api/marketplace/apps/:id", async (req, res) => {
    try {
      const [app] = await db.select().from(marketplaceApps)
        .where(eq(marketplaceApps.id, req.params.id));
      
      if (!app) {
        return res.status(404).json({ error: "App not found" });
      }
      
      const versions = await db.select().from(marketplaceAppVersions)
        .where(eq(marketplaceAppVersions.appId, req.params.id))
        .orderBy(desc(marketplaceAppVersions.createdAt));
      
      const [developer] = await db.select().from(marketplaceDevelopers)
        .where(eq(marketplaceDevelopers.id, app.developerId));
      
      res.json({ ...app, versions, developer });
    } catch (error: any) {
      console.error("Error fetching app details:", error);
      res.status(500).json({ error: "Failed to fetch app details" });
    }
  });

  // 4. POST /api/marketplace/developers/register - Register as developer
  app.post("/api/marketplace/developers/register", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const existingDeveloper = await db.select().from(marketplaceDevelopers)
        .where(eq(marketplaceDevelopers.userId, userId));
      
      if (existingDeveloper.length > 0) {
        return res.status(400).json({ error: "Developer profile already exists" });
      }

      const parsed = insertMarketplaceDeveloperSchema.safeParse({ ...req.body, userId });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors.map(e => e.message).join(", ") });
      }

      const [developer] = await db.insert(marketplaceDevelopers)
        .values(parsed.data)
        .returning();
      
      res.status(201).json(developer);
    } catch (error: any) {
      console.error("Error registering developer:", error);
      res.status(500).json({ error: "Failed to register as developer" });
    }
  });

  // 5. GET /api/marketplace/my-developer - Get current user's developer profile
  app.get("/api/marketplace/my-developer", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const [developer] = await db.select().from(marketplaceDevelopers)
        .where(eq(marketplaceDevelopers.userId, userId));
      
      if (!developer) {
        return res.status(404).json({ error: "Developer profile not found" });
      }
      
      res.json(developer);
    } catch (error: any) {
      console.error("Error fetching developer profile:", error);
      res.status(500).json({ error: "Failed to fetch developer profile" });
    }
  });

  // 6. POST /api/marketplace/apps - Create new app (developer only)
  app.post("/api/marketplace/apps", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const [developer] = await db.select().from(marketplaceDevelopers)
        .where(eq(marketplaceDevelopers.userId, userId));
      
      if (!developer) {
        return res.status(403).json({ error: "Must be a registered developer to create apps" });
      }

      const parsed = insertMarketplaceAppSchema.safeParse({ ...req.body, developerId: developer.id });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors.map(e => e.message).join(", ") });
      }

      const [app] = await db.insert(marketplaceApps)
        .values(parsed.data)
        .returning();
      
      res.status(201).json(app);
    } catch (error: any) {
      console.error("Error creating app:", error);
      res.status(500).json({ error: "Failed to create app" });
    }
  });

  // 7. PUT /api/marketplace/apps/:id - Update app (developer only)
  app.put("/api/marketplace/apps/:id", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const [developer] = await db.select().from(marketplaceDevelopers)
        .where(eq(marketplaceDevelopers.userId, userId));
      
      if (!developer) {
        return res.status(403).json({ error: "Must be a registered developer" });
      }

      const [existingApp] = await db.select().from(marketplaceApps)
        .where(eq(marketplaceApps.id, req.params.id));
      
      if (!existingApp) {
        return res.status(404).json({ error: "App not found" });
      }
      
      if (existingApp.developerId !== developer.id) {
        return res.status(403).json({ error: "Not authorized to update this app" });
      }

      const [updatedApp] = await db.update(marketplaceApps)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(marketplaceApps.id, req.params.id))
        .returning();
      
      res.json(updatedApp);
    } catch (error: any) {
      console.error("Error updating app:", error);
      res.status(500).json({ error: "Failed to update app" });
    }
  });

  // 8. POST /api/marketplace/apps/:id/submit - Submit app for review
  app.post("/api/marketplace/apps/:id/submit", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const [developer] = await db.select().from(marketplaceDevelopers)
        .where(eq(marketplaceDevelopers.userId, userId));
      
      if (!developer) {
        return res.status(403).json({ error: "Must be a registered developer" });
      }

      const [app] = await db.select().from(marketplaceApps)
        .where(eq(marketplaceApps.id, req.params.id));
      
      if (!app) {
        return res.status(404).json({ error: "App not found" });
      }
      
      if (app.developerId !== developer.id) {
        return res.status(403).json({ error: "Not authorized to submit this app" });
      }

      const [updatedApp] = await db.update(marketplaceApps)
        .set({ status: "submitted", updatedAt: new Date() })
        .where(eq(marketplaceApps.id, req.params.id))
        .returning();
      
      res.json(updatedApp);
    } catch (error: any) {
      console.error("Error submitting app:", error);
      res.status(500).json({ error: "Failed to submit app for review" });
    }
  });

  // 9. POST /api/marketplace/apps/:id/approve - Approve app (admin only)
  app.post("/api/marketplace/apps/:id/approve", enforceRBAC("admin"), async (req: any, res) => {
    try {
      const [app] = await db.select().from(marketplaceApps)
        .where(eq(marketplaceApps.id, req.params.id));
      
      if (!app) {
        return res.status(404).json({ error: "App not found" });
      }

      const [updatedApp] = await db.update(marketplaceApps)
        .set({ status: "approved", publishedAt: new Date(), updatedAt: new Date() })
        .where(eq(marketplaceApps.id, req.params.id))
        .returning();
      
      res.json(updatedApp);
    } catch (error: any) {
      console.error("Error approving app:", error);
      res.status(500).json({ error: "Failed to approve app" });
    }
  });

  // 10. POST /api/marketplace/apps/:id/reject - Reject app (admin only)
  app.post("/api/marketplace/apps/:id/reject", enforceRBAC("admin"), async (req: any, res) => {
    try {
      const { reason } = req.body;
      
      const [app] = await db.select().from(marketplaceApps)
        .where(eq(marketplaceApps.id, req.params.id));
      
      if (!app) {
        return res.status(404).json({ error: "App not found" });
      }

      const [updatedApp] = await db.update(marketplaceApps)
        .set({ status: "rejected", rejectionReason: reason, updatedAt: new Date() })
        .where(eq(marketplaceApps.id, req.params.id))
        .returning();
      
      res.json(updatedApp);
    } catch (error: any) {
      console.error("Error rejecting app:", error);
      res.status(500).json({ error: "Failed to reject app" });
    }
  });

  // 11. POST /api/marketplace/apps/:id/install - Install app for tenant
  app.post("/api/marketplace/apps/:id/install", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      const tenantId = req.tenantId || req.headers["x-tenant-id"] || "default";
      
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const [app] = await db.select().from(marketplaceApps)
        .where(eq(marketplaceApps.id, req.params.id));
      
      if (!app || app.status !== "approved") {
        return res.status(404).json({ error: "App not found or not available" });
      }

      const existingInstall = await db.select().from(marketplaceInstallations)
        .where(and(
          eq(marketplaceInstallations.appId, req.params.id),
          eq(marketplaceInstallations.tenantId, tenantId),
          eq(marketplaceInstallations.status, "active")
        ));
      
      if (existingInstall.length > 0) {
        return res.status(400).json({ error: "App is already installed" });
      }

      const [installation] = await db.insert(marketplaceInstallations)
        .values({
          appId: req.params.id,
          tenantId,
          installedBy: userId,
          status: "active",
        })
        .returning();
      
      await db.update(marketplaceApps)
        .set({ totalInstalls: (app.totalInstalls || 0) + 1 })
        .where(eq(marketplaceApps.id, req.params.id));
      
      res.status(201).json(installation);
    } catch (error: any) {
      console.error("Error installing app:", error);
      res.status(500).json({ error: "Failed to install app" });
    }
  });

  // 12. DELETE /api/marketplace/apps/:id/uninstall - Uninstall app
  app.delete("/api/marketplace/apps/:id/uninstall", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const tenantId = req.tenantId || req.headers["x-tenant-id"] || "default";
      
      const installations = await db.select().from(marketplaceInstallations)
        .where(and(
          eq(marketplaceInstallations.appId, req.params.id),
          eq(marketplaceInstallations.tenantId, tenantId),
          eq(marketplaceInstallations.status, "active")
        ));
      
      if (installations.length === 0) {
        return res.status(404).json({ error: "Installation not found" });
      }

      await db.update(marketplaceInstallations)
        .set({ status: "uninstalled", uninstalledAt: new Date(), updatedAt: new Date() })
        .where(eq(marketplaceInstallations.id, installations[0].id));
      
      res.json({ success: true, message: "App uninstalled successfully" });
    } catch (error: any) {
      console.error("Error uninstalling app:", error);
      res.status(500).json({ error: "Failed to uninstall app" });
    }
  });

  // 13. GET /api/marketplace/my-apps - Developer's apps
  app.get("/api/marketplace/my-apps", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const [developer] = await db.select().from(marketplaceDevelopers)
        .where(eq(marketplaceDevelopers.userId, userId));
      
      if (!developer) {
        return res.status(404).json({ error: "Developer profile not found" });
      }

      const apps = await db.select().from(marketplaceApps)
        .where(eq(marketplaceApps.developerId, developer.id))
        .orderBy(desc(marketplaceApps.createdAt));
      
      res.json(apps);
    } catch (error: any) {
      console.error("Error fetching developer apps:", error);
      res.status(500).json({ error: "Failed to fetch apps" });
    }
  });

  // 14. GET /api/marketplace/my-installs - Tenant's installed apps
  app.get("/api/marketplace/my-installs", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const tenantId = req.tenantId || req.headers["x-tenant-id"] || "default";
      
      // Return all installations (active, pending, suspended) for frontend filtering
      const installations = await db.select().from(marketplaceInstallations)
        .where(eq(marketplaceInstallations.tenantId, tenantId))
        .orderBy(desc(marketplaceInstallations.installedAt));
      
      const appIds = installations.map(i => i.appId);
      const apps = appIds.length > 0 
        ? await db.select().from(marketplaceApps).where(sql`${marketplaceApps.id} = ANY(${appIds})`)
        : [];
      
      const result = installations.map(install => ({
        ...install,
        app: apps.find(a => a.id === install.appId)
      }));
      
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching installed apps:", error);
      res.status(500).json({ error: "Failed to fetch installed apps" });
    }
  });

  // 15. GET /api/marketplace/apps/:id/reviews - Get app reviews
  app.get("/api/marketplace/apps/:id/reviews", async (req, res) => {
    try {
      const reviews = await db.select().from(marketplaceReviews)
        .where(and(
          eq(marketplaceReviews.appId, req.params.id),
          eq(marketplaceReviews.status, "published")
        ))
        .orderBy(desc(marketplaceReviews.createdAt));
      
      res.json(reviews);
    } catch (error: any) {
      console.error("Error fetching app reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // 16. POST /api/marketplace/apps/:id/reviews - Add review
  app.post("/api/marketplace/apps/:id/reviews", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      const tenantId = req.tenantId || req.headers["x-tenant-id"] || "default";
      
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const existingReview = await db.select().from(marketplaceReviews)
        .where(and(
          eq(marketplaceReviews.appId, req.params.id),
          eq(marketplaceReviews.userId, userId)
        ));
      
      if (existingReview.length > 0) {
        return res.status(400).json({ error: "You have already reviewed this app" });
      }

      const parsed = insertMarketplaceReviewSchema.safeParse({
        ...req.body,
        appId: req.params.id,
        userId,
        tenantId,
      });
      
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors.map(e => e.message).join(", ") });
      }

      const [review] = await db.insert(marketplaceReviews)
        .values(parsed.data)
        .returning();
      
      const allReviews = await db.select().from(marketplaceReviews)
        .where(eq(marketplaceReviews.appId, req.params.id));
      
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      
      await db.update(marketplaceApps)
        .set({ 
          averageRating: avgRating.toFixed(2),
          totalReviews: allReviews.length,
          updatedAt: new Date()
        })
        .where(eq(marketplaceApps.id, req.params.id));
      
      res.status(201).json(review);
    } catch (error: any) {
      console.error("Error creating review:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  // 17. GET /api/marketplace/admin/pending-apps - Apps pending approval (admin)
  app.get("/api/marketplace/admin/pending-apps", enforceRBAC("admin"), async (req: any, res) => {
    try {
      const apps = await db.select().from(marketplaceApps)
        .where(eq(marketplaceApps.status, "submitted"))
        .orderBy(marketplaceApps.createdAt);
      
      res.json(apps);
    } catch (error: any) {
      console.error("Error fetching pending apps:", error);
      res.status(500).json({ error: "Failed to fetch pending apps" });
    }
  });

  // 18. GET /api/marketplace/commission-settings - Get commission settings (admin)
  app.get("/api/marketplace/commission-settings", enforceRBAC("admin"), async (req: any, res) => {
    try {
      const settings = await db.select().from(marketplaceCommissionSettings)
        .where(eq(marketplaceCommissionSettings.isActive, true))
        .orderBy(marketplaceCommissionSettings.createdAt);
      
      res.json(settings);
    } catch (error: any) {
      console.error("Error fetching commission settings:", error);
      res.status(500).json({ error: "Failed to fetch commission settings" });
    }
  });

  // 19. PUT /api/marketplace/commission-settings/:id - Update commission (admin)
  app.put("/api/marketplace/commission-settings/:id", enforceRBAC("admin"), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId || "system";
      const [existing] = await db.select().from(marketplaceCommissionSettings)
        .where(eq(marketplaceCommissionSettings.id, req.params.id));
      
      if (!existing) {
        return res.status(404).json({ error: "Commission setting not found" });
      }

      const [updated] = await db.update(marketplaceCommissionSettings)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(marketplaceCommissionSettings.id, req.params.id))
        .returning();
      
      // Audit log for commission change
      await db.insert(marketplaceAuditLogs).values({
        entityType: "commission",
        entityId: req.params.id,
        action: "commission_changed",
        actorId: userId,
        actorRole: "admin",
        previousState: existing,
        newState: updated,
        metadata: { changedFields: Object.keys(req.body) },
      });
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating commission setting:", error);
      res.status(500).json({ error: "Failed to update commission setting" });
    }
  });

  // ============ AUDIT LOGS API ============
  
  // 20. GET /api/marketplace/audit-logs - Get audit logs (admin)
  app.get("/api/marketplace/audit-logs", enforceRBAC("admin"), async (req: any, res) => {
    try {
      const { entityType, entityId, action, limit = 100, offset = 0 } = req.query;
      
      let query = db.select().from(marketplaceAuditLogs);
      const conditions = [];
      
      if (entityType) conditions.push(eq(marketplaceAuditLogs.entityType, entityType as string));
      if (entityId) conditions.push(eq(marketplaceAuditLogs.entityId, entityId as string));
      if (action) conditions.push(eq(marketplaceAuditLogs.action, action as string));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      const logs = await query
        .orderBy(desc(marketplaceAuditLogs.createdAt))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));
      
      res.json(logs);
    } catch (error: any) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  // ============ LICENSE MANAGEMENT API ============

  // 21. POST /api/marketplace/licenses - Issue a new license
  app.post("/api/marketplace/licenses", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      const tenantId = req.tenantId || req.headers["x-tenant-id"] || "default";
      
      const { appId, appVersionId, licenseType, seats, validUntil, transactionId } = req.body;
      
      // Generate unique license key
      const licenseKey = `LIC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const validFrom = new Date();
      let gracePeriodEnd = null;
      if (validUntil) {
        const graceDate = new Date(validUntil);
        graceDate.setDate(graceDate.getDate() + 7); // 7 day grace period
        gracePeriodEnd = graceDate;
      }
      
      const [license] = await db.insert(marketplaceLicenses).values({
        appId,
        appVersionId,
        tenantId,
        userId,
        transactionId,
        licenseKey,
        licenseType,
        seats: seats || 0,
        validFrom,
        validUntil: validUntil ? new Date(validUntil) : null,
        gracePeriodDays: 7,
        gracePeriodEnd,
        status: "active",
      }).returning();
      
      // Audit log
      await db.insert(marketplaceAuditLogs).values({
        entityType: "license",
        entityId: license.id,
        action: "license_issued",
        actorId: userId,
        actorRole: "tenant_admin",
        newState: license,
        metadata: { appId, licenseType },
      });
      
      res.status(201).json(license);
    } catch (error: any) {
      console.error("Error issuing license:", error);
      res.status(500).json({ error: "Failed to issue license" });
    }
  });

  // 22. GET /api/marketplace/licenses - Get licenses for tenant
  app.get("/api/marketplace/licenses", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const tenantId = req.tenantId || req.headers["x-tenant-id"] || "default";
      
      const licenses = await db.select().from(marketplaceLicenses)
        .where(eq(marketplaceLicenses.tenantId, tenantId))
        .orderBy(desc(marketplaceLicenses.createdAt));
      
      res.json(licenses);
    } catch (error: any) {
      console.error("Error fetching licenses:", error);
      res.status(500).json({ error: "Failed to fetch licenses" });
    }
  });

  // 23. GET /api/marketplace/licenses/:id/validate - Validate a license
  app.get("/api/marketplace/licenses/:id/validate", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const [license] = await db.select().from(marketplaceLicenses)
        .where(eq(marketplaceLicenses.id, req.params.id));
      
      if (!license) {
        return res.status(404).json({ valid: false, error: "License not found" });
      }
      
      const now = new Date();
      let isValid = license.status === "active";
      let inGracePeriod = false;
      let reason = "";
      
      // Check expiry
      if (license.validUntil && now > license.validUntil) {
        if (license.gracePeriodEnd && now <= license.gracePeriodEnd) {
          inGracePeriod = true;
          reason = "License expired but within grace period";
        } else {
          isValid = false;
          reason = "License expired";
          
          // Auto-expire the license
          await db.update(marketplaceLicenses)
            .set({ status: "expired", updatedAt: now })
            .where(eq(marketplaceLicenses.id, license.id));
        }
      }
      
      // Update last validated
      await db.update(marketplaceLicenses)
        .set({ lastValidatedAt: now })
        .where(eq(marketplaceLicenses.id, license.id));
      
      res.json({
        valid: isValid,
        inGracePeriod,
        reason,
        license: { ...license, lastValidatedAt: now },
      });
    } catch (error: any) {
      console.error("Error validating license:", error);
      res.status(500).json({ error: "Failed to validate license" });
    }
  });

  // 24. PUT /api/marketplace/licenses/:id/suspend - Suspend a license (admin)
  app.put("/api/marketplace/licenses/:id/suspend", enforceRBAC("admin"), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId || "system";
      
      const [existing] = await db.select().from(marketplaceLicenses)
        .where(eq(marketplaceLicenses.id, req.params.id));
      
      if (!existing) {
        return res.status(404).json({ error: "License not found" });
      }
      
      const [updated] = await db.update(marketplaceLicenses)
        .set({ status: "suspended", updatedAt: new Date() })
        .where(eq(marketplaceLicenses.id, req.params.id))
        .returning();
      
      // Audit log
      await db.insert(marketplaceAuditLogs).values({
        entityType: "license",
        entityId: req.params.id,
        action: "license_suspended",
        actorId: userId,
        actorRole: "admin",
        previousState: existing,
        newState: updated,
        metadata: { reason: req.body.reason },
      });
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error suspending license:", error);
      res.status(500).json({ error: "Failed to suspend license" });
    }
  });

  // ============ PAYOUT WORKFLOW API ============

  // 25. GET /api/marketplace/payouts - Get payouts (developer sees own, admin sees all)
  app.get("/api/marketplace/payouts", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      const isAdmin = req.user?.role === "admin" || req.headers["x-user-role"] === "admin";
      
      let query;
      if (isAdmin) {
        // Admin sees all payouts
        query = db.select().from(marketplacePayouts)
          .orderBy(desc(marketplacePayouts.createdAt));
      } else {
        // Developer sees their own payouts
        const [developer] = await db.select().from(marketplaceDevelopers)
          .where(eq(marketplaceDevelopers.userId, userId));
        
        if (!developer) {
          return res.json([]);
        }
        
        query = db.select().from(marketplacePayouts)
          .where(eq(marketplacePayouts.developerId, developer.id))
          .orderBy(desc(marketplacePayouts.createdAt));
      }
      
      const payouts = await query;
      res.json(payouts);
    } catch (error: any) {
      console.error("Error fetching payouts:", error);
      res.status(500).json({ error: "Failed to fetch payouts" });
    }
  });

  // 26. POST /api/marketplace/payouts/generate - Generate pending payouts for all developers (admin)
  app.post("/api/marketplace/payouts/generate", enforceRBAC("admin"), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId || "system";
      const { periodStart, periodEnd } = req.body;
      
      if (!periodStart || !periodEnd) {
        return res.status(400).json({ error: "Period start and end dates are required" });
      }
      
      // Get all developers with completed transactions in the period
      const transactions = await db.select().from(marketplaceTransactions)
        .where(and(
          eq(marketplaceTransactions.status, "completed"),
          sql`${marketplaceTransactions.createdAt} >= ${new Date(periodStart)}`,
          sql`${marketplaceTransactions.createdAt} <= ${new Date(periodEnd)}`
        ));
      
      // Group by developer
      const developerTotals: Record<string, { amount: number; count: number }> = {};
      for (const tx of transactions) {
        if (!developerTotals[tx.developerId]) {
          developerTotals[tx.developerId] = { amount: 0, count: 0 };
        }
        developerTotals[tx.developerId].amount += parseFloat(tx.developerRevenue);
        developerTotals[tx.developerId].count += 1;
      }
      
      const createdPayouts = [];
      for (const [developerId, { amount, count }] of Object.entries(developerTotals)) {
        if (amount <= 0) continue;
        
        const [payout] = await db.insert(marketplacePayouts).values({
          developerId,
          amount: amount.toFixed(2),
          currency: "USD",
          periodStart: new Date(periodStart),
          periodEnd: new Date(periodEnd),
          status: "pending",
          transactionCount: count,
        }).returning();
        
        createdPayouts.push(payout);
        
        // Audit log
        await db.insert(marketplaceAuditLogs).values({
          entityType: "payout",
          entityId: payout.id,
          action: "payout_generated",
          actorId: userId,
          actorRole: "admin",
          newState: payout,
          metadata: { periodStart, periodEnd, transactionCount: count },
        });
      }
      
      res.json({ message: `Generated ${createdPayouts.length} payouts`, payouts: createdPayouts });
    } catch (error: any) {
      console.error("Error generating payouts:", error);
      res.status(500).json({ error: "Failed to generate payouts" });
    }
  });

  // 27. PUT /api/marketplace/payouts/:id/process - Mark payout as processing (admin)
  app.put("/api/marketplace/payouts/:id/process", enforceRBAC("admin"), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId || "system";
      
      const [existing] = await db.select().from(marketplacePayouts)
        .where(eq(marketplacePayouts.id, req.params.id));
      
      if (!existing) {
        return res.status(404).json({ error: "Payout not found" });
      }
      
      if (existing.status !== "pending") {
        return res.status(400).json({ error: "Payout must be in pending status to process" });
      }
      
      const [updated] = await db.update(marketplacePayouts)
        .set({ status: "processing" })
        .where(eq(marketplacePayouts.id, req.params.id))
        .returning();
      
      // Audit log
      await db.insert(marketplaceAuditLogs).values({
        entityType: "payout",
        entityId: req.params.id,
        action: "payout_processing",
        actorId: userId,
        actorRole: "admin",
        previousState: existing,
        newState: updated,
      });
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error processing payout:", error);
      res.status(500).json({ error: "Failed to process payout" });
    }
  });

  // 28. PUT /api/marketplace/payouts/:id/complete - Mark payout as paid (admin)
  app.put("/api/marketplace/payouts/:id/complete", enforceRBAC("admin"), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId || "system";
      const { paymentReference, paymentMethod } = req.body;
      
      const [existing] = await db.select().from(marketplacePayouts)
        .where(eq(marketplacePayouts.id, req.params.id));
      
      if (!existing) {
        return res.status(404).json({ error: "Payout not found" });
      }
      
      if (existing.status !== "processing") {
        return res.status(400).json({ error: "Payout must be in processing status to complete" });
      }
      
      const [updated] = await db.update(marketplacePayouts)
        .set({ 
          status: "paid", 
          paidAt: new Date(),
          paymentReference,
          paymentMethod,
        })
        .where(eq(marketplacePayouts.id, req.params.id))
        .returning();
      
      // Update developer's total payouts
      await db.update(marketplaceDevelopers)
        .set({ 
          totalPayouts: sql`${marketplaceDevelopers.totalPayouts} + ${existing.amount}`,
          updatedAt: new Date(),
        })
        .where(eq(marketplaceDevelopers.id, existing.developerId));
      
      // Audit log
      await db.insert(marketplaceAuditLogs).values({
        entityType: "payout",
        entityId: req.params.id,
        action: "payout_completed",
        actorId: userId,
        actorRole: "admin",
        previousState: existing,
        newState: updated,
        metadata: { paymentReference, paymentMethod },
      });
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error completing payout:", error);
      res.status(500).json({ error: "Failed to complete payout" });
    }
  });

  // 29. PUT /api/marketplace/payouts/:id/fail - Mark payout as failed (admin)
  app.put("/api/marketplace/payouts/:id/fail", enforceRBAC("admin"), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId || "system";
      const { reason } = req.body;
      
      const [existing] = await db.select().from(marketplacePayouts)
        .where(eq(marketplacePayouts.id, req.params.id));
      
      if (!existing) {
        return res.status(404).json({ error: "Payout not found" });
      }
      
      const [updated] = await db.update(marketplacePayouts)
        .set({ status: "failed", notes: reason })
        .where(eq(marketplacePayouts.id, req.params.id))
        .returning();
      
      // Audit log
      await db.insert(marketplaceAuditLogs).values({
        entityType: "payout",
        entityId: req.params.id,
        action: "payout_failed",
        actorId: userId,
        actorRole: "admin",
        previousState: existing,
        newState: updated,
        metadata: { reason },
      });
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error failing payout:", error);
      res.status(500).json({ error: "Failed to update payout" });
    }
  });

  // 30. GET /api/marketplace/developer/earnings - Developer earnings summary
  app.get("/api/marketplace/developer/earnings", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      
      const [developer] = await db.select().from(marketplaceDevelopers)
        .where(eq(marketplaceDevelopers.userId, userId));
      
      if (!developer) {
        return res.status(404).json({ error: "Developer profile not found" });
      }
      
      // Get all transactions for this developer
      const transactions = await db.select().from(marketplaceTransactions)
        .where(and(
          eq(marketplaceTransactions.developerId, developer.id),
          eq(marketplaceTransactions.status, "completed")
        ));
      
      // Get all payouts for this developer
      const payouts = await db.select().from(marketplacePayouts)
        .where(eq(marketplacePayouts.developerId, developer.id));
      
      const totalEarnings = transactions.reduce((sum, tx) => sum + parseFloat(tx.developerRevenue), 0);
      const totalPaid = payouts
        .filter(p => p.status === "paid")
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const pendingPayout = payouts
        .filter(p => p.status === "pending" || p.status === "processing")
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      // Calculate unpaid balance (earnings not yet in a payout)
      const totalInPayouts = payouts.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const unpaidBalance = totalEarnings - totalInPayouts;
      
      res.json({
        developerId: developer.id,
        totalEarnings: totalEarnings.toFixed(2),
        totalPaid: totalPaid.toFixed(2),
        pendingPayout: pendingPayout.toFixed(2),
        unpaidBalance: unpaidBalance.toFixed(2),
        transactionCount: transactions.length,
        payoutCount: payouts.filter(p => p.status === "paid").length,
      });
    } catch (error: any) {
      console.error("Error fetching developer earnings:", error);
      res.status(500).json({ error: "Failed to fetch earnings" });
    }
  });

  // 30b. GET /api/marketplace/developer/payouts - Developer's own payouts only
  app.get("/api/marketplace/developer/payouts", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      
      const [developer] = await db.select().from(marketplaceDevelopers)
        .where(eq(marketplaceDevelopers.userId, userId));
      
      if (!developer) {
        return res.json([]);
      }
      
      const payouts = await db.select().from(marketplacePayouts)
        .where(eq(marketplacePayouts.developerId, developer.id))
        .orderBy(desc(marketplacePayouts.createdAt));
      
      res.json(payouts);
    } catch (error: any) {
      console.error("Error fetching developer payouts:", error);
      res.status(500).json({ error: "Failed to fetch payouts" });
    }
  });

  // ============ APP DEPENDENCIES API ============

  // 31. GET /api/marketplace/apps/:id/dependencies - Get app dependencies
  app.get("/api/marketplace/apps/:id/dependencies", async (req, res) => {
    try {
      const dependencies = await db.select().from(marketplaceAppDependencies)
        .where(eq(marketplaceAppDependencies.appId, req.params.id));
      
      // Get the dependency app details
      const depAppIds = dependencies.map(d => d.dependsOnAppId);
      const depApps = depAppIds.length > 0
        ? await db.select().from(marketplaceApps).where(sql`${marketplaceApps.id} = ANY(${depAppIds})`)
        : [];
      
      const result = dependencies.map(dep => ({
        ...dep,
        dependsOnApp: depApps.find(a => a.id === dep.dependsOnAppId),
      }));
      
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching dependencies:", error);
      res.status(500).json({ error: "Failed to fetch dependencies" });
    }
  });

  // 32. POST /api/marketplace/apps/:id/dependencies - Add dependency (developer)
  app.post("/api/marketplace/apps/:id/dependencies", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const { dependsOnAppId, minVersion, maxVersion, isRequired } = req.body;
      
      // Check for circular dependencies
      if (dependsOnAppId === req.params.id) {
        return res.status(400).json({ error: "App cannot depend on itself" });
      }
      
      const [dependency] = await db.insert(marketplaceAppDependencies).values({
        appId: req.params.id,
        dependsOnAppId,
        minVersion,
        maxVersion,
        isRequired: isRequired ?? true,
      }).returning();
      
      res.status(201).json(dependency);
    } catch (error: any) {
      console.error("Error adding dependency:", error);
      res.status(500).json({ error: "Failed to add dependency" });
    }
  });

  // 33. POST /api/marketplace/apps/:id/check-dependencies - Check if dependencies are satisfied for install
  app.post("/api/marketplace/apps/:id/check-dependencies", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const tenantId = req.tenantId || req.headers["x-tenant-id"] || "default";
      
      // Get app dependencies
      const dependencies = await db.select().from(marketplaceAppDependencies)
        .where(and(
          eq(marketplaceAppDependencies.appId, req.params.id),
          eq(marketplaceAppDependencies.isRequired, true)
        ));
      
      if (dependencies.length === 0) {
        return res.json({ satisfied: true, missing: [] });
      }
      
      // Get tenant's installed apps
      const installations = await db.select().from(marketplaceInstallations)
        .where(and(
          eq(marketplaceInstallations.tenantId, tenantId),
          eq(marketplaceInstallations.status, "active")
        ));
      
      const installedAppIds = installations.map(i => i.appId);
      
      // Check which dependencies are missing
      const missing = [];
      for (const dep of dependencies) {
        if (!installedAppIds.includes(dep.dependsOnAppId)) {
          const [depApp] = await db.select().from(marketplaceApps)
            .where(eq(marketplaceApps.id, dep.dependsOnAppId));
          missing.push({
            dependencyId: dep.id,
            appId: dep.dependsOnAppId,
            appName: depApp?.name || "Unknown",
            minVersion: dep.minVersion,
          });
        }
      }
      
      res.json({
        satisfied: missing.length === 0,
        missing,
      });
    } catch (error: any) {
      console.error("Error checking dependencies:", error);
      res.status(500).json({ error: "Failed to check dependencies" });
    }
  });

  // 34. POST /api/marketplace/apps/:id/archive - Archive an app version (admin)
  app.post("/api/marketplace/apps/:id/archive", enforceRBAC("admin"), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId || "system";
      const { versionId, reason } = req.body;
      
      if (versionId) {
        // Archive specific version
        const [existing] = await db.select().from(marketplaceAppVersions)
          .where(eq(marketplaceAppVersions.id, versionId));
        
        if (!existing) {
          return res.status(404).json({ error: "Version not found" });
        }
        
        const [updated] = await db.update(marketplaceAppVersions)
          .set({ status: "archived" })
          .where(eq(marketplaceAppVersions.id, versionId))
          .returning();
        
        await db.insert(marketplaceAuditLogs).values({
          entityType: "app_version",
          entityId: versionId,
          action: "archived",
          actorId: userId,
          actorRole: "admin",
          previousState: existing,
          newState: updated,
          metadata: { reason },
        });
        
        res.json(updated);
      } else {
        // Archive entire app
        const [existing] = await db.select().from(marketplaceApps)
          .where(eq(marketplaceApps.id, req.params.id));
        
        if (!existing) {
          return res.status(404).json({ error: "App not found" });
        }
        
        const [updated] = await db.update(marketplaceApps)
          .set({ status: "suspended" })
          .where(eq(marketplaceApps.id, req.params.id))
          .returning();
        
        await db.insert(marketplaceAuditLogs).values({
          entityType: "app",
          entityId: req.params.id,
          action: "archived",
          actorId: userId,
          actorRole: "admin",
          previousState: existing,
          newState: updated,
          metadata: { reason },
        });
        
        res.json(updated);
      }
    } catch (error: any) {
      console.error("Error archiving:", error);
      res.status(500).json({ error: "Failed to archive" });
    }
  });

  // ========== MARKETPLACE SEED DATA ==========

  // POST /api/marketplace/seed - Seed marketplace with industry-specific apps
  app.post("/api/marketplace/seed", async (req, res) => {
    try {
      // Get existing categories
      const existingCategories = await db.select().from(marketplaceCategories);
      const categoryMap: Record<string, string> = {};
      existingCategories.forEach(c => {
        categoryMap[c.slug] = c.id;
      });

      // Check if developers already exist
      const existingDevs = await db.select().from(marketplaceDevelopers);
      let developerIds: string[] = [];

      if (existingDevs.length === 0) {
        // Insert developers
        const insertedDevs = await db.insert(marketplaceDevelopers)
          .values(marketplaceDeveloperSeeds)
          .returning();
        developerIds = insertedDevs.map(d => d.id);
      } else {
        developerIds = existingDevs.map(d => d.id);
      }

      // Check if apps already exist and only insert new ones
      const existingApps = await db.select().from(marketplaceApps);
      const existingSlugs = new Set(existingApps.map(app => app.slug));

      // Filter to only new apps
      const newAppSeeds = marketplaceAppSeeds.filter(appSeed => !existingSlugs.has(appSeed.slug));

      if (newAppSeeds.length === 0) {
        return res.json({ 
          message: "All apps already seeded",
          developers: developerIds.length,
          apps: existingApps.length
        });
      }

      // Insert only new apps
      const appsToInsert = newAppSeeds.map(appSeed => ({
        developerId: developerIds[appSeed.developerIndex] || developerIds[0],
        name: appSeed.name,
        slug: appSeed.slug,
        shortDescription: appSeed.shortDescription,
        longDescription: appSeed.longDescription,
        categoryId: categoryMap[appSeed.categorySlug] || null,
        tags: appSeed.tags,
        supportedIndustries: appSeed.supportedIndustries,
        pricingModel: appSeed.pricingModel,
        price: appSeed.pricingModel === "free" ? "0" : undefined,
        subscriptionPriceMonthly: appSeed.subscriptionPriceMonthly,
        subscriptionPriceYearly: appSeed.subscriptionPriceYearly,
        status: appSeed.status,
        publishedAt: new Date(),
        totalInstalls: Math.floor(Math.random() * 1000) + 100,
        averageRating: (3.5 + Math.random() * 1.5).toFixed(2),
        totalReviews: Math.floor(Math.random() * 200) + 10,
      }));

      const insertedApps = await db.insert(marketplaceApps)
        .values(appsToInsert)
        .returning();

      res.json({
        message: `Marketplace seeded successfully with ${insertedApps.length} new apps`,
        developers: developerIds.length,
        existingApps: existingApps.length,
        newApps: insertedApps.length,
        totalApps: existingApps.length + insertedApps.length
      });
    } catch (error: any) {
      console.error("Error seeding marketplace:", error);
      res.status(500).json({ error: "Failed to seed marketplace", details: error.message });
    }
  });

  // ========== INDUSTRY & TENANT MANAGEMENT ==========

  // GET /api/industries - List all industries
  app.get("/api/industries", async (req, res) => {
    try {
      const industriesList = await db.select().from(industriesTable).orderBy(industriesTable.name);
      res.json(industriesList);
    } catch (error: any) {
      console.error("Error fetching industries:", error);
      res.status(500).json({ error: "Failed to fetch industries" });
    }
  });

  // GET /api/industries/:id - Get a specific industry
  app.get("/api/industries/:id", async (req, res) => {
    try {
      const [industry] = await db.select().from(industriesTable)
        .where(eq(industriesTable.id, req.params.id));
      if (!industry) {
        return res.status(404).json({ error: "Industry not found" });
      }
      res.json(industry);
    } catch (error: any) {
      console.error("Error fetching industry:", error);
      res.status(500).json({ error: "Failed to fetch industry" });
    }
  });

  // GET /api/tenants - List all tenants
  app.get("/api/tenants", async (req, res) => {
    try {
      const tenantsList = await db.select().from(tenantsTable).orderBy(tenantsTable.name);
      res.json(tenantsList);
    } catch (error: any) {
      console.error("Error fetching tenants:", error);
      res.status(500).json({ error: "Failed to fetch tenants" });
    }
  });

  // GET /api/tenants/:id - Get a specific tenant
  app.get("/api/tenants/:id", async (req, res) => {
    try {
      const [tenant] = await db.select().from(tenantsTable)
        .where(eq(tenantsTable.id, req.params.id));
      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }
      res.json(tenant);
    } catch (error: any) {
      console.error("Error fetching tenant:", error);
      res.status(500).json({ error: "Failed to fetch tenant" });
    }
  });

  // POST /api/tenants - Create a new tenant
  app.post("/api/tenants", async (req, res) => {
    try {
      const [newTenant] = await db.insert(tenantsTable).values({
        name: req.body.name,
        slug: req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-'),
        description: req.body.description || null,
        logoUrl: req.body.logoUrl || null,
        status: req.body.status || 'active',
        settings: req.body.settings || {},
      }).returning();
      res.status(201).json(newTenant);
    } catch (error: any) {
      console.error("Error creating tenant:", error);
      res.status(500).json({ error: "Failed to create tenant" });
    }
  });

  // GET /api/industry-deployments - List all industry deployments
  app.get("/api/industry-deployments", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string | undefined;
      let query = db.select().from(industryDeploymentsTable);
      if (tenantId) {
        query = query.where(eq(industryDeploymentsTable.tenantId, tenantId)) as any;
      }
      const deployments = await query;
      res.json(deployments);
    } catch (error: any) {
      console.error("Error fetching industry deployments:", error);
      res.status(500).json({ error: "Failed to fetch industry deployments" });
    }
  });

  // GET /api/industry-deployments/:id - Get a specific deployment
  app.get("/api/industry-deployments/:id", async (req, res) => {
    try {
      const [deployment] = await db.select().from(industryDeploymentsTable)
        .where(eq(industryDeploymentsTable.id, req.params.id));
      if (!deployment) {
        return res.status(404).json({ error: "Industry deployment not found" });
      }
      res.json(deployment);
    } catch (error: any) {
      console.error("Error fetching industry deployment:", error);
      res.status(500).json({ error: "Failed to fetch industry deployment" });
    }
  });

  // POST /api/industry-deployments - Create a new industry deployment
  app.post("/api/industry-deployments", async (req, res) => {
    try {
      const [newDeployment] = await db.insert(industryDeploymentsTable).values({
        tenantId: req.body.tenantId,
        industryId: req.body.industryId,
        enabledModules: req.body.enabledModules || [],
        customConfig: req.body.customConfig || {},
        status: req.body.status || 'active',
      }).returning();
      res.status(201).json(newDeployment);
    } catch (error: any) {
      console.error("Error creating industry deployment:", error);
      res.status(500).json({ error: "Failed to create industry deployment" });
    }
  });

  // PATCH /api/industry-deployments/:id - Update an industry deployment
  app.patch("/api/industry-deployments/:id", async (req, res) => {
    try {
      const [existing] = await db.select().from(industryDeploymentsTable)
        .where(eq(industryDeploymentsTable.id, req.params.id));
      if (!existing) {
        return res.status(404).json({ error: "Industry deployment not found" });
      }
      
      const updateData: any = { updatedAt: new Date() };
      if (req.body.enabledModules !== undefined) updateData.enabledModules = req.body.enabledModules;
      if (req.body.customConfig !== undefined) updateData.customConfig = req.body.customConfig;
      if (req.body.status !== undefined) updateData.status = req.body.status;
      
      const [updated] = await db.update(industryDeploymentsTable)
        .set(updateData)
        .where(eq(industryDeploymentsTable.id, req.params.id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating industry deployment:", error);
      res.status(500).json({ error: "Failed to update industry deployment" });
    }
  });

  // DELETE /api/industry-deployments/:id - Delete an industry deployment
  app.delete("/api/industry-deployments/:id", async (req, res) => {
    try {
      const [existing] = await db.select().from(industryDeploymentsTable)
        .where(eq(industryDeploymentsTable.id, req.params.id));
      if (!existing) {
        return res.status(404).json({ error: "Industry deployment not found" });
      }
      await db.delete(industryDeploymentsTable)
        .where(eq(industryDeploymentsTable.id, req.params.id));
      res.json({ success: true, message: "Industry deployment deleted" });
    } catch (error: any) {
      console.error("Error deleting industry deployment:", error);
      res.status(500).json({ error: "Failed to delete industry deployment" });
    }
  });

  // GET /api/tenants/:id/deployments - Get all deployments for a tenant
  app.get("/api/tenants/:id/deployments", async (req, res) => {
    try {
      const deployments = await db.select().from(industryDeploymentsTable)
        .where(eq(industryDeploymentsTable.tenantId, req.params.id));
      res.json(deployments);
    } catch (error: any) {
      console.error("Error fetching tenant deployments:", error);
      res.status(500).json({ error: "Failed to fetch tenant deployments" });
    }
  });

  // ========== DASHBOARD WIDGETS API ==========

  // GET /api/dashboard/widgets - Get user's dashboard widgets
  app.get("/api/dashboard/widgets", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      const widgets = await db.select().from(userDashboardWidgets)
        .where(eq(userDashboardWidgets.userId, userId))
        .orderBy(userDashboardWidgets.position);
      res.json(widgets);
    } catch (error: any) {
      console.error("Error fetching dashboard widgets:", error);
      res.status(500).json({ error: "Failed to fetch widgets" });
    }
  });

  // POST /api/dashboard/widgets - Add a widget to dashboard
  app.post("/api/dashboard/widgets", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      const parsed = insertUserDashboardWidgetSchema.safeParse({ ...req.body, userId });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors.map(e => e.message).join(", ") });
      }

      const [widget] = await db.insert(userDashboardWidgets).values(parsed.data).returning();
      res.status(201).json(widget);
    } catch (error: any) {
      console.error("Error creating dashboard widget:", error);
      res.status(500).json({ error: "Failed to create widget" });
    }
  });

  // PATCH /api/dashboard/widgets/:id - Update a widget
  app.patch("/api/dashboard/widgets/:id", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      const [existing] = await db.select().from(userDashboardWidgets)
        .where(and(eq(userDashboardWidgets.id, req.params.id), eq(userDashboardWidgets.userId, userId)));
      if (!existing) return res.status(404).json({ error: "Widget not found" });

      const updateData: any = { updatedAt: new Date() };
      if (req.body.position !== undefined) updateData.position = req.body.position;
      if (req.body.size !== undefined) updateData.size = req.body.size;
      if (req.body.isVisible !== undefined) updateData.isVisible = req.body.isVisible;
      if (req.body.config !== undefined) updateData.config = req.body.config;

      const [updated] = await db.update(userDashboardWidgets).set(updateData)
        .where(eq(userDashboardWidgets.id, req.params.id)).returning();
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating dashboard widget:", error);
      res.status(500).json({ error: "Failed to update widget" });
    }
  });

  // DELETE /api/dashboard/widgets/:id - Remove a widget
  app.delete("/api/dashboard/widgets/:id", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      const [existing] = await db.select().from(userDashboardWidgets)
        .where(and(eq(userDashboardWidgets.id, req.params.id), eq(userDashboardWidgets.userId, userId)));
      if (!existing) return res.status(404).json({ error: "Widget not found" });

      await db.delete(userDashboardWidgets).where(eq(userDashboardWidgets.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting dashboard widget:", error);
      res.status(500).json({ error: "Failed to delete widget" });
    }
  });

  // PUT /api/dashboard/widgets/reorder - Reorder all widgets
  app.put("/api/dashboard/widgets/reorder", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      const { widgetIds } = req.body;
      if (!Array.isArray(widgetIds)) return res.status(400).json({ error: "widgetIds array required" });

      for (let i = 0; i < widgetIds.length; i++) {
        await db.update(userDashboardWidgets).set({ position: i, updatedAt: new Date() })
          .where(and(eq(userDashboardWidgets.id, widgetIds[i]), eq(userDashboardWidgets.userId, userId)));
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error reordering widgets:", error);
      res.status(500).json({ error: "Failed to reorder widgets" });
    }
  });

  // ========== GAMIFICATION API ==========

  // GET /api/gamification/badges - Get user's badges
  app.get("/api/gamification/badges", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      const badges = await db.select().from(userBadges).where(eq(userBadges.userId, userId));
      res.json(badges);
    } catch (error: any) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ error: "Failed to fetch badges" });
    }
  });

  // GET /api/gamification/leaderboard - Get leaderboard
  app.get("/api/gamification/leaderboard", async (req, res) => {
    try {
      const points = await db.select().from(userActivityPoints);
      const userPoints: Record<string, number> = {};
      for (const p of points) {
        userPoints[p.userId] = (userPoints[p.userId] || 0) + (p.points || 0);
      }
      const leaderboard = Object.entries(userPoints)
        .map(([userId, totalPoints]) => ({ userId, totalPoints }))
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 20);
      res.json(leaderboard);
    } catch (error: any) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // GET /api/gamification/badge-definitions - Get available badges
  app.get("/api/gamification/badge-definitions", async (req, res) => {
    try {
      const badges = await db.select().from(badgeDefinitions).where(eq(badgeDefinitions.isActive, true));
      res.json(badges);
    } catch (error: any) {
      console.error("Error fetching badge definitions:", error);
      res.status(500).json({ error: "Failed to fetch badge definitions" });
    }
  });

  // ========== DEVELOPER SPOTLIGHT API ==========

  // GET /api/developers/spotlight - Get featured developers
  app.get("/api/developers/spotlight", async (req, res) => {
    try {
      const spotlight = await db.select().from(developerSpotlight)
        .orderBy(developerSpotlight.displayOrder);
      const developerIds = spotlight.map(s => s.developerId);
      const developers = developerIds.length > 0 
        ? await db.select().from(marketplaceDevelopers)
        : [];
      const result = spotlight.map(s => ({
        ...s,
        developer: developers.find(d => d.id === s.developerId)
      }));
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching developer spotlight:", error);
      res.status(500).json({ error: "Failed to fetch spotlight" });
    }
  });

  // ========== NOTIFICATIONS API ==========

  // GET /api/notifications - Get user's notifications
  app.get("/api/notifications", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      const notifications = await db.select().from(userNotifications)
        .where(and(eq(userNotifications.userId, userId), eq(userNotifications.isArchived, false)))
        .orderBy(desc(userNotifications.createdAt));
      res.json(notifications);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // PATCH /api/notifications/:id/read - Mark notification as read
  app.patch("/api/notifications/:id/read", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      const [updated] = await db.update(userNotifications)
        .set({ isRead: true, readAt: new Date() })
        .where(and(eq(userNotifications.id, req.params.id), eq(userNotifications.userId, userId)))
        .returning();
      res.json(updated || { success: true });
    } catch (error: any) {
      console.error("Error marking notification read:", error);
      res.status(500).json({ error: "Failed to mark notification read" });
    }
  });

  // POST /api/notifications/mark-all-read - Mark all as read
  app.post("/api/notifications/mark-all-read", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      await db.update(userNotifications)
        .set({ isRead: true, readAt: new Date() })
        .where(and(eq(userNotifications.userId, userId), eq(userNotifications.isRead, false)));
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error marking all notifications read:", error);
      res.status(500).json({ error: "Failed to mark all read" });
    }
  });

  // GET /api/notifications/unread-count - Get unread count
  app.get("/api/notifications/unread-count", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      const notifications = await db.select().from(userNotifications)
        .where(and(eq(userNotifications.userId, userId), eq(userNotifications.isRead, false)));
      res.json({ count: notifications.length });
    } catch (error: any) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ error: "Failed to fetch unread count" });
    }
  });

  // ========== COMMUNITY & REPUTATION API ==========

  // Rate limiting for community actions based on trust level (persisted in DB)
  const getTrustLevelLimits = (trustLevel: number) => {
    const limits: Record<number, { postsPerDay: number; answersPerDay: number }> = {
      0: { postsPerDay: 2, answersPerDay: 3 },      // New
      1: { postsPerDay: 5, answersPerDay: 10 },     // Contributor
      2: { postsPerDay: 10, answersPerDay: 20 },    // Trusted
      3: { postsPerDay: Infinity, answersPerDay: Infinity }, // Leader (truly unlimited)
    };
    return limits[trustLevel] || limits[0];
  };

  const checkRateLimit = async (userId: string, actionType: "post" | "answer") => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Get user's trust level from database (persisted)
    let [trust] = await db.select().from(userTrustLevels).where(eq(userTrustLevels.userId, userId));
    
    // Create trust record if doesn't exist
    if (!trust) {
      const [newTrust] = await db.insert(userTrustLevels).values({
        userId,
        trustLevel: 0,
        totalReputation: 0,
        postsToday: 0,
        answersToday: 0,
        lastResetAt: today,
      }).returning();
      trust = newTrust;
    }
    
    // Reset daily counters if last reset was before today
    const lastReset = trust.lastResetAt ? new Date(trust.lastResetAt) : new Date(0);
    const lastResetDay = new Date(lastReset.getFullYear(), lastReset.getMonth(), lastReset.getDate());
    
    if (lastResetDay.getTime() < today.getTime()) {
      await db.update(userTrustLevels)
        .set({ postsToday: 0, answersToday: 0, lastResetAt: today })
        .where(eq(userTrustLevels.userId, userId));
      trust = { ...trust, postsToday: 0, answersToday: 0, lastResetAt: today };
    }

    const trustLevel = trust.trustLevel || 0;
    const limits = getTrustLevelLimits(trustLevel);

    // Leaders have unlimited access
    if (trustLevel >= 3) {
      return { allowed: true };
    }

    if (actionType === "post") {
      const currentPosts = trust.postsToday || 0;
      if (currentPosts >= limits.postsPerDay) {
        return { allowed: false, message: `Daily post limit reached (${limits.postsPerDay}/day for your trust level). Earn more reputation to increase limits.` };
      }
    } else {
      const currentAnswers = trust.answersToday || 0;
      if (currentAnswers >= limits.answersPerDay) {
        return { allowed: false, message: `Daily answer limit reached (${limits.answersPerDay}/day for your trust level). Earn more reputation to increase limits.` };
      }
    }
    
    return { allowed: true };
  };

  // GET /api/community/spaces - List all community spaces
  app.get("/api/community/spaces", async (req, res) => {
    try {
      const spaces = await db.select().from(communitySpaces)
        .where(eq(communitySpaces.isActive, true))
        .orderBy(communitySpaces.sortOrder);
      res.json(spaces);
    } catch (error: any) {
      console.error("Error fetching community spaces:", error);
      res.status(500).json({ error: "Failed to fetch community spaces" });
    }
  });

  // GET /api/community/spaces/:slug - Get space by slug
  app.get("/api/community/spaces/:slug", async (req, res) => {
    try {
      const [space] = await db.select().from(communitySpaces)
        .where(eq(communitySpaces.slug, req.params.slug));
      if (!space) return res.status(404).json({ error: "Space not found" });
      res.json(space);
    } catch (error: any) {
      console.error("Error fetching community space:", error);
      res.status(500).json({ error: "Failed to fetch community space" });
    }
  });

  // GET /api/community/spaces/:spaceId/posts - List posts in a space
  app.get("/api/community/spaces/:spaceId/posts", async (req, res) => {
    try {
      const posts = await db.select().from(communityPosts)
        .where(eq(communityPosts.spaceId, req.params.spaceId))
        .orderBy(desc(communityPosts.createdAt));
      res.json(posts);
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // GET /api/community/posts - List all posts (with optional spaceId filter)
  app.get("/api/community/posts", async (req, res) => {
    try {
      const spaceId = req.query.spaceId as string;
      let posts;
      if (spaceId) {
        posts = await db.select().from(communityPosts)
          .where(eq(communityPosts.spaceId, spaceId))
          .orderBy(desc(communityPosts.createdAt));
      } else {
        posts = await db.select().from(communityPosts)
          .orderBy(desc(communityPosts.createdAt));
      }
      res.json(posts);
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // GET /api/community/posts/:id - Get single post with comments
  app.get("/api/community/posts/:id", async (req, res) => {
    try {
      const [post] = await db.select().from(communityPosts)
        .where(eq(communityPosts.id, req.params.id));
      if (!post) return res.status(404).json({ error: "Post not found" });

      const comments = await db.select().from(communityComments)
        .where(eq(communityComments.postId, req.params.id))
        .orderBy(communityComments.createdAt);

      // Increment view count
      await db.update(communityPosts)
        .set({ viewCount: (post.viewCount || 0) + 1 })
        .where(eq(communityPosts.id, req.params.id));

      res.json({ ...post, comments });
    } catch (error: any) {
      console.error("Error fetching post:", error);
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  // POST /api/community/posts - Create new post
  app.post("/api/community/posts", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      // Check rate limit
      const rateCheck = await checkRateLimit(userId, "post");
      if (!rateCheck.allowed) {
        return res.status(429).json({ error: rateCheck.message });
      }

      const parseResult = insertCommunityPostSchema.safeParse({ ...req.body, authorId: userId });
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.errors.map(e => e.message).join(", ") });
      }

      const [post] = await db.insert(communityPosts).values(parseResult.data).returning();

      // Award reputation for creating a post (+2 for question/discussion)
      await db.insert(reputationEvents).values({
        userId,
        actionType: "post_created",
        points: 2,
        sourceType: "post",
        sourceId: post.id,
        description: `Created post: ${post.title}`,
      });

      // Update user trust level total reputation
      const [existingTrust] = await db.select().from(userTrustLevels).where(eq(userTrustLevels.userId, userId));
      if (existingTrust) {
        await db.update(userTrustLevels)
          .set({ 
            totalReputation: (existingTrust.totalReputation || 0) + 2,
            postsToday: (existingTrust.postsToday || 0) + 1,
            updatedAt: new Date()
          })
          .where(eq(userTrustLevels.userId, userId));
      } else {
        await db.insert(userTrustLevels).values({
          userId,
          trustLevel: 0,
          totalReputation: 2,
          postsToday: 1,
        });
      }

      res.status(201).json(post);
    } catch (error: any) {
      console.error("Error creating post:", error);
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  // POST /api/community/posts/:id/comments - Add comment to a post
  app.post("/api/community/posts/:id/comments", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      // Check rate limit
      const rateCheck = await checkRateLimit(userId, "answer");
      if (!rateCheck.allowed) {
        return res.status(429).json({ error: rateCheck.message });
      }

      const parseResult = insertCommunityCommentSchema.safeParse({
        ...req.body,
        postId: req.params.id,
        authorId: userId,
      });
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.errors.map(e => e.message).join(", ") });
      }

      const [comment] = await db.insert(communityComments).values(parseResult.data).returning();

      // Update post's answer count
      const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, req.params.id));
      if (post) {
        await db.update(communityPosts)
          .set({ answerCount: (post.answerCount || 0) + 1, updatedAt: new Date() })
          .where(eq(communityPosts.id, req.params.id));
      }

      // Award reputation for answering (+5)
      await db.insert(reputationEvents).values({
        userId,
        actionType: "answer_posted",
        points: 5,
        sourceType: "comment",
        sourceId: comment.id,
        description: "Posted an answer",
      });

      // Update trust level
      const [existingTrust] = await db.select().from(userTrustLevels).where(eq(userTrustLevels.userId, userId));
      if (existingTrust) {
        await db.update(userTrustLevels)
          .set({ 
            totalReputation: (existingTrust.totalReputation || 0) + 5,
            answersToday: (existingTrust.answersToday || 0) + 1,
            updatedAt: new Date()
          })
          .where(eq(userTrustLevels.userId, userId));
      } else {
        await db.insert(userTrustLevels).values({
          userId,
          trustLevel: 0,
          totalReputation: 5,
          answersToday: 1,
        });
      }

      res.status(201).json(comment);
    } catch (error: any) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  // POST /api/community/vote - Upvote/downvote a post or comment
  app.post("/api/community/vote", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      const parseResult = insertCommunityVoteSchema.safeParse({ ...req.body, userId });
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.errors.map(e => e.message).join(", ") });
      }

      const { targetType, targetId, voteType } = parseResult.data;

      // Check for existing vote
      const [existingVote] = await db.select().from(communityVotes)
        .where(and(
          eq(communityVotes.userId, userId),
          eq(communityVotes.targetType, targetType),
          eq(communityVotes.targetId, targetId)
        ));

      if (existingVote) {
        // If same vote type, remove it (toggle off)
        if (existingVote.voteType === voteType) {
          await db.delete(communityVotes).where(eq(communityVotes.id, existingVote.id));
          
          // Update target's vote count
          if (targetType === "post") {
            const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, targetId));
            if (post) {
              const update = voteType === "upvote" 
                ? { upvotes: Math.max(0, (post.upvotes || 0) - 1) }
                : { downvotes: Math.max(0, (post.downvotes || 0) - 1) };
              await db.update(communityPosts).set(update).where(eq(communityPosts.id, targetId));
            }
          } else {
            const [comment] = await db.select().from(communityComments).where(eq(communityComments.id, targetId));
            if (comment) {
              const update = voteType === "upvote"
                ? { upvotes: Math.max(0, (comment.upvotes || 0) - 1) }
                : { downvotes: Math.max(0, (comment.downvotes || 0) - 1) };
              await db.update(communityComments).set(update).where(eq(communityComments.id, targetId));
            }
          }
          return res.json({ action: "removed", voteType });
        }
        
        // Change vote type
        await db.update(communityVotes)
          .set({ voteType })
          .where(eq(communityVotes.id, existingVote.id));
        
        // Update both vote counts on target
        if (targetType === "post") {
          const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, targetId));
          if (post) {
            const update = voteType === "upvote"
              ? { upvotes: (post.upvotes || 0) + 1, downvotes: Math.max(0, (post.downvotes || 0) - 1) }
              : { upvotes: Math.max(0, (post.upvotes || 0) - 1), downvotes: (post.downvotes || 0) + 1 };
            await db.update(communityPosts).set(update).where(eq(communityPosts.id, targetId));
          }
        } else {
          const [comment] = await db.select().from(communityComments).where(eq(communityComments.id, targetId));
          if (comment) {
            const update = voteType === "upvote"
              ? { upvotes: (comment.upvotes || 0) + 1, downvotes: Math.max(0, (comment.downvotes || 0) - 1) }
              : { upvotes: Math.max(0, (comment.upvotes || 0) - 1), downvotes: (comment.downvotes || 0) + 1 };
            await db.update(communityComments).set(update).where(eq(communityComments.id, targetId));
          }
        }
        return res.json({ action: "changed", voteType });
      }

      // Create new vote
      const [vote] = await db.insert(communityVotes).values(parseResult.data).returning();

      // Update target's vote count
      if (targetType === "post") {
        const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, targetId));
        if (post) {
          const update = voteType === "upvote"
            ? { upvotes: (post.upvotes || 0) + 1 }
            : { downvotes: (post.downvotes || 0) + 1 };
          await db.update(communityPosts).set(update).where(eq(communityPosts.id, targetId));

          // Award/deduct reputation for post author
          const repPoints = voteType === "upvote" ? 2 : -5;
          await db.insert(reputationEvents).values({
            userId: post.authorId,
            actionType: voteType === "upvote" ? "post_upvoted" : "post_downvoted",
            points: repPoints,
            sourceType: "post",
            sourceId: targetId,
            description: `Post ${voteType === "upvote" ? "upvoted" : "downvoted"}`,
          });
        }
      } else {
        const [comment] = await db.select().from(communityComments).where(eq(communityComments.id, targetId));
        if (comment) {
          const update = voteType === "upvote"
            ? { upvotes: (comment.upvotes || 0) + 1 }
            : { downvotes: (comment.downvotes || 0) + 1 };
          await db.update(communityComments).set(update).where(eq(communityComments.id, targetId));

          // Award/deduct reputation for comment author
          const repPoints = voteType === "upvote" ? 2 : -5;
          await db.insert(reputationEvents).values({
            userId: comment.authorId,
            actionType: voteType === "upvote" ? "answer_upvoted" : "answer_downvoted",
            points: repPoints,
            sourceType: "comment",
            sourceId: targetId,
            description: `Answer ${voteType === "upvote" ? "upvoted" : "downvoted"}`,
          });
        }
      }

      res.status(201).json({ action: "created", vote });
    } catch (error: any) {
      console.error("Error processing vote:", error);
      res.status(500).json({ error: "Failed to process vote" });
    }
  });

  // POST /api/community/posts/:id/accept-answer - Accept an answer
  app.post("/api/community/posts/:id/accept-answer", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      const { commentId } = req.body;
      if (!commentId) return res.status(400).json({ error: "commentId required" });

      // Verify user owns the post
      const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, req.params.id));
      if (!post) return res.status(404).json({ error: "Post not found" });
      if (post.authorId !== userId) return res.status(403).json({ error: "Only post author can accept answers" });

      // Get the comment
      const [comment] = await db.select().from(communityComments).where(eq(communityComments.id, commentId));
      if (!comment) return res.status(404).json({ error: "Comment not found" });

      // Mark comment as accepted
      await db.update(communityComments)
        .set({ isAccepted: true })
        .where(eq(communityComments.id, commentId));

      // Update post with accepted answer
      await db.update(communityPosts)
        .set({ acceptedAnswerId: commentId })
        .where(eq(communityPosts.id, req.params.id));

      // Award +15 reputation to answer author
      await db.insert(reputationEvents).values({
        userId: comment.authorId,
        actionType: "accepted_answer",
        points: 15,
        sourceType: "comment",
        sourceId: commentId,
        description: "Answer accepted as solution",
      });

      // Update trust level
      const [trust] = await db.select().from(userTrustLevels).where(eq(userTrustLevels.userId, comment.authorId));
      if (trust) {
        await db.update(userTrustLevels)
          .set({ totalReputation: (trust.totalReputation || 0) + 15, updatedAt: new Date() })
          .where(eq(userTrustLevels.userId, comment.authorId));
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error accepting answer:", error);
      res.status(500).json({ error: "Failed to accept answer" });
    }
  });

  // GET /api/community/reputation/:userId - Get user's reputation and stats
  app.get("/api/community/reputation/:userId", async (req, res) => {
    try {
      const [trust] = await db.select().from(userTrustLevels)
        .where(eq(userTrustLevels.userId, req.params.userId));

      const events = await db.select().from(reputationEvents)
        .where(eq(reputationEvents.userId, req.params.userId))
        .orderBy(desc(reputationEvents.createdAt));

      const badges = await db.select().from(communityBadgeProgress)
        .where(eq(communityBadgeProgress.userId, req.params.userId));

      res.json({
        trustLevel: trust || { userId: req.params.userId, trustLevel: 0, totalReputation: 0 },
        recentEvents: events.slice(0, 20),
        badges,
      });
    } catch (error: any) {
      console.error("Error fetching reputation:", error);
      res.status(500).json({ error: "Failed to fetch reputation" });
    }
  });

  // GET /api/community/leaderboard - Get top contributors
  app.get("/api/community/leaderboard", async (req, res) => {
    try {
      const leaders = await db.select().from(userTrustLevels)
        .orderBy(desc(userTrustLevels.totalReputation));
      res.json(leaders.slice(0, 25));
    } catch (error: any) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // ========== PHASE 2: BADGES, PROFILE, AND MODERATION ==========

  // GET /api/community/badges - List all badge definitions
  app.get("/api/community/badges", async (req, res) => {
    try {
      const badges = await db.select().from(badgeDefinitions).orderBy(badgeDefinitions.category);
      res.json(badges);
    } catch (error: any) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ error: "Failed to fetch badges" });
    }
  });

  // GET /api/community/user/:userId/profile - Get user profile with badges, reputation history
  app.get("/api/community/user/:userId/profile", async (req, res) => {
    try {
      const userId = req.params.userId;

      // Get user basic info
      const [user] = await db.select({
        id: users.id,
        name: users.name,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        profileImageUrl: users.profileImageUrl,
        createdAt: users.createdAt,
      }).from(users).where(eq(users.id, userId));

      // Get trust level and reputation
      const [trust] = await db.select().from(userTrustLevels)
        .where(eq(userTrustLevels.userId, userId));

      // Get reputation events history
      const reputationHistory = await db.select().from(reputationEvents)
        .where(eq(reputationEvents.userId, userId))
        .orderBy(desc(reputationEvents.createdAt))
        .limit(50);

      // Get badge progress
      const badgeProgress = await db.select().from(communityBadgeProgress)
        .where(eq(communityBadgeProgress.userId, userId));

      // Get earned badges with definitions
      const earnedBadges = await db.select({
        id: userEarnedBadges.id,
        badgeId: userEarnedBadges.badgeId,
        earnedAt: userEarnedBadges.earnedAt,
        badgeName: badgeDefinitions.name,
        badgeDescription: badgeDefinitions.description,
        badgeIcon: badgeDefinitions.icon,
        badgeCategory: badgeDefinitions.category,
        badgePoints: badgeDefinitions.points,
      }).from(userEarnedBadges)
        .leftJoin(badgeDefinitions, eq(userEarnedBadges.badgeId, badgeDefinitions.id))
        .where(eq(userEarnedBadges.userId, userId))
        .orderBy(desc(userEarnedBadges.earnedAt));

      // Get activity stats (posts, comments count)
      const posts = await db.select().from(communityPosts)
        .where(eq(communityPosts.authorId, userId));
      const comments = await db.select().from(communityComments)
        .where(eq(communityComments.authorId, userId));

      res.json({
        user: user || { id: userId },
        trustLevel: trust || { userId, trustLevel: 0, totalReputation: 0 },
        reputationHistory,
        badgeProgress,
        earnedBadges,
        stats: {
          totalPosts: posts.length,
          totalComments: comments.length,
          acceptedAnswers: comments.filter(c => c.isAccepted).length,
        },
      });
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });

  // POST /api/community/flag - Flag/report content for moderation
  app.post("/api/community/flag", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Must be logged in to flag content" });
      }

      const parseResult = insertCommunityFlagSchema.safeParse({
        ...req.body,
        reporterId: userId,
        status: "pending",
      });

      if (!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message).join(", ");
        return res.status(400).json({ error: errors });
      }

      // Check if user already flagged this content
      const existing = await db.select().from(communityFlags)
        .where(and(
          eq(communityFlags.reporterId, userId),
          eq(communityFlags.targetType, parseResult.data.targetType),
          eq(communityFlags.targetId, parseResult.data.targetId)
        ));

      if (existing.length > 0) {
        return res.status(400).json({ error: "You have already reported this content" });
      }

      const [flag] = await db.insert(communityFlags).values(parseResult.data).returning();

      res.status(201).json({ success: true, flag });
    } catch (error: any) {
      console.error("Error flagging content:", error);
      res.status(500).json({ error: "Failed to flag content" });
    }
  });

  // GET /api/community/moderation/queue - Get pending flags for moderators
  app.get("/api/community/moderation/queue", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Must be logged in" });
      }

      // Check if user is a moderator (trust level >= 3 or admin role)
      const [trust] = await db.select().from(userTrustLevels)
        .where(eq(userTrustLevels.userId, userId));
      const [user] = await db.select().from(users).where(eq(users.id, userId));

      const isModerator = (trust && (trust.trustLevel || 0) >= 3) || user?.role === "admin";
      if (!isModerator) {
        return res.status(403).json({ error: "Insufficient permissions - moderator access required" });
      }

      const status = (req.query.status as string) || "pending";

      const flags = await db.select().from(communityFlags)
        .where(eq(communityFlags.status, status))
        .orderBy(desc(communityFlags.createdAt));

      // Enrich flags with target content info
      const enrichedFlags = await Promise.all(flags.map(async (flag) => {
        let targetContent = null;
        if (flag.targetType === "post") {
          const [post] = await db.select().from(communityPosts)
            .where(eq(communityPosts.id, flag.targetId));
          targetContent = post;
        } else if (flag.targetType === "comment") {
          const [comment] = await db.select().from(communityComments)
            .where(eq(communityComments.id, flag.targetId));
          targetContent = comment;
        }

        // Get reporter info
        const [reporter] = await db.select({
          id: users.id,
          name: users.name,
          profileImageUrl: users.profileImageUrl,
        }).from(users).where(eq(users.id, flag.reporterId));

        return {
          ...flag,
          targetContent,
          reporter,
        };
      }));

      res.json(enrichedFlags);
    } catch (error: any) {
      console.error("Error fetching moderation queue:", error);
      res.status(500).json({ error: "Failed to fetch moderation queue" });
    }
  });

  // POST /api/community/moderation/action - Take moderation action on a flag
  app.post("/api/community/moderation/action", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const moderatorId = req.user?.claims?.sub || req.user?.id;
      if (!moderatorId) {
        return res.status(401).json({ error: "Must be logged in" });
      }

      // Check if user is a moderator
      const [trust] = await db.select().from(userTrustLevels)
        .where(eq(userTrustLevels.userId, moderatorId));
      const [user] = await db.select().from(users).where(eq(users.id, moderatorId));

      const isModerator = (trust && (trust.trustLevel || 0) >= 3) || user?.role === "admin";
      if (!isModerator) {
        return res.status(403).json({ error: "Insufficient permissions - moderator access required" });
      }

      const { flagId, action, reason } = req.body;

      if (!flagId || !action) {
        return res.status(400).json({ error: "flagId and action are required" });
      }

      // Get the flag
      const [flag] = await db.select().from(communityFlags)
        .where(eq(communityFlags.id, flagId));

      if (!flag) {
        return res.status(404).json({ error: "Flag not found" });
      }

      // Update flag status
      const actionStatus = action === "dismiss" ? "dismissed" : "actioned";
      await db.update(communityFlags)
        .set({
          status: actionStatus,
          reviewedBy: moderatorId,
          reviewedAt: new Date(),
          actionTaken: action,
        })
        .where(eq(communityFlags.id, flagId));

      // Apply the action if not dismissed
      if (action !== "dismiss" && action !== "none") {
        // Handle different action types
        if (action === "delete" && flag.targetType === "post") {
          await db.update(communityPosts)
            .set({ status: "deleted" })
            .where(eq(communityPosts.id, flag.targetId));
        } else if (action === "delete" && flag.targetType === "comment") {
          await db.delete(communityComments)
            .where(eq(communityComments.id, flag.targetId));
        } else if (action === "hide" && flag.targetType === "post") {
          await db.update(communityPosts)
            .set({ status: "hidden" })
            .where(eq(communityPosts.id, flag.targetId));
        }
      }

      // Log the moderation action
      await db.insert(communityModerationActions).values({
        moderatorId,
        actionType: action === "dismiss" ? "flag" : action === "delete" ? "delete_post" : action,
        reason: reason || `Moderation action on flag ${flagId}`,
        targetType: flag.targetType,
        targetId: flag.targetId,
      });

      res.json({ success: true, action, flagId });
    } catch (error: any) {
      console.error("Error taking moderation action:", error);
      res.status(500).json({ error: "Failed to take moderation action" });
    }
  });

  // GET /api/community/moderation/history - Get moderation action history
  app.get("/api/community/moderation/history", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Must be logged in" });
      }

      // Check if user is a moderator
      const [trust] = await db.select().from(userTrustLevels)
        .where(eq(userTrustLevels.userId, userId));
      const [user] = await db.select().from(users).where(eq(users.id, userId));

      const isModerator = (trust && (trust.trustLevel || 0) >= 3) || user?.role === "admin";
      if (!isModerator) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      const actions = await db.select().from(communityModerationActions)
        .orderBy(desc(communityModerationActions.createdAt))
        .limit(100);

      res.json(actions);
    } catch (error: any) {
      console.error("Error fetching moderation history:", error);
      res.status(500).json({ error: "Failed to fetch moderation history" });
    }
  });

  // POST /api/community/badges/award - Award a badge to a user (admin only)
  app.post("/api/community/badges/award", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user?.claims?.sub || req.user?.id;
      if (!adminId) {
        return res.status(401).json({ error: "Must be logged in" });
      }

      const [admin] = await db.select().from(users).where(eq(users.id, adminId));
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const parseResult = insertUserEarnedBadgeSchema.safeParse(req.body);
      if (!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message).join(", ");
        return res.status(400).json({ error: errors });
      }

      // Check if badge already awarded
      const existing = await db.select().from(userEarnedBadges)
        .where(and(
          eq(userEarnedBadges.userId, parseResult.data.userId),
          eq(userEarnedBadges.badgeId, parseResult.data.badgeId)
        ));

      if (existing.length > 0) {
        return res.status(400).json({ error: "Badge already awarded to this user" });
      }

      const [earned] = await db.insert(userEarnedBadges).values(parseResult.data).returning();

      res.status(201).json({ success: true, earned });
    } catch (error: any) {
      console.error("Error awarding badge:", error);
      res.status(500).json({ error: "Failed to award badge" });
    }
  });

  // GET /api/community/user/:userId/badges - Get user's earned badges
  app.get("/api/community/user/:userId/badges", async (req, res) => {
    try {
      const userId = req.params.userId;

      const earnedBadges = await db.select({
        id: userEarnedBadges.id,
        badgeId: userEarnedBadges.badgeId,
        earnedAt: userEarnedBadges.earnedAt,
        badgeName: badgeDefinitions.name,
        badgeDescription: badgeDefinitions.description,
        badgeIcon: badgeDefinitions.icon,
        badgeCategory: badgeDefinitions.category,
        badgePoints: badgeDefinitions.points,
      }).from(userEarnedBadges)
        .leftJoin(badgeDefinitions, eq(userEarnedBadges.badgeId, badgeDefinitions.id))
        .where(eq(userEarnedBadges.userId, userId))
        .orderBy(desc(userEarnedBadges.earnedAt));

      res.json(earnedBadges);
    } catch (error: any) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ error: "Failed to fetch user badges" });
    }
  });

  // ========== SERVICE MARKETPLACE API ==========

  // GET /api/community/marketplace/categories - List all service categories
  app.get("/api/community/marketplace/categories", async (req, res) => {
    try {
      const categories = await db.select().from(serviceCategories)
        .orderBy(serviceCategories.sortOrder);
      res.json(categories);
    } catch (error: any) {
      console.error("Error fetching service categories:", error);
      res.status(500).json({ error: "Failed to fetch service categories" });
    }
  });

  // POST /api/community/marketplace/categories - Create category (admin only)
  app.post("/api/community/marketplace/categories", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      // Check if user is admin
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const parseResult = insertServiceCategorySchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.errors.map(e => e.message).join(", ") });
      }

      const [category] = await db.insert(serviceCategories).values(parseResult.data).returning();
      res.status(201).json(category);
    } catch (error: any) {
      console.error("Error creating service category:", error);
      res.status(500).json({ error: "Failed to create service category" });
    }
  });

  // GET /api/community/marketplace/packages - List service packages
  app.get("/api/community/marketplace/packages", async (req, res) => {
    try {
      const categoryId = req.query.categoryId as string;
      const providerId = req.query.providerId as string;

      let packages;
      if (categoryId) {
        packages = await db.select().from(servicePackages)
          .where(and(eq(servicePackages.categoryId, categoryId), eq(servicePackages.status, "active")))
          .orderBy(desc(servicePackages.createdAt));
      } else if (providerId) {
        packages = await db.select().from(servicePackages)
          .where(eq(servicePackages.providerId, providerId))
          .orderBy(desc(servicePackages.createdAt));
      } else {
        packages = await db.select().from(servicePackages)
          .where(eq(servicePackages.status, "active"))
          .orderBy(desc(servicePackages.createdAt));
      }
      res.json(packages);
    } catch (error: any) {
      console.error("Error fetching service packages:", error);
      res.status(500).json({ error: "Failed to fetch service packages" });
    }
  });

  // GET /api/community/marketplace/packages/:id - Get package details with reviews
  app.get("/api/community/marketplace/packages/:id", async (req, res) => {
    try {
      const [pkg] = await db.select().from(servicePackages)
        .where(eq(servicePackages.id, req.params.id));
      if (!pkg) return res.status(404).json({ error: "Package not found" });

      // Get reviews for this provider
      const reviews = await db.select().from(serviceReviews)
        .where(eq(serviceReviews.providerId, pkg.providerId))
        .orderBy(desc(serviceReviews.createdAt))
        .limit(20);

      res.json({ ...pkg, reviews });
    } catch (error: any) {
      console.error("Error fetching package details:", error);
      res.status(500).json({ error: "Failed to fetch package details" });
    }
  });

  // POST /api/community/marketplace/packages - Create service package (trust level >= 3)
  app.post("/api/community/marketplace/packages", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      // Check trust level >= 3
      const [trust] = await db.select().from(userTrustLevels).where(eq(userTrustLevels.userId, userId));
      if (!trust || (trust.trustLevel || 0) < 3) {
        return res.status(403).json({ error: "Trust level 3 (Leader) required to offer services" });
      }

      const parseResult = insertServicePackageSchema.safeParse({ ...req.body, providerId: userId });
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.errors.map(e => e.message).join(", ") });
      }

      const [pkg] = await db.insert(servicePackages).values(parseResult.data).returning();
      res.status(201).json(pkg);
    } catch (error: any) {
      console.error("Error creating service package:", error);
      res.status(500).json({ error: "Failed to create service package" });
    }
  });

  // PATCH /api/community/marketplace/packages/:id - Update service package
  app.patch("/api/community/marketplace/packages/:id", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      const [pkg] = await db.select().from(servicePackages).where(eq(servicePackages.id, req.params.id));
      if (!pkg) return res.status(404).json({ error: "Package not found" });
      if (pkg.providerId !== userId) return res.status(403).json({ error: "Not authorized to edit this package" });

      const { title, description, price, deliveryDays, status } = req.body;
      const updates: any = { updatedAt: new Date() };
      if (title) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (price) updates.price = price;
      if (deliveryDays) updates.deliveryDays = deliveryDays;
      if (status) updates.status = status;

      const [updated] = await db.update(servicePackages)
        .set(updates)
        .where(eq(servicePackages.id, req.params.id))
        .returning();

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating service package:", error);
      res.status(500).json({ error: "Failed to update service package" });
    }
  });

  // POST /api/community/marketplace/orders - Create service order
  app.post("/api/community/marketplace/orders", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      const { packageId, requirements } = req.body;
      if (!packageId) return res.status(400).json({ error: "Package ID required" });

      // Get package details
      const [pkg] = await db.select().from(servicePackages).where(eq(servicePackages.id, packageId));
      if (!pkg) return res.status(404).json({ error: "Package not found" });
      if (pkg.status !== "active") return res.status(400).json({ error: "Package not available" });
      if (pkg.providerId === userId) return res.status(400).json({ error: "Cannot order your own service" });

      const [order] = await db.insert(serviceOrders).values({
        packageId,
        buyerId: userId,
        providerId: pkg.providerId,
        price: pkg.price,
        requirements: requirements || "",
        status: "pending",
      }).returning();

      // Update package total orders
      await db.update(servicePackages)
        .set({ totalOrders: (pkg.totalOrders || 0) + 1, updatedAt: new Date() })
        .where(eq(servicePackages.id, packageId));

      res.status(201).json(order);
    } catch (error: any) {
      console.error("Error creating service order:", error);
      res.status(500).json({ error: "Failed to create service order" });
    }
  });

  // GET /api/community/marketplace/orders - Get user's orders (as buyer or provider)
  app.get("/api/community/marketplace/orders", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      const role = req.query.role as string; // buyer or provider

      let orders;
      if (role === "provider") {
        orders = await db.select().from(serviceOrders)
          .where(eq(serviceOrders.providerId, userId))
          .orderBy(desc(serviceOrders.createdAt));
      } else {
        orders = await db.select().from(serviceOrders)
          .where(eq(serviceOrders.buyerId, userId))
          .orderBy(desc(serviceOrders.createdAt));
      }

      res.json(orders);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // GET /api/community/marketplace/orders/:id - Get order details
  app.get("/api/community/marketplace/orders/:id", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      const [order] = await db.select().from(serviceOrders).where(eq(serviceOrders.id, req.params.id));
      if (!order) return res.status(404).json({ error: "Order not found" });
      if (order.buyerId !== userId && order.providerId !== userId) {
        return res.status(403).json({ error: "Not authorized to view this order" });
      }

      // Get package details
      const [pkg] = await db.select().from(servicePackages).where(eq(servicePackages.id, order.packageId));

      // Check if review exists
      const existingReview = await db.select().from(serviceReviews)
        .where(eq(serviceReviews.orderId, order.id));

      res.json({ ...order, package: pkg, hasReview: existingReview.length > 0 });
    } catch (error: any) {
      console.error("Error fetching order details:", error);
      res.status(500).json({ error: "Failed to fetch order details" });
    }
  });

  // PATCH /api/community/marketplace/orders/:id - Update order status
  app.patch("/api/community/marketplace/orders/:id", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      const [order] = await db.select().from(serviceOrders).where(eq(serviceOrders.id, req.params.id));
      if (!order) return res.status(404).json({ error: "Order not found" });

      const { status, deliveryNotes } = req.body;
      const updates: any = {};

      // Validate status transitions
      if (status === "in_progress" && order.providerId === userId) {
        updates.status = "in_progress";
      } else if (status === "delivered" && order.providerId === userId) {
        updates.status = "delivered";
        updates.deliveredAt = new Date();
        if (deliveryNotes) updates.deliveryNotes = deliveryNotes;
      } else if (status === "completed" && order.buyerId === userId) {
        updates.status = "completed";
        updates.completedAt = new Date();
      } else if (status === "cancelled") {
        if (order.buyerId !== userId && order.providerId !== userId) {
          return res.status(403).json({ error: "Not authorized" });
        }
        if (order.status === "completed") {
          return res.status(400).json({ error: "Cannot cancel completed order" });
        }
        updates.status = "cancelled";
      } else if (status === "disputed" && order.buyerId === userId) {
        updates.status = "disputed";
      } else {
        return res.status(400).json({ error: "Invalid status transition" });
      }

      const [updated] = await db.update(serviceOrders)
        .set(updates)
        .where(eq(serviceOrders.id, req.params.id))
        .returning();

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  // POST /api/community/marketplace/orders/:id/review - Add review for completed order
  app.post("/api/community/marketplace/orders/:id/review", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) return res.status(401).json({ error: "User not authenticated" });

      const [order] = await db.select().from(serviceOrders).where(eq(serviceOrders.id, req.params.id));
      if (!order) return res.status(404).json({ error: "Order not found" });
      if (order.buyerId !== userId) return res.status(403).json({ error: "Only buyer can review" });
      if (order.status !== "completed") return res.status(400).json({ error: "Can only review completed orders" });

      // Check if already reviewed
      const existing = await db.select().from(serviceReviews).where(eq(serviceReviews.orderId, order.id));
      if (existing.length > 0) return res.status(400).json({ error: "Order already reviewed" });

      const { rating, comment } = req.body;
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      const [review] = await db.insert(serviceReviews).values({
        orderId: order.id,
        reviewerId: userId,
        providerId: order.providerId,
        rating,
        comment: comment || "",
      }).returning();

      // Update provider's average rating
      const allReviews = await db.select().from(serviceReviews)
        .where(eq(serviceReviews.providerId, order.providerId));
      const avgRating = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / allReviews.length;

      // Update all packages by this provider with new average
      await db.update(servicePackages)
        .set({ averageRating: avgRating.toFixed(2), updatedAt: new Date() })
        .where(eq(servicePackages.providerId, order.providerId));

      res.status(201).json(review);
    } catch (error: any) {
      console.error("Error creating review:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  // GET /api/community/marketplace/providers/:id/reviews - Get provider reviews
  app.get("/api/community/marketplace/providers/:id/reviews", async (req, res) => {
    try {
      const reviews = await db.select().from(serviceReviews)
        .where(eq(serviceReviews.providerId, req.params.id))
        .orderBy(desc(serviceReviews.createdAt))
        .limit(50);
      res.json(reviews);
    } catch (error: any) {
      console.error("Error fetching provider reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // ========== ABUSE DETECTION API ==========

  // GET /api/community/moderation/anomalies - List vote anomalies (moderator only)
  app.get("/api/community/moderation/anomalies", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) return res.status(401).json({ error: "Must be logged in" });

      // Check if user is moderator
      const [trust] = await db.select().from(userTrustLevels).where(eq(userTrustLevels.userId, userId));
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      const isModerator = (trust && (trust.trustLevel || 0) >= 3) || user?.role === "admin";
      if (!isModerator) return res.status(403).json({ error: "Moderator access required" });

      const status = req.query.status as string;
      let anomalies;
      if (status) {
        anomalies = await db.select().from(communityVoteAnomalies)
          .where(eq(communityVoteAnomalies.status, status))
          .orderBy(desc(communityVoteAnomalies.createdAt))
          .limit(100);
      } else {
        anomalies = await db.select().from(communityVoteAnomalies)
          .orderBy(desc(communityVoteAnomalies.createdAt))
          .limit(100);
      }
      res.json(anomalies);
    } catch (error: any) {
      console.error("Error fetching anomalies:", error);
      res.status(500).json({ error: "Failed to fetch anomalies" });
    }
  });

  // POST /api/community/moderation/anomalies/:id/action - Take action on anomaly
  app.post("/api/community/moderation/anomalies/:id/action", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) return res.status(401).json({ error: "Must be logged in" });

      // Check if user is moderator
      const [trust] = await db.select().from(userTrustLevels).where(eq(userTrustLevels.userId, userId));
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      const isModerator = (trust && (trust.trustLevel || 0) >= 3) || user?.role === "admin";
      if (!isModerator) return res.status(403).json({ error: "Moderator access required" });

      const [anomaly] = await db.select().from(communityVoteAnomalies)
        .where(eq(communityVoteAnomalies.id, req.params.id));
      if (!anomaly) return res.status(404).json({ error: "Anomaly not found" });

      const { action, status } = req.body;
      const updates: any = {
        reviewedBy: userId,
        reviewedAt: new Date(),
      };
      if (status) updates.status = status;
      if (action) updates.actionTaken = action;

      const [updated] = await db.update(communityVoteAnomalies)
        .set(updates)
        .where(eq(communityVoteAnomalies.id, req.params.id))
        .returning();

      // Log the moderation action
      await db.insert(communityModerationActions).values({
        moderatorId: userId,
        actionType: `anomaly_${action || status}`,
        reason: `Reviewed anomaly: ${anomaly.anomalyType}`,
        targetType: anomaly.targetType || "system",
        targetId: anomaly.targetId || anomaly.id,
      });

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating anomaly:", error);
      res.status(500).json({ error: "Failed to update anomaly" });
    }
  });

  // POST /api/community/moderation/detect-anomalies - Run anomaly detection (admin only)
  app.post("/api/community/moderation/detect-anomalies", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) return res.status(401).json({ error: "Must be logged in" });

      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Get recent vote events for analysis
      const recentVotes = await db.select().from(communityVoteEvents)
        .orderBy(desc(communityVoteEvents.createdAt))
        .limit(1000);

      const anomaliesDetected: any[] = [];

      // Detection 1: Rapid voting (same user voting many times quickly)
      const voterCounts = new Map<string, { count: number; firstVote: Date; lastVote: Date }>();
      for (const vote of recentVotes) {
        const voter = vote.voterId;
        if (!voterCounts.has(voter)) {
          voterCounts.set(voter, { count: 0, firstVote: vote.createdAt!, lastVote: vote.createdAt! });
        }
        const data = voterCounts.get(voter)!;
        data.count++;
        if (vote.createdAt! < data.firstVote) data.firstVote = vote.createdAt!;
        if (vote.createdAt! > data.lastVote) data.lastVote = vote.createdAt!;
      }

      for (const [voterId, data] of voterCounts) {
        if (data.count >= 20) {
          const timeDiff = (data.lastVote.getTime() - data.firstVote.getTime()) / 1000 / 60; // minutes
          if (timeDiff < 30 && data.count / timeDiff > 1) { // More than 1 vote per minute
            anomaliesDetected.push({
              anomalyType: "rapid_voting",
              userId: voterId,
              severity: data.count > 50 ? "critical" : data.count > 30 ? "high" : "medium",
              evidence: { voteCount: data.count, timeMinutes: timeDiff.toFixed(2), votesPerMinute: (data.count / timeDiff).toFixed(2) },
              status: "pending",
            });
          }
        }
      }

      // Detection 2: Vote rings (same users always voting for each other's content)
      const votePatterns = new Map<string, Set<string>>(); // voter -> targets they voted for
      for (const vote of recentVotes) {
        if (!votePatterns.has(vote.voterId)) {
          votePatterns.set(vote.voterId, new Set());
        }
        votePatterns.get(vote.voterId)!.add(vote.targetId);
      }

      // Insert detected anomalies
      for (const anomaly of anomaliesDetected) {
        await db.insert(communityVoteAnomalies).values(anomaly);
      }

      res.json({ detected: anomaliesDetected.length, anomalies: anomaliesDetected });
    } catch (error: any) {
      console.error("Error detecting anomalies:", error);
      res.status(500).json({ error: "Failed to detect anomalies" });
    }
  });

  // ========== AI MODERATION API ==========

  // POST /api/community/moderation/ai-analyze/:flagId - AI analysis of flagged content
  app.post("/api/community/moderation/ai-analyze/:flagId", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) return res.status(401).json({ error: "Must be logged in" });

      // Check if user is moderator
      const [trust] = await db.select().from(userTrustLevels).where(eq(userTrustLevels.userId, userId));
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      const isModerator = (trust && (trust.trustLevel || 0) >= 3) || user?.role === "admin";
      if (!isModerator) return res.status(403).json({ error: "Moderator access required" });

      const [flag] = await db.select().from(communityFlags)
        .where(eq(communityFlags.id, req.params.flagId));
      if (!flag) return res.status(404).json({ error: "Flag not found" });

      // Check if already analyzed
      const existing = await db.select().from(communityAIRecommendations)
        .where(eq(communityAIRecommendations.flagId, flag.id));
      if (existing.length > 0) {
        return res.json(existing[0]);
      }

      // Get the flagged content
      let content = "";
      if (flag.targetType === "post") {
        const [post] = await db.select().from(communityPosts)
          .where(eq(communityPosts.id, flag.targetId));
        if (post) content = `Title: ${post.title}\n\nContent: ${post.content}`;
      } else if (flag.targetType === "comment") {
        const [comment] = await db.select().from(communityComments)
          .where(eq(communityComments.id, flag.targetId));
        if (comment) content = comment.content || "";
      }

      if (!content) {
        return res.status(400).json({ error: "Content not found for analysis" });
      }

      const startTime = Date.now();

      // Call OpenAI for content analysis
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a content moderation AI. Analyze the following content that was flagged by a user.
Reason for flag: ${flag.reason}
${flag.details ? `Additional details: ${flag.details}` : ""}

Provide your analysis in JSON format with these fields:
- severityScore: number from 0 to 1 (0 = not harmful, 1 = severely harmful)
- suggestedAction: one of "dismiss", "warn", "hide", "delete", "escalate"
- confidence: number from 0 to 1 (how confident you are)
- categories: array of detected categories (spam, harassment, hate_speech, misinformation, inappropriate, off_topic, other)
- reasoning: brief explanation of your analysis

Be fair and consider context. Not all controversial content is harmful.`
          },
          {
            role: "user",
            content: content
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
      });

      const processingTime = Date.now() - startTime;
      const aiResponse = JSON.parse(completion.choices[0]?.message?.content || "{}");

      const [recommendation] = await db.insert(communityAIRecommendations).values({
        flagId: flag.id,
        contentAnalysis: { content: content.substring(0, 500), flagReason: flag.reason },
        severityScore: String(aiResponse.severityScore || 0),
        suggestedAction: aiResponse.suggestedAction || "dismiss",
        confidence: String(aiResponse.confidence || 0),
        reasoning: aiResponse.reasoning || "",
        categories: aiResponse.categories || [],
        processingTime,
      }).returning();

      res.json(recommendation);
    } catch (error: any) {
      console.error("Error analyzing content:", error);
      res.status(500).json({ error: "Failed to analyze content" });
    }
  });

  // GET /api/community/moderation/ai-recommendations - List AI recommendations
  app.get("/api/community/moderation/ai-recommendations", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) return res.status(401).json({ error: "Must be logged in" });

      // Check if user is moderator
      const [trust] = await db.select().from(userTrustLevels).where(eq(userTrustLevels.userId, userId));
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      const isModerator = (trust && (trust.trustLevel || 0) >= 3) || user?.role === "admin";
      if (!isModerator) return res.status(403).json({ error: "Moderator access required" });

      const recommendations = await db.select().from(communityAIRecommendations)
        .orderBy(desc(communityAIRecommendations.createdAt))
        .limit(100);

      res.json(recommendations);
    } catch (error: any) {
      console.error("Error fetching AI recommendations:", error);
      res.status(500).json({ error: "Failed to fetch AI recommendations" });
    }
  });

  // GET /api/community/moderation/flags/:id/ai-recommendation - Get AI recommendation for a flag
  app.get("/api/community/moderation/flags/:id/ai-recommendation", isPlatformAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) return res.status(401).json({ error: "Must be logged in" });

      // Check if user is moderator
      const [trust] = await db.select().from(userTrustLevels).where(eq(userTrustLevels.userId, userId));
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      const isModerator = (trust && (trust.trustLevel || 0) >= 3) || user?.role === "admin";
      if (!isModerator) return res.status(403).json({ error: "Moderator access required" });

      const [recommendation] = await db.select().from(communityAIRecommendations)
        .where(eq(communityAIRecommendations.flagId, req.params.id));

      if (!recommendation) {
        return res.status(404).json({ error: "No AI recommendation found for this flag" });
      }

      res.json(recommendation);
    } catch (error: any) {
      console.error("Error fetching AI recommendation:", error);
      res.status(500).json({ error: "Failed to fetch AI recommendation" });
    }
  });

  return httpServer;
}
