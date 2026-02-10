import type { AICapability } from "@/types/nexus-ai";

/**
 * NexusAI Capabilities Registry — Comprehensive Cross-Module
 * Maps application modules/routes to AI-specific tools and insights.
 * The NexusAI agent uses this to provide context-aware assistance.
 */
export const AI_CAPABILITIES_REGISTRY: AICapability[] = [
  {
    id: "finance",
    module: "Finance",
    name: "Financial AI Assistant",
    description: "Journal entries, reconciliation, financial analysis",
    routes: ["/finance", "/gl", "/chart-of-accounts", "/bank-reconciliation", "/financial-reports"],
    insights: [
      "Analyze spending trends across cost centers",
      "Detect anomalies in journal entries",
      "Generate period-close checklists",
      "Forecast cash flow based on historical patterns",
    ],
    tools: [
      {
        name: "create_journal_entry",
        description: "Create a new general ledger journal entry",
        parameters: {
          description: { type: "string", description: "Journal entry description", required: true },
          amount: { type: "number", description: "Entry amount", required: true },
          debitAccount: { type: "string", description: "Debit account code", required: true },
          creditAccount: { type: "string", description: "Credit account code", required: true },
        },
        action: "/api/nexus-ai/tools/execute",
      },
      {
        name: "analyze_account_balance",
        description: "Get account balance and recent activity",
        parameters: {
          accountCode: { type: "string", description: "Chart of accounts code", required: true },
        },
        action: "/api/nexus-ai/tools/execute",
      },
      {
        name: "detect_gl_anomalies",
        description: "Detect anomalies in GL journals",
        parameters: {},
        action: "/api/nexus-ai/tools/execute",
      },
      {
        name: "explain_variance",
        description: "Analyze variances between two fiscal periods",
        parameters: {
          periodId: { type: "string", description: "Period ID", required: true },
          benchmarkPeriodId: { type: "string", description: "Benchmark period ID", required: true },
        },
        action: "/api/nexus-ai/tools/execute",
      },
      {
        name: "close_period",
        description: "Close a fiscal period",
        parameters: {
          periodId: { type: "string", description: "Period ID to close", required: true },
        },
        action: "/api/nexus-ai/tools/execute",
      },
    ],
  },
  {
    id: "ap",
    module: "Accounts Payable",
    name: "AP AI Assistant",
    description: "Supplier invoices, payment status, AP analysis",
    routes: ["/accounts-payable", "/ap"],
    insights: [
      "Check invoice payment status",
      "Create supplier invoices via AI",
      "Analyze payment patterns",
      "Predict cash requirements for AP",
    ],
    tools: [
      {
        name: "create_ap_invoice",
        description: "Create a new supplier invoice",
        parameters: {
          supplierId: { type: "string", description: "Supplier ID" },
          amount: { type: "number", description: "Invoice amount" },
          currency: { type: "string", description: "Currency code" },
        },
        action: "/api/nexus-ai/tools/execute",
      },
      {
        name: "check_ap_status",
        description: "Check AP invoice or payment status",
        parameters: {
          invoiceNumber: { type: "string", description: "Invoice number to look up" },
        },
        action: "/api/nexus-ai/tools/execute",
      },
    ],
  },
  {
    id: "ar",
    module: "Accounts Receivable",
    name: "AR AI Assistant",
    description: "Customer balances, collections, payment prediction",
    routes: ["/accounts-receivable", "/ar"],
    insights: [
      "Check customer outstanding balances",
      "Predict payment dates for invoices",
      "Generate collection emails with AI",
      "Analyze aging and collection strategies",
    ],
    tools: [
      {
        name: "check_ar_balance",
        description: "Check customer outstanding balance",
        parameters: {
          customerName: { type: "string", description: "Customer name to look up", required: true },
        },
        action: "/api/nexus-ai/tools/execute",
      },
      {
        name: "predict_payment_dates",
        description: "AI-predict when invoices will be paid",
        parameters: {
          invoiceIds: { type: "string", description: "Comma-separated invoice IDs" },
        },
        action: "/api/nexus-ai/tools/execute",
      },
      {
        name: "generate_collection_email",
        description: "Generate a professional collection email",
        parameters: {
          invoice: { type: "string", description: "Invoice details (JSON)" },
          customer: { type: "string", description: "Customer details (JSON)" },
        },
        action: "/api/nexus-ai/tools/execute",
      },
    ],
  },
  {
    id: "fa",
    module: "Fixed Assets",
    name: "Fixed Assets AI Assistant",
    description: "Asset management, depreciation, valuation",
    routes: ["/fixed-assets", "/fa"],
    insights: [
      "Create assets and run depreciation",
      "Analyze asset utilization and value",
      "Forecast replacement needs",
    ],
    tools: [
      {
        name: "create_asset",
        description: "Create a new fixed asset",
        parameters: {
          description: { type: "string", description: "Asset description", required: true },
          originalCost: { type: "number", description: "Original cost", required: true },
          categoryId: { type: "string", description: "Asset category" },
        },
        action: "/api/nexus-ai/tools/execute",
      },
      {
        name: "run_depreciation",
        description: "Run depreciation for a period",
        parameters: {
          bookId: { type: "string", description: "Book ID" },
          periodName: { type: "string", description: "Period name" },
        },
        action: "/api/nexus-ai/tools/execute",
      },
    ],
  },
  {
    id: "cash",
    module: "Cash Management",
    name: "Cash Management AI Assistant",
    description: "Cash flow forecasting and treasury analysis",
    routes: ["/cash-management", "/treasury"],
    insights: [
      "Forecast cash flow for upcoming periods",
      "Analyze cash position and liquidity",
      "Optimize payment timing",
    ],
    tools: [
      {
        name: "forecast_cash",
        description: "Generate cash flow forecast",
        parameters: { periods: { type: "number", description: "Number of months to forecast" } },
        action: "/api/nexus-ai/tools/execute",
      },
    ],
  },
  {
    id: "crm",
    module: "CRM",
    name: "CRM AI Assistant",
    description: "Lead scoring, opportunity analysis, customer insights, sales forecasting",
    routes: ["/crm", "/leads", "/opportunities", "/contacts", "/accounts"],
    insights: [
      "Score leads based on engagement signals",
      "Predict deal close probability",
      "Recommend next best actions for opportunities",
      "Generate sales pipeline forecast",
    ],
    tools: [
      {
        name: "score_lead",
        description: "Score a lead based on available data",
        parameters: {
          leadId: { type: "string", description: "Lead ID to score", required: true },
        },
        action: "/api/nexus-ai/tools/execute",
      },
      {
        name: "create_lead",
        description: "Create a new lead from AI",
        parameters: {
          firstName: { type: "string", description: "First name", required: true },
          lastName: { type: "string", description: "Last name" },
          email: { type: "string", description: "Email address" },
          company: { type: "string", description: "Company name" },
        },
        action: "/api/nexus-ai/tools/execute",
      },
      {
        name: "analyze_opportunity",
        description: "AI analysis of opportunity win probability",
        parameters: {
          opportunityId: { type: "string", description: "Opportunity ID", required: true },
        },
        action: "/api/nexus-ai/tools/execute",
      },
      {
        name: "get_forecast_summary",
        description: "Get sales pipeline forecast summary",
        parameters: {},
        action: "/api/nexus-ai/tools/execute",
      },
    ],
  },
  {
    id: "hr",
    module: "Human Resources",
    name: "HR AI Assistant",
    description: "Leave balances, timesheets, team metrics, learning, attrition forecasting",
    routes: ["/hr", "/employees", "/attendance", "/learning", "/recruitment", "/compensation", "/hr-self-service"],
    insights: [
      "Check your leave balance and timesheet status",
      "Identify attrition risk employees",
      "Recommend personalized learning paths",
      "Analyze team performance metrics",
    ],
    tools: [
      {
        name: "query_leave_balance",
        description: "Check employee leave balances",
        parameters: {
          personId: { type: "string", description: "Employee/Person ID", required: true },
        },
        action: "/api/nexus-ai/tools/execute",
      },
      {
        name: "query_timesheet",
        description: "Check timesheet status",
        parameters: {
          personId: { type: "string", description: "Employee/Person ID", required: true },
        },
        action: "/api/nexus-ai/tools/execute",
      },
      {
        name: "get_team_metrics",
        description: "Get team performance and metrics for a manager",
        parameters: {
          managerId: { type: "string", description: "Manager ID", required: true },
        },
        action: "/api/nexus-ai/tools/execute",
      },
      {
        name: "get_attrition_forecast",
        description: "Predict employee attrition risk",
        parameters: {},
        action: "/api/nexus-ai/tools/execute",
      },
      {
        name: "recommend_courses",
        description: "Get AI-powered course recommendations for an employee",
        parameters: {
          employeeId: { type: "string", description: "Employee ID", required: true },
        },
        action: "/api/nexus-ai/tools/execute",
      },
    ],
  },
  {
    id: "projects",
    module: "Projects",
    name: "Project AI Assistant",
    description: "Task management, resource allocation, project health, risk analysis",
    routes: ["/projects", "/tasks", "/sprints", "/agile-board", "/epics", "/ppm"],
    insights: [
      "Predict project delivery delays",
      "Optimize resource allocation across projects",
      "Identify blockers and suggest mitigations",
      "Analyze project health and burndown",
    ],
    tools: [
      {
        name: "create_task",
        description: "Create a new project task",
        parameters: {
          title: { type: "string", description: "Task title", required: true },
          projectId: { type: "string", description: "Project ID" },
          priority: { type: "string", description: "Priority: low, medium, high, critical" },
          assigneeId: { type: "string", description: "Assignee user ID" },
        },
        action: "/api/nexus-ai/tools/execute",
      },
      {
        name: "analyze_project_health",
        description: "Analyze project health metrics and risks",
        parameters: {
          projectId: { type: "string", description: "Project ID", required: true },
        },
        action: "/api/nexus-ai/tools/execute",
      },
    ],
  },
  {
    id: "scm",
    module: "Supply Chain",
    name: "Supply Chain AI Assistant",
    description: "Demand forecasting, RFQ analysis, spend analytics, delivery prediction",
    routes: ["/inventory", "/procurement", "/supply-chain", "/warehouse"],
    insights: [
      "Forecast demand using historical data",
      "Analyze RFQ bids for outliers and risk",
      "Predict supplier delivery delays",
      "Identify spend reduction opportunities",
    ],
    tools: [
      {
        name: "forecast_demand",
        description: "Generate demand forecast for a product",
        parameters: {
          productId: { type: "string", description: "Product/Item ID", required: true },
          periods: { type: "number", description: "Number of periods to forecast" },
        },
        action: "/api/nexus-ai/tools/execute",
      },
      {
        name: "analyze_rfq_bids",
        description: "Analyze RFQ bids for outliers and risks",
        parameters: {
          rfqId: { type: "string", description: "RFQ ID", required: true },
        },
        action: "/api/nexus-ai/tools/execute",
      },
      {
        name: "predict_delivery_delays",
        description: "Predict delivery delays for a supplier",
        parameters: {
          supplierId: { type: "string", description: "Supplier ID", required: true },
        },
        action: "/api/nexus-ai/tools/execute",
      },
      {
        name: "analyze_spend",
        description: "Analyze procurement spend patterns",
        parameters: {
          category: { type: "string", description: "Spend category" },
        },
        action: "/api/nexus-ai/tools/execute",
      },
    ],
  },
  {
    id: "manufacturing",
    module: "Manufacturing",
    name: "Manufacturing AI Assistant",
    description: "Production costs, yield analysis, quality prediction",
    routes: ["/manufacturing", "/work-orders", "/bom", "/quality", "/mrp"],
    insights: [
      "Predict standard costs from production history",
      "Analyze production yield and root causes",
      "Detect quality anomalies in production runs",
      "Suggest BOM cost optimizations",
    ],
    tools: [
      {
        name: "predict_standard_cost",
        description: "Predict standard cost for a product",
        parameters: {
          productId: { type: "string", description: "Product ID", required: true },
        },
        action: "/api/nexus-ai/tools/execute",
      },
      {
        name: "analyze_yield",
        description: "Analyze production yield and variance",
        parameters: {
          workOrderId: { type: "string", description: "Work Order ID", required: true },
        },
        action: "/api/nexus-ai/tools/execute",
      },
    ],
  },
  {
    id: "intercompany",
    module: "Intercompany",
    name: "Intercompany AI Assistant",
    description: "Intercompany anomaly detection and reconciliation",
    routes: ["/intercompany"],
    insights: [
      "Detect anomalies in intercompany batches",
      "Reconcile intercompany balances",
    ],
    tools: [
      {
        name: "detect_ic_anomalies",
        description: "Detect anomalies in intercompany transactions",
        parameters: {
          batchId: { type: "string", description: "Batch ID", required: true },
        },
        action: "/api/nexus-ai/tools/execute",
      },
    ],
  },
  {
    id: "general",
    module: "General",
    name: "NexusAI General Assistant",
    description: "Cross-module queries, navigation help, data exploration",
    routes: ["/", "/dashboard"],
    insights: [
      "Navigate to any module or feature",
      "Search across all modules",
      "Generate cross-module reports",
      "Explain platform features and capabilities",
    ],
    tools: [],
  },
];

/**
 * Get capabilities for a specific route
 */
export function getCapabilitiesForRoute(route: string): AICapability[] {
  const matches = AI_CAPABILITIES_REGISTRY.filter(cap =>
    cap.routes.some(r => route.startsWith(r))
  );
  // Always include general capabilities
  const general = AI_CAPABILITIES_REGISTRY.find(c => c.id === "general");
  if (general && !matches.find(m => m.id === "general")) {
    matches.push(general);
  }
  return matches;
}

/**
 * Get all available tool definitions (for system prompt construction)
 */
export function getAllToolDefinitions() {
  return AI_CAPABILITIES_REGISTRY.flatMap(cap =>
    cap.tools.map(tool => ({
      module: cap.module,
      ...tool,
    }))
  );
}

/**
 * Get all module names for multi-context selector
 */
export function getAllModules(): string[] {
  return AI_CAPABILITIES_REGISTRY
    .filter(c => c.id !== "general")
    .map(c => c.module);
}
