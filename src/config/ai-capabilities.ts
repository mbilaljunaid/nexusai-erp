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
      { name: "create_journal_entry", description: "Create a new general ledger journal entry", parameters: { description: { type: "string", description: "Journal entry description", required: true }, amount: { type: "number", description: "Entry amount", required: true }, debitAccount: { type: "string", description: "Debit account code", required: true }, creditAccount: { type: "string", description: "Credit account code", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "analyze_account_balance", description: "Get account balance and recent activity", parameters: { accountCode: { type: "string", description: "Chart of accounts code", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "detect_gl_anomalies", description: "Detect anomalies in GL journals", parameters: {}, action: "/api/nexus-ai/tools/execute" },
      { name: "explain_variance", description: "Analyze variances between two fiscal periods", parameters: { periodId: { type: "string", description: "Period ID", required: true }, benchmarkPeriodId: { type: "string", description: "Benchmark period ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "close_period", description: "Close a fiscal period", parameters: { periodId: { type: "string", description: "Period ID to close", required: true } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "ap",
    module: "Accounts Payable",
    name: "AP AI Assistant",
    description: "Supplier invoices, payment status, AP analysis",
    routes: ["/accounts-payable", "/ap"],
    insights: ["Check invoice payment status", "Create supplier invoices via AI", "Analyze payment patterns", "Predict cash requirements for AP"],
    tools: [
      { name: "create_ap_invoice", description: "Create a new supplier invoice", parameters: { supplierId: { type: "string", description: "Supplier ID" }, amount: { type: "number", description: "Invoice amount" }, currency: { type: "string", description: "Currency code" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_ap_status", description: "Check AP invoice or payment status", parameters: { invoiceNumber: { type: "string", description: "Invoice number to look up" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "ar",
    module: "Accounts Receivable",
    name: "AR AI Assistant",
    description: "Customer balances, collections, payment prediction",
    routes: ["/accounts-receivable", "/ar"],
    insights: ["Check customer outstanding balances", "Predict payment dates for invoices", "Generate collection emails with AI", "Analyze aging and collection strategies"],
    tools: [
      { name: "check_ar_balance", description: "Check customer outstanding balance", parameters: { customerName: { type: "string", description: "Customer name to look up", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "predict_payment_dates", description: "AI-predict when invoices will be paid", parameters: { invoiceIds: { type: "string", description: "Comma-separated invoice IDs" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "generate_collection_email", description: "Generate a professional collection email", parameters: { invoice: { type: "string", description: "Invoice details (JSON)" }, customer: { type: "string", description: "Customer details (JSON)" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "fa",
    module: "Fixed Assets",
    name: "Fixed Assets AI Assistant",
    description: "Asset management, depreciation, valuation",
    routes: ["/fixed-assets", "/fa"],
    insights: ["Create assets and run depreciation", "Analyze asset utilization and value", "Forecast replacement needs"],
    tools: [
      { name: "create_asset", description: "Create a new fixed asset", parameters: { description: { type: "string", description: "Asset description", required: true }, originalCost: { type: "number", description: "Original cost", required: true }, categoryId: { type: "string", description: "Asset category" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "run_depreciation", description: "Run depreciation for a period", parameters: { bookId: { type: "string", description: "Book ID" }, periodName: { type: "string", description: "Period name" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "cash",
    module: "Cash Management",
    name: "Cash Management AI Assistant",
    description: "Cash flow forecasting and treasury analysis",
    routes: ["/cash-management"],
    insights: ["Forecast cash flow for upcoming periods", "Analyze cash position and liquidity", "Optimize payment timing"],
    tools: [
      { name: "forecast_cash", description: "Generate cash flow forecast", parameters: { periods: { type: "number", description: "Number of months to forecast" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "crm",
    module: "CRM",
    name: "CRM AI Assistant",
    description: "Lead scoring, opportunity analysis, customer insights, sales forecasting",
    routes: ["/crm", "/leads", "/opportunities", "/contacts", "/accounts"],
    insights: ["Score leads based on engagement signals", "Predict deal close probability", "Recommend next best actions for opportunities", "Generate sales pipeline forecast"],
    tools: [
      { name: "score_lead", description: "Score a lead based on available data", parameters: { leadId: { type: "string", description: "Lead ID to score", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "create_lead", description: "Create a new lead from AI", parameters: { firstName: { type: "string", description: "First name", required: true }, lastName: { type: "string", description: "Last name" }, email: { type: "string", description: "Email address" }, company: { type: "string", description: "Company name" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "analyze_opportunity", description: "AI analysis of opportunity win probability", parameters: { opportunityId: { type: "string", description: "Opportunity ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_forecast_summary", description: "Get sales pipeline forecast summary", parameters: {}, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "hr",
    module: "Human Resources",
    name: "HR AI Assistant",
    description: "Leave balances, timesheets, team metrics, learning, attrition forecasting",
    routes: ["/hr", "/employees", "/attendance", "/learning", "/hr-self-service"],
    insights: ["Check your leave balance and timesheet status", "Identify attrition risk employees", "Recommend personalized learning paths", "Analyze team performance metrics"],
    tools: [
      { name: "query_leave_balance", description: "Check employee leave balances", parameters: { personId: { type: "string", description: "Employee/Person ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "query_timesheet", description: "Check timesheet status", parameters: { personId: { type: "string", description: "Employee/Person ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_team_metrics", description: "Get team performance and metrics for a manager", parameters: { managerId: { type: "string", description: "Manager ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_attrition_forecast", description: "Predict employee attrition risk", parameters: {}, action: "/api/nexus-ai/tools/execute" },
      { name: "recommend_courses", description: "Get AI-powered course recommendations for an employee", parameters: { employeeId: { type: "string", description: "Employee ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "projects",
    module: "Projects",
    name: "Project AI Assistant",
    description: "Task management, resource allocation, project health, risk analysis",
    routes: ["/projects", "/tasks", "/sprints", "/agile-board", "/epics", "/ppm"],
    insights: ["Predict project delivery delays", "Optimize resource allocation across projects", "Identify blockers and suggest mitigations", "Analyze project health and burndown"],
    tools: [
      { name: "create_task", description: "Create a new project task", parameters: { title: { type: "string", description: "Task title", required: true }, projectId: { type: "string", description: "Project ID" }, priority: { type: "string", description: "Priority: low, medium, high, critical" }, assigneeId: { type: "string", description: "Assignee user ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "analyze_project_health", description: "Analyze project health metrics and risks", parameters: { projectId: { type: "string", description: "Project ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "scm",
    module: "Supply Chain",
    name: "Supply Chain AI Assistant",
    description: "Demand forecasting, RFQ analysis, spend analytics, delivery prediction",
    routes: ["/inventory", "/procurement", "/supply-chain", "/warehouse"],
    insights: ["Forecast demand using historical data", "Analyze RFQ bids for outliers and risk", "Predict supplier delivery delays", "Identify spend reduction opportunities"],
    tools: [
      { name: "forecast_demand", description: "Generate demand forecast for a product", parameters: { productId: { type: "string", description: "Product/Item ID", required: true }, periods: { type: "number", description: "Number of periods to forecast" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "analyze_rfq_bids", description: "Analyze RFQ bids for outliers and risks", parameters: { rfqId: { type: "string", description: "RFQ ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "predict_delivery_delays", description: "Predict delivery delays for a supplier", parameters: { supplierId: { type: "string", description: "Supplier ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "analyze_spend", description: "Analyze procurement spend patterns", parameters: { category: { type: "string", description: "Spend category" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "manufacturing",
    module: "Manufacturing",
    name: "Manufacturing AI Assistant",
    description: "Production costs, yield analysis, quality prediction",
    routes: ["/manufacturing", "/work-orders", "/bom", "/quality", "/mrp"],
    insights: ["Predict standard costs from production history", "Analyze production yield and root causes", "Detect quality anomalies in production runs", "Suggest BOM cost optimizations"],
    tools: [
      { name: "predict_standard_cost", description: "Predict standard cost for a product", parameters: { productId: { type: "string", description: "Product ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "analyze_yield", description: "Analyze production yield and variance", parameters: { workOrderId: { type: "string", description: "Work Order ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "intercompany",
    module: "Intercompany",
    name: "Intercompany AI Assistant",
    description: "Intercompany anomaly detection and reconciliation",
    routes: ["/intercompany"],
    insights: ["Detect anomalies in intercompany batches", "Reconcile intercompany balances"],
    tools: [
      { name: "detect_ic_anomalies", description: "Detect anomalies in intercompany transactions", parameters: { batchId: { type: "string", description: "Batch ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },

  // ═══════════════════════════════════════════════
  // NEW MODULE CAPABILITIES — Phase 2 Expansion
  // ═══════════════════════════════════════════════

  {
    id: "treasury",
    module: "Treasury",
    name: "Treasury AI Assistant",
    description: "Cash positions, FX dealing, risk management, ISO 20022",
    routes: ["/treasury", "/treasury/fx", "/treasury/risk", "/treasury/ihb"],
    insights: ["Check real-time cash positions across all banks", "Create FX spot or forward deals", "Monitor counterparty risk limits and VaR", "Generate ISO 20022 payment messages"],
    tools: [
      { name: "get_cash_position", description: "Get bank account balances and cash position", parameters: { tenantId: { type: "string", description: "Tenant ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "create_fx_deal", description: "Create a foreign exchange deal (spot/forward)", parameters: { buyCurrency: { type: "string", description: "Buy currency code", required: true }, sellCurrency: { type: "string", description: "Sell currency code", required: true }, amount: { type: "number", description: "Deal amount", required: true }, dealType: { type: "string", description: "spot or forward" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_market_rates", description: "Fetch current FX market rates", parameters: {}, action: "/api/nexus-ai/tools/execute" },
      { name: "check_risk_limits", description: "Evaluate counterparty and VaR risk limits", parameters: { tenantId: { type: "string", description: "Tenant ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "generate_iso20022", description: "Generate ISO 20022 payment message XML", parameters: { messageType: { type: "string", description: "Message type (e.g., pain.001)" }, totalAmount: { type: "number", description: "Total payment amount" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "consolidation",
    module: "Consolidation",
    name: "Consolidation AI Assistant",
    description: "Multi-ledger consolidation runs and status tracking",
    routes: ["/consolidation"],
    insights: ["Run multi-entity consolidation", "Check consolidation status and elimination entries", "Reconcile intercompany balances post-consolidation"],
    tools: [
      { name: "run_consolidation", description: "Execute a multi-ledger consolidation run", parameters: { periodId: { type: "string", description: "Fiscal period ID", required: true }, ledgerSetId: { type: "string", description: "Ledger set ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_consolidation_status", description: "Check status of a consolidation run", parameters: { runId: { type: "string", description: "Consolidation run ID" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "tax",
    module: "Tax",
    name: "Tax AI Assistant",
    description: "Tax calculation, filing status, and reporting",
    routes: ["/tax", "/tax-reporting"],
    insights: ["Calculate tax for transactions", "Check tax filing deadlines and status", "Generate tax provision reports"],
    tools: [
      { name: "calculate_tax", description: "Calculate tax for a transaction amount", parameters: { amount: { type: "number", description: "Transaction amount", required: true }, taxCode: { type: "string", description: "Tax code (VAT, GST, etc.)" }, jurisdiction: { type: "string", description: "Tax jurisdiction" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_tax_filing_status", description: "Check tax period filing status", parameters: { period: { type: "string", description: "Tax period (e.g., Q4-2025)" }, jurisdiction: { type: "string", description: "Jurisdiction" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "generate_tax_report", description: "Generate a tax summary report", parameters: { period: { type: "string", description: "Tax period" }, reportType: { type: "string", description: "Report type (summary, detail)" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "revenue",
    module: "Revenue Recognition",
    name: "Revenue Recognition AI Assistant",
    description: "ASC 606 compliance, contract revenue status, waterfall reports",
    routes: ["/revenue", "/revenue-recognition"],
    insights: ["Check revenue recognition status for contracts", "Generate revenue waterfall reports", "Analyze deferred revenue balances"],
    tools: [
      { name: "check_revenue_recognition", description: "Check revenue recognition status for a contract", parameters: { contractId: { type: "string", description: "Contract ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "generate_revenue_waterfall", description: "Generate a revenue waterfall report", parameters: { period: { type: "string", description: "Fiscal period" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "epm",
    module: "EPM / Budgeting",
    name: "EPM AI Assistant",
    description: "Budget vs. actual analysis, forecast scenarios, planning",
    routes: ["/epm", "/budgeting", "/planning"],
    insights: ["Compare budget to actuals by cost center", "Create forecast scenarios with adjustments", "Identify budget variances and root causes"],
    tools: [
      { name: "get_budget_vs_actual", description: "Compare budget to actuals for a cost center", parameters: { costCenter: { type: "string", description: "Cost center code" }, period: { type: "string", description: "Budget period" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "create_forecast_scenario", description: "Create a budget forecast scenario", parameters: { name: { type: "string", description: "Scenario name", required: true }, baseScenario: { type: "string", description: "Base scenario to adjust from" }, adjustments: { type: "string", description: "JSON adjustments (revenueGrowth, costReduction)" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "payroll",
    module: "Payroll",
    name: "Payroll AI Assistant",
    description: "Payroll previews, summaries, anomaly detection",
    routes: ["/payroll", "/compensation"],
    insights: ["Preview payroll run before processing", "Detect anomalies in payroll data", "Analyze payroll cost trends"],
    tools: [
      { name: "run_payroll_preview", description: "Preview payroll calculations before processing", parameters: { periodId: { type: "string", description: "Pay period ID" }, tenantId: { type: "string", description: "Tenant ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_payroll_summary", description: "Get payroll run summary for a period", parameters: { periodId: { type: "string", description: "Pay period ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "detect_payroll_anomalies", description: "Detect anomalies in payroll data", parameters: { tenantId: { type: "string", description: "Tenant ID" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "benefits",
    module: "Benefits",
    name: "Benefits AI Assistant",
    description: "Benefits enrollment, plan summaries, cost analysis",
    routes: ["/benefits", "/benefits-enrollment"],
    insights: ["Check employee benefits enrollment status", "Summarize benefits costs and participation", "Compare plan options"],
    tools: [
      { name: "check_benefits_enrollment", description: "Check employee benefits enrollment", parameters: { employeeId: { type: "string", description: "Employee ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_benefits_summary", description: "Summarize organization benefits costs", parameters: {}, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "recruitment",
    module: "Recruitment",
    name: "Recruitment AI Assistant",
    description: "Job requisitions, resume parsing, pipeline analytics",
    routes: ["/recruitment", "/hiring"],
    insights: ["Create job requisitions", "Parse resumes and extract skills", "Analyze recruitment pipeline metrics"],
    tools: [
      { name: "create_requisition", description: "Create a new job requisition", parameters: { title: { type: "string", description: "Job title", required: true }, department: { type: "string", description: "Department" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "parse_resume", description: "Extract skills and experience from resume text", parameters: { resumeText: { type: "string", description: "Resume text content", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_recruitment_pipeline", description: "Get recruitment pipeline statistics", parameters: { tenantId: { type: "string", description: "Tenant ID" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "performance",
    module: "Performance",
    name: "Performance AI Assistant",
    description: "Performance reviews, goal management, competency tracking",
    routes: ["/performance", "/goals"],
    insights: ["View employee performance reviews", "Create and track goals", "Analyze competency ratings"],
    tools: [
      { name: "get_performance_review", description: "Get employee performance review data", parameters: { employeeId: { type: "string", description: "Employee ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "create_goal", description: "Create a performance goal", parameters: { title: { type: "string", description: "Goal title", required: true }, targetDate: { type: "string", description: "Target completion date" }, weight: { type: "number", description: "Goal weight percentage" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "succession",
    module: "Succession Planning",
    name: "Succession AI Assistant",
    description: "Succession plans, readiness assessment, talent pipeline",
    routes: ["/succession", "/talent-management"],
    insights: ["View succession plans for key positions", "Assess candidate readiness", "Identify talent gaps"],
    tools: [
      { name: "get_succession_plan", description: "Get succession plan for a position", parameters: { positionId: { type: "string", description: "Position ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "assess_readiness", description: "Assess candidate readiness for succession", parameters: { candidateId: { type: "string", description: "Candidate ID", required: true }, targetPosition: { type: "string", description: "Target position" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "expenses",
    module: "Expenses",
    name: "Expense AI Assistant",
    description: "Expense validation, policy compliance, corporate card management",
    routes: ["/expenses", "/expense-reports"],
    insights: ["Validate expenses against policy", "Summarize expenses by category", "Import and reconcile corporate card transactions"],
    tools: [
      { name: "validate_expense", description: "Validate an expense against company policies", parameters: { amount: { type: "number", description: "Expense amount", required: true }, category: { type: "string", description: "Expense category" }, receipt: { type: "string", description: "Whether receipt is attached (true/false)" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_expense_summary", description: "Summarize expenses by category and period", parameters: { period: { type: "string", description: "Time period" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "import_card_transactions", description: "Import corporate card feed transactions", parameters: { employeeId: { type: "string", description: "Employee ID" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "field_service",
    module: "Field Service",
    name: "Field Service AI Assistant",
    description: "Work orders, technician scheduling, dispatch management",
    routes: ["/field-service", "/dispatch"],
    insights: ["Create field service work orders", "View technician schedule and availability", "Manage dispatcher queue"],
    tools: [
      { name: "create_field_work_order", description: "Create a field service work order", parameters: { type: { type: "string", description: "Work order type (Installation, Repair, Maintenance)" }, priority: { type: "string", description: "Priority level" }, description: { type: "string", description: "Work description" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_field_schedule", description: "Get technician schedule and dispatch queue", parameters: {}, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "construction",
    module: "Construction",
    name: "Construction AI Assistant",
    description: "Project risk, cost tracking, milestone progress",
    routes: ["/construction", "/construction-projects"],
    insights: ["Analyze construction project risk factors", "Track project cost vs. budget", "Monitor construction milestones"],
    tools: [
      { name: "get_construction_risk", description: "Get project risk overview", parameters: { projectId: { type: "string", description: "Construction project ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_construction_cost", description: "Get project cost summary", parameters: { projectId: { type: "string", description: "Project ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "track_construction_progress", description: "Track construction milestone status", parameters: { projectId: { type: "string", description: "Project ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "maintenance",
    module: "Maintenance / EAM",
    name: "Maintenance AI Assistant",
    description: "Work orders, preventive maintenance, meter readings",
    routes: ["/maintenance", "/eam", "/assets"],
    insights: ["Create maintenance work orders", "View preventive maintenance schedules", "Check asset meter readings and thresholds"],
    tools: [
      { name: "create_maintenance_wo", description: "Create a maintenance work order", parameters: { assetId: { type: "string", description: "Asset ID", required: true }, type: { type: "string", description: "corrective or preventive" }, priority: { type: "string", description: "Priority level" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_maintenance_schedule", description: "Get preventive maintenance schedule", parameters: { assetId: { type: "string", description: "Asset ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_meter_readings", description: "Check asset meter readings", parameters: { assetId: { type: "string", description: "Asset ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "mdm",
    module: "MDM / Data Quality",
    name: "MDM AI Assistant",
    description: "Master data search, data quality scoring, duplicate management",
    routes: ["/mdm", "/data-quality", "/parties"],
    insights: ["Search master data parties", "Check data quality health score", "Manage duplicate candidate sets"],
    tools: [
      { name: "search_parties", description: "Search master data parties", parameters: { query: { type: "string", description: "Search query", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_data_quality", description: "Run data quality health check", parameters: {}, action: "/api/nexus-ai/tools/execute" },
      { name: "get_duplicate_sets", description: "Get open duplicate candidate sets", parameters: { tenantId: { type: "string", description: "Tenant ID" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "netting",
    module: "Netting",
    name: "Netting AI Assistant",
    description: "Intercompany netting proposals and agreement management",
    routes: ["/netting", "/treasury/ihb"],
    insights: ["Generate intercompany netting proposals", "Check netting agreement status", "Analyze netting savings"],
    tools: [
      { name: "run_netting_proposal", description: "Generate an intercompany netting proposal", parameters: { agreementId: { type: "string", description: "Netting agreement ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_netting_status", description: "Check netting agreement status", parameters: { agreementId: { type: "string", description: "Agreement ID" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "order_management",
    module: "Order Management",
    name: "Order Management AI Assistant",
    description: "Sales orders, fulfillment tracking, order status",
    routes: ["/orders", "/order-management", "/sales-orders"],
    insights: ["Create sales orders", "Check order fulfillment status", "Track shipping and delivery"],
    tools: [
      { name: "create_sales_order", description: "Create a new sales order", parameters: { customerId: { type: "string", description: "Customer ID", required: true }, items: { type: "string", description: "Order items (JSON)" }, totalAmount: { type: "number", description: "Total order amount" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_order_status", description: "Check order fulfillment status", parameters: { orderId: { type: "string", description: "Order ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "campaigns",
    module: "Campaigns / Marketing",
    name: "Marketing AI Assistant",
    description: "Campaign management, performance analytics, audience targeting",
    routes: ["/campaigns", "/marketing"],
    insights: ["View campaign performance statistics", "Create new marketing campaigns", "Analyze campaign ROI"],
    tools: [
      { name: "get_campaign_stats", description: "Get campaign performance statistics", parameters: { campaignId: { type: "string", description: "Campaign ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "create_campaign", description: "Create a new marketing campaign", parameters: { name: { type: "string", description: "Campaign name", required: true }, type: { type: "string", description: "Campaign type (email, social, etc.)" }, audience: { type: "string", description: "Target audience" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "commission",
    module: "Commission",
    name: "Commission AI Assistant",
    description: "Sales commission calculation and plan management",
    routes: ["/commissions"],
    insights: ["Calculate sales commissions for deals", "Analyze commission plan effectiveness"],
    tools: [
      { name: "calculate_commission", description: "Calculate sales commission for an opportunity", parameters: { opportunityId: { type: "string", description: "Opportunity ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "contracts",
    module: "Contracts",
    name: "Contracts AI Assistant",
    description: "Contract lifecycle, expiry tracking, renewal management",
    routes: ["/contracts"],
    insights: ["Create new contracts", "Check contracts approaching expiry", "Analyze contract portfolio value"],
    tools: [
      { name: "create_contract", description: "Create a new contract", parameters: { title: { type: "string", description: "Contract title", required: true }, type: { type: "string", description: "Contract type" }, value: { type: "number", description: "Contract value" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_contract_expiry", description: "Check contracts approaching expiry", parameters: { daysAhead: { type: "number", description: "Days ahead to check (default 90)" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "transportation",
    module: "Transportation / Freight",
    name: "Transportation AI Assistant",
    description: "Carrier rate comparison, shipment tracking, freight management",
    routes: ["/transportation", "/freight", "/logistics"],
    insights: ["Compare carrier shipping rates", "Track shipment status and ETAs", "Analyze freight costs"],
    tools: [
      { name: "get_carrier_rates", description: "Compare carrier shipping rates", parameters: { origin: { type: "string", description: "Origin location", required: true }, destination: { type: "string", description: "Destination location", required: true }, weight: { type: "number", description: "Package weight in lbs" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "track_shipment", description: "Get shipment tracking information", parameters: { trackingNumber: { type: "string", description: "Tracking number", required: true } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "governance",
    module: "Governance / Audit",
    name: "Governance AI Assistant",
    description: "Audit trails, change management, compliance tracking",
    routes: ["/governance", "/audit", "/compliance"],
    insights: ["View audit trails for any entity", "Submit governed change requests", "Analyze compliance status"],
    tools: [
      { name: "get_audit_trail", description: "Get audit trail for an entity", parameters: { entityType: { type: "string", description: "Entity type (e.g., journal_entry)", required: true }, entityId: { type: "string", description: "Entity ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "create_change_request", description: "Submit a governed change request", parameters: { title: { type: "string", description: "Change request title", required: true }, description: { type: "string", description: "Change description" }, impact: { type: "string", description: "Impact level (low, medium, high)" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "allocations",
    module: "Allocations",
    name: "Allocations AI Assistant",
    description: "Cost allocation rules and execution",
    routes: ["/allocations", "/cost-allocation"],
    insights: ["Execute cost allocation rules", "Analyze allocation results", "Review allocation methods"],
    tools: [
      { name: "run_allocation", description: "Execute a cost allocation rule", parameters: { ruleId: { type: "string", description: "Allocation rule ID" }, sourcePool: { type: "string", description: "Source cost pool" }, method: { type: "string", description: "Allocation method (proportional_headcount, revenue_based, etc.)" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "reporting",
    module: "Reporting",
    name: "Reporting AI Assistant",
    description: "GL reports, AR aging, financial statements",
    routes: ["/reporting", "/reports", "/financial-reports"],
    insights: ["Generate GL trial balance or income statement", "Generate AR aging reports", "Analyze financial trends"],
    tools: [
      { name: "generate_gl_report", description: "Generate GL trial balance or income statement", parameters: { reportType: { type: "string", description: "trial_balance or income_statement" }, periodId: { type: "string", description: "Fiscal period ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "generate_ar_aging", description: "Generate AR aging report", parameters: { asOfDate: { type: "string", description: "As-of date (YYYY-MM-DD)" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "lcm",
    module: "Landed Cost Management",
    name: "LCM AI Assistant",
    description: "Landed cost prediction and analysis",
    routes: ["/lcm", "/landed-cost"],
    insights: ["Predict landed costs for shipments", "Analyze cost component breakdowns"],
    tools: [
      { name: "predict_landed_costs", description: "Predict landed costs for a shipment", parameters: { shipmentId: { type: "string", description: "Shipment ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "lease",
    module: "Lease / Real Estate",
    name: "Lease AI Assistant",
    description: "Lease data extraction and management",
    routes: ["/lease", "/real-estate"],
    insights: ["Extract data from lease documents", "Analyze lease portfolio"],
    tools: [
      { name: "extract_lease_data", description: "Extract data from lease document text", parameters: { documentText: { type: "string", description: "Lease document text", required: true } }, action: "/api/nexus-ai/tools/execute" },
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
