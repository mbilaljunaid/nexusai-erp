import type { AICapability } from "@/types/nexus-ai";

/**
 * NexusAI Capabilities Registry
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
        action: "/api/gl/journal-entries",
      },
      {
        name: "analyze_account_balance",
        description: "Get account balance and recent activity",
        parameters: {
          accountCode: { type: "string", description: "Chart of accounts code", required: true },
        },
        action: "/api/gl/accounts/balance",
      },
    ],
  },
  {
    id: "crm",
    module: "CRM",
    name: "CRM AI Assistant",
    description: "Lead scoring, opportunity analysis, customer insights",
    routes: ["/crm", "/leads", "/opportunities", "/contacts", "/accounts"],
    insights: [
      "Score leads based on engagement signals",
      "Predict deal close probability",
      "Recommend next best actions for opportunities",
      "Analyze customer sentiment from interactions",
    ],
    tools: [
      {
        name: "score_lead",
        description: "Score a lead based on available data",
        parameters: {
          leadId: { type: "string", description: "Lead ID to score", required: true },
        },
        action: "/api/crm/leads/score",
      },
      {
        name: "analyze_opportunity",
        description: "AI analysis of opportunity win probability",
        parameters: {
          opportunityId: { type: "string", description: "Opportunity ID", required: true },
        },
        action: "/api/crm/opportunities/analyze",
      },
    ],
  },
  {
    id: "hr",
    module: "Human Resources",
    name: "HR AI Assistant",
    description: "Employee insights, learning recommendations, workforce planning",
    routes: ["/hr", "/employees", "/attendance", "/learning", "/recruitment", "/compensation"],
    insights: [
      "Identify attrition risk employees",
      "Recommend personalized learning paths",
      "Analyze workforce capacity and gaps",
      "Benchmark compensation against market data",
    ],
    tools: [
      {
        name: "recommend_courses",
        description: "Get AI-powered course recommendations for an employee",
        parameters: {
          employeeId: { type: "string", description: "Employee ID", required: true },
        },
        action: "/api/hr/learning/recommendations",
      },
    ],
  },
  {
    id: "projects",
    module: "Projects",
    name: "Project AI Assistant",
    description: "Task management, resource allocation, risk analysis",
    routes: ["/projects", "/tasks", "/sprints", "/agile-board", "/epics"],
    insights: [
      "Predict project delivery delays",
      "Optimize resource allocation across projects",
      "Identify blockers and suggest mitigations",
      "Generate sprint planning recommendations",
    ],
    tools: [
      {
        name: "create_task",
        description: "Create a new project task",
        parameters: {
          title: { type: "string", description: "Task title", required: true },
          projectId: { type: "string", description: "Project ID", required: true },
          priority: { type: "string", description: "Priority: low, medium, high, critical" },
          assigneeId: { type: "string", description: "Assignee user ID" },
        },
        action: "/api/tasks",
      },
    ],
  },
  {
    id: "scm",
    module: "Supply Chain",
    name: "Supply Chain AI Assistant",
    description: "Demand forecasting, inventory optimization, supplier analysis",
    routes: ["/inventory", "/procurement", "/supply-chain", "/warehouse"],
    insights: [
      "Forecast demand using historical data",
      "Optimize reorder points and safety stock",
      "Analyze supplier performance and risk",
      "Identify cost reduction opportunities",
    ],
    tools: [
      {
        name: "forecast_demand",
        description: "Generate demand forecast for a product",
        parameters: {
          productId: { type: "string", description: "Product/Item ID", required: true },
          periods: { type: "number", description: "Number of periods to forecast" },
        },
        action: "/api/scm/forecast",
      },
    ],
  },
  {
    id: "manufacturing",
    module: "Manufacturing",
    name: "Manufacturing AI Assistant",
    description: "Production planning, quality analysis, maintenance prediction",
    routes: ["/manufacturing", "/work-orders", "/bom", "/quality", "/mrp"],
    insights: [
      "Predict equipment maintenance needs",
      "Optimize production scheduling",
      "Detect quality anomalies in production runs",
      "Suggest BOM cost optimizations",
    ],
    tools: [],
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
