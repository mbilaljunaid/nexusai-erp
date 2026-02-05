import {
  Users, DollarSign, Briefcase, Factory, Package, BarChart3, Shield,
  ShoppingCart, Truck, Brain, Workflow,
  ClipboardList, TrendingUp, Lock, GitBranch, LucideIcon
} from "lucide-react";

export interface FeatureDetail {
  slug: string;
  name: string;
  description: string;
  module: string;
  moduleId: string;
  color: string;
  icon: LucideIcon;
  longDescription: string;
  capabilities: string[];
  benefits: string[];
  useCases: string[];
  relatedFeatures: string[];
}

interface ModuleInfo {
  name: string;
  icon: LucideIcon;
  color: string;
}

const moduleMap: Record<string, ModuleInfo> = {
  crm: { name: "CRM & Sales", icon: Users, color: "bg-blue-500" },
  finance: { name: "Finance & Accounting", icon: DollarSign, color: "bg-green-500" },
  hr: { name: "Human Resources & Payroll", icon: Briefcase, color: "bg-purple-500" },
  manufacturing: { name: "Manufacturing & Production", icon: Factory, color: "bg-orange-500" },
  "supply-chain": { name: "Supply Chain & Logistics", icon: Truck, color: "bg-cyan-500" },
  projects: { name: "Project Management", icon: ClipboardList, color: "bg-indigo-500" },
  service: { name: "Service & Support", icon: Package, color: "bg-pink-500" },
  analytics: { name: "Analytics & BI", icon: BarChart3, color: "bg-amber-500" },
  ai: { name: "AI & Automation", icon: Brain, color: "bg-violet-500" },
  workflow: { name: "Workflow & Automation", icon: Workflow, color: "bg-teal-500" },
  integration: { name: "Integration & API", icon: GitBranch, color: "bg-slate-500" },
  admin: { name: "Administration & Security", icon: Shield, color: "bg-red-500" },
  marketing: { name: "Marketing & Campaigns", icon: TrendingUp, color: "bg-rose-500" },
  ecommerce: { name: "E-Commerce & Retail", icon: ShoppingCart, color: "bg-emerald-500" },
  compliance: { name: "Compliance & Governance", icon: Lock, color: "bg-yellow-600" },
};

function createFeature(
  slug: string,
  name: string,
  description: string,
  moduleId: string,
  longDescription: string,
  capabilities: string[],
  benefits: string[],
  useCases: string[],
  relatedFeatures: string[]
): FeatureDetail {
  const moduleInfo = moduleMap[moduleId] || moduleMap.crm;
  return {
    slug,
    name,
    description,
    module: moduleInfo.name,
    moduleId,
    color: moduleInfo.color,
    icon: moduleInfo.icon,
    longDescription,
    capabilities,
    benefits,
    useCases,
    relatedFeatures,
  };
}

