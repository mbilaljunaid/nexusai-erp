import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useRoute } from "wouter";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { 
  GraduationCap, ArrowLeft, ArrowRight, CheckCircle2, BookOpen, 
  Clock, Target, AlertCircle, Lightbulb, Play, FileText,
  DollarSign, CreditCard, Calculator, PieChart, TrendingUp,
  Users, BarChart3, Mail, Calendar, Award, Package,
  Warehouse, Truck, ClipboardList, Table, Factory, Settings,
  Layers, ClipboardCheck, Wrench, LineChart
} from "lucide-react";

interface LessonSection {
  title: string;
  content: string[];
}

interface LessonContent {
  title: string;
  category: string;
  categoryColor: string;
  duration: string;
  description: string;
  objectives: string[];
  prerequisites: string[];
  sections: LessonSection[];
  keyTakeaways: string[];
  practiceExercises: string[];
  nextLesson?: { title: string; href: string };
  prevLesson?: { title: string; href: string };
  parentGuide: { title: string; href: string };
}

const lessonContent: Record<string, LessonContent> = {
  "finance/general-ledger": {
    title: "General Ledger",
    category: "Finance",
    categoryColor: "green",
    duration: "60 min",
    description: "Master the fundamentals of the General Ledger module including chart of accounts setup, journal entry management, and period close procedures.",
    objectives: [
      "Navigate the Chart of Accounts structure and hierarchy",
      "Create and post journal entries with proper documentation",
      "Perform month-end and year-end closing procedures",
      "Generate GL reports and trial balances",
      "Understand account reconciliation workflows"
    ],
    prerequisites: [
      "Basic understanding of accounting principles",
      "Access to NexusAI Finance module"
    ],
    sections: [
      {
        title: "Chart of Accounts Overview",
        content: [
          "The Chart of Accounts (CoA) is the foundation of your financial system. It organizes all accounts into five main categories: Assets, Liabilities, Equity, Revenue, and Expenses.",
          "Each account has a unique account number, description, account type, and currency. You can create parent-child relationships to build a hierarchical structure.",
          "Best practices include using consistent numbering conventions, limiting account depth to 4-5 levels, and reviewing the structure quarterly for optimization."
        ]
      },
      {
        title: "Journal Entry Management",
        content: [
          "Journal entries record all financial transactions in the system. Each entry must balance (debits equal credits) before posting.",
          "Required fields include: Entry Date, Description, Account, Debit/Credit Amount, and Reference. Optional fields include cost center, project, and attachments.",
          "Use recurring journal templates for monthly entries like depreciation, accruals, and allocations to save time and ensure consistency."
        ]
      },
      {
        title: "Period Close Procedures",
        content: [
          "Month-end close involves reconciling all accounts, reviewing accruals, and generating financial statements.",
          "The close checklist includes: Complete all postings, run aging reports, reconcile bank statements, review intercompany transactions, and lock the period.",
          "Year-end close additionally requires closing income/expense accounts to retained earnings and preparing audit schedules."
        ]
      }
    ],
    keyTakeaways: [
      "Always verify journal entries balance before posting",
      "Use the period close checklist to ensure completeness",
      "Regular account reconciliation prevents errors from accumulating",
      "Document all unusual transactions with detailed descriptions"
    ],
    practiceExercises: [
      "Create a new expense account and add it to the appropriate parent",
      "Post a journal entry with supporting documentation",
      "Generate a trial balance for the current period"
    ],
    nextLesson: { title: "Accounts Payable", href: "/docs/training-guides/finance/accounts-payable" },
    parentGuide: { title: "Finance Training Guide", href: "/docs/training-guides/finance" }
  },
  "finance/accounts-payable": {
    title: "Accounts Payable",
    category: "Finance",
    categoryColor: "green",
    duration: "45 min",
    description: "Learn to manage vendor invoices, process payments, and maintain accurate payables records in the AP module.",
    objectives: [
      "Enter and validate vendor invoices",
      "Match invoices to purchase orders and receipts",
      "Process payment runs and check printing",
      "Manage vendor master data",
      "Run AP aging and payment reports"
    ],
    prerequisites: [
      "Completion of General Ledger training",
      "Understanding of purchasing process"
    ],
    sections: [
      {
        title: "Vendor Invoice Entry",
        content: [
          "Invoice entry can be done manually or through automated scanning and OCR. Each invoice requires vendor, date, amount, and GL coding.",
          "Three-way matching compares the invoice to the purchase order and goods receipt to ensure accuracy before approval.",
          "Discrepancies trigger workflow notifications to purchasing or receiving departments for resolution."
        ]
      },
      {
        title: "Payment Processing",
        content: [
          "Payment runs can be scheduled weekly or on-demand. Select invoices by due date, discount opportunities, or vendor priority.",
          "Multiple payment methods are supported: checks, ACH/EFT, wire transfers, and virtual cards.",
          "Payment approval workflows ensure proper authorization before funds are released."
        ]
      },
      {
        title: "Vendor Management",
        content: [
          "Vendor master records contain contact information, payment terms, banking details, and tax identification.",
          "Maintain accurate 1099 settings for year-end tax reporting (US) or appropriate tax documentation for your jurisdiction.",
          "Regular vendor statement reconciliation identifies missing invoices or duplicate payments."
        ]
      }
    ],
    keyTakeaways: [
      "Three-way matching reduces invoice fraud and errors",
      "Take advantage of early payment discounts when cash flow permits",
      "Reconcile vendor statements monthly to catch discrepancies early",
      "Keep vendor banking information current and verified"
    ],
    practiceExercises: [
      "Enter a vendor invoice and match it to a PO",
      "Create a payment proposal for upcoming due invoices",
      "Run an AP aging report and identify overdue items"
    ],
    prevLesson: { title: "General Ledger", href: "/docs/training-guides/finance/general-ledger" },
    nextLesson: { title: "Accounts Receivable", href: "/docs/training-guides/finance/accounts-receivable" },
    parentGuide: { title: "Finance Training Guide", href: "/docs/training-guides/finance" }
  },
  "finance/accounts-receivable": {
    title: "Accounts Receivable",
    category: "Finance",
    categoryColor: "green",
    duration: "45 min",
    description: "Master customer invoicing, payment collection, and receivables management to optimize cash flow.",
    objectives: [
      "Create and send customer invoices",
      "Apply payments and manage credits",
      "Monitor AR aging and collections",
      "Handle customer disputes and adjustments",
      "Generate AR reports and statements"
    ],
    prerequisites: [
      "Completion of General Ledger training",
      "Understanding of sales order process"
    ],
    sections: [
      {
        title: "Customer Invoicing",
        content: [
          "Invoices can be created manually, from sales orders, or from project milestones. Each invoice includes customer, items, quantities, prices, and terms.",
          "Automated invoice delivery sends PDF invoices via email on a scheduled basis or immediately upon posting.",
          "Credit memos handle returns, price adjustments, and customer goodwill with proper documentation and approval."
        ]
      },
      {
        title: "Payment Application",
        content: [
          "Payments can be applied automatically using matching rules or manually for complex situations.",
          "Supported payment methods include checks, ACH, credit cards, and wire transfers. Integration with payment gateways enables online payments.",
          "Unapplied cash and overpayments are tracked separately for customer credit or refund processing."
        ]
      },
      {
        title: "Collections Management",
        content: [
          "AR aging buckets (Current, 30, 60, 90+ days) help prioritize collection efforts.",
          "Automated dunning letters remind customers of overdue balances with escalating urgency.",
          "Collection notes and call logs maintain a complete history of customer communication for dispute resolution."
        ]
      }
    ],
    keyTakeaways: [
      "Timely invoicing accelerates cash collection",
      "Regular AR aging review identifies problem accounts early",
      "Document all collection activities for legal protection",
      "Offer multiple payment options to make it easy for customers to pay"
    ],
    practiceExercises: [
      "Create an invoice from a sales order",
      "Apply a customer payment to open invoices",
      "Generate a customer statement showing account activity"
    ],
    prevLesson: { title: "Accounts Payable", href: "/docs/training-guides/finance/accounts-payable" },
    nextLesson: { title: "Budgeting", href: "/docs/training-guides/finance/budgeting" },
    parentGuide: { title: "Finance Training Guide", href: "/docs/training-guides/finance" }
  },
  "finance/budgeting": {
    title: "Budgeting",
    category: "Finance",
    categoryColor: "green",
    duration: "50 min",
    description: "Learn to create, manage, and analyze budgets for effective financial planning and control.",
    objectives: [
      "Create annual and departmental budgets",
      "Import and maintain budget data",
      "Analyze budget vs. actual variances",
      "Manage budget versions and scenarios",
      "Configure budget controls and alerts"
    ],
    prerequisites: [
      "Understanding of Chart of Accounts structure",
      "Familiarity with organizational cost centers"
    ],
    sections: [
      {
        title: "Budget Creation",
        content: [
          "Budgets can be built top-down (executive targets), bottom-up (departmental requests), or using a combination approach.",
          "Templates and historical data help jumpstart the budget process. Prior year actuals provide a baseline for realistic projections.",
          "Budget workflow routes drafts through department managers, finance review, and executive approval."
        ]
      },
      {
        title: "Variance Analysis",
        content: [
          "Budget vs. Actual reports compare planned spending to real transactions by account, department, or project.",
          "Variance percentages and absolute amounts highlight areas needing attention. Positive variances (under budget) and negative (over budget) are color-coded.",
          "Drill-down capability lets you investigate variances to the transaction level for root cause analysis."
        ]
      },
      {
        title: "Forecasting",
        content: [
          "Rolling forecasts update projections based on year-to-date actuals and revised expectations.",
          "Scenario planning models different assumptions (optimistic, pessimistic, base case) for strategic decision-making.",
          "Reforecasting at mid-year allows organizations to adjust plans based on changed conditions."
        ]
      }
    ],
    keyTakeaways: [
      "Involve budget owners early for buy-in and accuracy",
      "Review variances monthly and investigate significant deviations",
      "Use rolling forecasts for more accurate projections",
      "Document assumptions underlying budget figures"
    ],
    practiceExercises: [
      "Create a departmental budget using prior year as a baseline",
      "Run a budget vs. actual report for Q1",
      "Create a budget version for an alternative scenario"
    ],
    prevLesson: { title: "Accounts Receivable", href: "/docs/training-guides/finance/accounts-receivable" },
    nextLesson: { title: "Financial Reporting", href: "/docs/training-guides/finance/financial-reporting" },
    parentGuide: { title: "Finance Training Guide", href: "/docs/training-guides/finance" }
  },
  "finance/financial-reporting": {
    title: "Financial Reporting",
    category: "Finance",
    categoryColor: "green",
    duration: "40 min",
    description: "Generate and customize financial statements including balance sheets, income statements, and custom reports.",
    objectives: [
      "Generate standard financial statements",
      "Customize report layouts and groupings",
      "Create comparative and consolidated reports",
      "Schedule automated report distribution",
      "Export reports in multiple formats"
    ],
    prerequisites: [
      "Understanding of GL account structure",
      "Completion of General Ledger training"
    ],
    sections: [
      {
        title: "Standard Financial Statements",
        content: [
          "The Balance Sheet shows assets, liabilities, and equity at a point in time. It must always balance (A = L + E).",
          "The Income Statement (P&L) reports revenue and expenses over a period, calculating net income or loss.",
          "The Cash Flow Statement tracks operating, investing, and financing cash movements."
        ]
      },
      {
        title: "Report Customization",
        content: [
          "Report designer allows custom row and column definitions, groupings, and calculated fields.",
          "Comparative reports show current vs. prior period, budget, or prior year with variance calculations.",
          "Consolidation combines multiple entities with currency translation and elimination entries."
        ]
      },
      {
        title: "Distribution and Export",
        content: [
          "Schedule reports to run automatically at month-end and distribute via email to stakeholders.",
          "Export options include PDF, Excel, CSV, and direct integration with board reporting packages.",
          "Report packages combine multiple reports with a cover page and table of contents for executive review."
        ]
      }
    ],
    keyTakeaways: [
      "Validate report totals against GL trial balance",
      "Save custom report definitions for reuse",
      "Use report scheduling to ensure timely delivery",
      "Document any manual adjustments made after reporting"
    ],
    practiceExercises: [
      "Generate a comparative income statement (current vs. prior year)",
      "Customize a balance sheet to add subtotals",
      "Schedule a monthly financial package for automatic distribution"
    ],
    prevLesson: { title: "Budgeting", href: "/docs/training-guides/finance/budgeting" },
    nextLesson: { title: "Cash Management", href: "/docs/training-guides/finance/cash-management" },
    parentGuide: { title: "Finance Training Guide", href: "/docs/training-guides/finance" }
  },
  "finance/cash-management": {
    title: "Cash Management",
    category: "Finance",
    categoryColor: "green",
    duration: "40 min",
    description: "Master cash flow monitoring, bank reconciliation, and treasury functions for optimal liquidity management.",
    objectives: [
      "Set up and manage bank accounts",
      "Perform bank reconciliation",
      "Monitor and forecast cash flow",
      "Process intercompany transfers",
      "Manage treasury and investments"
    ],
    prerequisites: [
      "Completion of AP and AR training",
      "Access to bank statement data"
    ],
    sections: [
      {
        title: "Bank Account Management",
        content: [
          "Configure bank accounts with account numbers, routing information, and GL mapping for automatic posting.",
          "Bank feeds automatically import transactions from financial institutions for reconciliation.",
          "Multiple currencies and multi-bank pooling are supported for international operations."
        ]
      },
      {
        title: "Bank Reconciliation",
        content: [
          "Match bank statement lines to system transactions using automatic matching rules or manual selection.",
          "Reconciling items include outstanding checks, deposits in transit, and bank fees not yet recorded.",
          "The reconciliation report documents the process and explains any remaining differences."
        ]
      },
      {
        title: "Cash Forecasting",
        content: [
          "Cash flow forecasts project future cash positions based on scheduled payments and expected receipts.",
          "Include AP payment runs, AR collections estimates, payroll dates, and loan payments in the forecast.",
          "What-if scenarios model the impact of delayed payments or accelerated collections on liquidity."
        ]
      }
    ],
    keyTakeaways: [
      "Reconcile bank accounts at least monthly",
      "Investigate old outstanding items promptly",
      "Update cash forecasts weekly during tight cash periods",
      "Maintain adequate cash reserves for unexpected needs"
    ],
    practiceExercises: [
      "Perform a bank reconciliation using imported bank statements",
      "Create a 13-week cash flow forecast",
      "Process an intercompany cash transfer"
    ],
    prevLesson: { title: "Financial Reporting", href: "/docs/training-guides/finance/financial-reporting" },
    parentGuide: { title: "Finance Training Guide", href: "/docs/training-guides/finance" }
  },
  "crm/customer-management": {
    title: "Customer Management",
    category: "CRM",
    categoryColor: "blue",
    duration: "45 min",
    description: "Learn to create and manage comprehensive customer records, contacts, and account hierarchies.",
    objectives: [
      "Create and maintain customer accounts",
      "Manage contacts and relationships",
      "Build account hierarchies for enterprise customers",
      "Track customer interactions and history",
      "Segment customers for targeted engagement"
    ],
    prerequisites: [
      "Access to NexusAI CRM module",
      "Understanding of your customer base"
    ],
    sections: [
      {
        title: "Account Creation and Maintenance",
        content: [
          "Customer accounts store company information including name, address, industry, size, and classification.",
          "Required fields ensure data quality: Account Name, Primary Contact, Industry, and Territory are typically mandatory.",
          "Account status tracks the customer lifecycle: Prospect, Active, On Hold, or Closed."
        ]
      },
      {
        title: "Contact Management",
        content: [
          "Contacts represent individuals at customer accounts with their roles, preferences, and communication history.",
          "Relationship mapping shows organizational charts and buying center dynamics for complex sales.",
          "Contact preferences control how and when the system communicates with each individual."
        ]
      },
      {
        title: "Account Hierarchies",
        content: [
          "Parent-child relationships link subsidiaries, divisions, or locations to a master corporate account.",
          "Hierarchy views provide visibility into total business across all related accounts.",
          "Pricing and terms can be inherited from parent accounts or overridden at the child level."
        ]
      }
    ],
    keyTakeaways: [
      "Complete customer records enable better service and targeting",
      "Regular data hygiene maintains CRM value over time",
      "Use account hierarchies to understand total customer value",
      "Document key relationships and decision-makers"
    ],
    practiceExercises: [
      "Create a new customer account with complete information",
      "Add multiple contacts and define their roles",
      "Build a parent-child account hierarchy"
    ],
    nextLesson: { title: "Lead & Opportunity", href: "/docs/training-guides/crm/lead-opportunity" },
    parentGuide: { title: "CRM Training Guide", href: "/docs/training-guides/crm" }
  },
  "crm/lead-opportunity": {
    title: "Lead & Opportunity",
    category: "CRM",
    categoryColor: "blue",
    duration: "60 min",
    description: "Master the sales pipeline from lead capture through opportunity management to closed deals.",
    objectives: [
      "Capture and qualify leads effectively",
      "Convert leads to opportunities",
      "Manage opportunities through sales stages",
      "Forecast revenue accurately",
      "Analyze win/loss patterns"
    ],
    prerequisites: [
      "Completion of Customer Management training",
      "Understanding of your sales process"
    ],
    sections: [
      {
        title: "Lead Management",
        content: [
          "Leads can originate from web forms, trade shows, referrals, or manual entry. Each lead requires source tracking.",
          "Lead scoring prioritizes follow-up based on demographic fit and behavioral engagement signals.",
          "Qualification criteria (BANT: Budget, Authority, Need, Timeline) determine readiness for conversion to opportunity."
        ]
      },
      {
        title: "Opportunity Pipeline",
        content: [
          "Opportunities represent potential deals with estimated values, close dates, and probability percentages.",
          "Sales stages reflect your selling process: Qualification, Needs Analysis, Proposal, Negotiation, Closed.",
          "Stage-appropriate activities and content guide reps through the optimal selling motion."
        ]
      },
      {
        title: "Forecasting and Analysis",
        content: [
          "Pipeline reports show opportunities by stage, owner, region, or product for management visibility.",
          "Forecast categories (Commit, Best Case, Pipeline) enable accurate revenue prediction.",
          "Win/loss analysis identifies patterns in successful deals to improve future conversion rates."
        ]
      }
    ],
    keyTakeaways: [
      "Consistent lead qualification improves conversion rates",
      "Keep opportunity data current for accurate forecasting",
      "Document next steps and decision criteria for each opportunity",
      "Review losses to learn and improve the sales approach"
    ],
    practiceExercises: [
      "Enter a lead and qualify it using scoring criteria",
      "Convert a qualified lead to an opportunity",
      "Advance an opportunity through sales stages to close"
    ],
    prevLesson: { title: "Customer Management", href: "/docs/training-guides/crm/customer-management" },
    nextLesson: { title: "Sales Analytics", href: "/docs/training-guides/crm/sales-analytics" },
    parentGuide: { title: "CRM Training Guide", href: "/docs/training-guides/crm" }
  },
  "crm/sales-analytics": {
    title: "Sales Analytics",
    category: "CRM",
    categoryColor: "blue",
    duration: "30 min",
    description: "Use dashboards, reports, and forecasting tools to gain insights and drive sales performance.",
    objectives: [
      "Navigate sales dashboards and KPIs",
      "Create and customize sales reports",
      "Analyze pipeline and conversion metrics",
      "Generate accurate sales forecasts",
      "Identify trends and opportunities for improvement"
    ],
    prerequisites: [
      "Understanding of sales pipeline stages",
      "Familiarity with opportunity data"
    ],
    sections: [
      {
        title: "Sales Dashboards",
        content: [
          "Executive dashboards show pipeline value, forecast accuracy, and year-to-date performance against targets.",
          "Rep dashboards display individual quotas, activities, and deal velocity metrics.",
          "Real-time updates ensure decisions are based on current data."
        ]
      },
      {
        title: "Pipeline Analysis",
        content: [
          "Conversion rates measure progression from stage to stage, identifying where deals get stuck.",
          "Sales velocity calculates average deal value times win rate divided by cycle time for throughput analysis.",
          "Pipeline coverage ratios ensure sufficient opportunities exist to meet quota."
        ]
      },
      {
        title: "Forecasting Tools",
        content: [
          "AI-powered forecasting analyzes historical patterns to predict future outcomes.",
          "Collaborative forecasting allows managers to adjust rep-submitted numbers with rollup visibility.",
          "Forecast trending shows how predictions evolve over the quarter for early warning of misses."
        ]
      }
    ],
    keyTakeaways: [
      "Review dashboards daily to stay on top of pipeline health",
      "Focus on leading indicators that predict future results",
      "Use data to coach reps on specific improvement areas",
      "Track forecast accuracy to calibrate future predictions"
    ],
    practiceExercises: [
      "Customize your personal sales dashboard",
      "Run a pipeline conversion report by stage",
      "Submit a quarterly forecast with supporting commentary"
    ],
    prevLesson: { title: "Lead & Opportunity", href: "/docs/training-guides/crm/lead-opportunity" },
    nextLesson: { title: "Communication Tools", href: "/docs/training-guides/crm/communication-tools" },
    parentGuide: { title: "CRM Training Guide", href: "/docs/training-guides/crm" }
  },
  "crm/communication-tools": {
    title: "Communication Tools",
    category: "CRM",
    categoryColor: "blue",
    duration: "30 min",
    description: "Master email integration, activity logging, and follow-up automation to enhance customer engagement.",
    objectives: [
      "Integrate email with CRM records",
      "Log calls, meetings, and activities",
      "Set up automated follow-up reminders",
      "Use email templates and sequences",
      "Track engagement metrics"
    ],
    prerequisites: [
      "Access to email integration settings",
      "Understanding of customer records"
    ],
    sections: [
      {
        title: "Email Integration",
        content: [
          "Sync your email client (Outlook, Gmail) to automatically log sent and received messages to CRM records.",
          "Email tracking shows opens, clicks, and engagement to prioritize follow-up.",
          "Shared email visibility lets teams see relevant customer communications."
        ]
      },
      {
        title: "Activity Logging",
        content: [
          "Log calls, meetings, and notes directly from the account or contact record.",
          "Activity types are configurable: Phone Call, Video Meeting, Site Visit, Email, Note.",
          "Timeline view shows complete interaction history in chronological order."
        ]
      },
      {
        title: "Automation and Templates",
        content: [
          "Email templates save time on routine communications with merge fields for personalization.",
          "Sequences automate multi-touch outreach with scheduled follow-ups.",
          "Task automation creates follow-up activities based on triggers like stage changes or inactivity."
        ]
      }
    ],
    keyTakeaways: [
      "Consistent activity logging creates complete customer history",
      "Use templates for efficiency but personalize for impact",
      "Follow up promptly - speed matters in sales",
      "Review engagement metrics to optimize messaging"
    ],
    practiceExercises: [
      "Configure email sync for your account",
      "Log a call with notes and schedule a follow-up task",
      "Create an email template with merge fields"
    ],
    prevLesson: { title: "Sales Analytics", href: "/docs/training-guides/crm/sales-analytics" },
    parentGuide: { title: "CRM Training Guide", href: "/docs/training-guides/crm" }
  },
  "hr/employee-management": {
    title: "Employee Management",
    category: "HR & Payroll",
    categoryColor: "teal",
    duration: "40 min",
    description: "Learn to manage employee records, organizational structure, and the employee directory effectively.",
    objectives: [
      "Create and maintain employee records",
      "Manage organizational hierarchy",
      "Navigate the employee directory",
      "Handle employee status changes",
      "Configure employee self-service"
    ],
    prerequisites: [
      "Access to NexusAI HR module",
      "Understanding of organizational structure"
    ],
    sections: [
      {
        title: "Employee Records",
        content: [
          "Employee records contain personal information, employment details, compensation, and benefits enrollment.",
          "Required fields include name, ID, hire date, department, job title, and manager. Additional fields capture emergency contacts and documents.",
          "Employment history tracks promotions, transfers, and role changes over time."
        ]
      },
      {
        title: "Organizational Structure",
        content: [
          "Departments, cost centers, and locations define the organizational hierarchy.",
          "Reporting relationships create the management chain for approvals and visibility.",
          "Org chart visualization shows the structure graphically with drill-down capability."
        ]
      },
      {
        title: "Directory and Self-Service",
        content: [
          "The employee directory enables searching by name, department, title, or skill.",
          "Employee self-service allows updating personal information, viewing pay stubs, and managing benefits.",
          "Privacy settings control what information is visible to colleagues vs. HR only."
        ]
      }
    ],
    keyTakeaways: [
      "Keep employee records current to ensure accurate reporting",
      "Accurate org structure enables proper workflow routing",
      "Self-service reduces HR administrative burden",
      "Document all employee status changes with effective dates"
    ],
    practiceExercises: [
      "Create a new employee record with complete information",
      "Update an employee's department and manager",
      "View and update your own profile in self-service"
    ],
    nextLesson: { title: "Time & Attendance", href: "/docs/training-guides/hr/time-attendance" },
    parentGuide: { title: "HR & Payroll Training Guide", href: "/docs/training-guides/hr" }
  },
  "hr/time-attendance": {
    title: "Time & Attendance",
    category: "HR & Payroll",
    categoryColor: "teal",
    duration: "45 min",
    description: "Master time tracking, schedule management, and attendance monitoring for accurate payroll processing.",
    objectives: [
      "Configure time tracking policies",
      "Manage employee schedules",
      "Review and approve timesheets",
      "Handle exceptions and overtime",
      "Generate attendance reports"
    ],
    prerequisites: [
      "Understanding of company time policies",
      "Completion of Employee Management training"
    ],
    sections: [
      {
        title: "Time Tracking",
        content: [
          "Employees can clock in/out via web portal, mobile app, or physical time clocks.",
          "Time policies define work hours, break requirements, and overtime rules by employee group.",
          "Project and task time tracking enables allocation of hours to specific work items for costing."
        ]
      },
      {
        title: "Schedule Management",
        content: [
          "Create recurring schedules or one-time shift assignments for employees.",
          "Shift swapping and availability management let employees coordinate coverage.",
          "Scheduling conflicts and overtime thresholds trigger warnings before finalization."
        ]
      },
      {
        title: "Approval and Exceptions",
        content: [
          "Timesheet approval workflow routes to managers for review before payroll processing.",
          "Exceptions like missed punches, early departures, or absences require supervisor acknowledgment.",
          "Attendance points or occurrence tracking monitors patterns for policy enforcement."
        ]
      }
    ],
    keyTakeaways: [
      "Clear policies prevent time and attendance disputes",
      "Timely timesheet approval ensures on-time payroll",
      "Address attendance issues promptly and consistently",
      "Use scheduling tools to optimize labor costs"
    ],
    practiceExercises: [
      "Clock in and log time against a project",
      "Create a weekly schedule for a team",
      "Review and approve pending timesheets"
    ],
    prevLesson: { title: "Employee Management", href: "/docs/training-guides/hr/employee-management" },
    nextLesson: { title: "Payroll Processing", href: "/docs/training-guides/hr/payroll-processing" },
    parentGuide: { title: "HR & Payroll Training Guide", href: "/docs/training-guides/hr" }
  },
  "hr/payroll-processing": {
    title: "Payroll Processing",
    category: "HR & Payroll",
    categoryColor: "teal",
    duration: "55 min",
    description: "Learn to process payroll runs, manage deductions, and handle tax calculations accurately.",
    objectives: [
      "Configure pay schedules and earnings codes",
      "Process regular and off-cycle payroll runs",
      "Manage deductions and garnishments",
      "Handle tax withholding and reporting",
      "Generate payroll reports and analytics"
    ],
    prerequisites: [
      "Completion of Time & Attendance training",
      "Understanding of payroll regulations"
    ],
    sections: [
      {
        title: "Payroll Setup",
        content: [
          "Pay schedules define frequency (weekly, biweekly, semi-monthly, monthly) and pay dates.",
          "Earnings codes categorize pay types: regular, overtime, bonus, commission, PTO payout.",
          "Deduction codes handle benefits, retirement contributions, and voluntary withholdings."
        ]
      },
      {
        title: "Processing Payroll",
        content: [
          "Payroll runs collect timesheet data, apply earnings and deductions, and calculate taxes.",
          "Preview reports show gross-to-net details before final processing for verification.",
          "Off-cycle runs handle terminations, corrections, and special payments outside regular cycles."
        ]
      },
      {
        title: "Tax and Compliance",
        content: [
          "Tax tables are updated regularly for federal, state, and local withholding requirements.",
          "W-2/W-4 management tracks employee elections and generates year-end forms.",
          "Garnishment processing handles court-ordered deductions with priority rules."
        ]
      }
    ],
    keyTakeaways: [
      "Verify all data before finalizing payroll runs",
      "Stay current with tax table updates",
      "Document any manual adjustments thoroughly",
      "Reconcile payroll registers to GL postings"
    ],
    practiceExercises: [
      "Run a payroll preview for a pay period",
      "Add a new deduction to an employee record",
      "Generate a payroll register report"
    ],
    prevLesson: { title: "Time & Attendance", href: "/docs/training-guides/hr/time-attendance" },
    nextLesson: { title: "Performance Reviews", href: "/docs/training-guides/hr/performance-reviews" },
    parentGuide: { title: "HR & Payroll Training Guide", href: "/docs/training-guides/hr" }
  },
  "hr/performance-reviews": {
    title: "Performance Reviews",
    category: "HR & Payroll",
    categoryColor: "teal",
    duration: "35 min",
    description: "Manage goal setting, performance reviews, and employee development plans effectively.",
    objectives: [
      "Create and cascade organizational goals",
      "Conduct performance review cycles",
      "Provide and receive feedback",
      "Develop individual development plans",
      "Calibrate ratings across the organization"
    ],
    prerequisites: [
      "Understanding of performance management philosophy",
      "Access to performance module"
    ],
    sections: [
      {
        title: "Goal Management",
        content: [
          "Goals can be cascaded from company objectives or created individually with manager alignment.",
          "SMART goal framework ensures objectives are Specific, Measurable, Achievable, Relevant, and Time-bound.",
          "Goal weighting indicates priority and importance for overall performance calculation."
        ]
      },
      {
        title: "Review Process",
        content: [
          "Review cycles define the timeline: self-assessment, manager review, calibration, and delivery.",
          "Competency assessments measure behavioral expectations in addition to goal achievement.",
          "360-degree feedback incorporates input from peers, direct reports, and cross-functional colleagues."
        ]
      },
      {
        title: "Development Planning",
        content: [
          "Individual development plans (IDPs) document growth objectives and action items.",
          "Link training courses and stretch assignments to development goals.",
          "Career pathing shows potential progression routes and required competencies."
        ]
      }
    ],
    keyTakeaways: [
      "Regular check-ins prevent year-end surprises",
      "Document specific examples to support ratings",
      "Focus on development, not just evaluation",
      "Calibration ensures fairness across teams"
    ],
    practiceExercises: [
      "Create quarterly goals for yourself or a team member",
      "Complete a self-assessment for a review period",
      "Draft an individual development plan"
    ],
    prevLesson: { title: "Payroll Processing", href: "/docs/training-guides/hr/payroll-processing" },
    nextLesson: { title: "Leave Management", href: "/docs/training-guides/hr/leave-management" },
    parentGuide: { title: "HR & Payroll Training Guide", href: "/docs/training-guides/hr" }
  },
  "hr/leave-management": {
    title: "Leave Management",
    category: "HR & Payroll",
    categoryColor: "teal",
    duration: "30 min",
    description: "Master leave request processing, approvals, and balance tracking for all absence types.",
    objectives: [
      "Configure leave policies and accruals",
      "Submit and approve leave requests",
      "Track leave balances and usage",
      "Handle special leave types (FMLA, etc.)",
      "Generate leave reports"
    ],
    prerequisites: [
      "Understanding of company leave policies",
      "Access to leave management module"
    ],
    sections: [
      {
        title: "Leave Policies",
        content: [
          "Leave types include PTO, sick leave, vacation, personal days, and statutory holidays.",
          "Accrual rules define how leave is earned: per pay period, annually, or based on tenure.",
          "Carryover and payout rules govern what happens to unused balances at year-end."
        ]
      },
      {
        title: "Request and Approval",
        content: [
          "Employees submit leave requests with dates, type, and optional comments.",
          "Workflow routes requests to the appropriate approver based on employee and leave type.",
          "Calendar views show team availability to prevent conflicts when approving requests."
        ]
      },
      {
        title: "Compliance and Reporting",
        content: [
          "Protected leave types (FMLA, disability) have special tracking and documentation requirements.",
          "Leave balance reports show current accruals, usage, and pending requests.",
          "Audit trails document all requests, approvals, and adjustments for compliance."
        ]
      }
    ],
    keyTakeaways: [
      "Clear policies reduce confusion and disputes",
      "Timely approvals respect employee planning",
      "Monitor patterns that may indicate issues",
      "Ensure compliance with leave laws"
    ],
    practiceExercises: [
      "Submit a PTO request for upcoming dates",
      "Approve or deny a pending leave request",
      "Review leave balances for your team"
    ],
    prevLesson: { title: "Performance Reviews", href: "/docs/training-guides/hr/performance-reviews" },
    nextLesson: { title: "HR Reporting", href: "/docs/training-guides/hr/hr-reporting" },
    parentGuide: { title: "HR & Payroll Training Guide", href: "/docs/training-guides/hr" }
  },
  "hr/hr-reporting": {
    title: "HR Reporting",
    category: "HR & Payroll",
    categoryColor: "teal",
    duration: "30 min",
    description: "Generate HR analytics including headcount, turnover, compensation, and compliance reports.",
    objectives: [
      "Navigate standard HR reports",
      "Create custom HR analytics",
      "Track workforce metrics and KPIs",
      "Generate compliance reports",
      "Schedule and distribute HR reports"
    ],
    prerequisites: [
      "Familiarity with HR data and terminology",
      "Access to reporting module"
    ],
    sections: [
      {
        title: "Standard Reports",
        content: [
          "Headcount reports show employee counts by department, location, job family, or demographic.",
          "Turnover analysis calculates voluntary and involuntary separation rates with trend comparisons.",
          "Compensation reports display salary ranges, compa-ratios, and equity analysis."
        ]
      },
      {
        title: "Workforce Analytics",
        content: [
          "Dashboards visualize key metrics: time-to-fill, cost-per-hire, engagement scores, and diversity stats.",
          "Predictive analytics identify flight risk and succession planning needs.",
          "Benchmarking compares your metrics to industry standards."
        ]
      },
      {
        title: "Compliance Reporting",
        content: [
          "EEO-1 and VETS-4212 reports meet government filing requirements.",
          "ACA compliance reports track full-time equivalents and offer status.",
          "Audit reports provide documentation for internal and external reviews."
        ]
      }
    ],
    keyTakeaways: [
      "Regular reporting enables proactive workforce management",
      "Trend analysis reveals patterns that snapshots miss",
      "Automate recurring reports to save time",
      "Protect sensitive data with appropriate access controls"
    ],
    practiceExercises: [
      "Run a headcount report by department",
      "Create a turnover dashboard for the current year",
      "Schedule a monthly HR metrics report for distribution"
    ],
    prevLesson: { title: "Leave Management", href: "/docs/training-guides/hr/leave-management" },
    parentGuide: { title: "HR & Payroll Training Guide", href: "/docs/training-guides/hr" }
  },
  "inventory/stock-management": {
    title: "Stock Management",
    category: "Inventory",
    categoryColor: "orange",
    duration: "40 min",
    description: "Master item master data, stock levels, and reorder point configuration for optimal inventory control.",
    objectives: [
      "Create and maintain item master records",
      "Monitor stock levels and locations",
      "Configure reorder points and safety stock",
      "Manage item variants and serialization",
      "Handle item status changes"
    ],
    prerequisites: [
      "Access to NexusAI Inventory module",
      "Understanding of your product catalog"
    ],
    sections: [
      {
        title: "Item Master Data",
        content: [
          "Items are defined with SKU, description, unit of measure, cost method, and category classification.",
          "Multiple units of measure handle conversion between purchasing, stocking, and selling units.",
          "Item attributes capture specifications, dimensions, weight, and custom properties."
        ]
      },
      {
        title: "Stock Level Monitoring",
        content: [
          "Real-time inventory visibility shows quantities on hand, allocated, available, and in transit.",
          "Multi-location tracking identifies where inventory is stored across warehouses and bins.",
          "Stock alerts notify when quantities fall below thresholds or exceed maximum levels."
        ]
      },
      {
        title: "Replenishment Planning",
        content: [
          "Reorder points trigger purchase suggestions when available stock drops to the defined level.",
          "Safety stock buffers protect against demand variability and supply delays.",
          "Economic order quantity (EOQ) calculations balance ordering costs against holding costs."
        ]
      }
    ],
    keyTakeaways: [
      "Accurate item data is foundational to inventory management",
      "Regular stock reviews prevent stockouts and overstock",
      "Safety stock levels should reflect demand variability",
      "Automate reordering where possible"
    ],
    practiceExercises: [
      "Create a new item with multiple units of measure",
      "Review stock levels for items below reorder point",
      "Adjust safety stock for a seasonal item"
    ],
    nextLesson: { title: "Warehouse Operations", href: "/docs/training-guides/inventory/warehouse-operations" },
    parentGuide: { title: "Inventory Training Guide", href: "/docs/training-guides/inventory" }
  },
  "inventory/warehouse-operations": {
    title: "Warehouse Operations",
    category: "Inventory",
    categoryColor: "orange",
    duration: "50 min",
    description: "Learn receiving, put-away, picking, and shipping processes for efficient warehouse management.",
    objectives: [
      "Process inbound receipts and put-away",
      "Configure bin locations and zones",
      "Manage picking and packing workflows",
      "Handle shipping and documentation",
      "Optimize warehouse layout and flow"
    ],
    prerequisites: [
      "Completion of Stock Management training",
      "Understanding of warehouse layout"
    ],
    sections: [
      {
        title: "Receiving and Put-Away",
        content: [
          "Receiving validates incoming shipments against purchase orders and inspects for quality.",
          "Put-away rules direct items to optimal locations based on velocity, size, or zone assignment.",
          "Mobile devices and barcode scanning streamline the receiving process."
        ]
      },
      {
        title: "Warehouse Configuration",
        content: [
          "Zones organize the warehouse into areas: receiving, bulk storage, forward pick, and staging.",
          "Bin locations provide precise addresses for inventory storage and retrieval.",
          "Slotting optimization places fast-moving items in prime picking locations."
        ]
      },
      {
        title: "Picking and Shipping",
        content: [
          "Pick strategies include wave picking, batch picking, or zone picking based on order volume and type.",
          "Pack stations verify picked items, add packing materials, and generate shipping labels.",
          "Shipping integrations connect with carriers for rate shopping and tracking."
        ]
      }
    ],
    keyTakeaways: [
      "Efficient receiving sets the stage for inventory accuracy",
      "Logical warehouse organization reduces travel time",
      "Pick accuracy is critical for customer satisfaction",
      "Integrate with carriers for automated shipping"
    ],
    practiceExercises: [
      "Receive a purchase order and put items away",
      "Configure a new bin location in the warehouse",
      "Pick and pack an order for shipment"
    ],
    prevLesson: { title: "Stock Management", href: "/docs/training-guides/inventory/stock-management" },
    nextLesson: { title: "Goods Movement", href: "/docs/training-guides/inventory/goods-movement" },
    parentGuide: { title: "Inventory Training Guide", href: "/docs/training-guides/inventory" }
  },
  "inventory/goods-movement": {
    title: "Goods Movement",
    category: "Inventory",
    categoryColor: "orange",
    duration: "35 min",
    description: "Master inventory transfers, adjustments, and cycle counting for accurate stock records.",
    objectives: [
      "Process inventory transfers between locations",
      "Make stock adjustments with proper documentation",
      "Conduct cycle counts and physical inventories",
      "Investigate and resolve discrepancies",
      "Track movement history and audit trails"
    ],
    prerequisites: [
      "Understanding of warehouse locations",
      "Completion of Stock Management training"
    ],
    sections: [
      {
        title: "Inventory Transfers",
        content: [
          "Transfers move stock between warehouses, zones, or bin locations with full traceability.",
          "In-transit inventory tracks items during transfer that haven't yet arrived at the destination.",
          "Transfer approval workflows ensure proper authorization for valuable or controlled items."
        ]
      },
      {
        title: "Stock Adjustments",
        content: [
          "Adjustments increase or decrease inventory quantities with reason codes and documentation.",
          "Common adjustment reasons include damage, expiration, found inventory, and reconciliation.",
          "Adjustment approval may be required based on value thresholds or item type."
        ]
      },
      {
        title: "Cycle Counting",
        content: [
          "Cycle counting provides ongoing accuracy validation without full physical inventory shutdown.",
          "ABC classification prioritizes high-value or high-velocity items for more frequent counting.",
          "Variance thresholds determine which discrepancies require investigation before correction."
        ]
      }
    ],
    keyTakeaways: [
      "All movements must be documented for audit trail",
      "Investigate root causes of adjustments, not just symptoms",
      "Cycle counting maintains accuracy year-round",
      "Variance analysis reveals process issues"
    ],
    practiceExercises: [
      "Create a transfer between two warehouse locations",
      "Process an adjustment for damaged inventory",
      "Conduct a cycle count and resolve variances"
    ],
    prevLesson: { title: "Warehouse Operations", href: "/docs/training-guides/inventory/warehouse-operations" },
    nextLesson: { title: "Inventory Valuation", href: "/docs/training-guides/inventory/inventory-valuation" },
    parentGuide: { title: "Inventory Training Guide", href: "/docs/training-guides/inventory" }
  },
  "inventory/inventory-valuation": {
    title: "Inventory Valuation",
    category: "Inventory",
    categoryColor: "orange",
    duration: "30 min",
    description: "Understand costing methods and generate accurate inventory valuation reports.",
    objectives: [
      "Configure inventory costing methods",
      "Calculate and update item costs",
      "Generate valuation reports",
      "Handle cost variances and adjustments",
      "Reconcile inventory to general ledger"
    ],
    prerequisites: [
      "Understanding of accounting principles",
      "Completion of Stock Management training"
    ],
    sections: [
      {
        title: "Costing Methods",
        content: [
          "FIFO (First In, First Out) assumes oldest inventory is sold first, matching during inflation.",
          "Weighted Average calculates a blended cost across all units, smoothing fluctuations.",
          "Standard costing uses predetermined costs with variance tracking for manufacturing environments."
        ]
      },
      {
        title: "Cost Calculations",
        content: [
          "Landed cost includes purchase price plus freight, duty, and handling for true item cost.",
          "Cost updates can be triggered by receipts, adjustments, or period-end recalculations.",
          "Standard cost revisions compare planned to actual costs for variance analysis."
        ]
      },
      {
        title: "Valuation Reporting",
        content: [
          "Inventory valuation reports show stock quantities times unit costs at a point in time.",
          "Aged inventory reports identify slow-moving or obsolete stock for write-down consideration.",
          "GL reconciliation ensures inventory subledger matches the general ledger control account."
        ]
      }
    ],
    keyTakeaways: [
      "Consistent costing method application is critical",
      "Landed cost gives true picture of item profitability",
      "Regular valuation reconciliation prevents surprises",
      "Monitor slow-moving inventory for obsolescence risk"
    ],
    practiceExercises: [
      "Review item costs and update with landed cost components",
      "Generate an inventory valuation report",
      "Reconcile inventory balance to the general ledger"
    ],
    prevLesson: { title: "Goods Movement", href: "/docs/training-guides/inventory/goods-movement" },
    nextLesson: { title: "Inventory Analytics", href: "/docs/training-guides/inventory/inventory-analytics" },
    parentGuide: { title: "Inventory Training Guide", href: "/docs/training-guides/inventory" }
  },
  "inventory/inventory-analytics": {
    title: "Inventory Analytics",
    category: "Inventory",
    categoryColor: "orange",
    duration: "25 min",
    description: "Use analytics to optimize inventory turnover, reduce aging, and improve efficiency.",
    objectives: [
      "Analyze inventory turnover rates",
      "Identify aging and slow-moving stock",
      "Optimize safety stock and reorder points",
      "Track fill rates and stockout metrics",
      "Create inventory dashboards"
    ],
    prerequisites: [
      "Familiarity with inventory data",
      "Completion of prior Inventory lessons"
    ],
    sections: [
      {
        title: "Turnover Analysis",
        content: [
          "Inventory turnover measures how many times stock is sold and replaced in a period.",
          "Days of supply indicates how long current inventory will last at current usage rates.",
          "Turn rate goals vary by industry and item category - set appropriate targets."
        ]
      },
      {
        title: "Aging and Obsolescence",
        content: [
          "Aging buckets show inventory by how long items have been in stock (30, 60, 90+ days).",
          "Slow-mover identification highlights items with declining velocity for markdown or disposal.",
          "Obsolescence reserves provision for expected losses on dead stock."
        ]
      },
      {
        title: "Service Level Metrics",
        content: [
          "Fill rate measures percentage of orders shipped complete from available stock.",
          "Stockout tracking identifies when and why items were unavailable for customer orders.",
          "Service level vs. inventory investment analysis optimizes the trade-off."
        ]
      }
    ],
    keyTakeaways: [
      "Balance service levels with inventory investment",
      "Address slow movers before they become obsolete",
      "Turnover benchmarking reveals improvement opportunities",
      "Regular analytics review drives continuous improvement"
    ],
    practiceExercises: [
      "Calculate turnover for your top 10 items",
      "Run an aging report and identify candidates for markdown",
      "Create a dashboard showing key inventory KPIs"
    ],
    prevLesson: { title: "Inventory Valuation", href: "/docs/training-guides/inventory/inventory-valuation" },
    parentGuide: { title: "Inventory Training Guide", href: "/docs/training-guides/inventory" }
  },
  "analytics/dashboard-builder": {
    title: "Dashboard Builder",
    category: "Analytics",
    categoryColor: "blue",
    duration: "35 min",
    description: "Create custom dashboards and visualizations to monitor key business metrics.",
    objectives: [
      "Navigate the dashboard builder interface",
      "Add and configure visualization widgets",
      "Connect data sources to visualizations",
      "Apply filters and interactivity",
      "Share and publish dashboards"
    ],
    prerequisites: [
      "Access to NexusAI Analytics module",
      "Understanding of available data sources"
    ],
    sections: [
      {
        title: "Dashboard Basics",
        content: [
          "Dashboards are collections of widgets that visualize data from across the platform.",
          "Layout options include grid-based positioning with drag-and-drop arrangement.",
          "Dashboard themes ensure consistent styling with your organization's branding."
        ]
      },
      {
        title: "Widget Types",
        content: [
          "Chart widgets include bar, line, area, pie, and combo charts for trend and comparison visualization.",
          "Table and grid widgets display detailed data with sorting, filtering, and pagination.",
          "KPI cards show single metrics with comparisons to targets or prior periods."
        ]
      },
      {
        title: "Interactivity and Sharing",
        content: [
          "Filters can be dashboard-wide or widget-specific for user exploration.",
          "Click-through drilling lets users navigate from summary to detail views.",
          "Share dashboards with individuals, groups, or publish externally with appropriate security."
        ]
      }
    ],
    keyTakeaways: [
      "Start with the questions you need to answer",
      "Choose chart types appropriate for your data",
      "Don't overcrowd dashboards - focus on key metrics",
      "Test dashboards with intended users before publishing"
    ],
    practiceExercises: [
      "Create a new dashboard with a title and theme",
      "Add three widgets: a KPI card, a chart, and a table",
      "Apply a filter that affects multiple widgets"
    ],
    nextLesson: { title: "Report Designer", href: "/docs/training-guides/analytics/report-designer" },
    parentGuide: { title: "Analytics Training Guide", href: "/docs/training-guides/analytics" }
  },
  "analytics/report-designer": {
    title: "Report Designer",
    category: "Analytics",
    categoryColor: "blue",
    duration: "40 min",
    description: "Build and customize reports with the flexible report designer.",
    objectives: [
      "Create reports from scratch or templates",
      "Configure data sources and fields",
      "Apply grouping, sorting, and summarization",
      "Format reports for printing and export",
      "Schedule automated report delivery"
    ],
    prerequisites: [
      "Understanding of data structures",
      "Completion of Dashboard Builder training"
    ],
    sections: [
      {
        title: "Report Creation",
        content: [
          "Start from a blank report or use templates for common report types.",
          "Select data sources including tables, views, or custom queries.",
          "Report wizard guides you through source selection, field placement, and grouping."
        ]
      },
      {
        title: "Design and Formatting",
        content: [
          "Bands organize content: report header/footer, page header/footer, group header/footer, detail.",
          "Expressions enable calculated fields, conditional formatting, and dynamic content.",
          "Page setup controls orientation, margins, and multi-column layouts."
        ]
      },
      {
        title: "Distribution",
        content: [
          "Export formats include PDF, Excel, Word, CSV, and HTML.",
          "Scheduled reports run automatically and deliver via email or file share.",
          "Parameterized reports prompt users for input values at runtime."
        ]
      }
    ],
    keyTakeaways: [
      "Plan report layout on paper before building",
      "Use grouping and subtotals for summarization",
      "Test with real data volumes for performance",
      "Document report purpose and audience"
    ],
    practiceExercises: [
      "Create a grouped summary report with subtotals",
      "Add a calculated field using an expression",
      "Schedule a report for weekly email delivery"
    ],
    prevLesson: { title: "Dashboard Builder", href: "/docs/training-guides/analytics/dashboard-builder" },
    nextLesson: { title: "Predictive Analytics", href: "/docs/training-guides/analytics/predictive-analytics" },
    parentGuide: { title: "Analytics Training Guide", href: "/docs/training-guides/analytics" }
  },
  "analytics/predictive-analytics": {
    title: "Predictive Analytics",
    category: "Analytics",
    categoryColor: "blue",
    duration: "45 min",
    description: "Leverage forecasting and trend analysis to anticipate future business outcomes.",
    objectives: [
      "Understand predictive modeling concepts",
      "Configure forecasting models",
      "Interpret prediction results and confidence",
      "Apply what-if scenario analysis",
      "Integrate predictions into decision-making"
    ],
    prerequisites: [
      "Statistical analysis familiarity helpful",
      "Access to historical data"
    ],
    sections: [
      {
        title: "Forecasting Fundamentals",
        content: [
          "Time series forecasting predicts future values based on historical patterns.",
          "Models account for trend (direction), seasonality (recurring patterns), and noise (random variation).",
          "Forecast accuracy is measured by comparing predictions to actual outcomes."
        ]
      },
      {
        title: "Model Configuration",
        content: [
          "Select the metric to forecast and the time horizon (days, weeks, months, years).",
          "Choose model type: moving average, exponential smoothing, or machine learning algorithms.",
          "Train models on historical data and validate against a holdout period before production use."
        ]
      },
      {
        title: "Scenario Analysis",
        content: [
          "What-if scenarios model the impact of changes to input assumptions.",
          "Sensitivity analysis identifies which variables have the biggest impact on outcomes.",
          "Monte Carlo simulation generates probability distributions for risk assessment."
        ]
      }
    ],
    keyTakeaways: [
      "Forecasts are probabilistic, not certainties",
      "More history generally improves accuracy",
      "Regular model retraining captures changing patterns",
      "Combine quantitative forecasts with qualitative judgment"
    ],
    practiceExercises: [
      "Create a sales forecast for the next quarter",
      "Compare forecast accuracy of different models",
      "Run a what-if scenario with changed assumptions"
    ],
    prevLesson: { title: "Report Designer", href: "/docs/training-guides/analytics/report-designer" },
    nextLesson: { title: "KPI Management", href: "/docs/training-guides/analytics/kpi-management" },
    parentGuide: { title: "Analytics Training Guide", href: "/docs/training-guides/analytics" }
  },
  "analytics/kpi-management": {
    title: "KPI Management",
    category: "Analytics",
    categoryColor: "blue",
    duration: "30 min",
    description: "Define and track key performance indicators to measure business success.",
    objectives: [
      "Define meaningful KPIs aligned to strategy",
      "Configure KPI calculations and targets",
      "Set up thresholds and alerts",
      "Track KPI trends over time",
      "Cascade KPIs through the organization"
    ],
    prerequisites: [
      "Understanding of business strategy",
      "Access to KPI configuration"
    ],
    sections: [
      {
        title: "KPI Definition",
        content: [
          "KPIs should be Specific, Measurable, Attainable, Relevant, and Time-bound (SMART).",
          "Balance leading indicators (predictive) with lagging indicators (results).",
          "Limit the number of KPIs to maintain focus - typically 5-7 per role or function."
        ]
      },
      {
        title: "Configuration and Tracking",
        content: [
          "Define the calculation formula, data source, and refresh frequency.",
          "Set targets with optional stretch goals for motivational purposes.",
          "Thresholds trigger visual indicators (green/yellow/red) and alert notifications."
        ]
      },
      {
        title: "Organizational Alignment",
        content: [
          "Cascading KPIs link individual metrics to team and company-level objectives.",
          "Scorecards combine multiple KPIs for holistic performance views.",
          "Regular review cadences ensure KPIs remain relevant and acted upon."
        ]
      }
    ],
    keyTakeaways: [
      "What gets measured gets managed",
      "Too many KPIs dilute focus",
      "Balance efficiency metrics with effectiveness measures",
      "Review and refine KPIs periodically"
    ],
    practiceExercises: [
      "Define a new KPI with formula and target",
      "Configure threshold alerts for a critical metric",
      "Create a scorecard view of related KPIs"
    ],
    prevLesson: { title: "Predictive Analytics", href: "/docs/training-guides/analytics/predictive-analytics" },
    nextLesson: { title: "Data Explorer", href: "/docs/training-guides/analytics/data-explorer" },
    parentGuide: { title: "Analytics Training Guide", href: "/docs/training-guides/analytics" }
  },
  "analytics/data-explorer": {
    title: "Data Explorer",
    category: "Analytics",
    categoryColor: "blue",
    duration: "25 min",
    description: "Perform ad-hoc queries and self-service data analysis to answer business questions.",
    objectives: [
      "Navigate the data explorer interface",
      "Build queries without coding knowledge",
      "Join and relate multiple data sources",
      "Pivot and aggregate data for analysis",
      "Save and share query results"
    ],
    prerequisites: [
      "Understanding of available data sources",
      "Basic familiarity with data concepts"
    ],
    sections: [
      {
        title: "Query Building",
        content: [
          "Visual query builder lets you select tables, columns, and conditions without SQL.",
          "Filters narrow results using operators like equals, contains, between, and in list.",
          "Sorting and limiting controls result set size and order."
        ]
      },
      {
        title: "Data Manipulation",
        content: [
          "Joins combine data from related tables using common keys.",
          "Grouping aggregates data by dimensions with sum, count, average, min, max functions.",
          "Pivot tables reorganize data with row and column headers for cross-tabular analysis."
        ]
      },
      {
        title: "Sharing Results",
        content: [
          "Save queries for reuse without re-building each time.",
          "Export results to Excel, CSV, or send to dashboard widgets.",
          "Schedule recurring queries to deliver updated results automatically."
        ]
      }
    ],
    keyTakeaways: [
      "Start simple and add complexity gradually",
      "Validate results against known good data",
      "Save queries you'll need again",
      "Be mindful of query performance on large datasets"
    ],
    practiceExercises: [
      "Build a query selecting customer and order data",
      "Add filters to narrow to a specific date range",
      "Create a pivot table summarizing sales by region and month"
    ],
    prevLesson: { title: "KPI Management", href: "/docs/training-guides/analytics/kpi-management" },
    parentGuide: { title: "Analytics Training Guide", href: "/docs/training-guides/analytics" }
  },
  "manufacturing/bill-of-materials": {
    title: "Bill of Materials",
    category: "Manufacturing",
    categoryColor: "purple",
    duration: "50 min",
    description: "Master BOM creation, version management, and engineering change control.",
    objectives: [
      "Create single and multi-level BOMs",
      "Manage BOM versions and effectivity dates",
      "Handle engineering changes and ECOs",
      "Configure BOM costing and yield factors",
      "Import/export BOM data"
    ],
    prerequisites: [
      "Access to NexusAI Manufacturing module",
      "Understanding of product structure"
    ],
    sections: [
      {
        title: "BOM Structure",
        content: [
          "A Bill of Materials defines parent-child relationships between assemblies and components.",
          "Single-level BOMs show immediate components; multi-level BOMs show complete structure.",
          "Quantity per assembly and unit of measure define how much of each component is needed."
        ]
      },
      {
        title: "Version Control",
        content: [
          "BOM versions track changes over time while maintaining historical records.",
          "Effectivity dates control when a BOM version is active for planning and production.",
          "Engineering Change Orders (ECOs) formally document and approve BOM modifications."
        ]
      },
      {
        title: "Cost and Yield",
        content: [
          "BOM costing rolls up component costs to calculate total manufactured cost.",
          "Scrap and yield factors account for expected losses during production.",
          "Phantom/sub-assembly items appear in planning but not as stocked intermediates."
        ]
      }
    ],
    keyTakeaways: [
      "Accurate BOMs are critical for planning and costing",
      "Version control prevents confusion in production",
      "Include all materials including consumables",
      "Regular BOM audits ensure data accuracy"
    ],
    practiceExercises: [
      "Create a multi-level BOM for a finished product",
      "Create a new BOM version with an engineering change",
      "Calculate rolled-up cost for a BOM"
    ],
    nextLesson: { title: "Routing & Work Centers", href: "/docs/training-guides/manufacturing/routing-work-centers" },
    parentGuide: { title: "Manufacturing Training Guide", href: "/docs/training-guides/manufacturing" }
  },
  "manufacturing/routing-work-centers": {
    title: "Routing & Work Centers",
    category: "Manufacturing",
    categoryColor: "purple",
    duration: "45 min",
    description: "Configure production routings, work center capacity, and scheduling parameters.",
    objectives: [
      "Define work centers with capacity parameters",
      "Create production routings with operations",
      "Configure setup and run times",
      "Handle alternative routings",
      "Understand capacity planning basics"
    ],
    prerequisites: [
      "Completion of Bill of Materials training",
      "Understanding of production process"
    ],
    sections: [
      {
        title: "Work Center Configuration",
        content: [
          "Work centers represent machines, production lines, or labor pools where operations occur.",
          "Capacity defines available hours per day/week considering shifts and maintenance windows.",
          "Cost rates for machine and labor enable operation-level costing."
        ]
      },
      {
        title: "Routing Definition",
        content: [
          "Routings specify the sequence of operations to produce an item.",
          "Each operation has a work center, setup time, run time per unit, and move time to next operation.",
          "Operation dependencies define relationships for parallel or sequential operations."
        ]
      },
      {
        title: "Scheduling Parameters",
        content: [
          "Lead time offsets account for time between operations for scheduling purposes.",
          "Queue times model waiting time before work begins at a work center.",
          "Alternative routings provide flexibility when primary resources are unavailable."
        ]
      }
    ],
    keyTakeaways: [
      "Accurate time standards enable realistic scheduling",
      "Regular capacity reviews prevent bottlenecks",
      "Include all operations including inspections",
      "Alternative routings provide production flexibility"
    ],
    practiceExercises: [
      "Configure a work center with shift calendar",
      "Create a routing with multiple operations",
      "Define an alternative routing for flexibility"
    ],
    prevLesson: { title: "Bill of Materials", href: "/docs/training-guides/manufacturing/bill-of-materials" },
    nextLesson: { title: "Work Orders", href: "/docs/training-guides/manufacturing/work-orders" },
    parentGuide: { title: "Manufacturing Training Guide", href: "/docs/training-guides/manufacturing" }
  },
  "manufacturing/work-orders": {
    title: "Work Orders",
    category: "Manufacturing",
    categoryColor: "purple",
    duration: "55 min",
    description: "Manage work order creation, release, shop floor execution, and completion.",
    objectives: [
      "Create and release work orders",
      "Pick materials and report production",
      "Track labor and machine time",
      "Handle scrap and rework",
      "Complete and close work orders"
    ],
    prerequisites: [
      "Completion of BOM and Routing training",
      "Access to production module"
    ],
    sections: [
      {
        title: "Work Order Creation",
        content: [
          "Work orders can be created manually, from sales orders, or generated by MRP planning.",
          "Required information includes item, quantity, due date, and BOM/Routing versions.",
          "Work order status tracks progression: Planned, Released, In Progress, Complete."
        ]
      },
      {
        title: "Shop Floor Execution",
        content: [
          "Material picking issues components from inventory to work-in-progress (WIP).",
          "Operation reporting captures actual start/end times and quantities produced.",
          "Labor collection records worker time against operations for costing and efficiency tracking."
        ]
      },
      {
        title: "Completion and Costing",
        content: [
          "Work order completion receives finished goods into inventory at calculated cost.",
          "Variance analysis compares actual costs to standard for material, labor, and overhead.",
          "Close work orders after all costs are recorded and variances are dispositioned."
        ]
      }
    ],
    keyTakeaways: [
      "Release only what shop floor can execute",
      "Timely reporting ensures accurate WIP tracking",
      "Investigate significant variances from standard",
      "Close orders promptly for accurate inventory valuation"
    ],
    practiceExercises: [
      "Create and release a work order",
      "Report production progress on an operation",
      "Complete a work order and review variances"
    ],
    prevLesson: { title: "Routing & Work Centers", href: "/docs/training-guides/manufacturing/routing-work-centers" },
    nextLesson: { title: "MRP & Planning", href: "/docs/training-guides/manufacturing/mrp-planning" },
    parentGuide: { title: "Manufacturing Training Guide", href: "/docs/training-guides/manufacturing" }
  },
  "manufacturing/mrp-planning": {
    title: "MRP & Planning",
    category: "Manufacturing",
    categoryColor: "purple",
    duration: "60 min",
    description: "Master Material Requirements Planning (MRP) and production scheduling.",
    objectives: [
      "Understand MRP logic and calculations",
      "Configure planning parameters",
      "Execute MRP runs and review results",
      "Manage planned orders and firm orders",
      "Balance demand and capacity"
    ],
    prerequisites: [
      "Understanding of BOMs and Routings",
      "Familiarity with inventory concepts"
    ],
    sections: [
      {
        title: "MRP Fundamentals",
        content: [
          "MRP explodes demand through BOM structures to determine material and capacity requirements.",
          "Gross requirements minus projected available yield net requirements for action.",
          "MRP actions include planned orders, purchase requisitions, and reschedule recommendations."
        ]
      },
      {
        title: "Planning Configuration",
        content: [
          "Planning horizons define how far into the future MRP calculates.",
          "Time fences control when planned orders can be automatically changed vs. requiring manual review.",
          "Safety stock and safety lead time add buffers for uncertainty."
        ]
      },
      {
        title: "Capacity Planning",
        content: [
          "Rough-cut capacity planning validates that resources exist to meet the master schedule.",
          "Capacity Requirements Planning (CRP) details workload by work center and time period.",
          "Load leveling adjusts order timing to balance workload across resources."
        ]
      }
    ],
    keyTakeaways: [
      "MRP is only as good as its input data",
      "Review and act on exception messages promptly",
      "Balance service levels with inventory investment",
      "Capacity constraints must be considered alongside materials"
    ],
    practiceExercises: [
      "Execute an MRP run and review planned orders",
      "Firm a planned order for release",
      "Analyze capacity load and identify bottlenecks"
    ],
    prevLesson: { title: "Work Orders", href: "/docs/training-guides/manufacturing/work-orders" },
    nextLesson: { title: "Quality Control", href: "/docs/training-guides/manufacturing/quality-control" },
    parentGuide: { title: "Manufacturing Training Guide", href: "/docs/training-guides/manufacturing" }
  },
  "manufacturing/quality-control": {
    title: "Quality Control",
    category: "Manufacturing",
    categoryColor: "purple",
    duration: "40 min",
    description: "Implement inspection plans, manage non-conformances, and track quality metrics.",
    objectives: [
      "Define inspection plans and checklists",
      "Process quality inspections",
      "Manage non-conformance reports (NCRs)",
      "Track corrective and preventive actions",
      "Analyze quality metrics and trends"
    ],
    prerequisites: [
      "Understanding of quality requirements",
      "Access to quality module"
    ],
    sections: [
      {
        title: "Inspection Planning",
        content: [
          "Inspection plans define what, when, and how to inspect during production.",
          "Sampling rules determine inspection frequency: 100%, statistical sampling, or skip-lot.",
          "Checklists guide inspectors through required measurements and visual checks."
        ]
      },
      {
        title: "Non-Conformance Management",
        content: [
          "NCRs document any deviation from specifications or standards.",
          "Disposition options include use-as-is, rework, scrap, or return to vendor.",
          "Root cause analysis identifies systemic issues beyond the immediate defect."
        ]
      },
      {
        title: "Continuous Improvement",
        content: [
          "Corrective Action/Preventive Action (CAPA) tracks long-term quality improvement initiatives.",
          "Quality metrics include defect rates, first-pass yield, and cost of quality.",
          "Statistical Process Control (SPC) charts monitor process stability over time."
        ]
      }
    ],
    keyTakeaways: [
      "Prevention is more cost-effective than detection",
      "Document all non-conformances for trend analysis",
      "Root cause analysis prevents recurrence",
      "Quality is everyone's responsibility"
    ],
    practiceExercises: [
      "Create an inspection plan for a production operation",
      "Record a non-conformance and assign disposition",
      "Track quality metrics on a control chart"
    ],
    prevLesson: { title: "MRP & Planning", href: "/docs/training-guides/manufacturing/mrp-planning" },
    nextLesson: { title: "Maintenance", href: "/docs/training-guides/manufacturing/maintenance" },
    parentGuide: { title: "Manufacturing Training Guide", href: "/docs/training-guides/manufacturing" }
  },
  "manufacturing/maintenance": {
    title: "Maintenance",
    category: "Manufacturing",
    categoryColor: "purple",
    duration: "35 min",
    description: "Manage preventive maintenance programs and equipment tracking.",
    objectives: [
      "Configure equipment and asset records",
      "Schedule preventive maintenance",
      "Track work orders and repairs",
      "Monitor equipment performance metrics",
      "Plan maintenance resources"
    ],
    prerequisites: [
      "Understanding of equipment in use",
      "Access to maintenance module"
    ],
    sections: [
      {
        title: "Equipment Management",
        content: [
          "Equipment records capture specifications, location, purchase info, and warranty details.",
          "Hierarchy links child components (motors, sensors) to parent equipment for relationship tracking.",
          "Documentation attaches manuals, diagrams, and maintenance procedures."
        ]
      },
      {
        title: "Preventive Maintenance",
        content: [
          "PM schedules trigger maintenance activities based on time, usage, or condition.",
          "Work orders are auto-generated from PM schedules with required tasks and parts.",
          "Maintenance calendars show scheduled activities alongside production plans."
        ]
      },
      {
        title: "Performance Tracking",
        content: [
          "Mean Time Between Failures (MTBF) measures equipment reliability.",
          "Mean Time To Repair (MTTR) tracks maintenance efficiency.",
          "Overall Equipment Effectiveness (OEE) combines availability, performance, and quality."
        ]
      }
    ],
    keyTakeaways: [
      "Preventive maintenance prevents costly breakdowns",
      "Track all maintenance for total cost of ownership",
      "Use data to optimize PM frequencies",
      "OEE provides holistic equipment performance view"
    ],
    practiceExercises: [
      "Create an equipment record with specifications",
      "Set up a preventive maintenance schedule",
      "Calculate OEE for a piece of equipment"
    ],
    prevLesson: { title: "Quality Control", href: "/docs/training-guides/manufacturing/quality-control" },
    parentGuide: { title: "Manufacturing Training Guide", href: "/docs/training-guides/manufacturing" }
  }
};

