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
    quickActions: [
      { label: "Financial Commentary", prompt: "Analyze the current trial balance and provide executive financial commentary on variances and trends.", icon: "FileText" },
      { label: "GL QuickBuilder", prompt: "Help me generate a compliant enterprise Chart of Accounts or Fiscal Calendar standard for my General Ledger.", icon: "Wand2" }
    ]
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
    quickActions: [
      { label: "Analyze Opportunity", prompt: "Conduct a deep-dive analysis of the current opportunity. What are the win probability, key risks, and recommended next steps?", icon: "Target" }
    ]
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
    quickActions: [
      { label: "Draft Job Description", prompt: "Help me draft a comprehensive job description for a Senior Frontend Engineer role.", icon: "FileText" },
      { label: "W-4 Guided Walkthrough", prompt: "I need help completing my 2024 Form W-4. Can you guide me through the worksheets?", icon: "HelpCircle" },
      { label: "Extract Skills", prompt: "Extract key professional skills from this resume or job description text.", icon: "Scissors" }
    ]
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
    quickActions: [
      { label: "Strategic Insights", prompt: "Looking at our construction project portfolio. What are the key strategic risks and schedule anomalies we should address?", icon: "Hammer" }
    ]
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
    quickActions: [
      { label: "Analyze Asset Telemetry", prompt: "Analyze the current telemetry for the selected asset. Are there any anomalies or maintenance risks we should act on?", icon: "Wrench" }
    ]
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
    quickActions: [
      { label: "Optimize Engagement", prompt: "Looking at our marketing engagement metrics. How can we optimize campaign ROI and target high-performing segments?", icon: "Megaphone" }
    ]
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

  // ═══════════════════════════════════════════════
  // NEW MODULE CAPABILITIES — Phase 3 Expansion
  // ═══════════════════════════════════════════════

  {
    id: "inventory",
    module: "Inventory",
    name: "Inventory AI Assistant",
    description: "Stock levels, reorder management, item details",
    routes: ["/inventory", "/warehouse", "/items"],
    insights: ["Check inventory levels and stock-outs", "Create reorder requests for low stock", "Look up item details and pricing"],
    tools: [
      { name: "check_inventory_levels", description: "Check current inventory levels", parameters: { itemId: { type: "string", description: "Item/SKU ID (optional, returns all if empty)" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "reorder_stock", description: "Create a stock reorder request", parameters: { itemId: { type: "string", description: "Item ID", required: true }, quantity: { type: "number", description: "Quantity to reorder" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_item_details", description: "Get item/product details", parameters: { itemId: { type: "string", description: "Item ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "approvals",
    module: "Approvals / Workflow",
    name: "Approval AI Assistant",
    description: "Workflow approvals, approval chain status",
    routes: ["/approvals", "/workflow"],
    insights: ["Approve or reject pending items", "Check approval chain status", "View pending approvals queue"],
    tools: [
      { name: "approve_workflow", description: "Approve a pending workflow item", parameters: { approvalId: { type: "string", description: "Approval ID", required: true }, comments: { type: "string", description: "Approval comments" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_approval_status", description: "Check approval chain status", parameters: { entityId: { type: "string", description: "Entity or approval ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "service",
    module: "Service / Cases",
    name: "Service AI Assistant",
    description: "Support cases, SLA monitoring, knowledge base",
    routes: ["/service", "/cases", "/support", "/help-desk"],
    insights: ["Create and track support cases", "Check SLA compliance", "Search knowledge base for solutions"],
    tools: [
      { name: "create_case", description: "Create a new service case", parameters: { subject: { type: "string", description: "Case subject", required: true }, priority: { type: "string", description: "Priority (low, medium, high, critical)" }, category: { type: "string", description: "Case category" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_case_status", description: "Check service case status", parameters: { caseId: { type: "string", description: "Case ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_sla_compliance", description: "Check SLA compliance metrics", parameters: { period: { type: "string", description: "Period to check" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "search_knowledge_base", description: "Search the knowledge base", parameters: { query: { type: "string", description: "Search query", required: true } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "learning",
    module: "Learning",
    name: "Learning AI Assistant",
    description: "Learning paths, course enrollment, certifications",
    routes: ["/learning", "/training", "/certifications"],
    insights: ["View learning paths and progress", "Enroll in courses", "Check certification and recertification status"],
    tools: [
      { name: "get_learning_path", description: "Get learning path details and progress", parameters: { pathId: { type: "string", description: "Learning path or employee ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "enroll_in_course", description: "Enroll in a learning course", parameters: { courseId: { type: "string", description: "Course ID", required: true }, employeeId: { type: "string", description: "Employee ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_recertification", description: "Check certification/recertification status", parameters: { employeeId: { type: "string", description: "Employee ID" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "partner",
    module: "Partner",
    name: "Partner AI Assistant",
    description: "Partner performance, deal tracking, territory management",
    routes: ["/partners", "/channels"],
    insights: ["View partner performance summaries", "Analyze territory coverage and quotas", "Track partner deals"],
    tools: [
      { name: "get_partner_summary", description: "Get partner program summary", parameters: { partnerId: { type: "string", description: "Partner ID (optional)" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_territory_summary", description: "Get sales territory summary", parameters: { territoryId: { type: "string", description: "Territory ID" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "billing",
    module: "Billing",
    name: "Billing AI Assistant",
    description: "Billing summaries, subscription metrics, MRR tracking",
    routes: ["/billing", "/subscriptions"],
    insights: ["View billing and collection summaries", "Track MRR and subscription metrics", "Analyze churn and revenue trends"],
    tools: [
      { name: "get_billing_summary", description: "Get billing summary for a period", parameters: { period: { type: "string", description: "Billing period" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "compensation",
    module: "Compensation",
    name: "Compensation AI Assistant",
    description: "Salary analysis, compa-ratios, compensation benchmarks",
    routes: ["/compensation", "/total-rewards"],
    insights: ["Analyze compensation by department", "Review compa-ratio and pay equity", "Benchmark salaries against market"],
    tools: [
      { name: "get_compensation_summary", description: "Get compensation summary and analytics", parameters: { tenantId: { type: "string", description: "Tenant ID" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "sourcing",
    module: "Sourcing",
    name: "Sourcing AI Assistant",
    description: "Sourcing events, RFx management, supplier evaluation",
    routes: ["/sourcing", "/rfq", "/rfp"],
    insights: ["Create sourcing events (RFQ/RFP)", "Analyze supplier bids", "Manage sourcing workflows"],
    tools: [
      { name: "create_sourcing_event", description: "Create a new sourcing event", parameters: { title: { type: "string", description: "Event title", required: true }, type: { type: "string", description: "RFQ, RFP, RFI" }, category: { type: "string", description: "Sourcing category" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "documents",
    module: "Documents / OCR",
    name: "Document AI Assistant",
    description: "Document OCR, data extraction, bulk import",
    routes: ["/documents", "/import"],
    insights: ["Extract data from invoices and documents using OCR", "Import data in bulk", "Analyze document quality"],
    tools: [
      { name: "ocr_document", description: "Extract data from a document using OCR", parameters: { documentId: { type: "string", description: "Document ID or URL", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "bulk_import_data", description: "Start a bulk data import job", parameters: { entityType: { type: "string", description: "Entity type to import (e.g., journal_entries)", required: true }, recordCount: { type: "number", description: "Number of records" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "scorecard",
    module: "Balanced Scorecard",
    name: "Scorecard AI Assistant",
    description: "KPI scorecards, performance metrics, strategic alignment",
    routes: ["/scorecard", "/kpi", "/analytics"],
    insights: ["View balanced scorecard metrics", "Analyze KPI trends and targets", "Get cross-module analytics dashboard"],
    tools: [
      { name: "get_scorecard", description: "Get balanced scorecard with KPIs", parameters: { entityId: { type: "string", description: "Entity or scorecard ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_analytics_dashboard", description: "Get analytics dashboard KPIs", parameters: { module: { type: "string", description: "Module filter (or 'all')" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "detect_cost_anomalies", description: "Detect cost anomalies across the organization", parameters: { tenantId: { type: "string", description: "Tenant ID" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "cash_advanced",
    module: "Cash Operations",
    name: "Cash Operations AI Assistant",
    description: "Bank reconciliation, ZBA sweeps, cash revaluation",
    routes: ["/cash-management", "/bank-reconciliation", "/zba"],
    insights: ["Run bank reconciliation", "Execute ZBA sweeps to concentrate cash", "Run foreign currency cash revaluation"],
    tools: [
      { name: "run_bank_reconciliation", description: "Run bank reconciliation for an account", parameters: { accountId: { type: "string", description: "Bank account ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "run_zba_sweep", description: "Execute a Zero Balance Account sweep", parameters: { structureId: { type: "string", description: "ZBA structure ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "run_cash_revaluation", description: "Run cash revaluation for foreign currencies", parameters: { rateDate: { type: "string", description: "Rate date (YYYY-MM-DD)" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "freight",
    module: "Freight Accounting",
    name: "Freight AI Assistant",
    description: "Freight accounting, settlement, cost reconciliation",
    routes: ["/freight", "/freight-accounting"],
    insights: ["View freight cost summaries", "Settle freight invoices against accruals", "Analyze freight cost variances"],
    tools: [
      { name: "get_freight_accounting", description: "Get freight accounting summary", parameters: { shipmentId: { type: "string", description: "Shipment ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "settle_freight", description: "Settle freight invoice against accrual", parameters: { shipmentId: { type: "string", description: "Shipment ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "hr_analytics",
    module: "HR Analytics",
    name: "HR Analytics AI Assistant",
    description: "HR reporting, time optimization, workforce analytics",
    routes: ["/hr-analytics", "/workforce-analytics"],
    insights: ["Generate HR headcount and turnover reports", "Optimize shift and time schedules", "Analyze workforce diversity metrics"],
    tools: [
      { name: "generate_hr_report", description: "Generate an HR analytics report", parameters: { reportType: { type: "string", description: "Report type (headcount, turnover, diversity)" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "optimize_time_schedule", description: "Get AI-optimized time schedule recommendations", parameters: { teamId: { type: "string", description: "Team or manager ID" } }, action: "/api/nexus-ai/tools/execute" },
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

  // ═══════════════════════════════════════════════
  // Phase 4 — Industry & Operational Modules
  // ═══════════════════════════════════════════════

  {
    id: "quality",
    module: "Quality Management",
    name: "Quality AI Assistant",
    description: "Inspections, NCRs, quality metrics, cost of quality",
    routes: ["/quality", "/inspections", "/ncr"],
    insights: ["Create inspection plans for work orders", "Track non-conformance reports", "Analyze cost of quality and first-pass yield"],
    tools: [
      { name: "create_inspection", description: "Create an inspection plan", parameters: { workOrderId: { type: "string", description: "Work order ID" }, type: { type: "string", description: "Inspection type (incoming, in-process, final)" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_ncr_status", description: "Check non-conformance report status", parameters: { ncrId: { type: "string", description: "NCR ID (optional)" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_quality_metrics", description: "Get quality metrics and KPIs", parameters: {}, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "bpm",
    module: "BPM",
    name: "BPM AI Assistant",
    description: "Business processes, workflow instances, bottleneck analysis",
    routes: ["/bpm", "/workflows", "/processes"],
    insights: ["Create business process definitions", "Monitor process instance status", "Identify workflow bottlenecks"],
    tools: [
      { name: "create_process", description: "Create a new business process", parameters: { name: { type: "string", description: "Process name", required: true }, steps: { type: "number", description: "Number of steps" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_process_instances", description: "Get process instance statistics", parameters: { processId: { type: "string", description: "Process ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "analyze_bottlenecks", description: "Analyze bottlenecks in processes", parameters: { processId: { type: "string", description: "Process ID" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "ecommerce",
    module: "Ecommerce / Marketplace",
    name: "Ecommerce AI Assistant",
    description: "Storefront metrics, order fulfillment, marketplace listings",
    routes: ["/ecommerce", "/marketplace", "/storefront"],
    insights: ["View storefront KPIs and conversion rates", "Check order fulfillment status", "Manage marketplace listings"],
    tools: [
      { name: "get_storefront_metrics", description: "Get storefront performance metrics", parameters: { period: { type: "string", description: "Time period" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_order_fulfillment", description: "Check order fulfillment pipeline", parameters: { orderId: { type: "string", description: "Order ID (optional)" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_marketplace_listings", description: "Get marketplace listing summary", parameters: {}, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "wfm",
    module: "Workforce Management",
    name: "WFM AI Assistant",
    description: "Shift scheduling, labor compliance, workforce optimization",
    routes: ["/wfm", "/shifts", "/scheduling"],
    insights: ["View shift schedules and coverage gaps", "Create shifts for teams", "Check labor law compliance"],
    tools: [
      { name: "get_shift_schedule", description: "Get shift schedule for a team", parameters: { teamId: { type: "string", description: "Team ID" }, week: { type: "string", description: "Week (current/next)" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "create_shift", description: "Create a new shift", parameters: { date: { type: "string", description: "Shift date", required: true }, employeeId: { type: "string", description: "Employee ID" }, startTime: { type: "string", description: "Start time" }, endTime: { type: "string", description: "End time" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_labor_compliance", description: "Check labor compliance and violations", parameters: {}, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "customer_portal",
    module: "Customer Portal",
    name: "Customer Portal AI Assistant",
    description: "Portal usage analytics, self-service metrics",
    routes: ["/customer-portal", "/portal"],
    insights: ["View portal engagement metrics", "Analyze self-service adoption and ticket deflection"],
    tools: [
      { name: "get_portal_usage", description: "Get customer portal usage metrics", parameters: {}, action: "/api/nexus-ai/tools/execute" },
      { name: "check_self_service_metrics", description: "Check self-service KPIs", parameters: {}, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "supplier_portal",
    module: "Supplier Portal",
    name: "Supplier Portal AI Assistant",
    description: "Supplier portal status, onboarding tracking",
    routes: ["/supplier-portal"],
    insights: ["View supplier portal engagement", "Track supplier onboarding progress"],
    tools: [
      { name: "get_supplier_portal_status", description: "Get supplier portal status", parameters: {}, action: "/api/nexus-ai/tools/execute" },
      { name: "check_supplier_onboarding", description: "Check supplier onboarding stage", parameters: { supplierId: { type: "string", description: "Supplier ID" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "fleet",
    module: "Fleet Management",
    name: "Fleet AI Assistant",
    description: "Vehicle status, driver tracking, fleet maintenance",
    routes: ["/fleet", "/fleet-management", "/vehicles"],
    insights: ["Check fleet utilization and status", "Schedule vehicle maintenance", "Track driver location and hours"],
    tools: [
      { name: "get_fleet_status", description: "Get fleet status overview", parameters: {}, action: "/api/nexus-ai/tools/execute" },
      { name: "schedule_vehicle_maintenance", description: "Schedule vehicle maintenance", parameters: { vehicleId: { type: "string", description: "Vehicle ID", required: true }, type: { type: "string", description: "Maintenance type" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "track_driver", description: "Track driver location and status", parameters: { driverId: { type: "string", description: "Driver ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "mrp",
    module: "MRP / Capacity Planning",
    name: "MRP AI Assistant",
    description: "Material requirements planning, capacity analysis, production scheduling",
    routes: ["/mrp", "/capacity-planning", "/production-schedule"],
    insights: ["Run MRP to generate planned orders", "Check capacity constraints and overloads", "View production schedule status"],
    tools: [
      { name: "run_mrp", description: "Run material requirements planning", parameters: {}, action: "/api/nexus-ai/tools/execute" },
      { name: "check_capacity_constraints", description: "Check work center capacity", parameters: { workCenterId: { type: "string", description: "Work center ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_production_schedule", description: "Get production schedule overview", parameters: { period: { type: "string", description: "Time period" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "data_governance",
    module: "Data Governance",
    name: "Data Governance AI Assistant",
    description: "Data lineage, governance policies, data profiling",
    routes: ["/data-governance", "/data-quality"],
    insights: ["View data lineage and provenance", "Check governance policy compliance", "Run data profiling and quality scoring"],
    tools: [
      { name: "get_data_lineage", description: "Get data lineage for an entity", parameters: { entityType: { type: "string", description: "Entity type" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_governance_policies", description: "Check governance policy compliance", parameters: {}, action: "/api/nexus-ai/tools/execute" },
      { name: "run_data_profiling", description: "Run data profiling on an entity", parameters: { entityType: { type: "string", description: "Entity type", required: true } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "api_management",
    module: "API Management",
    name: "API Management AI Assistant",
    description: "API usage, rate limits, error monitoring",
    routes: ["/api-management", "/api-gateway", "/api-logs"],
    insights: ["View API usage and top endpoints", "Check rate limit status", "Analyze API errors"],
    tools: [
      { name: "get_api_usage", description: "Get API usage statistics", parameters: { period: { type: "string", description: "Time period" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_api_rate_limits", description: "Check API rate limit status", parameters: {}, action: "/api/nexus-ai/tools/execute" },
      { name: "get_api_errors", description: "Get API error summary", parameters: { period: { type: "string", description: "Time period" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "communication",
    module: "Communication",
    name: "Communication AI Assistant",
    description: "Notifications, message queue, delivery tracking",
    routes: ["/communication", "/notifications", "/email"],
    insights: ["Send notifications across channels", "Monitor message queue status", "Check delivery rates"],
    tools: [
      { name: "send_notification", description: "Send a notification", parameters: { recipient: { type: "string", description: "Recipient", required: true }, subject: { type: "string", description: "Subject" }, channel: { type: "string", description: "Channel (email/sms/push)" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_message_queue", description: "Get message queue status", parameters: {}, action: "/api/nexus-ai/tools/execute" },
      { name: "check_delivery_status", description: "Check message delivery status", parameters: { messageId: { type: "string", description: "Message ID" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "customs",
    module: "Customs / Trade Compliance",
    name: "Customs AI Assistant",
    description: "HS classification, duty rates, export license validation",
    routes: ["/customs", "/trade-compliance"],
    insights: ["Classify products by HS code", "Look up duty rates by destination", "Validate export license requirements"],
    tools: [
      { name: "check_hs_classification", description: "Get HS code classification for a product", parameters: { description: { type: "string", description: "Product description" }, country: { type: "string", description: "Country of origin" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_duty_rates", description: "Get duty rates for an HS code", parameters: { hsCode: { type: "string", description: "HS code", required: true }, destination: { type: "string", description: "Destination country" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "validate_export_license", description: "Validate export license requirements", parameters: { productId: { type: "string", description: "Product ID" }, destination: { type: "string", description: "Destination country" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "clinical",
    module: "Clinical / Pharma",
    name: "Clinical AI Assistant",
    description: "Clinical trials, protocol compliance, clinical supply chain",
    routes: ["/clinical", "/clinical-trials", "/pharma"],
    insights: ["Check clinical trial enrollment and status", "Monitor protocol compliance and deviations", "Track clinical supply distribution"],
    tools: [
      { name: "get_trial_status", description: "Get clinical trial status", parameters: { trialId: { type: "string", description: "Trial ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_protocol_compliance", description: "Check protocol compliance", parameters: { trialId: { type: "string", description: "Trial ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "track_clinical_supply", description: "Track clinical supply chain", parameters: { trialId: { type: "string", description: "Trial ID" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "hospitality",
    module: "Hospitality",
    name: "Hospitality AI Assistant",
    description: "Room availability, occupancy forecasting, reservations",
    routes: ["/hospitality", "/reservations", "/property-management"],
    insights: ["Check room availability by type", "Forecast occupancy and RevPAR", "Create guest reservations"],
    tools: [
      { name: "check_room_availability", description: "Check room availability", parameters: { propertyId: { type: "string", description: "Property ID" }, date: { type: "string", description: "Date" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_occupancy_forecast", description: "Get occupancy forecast", parameters: { propertyId: { type: "string", description: "Property ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "create_reservation", description: "Create a reservation", parameters: { guestName: { type: "string", description: "Guest name", required: true }, checkIn: { type: "string", description: "Check-in date", required: true }, checkOut: { type: "string", description: "Check-out date", required: true }, roomType: { type: "string", description: "Room type" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "healthcare",
    module: "Healthcare",
    name: "Healthcare AI Assistant",
    description: "Patient scheduling, bed management, formulary checks",
    routes: ["/healthcare", "/patient-management", "/emr"],
    insights: ["View patient appointment schedules", "Check bed availability across units", "Verify medication formulary status"],
    tools: [
      { name: "check_patient_schedule", description: "Check patient appointment schedule", parameters: { date: { type: "string", description: "Date" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_bed_availability", description: "Get bed availability", parameters: { facilityId: { type: "string", description: "Facility ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_formulary", description: "Check medication formulary", parameters: { medication: { type: "string", description: "Medication name", required: true } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "education",
    module: "Education",
    name: "Education AI Assistant",
    description: "Enrollment analytics, student progress, transcript generation",
    routes: ["/education", "/enrollment", "/students"],
    insights: ["View enrollment statistics by program", "Track student academic progress", "Generate official transcripts"],
    tools: [
      { name: "get_enrollment_stats", description: "Get enrollment statistics", parameters: { term: { type: "string", description: "Academic term" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_student_progress", description: "Check student progress", parameters: { studentId: { type: "string", description: "Student ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "generate_transcript", description: "Generate a student transcript", parameters: { studentId: { type: "string", description: "Student ID", required: true }, format: { type: "string", description: "Format (official/unofficial)" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "energy",
    module: "Energy / Utilities",
    name: "Energy AI Assistant",
    description: "Grid operations, demand forecasting, outage management",
    routes: ["/energy", "/grid-operations", "/utilities"],
    insights: ["Check grid status and load factors", "Forecast energy demand", "Monitor active outages"],
    tools: [
      { name: "get_grid_status", description: "Get grid status overview", parameters: { region: { type: "string", description: "Region" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "forecast_energy_demand", description: "Forecast energy demand", parameters: { region: { type: "string", description: "Region" }, period: { type: "string", description: "Forecast period" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_outage_status", description: "Check outage status", parameters: {}, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "banking",
    module: "Banking",
    name: "Banking AI Assistant",
    description: "Loan management, credit scoring, deposit analytics",
    routes: ["/banking", "/loans", "/deposits"],
    insights: ["Check loan status and payment schedule", "Run credit scoring for applicants", "View deposit portfolio summary"],
    tools: [
      { name: "check_loan_status", description: "Check loan status", parameters: { loanId: { type: "string", description: "Loan ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "run_credit_scoring", description: "Run credit scoring", parameters: { applicantId: { type: "string", description: "Applicant ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_deposit_summary", description: "Get deposit summary", parameters: {}, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "insurance",
    module: "Insurance",
    name: "Insurance AI Assistant",
    description: "Claims processing, policy management, underwriting",
    routes: ["/insurance", "/claims", "/policies", "/underwriting"],
    insights: ["Check claim status and timeline", "View policy details and endorsements", "Run underwriting risk assessment"],
    tools: [
      { name: "check_claim_status", description: "Check insurance claim status", parameters: { claimId: { type: "string", description: "Claim ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_policy_summary", description: "Get insurance policy summary", parameters: { policyId: { type: "string", description: "Policy ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "run_underwriting_score", description: "Run underwriting risk score", parameters: { applicantId: { type: "string", description: "Applicant ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "retail",
    module: "Retail / POS",
    name: "Retail AI Assistant",
    description: "POS analytics, assortment planning, markdown optimization",
    routes: ["/retail", "/pos", "/assortment"],
    insights: ["View POS transaction summaries", "Check assortment plans", "Forecast optimal markdown timing"],
    tools: [
      { name: "get_pos_summary", description: "Get POS summary", parameters: { storeId: { type: "string", description: "Store ID" }, period: { type: "string", description: "Period" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_assortment_plan", description: "Check assortment plan", parameters: { planId: { type: "string", description: "Plan ID" }, season: { type: "string", description: "Season" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "forecast_markdown", description: "Forecast markdown optimization", parameters: { category: { type: "string", description: "Product category" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "automotive",
    module: "Automotive",
    name: "Automotive AI Assistant",
    description: "Production lines, recalls, dealer inventory",
    routes: ["/automotive", "/production-lines", "/dealers"],
    insights: ["Check production line efficiency", "Track recall completion rates", "Analyze dealer inventory levels"],
    tools: [
      { name: "get_production_line_status", description: "Get production line status", parameters: { lineId: { type: "string", description: "Line ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_recall_status", description: "Check recall status", parameters: { recallId: { type: "string", description: "Recall ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_dealer_inventory", description: "Get dealer inventory", parameters: { dealerId: { type: "string", description: "Dealer ID" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "government",
    module: "Government",
    name: "Government AI Assistant",
    description: "Permits, grants, budget management",
    routes: ["/government", "/permits", "/grants"],
    insights: ["Track permit application status", "View grant funding summaries", "Check department budget utilization"],
    tools: [
      { name: "track_permit_status", description: "Track permit application status", parameters: { permitId: { type: "string", description: "Permit ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_grant_summary", description: "Get grant program summary", parameters: { programId: { type: "string", description: "Program ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_government_budget", description: "Check government budget status", parameters: { departmentId: { type: "string", description: "Department ID" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "telecom",
    module: "Telecom",
    name: "Telecom AI Assistant",
    description: "Subscriber management, network KPIs, service provisioning",
    routes: ["/telecom", "/subscribers", "/network"],
    insights: ["Check subscriber account status", "View network performance KPIs", "Provision new services"],
    tools: [
      { name: "check_subscriber_status", description: "Check subscriber status", parameters: { subscriberId: { type: "string", description: "Subscriber ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_network_kpis", description: "Get network performance KPIs", parameters: { region: { type: "string", description: "Region" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "provision_service", description: "Provision a new service", parameters: { subscriberId: { type: "string", description: "Subscriber ID", required: true }, serviceType: { type: "string", description: "Service type" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "fnb_cpg",
    module: "Food & Beverage / CPG",
    name: "F&B / CPG AI Assistant",
    description: "Recipe compliance, batch traceability, CPG demand forecasting",
    routes: ["/food-beverage", "/cpg", "/formulation", "/batch"],
    insights: ["Check recipe compliance and allergens", "Trace batch ingredients and distribution", "Forecast CPG demand with seasonal factors"],
    tools: [
      { name: "check_recipe_compliance", description: "Check recipe regulatory compliance", parameters: { recipeId: { type: "string", description: "Recipe ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_batch_trace", description: "Get batch traceability", parameters: { batchId: { type: "string", description: "Batch ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "forecast_cpg_demand", description: "Forecast CPG demand", parameters: { productId: { type: "string", description: "Product ID" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },

  // ═══════════════════════════════════════════════
  // Phase 5 — Remaining Modules
  // ═══════════════════════════════════════════════

  {
    id: "costing",
    module: "Costing / Profitability",
    name: "Costing AI Assistant",
    description: "Cost analysis, profitability reports, margin breakdowns",
    routes: ["/cost-management", "/costing", "/profitability"],
    insights: ["Analyze costs by product or segment", "Run profitability reports", "Break down margins and variances"],
    tools: [
      { name: "get_cost_analysis", description: "Get cost analysis for an entity", parameters: { entityId: { type: "string", description: "Entity ID" }, period: { type: "string", description: "Period" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "run_profitability_report", description: "Run a profitability report", parameters: { segment: { type: "string", description: "Business segment" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_margin_breakdown", description: "Get detailed margin breakdown", parameters: { productId: { type: "string", description: "Product ID" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "compliance_advanced",
    module: "Compliance",
    name: "Compliance AI Assistant",
    description: "Regulatory compliance, findings management, exception tracking",
    routes: ["/compliance", "/compliance-dashboard", "/compliance-reports"],
    insights: ["View compliance dashboard and scores", "Check regulatory status", "Create compliance exceptions"],
    tools: [
      { name: "get_compliance_dashboard", description: "Get compliance dashboard overview", parameters: {}, action: "/api/nexus-ai/tools/execute" },
      { name: "check_regulatory_status", description: "Check regulatory compliance status", parameters: { regulation: { type: "string", description: "Regulation name (e.g., SOX, GDPR)" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "create_compliance_exception", description: "Create a compliance exception request", parameters: { type: { type: "string", description: "Exception type" }, requestedBy: { type: "string", description: "Requestor" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "community",
    module: "Community / Forum",
    name: "Community AI Assistant",
    description: "Community metrics, forum management, contributor insights",
    routes: ["/community", "/forum"],
    insights: ["View community engagement metrics", "Create forum posts", "Identify top contributors"],
    tools: [
      { name: "get_community_metrics", description: "Get community engagement metrics", parameters: {}, action: "/api/nexus-ai/tools/execute" },
      { name: "create_forum_post", description: "Create a new forum post", parameters: { title: { type: "string", description: "Post title", required: true }, category: { type: "string", description: "Category" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "content_management",
    module: "Content Management",
    name: "Content AI Assistant",
    description: "Content library, publishing, analytics",
    routes: ["/content", "/cms", "/content-management"],
    insights: ["Browse content library", "Publish content to channels", "Analyze content performance"],
    tools: [
      { name: "get_content_library", description: "Get content library summary", parameters: {}, action: "/api/nexus-ai/tools/execute" },
      { name: "publish_content", description: "Publish content", parameters: { title: { type: "string", description: "Content title", required: true }, channel: { type: "string", description: "Channel" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_content_analytics", description: "Get content performance analytics", parameters: { period: { type: "string", description: "Period" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "customer_success",
    module: "Customer Success",
    name: "Customer Success AI Assistant",
    description: "Health scores, churn prediction, NPS tracking",
    routes: ["/customer-success", "/churn", "/nps"],
    insights: ["View customer health scores", "Predict churn risk", "Analyze NPS trends"],
    tools: [
      { name: "get_customer_health_score", description: "Get customer health score", parameters: { customerId: { type: "string", description: "Customer ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "predict_churn", description: "Predict customer churn", parameters: { segment: { type: "string", description: "Customer segment" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_nps_summary", description: "Get NPS summary", parameters: { period: { type: "string", description: "Period" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "loyalty",
    module: "Loyalty Programs",
    name: "Loyalty AI Assistant",
    description: "Loyalty programs, rewards balance, point management",
    routes: ["/loyalty", "/rewards", "/customer-loyalty"],
    insights: ["View loyalty program metrics", "Check member rewards balance", "Issue loyalty points"],
    tools: [
      { name: "get_loyalty_summary", description: "Get loyalty program summary", parameters: { programId: { type: "string", description: "Program ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_rewards_balance", description: "Check member rewards balance", parameters: { memberId: { type: "string", description: "Member ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "issue_loyalty_points", description: "Issue loyalty points", parameters: { memberId: { type: "string", description: "Member ID", required: true }, points: { type: "number", description: "Points to issue" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "engagement",
    module: "Employee Engagement",
    name: "Engagement AI Assistant",
    description: "Engagement scores, pulse surveys, survey results",
    routes: ["/engagement", "/surveys", "/employee-engagement"],
    insights: ["View employee engagement scores", "Create pulse surveys", "Analyze survey results"],
    tools: [
      { name: "get_engagement_score", description: "Get engagement score", parameters: {}, action: "/api/nexus-ai/tools/execute" },
      { name: "create_pulse_survey", description: "Create a pulse survey", parameters: { title: { type: "string", description: "Survey title" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_survey_results", description: "Get survey results", parameters: { surveyId: { type: "string", description: "Survey ID" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "integration_hub",
    module: "Integration Hub",
    name: "Integration AI Assistant",
    description: "Integration status, connector health, sync management",
    routes: ["/integrations", "/integration-hub", "/connectors"],
    insights: ["View integration status across all connectors", "Check connector health and latency", "Trigger manual sync"],
    tools: [
      { name: "get_integration_status", description: "Get integration status", parameters: {}, action: "/api/nexus-ai/tools/execute" },
      { name: "check_connector_health", description: "Check connector health", parameters: { connectorId: { type: "string", description: "Connector ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "trigger_sync", description: "Trigger a manual sync", parameters: { connectorId: { type: "string", description: "Connector ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "pim",
    module: "Product Information Management",
    name: "PIM AI Assistant",
    description: "Product catalog, data enrichment, completeness scoring",
    routes: ["/pim", "/product-catalog", "/products"],
    insights: ["Browse product catalog", "Enrich product data with AI", "Check product data completeness"],
    tools: [
      { name: "get_product_catalog", description: "Get product catalog summary", parameters: {}, action: "/api/nexus-ai/tools/execute" },
      { name: "enrich_product_data", description: "AI-enrich product data", parameters: { productId: { type: "string", description: "Product ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_product_completeness", description: "Check product data completeness", parameters: { productId: { type: "string", description: "Product ID" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "risk",
    module: "Risk Management",
    name: "Risk AI Assistant",
    description: "Risk register, assessments, mitigation plans",
    routes: ["/risk", "/risk-management"],
    insights: ["View enterprise risk register", "Assess risk severity and likelihood", "Create risk mitigation plans"],
    tools: [
      { name: "get_risk_register", description: "Get enterprise risk register", parameters: {}, action: "/api/nexus-ai/tools/execute" },
      { name: "assess_risk", description: "Assess a specific risk", parameters: { riskId: { type: "string", description: "Risk ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "create_risk_mitigation", description: "Create a risk mitigation plan", parameters: { riskId: { type: "string", description: "Risk ID", required: true }, action: { type: "string", description: "Mitigation action" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "security",
    module: "Security / Access Control",
    name: "Security AI Assistant",
    description: "Security overview, access violations, permission auditing",
    routes: ["/security", "/access-control", "/admin/security"],
    insights: ["View security posture overview", "Check for access violations", "Audit user permissions"],
    tools: [
      { name: "get_security_overview", description: "Get security overview", parameters: {}, action: "/api/nexus-ai/tools/execute" },
      { name: "check_access_violations", description: "Check for access violations", parameters: { period: { type: "string", description: "Period" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "audit_user_permissions", description: "Audit user permissions", parameters: { userId: { type: "string", description: "User ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "system_admin",
    module: "System Admin",
    name: "System Admin AI Assistant",
    description: "System health, job queues, usage metrics",
    routes: ["/admin", "/system", "/admin-console"],
    insights: ["Check system health and uptime", "Monitor job queue status", "View platform usage metrics"],
    tools: [
      { name: "get_system_health", description: "Get system health status", parameters: {}, action: "/api/nexus-ai/tools/execute" },
      { name: "check_job_queue", description: "Check job queue status", parameters: {}, action: "/api/nexus-ai/tools/execute" },
      { name: "get_usage_metrics", description: "Get platform usage metrics", parameters: { period: { type: "string", description: "Period" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "warehouse",
    module: "Warehouse Operations",
    name: "Warehouse AI Assistant",
    description: "Warehouse utilization, goods receipt, cycle counting",
    routes: ["/warehouse", "/goods-receipt", "/putaway", "/cycle-count"],
    insights: ["Check warehouse utilization and capacity", "Process goods receipts", "Run cycle counts"],
    tools: [
      { name: "get_warehouse_utilization", description: "Get warehouse utilization", parameters: { warehouseId: { type: "string", description: "Warehouse ID" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "process_goods_receipt", description: "Process a goods receipt", parameters: { poNumber: { type: "string", description: "PO number", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "run_cycle_count", description: "Run a cycle count", parameters: { zone: { type: "string", description: "Warehouse zone" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "hse",
    module: "HSE / Safety",
    name: "HSE AI Assistant",
    description: "Safety incidents, HSE compliance, safety reporting",
    routes: ["/hse", "/safety", "/hse-safety"],
    insights: ["View safety incident statistics", "Create safety reports", "Check HSE compliance status"],
    tools: [
      { name: "get_safety_incidents", description: "Get safety incident summary", parameters: { period: { type: "string", description: "Period" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "create_safety_report", description: "Create a safety report", parameters: { type: { type: "string", description: "Report type (incident, near_miss)" }, severity: { type: "string", description: "Severity" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "check_hse_compliance", description: "Check HSE compliance", parameters: {}, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "demand_forecast",
    module: "Demand Forecasting",
    name: "Demand Forecasting AI Assistant",
    description: "AI-powered demand forecasting and accuracy tracking",
    routes: ["/demand-forecasting", "/forecast"],
    insights: ["Run AI-powered demand forecasts", "Check forecast accuracy metrics", "Analyze seasonal patterns"],
    tools: [
      { name: "run_demand_forecast", description: "Run a demand forecast", parameters: { productId: { type: "string", description: "Product ID" }, method: { type: "string", description: "Method (ml_ensemble, arima, etc.)" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_forecast_accuracy", description: "Get forecast accuracy metrics", parameters: { period: { type: "string", description: "Period" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "translation",
    module: "Translation / Localization",
    name: "Translation AI Assistant",
    description: "Translation status, localization requests, language coverage",
    routes: ["/translation", "/localization", "/i18n"],
    insights: ["View translation progress by language", "Request new translations", "Check localization coverage"],
    tools: [
      { name: "get_translation_status", description: "Get translation status", parameters: {}, action: "/api/nexus-ai/tools/execute" },
      { name: "request_translation", description: "Request a translation", parameters: { targetLanguage: { type: "string", description: "Target language", required: true }, stringCount: { type: "number", description: "Number of strings" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "competitive_intel",
    module: "Competitive Intelligence",
    name: "Competitive Intel AI Assistant",
    description: "Competitor analysis, market positioning, win/loss tracking",
    routes: ["/competitive", "/competitor-analysis", "/market-intelligence"],
    insights: ["Analyze competitor strengths and weaknesses", "View market positioning", "Track win/loss rates"],
    tools: [
      { name: "get_competitor_analysis", description: "Get competitor analysis", parameters: { competitor: { type: "string", description: "Competitor name" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_market_positioning", description: "Get market positioning", parameters: { segment: { type: "string", description: "Market segment" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "sustainability",
    module: "Sustainability / ESG",
    name: "Sustainability AI Assistant",
    description: "ESG metrics, carbon footprint, sustainability goals",
    routes: ["/sustainability", "/esg", "/carbon"],
    insights: ["View ESG metrics and scores", "Calculate carbon footprint", "Set sustainability goals"],
    tools: [
      { name: "get_esg_metrics", description: "Get ESG metrics", parameters: { period: { type: "string", description: "Period" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "get_carbon_footprint", description: "Get carbon footprint", parameters: { period: { type: "string", description: "Period" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "create_sustainability_goal", description: "Create a sustainability goal", parameters: { title: { type: "string", description: "Goal title", required: true }, target: { type: "string", description: "Target" } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "cognitive",
    module: "Cognitive Services",
    name: "Cognitive AI Assistant",
    description: "Sentiment analysis, document classification, entity extraction",
    routes: ["/cognitive", "/cognitive-services", "/ai-services"],
    insights: ["Analyze text sentiment", "Classify documents automatically", "Extract entities from text"],
    tools: [
      { name: "analyze_sentiment", description: "Analyze text sentiment", parameters: { text: { type: "string", description: "Text to analyze", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "classify_document", description: "Classify a document", parameters: { documentId: { type: "string", description: "Document ID", required: true } }, action: "/api/nexus-ai/tools/execute" },
      { name: "extract_entities", description: "Extract entities from text", parameters: { text: { type: "string", description: "Text to analyze", required: true } }, action: "/api/nexus-ai/tools/execute" },
    ],
  },
  {
    id: "geolocation",
    module: "Geolocation",
    name: "Geolocation AI Assistant",
    description: "Location analytics, geocoding, spatial intelligence",
    routes: ["/geolocation", "/maps", "/locations"],
    insights: ["View location-based analytics", "Geocode addresses", "Analyze spatial coverage"],
    tools: [
      { name: "get_location_analytics", description: "Get location analytics", parameters: { region: { type: "string", description: "Region" } }, action: "/api/nexus-ai/tools/execute" },
      { name: "geocode_address", description: "Geocode an address", parameters: { address: { type: "string", description: "Address to geocode", required: true } }, action: "/api/nexus-ai/tools/execute" },
    ],
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