export const featureRegistry: Record<string, FeatureDetail> = {
  "lead-scoring": createFeature(
    "lead-scoring",
    "Lead Management",
    "Capture, score, and nurture leads through the sales funnel",
    "crm",
    "Comprehensive lead management system that helps sales teams capture, qualify, and nurture leads through the entire sales funnel. Use AI-powered scoring to prioritize the most promising opportunities and automate follow-up sequences.",
    ["AI-powered lead scoring", "Lead capture forms", "Automated lead assignment", "Lead nurturing workflows", "Source tracking", "Duplicate detection", "Lead qualification criteria", "Conversion tracking"],
    ["Increase conversion rates by 35%", "Reduce lead response time", "Prioritize high-value opportunities", "Automate repetitive tasks", "Improve sales team productivity"],
    ["B2B enterprise sales", "E-commerce lead generation", "Event-based lead capture", "Marketing campaign tracking", "Partner referral management"],
    ["opportunities", "predictive-lead-scoring", "campaigns-dashboard", "crm-copilot"]
  ),
  "opportunities": createFeature(
    "opportunities",
    "Opportunity Pipeline",
    "Visual pipeline management with stage tracking",
    "crm",
    "Visualize and manage your entire sales pipeline with customizable stages, probability scoring, and forecasting. Track deals from initial contact through close with full visibility into every opportunity.",
    ["Drag-and-drop pipeline view", "Custom sales stages", "Probability scoring", "Revenue forecasting", "Activity tracking", "Multi-currency support", "Win/loss analysis", "Deal collaboration"],
    ["Improve forecast accuracy", "Shorten sales cycles", "Increase win rates", "Better team visibility", "Data-driven decisions"],
    ["Enterprise sales tracking", "Territory management", "Partner deal registration", "Upsell opportunities", "Renewal management"],
    ["lead-scoring", "quote-builder", "sales-analytics", "account-directory"]
  ),
  "account-directory": createFeature(
    "account-directory",
    "Account Management",
    "360-degree view of customer accounts and hierarchies",
    "crm",
    "Get a complete 360-degree view of every customer account including hierarchies, relationships, contacts, activities, and transaction history. Manage complex account structures with parent-child relationships.",
    ["Account hierarchy management", "360-degree customer view", "Relationship mapping", "Account health scoring", "Territory assignment", "Custom fields", "Document storage", "Activity history"],
    ["Improve customer retention", "Identify upsell opportunities", "Streamline account planning", "Better customer insights", "Reduce churn"],
    ["Enterprise account management", "Partner relationship management", "Customer success tracking", "Key account planning", "Account-based marketing"],
    ["contact-directory", "opportunities", "activity-timeline", "customer-journey-map"]
  ),
  "contact-directory": createFeature(
    "contact-directory",
    "Contact Directory",
    "Centralized contact database with relationship mapping",
    "crm",
    "Maintain a centralized database of all business contacts with rich profiles, relationship mapping, and interaction history. Track roles, influence, and decision-making authority within target accounts.",
    ["Contact profiles", "Relationship mapping", "Role tracking", "Email integration", "Phone integration", "Social profiles", "Contact enrichment", "Duplicate management"],
    ["Never lose contact information", "Understand buying committees", "Personalize outreach", "Improve email deliverability", "Track engagement"],
    ["Sales prospecting", "Account-based selling", "Customer support", "Partner management", "Event networking"],
    ["account-directory", "activity-timeline", "email", "customer-profiles"]
  ),
  "activity-timeline": createFeature(
    "activity-timeline",
    "Activity Timeline",
    "Complete history of customer interactions",
    "crm",
    "View a complete chronological history of every customer interaction including calls, emails, meetings, notes, and system events. Never miss important context before customer conversations.",
    ["Chronological activity feed", "Email tracking", "Call logging", "Meeting notes", "Task tracking", "Automated logging", "Activity filtering", "Team collaboration"],
    ["Full customer context", "Improved handoffs", "Better meeting prep", "Accountability tracking", "Audit trail"],
    ["Sales follow-up", "Customer service", "Account reviews", "Onboarding tracking", "Renewal conversations"],
    ["account-directory", "contact-directory", "crm-copilot", "email"]
  ),
  "quote-builder": createFeature(
    "quote-builder",
    "Quote Builder",
    "Professional quote generation with approval workflows",
    "crm",
    "Create professional, branded quotes with dynamic pricing, product configurations, and built-in approval workflows. Generate PDF quotes and track customer engagement with electronic signatures.",
    ["Professional templates", "Dynamic pricing", "Product configuration", "Approval workflows", "E-signature", "Quote tracking", "Version control", "Multi-currency"],
    ["Faster quote turnaround", "Consistent pricing", "Reduced errors", "Improved professionalism", "Faster approvals"],
    ["B2B sales proposals", "Complex configurations", "Multi-line quotes", "Discount approvals", "Contract renewals"],
    ["opportunities", "pricing-promo-engine", "approval-workflow", "invoice-generator"]
  ),
  "sales-analytics": createFeature(
    "sales-analytics",
    "Sales Analytics",
    "Revenue forecasting and performance dashboards",
    "crm",
    "Gain deep insights into sales performance with comprehensive analytics dashboards. Track revenue, pipeline health, team performance, and forecast accuracy with interactive visualizations.",
    ["Revenue dashboards", "Pipeline analytics", "Team leaderboards", "Forecast accuracy", "Win/loss analysis", "Activity metrics", "Trend analysis", "Custom reports"],
    ["Data-driven decisions", "Accurate forecasting", "Performance visibility", "Goal tracking", "Identify bottlenecks"],
    ["Sales management", "Revenue operations", "Board reporting", "Territory analysis", "Rep coaching"],
    ["opportunities", "revenue-forecasting", "dashboard-builder", "report-builder"]
  ),
  "customer-journey-map": createFeature(
    "customer-journey-map",
    "Customer Journey Mapping",
    "Visualize and optimize customer experience",
    "crm",
    "Map and visualize the complete customer journey from first touch through advocacy. Identify touchpoints, pain points, and opportunities to improve the customer experience.",
    ["Journey visualization", "Touchpoint mapping", "Pain point identification", "Experience scoring", "Persona management", "Journey templates", "Optimization insights", "Cross-channel tracking"],
    ["Improved customer experience", "Higher retention", "Better personalization", "Identify friction points", "Increase lifetime value"],
    ["Customer experience optimization", "Onboarding improvement", "Churn prevention", "Product adoption", "Service enhancement"],
    ["activity-timeline", "churn-risk-analysis", "customer-portal", "loyalty-programs"]
  ),
  "predictive-lead-scoring": createFeature(
    "predictive-lead-scoring",
    "Predictive Lead Scoring",
    "AI-powered lead prioritization",
    "crm",
    "Leverage machine learning to automatically score and prioritize leads based on historical conversion patterns. Focus your sales team on the opportunities most likely to close.",
    ["ML-based scoring", "Behavioral signals", "Demographic analysis", "Intent data integration", "Score explanations", "Model training", "A/B testing", "Real-time updates"],
    ["Higher conversion rates", "Reduced wasted effort", "Faster sales cycles", "Better resource allocation", "Improved ROI"],
    ["Inbound lead prioritization", "Marketing qualified leads", "Sales development", "Account-based marketing", "Lead routing"],
    ["lead-scoring", "copilot", "recommendation-engine", "sales-analytics"]
  ),
  "crm-copilot": createFeature(
    "crm-copilot",
    "CRM Copilot",
    "AI assistant for sales insights",
    "crm",
    "Your AI-powered sales assistant that provides real-time insights, suggests next best actions, and automates routine tasks. Get instant answers about accounts, opportunities, and sales performance.",
    ["Natural language queries", "Next best actions", "Meeting preparation", "Email drafting", "Data entry automation", "Insights generation", "Anomaly detection", "Coaching suggestions"],
    ["Save hours on admin work", "Never miss follow-ups", "Better meeting outcomes", "Faster data entry", "Proactive insights"],
    ["Sales productivity", "Account research", "Email composition", "Meeting prep", "Pipeline analysis"],
    ["copilot", "activity-timeline", "opportunities", "lead-scoring"]
  ),
  "campaigns-dashboard": createFeature(
    "campaigns-dashboard",
    "Campaigns Dashboard",
    "Marketing campaign management and tracking",
    "crm",
    "Plan, execute, and measure marketing campaigns with full visibility into performance metrics. Track lead generation, engagement, and ROI across all marketing channels.",
    ["Campaign planning", "Multi-channel execution", "Lead attribution", "ROI tracking", "A/B testing", "Campaign calendar", "Budget tracking", "Performance analytics"],
    ["Better marketing ROI", "Improved attribution", "Faster campaign execution", "Data-driven optimization", "Budget efficiency"],
    ["Demand generation", "Product launches", "Event marketing", "Email campaigns", "ABM programs"],
    ["marketing-campaigns", "lead-scoring", "email", "marketing-engagement"]
  ),
  "loyalty-programs": createFeature(
    "loyalty-programs",
    "Customer Loyalty Programs",
    "Points, rewards, and retention programs",
    "crm",
    "Design and manage customer loyalty programs with points, tiers, rewards, and exclusive benefits. Increase customer retention and lifetime value through personalized loyalty experiences.",
    ["Points management", "Tier systems", "Reward catalogs", "Member portals", "Referral programs", "Birthday rewards", "Exclusive offers", "Program analytics"],
    ["Increase retention", "Higher lifetime value", "More referrals", "Better engagement", "Competitive advantage"],
    ["Retail loyalty", "B2B rewards", "Subscription perks", "Partner programs", "VIP experiences"],
    ["customer-journey-map", "customer-portal", "pricing-promotions", "customer-profiles"]
  ),
  "competitor-analysis": createFeature(
    "competitor-analysis",
    "Competitor Analysis",
    "Track and analyze competitor activity",
    "crm",
    "Monitor and analyze competitor activities, positioning, and market movements. Gain competitive intelligence to inform sales strategies and win more deals.",
    ["Competitor profiles", "Win/loss tracking", "Battlecards", "Market positioning", "Price comparison", "Feature comparison", "News monitoring", "SWOT analysis"],
    ["Win more competitive deals", "Better positioning", "Informed pricing", "Strategic insights", "Faster responses"],
    ["Competitive intelligence", "Sales enablement", "Product strategy", "Market research", "Pricing strategy"],
    ["opportunities", "sales-analytics", "predictive-lead-scoring", "quote-builder"]
  ),

  "general-ledger": createFeature(
    "general-ledger",
    "General Ledger",
    "Complete chart of accounts and journal management",
    "finance",
    "The foundation of your financial system with comprehensive chart of accounts, journal entry management, and real-time balance tracking. Support for multiple entities, currencies, and accounting standards.",
    ["Chart of accounts", "Journal entries", "Account hierarchies", "Multi-currency", "Multi-entity", "Period management", "Recurring entries", "Account reconciliation"],
    ["Single source of truth", "Accurate financials", "Audit readiness", "Regulatory compliance", "Real-time visibility"],
    ["Month-end close", "Financial reporting", "Audit preparation", "Multi-entity accounting", "Currency management"],
    ["journal-entries", "financial-reports", "chart-of-accounts", "financial-consolidation"]
  ),
  "ap-invoices": createFeature(
    "ap-invoices",
    "Accounts Payable",
    "Vendor invoices, payments, and aging reports",
    "finance",
    "Streamline vendor invoice processing with automated matching, approval workflows, and payment scheduling. Maintain strong vendor relationships while optimizing cash flow.",
    ["Invoice capture", "3-way matching", "Approval workflows", "Payment scheduling", "Vendor portal", "Aging reports", "Duplicate detection", "Early payment discounts"],
    ["Faster invoice processing", "Reduce manual errors", "Capture early pay discounts", "Better vendor relationships", "Cash flow optimization"],
    ["Invoice processing", "Payment management", "Vendor management", "Expense control", "Cash management"],
    ["vendor-management", "payment-scheduling", "aging-report", "bank-reconciliation"]
  ),
  "ar-invoices": createFeature(
    "ar-invoices",
    "Accounts Receivable",
    "Customer invoicing and collections",
    "finance",
    "Manage customer invoicing, credit, and collections with automated billing, payment reminders, and aging analysis. Improve cash flow with streamlined collection processes.",
    ["Invoice generation", "Payment tracking", "Credit management", "Dunning workflows", "Customer portal", "Aging analysis", "Write-offs", "Payment plans"],
    ["Faster collections", "Reduced DSO", "Fewer bad debts", "Improved cash flow", "Better customer experience"],
    ["Customer billing", "Collections", "Credit management", "Subscription billing", "Revenue recognition"],
    ["invoice-generator", "aging-report", "credit-management-collections", "customer-portal"]
  ),
  "invoice-generator": createFeature(
    "invoice-generator",
    "Invoice Generator",
    "Professional invoice creation and delivery",
    "finance",
    "Create professional, branded invoices with customizable templates, automatic tax calculations, and multiple delivery options. Track invoice status and payment in real-time.",
    ["Custom templates", "Auto tax calculation", "Multi-currency", "Email delivery", "PDF generation", "Payment links", "Recurring invoices", "Invoice tracking"],
    ["Professional branding", "Faster payments", "Reduced errors", "Time savings", "Better tracking"],
    ["Customer billing", "Service invoicing", "Recurring billing", "One-time charges", "Credit memos"],
    ["ar-invoices", "quote-builder", "sales-order-management", "payment-flow"]
  ),
  "bank-reconciliation": createFeature(
    "bank-reconciliation",
    "Bank Reconciliation",
    "Automated bank statement matching",
    "finance",
    "Automate bank reconciliation with intelligent transaction matching, exception handling, and real-time cash visibility. Reduce month-end close time significantly.",
    ["Auto-matching", "Rule-based matching", "Exception handling", "Multi-bank support", "Real-time sync", "Reconciliation reports", "Audit trail", "Cash visibility"],
    ["Faster month-end close", "Fewer errors", "Real-time cash position", "Reduced manual work", "Better controls"],
    ["Daily reconciliation", "Month-end close", "Cash management", "Fraud detection", "Audit preparation"],
    ["cash-management", "general-ledger", "payment-scheduling", "financial-reports"]
  ),
  "cash-management": createFeature(
    "cash-management",
    "Cash Management",
    "Cash flow forecasting and optimization",
    "finance",
    "Optimize cash positions with real-time visibility, forecasting, and intercompany cash management. Make informed decisions about investments, borrowing, and payments.",
    ["Cash forecasting", "Cash pooling", "Bank connectivity", "Liquidity management", "Investment tracking", "Borrowing management", "Intercompany transfers", "Cash reporting"],
    ["Optimize cash usage", "Better investment returns", "Reduced borrowing costs", "Improved visibility", "Informed decisions"],
    ["Treasury management", "Cash forecasting", "Working capital", "Investment management", "Debt management"],
    ["bank-reconciliation", "payment-scheduling", "financial-reports", "budgeting-dashboard"]
  ),
  "tax-management": createFeature(
    "tax-management",
    "Tax Management",
    "Multi-jurisdiction tax calculation and reporting",
    "finance",
    "Handle complex tax requirements with multi-jurisdiction support, automatic tax calculations, and regulatory reporting. Stay compliant with changing tax regulations worldwide.",
    ["Tax calculation engine", "Multi-jurisdiction", "Tax reporting", "VAT/GST handling", "Withholding tax", "Tax filing", "Audit support", "Rate updates"],
    ["Tax compliance", "Accurate calculations", "Reduced audit risk", "Time savings", "Global support"],
    ["Sales tax", "VAT compliance", "Tax reporting", "International trade", "Tax planning"],
    ["general-ledger", "ap-invoices", "ar-invoices", "compliance-monitoring"]
  ),
  "financial-reports": createFeature(
    "financial-reports",
    "Financial Reports",
    "Balance sheet, P&L, and custom reports",
    "finance",
    "Generate comprehensive financial statements and custom reports with drill-down capabilities. Support for multiple reporting standards and comparative analysis.",
    ["Balance sheet", "Income statement", "Cash flow statement", "Custom reports", "Drill-down", "Comparative analysis", "GAAP/IFRS support", "Export options"],
    ["Accurate reporting", "Board-ready statements", "Faster close", "Better insights", "Regulatory compliance"],
    ["Financial reporting", "Board presentations", "Audit preparation", "Management reporting", "Investor relations"],
    ["general-ledger", "dashboard-builder", "report-builder", "financial-consolidation"]
  ),
  "budgeting-dashboard": createFeature(
    "budgeting-dashboard",
    "Budget Planning",
    "Annual budgeting and variance analysis",
    "finance",
    "Create, manage, and track budgets with collaborative planning tools, scenario modeling, and variance analysis. Align financial plans with strategic objectives.",
    ["Budget creation", "Variance analysis", "Scenario planning", "Collaborative input", "Budget versions", "Rolling forecasts", "Department budgets", "Approval workflows"],
    ["Better financial planning", "Spending control", "Accountability", "Faster budgeting", "Aligned goals"],
    ["Annual budgeting", "Department planning", "Project budgets", "Capital planning", "Headcount planning"],
    ["financial-reports", "expense-tracking", "cash-management", "revenue-forecasting"]
  ),
  "expense-tracking": createFeature(
    "expense-tracking",
    "Expense Tracking",
    "Employee expense management and approvals",
    "finance",
    "Simplify expense management with mobile receipt capture, policy enforcement, and automated approvals. Reduce fraud and ensure compliance with expense policies.",
    ["Receipt capture", "Policy enforcement", "Approval workflows", "Credit card integration", "Mileage tracking", "Per diem rules", "Expense reports", "Reimbursement"],
    ["Faster reimbursements", "Policy compliance", "Reduced fraud", "Better visibility", "Time savings"],
    ["Travel expenses", "Employee reimbursements", "Corporate cards", "Project expenses", "Client billing"],
    ["budgeting-dashboard", "ap-invoices", "approval-workflow", "project-budget-management"]
  ),
  "financial-consolidation": createFeature(
    "financial-consolidation",
    "Financial Consolidation",
    "Multi-entity consolidation and eliminations",
    "finance",
    "Consolidate financial results across multiple entities with automatic eliminations, currency translation, and minority interest calculations. Support complex ownership structures.",
    ["Entity consolidation", "Intercompany eliminations", "Currency translation", "Minority interest", "Segment reporting", "Consolidation rules", "Audit trail", "Comparative periods"],
    ["Accurate consolidated results", "Faster close", "Regulatory compliance", "Better visibility", "Audit readiness"],
    ["Group reporting", "Subsidiary management", "International operations", "M&A integration", "Segment analysis"],
    ["general-ledger", "intercompany-reconciliation", "financial-reports", "multi-tenancy"]
  ),
  "revenue-forecasting": createFeature(
    "revenue-forecasting",
    "Revenue Forecasting",
    "AI-powered revenue predictions",
    "finance",
    "Leverage AI and machine learning to forecast revenue with higher accuracy. Combine pipeline data, historical trends, and external factors for reliable predictions.",
    ["AI predictions", "Scenario modeling", "Pipeline analysis", "Trend detection", "Seasonality adjustment", "What-if analysis", "Accuracy tracking", "Forecast collaboration"],
    ["Accurate forecasts", "Better planning", "Reduced uncertainty", "Informed decisions", "Improved credibility"],
    ["Revenue planning", "Sales forecasting", "Financial planning", "Board reporting", "Investor relations"],
    ["sales-analytics", "predictive-analytics", "budgeting-dashboard", "cash-management"]
  ),
  "payment-scheduling": createFeature(
    "payment-scheduling",
    "Payment Scheduling",
    "Automated payment runs and scheduling",
    "finance",
    "Automate payment processing with scheduled runs, payment prioritization, and multi-method support. Optimize cash flow while maintaining vendor relationships.",
    ["Payment scheduling", "Batch processing", "Payment methods", "Approval workflows", "Payment prioritization", "Early pay discounts", "Payment tracking", "Bank integration"],
    ["Cash flow optimization", "Vendor satisfaction", "Capture discounts", "Reduced manual work", "Better controls"],
    ["Vendor payments", "Payroll funding", "Tax payments", "Loan payments", "Subscription payments"],
    ["ap-invoices", "cash-management", "bank-reconciliation", "approval-workflow"]
  ),
  "aging-report": createFeature(
    "aging-report",
    "Aging Reports",
    "AR/AP aging analysis and collections",
    "finance",
    "Track and analyze accounts receivable and payable aging with detailed reports, collection priorities, and trend analysis. Optimize working capital management.",
    ["AR aging", "AP aging", "Collection priorities", "Trend analysis", "Customer risk scoring", "Payment history", "Exception flags", "Collection actions"],
    ["Faster collections", "Better cash flow", "Risk identification", "Prioritized actions", "Reduced bad debt"],
    ["Collections management", "Credit analysis", "Vendor management", "Cash forecasting", "Risk assessment"],
    ["ar-invoices", "ap-invoices", "credit-management-collections", "cash-management"]
  ),
  "intercompany-reconciliation": createFeature(
    "intercompany-reconciliation",
    "Intercompany Reconciliation",
    "Cross-entity transaction matching",
    "finance",
    "Automate intercompany reconciliation with intelligent matching, exception handling, and elimination entries. Ensure accurate consolidated financial statements.",
    ["Auto-matching", "Exception management", "Elimination entries", "Multi-currency", "Netting", "Dispute resolution", "Audit trail", "Reconciliation reports"],
    ["Faster consolidation", "Accurate eliminations", "Reduced disputes", "Time savings", "Audit readiness"],
    ["Group accounting", "Intercompany transactions", "Transfer pricing", "Shared services", "Currency management"],
    ["financial-consolidation", "general-ledger", "multi-tenancy", "financial-reports"]
  ),

  "employee-directory": createFeature(
    "employee-directory",
    "Employee Directory",
    "Centralized employee information management",
    "hr",
    "Maintain a comprehensive employee database with personal information, job details, skills, and organizational relationships. Self-service access for employees to update their information.",
    ["Employee profiles", "Contact information", "Job history", "Skills tracking", "Document storage", "Self-service updates", "Search functionality", "Privacy controls"],
    ["Single source of truth", "Self-service efficiency", "Better communication", "Compliance support", "Quick access"],
    ["HR administration", "Employee onboarding", "Directory lookups", "Compliance tracking", "Workforce planning"],
    ["org-chart", "performance-reviews", "payroll-processing", "leave-request"]
  ),
  "org-chart": createFeature(
    "org-chart",
    "Organization Chart",
    "Visual org structure and reporting lines",
    "hr",
    "Visualize organizational structure with interactive org charts showing reporting relationships, teams, and positions. Plan organizational changes with scenario modeling.",
    ["Interactive org chart", "Reporting lines", "Position management", "Vacancy tracking", "Scenario planning", "Department views", "Export options", "Historical views"],
    ["Clear visibility", "Better planning", "Easy navigation", "Change modeling", "Improved communication"],
    ["Organizational planning", "New hire orientation", "Team structure", "Restructuring", "Succession planning"],
    ["employee-directory", "talent-pool", "compensation-management", "hr-analytics-dashboard"]
  ),
  "payroll-processing": createFeature(
    "payroll-processing",
    "Payroll Processing",
    "Automated payroll runs with tax calculations",
    "hr",
    "Process payroll accurately and on time with automated calculations, tax withholding, and direct deposits. Handle complex pay scenarios including overtime, bonuses, and deductions.",
    ["Payroll calculations", "Tax withholding", "Direct deposit", "Pay stubs", "Deductions", "Garnishments", "Overtime handling", "Year-end processing"],
    ["Accurate payroll", "On-time payments", "Tax compliance", "Time savings", "Employee satisfaction"],
    ["Regular payroll", "Off-cycle payments", "Bonus processing", "Tax filing", "Year-end reporting"],
    ["employee-directory", "attendance-dashboard", "expense-tracking", "compensation-management"]
  ),
  "leave-request": createFeature(
    "leave-request",
    "Leave Management",
    "Time-off requests and approval workflows",
    "hr",
    "Streamline leave management with self-service requests, automated approvals, and balance tracking. Support multiple leave types with configurable policies.",
    ["Leave requests", "Approval workflows", "Balance tracking", "Leave calendar", "Accrual management", "Policy configuration", "Carry-over rules", "Team visibility"],
    ["Faster approvals", "Accurate tracking", "Policy compliance", "Better planning", "Employee satisfaction"],
    ["Vacation requests", "Sick leave", "Personal time", "FMLA tracking", "Holiday management"],
    ["attendance-dashboard", "employee-directory", "approval-workflow", "hr-copilot"]
  ),
  "attendance-dashboard": createFeature(
    "attendance-dashboard",
    "Attendance Dashboard",
    "Time tracking and attendance monitoring",
    "hr",
    "Track employee attendance with clock-in/out, scheduling, and absence management. Monitor attendance patterns and ensure compliance with work hour regulations.",
    ["Time tracking", "Clock in/out", "Schedule management", "Absence tracking", "Overtime monitoring", "Shift management", "Geofencing", "Reporting"],
    ["Accurate time data", "Labor compliance", "Fair scheduling", "Attendance insights", "Payroll accuracy"],
    ["Time and attendance", "Shift scheduling", "Overtime management", "Compliance reporting", "Workforce analytics"],
    ["payroll-processing", "leave-request", "employee-directory", "hr-analytics-dashboard"]
  ),
  "performance-reviews": createFeature(
    "performance-reviews",
    "Performance Reviews",
    "Goal setting and performance evaluations",
    "hr",
    "Conduct meaningful performance reviews with goal tracking, competency assessments, and development planning. Support continuous feedback and 360-degree reviews.",
    ["Goal setting", "Review cycles", "Competency assessment", "360-degree feedback", "Self-assessment", "Development plans", "Calibration", "Performance history"],
    ["Aligned goals", "Fair evaluations", "Employee development", "Better retention", "Performance culture"],
    ["Annual reviews", "Mid-year check-ins", "Goal tracking", "Promotion decisions", "Development planning"],
    ["employee-directory", "compensation-management", "learning-management", "talent-pool"]
  ),
  "talent-pool": createFeature(
    "talent-pool",
    "Talent Pool",
    "Recruitment and candidate management",
    "hr",
    "Build and manage talent pipelines with candidate sourcing, tracking, and engagement. Connect with top talent before positions open.",
    ["Candidate profiles", "Pipeline management", "Source tracking", "Engagement campaigns", "Skill matching", "Interview scheduling", "Offer management", "Onboarding"],
    ["Faster hiring", "Better candidates", "Reduced costs", "Proactive recruiting", "Talent insights"],
    ["Recruiting", "Campus hiring", "Executive search", "Internal mobility", "Referral programs"],
    ["org-chart", "employee-directory", "onboarding-automation", "hr-analytics-dashboard"]
  ),
  "onboarding-automation": createFeature(
    "onboarding-automation",
    "Onboarding Automation",
    "Streamlined new hire onboarding",
    "hr",
    "Automate the new hire experience with task workflows, document collection, and training assignments. Ensure every new employee has a great first day and productive first months.",
    ["Onboarding workflows", "Task checklists", "Document collection", "Training assignments", "Buddy programs", "Progress tracking", "Integration triggers", "Welcome portals"],
    ["Faster productivity", "Better experience", "Compliance assurance", "Consistent process", "Reduced manual work"],
    ["New hire onboarding", "Contractor setup", "Transfers", "Rehires", "Compliance training"],
    ["employee-directory", "talent-pool", "learning-management", "workflow-designer"]
  ),
  "compensation-management": createFeature(
    "compensation-management",
    "Compensation Management",
    "Salary planning and benefits administration",
    "hr",
    "Plan and manage total compensation including base salary, bonuses, equity, and benefits. Ensure pay equity and market competitiveness.",
    ["Salary planning", "Bonus administration", "Equity management", "Benefits enrollment", "Pay equity analysis", "Market benchmarking", "Compensation statements", "Budget modeling"],
    ["Pay competitiveness", "Budget control", "Equity compliance", "Employee satisfaction", "Retention"],
    ["Compensation planning", "Merit increases", "Bonus cycles", "Benefits administration", "Pay equity"],
    ["payroll-processing", "performance-reviews", "budgeting-dashboard", "hr-analytics-dashboard"]
  ),
  "learning-management": createFeature(
    "learning-management",
    "Learning Management",
    "Training courses and certifications",
    "hr",
    "Deliver and track employee training with courses, certifications, and learning paths. Support compliance training requirements and skill development.",
    ["Course catalog", "Learning paths", "Certifications", "Progress tracking", "Quiz assessments", "SCORM support", "Mobile learning", "Reporting"],
    ["Skill development", "Compliance assurance", "Knowledge retention", "Employee growth", "Training ROI"],
    ["Compliance training", "Skills development", "New hire training", "Leadership development", "Technical training"],
    ["performance-reviews", "onboarding-automation", "employee-engagement", "compliance-monitoring"]
  ),
  "employee-engagement": createFeature(
    "employee-engagement",
    "Employee Engagement",
    "Surveys and engagement analytics",
    "hr",
    "Measure and improve employee engagement with pulse surveys, feedback collection, and sentiment analysis. Take action on insights to build a better workplace.",
    ["Pulse surveys", "Engagement scores", "Sentiment analysis", "Anonymous feedback", "Action planning", "Benchmarking", "Trend tracking", "Recognition"],
    ["Higher engagement", "Better retention", "Early warning signs", "Data-driven actions", "Culture improvement"],
    ["Engagement measurement", "Culture initiatives", "Change management", "Exit surveys", "Recognition programs"],
    ["hr-analytics-dashboard", "performance-reviews", "hr-copilot", "learning-management"]
  ),
  "hr-analytics-dashboard": createFeature(
    "hr-analytics-dashboard",
    "HR Analytics",
    "Workforce analytics and insights",
    "hr",
    "Gain insights into workforce trends with comprehensive HR analytics. Track headcount, turnover, diversity, and other key metrics to inform strategic decisions.",
    ["Headcount analytics", "Turnover analysis", "Diversity metrics", "Compensation insights", "Predictive analytics", "Custom dashboards", "Benchmarking", "Trend analysis"],
    ["Data-driven HR", "Strategic insights", "Risk identification", "Better planning", "Compliance reporting"],
    ["Workforce planning", "Diversity reporting", "Turnover prediction", "Compensation analysis", "Executive reporting"],
    ["dashboard-builder", "employee-directory", "performance-reviews", "predictive-analytics"]
  ),
  "hr-copilot": createFeature(
    "hr-copilot",
    "HR Copilot",
    "AI assistant for HR queries",
    "hr",
    "Your AI-powered HR assistant that answers employee questions, automates routine tasks, and provides policy guidance. Available 24/7 to support employees and HR teams.",
    ["Policy Q&A", "Leave inquiries", "Benefits questions", "Form assistance", "Process guidance", "Document generation", "Ticket routing", "Analytics queries"],
    ["24/7 support", "Faster answers", "Reduced HR workload", "Consistent information", "Employee satisfaction"],
    ["Employee self-service", "Policy questions", "Benefits enrollment", "Leave requests", "General HR inquiries"],
    ["copilot", "leave-request", "employee-engagement", "knowledge-base"]
  ),

  "work-order": createFeature(
    "work-order",
    "Work Orders",
    "Production order management and tracking",
    "manufacturing",
    "Create, schedule, and track production work orders through the manufacturing process. Monitor progress, resource consumption, and completion status in real-time.",
    ["Work order creation", "Scheduling", "Progress tracking", "Resource allocation", "Material consumption", "Quality checkpoints", "Completion reporting", "Cost tracking"],
    ["Production visibility", "On-time delivery", "Resource optimization", "Quality assurance", "Cost control"],
    ["Production planning", "Job shop manufacturing", "Assembly operations", "Maintenance work", "Custom manufacturing"],
    ["mrp-dashboard", "shop-floor", "production-scheduling-gantt", "quality-control"]
  ),
  "mrp-dashboard": createFeature(
    "mrp-dashboard",
    "MRP Dashboard",
    "Material requirements planning",
    "manufacturing",
    "Plan material requirements based on demand forecasts, BOMs, and inventory levels. Generate procurement and production recommendations to meet customer demand.",
    ["Demand analysis", "BOM explosion", "Inventory planning", "Lead time management", "Order recommendations", "Exception handling", "What-if scenarios", "Capacity consideration"],
    ["Right materials at right time", "Reduced stockouts", "Lower inventory costs", "Better planning", "Customer satisfaction"],
    ["Production planning", "Procurement planning", "Inventory optimization", "Demand management", "Capacity planning"],
    ["bom-management", "demand-forecasting", "inventory-dashboard", "purchase-order"]
  ),
  "bom-management": createFeature(
    "bom-management",
    "BOM Management",
    "Bill of materials and routing",
    "manufacturing",
    "Create and manage multi-level bills of materials with routing operations. Support engineering changes, version control, and cost rollup calculations.",
    ["Multi-level BOMs", "Routing operations", "Version control", "Engineering changes", "Cost rollup", "Where-used analysis", "Substitute components", "Import/export"],
    ["Accurate product definition", "Engineering control", "Cost visibility", "Change management", "Manufacturing accuracy"],
    ["Product engineering", "Cost estimation", "Production planning", "Engineering changes", "Product lifecycle"],
    ["mrp-dashboard", "work-order", "standard-costing", "plm-engineering-change-control"]
  ),
  "shop-floor": createFeature(
    "shop-floor",
    "Shop Floor Control",
    "Real-time production monitoring",
    "manufacturing",
    "Monitor production operations in real-time with shop floor data collection, machine integration, and performance dashboards. Track OEE and identify production issues.",
    ["Real-time monitoring", "Machine integration", "Labor tracking", "Quality data", "OEE calculation", "Downtime tracking", "Alert management", "Performance dashboards"],
    ["Real-time visibility", "Quick issue response", "Improved OEE", "Data-driven decisions", "Reduced downtime"],
    ["Production monitoring", "Quality tracking", "Labor efficiency", "Machine performance", "Continuous improvement"],
    ["work-order", "quality-control", "mfg-analytics", "cmms-maintenance"]
  ),
  "quality-control": createFeature(
    "quality-control",
    "Quality Control",
    "Inspection and quality management",
    "manufacturing",
    "Manage quality inspections, test results, and non-conformance throughout manufacturing. Ensure products meet specifications and regulatory requirements.",
    ["Inspection plans", "Test management", "Quality checkpoints", "Non-conformance", "CAPA management", "Statistical process control", "Certificate of analysis", "Supplier quality"],
    ["Consistent quality", "Regulatory compliance", "Reduced scrap", "Customer satisfaction", "Continuous improvement"],
    ["Incoming inspection", "In-process quality", "Final inspection", "Supplier quality", "Audit management"],
    ["ncr-management", "shop-floor", "inspection-plans-itp", "supplier-quality-scorecard"]
  ),
  "production-scheduling-gantt": createFeature(
    "production-scheduling-gantt",
    "Production Scheduling",
    "Gantt-based production planning",
    "manufacturing",
    "Schedule production operations with visual Gantt charts, resource optimization, and constraint management. Balance capacity and demand for on-time delivery.",
    ["Gantt scheduling", "Resource optimization", "Constraint management", "Sequence optimization", "Priority management", "What-if scenarios", "Finite capacity", "Real-time updates"],
    ["Optimized schedules", "Resource utilization", "On-time delivery", "Visual planning", "Quick replanning"],
    ["Production planning", "Capacity management", "Rush order handling", "Multi-resource scheduling", "Bottleneck management"],
    ["work-order", "capacity-planning", "mrp-dashboard", "shop-floor"]
  ),
  "wip-tracking": createFeature(
    "wip-tracking",
    "WIP Tracking",
    "Work-in-progress monitoring",
    "manufacturing",
    "Track work-in-progress through all production stages with real-time status, location, and value. Identify bottlenecks and optimize production flow.",
    ["Real-time WIP status", "Location tracking", "Value tracking", "Bottleneck identification", "Flow analysis", "Aging reports", "Exception alerts", "Dashboard views"],
    ["WIP visibility", "Reduced cycle time", "Lower WIP costs", "Better planning", "Flow optimization"],
    ["Production tracking", "Inventory management", "Cost accounting", "Lean manufacturing", "Continuous improvement"],
    ["shop-floor", "work-order", "standard-costing", "mfg-analytics"]
  ),
  "ncr-management": createFeature(
    "ncr-management",
    "NCR Management",
    "Non-conformance reports and CAPA",
    "manufacturing",
    "Document and manage non-conformances with root cause analysis, corrective actions, and preventive measures. Drive continuous improvement through systematic issue resolution.",
    ["NCR documentation", "Root cause analysis", "CAPA management", "Disposition tracking", "Cost tracking", "Trend analysis", "Escalation", "Closure verification"],
    ["Quality improvement", "Regulatory compliance", "Root cause elimination", "Cost reduction", "Continuous improvement"],
    ["Quality management", "Supplier quality", "Customer complaints", "Process improvement", "Audit findings"],
    ["quality-control", "inspection-plans-itp", "supplier-quality-scorecard", "compliance-monitoring"]
  ),
  "equipment-management": createFeature(
    "equipment-management",
    "Equipment Management",
    "Asset maintenance and scheduling",
    "manufacturing",
    "Manage production equipment with maintenance scheduling, work orders, and asset tracking. Maximize equipment uptime and extend asset life.",
    ["Asset registry", "Preventive maintenance", "Work orders", "Spare parts", "Calibration tracking", "Downtime tracking", "Cost tracking", "Equipment history"],
    ["Reduced downtime", "Extended asset life", "Maintenance optimization", "Cost control", "Regulatory compliance"],
    ["Maintenance planning", "Asset management", "Calibration", "Spare parts", "Equipment procurement"],
    ["cmms-maintenance", "shop-floor", "work-order", "tooling-management"]
  ),
  "standard-costing": createFeature(
    "standard-costing",
    "Standard Costing",
    "Product costing and variance analysis",
    "manufacturing",
    "Calculate and track product costs with standard costing, actual cost capture, and variance analysis. Support cost estimation and profitability analysis.",
    ["Standard cost calculation", "BOM cost rollup", "Labor costing", "Overhead allocation", "Variance analysis", "Cost updates", "What-if costing", "Profitability analysis"],
    ["Accurate product costs", "Variance visibility", "Pricing decisions", "Cost control", "Profitability improvement"],
    ["Product costing", "Pricing strategy", "Variance analysis", "Cost estimation", "Financial reporting"],
    ["bom-management", "work-order", "financial-reports", "mfg-analytics"]
  ),
  "capacity-planning": createFeature(
    "capacity-planning",
    "Capacity Planning",
    "Resource capacity optimization",
    "manufacturing",
    "Plan and optimize manufacturing capacity with resource modeling, demand analysis, and bottleneck identification. Balance workload across resources for maximum efficiency.",
    ["Capacity modeling", "Resource planning", "Bottleneck analysis", "Load balancing", "What-if scenarios", "Overtime planning", "Outsourcing decisions", "Investment planning"],
    ["Optimized capacity", "Reduced bottlenecks", "Better resource use", "Informed investment", "Customer service"],
    ["Capacity planning", "Resource allocation", "Investment decisions", "Demand management", "Production planning"],
    ["production-scheduling-gantt", "mrp-dashboard", "team-utilization", "mfg-analytics"]
  ),
  "tooling-management": createFeature(
    "tooling-management",
    "Tooling Management",
    "Tool tracking and maintenance",
    "manufacturing",
    "Track and manage production tooling including location, usage, maintenance, and life tracking. Ensure tools are available and in proper condition when needed.",
    ["Tool registry", "Location tracking", "Usage tracking", "Life management", "Maintenance scheduling", "Calibration", "Replacement planning", "Cost tracking"],
    ["Tool availability", "Reduced tool costs", "Quality assurance", "Maintenance optimization", "Production continuity"],
    ["Tool management", "Die maintenance", "Fixture tracking", "Calibration", "Tool procurement"],
    ["equipment-management", "shop-floor", "quality-control", "cmms-maintenance"]
  ),
  "cmms-maintenance": createFeature(
    "cmms-maintenance",
    "CMMS Maintenance",
    "Preventive maintenance scheduling",
    "manufacturing",
    "Comprehensive computerized maintenance management system for scheduling, tracking, and optimizing maintenance activities. Reduce unplanned downtime through preventive maintenance.",
    ["Preventive maintenance", "Work order management", "Asset management", "Spare parts", "Labor tracking", "Cost tracking", "KPI dashboards", "Mobile access"],
    ["Reduced downtime", "Extended asset life", "Lower maintenance costs", "Improved reliability", "Regulatory compliance"],
    ["Maintenance management", "Asset reliability", "Spare parts planning", "Work order management", "Compliance"],
    ["equipment-management", "shop-floor", "work-order", "inventory-dashboard"]
  ),
  "mfg-analytics": createFeature(
    "mfg-analytics",
    "Manufacturing Analytics",
    "OEE and production insights",
    "manufacturing",
    "Gain insights into manufacturing performance with OEE tracking, efficiency analysis, and production dashboards. Drive continuous improvement with data-driven decisions.",
    ["OEE calculation", "Efficiency analysis", "Downtime analysis", "Quality metrics", "Production dashboards", "Trend analysis", "Benchmarking", "Predictive insights"],
    ["Performance visibility", "Improvement identification", "Data-driven decisions", "Benchmarking", "Continuous improvement"],
    ["Performance management", "Continuous improvement", "Management reporting", "Lean manufacturing", "Operational excellence"],
    ["shop-floor", "dashboard-builder", "report-builder", "predictive-analytics"]
  ),

  "purchase-order": createFeature(
    "purchase-order",
    "Purchase Orders",
    "Procurement order management",
    "supply-chain",
    "Create, approve, and track purchase orders through the procurement lifecycle. Manage vendor relationships and ensure timely delivery of materials and services.",
    ["PO creation", "Approval workflows", "Vendor selection", "Price management", "Delivery tracking", "Receipt matching", "Change orders", "PO history"],
    ["Procurement control", "Vendor management", "Cost control", "Delivery tracking", "Compliance"],
    ["Material procurement", "Service purchases", "Capital equipment", "Contract purchasing", "Vendor management"],
    ["vendor-management", "goods-receipt", "ap-invoices", "approval-workflow"]
  ),
  "vendor-management": createFeature(
    "vendor-management",
    "Vendor Management",
    "Supplier portal and performance tracking",
    "supply-chain",
    "Manage vendor relationships with supplier qualification, performance tracking, and collaboration tools. Build strong supplier partnerships for competitive advantage.",
    ["Vendor profiles", "Performance scorecards", "Supplier portal", "Risk assessment", "Contract management", "Spend analysis", "Qualification", "Collaboration"],
    ["Better supplier relationships", "Performance visibility", "Risk reduction", "Cost optimization", "Supplier collaboration"],
    ["Supplier management", "Vendor qualification", "Performance management", "Risk management", "Strategic sourcing"],
    ["purchase-order", "supplier-quality-scorecard", "supplier-collaboration-portal", "compliance-monitoring"]
  ),
  "inventory-dashboard": createFeature(
    "inventory-dashboard",
    "Inventory Dashboard",
    "Real-time stock visibility",
    "supply-chain",
    "Monitor inventory levels across all locations with real-time visibility into stock, movements, and trends. Make informed decisions about replenishment and allocation.",
    ["Stock visibility", "Multi-location", "Movement tracking", "Low stock alerts", "Trend analysis", "ABC classification", "Cycle counting", "Valuation"],
    ["Real-time visibility", "Reduced stockouts", "Lower carrying costs", "Better planning", "Inventory accuracy"],
    ["Inventory management", "Warehouse operations", "Demand planning", "Financial reporting", "Operations planning"],
    ["inventory-optimization", "demand-forecasting", "inventory-warehouse", "mrp-dashboard"]
  ),
  "inventory-warehouse": createFeature(
    "inventory-warehouse",
    "Warehouse Management",
    "Bin locations and picking optimization",
    "supply-chain",
    "Optimize warehouse operations with bin management, picking optimization, and receiving processes. Improve accuracy and efficiency in warehouse operations.",
    ["Bin locations", "Pick optimization", "Put-away logic", "Wave planning", "Zone management", "RF scanning", "Cycle counting", "Dock scheduling"],
    ["Warehouse efficiency", "Picking accuracy", "Space optimization", "Labor productivity", "Order accuracy"],
    ["Warehouse operations", "Order fulfillment", "Receiving", "Inventory management", "Distribution"],
    ["inventory-dashboard", "order-fulfillment", "goods-receipt", "third-party-logistics"]
  ),
  "goods-receipt": createFeature(
    "goods-receipt",
    "Goods Receipt",
    "Inbound receiving and putaway",
    "supply-chain",
    "Manage inbound receiving with quality inspection, putaway direction, and PO matching. Ensure accurate receipt of materials and efficient warehouse processing.",
    ["Receipt processing", "Quality inspection", "PO matching", "Putaway direction", "Barcode scanning", "Exception handling", "Receipt history", "Vendor performance"],
    ["Accurate receiving", "Quality control", "Efficient putaway", "Vendor accountability", "Inventory accuracy"],
    ["Material receiving", "Returns processing", "Quality holds", "Inter-warehouse transfers", "Cross-docking"],
    ["purchase-order", "inventory-warehouse", "quality-control", "ap-invoices"]
  ),
  "demand-forecasting": createFeature(
    "demand-forecasting",
    "Demand Forecasting",
    "AI-powered demand predictions",
    "supply-chain",
    "Leverage AI and machine learning to forecast demand with higher accuracy. Combine historical data, market trends, and external factors for reliable predictions.",
    ["AI forecasting", "Trend analysis", "Seasonality", "Promotion impact", "New product forecasting", "Collaborative input", "Accuracy tracking", "What-if scenarios"],
    ["Forecast accuracy", "Reduced stockouts", "Lower inventory costs", "Better service levels", "Optimized planning"],
    ["Demand planning", "Inventory optimization", "Production planning", "Financial planning", "Promotion planning"],
    ["inventory-optimization", "mrp-dashboard", "predictive-analytics", "sales-analytics"]
  ),
  "order-fulfillment": createFeature(
    "order-fulfillment",
    "Order Fulfillment",
    "Pick, pack, and ship automation",
    "supply-chain",
    "Streamline order fulfillment with optimized picking, packing, and shipping processes. Ensure accurate and timely delivery to customers.",
    ["Pick optimization", "Pack verification", "Ship processing", "Carrier selection", "Label printing", "Tracking updates", "Exception handling", "Performance metrics"],
    ["Faster fulfillment", "Higher accuracy", "Lower costs", "Customer satisfaction", "Scalability"],
    ["E-commerce fulfillment", "Wholesale distribution", "Retail replenishment", "Drop shipping", "Store fulfillment"],
    ["inventory-warehouse", "sales-order-management", "omnichannel-orders", "transportation-management-system"]
  ),
  "transportation-management-system": createFeature(
    "transportation-management-system",
    "Transportation Management",
    "Carrier management and routing",
    "supply-chain",
    "Optimize transportation with carrier management, route optimization, and shipment tracking. Reduce costs while improving delivery performance.",
    ["Carrier management", "Route optimization", "Rate management", "Shipment tracking", "Load planning", "Dock scheduling", "Proof of delivery", "Analytics"],
    ["Reduced freight costs", "Improved delivery", "Carrier compliance", "Visibility", "Optimization"],
    ["Freight management", "Fleet management", "Delivery planning", "Carrier selection", "Load optimization"],
    ["freight-management", "order-fulfillment", "third-party-logistics", "trade-compliance-dashboard"]
  ),
  "freight-management": createFeature(
    "freight-management",
    "Freight Management",
    "Freight rates and billing",
    "supply-chain",
    "Manage freight costs with rate management, billing audit, and cost allocation. Ensure accurate freight accounting and identify optimization opportunities.",
    ["Rate management", "Billing audit", "Cost allocation", "Contract management", "Dispute resolution", "Accruals", "Analytics", "Carrier scorecards"],
    ["Cost reduction", "Billing accuracy", "Contract compliance", "Dispute resolution", "Cost visibility"],
    ["Freight billing", "Cost management", "Carrier contracts", "Dispute resolution", "Cost analysis"],
    ["transportation-management-system", "ap-invoices", "trade-compliance-dashboard", "vendor-management"]
  ),
  "third-party-logistics": createFeature(
    "third-party-logistics",
    "3PL Integration",
    "Third-party logistics connectivity",
    "supply-chain",
    "Integrate with third-party logistics providers for seamless order fulfillment and inventory management. Maintain visibility across your extended supply chain.",
    ["3PL connectivity", "Order routing", "Inventory sync", "Shipment tracking", "Returns management", "Performance monitoring", "Exception handling", "Billing reconciliation"],
    ["Extended capacity", "Scalability", "Visibility", "Partner collaboration", "Cost efficiency"],
    ["3PL management", "Fulfillment outsourcing", "Multi-3PL operations", "Returns processing", "Partner integration"],
    ["order-fulfillment", "inventory-dashboard", "integration-hub", "transportation-management-system"]
  ),
  "supply-network-optimization": createFeature(
    "supply-network-optimization",
    "Supply Network Optimization",
    "Network design and optimization",
    "supply-chain",
    "Optimize your supply network with scenario modeling, cost analysis, and strategic planning tools. Design efficient networks for cost and service optimization.",
    ["Network modeling", "Scenario analysis", "Cost optimization", "Service level analysis", "Capacity planning", "Location analysis", "Risk assessment", "Investment planning"],
    ["Network efficiency", "Cost reduction", "Service improvement", "Strategic insights", "Risk mitigation"],
    ["Network design", "Facility planning", "Distribution strategy", "Sourcing strategy", "Risk management"],
    ["demand-forecasting", "inventory-optimization", "capacity-planning", "transportation-management-system"]
  ),
  "trade-compliance-dashboard": createFeature(
    "trade-compliance-dashboard",
    "Trade Compliance",
    "Import/export compliance management",
    "supply-chain",
    "Ensure compliance with trade regulations including customs, export controls, and sanctions. Manage documentation and reporting requirements for international trade.",
    ["Customs management", "Export controls", "Sanctions screening", "Classification", "Documentation", "Duty management", "FTZ management", "Audit support"],
    ["Trade compliance", "Reduced penalties", "Faster clearance", "Audit readiness", "Global trade efficiency"],
    ["Import/export", "Customs compliance", "Export controls", "Trade agreements", "Documentation"],
    ["freight-management", "purchase-order", "compliance-monitoring", "sales-order-management"]
  ),
  "inventory-optimization": createFeature(
    "inventory-optimization",
    "Inventory Optimization",
    "Safety stock and reorder optimization",
    "supply-chain",
    "Optimize inventory levels with scientific safety stock calculations, reorder point optimization, and multi-echelon inventory planning.",
    ["Safety stock optimization", "Reorder points", "Lead time analysis", "Service level modeling", "Multi-echelon planning", "Slow-moving analysis", "Segmentation", "Target setting"],
    ["Lower inventory costs", "Improved service levels", "Reduced stockouts", "Working capital optimization", "Better planning"],
    ["Inventory planning", "Safety stock", "Service level optimization", "Working capital", "Demand variability"],
    ["inventory-dashboard", "demand-forecasting", "mrp-dashboard", "supply-network-optimization"]
  ),
  "rma-management": createFeature(
    "rma-management",
    "RMA Management",
    "Returns and warranty management",
    "supply-chain",
    "Manage product returns and warranty claims with streamlined processing, inspection, and disposition. Track returns reasons and drive product quality improvements.",
    ["RMA processing", "Warranty tracking", "Inspection workflow", "Disposition management", "Credit processing", "Replacement orders", "Analytics", "Customer portal"],
    ["Efficient returns", "Customer satisfaction", "Warranty control", "Quality insights", "Cost reduction"],
    ["Customer returns", "Warranty claims", "Defective products", "Exchange processing", "Recall management"],
    ["customer-portal", "quality-control", "inventory-dashboard", "sales-order-management"]
  ),

  "agile-board": createFeature(
    "agile-board",
    "Agile Board",
    "Kanban and Scrum boards",
    "projects",
    "Manage agile projects with flexible boards supporting Kanban, Scrum, and hybrid methodologies. Visualize work, limit WIP, and optimize team flow.",
    ["Kanban boards", "Scrum support", "Sprint planning", "WIP limits", "Swimlanes", "Card templates", "Burndown charts", "Velocity tracking"],
    ["Visual workflow", "Team collaboration", "Agile methodology", "Continuous improvement", "Flexibility"],
    ["Software development", "Marketing projects", "Operations", "Product management", "Service delivery"],
    ["kanban-board", "task-management", "epics", "team-collaboration"]
  ),
  "task-management": createFeature(
    "task-management",
    "Task Management",
    "Task assignment and tracking",
    "projects",
    "Create, assign, and track tasks with due dates, priorities, and dependencies. Keep projects on track with clear accountability and progress visibility.",
    ["Task creation", "Assignment", "Due dates", "Priorities", "Dependencies", "Subtasks", "Comments", "Attachments"],
    ["Clear accountability", "Progress tracking", "Deadline management", "Team coordination", "Visibility"],
    ["Project tasks", "Personal tasks", "Team coordination", "Client work", "Process tracking"],
    ["agile-board", "kanban-board", "team-collaboration", "daily-progress-report"]
  ),
  "kanban-board": createFeature(
    "kanban-board",
    "Kanban Board",
    "Visual workflow management",
    "projects",
    "Visualize work in progress with customizable Kanban boards. Manage flow, identify bottlenecks, and optimize team productivity.",
    ["Custom columns", "WIP limits", "Card templates", "Swimlanes", "Quick filters", "Labels", "Due dates", "Assignments"],
    ["Visual workflow", "Flow management", "Bottleneck identification", "Team collaboration", "Flexibility"],
    ["Development workflow", "Content management", "Support tickets", "Sales pipeline", "Recruiting"],
    ["agile-board", "task-management", "workflow-designer", "team-collaboration"]
  ),
  "project-budget-management": createFeature(
    "project-budget-management",
    "Project Budget",
    "Budget tracking and cost control",
    "projects",
    "Track project budgets with cost planning, actual tracking, and variance analysis. Control project costs and ensure financial success.",
    ["Budget planning", "Cost tracking", "Variance analysis", "Forecasting", "Approval workflows", "Resource costs", "Expense tracking", "Reporting"],
    ["Budget control", "Cost visibility", "Early warning", "Financial success", "Stakeholder confidence"],
    ["Project budgeting", "Cost management", "Financial tracking", "Resource planning", "Stakeholder reporting"],
    ["budgeting-dashboard", "expense-tracking", "team-utilization", "earned-value-analysis"]
  ),
  "team-collaboration": createFeature(
    "team-collaboration",
    "Team Collaboration",
    "Real-time team communication",
    "projects",
    "Collaborate effectively with built-in communication tools, file sharing, and real-time updates. Keep everyone aligned and informed.",
    ["Real-time messaging", "File sharing", "Comments", "Mentions", "Notifications", "Channels", "Activity feeds", "Search"],
    ["Better communication", "Team alignment", "Knowledge sharing", "Faster decisions", "Remote collaboration"],
    ["Project teams", "Cross-functional teams", "Remote teams", "Client collaboration", "Partner coordination"],
    ["task-management", "agile-board", "daily-progress-report", "knowledge-base"]
  ),
  "team-utilization": createFeature(
    "team-utilization",
    "Resource Planning",
    "Team allocation and utilization",
    "projects",
    "Plan and optimize team allocation with capacity views, utilization tracking, and resource forecasting. Ensure balanced workloads and optimal resource use.",
    ["Capacity planning", "Utilization tracking", "Allocation management", "Skill matching", "Availability views", "Forecasting", "Conflict detection", "Reporting"],
    ["Balanced workloads", "Optimal utilization", "Resource visibility", "Better planning", "Skill alignment"],
    ["Resource planning", "Capacity management", "Team scheduling", "Skill matching", "Workload balancing"],
    ["project-budget-management", "capacity-planning", "task-management", "hr-analytics-dashboard"]
  ),
  "earned-value-analysis": createFeature(
    "earned-value-analysis",
    "Earned Value Analysis",
    "Project performance metrics",
    "projects",
    "Measure project performance with earned value metrics including CPI, SPI, and forecasting. Track project health and predict outcomes.",
    ["EVM calculations", "CPI/SPI tracking", "Variance analysis", "Forecasting", "Trend analysis", "Performance baselines", "Management reports", "Alerts"],
    ["Performance visibility", "Early warning", "Accurate forecasts", "Stakeholder confidence", "Control"],
    ["Large projects", "Government contracts", "Construction", "IT projects", "Capital projects"],
    ["project-budget-management", "task-management", "daily-progress-report", "report-builder"]
  ),
  "daily-progress-report": createFeature(
    "daily-progress-report",
    "Daily Progress Reports",
    "Status updates and reporting",
    "projects",
    "Capture daily progress updates and generate status reports for stakeholders. Keep everyone informed with consistent, professional reporting.",
    ["Daily updates", "Progress tracking", "Blocker identification", "Report generation", "Stakeholder distribution", "Templates", "Photo attachments", "Historical views"],
    ["Regular updates", "Stakeholder communication", "Progress visibility", "Issue identification", "Documentation"],
    ["Project status", "Construction progress", "Team standups", "Client updates", "Management reporting"],
    ["task-management", "team-collaboration", "report-builder", "earned-value-analysis"]
  ),
  "epics": createFeature(
    "epics",
    "Epics & Stories",
    "Agile backlog management",
    "projects",
    "Organize work with epics, user stories, and acceptance criteria. Manage the product backlog with prioritization and release planning.",
    ["Epic management", "User stories", "Acceptance criteria", "Backlog grooming", "Priority management", "Release planning", "Story mapping", "Dependencies"],
    ["Organized backlog", "Clear requirements", "Priority visibility", "Release planning", "Team alignment"],
    ["Product development", "Agile teams", "Feature planning", "Release management", "Sprint planning"],
    ["agile-board", "task-management", "kanban-board", "estimation-workbook"]
  ),
  "estimation-workbook": createFeature(
    "estimation-workbook",
    "Estimation Workbook",
    "Project estimation tools",
    "projects",
    "Create accurate project estimates with structured estimation tools, historical data, and team input. Support multiple estimation methodologies.",
    ["Estimation templates", "Historical data", "Team estimation", "Story points", "Time estimates", "Effort tracking", "Accuracy analysis", "Export options"],
    ["Accurate estimates", "Better planning", "Team input", "Historical learning", "Client confidence"],
    ["Project estimation", "Sprint planning", "Proposal preparation", "Resource planning", "Budget forecasting"],
    ["epics", "project-budget-management", "team-utilization", "agile-board"]
  ),
  "subcontractor-management": createFeature(
    "subcontractor-management",
    "Subcontractor Management",
    "External resource coordination",
    "projects",
    "Manage subcontractors with onboarding, contract management, and performance tracking. Coordinate external resources effectively.",
    ["Subcontractor profiles", "Contract management", "Work assignments", "Performance tracking", "Payment processing", "Compliance tracking", "Communication", "Documentation"],
    ["Vendor coordination", "Compliance management", "Performance visibility", "Contract control", "Efficient collaboration"],
    ["Construction projects", "Consulting engagements", "Outsourced work", "Vendor management", "Compliance"],
    ["vendor-management", "project-budget-management", "contract-management", "approval-workflow"]
  ),

  "ticket-dashboard": createFeature(
    "ticket-dashboard",
    "Ticket Dashboard",
    "Service ticket management",
    "service",
    "Manage service tickets with comprehensive dashboards showing status, priorities, and team workload. Ensure timely resolution and customer satisfaction.",
    ["Ticket management", "Priority handling", "Assignment rules", "Escalation", "Status tracking", "SLA monitoring", "Customer communication", "Reporting"],
    ["Faster resolution", "Better visibility", "SLA compliance", "Customer satisfaction", "Team efficiency"],
    ["IT support", "Customer service", "Help desk", "Internal requests", "Incident management"],
    ["sla-tracking", "customer-portal", "service-analytics", "knowledge-base"]
  ),
  "sla-tracking": createFeature(
    "sla-tracking",
    "SLA Tracking",
    "Service level agreement monitoring",
    "service",
    "Monitor and ensure compliance with service level agreements. Track response times, resolution times, and other SLA metrics.",
    ["SLA configuration", "Real-time monitoring", "Breach alerts", "Escalation triggers", "Performance reports", "Trend analysis", "Target management", "Customer SLAs"],
    ["SLA compliance", "Customer satisfaction", "Performance visibility", "Proactive management", "Accountability"],
    ["IT service management", "Customer support", "Vendor management", "Internal SLAs", "Contract compliance"],
    ["ticket-dashboard", "service-analytics", "response-analytics", "approval-escalations"]
  ),
  "customer-portal": createFeature(
    "customer-portal",
    "Customer Portal",
    "Self-service customer portal",
    "service",
    "Provide customers with a self-service portal for ticket submission, knowledge base access, and account management. Improve customer experience while reducing support load.",
    ["Ticket submission", "Status tracking", "Knowledge base", "Account management", "Document access", "Communication history", "FAQ", "Community"],
    ["Customer empowerment", "Reduced support load", "24/7 access", "Improved satisfaction", "Transparency"],
    ["Customer support", "Partner portals", "B2B service", "Account management", "Self-service"],
    ["ticket-dashboard", "knowledge-base", "ar-invoices", "loyalty-programs"]
  ),
  "knowledge-base": createFeature(
    "knowledge-base",
    "Knowledge Base",
    "Searchable article repository",
    "service",
    "Build and maintain a comprehensive knowledge base with articles, FAQs, and troubleshooting guides. Enable self-service and improve agent productivity.",
    ["Article management", "Categories", "Search", "Article feedback", "Version control", "Rich media", "Related articles", "Analytics"],
    ["Self-service deflection", "Consistent answers", "Agent productivity", "Knowledge capture", "Customer satisfaction"],
    ["Customer self-service", "Agent reference", "Training material", "Best practices", "FAQ management"],
    ["customer-portal", "ticket-dashboard", "copilot", "semantic-search"]
  ),
  "field-service": createFeature(
    "field-service",
    "Field Service",
    "Mobile field service management",
    "service",
    "Manage field service operations with scheduling, dispatch, and mobile technician tools. Optimize routes and ensure first-time fix rates.",
    ["Work order management", "Scheduling", "Dispatch", "Mobile app", "Parts management", "Customer signature", "Routing", "Time tracking"],
    ["First-time fix rate", "Technician productivity", "Customer satisfaction", "Route optimization", "Real-time updates"],
    ["Equipment service", "Installation", "Maintenance", "Repairs", "Inspections"],
    ["ticket-dashboard", "equipment-management", "inventory-dashboard", "customer-portal"]
  ),
  "service-analytics": createFeature(
    "service-analytics",
    "Service Analytics",
    "Service performance metrics",
    "service",
    "Analyze service performance with comprehensive metrics and dashboards. Track KPIs, identify trends, and drive continuous improvement.",
    ["Performance dashboards", "KPI tracking", "Trend analysis", "Agent metrics", "Customer satisfaction", "Volume analysis", "Root cause analysis", "Benchmarking"],
    ["Performance visibility", "Data-driven decisions", "Continuous improvement", "Resource optimization", "Customer insights"],
    ["Service management", "Performance reviews", "Capacity planning", "Quality improvement", "Executive reporting"],
    ["ticket-dashboard", "sla-tracking", "response-analytics", "dashboard-builder"]
  ),
  "response-analytics": createFeature(
    "response-analytics",
    "Response Analytics",
    "Response time analysis",
    "service",
    "Analyze response times and patterns to optimize service delivery. Identify bottlenecks and improve customer experience.",
    ["Response time tracking", "Pattern analysis", "Channel analysis", "Agent performance", "Peak time analysis", "Trend identification", "Comparative analysis", "Recommendations"],
    ["Faster responses", "Resource optimization", "Customer satisfaction", "Performance improvement", "Bottleneck identification"],
    ["Response optimization", "Staffing planning", "Channel strategy", "Performance management", "Customer experience"],
    ["sla-tracking", "service-analytics", "ticket-dashboard", "hr-analytics-dashboard"]
  ),
  "approval-escalations": createFeature(
    "approval-escalations",
    "Queue Management",
    "Ticket routing and escalation",
    "service",
    "Configure intelligent ticket routing and escalation rules. Ensure tickets reach the right agents and escalate appropriately when needed.",
    ["Routing rules", "Skill-based routing", "Round-robin", "Escalation tiers", "SLA-based routing", "Priority routing", "Load balancing", "Override options"],
    ["Right ticket to right agent", "Faster resolution", "Reduced escalations", "Workload balance", "SLA compliance"],
    ["Ticket routing", "Escalation management", "Workload distribution", "Skill matching", "Priority handling"],
    ["ticket-dashboard", "sla-tracking", "approval-workflow", "automation-rules"]
  ),

  "dashboard-builder": createFeature(
    "dashboard-builder",
    "Dashboard Builder",
    "Custom dashboard creation",
    "analytics",
    "Create custom dashboards with drag-and-drop widgets, real-time data, and interactive visualizations. Build personalized views for any role or function.",
    ["Drag-and-drop design", "Widget library", "Real-time data", "Interactive charts", "Filters", "Sharing", "Mobile responsive", "Scheduled refresh"],
    ["Custom views", "Real-time insights", "Role-based dashboards", "Visual analytics", "Quick access"],
    ["Executive dashboards", "Department views", "Project dashboards", "Sales dashboards", "Operations monitoring"],
    ["report-builder", "kpi-dashboard", "data-explorer", "predictive-analytics"]
  ),
  "report-builder": createFeature(
    "report-builder",
    "Report Builder",
    "Ad-hoc report designer",
    "analytics",
    "Create custom reports with a powerful drag-and-drop report designer. Build complex reports without technical skills.",
    ["Drag-and-drop design", "Data connections", "Calculations", "Grouping", "Filtering", "Scheduling", "Export options", "Templates"],
    ["Self-service reporting", "Custom reports", "No IT dependency", "Time savings", "Flexibility"],
    ["Ad-hoc reporting", "Standard reports", "Compliance reports", "Management reports", "Customer reports"],
    ["dashboard-builder", "data-explorer", "scheduled-reports", "export-manager"]
  ),
  "data-explorer": createFeature(
    "data-explorer",
    "Data Explorer",
    "Self-service data analysis",
    "analytics",
    "Explore data with intuitive self-service tools. Ask questions, create visualizations, and discover insights without technical expertise.",
    ["Natural language queries", "Visual exploration", "Drill-down", "Pivot tables", "Charts", "Data export", "Sharing", "Saved queries"],
    ["Data democratization", "Quick answers", "Discovery", "No SQL required", "Self-service"],
    ["Ad-hoc analysis", "Data exploration", "Quick queries", "Trend discovery", "Root cause analysis"],
    ["dashboard-builder", "report-builder", "semantic-search", "copilot"]
  ),
  "kpi-dashboard": createFeature(
    "kpi-dashboard",
    "KPI Dashboard",
    "Key performance indicators",
    "analytics",
    "Track key performance indicators with real-time dashboards and alerts. Monitor business health and progress toward goals.",
    ["KPI tracking", "Goal management", "Trend visualization", "Alerts", "Comparisons", "Drill-down", "Scorecards", "Mobile access"],
    ["Performance visibility", "Goal tracking", "Early warning", "Accountability", "Alignment"],
    ["Executive monitoring", "Department KPIs", "Project metrics", "Sales targets", "Operational goals"],
    ["dashboard-builder", "report-builder", "growth-metrics", "predictive-analytics"]
  ),
  "predictive-analytics": createFeature(
    "predictive-analytics",
    "Predictive Analytics",
    "AI-powered forecasting",
    "analytics",
    "Leverage machine learning for predictive analytics including forecasting, classification, and anomaly detection. Turn data into actionable predictions.",
    ["Forecasting", "Classification", "Regression", "Clustering", "Time series", "Model training", "Accuracy tracking", "Automated ML"],
    ["Accurate predictions", "Proactive decisions", "Risk identification", "Opportunity discovery", "Data-driven planning"],
    ["Sales forecasting", "Demand prediction", "Churn prediction", "Risk scoring", "Maintenance prediction"],
    ["dashboard-builder", "revenue-forecasting", "anomaly-detection", "predictive-modeling"]
  ),
  "anomaly-detection": createFeature(
    "anomaly-detection",
    "Anomaly Detection",
    "Automated outlier detection",
    "analytics",
    "Automatically detect anomalies and outliers in your data. Identify unusual patterns that may indicate issues or opportunities.",
    ["Automated detection", "Multiple algorithms", "Real-time monitoring", "Alerting", "Root cause analysis", "Threshold management", "Historical analysis", "Visualization"],
    ["Early warning", "Fraud detection", "Quality control", "Performance monitoring", "Risk identification"],
    ["Financial monitoring", "Quality control", "Security", "Performance", "Fraud detection"],
    ["predictive-analytics", "dashboard-builder", "compliance-monitoring", "security-settings"]
  ),
  "churn-risk-analysis": createFeature(
    "churn-risk-analysis",
    "Churn Analysis",
    "Customer retention insights",
    "analytics",
    "Identify at-risk customers and understand churn drivers. Take proactive action to improve retention and customer lifetime value.",
    ["Churn prediction", "Risk scoring", "Driver analysis", "Segmentation", "Intervention recommendations", "Trend tracking", "Cohort analysis", "Campaign tracking"],
    ["Reduced churn", "Proactive retention", "Customer insights", "Targeted actions", "Improved LTV"],
    ["Customer retention", "Subscription management", "Account management", "Customer success", "Marketing"],
    ["customer-journey-map", "predictive-analytics", "loyalty-programs", "sales-analytics"]
  ),
  "data-warehouse": createFeature(
    "data-warehouse",
    "Data Warehouse",
    "Centralized data repository",
    "analytics",
    "Centralize data from multiple sources in a unified data warehouse. Enable comprehensive analytics and reporting across the enterprise.",
    ["Data integration", "ETL pipelines", "Data modeling", "Query performance", "Security", "Lineage", "Metadata", "Governance"],
    ["Single source of truth", "Cross-system analytics", "Data quality", "Performance", "Governance"],
    ["Enterprise analytics", "Data consolidation", "Reporting", "Machine learning", "Compliance"],
    ["data-explorer", "report-builder", "integration-hub", "data-governance"]
  ),
  "export-manager": createFeature(
    "export-manager",
    "Export Manager",
    "Report export and scheduling",
    "analytics",
    "Export reports and data in multiple formats with scheduling and distribution options. Automate report delivery to stakeholders.",
    ["Multiple formats", "Scheduling", "Distribution lists", "Email delivery", "FTP delivery", "Compression", "Encryption", "Audit trail"],
    ["Automated delivery", "Time savings", "Consistent reporting", "Stakeholder access", "Compliance"],
    ["Report distribution", "Data exports", "Compliance reporting", "Stakeholder updates", "Archival"],
    ["report-builder", "scheduled-reports", "dashboard-builder", "data-explorer"]
  ),
  "scheduled-reports": createFeature(
    "scheduled-reports",
    "Scheduled Reports",
    "Automated report delivery",
    "analytics",
    "Schedule reports for automatic generation and delivery. Ensure stakeholders receive timely information without manual effort.",
    ["Schedule configuration", "Recurrence options", "Conditional delivery", "Multiple formats", "Distribution lists", "Failure handling", "History", "Preview"],
    ["Timely information", "No manual effort", "Consistent delivery", "Stakeholder satisfaction", "Time savings"],
    ["Management reports", "Compliance reports", "Performance updates", "Executive briefings", "Customer reports"],
    ["report-builder", "export-manager", "dashboard-builder", "kpi-dashboard"]
  ),
  "growth-metrics": createFeature(
    "growth-metrics",
    "Growth Metrics",
    "Business growth tracking",
    "analytics",
    "Track and analyze business growth metrics including revenue growth, customer acquisition, and market expansion. Monitor the health and trajectory of your business.",
    ["Revenue growth", "Customer metrics", "Market share", "Cohort analysis", "CAC/LTV", "Retention metrics", "Growth rates", "Benchmarking"],
    ["Growth visibility", "Investor readiness", "Strategic planning", "Performance tracking", "Market positioning"],
    ["SaaS metrics", "E-commerce growth", "Market expansion", "Investment reporting", "Strategic planning"],
    ["kpi-dashboard", "revenue-forecasting", "sales-analytics", "churn-risk-analysis"]
  ),

  "copilot": createFeature(
    "copilot",
    "AI Copilot",
    "Conversational AI assistant",
    "ai",
    "Your AI-powered assistant that understands your business context and provides intelligent help across all applications. Ask questions, automate tasks, and get insights.",
    ["Natural language", "Context awareness", "Multi-domain", "Task automation", "Recommendations", "Learning", "Personalization", "Integration"],
    ["Productivity boost", "Quick answers", "Task automation", "Insights", "Reduced training"],
    ["Daily assistance", "Data queries", "Task automation", "Report generation", "Guidance"],
    ["ai-chat", "ai-assistant", "semantic-search", "recommendation-engine"]
  ),
  "ai-chat": createFeature(
    "ai-chat",
    "AI Chat",
    "Natural language queries",
    "ai",
    "Chat with your data using natural language. Ask questions and get instant answers without writing queries or building reports.",
    ["Natural language", "Data access", "Visualizations", "Follow-up questions", "Explanations", "Sharing", "History", "Multi-domain"],
    ["No technical skills needed", "Instant answers", "Data access", "Productivity", "Democratization"],
    ["Ad-hoc queries", "Quick analysis", "Data exploration", "Meeting prep", "Research"],
    ["copilot", "data-explorer", "semantic-search", "dashboard-builder"]
  ),
  "ai-assistant": createFeature(
    "ai-assistant",
    "AI Assistant",
    "Context-aware help",
    "ai",
    "Get context-aware help wherever you are in the application. The AI assistant understands what you're doing and provides relevant suggestions.",
    ["Context awareness", "Suggestions", "Field assistance", "Validation", "Next steps", "Best practices", "Error help", "Learning"],
    ["Guided experience", "Error prevention", "Best practices", "Training reduction", "Productivity"],
    ["Form completion", "Process guidance", "Error resolution", "Feature discovery", "Training"],
    ["copilot", "ai-chat", "knowledge-base", "workflow-designer"]
  ),
  "semantic-search": createFeature(
    "semantic-search",
    "Semantic Search",
    "Intelligent content search",
    "ai",
    "Search across all content using natural language with semantic understanding. Find what you need even when you don't know the exact keywords.",
    ["Natural language search", "Semantic understanding", "Cross-domain", "Relevance ranking", "Filters", "Suggestions", "History", "Previews"],
    ["Find anything", "No exact keywords needed", "Time savings", "Discovery", "Productivity"],
    ["Enterprise search", "Knowledge discovery", "Research", "Support", "Onboarding"],
    ["knowledge-base", "data-explorer", "ai-chat", "document-processing"]
  ),
  "document-processing": createFeature(
    "document-processing",
    "Document Processing",
    "AI document extraction",
    "ai",
    "Extract data from documents automatically using AI. Process invoices, contracts, forms, and other documents without manual data entry.",
    ["OCR", "Data extraction", "Classification", "Validation", "Templates", "Learning", "Integration", "Audit trail"],
    ["Eliminate manual entry", "Accuracy", "Speed", "Cost reduction", "Scalability"],
    ["Invoice processing", "Contract analysis", "Form processing", "Mail processing", "Compliance"],
    ["ap-invoices", "contract-management", "workflow-designer", "integration-hub"]
  ),
  "predictive-modeling": createFeature(
    "predictive-modeling",
    "Predictive Modeling",
    "Custom ML models",
    "ai",
    "Build and deploy custom machine learning models without data science expertise. Use AutoML to create predictions tailored to your business.",
    ["AutoML", "Model building", "Training", "Deployment", "Monitoring", "Explainability", "Versioning", "Integration"],
    ["Custom predictions", "No data science needed", "Business-specific", "Continuous improvement", "Actionable insights"],
    ["Custom predictions", "Risk scoring", "Optimization", "Classification", "Forecasting"],
    ["predictive-analytics", "revenue-forecasting", "churn-risk-analysis", "recommendation-engine"]
  ),
  "recommendation-engine": createFeature(
    "recommendation-engine",
    "Recommendation Engine",
    "Personalized suggestions",
    "ai",
    "Deliver personalized recommendations to users based on behavior, preferences, and context. Improve engagement and conversion with AI-powered suggestions.",
    ["Personalization", "Collaborative filtering", "Content-based", "Real-time", "A/B testing", "Rules", "Analytics", "Integration"],
    ["Higher engagement", "Increased conversion", "Personalization", "Customer satisfaction", "Revenue growth"],
    ["Product recommendations", "Content suggestions", "Next best action", "Cross-sell/upsell", "Search personalization"],
    ["predictive-modeling", "customer-journey-map", "product-catalog", "copilot"]
  ),
  "cognitive-services": createFeature(
    "cognitive-services",
    "Cognitive Services",
    "Vision and language AI",
    "ai",
    "Access pre-built AI capabilities for vision, language, and speech. Integrate intelligent features into your workflows without building models.",
    ["Image analysis", "Text extraction", "Sentiment analysis", "Translation", "Speech-to-text", "Text-to-speech", "Entity recognition", "Key phrase extraction"],
    ["Ready-to-use AI", "No training needed", "Quick integration", "Multiple capabilities", "Scalability"],
    ["Document processing", "Content moderation", "Customer feedback", "Accessibility", "Multilingual"],
    ["document-processing", "semantic-search", "ai-assistant", "integration-hub"]
  ),
  "ai-automation": createFeature(
    "ai-automation",
    "AI Automation",
    "Intelligent process automation",
    "ai",
    "Automate complex processes with AI that can understand, decide, and act. Combine rule-based automation with intelligent decision-making.",
    ["Intelligent routing", "Decision automation", "Exception handling", "Learning", "Process optimization", "Human-in-the-loop", "Monitoring", "Analytics"],
    ["End-to-end automation", "Intelligent decisions", "Continuous improvement", "Efficiency", "Scalability"],
    ["Process automation", "Intelligent routing", "Exception handling", "Decision support", "Optimization"],
    ["workflow-designer", "automation-rules", "document-processing", "copilot"]
  ),

  "workflow-designer": createFeature(
    "workflow-designer",
    "Workflow Designer",
    "Visual workflow builder",
    "workflow",
    "Design business processes visually with drag-and-drop workflow builder. Create complex automations without coding.",
    ["Visual designer", "Drag-and-drop", "Conditions", "Loops", "Parallel paths", "Error handling", "Variables", "Testing"],
    ["No coding required", "Visual clarity", "Rapid development", "Business user friendly", "Complex logic"],
    ["Business process automation", "Approval workflows", "Integration flows", "Notifications", "Data processing"],
    ["workflow-builder", "automation-rules", "approval-workflow", "event-triggers"]
  ),
  "workflow-builder": createFeature(
    "workflow-builder",
    "Workflow Builder",
    "Drag-and-drop automation",
    "workflow",
    "Build automated workflows with an intuitive drag-and-drop interface. Connect actions, conditions, and triggers to automate any process.",
    ["Drag-and-drop", "Action library", "Conditions", "Triggers", "Variables", "Templates", "Testing", "Versioning"],
    ["Easy automation", "Quick setup", "Reusable templates", "No technical skills", "Flexibility"],
    ["Task automation", "Notifications", "Data sync", "Approvals", "Integration"],
    ["workflow-designer", "workflow-templates", "automation-rules", "integration-hub"]
  ),
  "workflow-templates": createFeature(
    "workflow-templates",
    "Workflow Templates",
    "Pre-built workflow templates",
    "workflow",
    "Get started quickly with pre-built workflow templates for common business processes. Customize templates to match your specific needs.",
    ["Template library", "Categories", "Customization", "Preview", "One-click deploy", "Best practices", "Updates", "Sharing"],
    ["Quick start", "Best practices", "Time savings", "Proven patterns", "Easy customization"],
    ["Approval workflows", "Onboarding", "Quote-to-cash", "Lead nurturing", "Support escalation"],
    ["workflow-builder", "workflow-designer", "automation-rules", "workflow-execution"]
  ),
  "workflow-execution": createFeature(
    "workflow-execution",
    "Workflow Execution",
    "Run and monitor workflows",
    "workflow",
    "Execute workflows and monitor their progress in real-time. Track instances, handle exceptions, and analyze performance.",
    ["Instance tracking", "Real-time status", "Exception handling", "Manual intervention", "Restart/retry", "Performance metrics", "History", "Debugging"],
    ["Visibility", "Control", "Exception handling", "Performance insights", "Troubleshooting"],
    ["Process monitoring", "Exception management", "Performance tracking", "Troubleshooting", "Auditing"],
    ["workflow-monitoring", "workflow-builder", "workflow-designer", "automation-rules"]
  ),
  "approval-workflow": createFeature(
    "approval-workflow",
    "Approval Workflow",
    "Multi-level approvals",
    "workflow",
    "Configure and manage approval processes with multi-level approvals, delegation, and escalation. Ensure proper authorization for business decisions.",
    ["Multi-level approvals", "Parallel/sequential", "Delegation", "Escalation", "Mobile approval", "Audit trail", "Reminders", "Substitutes"],
    ["Proper authorization", "Faster approvals", "Accountability", "Flexibility", "Compliance"],
    ["Expense approvals", "Purchase approvals", "Leave requests", "Discount approvals", "Contract approvals"],
    ["workflow-designer", "expense-tracking", "purchase-order", "quote-builder"]
  ),
  "automation-rules": createFeature(
    "automation-rules",
    "Automation Rules",
    "Event-triggered actions",
    "workflow",
    "Define rules that automatically trigger actions based on events or conditions. Automate routine tasks and ensure consistency.",
    ["Rule configuration", "Conditions", "Actions", "Scheduling", "Chaining", "Testing", "Monitoring", "History"],
    ["Consistency", "Time savings", "Error reduction", "Scalability", "Real-time response"],
    ["Lead assignment", "Notifications", "Field updates", "Escalations", "Data validation"],
    ["event-triggers", "workflow-builder", "workflow-designer", "ai-automation"]
  ),
  "event-triggers": createFeature(
    "event-triggers",
    "Event Triggers",
    "Webhook and event handling",
    "workflow",
    "Configure event triggers from internal and external sources. Respond to webhooks, schedules, and system events.",
    ["Webhook handling", "Internal events", "Schedules", "Polling", "Filtering", "Transformation", "Retry logic", "Monitoring"],
    ["Real-time response", "External integration", "Flexibility", "Automation", "Scalability"],
    ["External integrations", "Real-time sync", "Notifications", "Process triggers", "Monitoring"],
    ["automation-rules", "workflow-builder", "webhook-management", "integration-hub"]
  ),
  "workflow-monitoring": createFeature(
    "workflow-monitoring",
    "Workflow Monitoring",
    "Execution tracking",
    "workflow",
    "Monitor all workflow executions with dashboards, alerts, and detailed logs. Identify issues quickly and optimize performance.",
    ["Dashboard", "Alerts", "Logs", "Performance metrics", "Error tracking", "SLA monitoring", "Trend analysis", "Reports"],
    ["Visibility", "Quick issue detection", "Performance optimization", "SLA compliance", "Troubleshooting"],
    ["Operations monitoring", "SLA management", "Performance optimization", "Troubleshooting", "Capacity planning"],
    ["workflow-execution", "workflow-builder", "dashboard-builder", "automation-rules"]
  ),
  "custom-workflows": createFeature(
    "custom-workflows",
    "Custom Workflows",
    "Tailored process automation",
    "workflow",
    "Build custom workflows tailored to your unique business processes. Combine standard components with custom logic for complete flexibility.",
    ["Custom components", "Scripting", "API integration", "Custom UI", "Variables", "Error handling", "Testing", "Versioning"],
    ["Complete flexibility", "Business-specific", "Complex logic", "Integration", "Extensibility"],
    ["Unique processes", "Legacy integration", "Complex rules", "Custom validation", "Hybrid automation"],
    ["workflow-designer", "workflow-builder", "api-gateway", "backend-integration"]
  ),
  "bpm": createFeature(
    "bpm",
    "BPM Engine",
    "Business process management",
    "workflow",
    "Enterprise-grade business process management with BPMN support, process modeling, and governance. Manage the complete process lifecycle.",
    ["BPMN support", "Process modeling", "Simulation", "Governance", "Version control", "Process mining", "KPIs", "Compliance"],
    ["Enterprise BPM", "Process governance", "Optimization", "Compliance", "Standardization"],
    ["Enterprise processes", "Compliance workflows", "Complex processes", "Process improvement", "Governance"],
    ["workflow-designer", "workflow-monitoring", "compliance-monitoring", "workflow-execution"]
  ),

  "integration-hub": createFeature(
    "integration-hub",
    "Integration Hub",
    "Centralized integration management",
    "integration",
    "Manage all integrations from a centralized hub. Monitor connections, configure mappings, and troubleshoot issues.",
    ["Connection management", "Mapping tools", "Monitoring", "Error handling", "Logging", "Testing", "Templates", "Documentation"],
    ["Centralized management", "Visibility", "Quick troubleshooting", "Standardization", "Control"],
    ["Integration management", "Connection monitoring", "Error resolution", "Mapping maintenance", "Onboarding"],
    ["api-gateway", "webhook-management", "integration-status", "data-import"]
  ),
  "api-gateway": createFeature(
    "api-gateway",
    "API Gateway",
    "API management and security",
    "integration",
    "Secure and manage APIs with the API gateway. Handle authentication, rate limiting, and traffic management.",
    ["Authentication", "Rate limiting", "Traffic management", "Caching", "Transformation", "Monitoring", "Analytics", "Documentation"],
    ["API security", "Performance", "Control", "Visibility", "Developer experience"],
    ["API security", "External APIs", "Partner APIs", "Microservices", "Mobile backend"],
    ["api-management", "rate-limiting", "api-logs", "security-settings"]
  ),
  "api-management": createFeature(
    "api-management",
    "API Management",
    "API versioning and documentation",
    "integration",
    "Manage API lifecycle with versioning, documentation, and developer portal. Support internal and external API consumers.",
    ["Versioning", "Documentation", "Developer portal", "API keys", "Usage analytics", "Testing", "Sandbox", "Support"],
    ["Developer experience", "API governance", "Version control", "Documentation", "Adoption"],
    ["API publishing", "Developer onboarding", "Version management", "Documentation", "Partner APIs"],
    ["api-gateway", "api-logs", "webhook-management", "integration-hub"]
  ),
  "webhook-management": createFeature(
    "webhook-management",
    "Webhook Management",
    "Outbound event notifications",
    "integration",
    "Configure and manage outbound webhooks to notify external systems of events. Support retry logic and delivery tracking.",
    ["Webhook configuration", "Event selection", "Retry logic", "Delivery tracking", "Security", "Filtering", "Templates", "Testing"],
    ["Real-time notifications", "Reliable delivery", "Flexibility", "Monitoring", "Integration"],
    ["External notifications", "Third-party integrations", "Real-time sync", "Partner systems", "Automation triggers"],
    ["event-triggers", "integration-hub", "api-gateway", "automation-rules"]
  ),
  "api-logs": createFeature(
    "api-logs",
    "API Logs",
    "API usage monitoring",
    "integration",
    "Monitor API usage with detailed logs, analytics, and alerting. Track performance, errors, and usage patterns.",
    ["Request logging", "Response logging", "Error tracking", "Performance metrics", "Usage analytics", "Alerting", "Search", "Export"],
    ["Visibility", "Troubleshooting", "Performance monitoring", "Security", "Usage tracking"],
    ["API monitoring", "Debugging", "Security auditing", "Performance optimization", "Usage analysis"],
    ["api-gateway", "api-management", "dashboard-builder", "security-settings"]
  ),
  "rate-limiting": createFeature(
    "rate-limiting",
    "Rate Limiting",
    "API throttling controls",
    "integration",
    "Protect APIs with rate limiting and throttling controls. Ensure fair usage and protect against abuse.",
    ["Rate limits", "Throttling", "Quotas", "Tiers", "Custom rules", "Monitoring", "Alerts", "Override options"],
    ["Protection", "Fair usage", "Performance", "Cost control", "Stability"],
    ["API protection", "Cost management", "Fair usage", "DDoS protection", "Resource management"],
    ["api-gateway", "api-management", "security-settings", "api-logs"]
  ),
  "app-store": createFeature(
    "app-store",
    "App Store",
    "Pre-built app marketplace",
    "integration",
    "Browse and install pre-built integrations and apps from the marketplace. Extend functionality without development.",
    ["App catalog", "Categories", "Reviews", "One-click install", "Configuration", "Updates", "Support", "Uninstall"],
    ["Quick extension", "No development", "Tested integrations", "Easy updates", "Community"],
    ["Adding integrations", "Extending functionality", "Third-party apps", "Partner solutions", "Templates"],
    ["installed-apps", "integration-hub", "workflow-templates", "api-gateway"]
  ),
  "installed-apps": createFeature(
    "installed-apps",
    "Installed Apps",
    "Manage connected apps",
    "integration",
    "Manage installed apps and integrations. Configure settings, monitor status, and control access.",
    ["App management", "Configuration", "Status monitoring", "Access control", "Updates", "Logs", "Troubleshooting", "Removal"],
    ["Control", "Visibility", "Configuration", "Troubleshooting", "Security"],
    ["App management", "Integration maintenance", "Access control", "Troubleshooting", "Updates"],
    ["app-store", "integration-hub", "integration-status", "security-settings"]
  ),
  "edi-marketplace-connectors": createFeature(
    "edi-marketplace-connectors",
    "EDI Connectors",
    "B2B integration",
    "integration",
    "Connect with trading partners using EDI standards. Support for various EDI formats and transmission methods.",
    ["EDI standards", "Partner management", "Mapping", "Validation", "Transmission", "Acknowledgments", "Error handling", "Monitoring"],
    ["B2B connectivity", "Partner compliance", "Automation", "Accuracy", "Efficiency"],
    ["Supplier integration", "Customer integration", "Retail EDI", "Logistics EDI", "Healthcare EDI"],
    ["integration-hub", "purchase-order", "sales-order-management", "trade-compliance-dashboard"]
  ),
  "data-import": createFeature(
    "data-import",
    "Data Import/Export",
    "Bulk data operations",
    "integration",
    "Import and export data in bulk with mapping, validation, and scheduling. Support for various file formats and sources.",
    ["File import", "File export", "Mapping", "Validation", "Scheduling", "Templates", "Error handling", "History"],
    ["Bulk operations", "Data migration", "Integration", "Reporting", "Backup"],
    ["Data migration", "Bulk updates", "Reporting", "Integration", "Archival"],
    ["integration-hub", "data-warehouse", "export-manager", "workflow-builder"]
  ),

  "user-management": createFeature(
    "user-management",
    "User Management",
    "User accounts and profiles",
    "admin",
    "Manage user accounts, profiles, and access. Handle user lifecycle from creation to deactivation.",
    ["User creation", "Profile management", "Password management", "Account status", "Self-service", "Bulk operations", "Import/export", "Audit"],
    ["User control", "Self-service", "Lifecycle management", "Compliance", "Efficiency"],
    ["User administration", "Onboarding", "Offboarding", "Profile updates", "Access requests"],
    ["role-management", "permission-matrix", "session-management", "mfa-enrollment"]
  ),
  "role-management": createFeature(
    "role-management",
    "Role Management",
    "Role-based access control",
    "admin",
    "Define and manage roles with associated permissions. Implement role-based access control for security and compliance.",
    ["Role definition", "Permission assignment", "Role hierarchy", "Role templates", "User assignment", "Audit", "Analysis", "Import/export"],
    ["Access control", "Compliance", "Consistency", "Efficiency", "Governance"],
    ["Access control", "Compliance", "Onboarding", "Reorganization", "Audit"],
    ["user-management", "permission-matrix", "role-hierarchy", "sod-rules"]
  ),
  "permission-matrix": createFeature(
    "permission-matrix",
    "Permission Matrix",
    "Granular permissions",
    "admin",
    "Configure granular permissions with a visual matrix. Define access to features, data, and actions at a detailed level.",
    ["Permission configuration", "Visual matrix", "Role permissions", "Object permissions", "Field-level security", "Action permissions", "Analysis", "Export"],
    ["Granular control", "Visibility", "Compliance", "Flexibility", "Security"],
    ["Access configuration", "Security review", "Compliance audit", "Permission analysis", "Troubleshooting"],
    ["role-management", "user-management", "sod-rules", "security-settings"]
  ),
  "session-management": createFeature(
    "session-management",
    "Session Management",
    "Active session control",
    "admin",
    "Monitor and manage active user sessions. Control session duration, concurrent sessions, and force logout when needed.",
    ["Session monitoring", "Session limits", "Concurrent sessions", "Force logout", "Session timeout", "Device tracking", "Geo-location", "Alerts"],
    ["Security control", "Visibility", "Compliance", "Incident response", "User protection"],
    ["Security monitoring", "Incident response", "Policy enforcement", "User support", "Compliance"],
    ["login-history", "security-settings", "user-management", "device-management"]
  ),
  "security-settings": createFeature(
    "security-settings",
    "Security Settings",
    "Security configuration",
    "admin",
    "Configure security settings for the platform including authentication, encryption, and access controls.",
    ["Authentication settings", "Password policies", "Encryption", "Session settings", "IP restrictions", "Security headers", "Audit settings", "Compliance"],
    ["Security control", "Compliance", "Protection", "Configuration", "Governance"],
    ["Security configuration", "Compliance", "Hardening", "Policy enforcement", "Audit preparation"],
    ["password-policies", "mfa-enrollment", "session-management", "compliance-monitoring"]
  ),
  "mfa-enrollment": createFeature(
    "mfa-enrollment",
    "MFA Enrollment",
    "Multi-factor authentication",
    "admin",
    "Enable and manage multi-factor authentication for enhanced security. Support multiple MFA methods and user enrollment.",
    ["MFA methods", "User enrollment", "Enforcement", "Recovery", "Device management", "Reporting", "Bypass options", "Integration"],
    ["Enhanced security", "Compliance", "User protection", "Flexibility", "Control"],
    ["Security enhancement", "Compliance", "User onboarding", "Policy enforcement", "Incident prevention"],
    ["user-management", "security-settings", "password-policies", "login-history"]
  ),
  "password-policies": createFeature(
    "password-policies",
    "Password Policies",
    "Password requirements",
    "admin",
    "Configure password policies including complexity, expiration, and history requirements. Ensure strong authentication.",
    ["Complexity rules", "Expiration", "History", "Lockout", "Recovery", "Enforcement", "Reporting", "Compliance"],
    ["Strong passwords", "Compliance", "Security", "User guidance", "Control"],
    ["Security policy", "Compliance", "User management", "Risk reduction", "Audit preparation"],
    ["security-settings", "mfa-enrollment", "user-management", "compliance-monitoring"]
  ),
  "login-history": createFeature(
    "login-history",
    "Login History",
    "Authentication audit trail",
    "admin",
    "Track and analyze login history with detailed records of authentication attempts. Support security investigations and compliance.",
    ["Login records", "Failed attempts", "Location tracking", "Device tracking", "Analysis", "Alerts", "Export", "Retention"],
    ["Audit trail", "Security visibility", "Incident investigation", "Compliance", "Pattern detection"],
    ["Security auditing", "Incident investigation", "Compliance", "User support", "Pattern analysis"],
    ["session-management", "security-settings", "audit-logs", "security-event-log"]
  ),
  "audit-logs": createFeature(
    "audit-logs",
    "Audit Logs",
    "System audit trail",
    "admin",
    "Comprehensive audit logging of system activities. Track who did what, when, and where for security and compliance.",
    ["Activity logging", "User tracking", "Change tracking", "Search", "Filtering", "Export", "Retention", "Compliance reports"],
    ["Complete audit trail", "Compliance", "Investigations", "Accountability", "Transparency"],
    ["Compliance auditing", "Security investigation", "Change tracking", "Forensics", "Reporting"],
    ["login-history", "security-event-log", "compliance-monitoring", "data-governance"]
  ),
  "compliance-monitoring": createFeature(
    "compliance-monitoring",
    "Compliance Monitoring",
    "Regulatory compliance",
    "admin",
    "Monitor compliance with policies, regulations, and standards. Track violations and ensure corrective actions.",
    ["Policy monitoring", "Violation detection", "Risk scoring", "Reporting", "Alerts", "Remediation tracking", "Audit support", "Dashboard"],
    ["Compliance assurance", "Risk visibility", "Proactive monitoring", "Audit readiness", "Governance"],
    ["Regulatory compliance", "Policy enforcement", "Risk management", "Audit preparation", "Reporting"],
    ["compliance-dashboard", "audit-management", "sod-rules", "security-settings"]
  ),
  "device-management": createFeature(
    "device-management",
    "Device Management",
    "Authorized devices",
    "admin",
    "Manage authorized devices for user access. Track device enrollment, enforce policies, and revoke access when needed.",
    ["Device enrollment", "Device tracking", "Policy enforcement", "Revocation", "Compliance", "Reporting", "Alerts", "Self-service"],
    ["Device control", "Security", "Compliance", "Visibility", "User flexibility"],
    ["BYOD management", "Corporate devices", "Security policy", "Access control", "Compliance"],
    ["session-management", "mfa-enrollment", "security-settings", "login-history"]
  ),
  "system-settings": createFeature(
    "system-settings",
    "System Settings",
    "Global configuration",
    "admin",
    "Configure global system settings for the platform. Manage branding, localization, features, and integrations.",
    ["General settings", "Branding", "Localization", "Feature toggles", "Defaults", "Notifications", "Integrations", "Maintenance"],
    ["Customization", "Control", "Flexibility", "Branding", "Administration"],
    ["Platform configuration", "Branding", "Localization", "Feature management", "Maintenance"],
    ["tenant-admin", "security-settings", "notification-center", "integration-hub"]
  ),
  "tenant-admin": createFeature(
    "tenant-admin",
    "Tenant Admin",
    "Multi-tenant management",
    "admin",
    "Manage multiple tenants in a multi-tenant environment. Configure tenant-specific settings and monitor tenant health.",
    ["Tenant management", "Configuration", "Provisioning", "Monitoring", "Isolation", "Billing", "Support", "Migration"],
    ["Multi-tenant control", "Isolation", "Scalability", "Administration", "Monetization"],
    ["SaaS management", "Client isolation", "Tenant provisioning", "Configuration", "Billing"],
    ["system-settings", "user-management", "billing-management", "multi-tenancy"]
  ),
  "data-governance": createFeature(
    "data-governance",
    "Data Governance",
    "Data quality and retention",
    "admin",
    "Implement data governance with quality rules, retention policies, and data lifecycle management. Ensure data integrity and compliance.",
    ["Quality rules", "Retention policies", "Data lifecycle", "Classification", "Lineage", "Stewardship", "Compliance", "Reporting"],
    ["Data quality", "Compliance", "Governance", "Efficiency", "Risk reduction"],
    ["Data quality", "Compliance", "Retention", "Privacy", "Master data"],
    ["audit-logs", "compliance-monitoring", "data-warehouse", "security-settings"]
  ),

  "marketing": createFeature(
    "marketing",
    "Marketing Dashboard",
    "Campaign overview",
    "marketing",
    "Get a complete overview of all marketing activities with performance metrics, campaign status, and ROI tracking.",
    ["Campaign overview", "Performance metrics", "ROI tracking", "Channel analysis", "Lead metrics", "Budget tracking", "Timeline", "Comparisons"],
    ["Marketing visibility", "Performance insights", "ROI tracking", "Planning", "Alignment"],
    ["Marketing management", "Performance review", "Planning", "Reporting", "Optimization"],
    ["marketing-campaigns", "marketing-engagement", "campaigns-dashboard", "lead-scoring"]
  ),
  "marketing-campaigns": createFeature(
    "marketing-campaigns",
    "Campaign Management",
    "Multi-channel campaigns",
    "marketing",
    "Plan and execute multi-channel marketing campaigns with targeting, scheduling, and performance tracking.",
    ["Campaign planning", "Multi-channel", "Audience targeting", "Scheduling", "A/B testing", "Performance tracking", "Budget management", "Collaboration"],
    ["Coordinated campaigns", "Channel optimization", "Targeting", "Performance visibility", "Efficiency"],
    ["Product launches", "Demand generation", "Brand campaigns", "Event marketing", "Seasonal campaigns"],
    ["email", "marketing-engagement", "customer-profiles", "lead-scoring"]
  ),
  "email": createFeature(
    "email",
    "Email Marketing",
    "Email campaign builder",
    "marketing",
    "Create and send email campaigns with a powerful drag-and-drop builder. Track opens, clicks, and conversions.",
    ["Email builder", "Templates", "Personalization", "A/B testing", "Scheduling", "Tracking", "Automation", "Compliance"],
    ["Professional emails", "Higher engagement", "Personalization", "Performance insights", "Compliance"],
    ["Newsletter", "Promotional emails", "Nurture campaigns", "Transactional emails", "Re-engagement"],
    ["marketing-campaigns", "customer-profiles", "automation-rules", "marketing-engagement"]
  ),
  "digital-retail-leads": createFeature(
    "digital-retail-leads",
    "Lead Generation",
    "Landing pages and forms",
    "marketing",
    "Create landing pages and forms to capture leads. Optimize conversion with A/B testing and personalization.",
    ["Landing page builder", "Form builder", "A/B testing", "Personalization", "Lead capture", "Thank you pages", "Integration", "Analytics"],
    ["More leads", "Higher conversion", "Professional pages", "Testing", "Optimization"],
    ["Lead capture", "Event registration", "Content downloads", "Demo requests", "Webinar signup"],
    ["lead-scoring", "marketing-campaigns", "email", "customer-profiles"]
  ),
  "marketing-engagement": createFeature(
    "marketing-engagement",
    "Marketing Analytics",
    "Campaign performance",
    "marketing",
    "Analyze marketing performance with comprehensive analytics. Track attribution, engagement, and ROI across channels.",
    ["Channel analytics", "Attribution", "Engagement metrics", "ROI analysis", "Funnel analysis", "Cohort analysis", "Comparisons", "Custom reports"],
    ["Performance visibility", "Attribution clarity", "ROI understanding", "Optimization insights", "Data-driven decisions"],
    ["Performance analysis", "Attribution", "Channel optimization", "Budget allocation", "Reporting"],
    ["marketing-campaigns", "marketing", "dashboard-builder", "sales-analytics"]
  ),
  "content-management": createFeature(
    "content-management",
    "Content Management",
    "Marketing content hub",
    "marketing",
    "Manage marketing content in a centralized hub. Organize, version, and distribute content across channels.",
    ["Content library", "Organization", "Versioning", "Approval workflows", "Distribution", "Search", "Analytics", "Collaboration"],
    ["Content organization", "Consistency", "Efficiency", "Governance", "Reuse"],
    ["Marketing assets", "Brand content", "Sales collateral", "Digital assets", "Templates"],
    ["marketing-campaigns", "email", "knowledge-base", "workflow-designer"]
  ),
  "communication-center": createFeature(
    "communication-center",
    "Social Media",
    "Social channel management",
    "marketing",
    "Manage social media presence with scheduling, publishing, and engagement tracking across channels.",
    ["Multi-channel", "Scheduling", "Publishing", "Engagement", "Listening", "Analytics", "Content calendar", "Team collaboration"],
    ["Social presence", "Engagement", "Efficiency", "Consistency", "Insights"],
    ["Social publishing", "Community management", "Social listening", "Campaign amplification", "Influencer engagement"],
    ["marketing-campaigns", "marketing-engagement", "content-management", "customer-profiles"]
  ),
  "customer-profiles": createFeature(
    "customer-profiles",
    "Segmentation",
    "Audience segmentation",
    "marketing",
    "Create and manage audience segments for targeted marketing. Build segments based on demographics, behavior, and preferences.",
    ["Segment creation", "Dynamic segments", "Behavioral segmentation", "Demographics", "Preferences", "Lookalike audiences", "Export", "Integration"],
    ["Targeted marketing", "Personalization", "Relevance", "Efficiency", "Higher conversion"],
    ["Campaign targeting", "Personalization", "Analysis", "A/B testing", "Reporting"],
    ["marketing-campaigns", "email", "recommendation-engine", "predictive-analytics"]
  ),

  "product-catalog": createFeature(
    "product-catalog",
    "Product Catalog",
    "Product information management",
    "ecommerce",
    "Manage product information with rich content, variants, and relationships. Centralize product data for all channels.",
    ["Product information", "Variants", "Categories", "Attributes", "Rich media", "Relationships", "Bulk operations", "Publishing"],
    ["Centralized product data", "Consistent information", "Rich content", "Multi-channel", "Efficiency"],
    ["Product management", "E-commerce", "Catalog publishing", "Channel syndication", "Product launches"],
    ["pricing-promo-engine", "inventory-dashboard", "sales-order-management", "product-reviews-ratings"]
  ),
  "point-of-sale": createFeature(
    "point-of-sale",
    "Point of Sale",
    "POS terminal operations",
    "ecommerce",
    "Process sales transactions with a modern POS system. Support multiple payment methods, returns, and customer management.",
    ["Sales transactions", "Payment processing", "Returns/exchanges", "Customer lookup", "Discounts", "Receipt printing", "Cash management", "Reporting"],
    ["Fast checkout", "Multiple payments", "Customer service", "Accuracy", "Reporting"],
    ["Retail sales", "Quick service", "Pop-up stores", "Events", "Showrooms"],
    ["shopping-cart-checkout", "inventory-dashboard", "pricing-promo-engine", "loyalty-programs"]
  ),
  "shopping-cart-checkout": createFeature(
    "shopping-cart-checkout",
    "Shopping Cart",
    "Cart and checkout",
    "ecommerce",
    "Provide a seamless shopping cart and checkout experience. Support guest checkout, saved carts, and multiple payment options.",
    ["Cart management", "Checkout flow", "Guest checkout", "Saved carts", "Payment options", "Shipping options", "Tax calculation", "Order confirmation"],
    ["Smooth checkout", "Higher conversion", "Flexibility", "Customer satisfaction", "Reduced abandonment"],
    ["E-commerce checkout", "Subscription purchase", "B2B ordering", "Mobile commerce", "International"],
    ["product-catalog", "pricing-promo-engine", "order-fulfillment", "loyalty-programs"]
  ),
  "sales-order-management": createFeature(
    "sales-order-management",
    "Order Management",
    "Order processing",
    "ecommerce",
    "Manage the complete order lifecycle from capture through fulfillment. Support complex orders with multiple shipments and billing.",
    ["Order capture", "Order processing", "Fulfillment", "Status tracking", "Returns", "Billing", "Customer communication", "History"],
    ["Order visibility", "Efficient processing", "Customer satisfaction", "Accuracy", "Scalability"],
    ["Order processing", "E-commerce orders", "B2B orders", "Subscription orders", "Complex orders"],
    ["order-fulfillment", "inventory-dashboard", "ar-invoices", "omnichannel-orders"]
  ),
  "pricing-promo-engine": createFeature(
    "pricing-promo-engine",
    "Pricing Engine",
    "Dynamic pricing rules",
    "ecommerce",
    "Configure dynamic pricing with rules, tiers, and promotions. Support complex pricing scenarios and real-time price calculation.",
    ["Pricing rules", "Tier pricing", "Volume discounts", "Customer-specific", "Time-based", "Bundle pricing", "Promotional pricing", "Price lists"],
    ["Pricing flexibility", "Competitive pricing", "Margin protection", "Promotional support", "Customer segmentation"],
    ["Dynamic pricing", "B2B pricing", "Promotional pricing", "Bundle pricing", "Competitive pricing"],
    ["product-catalog", "pricing-promotions", "quote-builder", "sales-order-management"]
  ),
  "pricing-promotions": createFeature(
    "pricing-promotions",
    "Promotions",
    "Discounts and campaigns",
    "ecommerce",
    "Create and manage promotional campaigns with discounts, coupons, and special offers. Track promotion performance and ROI.",
    ["Promotion creation", "Discount types", "Coupons", "Eligibility rules", "Stacking rules", "Scheduling", "Tracking", "Analytics"],
    ["Sales lift", "Customer acquisition", "Inventory movement", "Competitive response", "Performance tracking"],
    ["Sales promotions", "Seasonal campaigns", "Clearance", "Customer acquisition", "Loyalty rewards"],
    ["pricing-promo-engine", "marketing-campaigns", "loyalty-programs", "product-catalog"]
  ),
  "product-reviews-ratings": createFeature(
    "product-reviews-ratings",
    "Product Reviews",
    "Customer reviews",
    "ecommerce",
    "Collect and display customer reviews and ratings. Moderate content and respond to feedback.",
    ["Review collection", "Rating display", "Moderation", "Response management", "Incentives", "Syndication", "Analytics", "SEO"],
    ["Social proof", "Customer feedback", "Product insights", "SEO benefits", "Trust"],
    ["E-commerce reviews", "Feedback collection", "Product improvement", "Customer engagement", "Content generation"],
    ["product-catalog", "customer-portal", "marketing-engagement", "recommendation-engine"]
  ),
  "omnichannel-orders": createFeature(
    "omnichannel-orders",
    "Omnichannel Orders",
    "Unified order management",
    "ecommerce",
    "Manage orders across all channels with unified visibility and fulfillment. Support buy-online-pickup-in-store and other omnichannel scenarios.",
    ["Unified orders", "Cross-channel fulfillment", "BOPIS", "Ship-from-store", "Inventory visibility", "Order routing", "Returns anywhere", "Customer view"],
    ["Channel flexibility", "Customer convenience", "Inventory optimization", "Revenue growth", "Customer satisfaction"],
    ["Omnichannel retail", "BOPIS", "Ship-from-store", "Unified commerce", "Customer flexibility"],
    ["sales-order-management", "order-fulfillment", "inventory-dashboard", "store-operations-dashboard"]
  ),
  "merchandise-planning": createFeature(
    "merchandise-planning",
    "Merchandise Planning",
    "Assortment optimization",
    "ecommerce",
    "Plan merchandise assortment with demand forecasting, allocation, and optimization. Maximize sales and minimize markdowns.",
    ["Assortment planning", "Allocation", "Forecasting", "Optimization", "Store clustering", "Size optimization", "Open-to-buy", "Analysis"],
    ["Optimized assortment", "Better allocation", "Reduced markdowns", "Higher sales", "Inventory efficiency"],
    ["Assortment planning", "Seasonal planning", "Allocation", "New store planning", "Markdown optimization"],
    ["demand-forecasting", "inventory-optimization", "product-catalog", "store-operations-dashboard"]
  ),
  "store-operations-dashboard": createFeature(
    "store-operations-dashboard",
    "Store Operations",
    "Store management",
    "ecommerce",
    "Manage store operations with performance dashboards, task management, and communication tools. Optimize store performance and employee productivity.",
    ["Performance dashboards", "Task management", "Communication", "Scheduling", "Compliance", "Inventory counts", "Training", "Reporting"],
    ["Store performance", "Task completion", "Communication", "Compliance", "Visibility"],
    ["Store management", "Task assignment", "Performance tracking", "Compliance", "Training"],
    ["omnichannel-orders", "inventory-dashboard", "attendance-dashboard", "point-of-sale"]
  ),

  "compliance-dashboard": createFeature(
    "compliance-dashboard",
    "Compliance Dashboard",
    "Compliance overview",
    "compliance",
    "Get a complete overview of compliance status with dashboards showing risk levels, findings, and remediation progress.",
    ["Compliance overview", "Risk indicators", "Finding tracking", "Remediation status", "Trend analysis", "Alerts", "Reports", "Executive view"],
    ["Compliance visibility", "Risk awareness", "Progress tracking", "Executive reporting", "Proactive management"],
    ["Compliance management", "Executive reporting", "Risk overview", "Audit preparation", "Board reporting"],
    ["audit-management", "compliance-monitoring", "compliance-reports", "compliance-governance"]
  ),
  "audit-management": createFeature(
    "audit-management",
    "Audit Management",
    "Internal and external audits",
    "compliance",
    "Plan, execute, and track internal and external audits. Manage findings, evidence, and remediation activities.",
    ["Audit planning", "Execution", "Finding management", "Evidence collection", "Remediation tracking", "Reporting", "Scheduling", "Resource management"],
    ["Efficient audits", "Complete tracking", "Finding resolution", "Audit readiness", "Continuous improvement"],
    ["Internal audits", "External audits", "Regulatory audits", "Certification audits", "Compliance audits"],
    ["compliance-dashboard", "audit-trails", "compliance-reports", "ncr-management"]
  ),
  "compliance-reports": createFeature(
    "compliance-reports",
    "Compliance Reports",
    "Regulatory reporting",
    "compliance",
    "Generate compliance reports for internal stakeholders and regulatory authorities. Support multiple reporting frameworks and formats.",
    ["Report generation", "Templates", "Scheduling", "Multiple formats", "Certification support", "Evidence attachment", "History", "Distribution"],
    ["Regulatory compliance", "Reporting efficiency", "Accuracy", "Audit readiness", "Stakeholder confidence"],
    ["Regulatory reporting", "Certification", "Board reporting", "Stakeholder updates", "External audit support"],
    ["compliance-dashboard", "audit-management", "compliance-governance", "report-builder"]
  ),
  "compliance-governance": createFeature(
    "compliance-governance",
    "Policy Management",
    "Policy documentation",
    "compliance",
    "Manage policies and procedures with version control, approval workflows, and acknowledgment tracking. Ensure employees are aware of and comply with policies.",
    ["Policy creation", "Version control", "Approval workflows", "Acknowledgment", "Distribution", "Search", "Attestation", "Reporting"],
    ["Policy governance", "Employee awareness", "Compliance assurance", "Version control", "Accountability"],
    ["Policy management", "Procedure documentation", "Employee acknowledgment", "Compliance training", "Audit support"],
    ["compliance-dashboard", "learning-management", "workflow-designer", "audit-management"]
  ),
  "compliance-exceptions": createFeature(
    "compliance-exceptions",
    "Compliance Exceptions",
    "Exception handling",
    "compliance",
    "Manage compliance exceptions with approval workflows, tracking, and expiration. Ensure exceptions are properly authorized and monitored.",
    ["Exception requests", "Approval workflows", "Tracking", "Expiration management", "Risk assessment", "Renewal", "Audit trail", "Reporting"],
    ["Controlled exceptions", "Accountability", "Risk management", "Audit readiness", "Governance"],
    ["Compliance exceptions", "Waiver management", "Temporary exemptions", "Risk acceptance", "Control gaps"],
    ["compliance-dashboard", "approval-workflow", "compliance-monitoring", "sod-rules"]
  ),
  "audit-trails": createFeature(
    "audit-trails",
    "Audit Trails",
    "Complete activity history",
    "compliance",
    "Maintain complete audit trails of all system activities. Support investigations, compliance, and forensic analysis.",
    ["Activity logging", "User tracking", "Data changes", "Access logging", "Search", "Export", "Retention", "Tamper protection"],
    ["Complete history", "Compliance", "Investigation support", "Accountability", "Non-repudiation"],
    ["Compliance auditing", "Investigation", "Change tracking", "Access review", "Forensic analysis"],
    ["audit-logs", "login-history", "compliance-monitoring", "data-governance"]
  ),
  "sod-rules": createFeature(
    "sod-rules",
    "SoD Rules",
    "Segregation of duties",
    "compliance",
    "Define and enforce segregation of duties rules to prevent fraud and ensure proper controls. Monitor violations and exceptions.",
    ["Rule definition", "Conflict detection", "Violation alerts", "Exception management", "Analysis", "Reporting", "Simulation", "Remediation"],
    ["Fraud prevention", "Control effectiveness", "Compliance", "Risk reduction", "Accountability"],
    ["Access control", "Fraud prevention", "Compliance", "Risk management", "Audit preparation"],
    ["role-management", "permission-matrix", "compliance-monitoring", "compliance-exceptions"]
  ),
};

export function getFeatureBySlug(slug: string): FeatureDetail | null {
  return featureRegistry[slug] || null;
}

export function getAllFeatureSlugs(): string[] {
  return Object.keys(featureRegistry);
}

export function getFeaturesByModule(moduleId: string): FeatureDetail[] {
  return Object.values(featureRegistry).filter(f => f.moduleId === moduleId);
}
