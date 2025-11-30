import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProjectSchema, insertInvoiceSchema, insertLeadSchema, insertWorkOrderSchema, insertEmployeeSchema,
  insertMobileDeviceSchema, insertOfflineSyncSchema,
  insertCopilotConversationSchema, insertCopilotMessageSchema,
  insertRevenueForecastSchema, insertBudgetAllocationSchema, insertTimeSeriesDataSchema, insertForecastModelSchema,
  insertScenarioSchema, insertScenarioVariableSchema, insertDashboardWidgetSchema, insertReportSchema, insertAuditLogSchema,
  insertAppSchema, insertAppReviewSchema, insertAppInstallationSchema, insertConnectorSchema, insertConnectorInstanceSchema, insertWebhookEventSchema,
  insertAbacRuleSchema, insertEncryptedFieldSchema, insertComplianceConfigSchema, insertSprintSchema, insertIssueSchema,
  insertDataLakeSchema, insertEtlPipelineSchema, insertBiDashboardSchema, insertFieldServiceJobSchema, insertPayrollConfigSchema,
} from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";

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

  // Apply RBAC middleware to all /api routes (except health check)
  app.use("/api", (req, res, next) => {
    if (req.path === "/health") return next();
    enforceRBAC()(req, res, next);
  });

  // PHASE 1: Invoices
  app.get("/api/invoices", async (req, res) => {
    res.json(invoicesStore);
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: req.body.invoiceNumber || `INV-${Math.random().toString(36).substr(2, 9)}`,
        customerId: req.body.customerId || "CUST-001",
        amount: req.body.amount || "0",
        dueDate: req.body.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: req.body.status || "draft",
        items: req.body.items || [],
        createdAt: new Date().toISOString(),
      };
      invoicesStore.push(invoice);
      res.status(201).json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Failed to create invoice" });
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
      const quote = {
        id: `quote-${Date.now()}`,
        opportunityId: req.body.opportunityId || "OPP-001",
        lineItems: req.body.lineItems || [],
        discountAmount: req.body.discountAmount || "0",
        total: req.body.total || "0",
        status: "draft",
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };
      quotesStore.push(quote);
      res.status(201).json(quote);
    } catch (error) {
      res.status(500).json({ error: "Failed to create quote" });
    }
  });

  app.post("/api/quotes/:id/send", async (req, res) => {
    const quote = quotesStore.find(q => q.id === req.params.id);
    if (!quote) return res.status(404).json({ error: "Quote not found" });
    quote.status = "sent";
    res.json(quote);
  });

  // PHASE 1: Payments
  app.get("/api/payments", async (req, res) => {
    res.json(paymentsStore);
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const payment = {
        id: `pay-${Date.now()}`,
        invoiceId: req.body.invoiceId || "",
        amount: req.body.amount || "0",
        method: req.body.method || "card",
        status: req.body.status || "pending",
        transactionId: `TXN-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };
      paymentsStore.push(payment);
      // Auto-complete after 2 seconds
      setTimeout(() => {
        const p = paymentsStore.find(x => x.id === payment.id);
        if (p) p.status = "completed";
      }, 2000);
      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create payment" });
    }
  });

  // PHASE 1: Approvals
  app.get("/api/approvals", async (req, res) => {
    res.json(approvalsStore);
  });

  app.post("/api/approvals/:id/approve", async (req, res) => {
    const approval = approvalsStore.find(a => a.id === req.params.id);
    if (!approval) return res.status(404).json({ error: "Approval not found" });
    approval.status = "approved";
    res.json(approval);
  });

  app.post("/api/approvals/:id/reject", async (req, res) => {
    const approval = approvalsStore.find(a => a.id === req.params.id);
    if (!approval) return res.status(404).json({ error: "Approval not found" });
    approval.status = "rejected";
    res.json(approval);
  });

  // Seed some mock data
  quotesStore.push(
    { id: "q1", opportunityId: "OPP-001", lineItems: [{ description: "License", quantity: 5, unitPrice: "1000" }], total: "5000", status: "draft", validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() },
    { id: "q2", opportunityId: "OPP-002", lineItems: [{ description: "Support", quantity: 12, unitPrice: "500" }], total: "6000", status: "sent", validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() },
  );

  invoicesStore.push(
    { id: "i1", invoiceNumber: "INV-2025-001", customerId: "CUST-001", amount: "5000", dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), status: "sent", items: [], createdAt: new Date().toISOString() },
  );

  approvalsStore.push(
    { id: "a1", type: "quote", referenceId: "q1", amount: "5000", requester: "John Sales", status: "pending", approvers: ["Manager"], currentApprover: "Manager", createdAt: new Date().toISOString() },
    { id: "a2", type: "invoice", referenceId: "i1", amount: "5000", requester: "Finance", status: "approved", approvers: ["CFO"], currentApprover: "CFO", createdAt: new Date().toISOString() },
  );

  // EXISTING ROUTES FROM ORIGINAL FILE - Start here
  // ... (rest of the original routes.ts content continues below)

  // PHASE 2: AP Invoices
  app.get("/api/ap-invoices", async (req, res) => {
    res.json(apInvoicesStore);
  });

  app.post("/api/ap-invoices", async (req, res) => {
    const invoice = {
      id: `api-${Date.now()}`,
      invoiceNumber: req.body.invoiceNumber,
      vendorId: req.body.vendorId,
      poId: req.body.poId,
      amount: req.body.amount || "0",
      matchStatus: "unmatched",
      status: "submitted",
      createdAt: new Date().toISOString(),
    };
    apInvoicesStore.push(invoice);
    res.status(201).json(invoice);
  });

  app.post("/api/ap-invoices/:id/match", async (req, res) => {
    const invoice = apInvoicesStore.find(i => i.id === req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    invoice.matchStatus = "3way";
    invoice.status = "matched";
    res.json(invoice);
  });

  // PHASE 2: Bank Reconciliation
  app.get("/api/bank-reconciliation", async (req, res) => {
    res.json(agingDataStore.length > 0 ? [agingDataStore[0]] : [{
      id: "recon-1",
      bankBalance: "150000",
      glBalance: "149975",
      difference: "25",
      matchedCount: 145,
      status: "complete",
      createdAt: new Date().toISOString(),
    }]);
  });

  app.post("/api/bank-reconciliation/run", async (req, res) => {
    const run = {
      id: `recon-${Date.now()}`,
      bankBalance: (Math.random() * 100000 + 50000).toString(),
      glBalance: (Math.random() * 100000 + 50000).toString(),
      difference: (Math.random() * 100 - 50).toString(),
      matchedCount: Math.floor(Math.random() * 50 + 100),
      status: "complete",
      createdAt: new Date().toISOString(),
    };
    agingDataStore.push(run);
    res.status(201).json(run);
  });

  app.get("/api/bank-transactions", async (req, res) => {
    if (bankTransactionsStore.length === 0) {
      bankTransactionsStore.push(
        { id: "bt1", date: new Date().toISOString(), description: "Deposit", amount: "5000", status: "matched", glEntry: "1010" },
        { id: "bt2", date: new Date().toISOString(), description: "Check", amount: "2500", status: "unmatched", glEntry: null },
      );
    }
    res.json(bankTransactionsStore);
  });

  app.post("/api/bank-transactions/:id/match", async (req, res) => {
    const txn = bankTransactionsStore.find(t => t.id === req.params.id);
    if (!txn) return res.status(404).json({ error: "Transaction not found" });
    txn.status = "matched";
    res.json(txn);
  });

  // PHASE 2: Payment Schedules
  app.get("/api/payment-schedules", async (req, res) => {
    if (paymentSchedulesStore.length === 0) {
      paymentSchedulesStore.push(
        { id: "ps1", vendorId: "V001", invoiceId: "i1", amount: "5000", dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), status: "pending", createdAt: new Date().toISOString() },
        { id: "ps2", vendorId: "V002", invoiceId: "i2", amount: "3000", dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), scheduledDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), status: "scheduled", createdAt: new Date().toISOString() },
      );
    }
    res.json(paymentSchedulesStore);
  });

  app.post("/api/payment-schedules", async (req, res) => {
    const schedule = {
      id: `ps-${Date.now()}`,
      vendorId: req.body.vendorId,
      invoiceId: req.body.invoiceId,
      amount: req.body.amount,
      dueDate: req.body.dueDate,
      scheduledDate: req.body.scheduledDate || new Date().toISOString(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    paymentSchedulesStore.push(schedule);
    res.status(201).json(schedule);
  });

  app.post("/api/payment-schedules/:id/process", async (req, res) => {
    const schedule = paymentSchedulesStore.find(s => s.id === req.params.id);
    if (!schedule) return res.status(404).json({ error: "Schedule not found" });
    schedule.status = "processed";
    res.json(schedule);
  });

  // PHASE 2: Aging Report
  app.get("/api/aging-report", async (req, res) => {
    const type = req.query.type || "ap";
    const report = {
      id: `aging-${type}-1`,
      type,
      current: { days: "0-30", count: 45, amount: "67500", percentage: 45 },
      days30: { days: "30-60", count: 20, amount: "30000", percentage: 20 },
      days60: { days: "60-90", count: 15, amount: "22500", percentage: 15 },
      days90: { days: "90-120", count: 12, amount: "18000", percentage: 12 },
      over90: { days: "120+", count: 8, amount: "12000", percentage: 8 },
      totalAmount: "150000",
      createdAt: new Date().toISOString(),
    };
    res.json([report]);
  });

  // PHASE 3: Sprints
  app.get("/api/sprints", async (req, res) => {
    if (sprintsStore.length === 0) {
      sprintsStore.push(
        {
          id: "sprint-1",
          name: "Sprint 1",
          status: "active",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          tasks: [
            { id: "t1", title: "Setup project", status: "in_progress", sprint: "sprint-1", assignee: "Alice", points: 5 },
            { id: "t2", title: "Create API", status: "todo", sprint: "sprint-1", assignee: "Bob", points: 8 },
            { id: "t3", title: "Fix bugs", status: "done", sprint: "sprint-1", assignee: "Carol", points: 3 },
          ],
          velocity: 16,
        }
      );
    }
    res.json(sprintsStore);
  });

  // PHASE 3: Tasks
  app.get("/api/tasks", async (req, res) => {
    if (tasksStore.length === 0) {
      tasksStore.push(
        { id: "t1", title: "Setup project", status: "in_progress", priority: "high", assignee: "Alice", dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), subTasks: [{ id: "st1", title: "Install deps", completed: true }], dependencies: [], createdAt: new Date().toISOString() },
        { id: "t2", title: "Create API", status: "open", priority: "high", assignee: "Bob", dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), subTasks: [], dependencies: ["t1"], createdAt: new Date().toISOString() },
      );
    }
    res.json(tasksStore);
  });

  app.post("/api/tasks", async (req, res) => {
    const task = {
      id: `task-${Date.now()}`,
      title: req.body.title || "New Task",
      status: "open",
      priority: req.body.priority || "medium",
      assignee: req.body.assignee || "Unassigned",
      dueDate: req.body.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      subTasks: [],
      dependencies: [],
      createdAt: new Date().toISOString(),
    };
    tasksStore.push(task);
    res.status(201).json(task);
  });

  // PHASE 3: Workflows
  app.get("/api/workflows", async (req, res) => {
    if (workflowsStore.length === 0) {
      workflowsStore.push(
        {
          id: "wf1",
          name: "Bug Triage",
          description: "Process for triaging and resolving bugs",
          states: [
            { id: "new", name: "New", color: "#ef4444", order: 1 },
            { id: "assigned", name: "Assigned", color: "#f97316", order: 2 },
            { id: "in-progress", name: "In Progress", color: "#3b82f6", order: 3 },
            { id: "resolved", name: "Resolved", color: "#22c55e", order: 4 },
          ],
          automationRules: [
            { trigger: "status_changed_to_assigned", action: "notify_assignee" },
            { trigger: "status_changed_to_resolved", action: "create_release_note" },
          ],
          active: true,
        }
      );
    }
    res.json(workflowsStore);
  });

  app.post("/api/workflows", async (req, res) => {
    const workflow = {
      id: `wf-${Date.now()}`,
      name: req.body.name || "New Workflow",
      description: req.body.description || "",
      states: req.body.states || [],
      automationRules: [],
      active: true,
    };
    workflowsStore.push(workflow);
    res.status(201).json(workflow);
  });

  // PHASE 3: Collaborations
  app.get("/api/collaborations", async (req, res) => {
    if (collaborationsStore.length === 0) {
      collaborationsStore.push(
        {
          id: "collab1",
          taskId: "t1",
          comments: [
            { id: "c1", author: "Alice", content: "Let me work on this first", likes: 2, mentions: ["Bob"], createdAt: new Date().toISOString() },
            { id: "c2", author: "Bob", content: "@Alice sounds good to me", likes: 1, mentions: ["Alice"], createdAt: new Date().toISOString() },
          ],
          activity: [
            { id: "a1", actor: "Alice", action: "assigned task to", target: "Alice", createdAt: new Date().toISOString() },
            { id: "a2", actor: "Bob", action: "commented on", target: "task", createdAt: new Date().toISOString() },
          ],
          participants: ["Alice", "Bob", "Carol"],
        }
      );
    }
    res.json(collaborationsStore);
  });

  app.post("/api/collaborations/comments", async (req, res) => {
    const collab = collaborationsStore.find(c => c.taskId === req.body.taskId);
    if (!collab) return res.status(404).json({ error: "Collaboration not found" });
    const comment = {
      id: `c-${Date.now()}`,
      author: "Current User",
      content: req.body.content,
      likes: 0,
      mentions: [],
      createdAt: new Date().toISOString(),
    };
    collab.comments.push(comment);
    res.status(201).json(comment);
  });

  app.post("/api/collaborations/comments/:id/like", async (req, res) => {
    for (const collab of collaborationsStore) {
      const comment = collab.comments.find((c: any) => c.id === req.params.id);
      if (comment) {
        comment.likes++;
        return res.json(comment);
      }
    }
    res.status(404).json({ error: "Comment not found" });
  });

  // PHASE 4: Payroll
  app.get("/api/payroll/runs", async (req, res) => {
    if (payrollRunsStore.length === 0) {
      payrollRunsStore.push(
        { id: "pr1", name: "November 2024", period: "Nov 1-30", status: "processed", totalAmount: "125000", employeeCount: 45, createdAt: new Date().toISOString() }
      );
    }
    res.json(payrollRunsStore);
  });

  // PHASE 4: Leave Requests
  app.get("/api/leave-requests", async (req, res) => {
    if (leaveRequestsStore.length === 0) {
      leaveRequestsStore.push(
        { id: "lr1", employeeName: "Alice", type: "vacation", days: 5, status: "pending", createdAt: new Date().toISOString() },
        { id: "lr2", employeeName: "Bob", type: "sick", days: 2, status: "approved", createdAt: new Date().toISOString() }
      );
    }
    res.json(leaveRequestsStore);
  });

  // PHASE 4: Performance Reviews
  app.get("/api/performance-reviews", async (req, res) => {
    if (performanceReviewsStore.length === 0) {
      performanceReviewsStore.push(
        { id: "perf1", employeeName: "Alice", status: "completed", score: 0.85, createdAt: new Date().toISOString() },
        { id: "perf2", employeeName: "Bob", status: "in_progress", score: 0, createdAt: new Date().toISOString() }
      );
    }
    res.json(performanceReviewsStore);
  });

  // PHASE 4: Onboarding Workflows
  app.get("/api/onboarding/workflows", async (req, res) => {
    if (onboardingWorkflowsStore.length === 0) {
      onboardingWorkflowsStore.push(
        { id: "ob1", employeeName: "Carol", status: "in_progress", startDate: new Date().toISOString(), documentsCount: 3, createdAt: new Date().toISOString() },
        { id: "ob2", employeeName: "David", status: "completed", startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), documentsCount: 5, createdAt: new Date().toISOString() }
      );
    }
    res.json(onboardingWorkflowsStore);
  });

  // PHASE 5: Budget Planning
  app.get("/api/budgets", async (req, res) => {
    if (budgetsStore.length === 0) {
      budgetsStore.push(
        { id: "b1", name: "FY2025 Operating", amount: 15000000, status: "active", department: "Operations", variance: 2.5, createdAt: new Date().toISOString() },
        { id: "b2", name: "FY2025 Capital", amount: 8000000, status: "active", department: "IT", variance: -1.2, createdAt: new Date().toISOString() }
      );
    }
    res.json(budgetsStore);
  });

  // PHASE 5: Consolidations
  app.get("/api/consolidations", async (req, res) => {
    if (consolidationsStore.length === 0) {
      consolidationsStore.push(
        { id: "con1", name: "Q4 FY2024", status: "completed", entityCount: 5, period: "Oct-Dec 2024", createdAt: new Date().toISOString() },
        { id: "con2", name: "Q1 FY2025", status: "in_progress", entityCount: 5, period: "Jan-Mar 2025", createdAt: new Date().toISOString() }
      );
    }
    res.json(consolidationsStore);
  });

  // PHASE 5: Variance Analysis
  app.get("/api/variance-analysis", async (req, res) => {
    if (variancesStore.length === 0) {
      variancesStore.push(
        { id: "var1", accountName: "Revenue", actual: 50000000, forecast: 48000000, variance: 4.17, createdAt: new Date().toISOString() },
        { id: "var2", accountName: "COGS", actual: 30000000, forecast: 32000000, variance: -6.25, createdAt: new Date().toISOString() },
        { id: "var3", accountName: "OpEx", actual: 12000000, forecast: 11500000, variance: 4.35, createdAt: new Date().toISOString() }
      );
    }
    res.json(variancesStore);
  });

  // PHASE 5: Predictive Analytics
  app.get("/api/predictions", async (req, res) => {
    if (predictionsStore.length === 0) {
      predictionsStore.push(
        { id: "pred1", name: "Q2 Revenue Forecast", forecast: 52000000, confidence: 0.92, accuracy: 0.89, hasAnomaly: false, createdAt: new Date().toISOString() },
        { id: "pred2", name: "Churn Risk Model", forecast: 1200, confidence: 0.78, accuracy: 0.85, hasAnomaly: true, createdAt: new Date().toISOString() },
        { id: "pred3", name: "Cost Trend", forecast: 11800000, confidence: 0.88, accuracy: 0.91, hasAnomaly: false, createdAt: new Date().toISOString() }
      );
    }
    res.json(predictionsStore);
  });

  // PHASE 6: RAG Embeddings
  app.get("/api/rag/embeddings", async (req, res) => {
    if (ragJobsStore.length === 0) {
      ragJobsStore.push(
        { id: "rag1", name: "CRM Documents", status: "completed", vectors: 5000000, documents: 125000 },
        { id: "rag2", name: "KB Articles", status: "processing", vectors: 2000000, documents: 50000 }
      );
    }
    res.json(ragJobsStore);
  });

  // PHASE 6: Copilot (CRM, ERP, HR)
  app.get("/api/copilot/crm", async (req, res) => {
    if (copilotChatsStore.filter((c: any) => c.module === "crm").length === 0) {
      copilotChatsStore.push(
        { id: "c1", user: "Alice", message: "Best leads this quarter", type: "insight", module: "crm", timestamp: new Date().toISOString() },
        { id: "c2", user: "Bob", message: "Cross-sell opportunity detected", type: "recommendation", module: "crm", timestamp: new Date().toISOString() }
      );
    }
    res.json(copilotChatsStore.filter((c: any) => c.module === "crm"));
  });

  app.get("/api/copilot/erp", async (req, res) => {
    const erpChats = [
      { id: "e1", category: "Procurement", finding: "Unusual vendor payment pattern detected", severity: "critical", impact: "$250K savings" },
      { id: "e2", category: "Inventory", finding: "Slow-moving stock identified", severity: "warning", impact: "$100K optimization" }
    ];
    res.json(erpChats);
  });

  app.get("/api/copilot/hr", async (req, res) => {
    const hrInsights = [
      { id: "h1", employee: "John Smith", insight: "Flight risk detected", category: "retention", action: "Schedule retention call" },
      { id: "h2", employee: "Jane Doe", insight: "Leadership potential identified", category: "succession", action: "Recommend for mentor program" }
    ];
    res.json(hrInsights);
  });

  // PHASE 6: Performance Metrics
  app.get("/api/performance/metrics", async (req, res) => {
    const metrics = [
      { id: "m1", name: "Page Load Time", before: 2500, after: 1200, unit: "ms" },
      { id: "m2", name: "Bundle Size", before: 850, after: 320, unit: "KB" },
      { id: "m3", name: "Time to Interactive", before: 3200, after: 1400, unit: "ms" }
    ];
    res.json(metrics);
  });

  // PHASE 6: Error Tracking
  app.get("/api/errors/tracking", async (req, res) => {
    if (errorEventsStore.length === 0) {
      errorEventsStore.push(
        { id: "err1", message: "Database connection timeout", severity: "critical", count: 12, status: "resolved" },
        { id: "err2", message: "API rate limit exceeded", severity: "warning", count: 45, status: "tracking" }
      );
    }
    res.json(errorEventsStore);
  });

  // PHASE 6: Semantic Search
  app.get("/api/search/semantic", async (req, res) => {
    const searches = [
      { id: "s1", query: "customer churn analysis", resultCount: 127, avgRelevance: 0.92, executionTime: 234 },
      { id: "s2", query: "revenue forecasting models", resultCount: 89, avgRelevance: 0.88, executionTime: 198 }
    ];
    res.json(searches);
  });

  // PHASE 6: Knowledge Graph
  app.get("/api/knowledge-graph/entities", async (req, res) => {
    if (knowledgeEntitiesStore.length === 0) {
      knowledgeEntitiesStore.push(
        { id: "kg1", name: "Salesforce", type: "Platform", relationships: 45, confidence: 0.95 },
        { id: "kg2", name: "Revenue", type: "Metric", relationships: 78, confidence: 0.92 }
      );
    }
    res.json(knowledgeEntitiesStore);
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
      
      const conv = await storage.getCopilotConversation(data.conversationId);
      const context = (conv as any)?.context || "general";
      const systemPrompt = systemPrompts[context] || systemPrompts.general;
      
      const recentMessages = await storage.listCopilotMessages(data.conversationId);
      const messages = recentMessages.slice(-10).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      
      if (messages[messages.length - 1]?.content !== data.content) {
        messages.push({ role: "user", content: data.content });
      }
      
      try {
        // Use gpt-5 (latest model) if available, fallback to gpt-4o-mini
        const model = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ? "gpt-5" : "gpt-4o-mini";
        const completion = await openai.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          max_tokens: 1024,
        });
        
        const aiResponse = completion.choices[0]?.message?.content || "I couldn't generate a response.";
        
        await storage.createCopilotMessage({
          conversationId: data.conversationId,
          role: "assistant",
          content: aiResponse,
        });
      } catch (aiError) {
        console.error("OpenAI API error:", aiError);
        // Fallback response if API fails
        await storage.createCopilotMessage({
          conversationId: data.conversationId,
          role: "assistant",
          content: "Sorry, I encountered an issue. Please try again.",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // ========== PHASE 3: PROCUREMENT APIs ==========
  
  // RFQs
  const rfqsStore: any[] = [];
  app.get("/api/procurement/rfqs", (req, res) => {
    if (rfqsStore.length === 0) {
      rfqsStore.push({ id: "rfq1", rfqNumber: "RFQ-2024-001", title: "Office Equipment", description: "Supplies needed", status: "draft", dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() });
    }
    res.json(rfqsStore);
  });
  app.post("/api/procurement/rfqs", (req, res) => {
    try {
      const rfq = {
        id: `rfq-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
        status: req.body.status || "draft",
      };
      rfqsStore.push(rfq);
      res.status(201).json(rfq);
    } catch (error) {
      res.status(500).json({ error: "Failed to create RFQ" });
    }
  });

  // Purchase Orders
  const posStore: any[] = [];
  app.get("/api/procurement/purchase-orders", (req, res) => {
    if (posStore.length === 0) {
      posStore.push(
        { id: "po1", poNumber: "PO-2024-001", vendorId: "VEN-001", status: "draft", totalAmount: "5000", paymentTerms: "Net 30", deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() },
        { id: "po2", poNumber: "PO-2024-002", vendorId: "VEN-002", status: "approved", totalAmount: "8500", paymentTerms: "Net 60", deliveryDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() }
      );
    }
    res.json(posStore);
  });
  app.post("/api/procurement/purchase-orders", (req, res) => {
    try {
      const po = {
        id: `po-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
        status: req.body.status || "draft",
      };
      posStore.push(po);
      res.status(201).json(po);
    } catch (error) {
      res.status(500).json({ error: "Failed to create PO" });
    }
  });

  // Goods Receipts
  const grnsStore: any[] = [];
  app.get("/api/procurement/goods-receipts", (req, res) => {
    if (grnsStore.length === 0) {
      grnsStore.push(
        { id: "grn1", grnNumber: "GRN-2024-001", poId: "po1", vendorId: "VEN-001", status: "received", totalQuantity: "100", receivedDate: new Date().toISOString(), qualityStatus: "hold", createdAt: new Date().toISOString() },
        { id: "grn2", grnNumber: "GRN-2024-002", poId: "po2", vendorId: "VEN-002", status: "accepted", totalQuantity: "250", receivedDate: new Date().toISOString(), qualityStatus: "accepted", createdAt: new Date().toISOString() }
      );
    }
    res.json(grnsStore);
  });
  app.post("/api/procurement/goods-receipts", (req, res) => {
    try {
      const grn = {
        id: `grn-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
        receivedDate: new Date().toISOString(),
        status: req.body.status || "received",
      };
      grnsStore.push(grn);
      res.status(201).json(grn);
    } catch (error) {
      res.status(500).json({ error: "Failed to create GRN" });
    }
  });

  // Supplier Invoices
  const supplierInvoicesStore: any[] = [];
  app.get("/api/procurement/supplier-invoices", (req, res) => {
    if (supplierInvoicesStore.length === 0) {
      supplierInvoicesStore.push(
        { id: "inv1", invoiceNumber: "INV-VEN-001-2024", vendorId: "VEN-001", poId: "po1", totalAmount: "5000", status: "exception", matchingStatus: "variance_qty", invoiceDate: new Date().toISOString(), dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() },
        { id: "inv2", invoiceNumber: "INV-VEN-002-2024", vendorId: "VEN-002", poId: "po2", totalAmount: "8500", status: "matched_po_grn", matchingStatus: "3_way", invoiceDate: new Date().toISOString(), dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() }
      );
    }
    res.json(supplierInvoicesStore);
  });
  app.post("/api/procurement/supplier-invoices", (req, res) => {
    try {
      const invoice = {
        id: `inv-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
        status: req.body.status || "received",
      };
      supplierInvoicesStore.push(invoice);
      res.status(201).json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Failed to create supplier invoice" });
    }
  });

  // Three-Way Matches
  const threeWayMatchesStore: any[] = [];
  app.get("/api/procurement/three-way-matches", (req, res) => {
    if (threeWayMatchesStore.length === 0) {
      threeWayMatchesStore.push(
        { id: "match1", poId: "po1", grnId: "grn1", invoiceId: "inv1", matchStatus: "variance_qty", quantityVariance: "10", toleranceExceeded: true, approvalRequired: true, createdAt: new Date().toISOString() },
        { id: "match2", poId: "po2", grnId: "grn2", invoiceId: "inv2", matchStatus: "matched", quantityVariance: null, priceVariance: null, toleranceExceeded: false, approvalRequired: false, matchedAt: new Date().toISOString(), createdAt: new Date().toISOString() }
      );
    }
    res.json(threeWayMatchesStore);
  });
  app.post("/api/procurement/three-way-matches", (req, res) => {
    try {
      const match = {
        id: `match-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
      };
      threeWayMatchesStore.push(match);
      res.status(201).json(match);
    } catch (error) {
      res.status(500).json({ error: "Failed to create three-way match" });
    }
  });

  // ========== PHASE 4: FINANCE & ACCOUNTING APIs ==========

  // Chart of Accounts
  const coaStore: any[] = [];
  app.get("/api/finance/chart-of-accounts", (req, res) => {
    if (coaStore.length === 0) {
      coaStore.push(
        { id: "1", accountCode: "1000", accountName: "Cash", accountType: "Asset", normalBalance: "Debit", isActive: true, description: "Company cash and equivalents" },
        { id: "2", accountCode: "1100", accountName: "Accounts Receivable", accountType: "Asset", normalBalance: "Debit", isActive: true, description: "Customer receivables" },
        { id: "3", accountCode: "2000", accountName: "Accounts Payable", accountType: "Liability", normalBalance: "Credit", isActive: true, description: "Vendor payables" },
        { id: "4", accountCode: "4000", accountName: "Sales Revenue", accountType: "Revenue", normalBalance: "Credit", isActive: true, description: "Operating revenue" },
        { id: "5", accountCode: "5000", accountName: "Operating Expenses", accountType: "Expense", normalBalance: "Debit", isActive: true, description: "Day-to-day expenses" }
      );
    }
    res.json(coaStore);
  });
  app.post("/api/finance/chart-of-accounts", (req, res) => {
    const account = { id: `coa-${Date.now()}`, ...req.body };
    coaStore.push(account);
    res.status(201).json(account);
  });

  // General Ledger
  const gleStore: any[] = [];
  app.get("/api/finance/general-ledger", (req, res) => {
    if (gleStore.length === 0) {
      gleStore.push(
        { id: "gle1", journalEntryId: "JE001", accountId: "1000", debitAmount: "5000", creditAmount: "0", description: "Cash deposit", isPosted: true },
        { id: "gle2", journalEntryId: "JE001", accountId: "2000", debitAmount: "0", creditAmount: "5000", description: "Vendor payment", isPosted: true }
      );
    }
    res.json(gleStore);
  });
  app.post("/api/finance/general-ledger", (req, res) => {
    const entry = { id: `gle-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    gleStore.push(entry);
    res.status(201).json(entry);
  });

  // AP Invoices
  const apStore: any[] = [];
  app.get("/api/finance/ap-invoices", (req, res) => {
    if (apStore.length === 0) {
      apStore.push(
        { id: "ap1", invoiceNumber: "INV-2024-001", vendorId: "V001", invoiceDate: new Date().toISOString(), dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), invoiceAmount: "5000", paidAmount: "0", status: "approved" },
        { id: "ap2", invoiceNumber: "INV-2024-002", vendorId: "V002", invoiceDate: new Date().toISOString(), invoiceAmount: "3500", paidAmount: "3500", status: "paid" }
      );
    }
    res.json(apStore);
  });
  app.post("/api/finance/ap-invoices", (req, res) => {
    const invoice = { id: `ap-${Date.now()}`, ...req.body };
    apStore.push(invoice);
    res.status(201).json(invoice);
  });

  // AR Invoices
  const arStore: any[] = [];
  app.get("/api/finance/ar-invoices", (req, res) => {
    if (arStore.length === 0) {
      arStore.push(
        { id: "ar1", invoiceNumber: "AR-2024-001", customerId: "C001", invoiceDate: new Date().toISOString(), dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), invoiceAmount: "8000", receivedAmount: "4000", status: "issued" },
        { id: "ar2", invoiceNumber: "AR-2024-002", customerId: "C002", invoiceDate: new Date().toISOString(), invoiceAmount: "5500", receivedAmount: "5500", status: "paid" }
      );
    }
    res.json(arStore);
  });
  app.post("/api/finance/ar-invoices", (req, res) => {
    const invoice = { id: `ar-${Date.now()}`, ...req.body };
    arStore.push(invoice);
    res.status(201).json(invoice);
  });

  // Bank Accounts
  const bankStore: any[] = [];
  app.get("/api/finance/bank-accounts", (req, res) => {
    if (bankStore.length === 0) {
      bankStore.push(
        { id: "b1", accountNumber: "123456789", bankName: "Primary Bank", currency: "USD", accountBalance: "50000", isActive: true },
        { id: "b2", accountNumber: "987654321", bankName: "Secondary Bank", currency: "USD", accountBalance: "25000", isActive: true }
      );
    }
    res.json(bankStore);
  });
  app.post("/api/finance/bank-accounts", (req, res) => {
    const account = { id: `bank-${Date.now()}`, ...req.body };
    bankStore.push(account);
    res.status(201).json(account);
  });

  // Bank Reconciliations
  const bankRecStore: any[] = [];
  app.get("/api/finance/bank-reconciliations", (req, res) => {
    if (bankRecStore.length === 0) {
      bankRecStore.push(
        { id: "rec1", bankAccountId: "b1", statementDate: new Date().toISOString(), statementBalance: "50000", bookBalance: "50000", difference: "0", status: "reconciled" },
        { id: "rec2", bankAccountId: "b2", statementDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), statementBalance: "25000", bookBalance: "25000", difference: "0", status: "reconciled" }
      );
    }
    res.json(bankRecStore);
  });
  app.post("/api/finance/bank-reconciliations", (req, res) => {
    const rec = { id: `rec-${Date.now()}`, ...req.body };
    bankRecStore.push(rec);
    res.status(201).json(rec);
  });

  // ========== PHASE 5: HRMS & PAYROLL APIs ==========

  // Employees
  const employeesStore: any[] = [];
  app.get("/api/hr/employees", (req, res) => {
    if (employeesStore.length === 0) {
      employeesStore.push(
        { id: "e1", firstName: "John", lastName: "Smith", department: "Engineering", designation: "Senior Developer", status: "active" },
        { id: "e2", firstName: "Sarah", lastName: "Johnson", department: "Sales", designation: "Account Executive", status: "active" },
        { id: "e3", firstName: "Mike", lastName: "Williams", department: "Finance", designation: "CFO", status: "active" }
      );
    }
    res.json(employeesStore);
  });
  app.post("/api/hr/employees", (req, res) => {
    const emp = { id: `emp-${Date.now()}`, ...req.body };
    employeesStore.push(emp);
    res.status(201).json(emp);
  });

  // Payroll Runs
  const payrollRunsStore: any[] = [];
  app.get("/api/hr/payroll-runs", (req, res) => {
    if (payrollRunsStore.length === 0) {
      payrollRunsStore.push(
        { id: "pr1", periodStart: "2024-01-01", periodEnd: "2024-01-31", totalAmount: "150000", employeeCount: 25, status: "processed" },
        { id: "pr2", periodStart: "2024-02-01", periodEnd: "2024-02-29", totalAmount: "155000", employeeCount: 26, status: "draft" }
      );
    }
    res.json(payrollRunsStore);
  });
  app.post("/api/hr/payroll-runs", (req, res) => {
    const run = { id: `pr-${Date.now()}`, ...req.body };
    payrollRunsStore.push(run);
    res.status(201).json(run);
  });

  // ========== PHASE 6: CRM & SALES APIs ==========

  // Opportunities
  const opportunitiesStore: any[] = [];
  app.get("/api/crm/opportunities", (req, res) => {
    if (opportunitiesStore.length === 0) {
      opportunitiesStore.push(
        { id: "o1", name: "Enterprise SaaS Deal", account: "Acme Corp", value: "500000", status: "proposal" },
        { id: "o2", name: "Mid-Market Expansion", account: "TechFlow Inc", value: "250000", status: "negotiation" },
        { id: "o3", name: "Startup Integration", account: "StartupXYZ", value: "75000", status: "qualified" }
      );
    }
    res.json(opportunitiesStore);
  });
  app.post("/api/crm/opportunities", (req, res) => {
    const opp = { id: `opp-${Date.now()}`, ...req.body };
    opportunitiesStore.push(opp);
    res.status(201).json(opp);
  });

  // ========== PHASE 7: INVENTORY APIs ==========
  const inventoryStore: any[] = [];
  app.get("/api/inventory/items", (req, res) => {
    if (inventoryStore.length === 0) {
      inventoryStore.push(
        { id: "inv1", sku: "SKU-001", quantity: "500", reorderLevel: "100", unitPrice: "25", warehouseId: "WH-01" },
        { id: "inv2", sku: "SKU-002", quantity: "50", reorderLevel: "100", unitPrice: "45", warehouseId: "WH-01" },
        { id: "inv3", sku: "SKU-003", quantity: "250", reorderLevel: "50", unitPrice: "15", warehouseId: "WH-02" }
      );
    }
    res.json(inventoryStore);
  });
  app.post("/api/inventory/items", (req, res) => {
    const item = { id: `inv-${Date.now()}`, ...req.body };
    inventoryStore.push(item);
    res.status(201).json(item);
  });

  // ========== PHASE 8: MANUFACTURING APIs ==========
  const workOrdersStore: any[] = [];
  app.get("/api/manufacturing/work-orders", (req, res) => {
    if (workOrdersStore.length === 0) {
      workOrdersStore.push(
        { id: "wo1", orderNumber: "WO-001", bomId: "BOM-01", quantity: "100", status: "in_progress" },
        { id: "wo2", orderNumber: "WO-002", bomId: "BOM-02", quantity: "50", status: "completed" }
      );
    }
    res.json(workOrdersStore);
  });
  app.post("/api/manufacturing/work-orders", (req, res) => {
    const wo = { id: `wo-${Date.now()}`, ...req.body };
    workOrdersStore.push(wo);
    res.status(201).json(wo);
  });

  // ========== PHASE 9: EPM & ANALYTICS APIs ==========
  const budgetsStore: any[] = [];
  app.get("/api/epm/budgets", (req, res) => {
    if (budgetsStore.length === 0) {
      budgetsStore.push(
        { id: "b1", department: "Engineering", amount: "500000", spent: "350000", period: "2024-Q1" },
        { id: "b2", department: "Sales", amount: "250000", spent: "180000", period: "2024-Q1" }
      );
    }
    res.json(budgetsStore);
  });
  app.post("/api/epm/budgets", (req, res) => {
    const budget = { id: `budget-${Date.now()}`, ...req.body };
    budgetsStore.push(budget);
    res.status(201).json(budget);
  });

  // ========== PHASE 10: SUPPORT APIs ==========
  const ticketsStore: any[] = [];
  app.get("/api/support/tickets", (req, res) => {
    if (ticketsStore.length === 0) {
      ticketsStore.push(
        { id: "t1", title: "Login Issue", customerName: "John Doe", status: "open", priority: "high" },
        { id: "t2", title: "Feature Request", customerName: "Jane Smith", status: "resolved", priority: "low" }
      );
    }
    res.json(ticketsStore);
  });
  app.post("/api/support/tickets", (req, res) => {
    const ticket = { id: `ticket-${Date.now()}`, ...req.body };
    ticketsStore.push(ticket);
    res.status(201).json(ticket);
  });

  // ========== PHASE 11: MARKETING APIs ==========
  const campaignsStore: any[] = [];
  app.get("/api/marketing/campaigns", (req, res) => {
    if (campaignsStore.length === 0) {
      campaignsStore.push(
        { id: "c1", name: "Q1 Product Launch", budget: "50000", status: "active" },
        { id: "c2", name: "Holiday Promotion", budget: "75000", status: "completed" }
      );
    }
    res.json(campaignsStore);
  });
  app.post("/api/marketing/campaigns", (req, res) => {
    const campaign = { id: `campaign-${Date.now()}`, ...req.body };
    campaignsStore.push(campaign);
    res.status(201).json(campaign);
  });

  // ========== PHASE 12: COMPLIANCE APIs ==========
  const controlsStore: any[] = [];
  app.get("/api/compliance/controls", (req, res) => {
    if (controlsStore.length === 0) {
      controlsStore.push(
        { id: "ctrl1", name: "Access Control", framework: "ISO-27001", status: "effective" },
        { id: "ctrl2", name: "Data Encryption", framework: "GDPR", status: "at_risk" }
      );
    }
    res.json(controlsStore);
  });
  app.post("/api/compliance/controls", (req, res) => {
    const control = { id: `ctrl-${Date.now()}`, ...req.body };
    controlsStore.push(control);
    res.status(201).json(control);
  });

  // ========== PHASE 13: CONTENT MANAGEMENT APIs ==========
  const pagesStore: any[] = [];
  app.get("/api/content/pages", (req, res) => {
    if (pagesStore.length === 0) {
      pagesStore.push(
        { id: "p1", title: "Home", slug: "home", status: "published" },
        { id: "p2", title: "About Us", slug: "about", status: "draft" }
      );
    }
    res.json(pagesStore);
  });
  app.post("/api/content/pages", (req, res) => {
    const page = { id: `page-${Date.now()}`, ...req.body };
    pagesStore.push(page);
    res.status(201).json(page);
  });

  // ========== PHASE 14: ADMIN APIs ==========
  const adminUsersStore: any[] = [];
  app.get("/api/admin/users", (req, res) => {
    if (adminUsersStore.length === 0) {
      adminUsersStore.push(
        { id: "u1", name: "Admin User", email: "admin@company.com", status: "active", role: "Admin" },
        { id: "u2", name: "Manager", email: "manager@company.com", status: "active", role: "Manager" }
      );
    }
    res.json(adminUsersStore);
  });
  app.get("/api/admin/roles", (req, res) => {
    if (rolesStore.length === 0) {
      rolesStore.push(
        { id: "r1", name: "Admin" },
        { id: "r2", name: "Manager" },
        { id: "r3", name: "User" }
      );
    }
    res.json(rolesStore);
  });
  app.post("/api/admin/users", (req, res) => {
    const user = { id: `user-${Date.now()}`, ...req.body };
    adminUsersStore.push(user);
    res.status(201).json(user);
  });

  // ========== PHASE 15+: ADVANCED ENTERPRISE APIs ==========
  
  // Integration Connections
  const integrationsStore: any[] = [];
  app.get("/api/integration/connections", (req, res) => {
    if (integrationsStore.length === 0) {
      integrationsStore.push(
        { id: "int1", name: "Stripe", type: "payment", status: "active" },
        { id: "int2", name: "Salesforce", type: "crm", status: "active" }
      );
    }
    res.json(integrationsStore);
  });

  // AI Models
  const aiModelsStore: any[] = [];
  app.get("/api/ai/models", (req, res) => {
    if (aiModelsStore.length === 0) {
      aiModelsStore.push(
        { id: "m1", name: "CRM Copilot", domain: "sales", type: "copilot" },
        { id: "m2", name: "HR Copilot", domain: "hr", type: "copilot" }
      );
    }
    res.json(aiModelsStore);
  });

  app.get("/api/ai/conversations", (req, res) => {
    res.json([
      { id: "c1", title: "Sales Strategy", messages: 12, timestamp: new Date().toISOString() },
      { id: "c2", title: "Payroll Questions", messages: 8, timestamp: new Date().toISOString() }
    ]);
  });

  // Analytics Metrics
  const analyticsStore: any[] = [];
  app.get("/api/analytics/advanced", (req, res) => {
    if (analyticsStore.length === 0) {
      analyticsStore.push(
        { id: "a1", name: "Revenue Growth", value: "+23%" },
        { id: "a2", name: "Customer Churn", value: "-2.1%" }
      );
    }
    res.json(analyticsStore);
  });

  // Tenants
  const tenantsStore: any[] = [];
  app.get("/api/admin/tenants", (req, res) => {
    if (tenantsStore.length === 0) {
      tenantsStore.push(
        { id: "t1", name: "Acme Corp", domain: "acme.nexusai.com", status: "active" },
        { id: "t2", name: "TechFlow", domain: "techflow.nexusai.com", status: "active" }
      );
    }
    res.json(tenantsStore);
  });

  // Security Policies
  const securityStore: any[] = [];
  app.get("/api/security/policies", (req, res) => {
    if (securityStore.length === 0) {
      securityStore.push(
        { id: "s1", name: "2FA Enforcement", type: "authentication", status: "active" },
        { id: "s2", name: "Data Encryption", type: "encryption", status: "active" }
      );
    }
    res.json(securityStore);
  });

  // Audit Logs
  const auditStore: any[] = [];
  app.get("/api/audit/logs", (req, res) => {
    if (auditStore.length === 0) {
      auditStore.push(
        { id: "log1", action: "User Login", user: "admin@company.com", timestamp: new Date().toISOString() },
        { id: "log2", action: "Report Generated", user: "manager@company.com", timestamp: new Date(Date.now() - 3600000).toISOString() }
      );
    }
    res.json(auditStore);
  });

  // Warehouses
  const warehousesStore: any[] = [];
  app.get("/api/warehouse/locations", (req, res) => {
    if (warehousesStore.length === 0) {
      warehousesStore.push(
        { id: "wh1", name: "Main Warehouse", location: "New York, NY", status: "active" },
        { id: "wh2", name: "Regional Hub", location: "Chicago, IL", status: "active" }
      );
    }
    res.json(warehousesStore);
  });

  // Suppliers
  const suppliersStore: any[] = [];
  app.get("/api/procurement/suppliers", (req, res) => {
    if (suppliersStore.length === 0) {
      suppliersStore.push(
        { id: "sup1", name: "Global Parts Inc", category: "electronics", status: "active" },
        { id: "sup2", name: "Premium Materials", category: "raw-materials", status: "active" }
      );
    }
    res.json(suppliersStore);
  });

  // Loyalty Members
  const loyaltyStore: any[] = [];
  app.get("/api/loyalty/members", (req, res) => {
    if (loyaltyStore.length === 0) {
      loyaltyStore.push(
        { id: "lm1", name: "Alice Johnson", tier: "Gold", points: 5500 },
        { id: "lm2", name: "Bob Smith", tier: "Silver", points: 2300 }
      );
    }
    res.json(loyaltyStore);
  });

  // APIs
  const apisStore: any[] = [];
  app.get("/api/admin/api-list", (req, res) => {
    if (apisStore.length === 0) {
      apisStore.push(
        { id: "api1", method: "GET", path: "/api/invoices", calls: "45000" },
        { id: "api2", method: "POST", path: "/api/invoices", calls: "12000" }
      );
    }
    res.json(apisStore);
  });

  // Data Governance
  app.get("/api/data-governance/policies", (req, res) => {
    res.json([
      { id: "dg1", name: "Data Classification", status: "active" },
      { id: "dg2", name: "Retention Policy", status: "active" }
    ]);
  });

  // Business Intelligence
  app.get("/api/bi/dashboards", (req, res) => {
    res.json([
      { id: "bi1", name: "Executive Dashboard", views: 1200 },
      { id: "bi2", name: "Sales Dashboard", views: 3400 }
    ]);
  });

  // Voice of Customer
  app.get("/api/voc/feedback", (req, res) => {
    res.json([
      { id: "voc1", feedback: "Great platform", sentiment: "positive" },
      { id: "voc2", feedback: "Needs improvement", sentiment: "neutral" }
    ]);
  });

  // Procurement Automation
  app.get("/api/procurement/automation-rules", (req, res) => {
    res.json([
      { id: "pa1", name: "Auto-approve <$1000", status: "active" },
      { id: "pa2", name: "Route to CFO >$50000", status: "active" }
    ]);
  });

  // Risk Management
  app.get("/api/risk/register", (req, res) => {
    res.json([
      { id: "rm1", risk: "Market volatility", probability: "high", impact: "high", status: "active" },
      { id: "rm2", risk: "Supply chain disruption", probability: "medium", impact: "high", status: "mitigated" }
    ]);
  });

  // Employee Engagement
  app.get("/api/hr/engagement", (req, res) => {
    res.json([{ surveyScore: 7.8, participation: 87, actionItems: 24 }]);
  });

  // Succession Planning
  app.get("/api/hr/succession", (req, res) => {
    res.json([{ keyPositions: 12, readyNow: 8, inDevelopment: 4 }]);
  });

  // Capacity Planning
  app.get("/api/resource/capacity", (req, res) => {
    res.json([{ totalCapacity: 2400, utilization: 82, available: 432 }]);
  });

  // Change Management
  app.get("/api/operations/changes", (req, res) => {
    res.json([{ total: 34, approved: 28, inProgress: 6 }]);
  });

  // Cost Optimization
  app.get("/api/finance/cost-optimization", (req, res) => {
    res.json([{ opportunities: 47, realized: 2300000, pipeline: 1800000 }]);
  });

  // Sustainability
  app.get("/api/esg/metrics", (req, res) => {
    res.json([{ carbon: 1234, reductionYoY: -12, esgScore: 78 }]);
  });

  // Quality Assurance
  app.get("/api/quality/metrics", (req, res) => {
    res.json([{ tests: 1234, passRate: 96, defects: 12 }]);
  });

  // ========== PHASE 3B: PROJECTS & AGILE APIs ==========

  // Epics
  const epicsStore: any[] = [];
  app.get("/api/projects/epics", (req, res) => {
    if (epicsStore.length === 0) {
      epicsStore.push(
        { id: "epic1", epicKey: "EPIC-001", name: "Mobile App Redesign", description: "Modernize mobile UI", status: "active", priority: "high", owner: "Sarah Chen", startDate: new Date().toISOString(), targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "epic2", epicKey: "EPIC-002", name: "API Performance", description: "Optimize backend", status: "backlog", priority: "medium", owner: "John Dev", startDate: null, targetDate: null }
      );
    }
    res.json(epicsStore);
  });
  app.post("/api/projects/epics", (req, res) => {
    const epic = { id: `epic-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    epicsStore.push(epic);
    res.status(201).json(epic);
  });

  // Stories
  const storiesStore: any[] = [];
  app.get("/api/projects/stories", (req, res) => {
    if (storiesStore.length === 0) {
      storiesStore.push(
        { id: "story1", storyKey: "STORY-001", epicId: "epic1", title: "Add dark mode toggle", description: "Implement dark/light theme", acceptanceCriteria: "Theme persists on refresh", status: "in_progress", priority: "high", storyPoints: 5, assignee: "Alice Dev", sprintId: "sprint1", dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "story2", storyKey: "STORY-002", epicId: "epic1", title: "Redesign dashboard", description: "New dashboard layout", status: "todo", priority: "medium", storyPoints: 8, assignee: "Bob Designer", sprintId: "sprint1", dueDate: null }
      );
    }
    res.json(storiesStore);
  });
  app.post("/api/projects/stories", (req, res) => {
    const story = { id: `story-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    storiesStore.push(story);
    res.status(201).json(story);
  });

  // Sprints - commented out (handled by PHASE 3 endpoints below)


  // ========== PHASE 1: TENANT MANAGEMENT ==========
  app.get("/api/tenants", (req, res) => {
    res.json(tenantsStore);
  });

  app.post("/api/tenants", (req, res) => {
    try {
      const tenant = {
        id: `tenant-${Date.now()}`,
        name: req.body.name,
        slug: req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-'),
        status: "active",
        createdAt: new Date().toISOString()
      };
      tenantsStore.push(tenant);
      res.status(201).json(tenant);
    } catch (error) {
      res.status(400).json({ error: "Failed to create tenant" });
    }
  });

  app.get("/api/tenants/:id", (req, res) => {
    const tenant = tenantsStore.find(t => t.id === req.params.id);
    res.json(tenant || {});
  });

  // ========== PHASE 1: BILLING PLANS ==========
  app.get("/api/plans", (req, res) => {
    res.json(plansStore);
  });

  app.post("/api/plans", (req, res) => {
    try {
      const plan = {
        id: `plan-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString()
      };
      plansStore.push(plan);
      res.status(201).json(plan);
    } catch (error) {
      res.status(400).json({ error: "Failed to create plan" });
    }
  });

  // ========== PHASE 1: SUBSCRIPTIONS ==========
  app.get("/api/subscriptions", (req, res) => {
    res.json(subscriptionsStore);
  });

  app.get("/api/subscriptions/:tenantId", (req, res) => {
    const subs = subscriptionsStore.filter(s => s.tenantId === req.params.tenantId);
    res.json(subs);
  });

  app.post("/api/subscriptions", (req, res) => {
    try {
      const subscription = {
        id: `sub-${Date.now()}`,
        tenantId: req.body.tenantId,
        planId: req.body.planId,
        status: "active",
        startDate: new Date().toISOString(),
        autoRenew: true,
        createdAt: new Date().toISOString()
      };
      subscriptionsStore.push(subscription);
      res.status(201).json(subscription);
    } catch (error) {
      res.status(400).json({ error: "Failed to create subscription" });
    }
  });

  // ========== PHASE 1: PAYMENTS ==========
  app.get("/api/payments-phase1", (req, res) => {
    res.json(paymentsPhase1Store);
  });

  app.post("/api/payments-phase1", (req, res) => {
    try {
      const payment = {
        id: `payment-${Date.now()}`,
        invoiceId: req.body.invoiceId,
        amount: req.body.amount,
        method: req.body.method || "credit_card",
        status: "completed",
        createdAt: new Date().toISOString()
      };
      paymentsPhase1Store.push(payment);
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ error: "Failed to create payment" });
    }
  });

  // ========== PHASE 1: API GATEWAY & API KEYS ==========
  const rolesStore: any[] = [
    { id: "role1", tenantId: "tenant1", name: "Admin", permissions: ["read", "write", "delete"], status: "active", createdAt: new Date().toISOString() },
    { id: "role2", tenantId: "tenant1", name: "Editor", permissions: ["read", "write"], status: "active", createdAt: new Date().toISOString() },
    { id: "role3", tenantId: "tenant1", name: "Viewer", permissions: ["read"], status: "active", createdAt: new Date().toISOString() }
  ];
  const apiKeysStore: any[] = [];

  app.get("/api/roles", (req, res) => {
    const tenantId = req.query.tenantId as string;
    const roles = tenantId ? rolesStore.filter(r => r.tenantId === tenantId) : rolesStore;
    res.json(roles);
  });

  app.post("/api/roles", (req, res) => {
    try {
      const role = {
        id: `role-${Date.now()}`,
        tenantId: req.body.tenantId,
        name: req.body.name,
        permissions: req.body.permissions || [],
        status: "active",
        createdAt: new Date().toISOString()
      };
      rolesStore.push(role);
      res.status(201).json(role);
    } catch (error) {
      res.status(400).json({ error: "Failed to create role" });
    }
  });

  app.get("/api/api-keys", (req, res) => {
    const tenantId = req.query.tenantId as string;
    const keys = tenantId ? apiKeysStore.filter(k => k.tenantId === tenantId) : apiKeysStore;
    res.json(keys);
  });

  app.post("/api/api-keys", (req, res) => {
    try {
      const key = Math.random().toString(36).substring(2, 15);
      const apiKey = {
        id: `key-${Date.now()}`,
        tenantId: req.body.tenantId,
        name: req.body.name,
        key: key,
        permissions: req.body.permissions || ["read"],
        status: "active",
        createdAt: new Date().toISOString()
      };
      apiKeysStore.push(apiKey);
      res.status(201).json(apiKey);
    } catch (error) {
      res.status(400).json({ error: "Failed to create API key" });
    }
  });

  app.delete("/api/api-keys/:id", (req, res) => {
    const idx = apiKeysStore.findIndex(k => k.id === req.params.id);
    if (idx !== -1) {
      apiKeysStore.splice(idx, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "API key not found" });
    }
  });

  // ========== PHASE 2: CRM ENDPOINTS ==========
  const crmAccountsStore: any[] = [];
  const crmOpportunitiesStore: any[] = [];
  const crmContactsStore: any[] = [];

  app.get("/api/crm/accounts", (req, res) => {
    if (crmAccountsStore.length === 0) {
      crmAccountsStore.push(
        { id: "acc1", name: "Tech Corp", industry: "Technology", revenue: "50M", employees: 500, status: "active", createdAt: new Date().toISOString() },
        { id: "acc2", name: "Finance Inc", industry: "Finance", revenue: "75M", employees: 750, status: "active", createdAt: new Date().toISOString() }
      );
    }
    res.json(crmAccountsStore);
  });

  app.post("/api/crm/accounts", (req, res) => {
    const account = { id: `acc-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    crmAccountsStore.push(account);
    res.status(201).json(account);
  });

  app.get("/api/crm/opportunities", (req, res) => {
    if (crmOpportunitiesStore.length === 0) {
      crmOpportunitiesStore.push(
        { id: "opp1", name: "Enterprise License", accountId: "acc1", amount: "500000", stage: "negotiation", probability: 75, status: "open", createdAt: new Date().toISOString() },
        { id: "opp2", name: "Implementation Services", accountId: "acc2", amount: "150000", stage: "proposal", probability: 50, status: "open", createdAt: new Date().toISOString() }
      );
    }
    res.json(crmOpportunitiesStore);
  });

  app.post("/api/crm/opportunities", (req, res) => {
    const opp = { id: `opp-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    crmOpportunitiesStore.push(opp);
    res.status(201).json(opp);
  });

  app.get("/api/crm/contacts", (req, res) => {
    res.json(crmContactsStore.length === 0 ? [{ id: "con1", firstName: "John", lastName: "Smith", email: "john@techcorp.com", phone: "555-0100", accountId: "acc1", jobTitle: "CTO", status: "active", createdAt: new Date().toISOString() }] : crmContactsStore);
  });

  app.post("/api/crm/contacts", (req, res) => {
    const contact = { id: `con-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    crmContactsStore.push(contact);
    res.status(201).json(contact);
  });

  // ========== PHASE 2: FINANCE ENDPOINTS ==========
  const financeExpensesStore: any[] = [];
  const financeRevenueStore: any[] = [];
  const financeForecastsStore: any[] = [];

  app.get("/api/finance/expenses", (req, res) => {
    if (financeExpensesStore.length === 0) {
      financeExpensesStore.push(
        { id: "exp1", description: "Software Licenses", amount: "25000", category: "Software", vendor: "Adobe", status: "paid", createdAt: new Date().toISOString() },
        { id: "exp2", description: "Team Salaries", amount: "150000", category: "Payroll", vendor: "Internal", status: "paid", createdAt: new Date().toISOString() }
      );
    }
    res.json(financeExpensesStore);
  });

  app.post("/api/finance/expenses", (req, res) => {
    const expense = { id: `exp-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    financeExpensesStore.push(expense);
    res.status(201).json(expense);
  });

  app.get("/api/finance/revenue", (req, res) => {
    if (financeRevenueStore.length === 0) {
      financeRevenueStore.push(
        { id: "rev1", description: "Product Sales", amount: "800000", source: "Direct", status: "received", createdAt: new Date().toISOString() },
        { id: "rev2", description: "Service Revenue", amount: "300000", source: "Consulting", status: "received", createdAt: new Date().toISOString() }
      );
    }
    res.json(financeRevenueStore);
  });

  app.post("/api/finance/revenue", (req, res) => {
    const revenue = { id: `rev-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    financeRevenueStore.push(revenue);
    res.status(201).json(revenue);
  });

  app.get("/api/finance/forecasts", (req, res) => {
    res.json(financeForecastsStore.length === 0 ? [{ id: "fc1", period: "Q1 2024", revenue: "1200000", expenses: "450000", confidence: 85, createdAt: new Date().toISOString() }] : financeForecastsStore);
  });

  app.post("/api/finance/forecasts", (req, res) => {
    const forecast = { id: `fc-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    financeForecastsStore.push(forecast);
    res.status(201).json(forecast);
  });

  // ========== PHASE 2: HR ENDPOINTS ==========
  const hrJobPostingsStore: any[] = [];
  const hrCandidatesStore: any[] = [];
  const hrTrainingStore: any[] = [];

  app.get("/api/hr/job-postings", (req, res) => {
    if (hrJobPostingsStore.length === 0) {
      hrJobPostingsStore.push(
        { id: "job1", title: "Senior Developer", department: "Engineering", requirements: "5+ years experience", salary: "120000", status: "open", createdAt: new Date().toISOString() },
        { id: "job2", title: "Product Manager", department: "Product", requirements: "3+ years PM experience", salary: "110000", status: "open", createdAt: new Date().toISOString() }
      );
    }
    res.json(hrJobPostingsStore);
  });

  app.post("/api/hr/job-postings", (req, res) => {
    const job = { id: `job-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    hrJobPostingsStore.push(job);
    res.status(201).json(job);
  });

  app.get("/api/hr/candidates", (req, res) => {
    if (hrCandidatesStore.length === 0) {
      hrCandidatesStore.push(
        { id: "cand1", name: "Alice Johnson", email: "alice@email.com", phone: "555-0101", position: "Senior Developer", status: "applied", rating: 4, createdAt: new Date().toISOString() },
        { id: "cand2", name: "Bob Smith", email: "bob@email.com", phone: "555-0102", position: "Product Manager", status: "interview", rating: 5, createdAt: new Date().toISOString() }
      );
    }
    res.json(hrCandidatesStore);
  });

  app.post("/api/hr/candidates", (req, res) => {
    const candidate = { id: `cand-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    hrCandidatesStore.push(candidate);
    res.status(201).json(candidate);
  });

  app.get("/api/hr/training", (req, res) => {
    res.json(hrTrainingStore.length === 0 ? [{ id: "train1", name: "Leadership Development", duration: 40, provider: "LinkedIn Learning", status: "scheduled", createdAt: new Date().toISOString() }] : hrTrainingStore);
  });

  app.post("/api/hr/training", (req, res) => {
    const training = { id: `train-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    hrTrainingStore.push(training);
    res.status(201).json(training);
  });

  // ========== PHASE 2: ERP ENDPOINTS ==========
  const erpPurchaseOrdersStore: any[] = [];
  const erpInventoryStore: any[] = [];
  const erpSalesOrdersStore: any[] = [];

  app.get("/api/erp/purchase-orders", (req, res) => {
    if (erpPurchaseOrdersStore.length === 0) {
      erpPurchaseOrdersStore.push(
        { id: "po1", poNumber: "PO-001", vendorId: "v1", amount: "50000", status: "open", createdAt: new Date().toISOString() },
        { id: "po2", poNumber: "PO-002", vendorId: "v2", amount: "75000", status: "received", createdAt: new Date().toISOString() }
      );
    }
    res.json(erpPurchaseOrdersStore);
  });

  app.post("/api/erp/purchase-orders", (req, res) => {
    const po = { id: `po-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    erpPurchaseOrdersStore.push(po);
    res.status(201).json(po);
  });

  app.get("/api/erp/inventory", (req, res) => {
    if (erpInventoryStore.length === 0) {
      erpInventoryStore.push(
        { id: "inv1", sku: "SKU-001", productName: "Widget A", quantity: 500, reorderLevel: 100, status: "active", createdAt: new Date().toISOString() },
        { id: "inv2", sku: "SKU-002", productName: "Component B", quantity: 250, reorderLevel: 50, status: "active", createdAt: new Date().toISOString() }
      );
    }
    res.json(erpInventoryStore);
  });

  app.post("/api/erp/inventory", (req, res) => {
    const inv = { id: `inv-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    erpInventoryStore.push(inv);
    res.status(201).json(inv);
  });

  app.get("/api/erp/sales-orders", (req, res) => {
    res.json(erpSalesOrdersStore.length === 0 ? [{ id: "so1", soNumber: "SO-001", customerId: "c1", totalAmount: "15000", status: "shipped", createdAt: new Date().toISOString() }] : erpSalesOrdersStore);
  });

  app.post("/api/erp/sales-orders", (req, res) => {
    const so = { id: `so-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    erpSalesOrdersStore.push(so);
    res.status(201).json(so);
  });

  // ========== PHASE 2: SERVICE ENDPOINTS ==========
  const serviceContractsStore: any[] = [];
  const serviceIncidentsStore: any[] = [];
  const serviceSLAStore: any[] = [];

  app.get("/api/service/contracts", (req, res) => {
    if (serviceContractsStore.length === 0) {
      serviceContractsStore.push(
        { id: "sc1", contractNumber: "SC-001", customerId: "c1", serviceType: "Premium Support", amount: "50000", status: "active", createdAt: new Date().toISOString() },
        { id: "sc2", contractNumber: "SC-002", customerId: "c2", serviceType: "Enterprise Plus", amount: "75000", status: "active", createdAt: new Date().toISOString() }
      );
    }
    res.json(serviceContractsStore);
  });

  app.post("/api/service/contracts", (req, res) => {
    const contract = { id: `sc-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    serviceContractsStore.push(contract);
    res.status(201).json(contract);
  });

  app.get("/api/service/incidents", (req, res) => {
    if (serviceIncidentsStore.length === 0) {
      serviceIncidentsStore.push(
        { id: "inc1", incidentNumber: "INC-001", customerId: "c1", title: "System Outage", severity: "critical", status: "open", createdAt: new Date().toISOString() },
        { id: "inc2", incidentNumber: "INC-002", customerId: "c2", title: "Database Connection", severity: "high", status: "in-progress", createdAt: new Date().toISOString() }
      );
    }
    res.json(serviceIncidentsStore);
  });

  app.post("/api/service/incidents", (req, res) => {
    const incident = { id: `inc-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    serviceIncidentsStore.push(incident);
    res.status(201).json(incident);
  });

  app.get("/api/service/sla", (req, res) => {
    res.json(serviceSLAStore.length === 0 ? [{ id: "sla1", name: "Premium SLA", responseTime: 60, resolutionTime: 480, uptime: "99.9", status: "active", createdAt: new Date().toISOString() }] : serviceSLAStore);
  });

  app.post("/api/service/sla", (req, res) => {
    const sla = { id: `sla-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    serviceSLAStore.push(sla);
    res.status(201).json(sla);
  });

  // ========== PHASE 3: PROJECTS ENDPOINTS ==========
  const phase3ProjectsStore: any[] = [];
  const phase3SprintsStore: any[] = [];
  const phase3TasksStore: any[] = [];

  app.get("/api/projects", (req, res) => {
    if (phase3ProjectsStore.length === 0) {
      phase3ProjectsStore.push(
        { id: "p1", name: "Platform Migration", progress: 75, status: "active", budget: "250000", createdAt: new Date().toISOString() },
        { id: "p2", name: "Mobile App", progress: 45, status: "active", budget: "180000", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase3ProjectsStore);
  });

  app.post("/api/projects", (req, res) => {
    const proj = { id: `p-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase3ProjectsStore.push(proj);
    res.status(201).json(proj);
  });

  app.get("/api/sprints", (req, res) => {
    if (phase3SprintsStore.length === 0) {
      phase3SprintsStore.push(
        { id: "s1", projectId: "p1", name: "Sprint 25", status: "active", goal: "Complete API", createdAt: new Date().toISOString() },
        { id: "s2", projectId: "p1", name: "Sprint 26", status: "planned", goal: "Frontend work", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase3SprintsStore);
  });

  app.post("/api/sprints", (req, res) => {
    const sprint = { id: `s-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase3SprintsStore.push(sprint);
    res.status(201).json(sprint);
  });

  app.get("/api/tasks", (req, res) => {
    if (phase3TasksStore.length === 0) {
      phase3TasksStore.push(
        { id: "t1", sprintId: "s1", title: "Fix auth", priority: "high", status: "in-progress", createdAt: new Date().toISOString() },
        { id: "t2", sprintId: "s1", title: "API endpoints", priority: "high", status: "in-progress", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase3TasksStore);
  });

  app.post("/api/tasks", (req, res) => {
    const task = { id: `t-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase3TasksStore.push(task);
    res.status(201).json(task);
  });

  // ========== PHASE 3: MARKETING ENDPOINTS ==========
  const phase3CampaignsStore: any[] = [];
  const phase3SegmentsStore: any[] = [];
  const phase3LeadsStore: any[] = [];

  app.get("/api/marketing/campaigns", (req, res) => {
    if (phase3CampaignsStore.length === 0) {
      phase3CampaignsStore.push(
        { id: "c1", name: "Q1 Product Launch", channel: "Email", budget: "50000", status: "active", createdAt: new Date().toISOString() },
        { id: "c2", name: "Social Media Push", channel: "Social", budget: "30000", status: "active", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase3CampaignsStore);
  });

  app.post("/api/marketing/campaigns", (req, res) => {
    const camp = { id: `c-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase3CampaignsStore.push(camp);
    res.status(201).json(camp);
  });

  app.get("/api/marketing/segments", (req, res) => {
    if (phase3SegmentsStore.length === 0) {
      phase3SegmentsStore.push(
        { id: "seg1", name: "Enterprise Buyers", audienceSize: 1200, status: "active", createdAt: new Date().toISOString() },
        { id: "seg2", name: "SMB Prospects", audienceSize: 2800, status: "active", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase3SegmentsStore);
  });

  app.post("/api/marketing/segments", (req, res) => {
    const seg = { id: `seg-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase3SegmentsStore.push(seg);
    res.status(201).json(seg);
  });

  app.get("/api/marketing/leads", (req, res) => {
    if (phase3LeadsStore.length === 0) {
      phase3LeadsStore.push(
        { id: "l1", name: "Alice Corp", email: "alice@corp.com", score: 85, status: "qualified", createdAt: new Date().toISOString() },
        { id: "l2", name: "Bob Ltd", email: "bob@ltd.com", score: 65, status: "prospect", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase3LeadsStore);
  });

  app.post("/api/marketing/leads", (req, res) => {
    const lead = { id: `l-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase3LeadsStore.push(lead);
    res.status(201).json(lead);
  });

  // ========== PHASE 3: MANUFACTURING ENDPOINTS ==========
  const phase3BomStore: any[] = [];
  const phase3WorkOrdersStore: any[] = [];

  app.get("/api/manufacturing/bom", (req, res) => {
    if (phase3BomStore.length === 0) {
      phase3BomStore.push(
        { id: "b1", productId: "prod1", name: "Assembly A v1.0", status: "active", createdAt: new Date().toISOString() },
        { id: "b2", productId: "prod2", name: "Component B v2.1", status: "active", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase3BomStore);
  });

  app.post("/api/manufacturing/bom", (req, res) => {
    const bom = { id: `b-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase3BomStore.push(bom);
    res.status(201).json(bom);
  });

  app.get("/api/manufacturing/work-orders", (req, res) => {
    if (phase3WorkOrdersStore.length === 0) {
      phase3WorkOrdersStore.push(
        { id: "w1", woNumber: "WO-001", productId: "prod1", quantity: 500, status: "in-progress", createdAt: new Date().toISOString() },
        { id: "w2", woNumber: "WO-002", productId: "prod2", quantity: 1200, status: "scheduled", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase3WorkOrdersStore);
  });

  app.post("/api/manufacturing/work-orders", (req, res) => {
    const wo = { id: `w-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase3WorkOrdersStore.push(wo);
    res.status(201).json(wo);
  });

  // ========== PHASE 3: ANALYTICS ENDPOINTS ==========
  const phase3DashboardsStore: any[] = [];
  const phase3ReportsStore: any[] = [];

  app.get("/api/analytics/dashboards", (req, res) => {
    if (phase3DashboardsStore.length === 0) {
      phase3DashboardsStore.push(
        { id: "d1", name: "Sales Dashboard", owner: "admin", type: "sales", status: "active", createdAt: new Date().toISOString() },
        { id: "d2", name: "Revenue Dashboard", owner: "admin", type: "finance", status: "active", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase3DashboardsStore);
  });

  app.post("/api/analytics/dashboards", (req, res) => {
    const dash = { id: `d-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase3DashboardsStore.push(dash);
    res.status(201).json(dash);
  });

  app.get("/api/analytics/reports", (req, res) => {
    if (phase3ReportsStore.length === 0) {
      phase3ReportsStore.push(
        { id: "r1", name: "Monthly Report", dashboardId: "d1", status: "completed", createdAt: new Date().toISOString() },
        { id: "r2", name: "Quarterly Forecast", dashboardId: "d2", status: "pending", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase3ReportsStore);
  });

  app.post("/api/analytics/reports", (req, res) => {
    const report = { id: `r-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase3ReportsStore.push(report);
    res.status(201).json(report);
  });

  // ========== PHASE 3: ADMIN CONSOLE ENDPOINTS ==========
  const phase3LogsStore: any[] = [];
  const phase3SettingsStore: any[] = [];

  app.get("/api/admin/logs", (req, res) => {
    if (phase3LogsStore.length === 0) {
      phase3LogsStore.push(
        { id: "log1", userId: "admin1", action: "User Created", resource: "users", timestamp: new Date().toISOString() },
        { id: "log2", userId: "admin1", action: "Role Updated", resource: "roles", timestamp: new Date().toISOString() }
      );
    }
    res.json(phase3LogsStore);
  });

  app.post("/api/admin/logs", (req, res) => {
    const log = { id: `log-${Date.now()}`, ...req.body, timestamp: new Date().toISOString() };
    phase3LogsStore.push(log);
    res.status(201).json(log);
  });

  app.get("/api/admin/settings", (req, res) => {
    if (phase3SettingsStore.length === 0) {
      phase3SettingsStore.push(
        { id: "set1", key: "api_rate_limit", value: "10000", category: "api", createdAt: new Date().toISOString() },
        { id: "set2", key: "session_timeout", value: "1800", category: "security", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase3SettingsStore);
  });

  app.post("/api/admin/settings", (req, res) => {
    const setting = { id: `set-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase3SettingsStore.push(setting);
    res.status(201).json(setting);
  });

  // ========== PHASE 3: COMPLIANCE ENDPOINTS ==========
  const phase3ControlsStore: any[] = [];
  const phase3RisksStore: any[] = [];

  app.get("/api/compliance/controls", (req, res) => {
    if (phase3ControlsStore.length === 0) {
      phase3ControlsStore.push(
        { id: "ctrl1", name: "Access Control", framework: "SOC2", owner: "security", status: "active", createdAt: new Date().toISOString() },
        { id: "ctrl2", name: "Data Encryption", framework: "GDPR", owner: "security", status: "active", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase3ControlsStore);
  });

  app.post("/api/compliance/controls", (req, res) => {
    const ctrl = { id: `ctrl-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase3ControlsStore.push(ctrl);
    res.status(201).json(ctrl);
  });

  app.get("/api/compliance/risks", (req, res) => {
    if (phase3RisksStore.length === 0) {
      phase3RisksStore.push(
        { id: "risk1", name: "Data Breach", likelihood: "medium", impact: "critical", status: "open", createdAt: new Date().toISOString() },
        { id: "risk2", name: "Compliance Violation", likelihood: "low", impact: "critical", status: "open", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase3RisksStore);
  });

  app.post("/api/compliance/risks", (req, res) => {
    const risk = { id: `risk-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase3RisksStore.push(risk);
    res.status(201).json(risk);
  });

  // ========== PHASE 4: IoT ENDPOINTS ==========
  const phase4DevicesStore: any[] = [];
  const phase4SensorsStore: any[] = [];
  const phase4JobsStore: any[] = [];

  app.get("/api/iot/devices", (req, res) => {
    if (phase4DevicesStore.length === 0) {
      phase4DevicesStore.push(
        { id: "dev1", deviceName: "Sensor A", deviceType: "temperature", serialNumber: "SN-001", location: "Warehouse A", status: "active", lastHeartbeat: new Date().toISOString(), metrics: { temperature: 22.5, humidity: 45 }, createdAt: new Date().toISOString() },
        { id: "dev2", deviceName: "Sensor B", deviceType: "pressure", serialNumber: "SN-002", location: "Warehouse B", status: "active", lastHeartbeat: new Date().toISOString(), metrics: { pressure: 1013.25 }, createdAt: new Date().toISOString() }
      );
    }
    res.json(phase4DevicesStore);
  });

  app.post("/api/iot/devices", (req, res) => {
    const device = { id: `dev-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase4DevicesStore.push(device);
    res.status(201).json(device);
  });

  app.get("/api/iot/sensors", (req, res) => {
    if (phase4SensorsStore.length === 0) {
      phase4SensorsStore.push(
        { id: "s1", deviceId: "dev1", sensorType: "temperature", readingValue: "22.5", unit: "°C", timestamp: new Date().toISOString(), createdAt: new Date().toISOString() },
        { id: "s2", deviceId: "dev1", sensorType: "humidity", readingValue: "45", unit: "%", timestamp: new Date().toISOString(), createdAt: new Date().toISOString() }
      );
    }
    res.json(phase4SensorsStore);
  });

  app.post("/api/iot/sensors", (req, res) => {
    const sensor = { id: `sensor-${Date.now()}`, ...req.body, timestamp: new Date().toISOString(), createdAt: new Date().toISOString() };
    phase4SensorsStore.push(sensor);
    res.status(201).json(sensor);
  });

  app.get("/api/field-service/jobs", (req, res) => {
    if (phase4JobsStore.length === 0) {
      phase4JobsStore.push(
        { id: "job1", jobNumber: "FSJ-001", deviceId: "dev1", technician: "John Smith", status: "scheduled", priority: "high", location: "Warehouse A", scheduledDate: new Date().toISOString(), completedDate: null, notes: "Routine maintenance", createdAt: new Date().toISOString() },
        { id: "job2", jobNumber: "FSJ-002", deviceId: "dev2", technician: "Jane Doe", status: "in-progress", priority: "medium", location: "Warehouse B", scheduledDate: new Date().toISOString(), completedDate: null, notes: "Sensor calibration", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase4JobsStore);
  });

  app.post("/api/field-service/jobs", (req, res) => {
    const job = { id: `job-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase4JobsStore.push(job);
    res.status(201).json(job);
  });

  // ========== PHASE 4: MOBILE APPS ENDPOINTS ==========
  const phase4AppsStore: any[] = [];
  const phase4MetricsStore: any[] = [];

  app.get("/api/mobile/apps", (req, res) => {
    if (phase4AppsStore.length === 0) {
      phase4AppsStore.push(
        { id: "app1", appName: "NexusAI Mobile", platform: "iOS", version: "2.5.0", releaseDate: new Date().toISOString(), status: "active", downloadCount: 125000, rating: "4.8", createdAt: new Date().toISOString() },
        { id: "app2", appName: "NexusAI Mobile", platform: "Android", version: "2.4.8", releaseDate: new Date().toISOString(), status: "active", downloadCount: 98000, rating: "4.7", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase4AppsStore);
  });

  app.post("/api/mobile/apps", (req, res) => {
    const app = { id: `app-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase4AppsStore.push(app);
    res.status(201).json(app);
  });

  app.get("/api/mobile/metrics", (req, res) => {
    if (phase4MetricsStore.length === 0) {
      phase4MetricsStore.push(
        { id: "m1", appId: "app1", dailyActiveUsers: 15200, sessionDuration: 450, crashReports: 2, timestamp: new Date().toISOString(), createdAt: new Date().toISOString() },
        { id: "m2", appId: "app2", dailyActiveUsers: 12800, sessionDuration: 420, crashReports: 1, timestamp: new Date().toISOString(), createdAt: new Date().toISOString() }
      );
    }
    res.json(phase4MetricsStore);
  });

  app.post("/api/mobile/metrics", (req, res) => {
    const metric = { id: `metric-${Date.now()}`, ...req.body, timestamp: new Date().toISOString(), createdAt: new Date().toISOString() };
    phase4MetricsStore.push(metric);
    res.status(201).json(metric);
  });

  // ========== PHASE 4: ADVANCED ANALYTICS ENDPOINTS ==========
  const phase4AdvDashboardsStore: any[] = [];
  const phase4ModelsStore: any[] = [];
  const phase4ForecastStore: any[] = [];

  app.get("/api/analytics/advanced-dashboards", (req, res) => {
    if (phase4AdvDashboardsStore.length === 0) {
      phase4AdvDashboardsStore.push(
        { id: "adash1", name: "Executive Dashboard", owner: "ceo@nexus.ai", dashboardType: "executive", widgets: ["revenue", "growth", "forecast"], customMetrics: { kpis: ["ARR", "MRR", "CAC"] }, refreshInterval: 300, status: "active", createdAt: new Date().toISOString() },
        { id: "adash2", name: "Sales Analytics", owner: "sales@nexus.ai", dashboardType: "sales", widgets: ["pipeline", "conversion", "forecast"], customMetrics: { stages: ["lead", "opportunity", "proposal"] }, refreshInterval: 600, status: "active", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase4AdvDashboardsStore);
  });

  app.post("/api/analytics/advanced-dashboards", (req, res) => {
    const dash = { id: `adash-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase4AdvDashboardsStore.push(dash);
    res.status(201).json(dash);
  });

  app.get("/api/analytics/models", (req, res) => {
    if (phase4ModelsStore.length === 0) {
      phase4ModelsStore.push(
        { id: "model1", modelName: "Revenue Forecast", modelType: "time-series", accuracy: "92.5", lastTrainDate: new Date().toISOString(), predictions: { q1: 500000, q2: 550000 }, status: "active", createdAt: new Date().toISOString() },
        { id: "model2", modelName: "Churn Predictor", modelType: "classification", accuracy: "87.3", lastTrainDate: new Date().toISOString(), predictions: { risk_score: 0.15 }, status: "active", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase4ModelsStore);
  });

  app.post("/api/analytics/models", (req, res) => {
    const model = { id: `model-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase4ModelsStore.push(model);
    res.status(201).json(model);
  });

  app.get("/api/analytics/forecast", (req, res) => {
    if (phase4ForecastStore.length === 0) {
      phase4ForecastStore.push(
        { id: "f1", modelId: "model1", forecastPeriod: "Q1-2025", metric: "revenue", predictedValue: "500000", confidenceInterval: "95", actualValue: null, timestamp: new Date().toISOString(), createdAt: new Date().toISOString() },
        { id: "f2", modelId: "model1", forecastPeriod: "Q2-2025", metric: "revenue", predictedValue: "550000", confidenceInterval: "92", actualValue: null, timestamp: new Date().toISOString(), createdAt: new Date().toISOString() }
      );
    }
    res.json(phase4ForecastStore);
  });

  app.post("/api/analytics/forecast", (req, res) => {
    const forecast = { id: `forecast-${Date.now()}`, ...req.body, timestamp: new Date().toISOString(), createdAt: new Date().toISOString() };
    phase4ForecastStore.push(forecast);
    res.status(201).json(forecast);
  });

  // ========== PHASE 5: SUPPLY CHAIN MANAGEMENT ENDPOINTS ==========
  const phase5PartnersStore: any[] = [];
  const phase5ShipmentsStore: any[] = [];

  app.get("/api/supply-chain/partners", (req, res) => {
    if (phase5PartnersStore.length === 0) {
      phase5PartnersStore.push(
        { id: "partner1", partnerName: "Global Logistics Inc", partnerType: "3PL", location: "Singapore", rating: "4.8", reliabilityScore: "96.5", contracts: { active: 3 }, status: "active", createdAt: new Date().toISOString() },
        { id: "partner2", partnerName: "Diamond Suppliers Ltd", partnerType: "Supplier", location: "Mumbai", rating: "4.6", reliabilityScore: "94.2", contracts: { active: 2 }, status: "active", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase5PartnersStore);
  });

  app.post("/api/supply-chain/partners", (req, res) => {
    const partner = { id: `partner-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase5PartnersStore.push(partner);
    res.status(201).json(partner);
  });

  app.get("/api/supply-chain/shipments", (req, res) => {
    if (phase5ShipmentsStore.length === 0) {
      phase5ShipmentsStore.push(
        { id: "ship1", shipmentNumber: "SHP-001", supplierId: "partner1", origin: "Singapore", destination: "New York", departureDate: new Date().toISOString(), arrivalDate: new Date(Date.now() + 86400000 * 30).toISOString(), status: "in-transit", trackingNumber: "TRACK123456", cost: "15000", createdAt: new Date().toISOString() },
        { id: "ship2", shipmentNumber: "SHP-002", supplierId: "partner2", origin: "Mumbai", destination: "London", departureDate: new Date().toISOString(), arrivalDate: new Date(Date.now() + 86400000 * 25).toISOString(), status: "in-transit", trackingNumber: "TRACK789012", cost: "12500", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase5ShipmentsStore);
  });

  app.post("/api/supply-chain/shipments", (req, res) => {
    const shipment = { id: `shipment-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase5ShipmentsStore.push(shipment);
    res.status(201).json(shipment);
  });

  // ========== PHASE 5: INVENTORY MANAGEMENT ENDPOINTS ==========
  const phase5ItemsStore: any[] = [];
  const phase5WarehousesStore: any[] = [];

  app.get("/api/inventory/items", (req, res) => {
    if (phase5ItemsStore.length === 0) {
      phase5ItemsStore.push(
        { id: "item1", itemCode: "INV-001", itemName: "CPU Processors", category: "Electronics", quantity: 450, reorderLevel: 200, unitCost: "850.00", warehouse: "WH-01", status: "active", createdAt: new Date().toISOString() },
        { id: "item2", itemCode: "INV-002", itemName: "RAM Memory Modules", category: "Electronics", quantity: 180, reorderLevel: 300, unitCost: "120.00", warehouse: "WH-01", status: "active", createdAt: new Date().toISOString() },
        { id: "item3", itemCode: "INV-003", itemName: "Hard Disk Drives", category: "Storage", quantity: 320, reorderLevel: 150, unitCost: "450.00", warehouse: "WH-02", status: "active", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase5ItemsStore);
  });

  app.post("/api/inventory/items", (req, res) => {
    const item = { id: `item-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase5ItemsStore.push(item);
    res.status(201).json(item);
  });

  app.get("/api/inventory/warehouses", (req, res) => {
    if (phase5WarehousesStore.length === 0) {
      phase5WarehousesStore.push(
        { id: "wh1", warehouseName: "Central Hub - Tokyo", location: "Tokyo, Japan", capacity: 50000, occupancy: "78.5", manager: "Hiroshi Tanaka", status: "active", createdAt: new Date().toISOString() },
        { id: "wh2", warehouseName: "North Distribution - Shanghai", location: "Shanghai, China", capacity: 35000, occupancy: "62.3", manager: "Wei Chen", status: "active", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase5WarehousesStore);
  });

  app.post("/api/inventory/warehouses", (req, res) => {
    const warehouse = { id: `warehouse-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase5WarehousesStore.push(warehouse);
    res.status(201).json(warehouse);
  });

  // ========== PHASE 5: QUALITY MANAGEMENT ENDPOINTS ==========
  const phase5ChecksStore: any[] = [];
  const phase5NCStore: any[] = [];

  app.get("/api/quality/checks", (req, res) => {
    if (phase5ChecksStore.length === 0) {
      phase5ChecksStore.push(
        { id: "qc1", checkNumber: "QC-001", itemId: "item1", checkType: "Performance", inspector: "Sarah Johnson", result: "pass", defects: null, checkDate: new Date().toISOString(), status: "completed", createdAt: new Date().toISOString() },
        { id: "qc2", checkNumber: "QC-002", itemId: "item2", checkType: "Dimension", inspector: "Michael Chen", result: "fail", defects: { dimension: "out of spec" }, checkDate: new Date().toISOString(), status: "completed", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase5ChecksStore);
  });

  app.post("/api/quality/checks", (req, res) => {
    const check = { id: `qc-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase5ChecksStore.push(check);
    res.status(201).json(check);
  });

  app.get("/api/quality/non-conformances", (req, res) => {
    if (phase5NCStore.length === 0) {
      phase5NCStore.push(
        { id: "nc1", ncNumber: "NC-001", description: "Paint inconsistency", severity: "high", rootCause: "Improper temperature control", correctionAction: "Recalibrate equipment", assignedTo: "David Lee", dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), status: "open", createdAt: new Date().toISOString() },
        { id: "nc2", ncNumber: "NC-002", description: "Missing component", severity: "medium", rootCause: "Assembly line error", correctionAction: "Retraining session", assignedTo: "Emma Watson", dueDate: new Date(Date.now() + 86400000 * 7).toISOString(), status: "open", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase5NCStore);
  });

  app.post("/api/quality/non-conformances", (req, res) => {
    const nc = { id: `nc-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase5NCStore.push(nc);
    res.status(201).json(nc);
  });

  // ========== PHASE 5: INTEGRATION HUB ENDPOINTS ==========
  const phase5ConnectionsStore: any[] = [];
  const phase5JobsStore: any[] = [];

  app.get("/api/integrations/connections", (req, res) => {
    if (phase5ConnectionsStore.length === 0) {
      phase5ConnectionsStore.push(
        { id: "conn1", systemName: "Salesforce", apiEndpoint: "https://api.salesforce.com/v57.0", authType: "OAuth2", status: "connected", lastSyncDate: new Date(Date.now() - 3600000).toISOString(), errorLogs: null, createdAt: new Date().toISOString() },
        { id: "conn2", systemName: "SAP ERP", apiEndpoint: "https://sap.enterprise.com/api", authType: "JWT", status: "connected", lastSyncDate: new Date(Date.now() - 7200000).toISOString(), errorLogs: null, createdAt: new Date().toISOString() },
        { id: "conn3", systemName: "NetSuite", apiEndpoint: "https://api.netsuite.com", authType: "API_KEY", status: "disconnected", lastSyncDate: new Date(Date.now() - 259200000).toISOString(), errorLogs: { error: "Authentication failed" }, createdAt: new Date().toISOString() }
      );
    }
    res.json(phase5ConnectionsStore);
  });

  app.post("/api/integrations/connections", (req, res) => {
    const conn = { id: `conn-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase5ConnectionsStore.push(conn);
    res.status(201).json(conn);
  });

  app.get("/api/integrations/jobs", (req, res) => {
    if (phase5JobsStore.length === 0) {
      phase5JobsStore.push(
        { id: "job1", jobName: "Daily Sync - CRM to DW", sourceSystem: "Salesforce", targetSystem: "DataWarehouse", frequency: "daily", lastRunDate: new Date(Date.now() - 3600000).toISOString(), nextRunDate: new Date(Date.now() + 86400000).toISOString(), recordsProcessed: 25840, status: "scheduled", createdAt: new Date().toISOString() },
        { id: "job2", jobName: "Inventory Sync", sourceSystem: "Warehouse", targetSystem: "ERP", frequency: "hourly", lastRunDate: new Date(Date.now() - 1800000).toISOString(), nextRunDate: new Date(Date.now() + 3600000).toISOString(), recordsProcessed: 12540, status: "scheduled", createdAt: new Date().toISOString() },
        { id: "job3", jobName: "GL Consolidation", sourceSystem: "GL", targetSystem: "Reporting", frequency: "weekly", lastRunDate: new Date(Date.now() - 604800000).toISOString(), nextRunDate: new Date(Date.now() + 604800000).toISOString(), recordsProcessed: 89342, status: "scheduled", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase5JobsStore);
  });

  app.post("/api/integrations/jobs", (req, res) => {
    const job = { id: `job-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase5JobsStore.push(job);
    res.status(201).json(job);
  });

  // ========== PHASE 6: DOCUMENT MANAGEMENT ENDPOINTS ==========
  const phase6DocsStore: any[] = [];
  const phase6ApprovalsStore: any[] = [];

  app.get("/api/documents/list", (req, res) => {
    if (phase6DocsStore.length === 0) {
      phase6DocsStore.push(
        { id: "doc1", documentName: "HR Policy Manual", documentType: "Policy", owner: "Sarah Admin", filePath: "/docs/hr-policy.pdf", fileSize: 2048, status: "active", expiryDate: new Date(Date.now() + 31536000000).toISOString(), createdAt: new Date().toISOString() },
        { id: "doc2", documentName: "Benefits Guide 2025", documentType: "Guide", owner: "HR Department", filePath: "/docs/benefits.pdf", fileSize: 1536, status: "active", expiryDate: new Date(Date.now() + 31536000000).toISOString(), createdAt: new Date().toISOString() }
      );
    }
    res.json(phase6DocsStore);
  });

  app.post("/api/documents/list", (req, res) => {
    const doc = { id: `doc-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase6DocsStore.push(doc);
    res.status(201).json(doc);
  });

  app.get("/api/documents/approvals", (req, res) => {
    if (phase6ApprovalsStore.length === 0) {
      phase6ApprovalsStore.push(
        { id: "appr1", documentId: "doc1", approver: "John Manager", approvalStatus: "approved", comments: "Looks good", approvalDate: new Date().toISOString(), createdAt: new Date().toISOString() },
        { id: "appr2", documentId: "doc2", approver: "Jane Director", approvalStatus: "pending", comments: "Under review", approvalDate: null, createdAt: new Date().toISOString() }
      );
    }
    res.json(phase6ApprovalsStore);
  });

  app.post("/api/documents/approvals", (req, res) => {
    const appr = { id: `appr-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase6ApprovalsStore.push(appr);
    res.status(201).json(appr);
  });

  // ========== PHASE 6: EXPENSE MANAGEMENT ENDPOINTS ==========
  const phase6ReportsStore: any[] = [];
  const phase6ItemsStore: any[] = [];

  app.get("/api/expenses/reports", (req, res) => {
    if (phase6ReportsStore.length === 0) {
      phase6ReportsStore.push(
        { id: "exp1", reportNumber: "EXP-2025-001", employeeId: "EMP001", totalAmount: "1250.50", currency: "USD", status: "approved", submitDate: new Date().toISOString(), createdAt: new Date().toISOString() },
        { id: "exp2", reportNumber: "EXP-2025-002", employeeId: "EMP002", totalAmount: "890.75", currency: "USD", status: "pending", submitDate: new Date().toISOString(), createdAt: new Date().toISOString() }
      );
    }
    res.json(phase6ReportsStore);
  });

  app.post("/api/expenses/reports", (req, res) => {
    const report = { id: `exp-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase6ReportsStore.push(report);
    res.status(201).json(report);
  });

  app.get("/api/expenses/items", (req, res) => {
    if (phase6ItemsStore.length === 0) {
      phase6ItemsStore.push(
        { id: "item1", reportId: "exp1", category: "Meals", description: "Client lunch meeting", amount: "85.50", receiptDate: new Date().toISOString(), attachmentPath: "/receipts/lunch.jpg", createdAt: new Date().toISOString() },
        { id: "item2", reportId: "exp1", category: "Transportation", description: "Uber to office", amount: "45.00", receiptDate: new Date().toISOString(), attachmentPath: "/receipts/uber.jpg", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase6ItemsStore);
  });

  app.post("/api/expenses/items", (req, res) => {
    const item = { id: `item-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase6ItemsStore.push(item);
    res.status(201).json(item);
  });

  // ========== PHASE 6: TRAVEL MANAGEMENT ENDPOINTS ==========
  const phase6TravelReqStore: any[] = [];
  const phase6TravelExpStore: any[] = [];

  app.get("/api/travel/requests", (req, res) => {
    if (phase6TravelReqStore.length === 0) {
      phase6TravelReqStore.push(
        { id: "tr1", requestNumber: "TRAV-2025-001", employeeId: "EMP001", destination: "New York", purpose: "Client meeting", departureDate: new Date(Date.now() + 604800000).toISOString(), returnDate: new Date(Date.now() + 1209600000).toISOString(), status: "approved", approvedBy: "Manager", createdAt: new Date().toISOString() },
        { id: "tr2", requestNumber: "TRAV-2025-002", employeeId: "EMP003", destination: "Tokyo", purpose: "Conference", departureDate: new Date(Date.now() + 1209600000).toISOString(), returnDate: new Date(Date.now() + 1814400000).toISOString(), status: "pending", approvedBy: null, createdAt: new Date().toISOString() }
      );
    }
    res.json(phase6TravelReqStore);
  });

  app.post("/api/travel/requests", (req, res) => {
    const travelRequest = { id: `tr-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase6TravelReqStore.push(travelRequest);
    res.status(201).json(travelRequest);
  });

  app.get("/api/travel/expenses", (req, res) => {
    if (phase6TravelExpStore.length === 0) {
      phase6TravelExpStore.push(
        { id: "te1", travelRequestId: "tr1", category: "Airfare", vendor: "United Airlines", amount: "650.00", bookingReference: "UA123456", createdAt: new Date().toISOString() },
        { id: "te2", travelRequestId: "tr1", category: "Hotel", vendor: "Hilton", amount: "450.00", bookingReference: "HI789012", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase6TravelExpStore);
  });

  app.post("/api/travel/expenses", (req, res) => {
    const exp = { id: `te-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase6TravelExpStore.push(exp);
    res.status(201).json(exp);
  });

  // ========== PHASE 6: TIME & ATTENDANCE ENDPOINTS ==========
  const phase6TimeEntriesStore: any[] = [];
  const phase6AttendanceStore: any[] = [];

  app.get("/api/time/entries", (req, res) => {
    if (phase6TimeEntriesStore.length === 0) {
      phase6TimeEntriesStore.push(
        { id: "te1", employeeId: "EMP001", entryDate: new Date().toISOString(), clockIn: new Date(Date.now() - 28800000).toISOString(), clockOut: new Date().toISOString(), hoursWorked: "8.0", status: "active", createdAt: new Date().toISOString() },
        { id: "te2", employeeId: "EMP002", entryDate: new Date().toISOString(), clockIn: new Date(Date.now() - 28800000).toISOString(), clockOut: null, hoursWorked: null, status: "active", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase6TimeEntriesStore);
  });

  app.post("/api/time/entries", (req, res) => {
    const entry = { id: `te-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase6TimeEntriesStore.push(entry);
    res.status(201).json(entry);
  });

  app.get("/api/time/attendance", (req, res) => {
    if (phase6AttendanceStore.length === 0) {
      phase6AttendanceStore.push(
        { id: "att1", employeeId: "EMP001", recordDate: new Date().toISOString(), status: "present", reason: null, approvedBy: null, createdAt: new Date().toISOString() },
        { id: "att2", employeeId: "EMP002", recordDate: new Date().toISOString(), status: "absent", reason: "Sick leave", approvedBy: "HR", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase6AttendanceStore);
  });

  app.post("/api/time/attendance", (req, res) => {
    const att = { id: `att-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase6AttendanceStore.push(att);
    res.status(201).json(att);
  });

  // ========== PHASE 6: LEARNING MANAGEMENT ENDPOINTS ==========
  const phase6CoursesStore: any[] = [];
  const phase6EnrollmentsStore: any[] = [];

  app.get("/api/learning/courses", (req, res) => {
    if (phase6CoursesStore.length === 0) {
      phase6CoursesStore.push(
        { id: "c1", courseName: "Leadership Excellence", description: "Advanced leadership skills", instructor: "Dr. Smith", duration: 40, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 2592000000).toISOString(), capacity: 30, status: "active", createdAt: new Date().toISOString() },
        { id: "c2", courseName: "Data Analysis 101", description: "Introduction to data analysis", instructor: "Prof. Johnson", duration: 30, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 2592000000).toISOString(), capacity: 50, status: "active", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase6CoursesStore);
  });

  app.post("/api/learning/courses", (req, res) => {
    const course = { id: `c-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase6CoursesStore.push(course);
    res.status(201).json(course);
  });

  app.get("/api/learning/enrollments", (req, res) => {
    if (phase6EnrollmentsStore.length === 0) {
      phase6EnrollmentsStore.push(
        { id: "e1", courseId: "c1", employeeId: "EMP001", enrollmentDate: new Date().toISOString(), completionDate: null, progressPercentage: "75", status: "enrolled", createdAt: new Date().toISOString() },
        { id: "e2", courseId: "c1", employeeId: "EMP002", enrollmentDate: new Date().toISOString(), completionDate: new Date().toISOString(), progressPercentage: "100", status: "completed", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase6EnrollmentsStore);
  });

  app.post("/api/learning/enrollments", (req, res) => {
    const enrollment = { id: `e-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase6EnrollmentsStore.push(enrollment);
    res.status(201).json(enrollment);
  });

  // ========== PHASE 6: KNOWLEDGE MANAGEMENT ENDPOINTS ==========
  const phase6KnowledgeStore: any[] = [];
  const phase6KnowledgeCommentsStore: any[] = [];

  app.get("/api/knowledge/articles", (req, res) => {
    if (phase6KnowledgeStore.length === 0) {
      phase6KnowledgeStore.push(
        { id: "k1", title: "Getting Started with NexusAI", content: "Complete guide to onboarding", category: "Getting Started", author: "Admin", tags: ["onboarding", "guide"], views: 245, helpful: 198, status: "published", createdAt: new Date().toISOString() },
        { id: "k2", title: "Advanced Features Guide", content: "In-depth guide to advanced features", category: "Features", author: "Support Team", tags: ["advanced", "features"], views: 178, helpful: 142, status: "published", createdAt: new Date().toISOString() }
      );
    }
    res.json(phase6KnowledgeStore);
  });

  app.post("/api/knowledge/articles", (req, res) => {
    const article = { id: `k-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase6KnowledgeStore.push(article);
    res.status(201).json(article);
  });

  app.get("/api/knowledge/comments", (req, res) => {
    if (phase6KnowledgeCommentsStore.length === 0) {
      phase6KnowledgeCommentsStore.push(
        { id: "kc1", articleId: "k1", author: "User1", comment: "Very helpful, thanks!", rating: 5, createdAt: new Date().toISOString() },
        { id: "kc2", articleId: "k1", author: "User2", comment: "Needs more examples", rating: 3, createdAt: new Date().toISOString() }
      );
    }
    res.json(phase6KnowledgeCommentsStore);
  });

  app.post("/api/knowledge/comments", (req, res) => {
    const comment = { id: `kc-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    phase6KnowledgeCommentsStore.push(comment);
    res.status(201).json(comment);
  });

  // ========== PRODUCTION FEATURES ENDPOINTS ==========
  const emailStore: any[] = [];
  const reportsStore: any[] = [];
  const notificationsStore: any[] = [];
  const calendarStore: any[] = [];
  const churnStore: any[] = [];

  app.post("/api/email/send", (req, res) => {
    const email = { id: `email-${Date.now()}`, ...req.body, status: "sent", sentAt: new Date().toISOString() };
    emailStore.push(email);
    res.status(201).json(email);
  });

  app.get("/api/reports", (req, res) => {
    if (reportsStore.length === 0) {
      reportsStore.push(
        { id: "r1", name: "Monthly Sales", type: "sales", metrics: ["Revenue", "Conversion"], schedule: "monthly" },
        { id: "r2", name: "Churn Analysis", type: "churn", metrics: ["Churn Rate", "At-Risk"], schedule: "weekly" }
      );
    }
    res.json(reportsStore);
  });

  app.post("/api/notifications", (req, res) => {
    const notif = { id: `notif-${Date.now()}`, ...req.body, read: false, createdAt: new Date().toISOString() };
    notificationsStore.push(notif);
    res.status(201).json(notif);
  });

  app.get("/api/calendar/events", (req, res) => {
    if (calendarStore.length === 0) {
      calendarStore.push(
        { id: "ev1", title: "Team Meeting", startTime: new Date().toISOString(), location: "Conference Room" },
        { id: "ev2", title: "Client Presentation", startTime: new Date(Date.now() + 86400000).toISOString(), location: "Virtual" }
      );
    }
    res.json(calendarStore);
  });

  app.get("/api/analytics/churn-prediction", (req, res) => {
    if (churnStore.length === 0) {
      churnStore.push(
        { id: "c1", customerId: "CUST-001", riskScore: "85.5", factors: ["Low Activity", "No Recent Purchase"], recommendedActions: ["Personal Outreach", "Special Offer"] },
        { id: "c2", customerId: "CUST-002", riskScore: "42.3", factors: ["Regular Activity"], recommendedActions: ["Continue Engagement"] }
      );
    }
    res.json(churnStore);
  });

  app.post("/api/import-export", (req, res) => {
    const result = { id: `import-${Date.now()}`, status: "completed", recordsProcessed: 1000, createdAt: new Date().toISOString() };
    res.json(result);
  });

  // ========== MODULE 1: USER & IDENTITY MANAGEMENT ENDPOINTS ==========
  const userSessionsStore: any[] = [];
  const loginAuditStore: any[] = [];
  const securitySettingsStore: any[] = [];

  app.get("/api/user/sessions", (req, res) => {
    if (userSessionsStore.length === 0) {
      userSessionsStore.push(
        { id: "s1", userId: "u1", deviceName: "Chrome on MacOS", ipAddress: "192.168.1.100", location: "New York, USA", loginTime: new Date().toISOString(), lastActivityTime: new Date().toISOString(), status: "active" },
        { id: "s2", userId: "u1", deviceName: "Safari on iPhone", ipAddress: "192.168.1.101", location: "New York, USA", loginTime: new Date(Date.now() - 3600000).toISOString(), lastActivityTime: new Date().toISOString(), status: "active" }
      );
    }
    res.json(userSessionsStore);
  });

  app.post("/api/user/sessions/logout", (req, res) => {
    const { sessionId } = req.body;
    const session = userSessionsStore.find(s => s.id === sessionId);
    if (session) {
      session.status = "inactive";
      res.json({ status: "logged_out" });
    } else {
      res.status(404).json({ error: "Session not found" });
    }
  });

  app.get("/api/user/login-history", (req, res) => {
    if (loginAuditStore.length === 0) {
      loginAuditStore.push(
        { id: "l1", userId: "u1", email: "alice@example.com", ipAddress: "192.168.1.100", device: "Chrome/MacOS", location: "New York, USA", status: "success", mfaUsed: true, loginTime: new Date().toISOString() },
        { id: "l2", userId: "u1", email: "alice@example.com", ipAddress: "192.168.1.101", device: "Safari/iPhone", location: "New York, USA", status: "success", mfaUsed: true, loginTime: new Date(Date.now() - 3600000).toISOString() },
        { id: "l3", userId: "u1", email: "alice@example.com", ipAddress: "192.168.2.50", device: "Firefox/Windows", location: "New York, USA", status: "failed", mfaUsed: false, loginTime: new Date(Date.now() - 86400000).toISOString() }
      );
    }
    res.json(loginAuditStore);
  });

  app.post("/api/user/login-audit", (req, res) => {
    const audit = { id: `l-${Date.now()}`, ...req.body, loginTime: new Date().toISOString() };
    loginAuditStore.push(audit);
    res.status(201).json(audit);
  });

  app.get("/api/user/security-settings", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    let settings = securitySettingsStore.find(s => s.userId === userId);
    if (!settings) {
      settings = { id: `sec-${Date.now()}`, userId, mfaEnabled: true, mfaMethods: ["email", "authenticator"], sessionTimeout: 30, passwordExpiry: 90, ipWhitelist: ["192.168.1.0/24"], maxConcurrentSessions: 3, loginAttemptLimit: 5 };
      securitySettingsStore.push(settings);
    }
    res.json(settings);
  });

  app.post("/api/user/security-settings", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    let settings = securitySettingsStore.find(s => s.userId === userId);
    if (settings) {
      Object.assign(settings, req.body);
    } else {
      settings = { id: `sec-${Date.now()}`, userId, ...req.body };
      securitySettingsStore.push(settings);
    }
    res.json(settings);
  });

  // ========== MODULE 2: ROLES, PERMISSIONS & SECURITY ENDPOINTS ==========
  const roleHierarchiesStore: any[] = [];
  const sodRulesStore: any[] = [];
  const roleAssignmentsStore: any[] = [];
  const permissionsStore: any[] = [];

  app.get("/api/roles/hierarchies", (req, res) => {
    if (roleHierarchiesStore.length === 0) {
      roleHierarchiesStore.push(
        { id: "h1", parentRoleId: "admin", childRoleId: "manager", inheritPermissions: true },
        { id: "h2", parentRoleId: "manager", childRoleId: "operator", inheritPermissions: true }
      );
    }
    res.json(roleHierarchiesStore);
  });

  app.post("/api/roles/hierarchies", (req, res) => {
    const hierarchy = { id: `h-${Date.now()}`, ...req.body };
    roleHierarchiesStore.push(hierarchy);
    res.status(201).json(hierarchy);
  });

  app.get("/api/segregation-of-duties", (req, res) => {
    if (sodRulesStore.length === 0) {
      sodRulesStore.push(
        { id: "sod1", ruleId: "rule1", conflictingRole1: "approver", conflictingRole2: "requestor", description: "Cannot approve own requests", mitigationControl: "Manager approval", status: "active" },
        { id: "sod2", ruleId: "rule2", conflictingRole1: "operator", conflictingRole2: "auditor", description: "Cannot audit own work", mitigationControl: "Independent audit", status: "active" }
      );
    }
    res.json(sodRulesStore);
  });

  app.post("/api/segregation-of-duties", (req, res) => {
    const sod = { id: `sod-${Date.now()}`, ...req.body, status: "active" };
    sodRulesStore.push(sod);
    res.status(201).json(sod);
  });

  app.get("/api/role-assignments", (req, res) => {
    if (roleAssignmentsStore.length === 0) {
      roleAssignmentsStore.push(
        { id: "a1", userId: "u1", roleId: "admin", startDate: new Date().toISOString(), endDate: null, status: "active", assignedBy: "system" },
        { id: "a2", userId: "u2", roleId: "manager", startDate: new Date().toISOString(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), status: "active", assignedBy: "admin" }
      );
    }
    res.json(roleAssignmentsStore);
  });

  app.post("/api/role-assignments", (req, res) => {
    const assignment = { id: `a-${Date.now()}`, ...req.body, status: "active", assignedBy: req.headers["x-user-id"] };
    roleAssignmentsStore.push(assignment);
    res.status(201).json(assignment);
  });

  app.get("/api/permissions/matrix", (req, res) => {
    if (permissionsStore.length === 0) {
      const modules = ["CRM", "ERP", "Finance", "HR", "Projects", "Analytics"];
      const roles = ["Admin", "Manager", "Operator", "Viewer"];
      modules.forEach(mod => {
        roles.forEach(role => {
          permissionsStore.push({
            id: `perm-${mod}-${role}`,
            module: mod,
            role: role,
            create: role === "Admin" || role === "Manager",
            read: true,
            update: role === "Admin" || role === "Manager",
            delete: role === "Admin",
            approve: role === "Admin",
            export: role !== "Viewer"
          });
        });
      });
    }
    res.json(permissionsStore);
  });

  // ========== MODULE 3: AUTHENTICATION, MFA & SECURITY ENDPOINTS ==========
  const authSettingsStore: any[] = [];
  const mfaPoliciesStore: any[] = [];
  const passwordPoliciesStore: any[] = [];
  const deviceEnrollmentStore: any[] = [];
  const securityEventStore: any[] = [];

  app.get("/api/authentication/settings", (req, res) => {
    if (authSettingsStore.length === 0) {
      authSettingsStore.push(
        { id: "as1", tenantId: "tenant1", authMethod: "password", ssoProvider: null, oauthClientId: null, redirectUrls: [], tokenExpiry: 3600, enabled: true },
        { id: "as2", tenantId: "tenant1", authMethod: "sso", ssoProvider: "okta", oauthClientId: "client-123", redirectUrls: ["https://app.example.com/auth/callback"], tokenExpiry: 7200, enabled: true }
      );
    }
    res.json(authSettingsStore);
  });

  app.post("/api/authentication/settings", (req, res) => {
    const setting = { id: `as-${Date.now()}`, ...req.body };
    authSettingsStore.push(setting);
    res.status(201).json(setting);
  });

  app.get("/api/mfa/policies", (req, res) => {
    if (mfaPoliciesStore.length === 0) {
      mfaPoliciesStore.push(
        { id: "mp1", tenantId: "tenant1", mfaType: "email", enforced: true, scope: "all_users", backupCodesEnabled: true, maxAttempts: 5, expiryMinutes: 10 },
        { id: "mp2", tenantId: "tenant1", mfaType: "authenticator", enforced: false, scope: "admin_only", backupCodesEnabled: true, maxAttempts: 5, expiryMinutes: 10 }
      );
    }
    res.json(mfaPoliciesStore);
  });

  app.post("/api/mfa/policies", (req, res) => {
    const policy = { id: `mp-${Date.now()}`, ...req.body };
    mfaPoliciesStore.push(policy);
    res.status(201).json(policy);
  });

  app.get("/api/password/policies", (req, res) => {
    if (passwordPoliciesStore.length === 0) {
      passwordPoliciesStore.push({
        id: "pp1",
        tenantId: "tenant1",
        minLength: 8,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expiryDays: 90,
        reuseRestriction: 5
      });
    }
    res.json(passwordPoliciesStore);
  });

  app.post("/api/password/policies", (req, res) => {
    const policy = { id: `pp-${Date.now()}`, ...req.body };
    passwordPoliciesStore.push(policy);
    res.status(201).json(policy);
  });

  app.get("/api/device/enrollment", (req, res) => {
    if (deviceEnrollmentStore.length === 0) {
      deviceEnrollmentStore.push(
        { id: "de1", userId: "u1", deviceId: "dev-001", deviceType: "Desktop", deviceOs: "macOS 14", deviceBrowser: "Chrome 120", status: "approved", ipAddress: "192.168.1.100", enrolledAt: new Date().toISOString(), lastUsed: new Date().toISOString() },
        { id: "de2", userId: "u1", deviceId: "dev-002", deviceType: "Mobile", deviceOs: "iOS 17", deviceBrowser: "Safari", status: "approved", ipAddress: "192.168.1.101", enrolledAt: new Date().toISOString(), lastUsed: new Date(Date.now() - 3600000).toISOString() }
      );
    }
    res.json(deviceEnrollmentStore);
  });

  app.post("/api/device/enrollment", (req, res) => {
    const device = { id: `de-${Date.now()}`, ...req.body, status: "pending", enrolledAt: new Date().toISOString() };
    deviceEnrollmentStore.push(device);
    res.status(201).json(device);
  });

  app.patch("/api/device/enrollment/:id/approve", (req, res) => {
    const device = deviceEnrollmentStore.find(d => d.id === req.params.id);
    if (device) {
      device.status = "approved";
      res.json(device);
    } else {
      res.status(404).json({ error: "Device not found" });
    }
  });

  app.get("/api/security/events", (req, res) => {
    if (securityEventStore.length === 0) {
      securityEventStore.push(
        { id: "se1", eventId: "evt-001", userId: "u1", eventType: "login", module: "core", device: "Chrome/macOS", ipAddress: "192.168.1.100", status: "success", actionTaken: "Login successful", timestamp: new Date().toISOString() },
        { id: "se2", eventId: "evt-002", userId: "u2", eventType: "mfa_failed", module: "core", device: "Safari/iPhone", ipAddress: "192.168.1.101", status: "failed", actionTaken: "MFA attempt failed - 3 attempts remaining", timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: "se3", eventId: "evt-003", userId: "u3", eventType: "password_change", module: "security", device: "Chrome/Windows", ipAddress: "192.168.1.102", status: "success", actionTaken: "Password changed successfully", timestamp: new Date(Date.now() - 7200000).toISOString() }
      );
    }
    res.json(securityEventStore);
  });

  app.post("/api/security/events", (req, res) => {
    const event = { id: `se-${Date.now()}`, eventId: `evt-${Date.now()}`, ...req.body, timestamp: new Date().toISOString() };
    securityEventStore.push(event);
    res.status(201).json(event);
  });

  // ========== MODULE 4: USER ACTIVITY, AUDIT & COMPLIANCE ENDPOINTS ==========
  const userActivityStore: any[] = [];
  const complianceMonitoringStore: any[] = [];
  const complianceExceptionsStore: any[] = [];

  app.get("/api/user-activity", (req, res) => {
    if (userActivityStore.length === 0) {
      userActivityStore.push(
        { id: "ua1", userId: "u1", role: "admin", module: "CRM", screen: "Leads", action: "update", recordId: "rec-001", previousValue: "Status: New", newValue: "Status: Qualified", deviceId: "dev-001", ipAddress: "192.168.1.100", browser: "Chrome", status: "success", duration: 145, timestamp: new Date().toISOString() },
        { id: "ua2", userId: "u2", role: "manager", module: "Finance", screen: "Invoices", action: "create", recordId: "inv-123", previousValue: null, newValue: "Invoice #INV-123 created", deviceId: "dev-002", ipAddress: "192.168.1.101", browser: "Safari", status: "success", duration: 234, timestamp: new Date(Date.now() - 3600000).toISOString() }
      );
    }
    res.json(userActivityStore);
  });

  app.post("/api/user-activity", (req, res) => {
    const activity = { id: `ua-${Date.now()}`, ...req.body, timestamp: new Date().toISOString() };
    userActivityStore.push(activity);
    res.status(201).json(activity);
  });

  app.get("/api/compliance/monitoring", (req, res) => {
    if (complianceMonitoringStore.length === 0) {
      complianceMonitoringStore.push(
        { id: "cm1", ruleId: "rule-sod-001", description: "Approver cannot be Requestor", module: "Finance", triggerCondition: "user_id = approver_id AND user_id = requestor_id", status: "active", lastChecked: new Date().toISOString(), violationCount: 0 },
        { id: "cm2", ruleId: "rule-access-001", description: "Salary field restricted to HR", module: "HR", triggerCondition: "field = 'salary' AND role != 'hr_admin'", status: "active", lastChecked: new Date().toISOString(), violationCount: 2 }
      );
    }
    res.json(complianceMonitoringStore);
  });

  app.post("/api/compliance/monitoring", (req, res) => {
    const rule = { id: `cm-${Date.now()}`, ...req.body, lastChecked: new Date().toISOString() };
    complianceMonitoringStore.push(rule);
    res.status(201).json(rule);
  });

  app.get("/api/compliance/exceptions", (req, res) => {
    if (complianceExceptionsStore.length === 0) {
      complianceExceptionsStore.push(
        { id: "ce1", ruleId: "rule-sod-001", userId: "u1", description: "Emergency approval override", mitigationSteps: "Manual review performed", responsiblePerson: "admin@company.com", approvalRequired: true, status: "pending", createdAt: new Date().toISOString() },
        { id: "ce2", ruleId: "rule-access-001", userId: "u2", description: "Audit request", mitigationSteps: "Audit trail logged", responsiblePerson: "auditor@company.com", approvalRequired: true, approvedBy: "ceo@company.com", status: "approved", createdAt: new Date(Date.now() - 86400000).toISOString() }
      );
    }
    res.json(complianceExceptionsStore);
  });

  app.post("/api/compliance/exceptions", (req, res) => {
    const exception = { id: `ce-${Date.now()}`, ...req.body, status: "pending", createdAt: new Date().toISOString() };
    complianceExceptionsStore.push(exception);
    res.status(201).json(exception);
  });

  app.patch("/api/compliance/exceptions/:id/approve", (req, res) => {
    const exc = complianceExceptionsStore.find(e => e.id === req.params.id);
    if (exc) {
      exc.status = "approved";
      exc.approvedBy = req.headers["x-user-id"];
      res.json(exc);
    } else {
      res.status(404).json({ error: "Exception not found" });
    }
  });

  // ========== MODULE 5: AUTOMATIONS, WORKFLOWS & INTEGRATIONS ENDPOINTS ==========
  const automationRulesStore: any[] = [];
  const eventTriggersStore: any[] = [];
  const integrationConfigsStore: any[] = [];

  app.get("/api/automation/rules", (req, res) => {
    if (automationRulesStore.length === 0) {
      automationRulesStore.push(
        { id: "ar1", name: "Auto-assign leads", module: "CRM", trigger: "lead_created", conditions: { value: "> 10000" }, actions: [{ type: "assign", assignee: "sales_manager" }], priority: 90, status: "active" },
        { id: "ar2", name: "Send approval notification", module: "Finance", trigger: "invoice_threshold", conditions: { amount: "> 50000" }, actions: [{ type: "notify", recipients: ["cfо"] }], priority: 80, status: "active" }
      );
    }
    res.json(automationRulesStore);
  });

  app.post("/api/automation/rules", (req, res) => {
    const rule = { id: `ar-${Date.now()}`, ...req.body, status: "active" };
    automationRulesStore.push(rule);
    res.status(201).json(rule);
  });

  app.get("/api/events/triggers", (req, res) => {
    if (eventTriggersStore.length === 0) {
      eventTriggersStore.push(
        { id: "et1", eventId: "evt-login", eventType: "user_login", module: "core", triggerCondition: "on_login", notificationType: "email", recipientRole: "admin", status: "active" },
        { id: "et2", eventId: "evt-approve", eventType: "approval", module: "finance", triggerCondition: "on_approval", notificationType: "sms", recipientRole: "manager", status: "active" }
      );
    }
    res.json(eventTriggersStore);
  });

  app.post("/api/events/triggers", (req, res) => {
    const trigger = { id: `et-${Date.now()}`, ...req.body, status: "active" };
    eventTriggersStore.push(trigger);
    res.status(201).json(trigger);
  });

  app.get("/api/integrations/config", (req, res) => {
    if (integrationConfigsStore.length === 0) {
      integrationConfigsStore.push(
        { id: "ic1", name: "Salesforce", sourceSystem: "salesforce", targetSystem: "nexusai", integrationType: "real-time", apiEndpoint: "https://api.salesforce.com", dataMapping: { lead_id: "id" }, status: "connected", lastSync: new Date().toISOString() },
        { id: "ic2", name: "QuickBooks", sourceSystem: "quickbooks", targetSystem: "nexusai", integrationType: "batch", apiEndpoint: "https://api.quickbooks.com", dataMapping: { invoice_id: "id" }, status: "connected", lastSync: new Date(Date.now() - 3600000).toISOString() }
      );
    }
    res.json(integrationConfigsStore);
  });

  app.post("/api/integrations/config", (req, res) => {
    const config = { id: `ic-${Date.now()}`, ...req.body, status: "connected", lastSync: new Date().toISOString() };
    integrationConfigsStore.push(config);
    res.status(201).json(config);
  });

  // ========== MODULE 6: FINANCIAL MANAGEMENT & ERP CORE ENDPOINTS ==========
  const journalEntriesStore: any[] = [];
  const cashManagementStore: any[] = [];
  const taxCodesStore: any[] = [];
  const financialReportsStore: any[] = [];

  app.get("/api/journal-entries", (req, res) => {
    if (journalEntriesStore.length === 0) {
      journalEntriesStore.push(
        { id: "je1", journalId: "j001", entryDate: new Date().toISOString(), description: "Sales revenue", debitAmount: "0", creditAmount: "50000", glAccount: "4000", approvalStatus: "approved", status: "posted" },
        { id: "je2", journalId: "j002", entryDate: new Date(Date.now() - 86400000).toISOString(), description: "Expense entry", debitAmount: "15000", creditAmount: "0", glAccount: "6100", approvalStatus: "pending", status: "draft" }
      );
    }
    res.json(journalEntriesStore);
  });

  app.post("/api/journal-entries", (req, res) => {
    const entry = { id: `je-${Date.now()}`, ...req.body, status: "draft", approvalStatus: "pending" };
    journalEntriesStore.push(entry);
    res.status(201).json(entry);
  });

  app.get("/api/cash-management", (req, res) => {
    if (cashManagementStore.length === 0) {
      cashManagementStore.push(
        { id: "cm1", bankAccountId: "ba001", transactionDate: new Date().toISOString(), transactionType: "receipt", amount: "50000", reconciliationStatus: "reconciled", status: "posted" },
        { id: "cm2", bankAccountId: "ba001", transactionDate: new Date(Date.now() - 3600000).toISOString(), transactionType: "payment", amount: "25000", reconciliationStatus: "pending", status: "posted" }
      );
    }
    res.json(cashManagementStore);
  });

  app.post("/api/cash-management", (req, res) => {
    const transaction = { id: `cm-${Date.now()}`, ...req.body, status: "posted" };
    cashManagementStore.push(transaction);
    res.status(201).json(transaction);
  });

  app.get("/api/tax-codes", (req, res) => {
    if (taxCodesStore.length === 0) {
      taxCodesStore.push(
        { id: "t1", taxName: "Sales Tax 8%", taxType: "Sales Tax", rate: "8", jurisdiction: "California", status: "active" },
        { id: "t2", taxName: "VAT 20%", taxType: "VAT", rate: "20", jurisdiction: "UK", status: "active" }
      );
    }
    res.json(taxCodesStore);
  });

  app.post("/api/tax-codes", (req, res) => {
    const tax = { id: `t-${Date.now()}`, ...req.body, status: "active" };
    taxCodesStore.push(tax);
    res.status(201).json(tax);
  });

  app.get("/api/financial-reports", (req, res) => {
    if (financialReportsStore.length === 0) {
      financialReportsStore.push(
        { id: "fr1", reportName: "Balance Sheet Q3", reportType: "Balance Sheet", totalAssets: "25500000", totalLiabilities: "12300000", totalEquity: "13200000", status: "approved" },
        { id: "fr2", reportName: "P&L November", reportType: "P&L", totalAssets: "0", totalLiabilities: "0", totalEquity: "2100000", status: "draft" }
      );
    }
    res.json(financialReportsStore);
  });

  app.post("/api/financial-reports", (req, res) => {
    const report = { id: `fr-${Date.now()}`, ...req.body, status: "draft", approvalStatus: "pending" };
    financialReportsStore.push(report);
    res.status(201).json(report);
  });

  // ========== MODULE 7: INVENTORY, PROCUREMENT & SUPPLY CHAIN ENDPOINTS ==========
  const purchaseRequisitionsStore: any[] = [];
  const goodsReceiptStore: any[] = [];
  const demandForecastingStore: any[] = [];
  const supplierPerformanceStore: any[] = [];

  app.get("/api/purchase-requisitions", (req, res) => {
    if (purchaseRequisitionsStore.length === 0) {
      purchaseRequisitionsStore.push(
        { id: "pr1", requisitionNumber: "PR-2025-001", requestedBy: "user1", department: "Operations", quantity: 50, unitPrice: "500", status: "draft", approvalStatus: "pending" },
        { id: "pr2", requisitionNumber: "PR-2025-002", requestedBy: "user2", department: "Manufacturing", quantity: 120, unitPrice: "375", status: "draft", approvalStatus: "pending" }
      );
    }
    res.json(purchaseRequisitionsStore);
  });

  app.post("/api/purchase-requisitions", (req, res) => {
    const pr = { id: `pr-${Date.now()}`, ...req.body, status: "draft", approvalStatus: "pending" };
    purchaseRequisitionsStore.push(pr);
    res.status(201).json(pr);
  });

  app.get("/api/goods-receipt", (req, res) => {
    if (goodsReceiptStore.length === 0) {
      goodsReceiptStore.push(
        { id: "gr1", receiptNumber: "GR-2025-001", poNumber: "PO-001", vendorId: "v1", totalItems: 50, status: "received", inspectionStatus: "passed" },
        { id: "gr2", receiptNumber: "GR-2025-002", poNumber: "PO-002", vendorId: "v2", totalItems: 120, status: "received", inspectionStatus: "in-progress" }
      );
    }
    res.json(goodsReceiptStore);
  });

  app.post("/api/goods-receipt", (req, res) => {
    const gr = { id: `gr-${Date.now()}`, ...req.body, status: "received", inspectionStatus: "pending" };
    goodsReceiptStore.push(gr);
    res.status(201).json(gr);
  });

  app.get("/api/demand-forecasting", (req, res) => {
    if (demandForecastingStore.length === 0) {
      demandForecastingStore.push(
        { id: "df1", forecastPeriod: "Q1-2026", itemId: "SKU-001", forecastedDemand: 5000, actualDemand: 4850, accuracy: "97", forecastMethod: "TimeSeries" },
        { id: "df2", forecastPeriod: "Q1-2026", itemId: "SKU-002", forecastedDemand: 3200, actualDemand: 3400, accuracy: "94", forecastMethod: "MachineLearning" }
      );
    }
    res.json(demandForecastingStore);
  });

  app.post("/api/demand-forecasting", (req, res) => {
    const df = { id: `df-${Date.now()}`, ...req.body };
    demandForecastingStore.push(df);
    res.status(201).json(df);
  });

  app.get("/api/supplier-performance", (req, res) => {
    if (supplierPerformanceStore.length === 0) {
      supplierPerformanceStore.push(
        { id: "sp1", supplierId: "v1", onTimeDelivery: "98", qualityScore: "96", costCompetitiveness: "92", overallRating: "4.9", evaluationPeriod: "Q4-2025" },
        { id: "sp2", supplierId: "v2", onTimeDelivery: "94", qualityScore: "89", costCompetitiveness: "85", overallRating: "4.2", evaluationPeriod: "Q4-2025" }
      );
    }
    res.json(supplierPerformanceStore);
  });

  app.post("/api/supplier-performance", (req, res) => {
    const sp = { id: `sp-${Date.now()}`, ...req.body };
    supplierPerformanceStore.push(sp);
    res.status(201).json(sp);
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  return httpServer;
}
