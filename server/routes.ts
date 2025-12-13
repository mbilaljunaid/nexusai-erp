import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { dbStorage } from "./storage-db";
import { db } from "./db";
import { eq } from "drizzle-orm";
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
  insertPartnerSchema, partners as partnersTable,
} from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import { lemonSqueezySetup, createCheckout, listProducts, getAuthenticatedUser } from "@lemonsqueezy/lemonsqueezy.js";
import crypto from "crypto";
import { generateDemoData } from "./demoSeeds";
import analyticsRoutes from "./routes/analyticsRoutes";
import templateRoutes from "./routes/templateRoutes";
import migrationRoutes from "./routes/migrationRoutes";
import { validateRequest, errorResponse, ErrorCode, sanitizeInput } from "./security";
import { setupAuth, isAuthenticated } from "./replitAuth";

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

  // Setup Replit Auth (IMPORTANT: must be before other routes)
  await setupAuth(app);

  // Auth user endpoint
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

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
    enforceRBAC()(req, res, next);
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
  app.get("/api/contact/submissions", isAuthenticated, async (req, res) => {
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

  return httpServer;
}