const categoryColors: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  green: { bg: "bg-green-100", text: "text-green-600", darkBg: "dark:bg-green-900", darkText: "dark:text-green-400" },
  blue: { bg: "bg-blue-100", text: "text-blue-600", darkBg: "dark:bg-blue-900", darkText: "dark:text-blue-400" },
  teal: { bg: "bg-teal-100", text: "text-teal-600", darkBg: "dark:bg-teal-900", darkText: "dark:text-teal-400" },
  orange: { bg: "bg-orange-100", text: "text-orange-600", darkBg: "dark:bg-orange-900", darkText: "dark:text-orange-400" },
  purple: { bg: "bg-purple-100", text: "text-purple-600", darkBg: "dark:bg-purple-900", darkText: "dark:text-purple-400" }
};

export default function TrainingLessonPage() {
  const [, params] = useRoute("/docs/training-guides/:category/:lesson");
  const lessonKey = params ? `${params.category}/${params.lesson}` : "";
  const lesson = lessonContent[lessonKey];

  useEffect(() => {
    if (lesson) {
      document.title = `${lesson.title} - ${lesson.category} Training | NexusAI ERP`;
    }
  }, [lesson]);

  if (!lesson) {
    return (
      <div className="public-page min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Lesson Not Found</h1>
            <p className="text-muted-foreground mb-6">The training lesson you're looking for doesn't exist.</p>
            <Link to="/docs/training-guides">
              <Button data-testid="button-back-to-guides">Back to Training Guides</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const colors = categoryColors[lesson.categoryColor] || categoryColors.blue;

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="px-4 py-12 max-w-4xl mx-auto">
          <Link to={lesson.parentGuide.href}>
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              <ArrowLeft className="mr-2 w-4 h-4" /> Back to {lesson.parentGuide.title}
            </Button>
          </Link>
          
          <div className="flex items-start gap-4 mb-6">
            <div className={`p-3 rounded-lg ${colors.bg} ${colors.darkBg}`}>
              <GraduationCap className={`w-8 h-8 ${colors.text} ${colors.darkText}`} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge>{lesson.category}</Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {lesson.duration}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold" data-testid="text-lesson-title">{lesson.title}</h1>
            </div>
          </div>
          
          <p className="text-lg text-muted-foreground mb-8">{lesson.description}</p>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5" /> Learning Objectives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {lesson.objectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {lesson.prerequisites.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="w-5 h-5" /> Prerequisites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {lesson.prerequisites.map((prereq, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span>{prereq}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {lesson.sections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> {section.title}
              </h2>
              <div className="space-y-4 pl-7">
                {section.content.map((para, paraIdx) => (
                  <p key={paraIdx} className="text-muted-foreground leading-relaxed">{para}</p>
                ))}
              </div>
            </div>
          ))}

          <Card className="mb-8 border-green-200 dark:border-green-800">
            <CardHeader className="bg-green-50 dark:bg-green-900/30">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="w-5 h-5 text-green-600" /> Key Takeaways
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {lesson.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Play className="w-5 h-5" /> Practice Exercises
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 list-decimal list-inside">
                {lesson.practiceExercises.map((exercise, idx) => (
                  <li key={idx} className="text-muted-foreground">{exercise}</li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <div className="flex flex-wrap justify-between gap-4 pt-6 border-t">
            {lesson.prevLesson ? (
              <Link to={lesson.prevLesson.href}>
                <Button variant="outline" data-testid="button-prev-lesson">
                  <ArrowLeft className="mr-2 w-4 h-4" /> {lesson.prevLesson.title}
                </Button>
              </Link>
            ) : (
              <div />
            )}
            {lesson.nextLesson ? (
              <Link to={lesson.nextLesson.href}>
                <Button data-testid="button-next-lesson">
                  {lesson.nextLesson.title} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Link to={lesson.parentGuide.href}>
                <Button data-testid="button-complete">
                  Complete Module <CheckCircle2 className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
