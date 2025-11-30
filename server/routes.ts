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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

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
  const rolesStore: any[] = [];
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

  // Sprints
  const sprintsStore: any[] = [];
  app.get("/api/projects/sprints", (req, res) => {
    if (sprintsStore.length === 0) {
      sprintsStore.push(
        { id: "sprint1", sprintKey: "SPRINT-1", name: "Sprint 1 - UI Refresh", status: "active", startDate: new Date().toISOString(), endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), goal: "Complete dashboard redesign", teamId: "team1" },
        { id: "sprint2", sprintKey: "SPRINT-2", name: "Sprint 2 - API Optimization", status: "planning", startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(), goal: "50% latency reduction", teamId: "team2" }
      );
    }
    res.json(sprintsStore);
  });
  app.post("/api/projects/sprints/:id/start", (req, res) => {
    const sprint = sprintsStore.find((s: any) => s.id === req.params.id);
    if (sprint) {
      sprint.status = "active";
      sprint.startDate = new Date().toISOString();
    }
    res.json(sprint);
  });
  app.post("/api/projects/sprints/:id/complete", (req, res) => {
    const sprint = sprintsStore.find((s: any) => s.id === req.params.id);
    if (sprint) {
      sprint.status = "completed";
    }
    res.json(sprint);
  });

  // Kanban Board
  const boardStore = { id: "board1", name: "Main Board", columns: ["Todo", "In Progress", "Review", "Done"] };
  app.get("/api/projects/kanban-board", (req, res) => {
    res.json(boardStore);
  });

  // Tasks (for Kanban)
  const tasksStore: any[] = [];
  app.get("/api/projects/kanban-tasks", (req, res) => {
    if (tasksStore.length === 0) {
      tasksStore.push(
        { id: "task1", taskKey: "TASK-001", storyId: "story1", title: "Implement theme provider", description: "Add React Context for theme", status: "in_progress", assignee: "Alice Dev", estimatedHours: "3", actualHours: "1.5" },
        { id: "task2", taskKey: "TASK-002", storyId: "story1", title: "Add theme toggle button", description: "UI component for theme switch", status: "todo", assignee: "Alice Dev", estimatedHours: "2", actualHours: "0" },
        { id: "task3", taskKey: "TASK-003", storyId: "story2", title: "Create wireframe", description: "Design new dashboard layout", status: "review", assignee: "Bob Designer", estimatedHours: "5", actualHours: "5" },
        { id: "task4", taskKey: "TASK-004", storyId: "story2", title: "Dashboard component", description: "Build React component", status: "done", assignee: "Alice Dev", estimatedHours: "8", actualHours: "8.5" }
      );
    }
    res.json(tasksStore);
  });
  app.post("/api/projects/kanban-tasks", (req, res) => {
    const task = { id: `task-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    tasksStore.push(task);
    res.status(201).json(task);
  });


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

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  return httpServer;
}
