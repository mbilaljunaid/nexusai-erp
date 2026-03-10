import {
    BookOpen,
    CreditCard,
    PieChart,
    Landmark,
    Globe,
    BarChart3,
    Zap,
    ShieldCheck,
    FileText,
    Users,
    Percent,
    Receipt,
    Scale,
    MessageSquare,
    Monitor,
    RefreshCw,
    TrendingUp,
    ArrowRightLeft,
    Factory,
    Package,
    ShoppingBag,
    HardHat,
    Building2,
    LayoutDashboard,
    ScanBarcode,
    BookCopy,
    Settings,
    Activity,
    Send,
    Calendar,
    Brain,
    Calculator,
    ArrowLeftRight,
    ClipboardList,
    FileCheck,
    FileSignature,
    FlaskConical,
    Layers,
    Truck,
    AlertCircle,
    Briefcase,
    CalendarRange,
    ClipboardCheck,
    Clock,
    Hammer,
    Handshake,
    Headphones,
    ListTodo,
    Map,
    Megaphone,
    Navigation,
    Repeat,
    Ruler,
    Siren,
    Smartphone,
    Wrench,
    Plane,
    GitMerge,
    Key,
    DollarSign,
    BookMarked,
    FolderKanban,
    Coins,
    Anchor,
    Store,
    UserCheck,
    LineChart,
    Lock,
    GraduationCap,
    Database,
    Sigma
} from "lucide-react";

export interface ModuleData {
    slug: string;
    title: string;
    description: string;
    category: "Finance" | "SCM" | "HR" | "CRM" | "Operations" | "Specialized";
    icon: any;
    heroGradient: string;
    features: {
        title: string;
        description: string;
        icon: any;
    }[];
    benefits: {
        title: string;
        description: string;
    }[];
}

export const modules: Record<string, ModuleData> = {
    // --- FINANCE & OPERATIONS ---
    "general-ledger": {
        slug: "general-ledger",
        title: "General Ledger & Forecasting",
        description: "The central nervous system of your financial data. Real-time recording, reporting, and AI-driven compliance with full Oracle Fusion parity across all 15 canonical levels.",
        category: "Finance",
        icon: BookOpen,
        heroGradient: "from-blue-600 to-indigo-700",
        features: [
            { title: "Multi-Entity & Multi-Ledger", description: "Manage multiple subsidiaries and ledger sets in a single instance with automated intercompany balancing and data access sets (DAS) for strict security.", icon: Globe },
            { title: "Dynamic Chart of Accounts", description: "Fully configurable COA segments, value sets, and hierarchies via the Functional Setup Manager pattern — no engineering support required.", icon: BookOpen },
            { title: "Subledger Accounting Engine", description: "All accounting flows through the SLA rules engine, never directly to GL journal lines — fully Oracle-aligned with configurable posting rules and auto-reverse.", icon: Zap },
            { title: "Real-Time Reporting & FSG", description: "Instant financial statements, trial balances, and drill-down from report to journal to source transaction with the Financial Statement Generator engine.", icon: BarChart3 },
            { title: "AI Variance Analysis", description: "Agentic AI for natural language journal entry creation and intelligent variance explanation — capabilities that exceed standard Oracle Fusion.", icon: Brain },
            { title: "Async Posting & Period Control", description: "Background worker pattern for high-volume journal posting with strict period lock enforcement and Cross-Validation Rules (CVR).", icon: ShieldCheck },
        ],
        benefits: [
            { title: "50% Faster Close", description: "Reduce month-end close time with automated period-end tasks, dependency tracking, and the Close Monitor dashboard." },
            { title: "Zero Audit Risk", description: "Complete immutable traceability for every transaction, configuration change, and SLA rule execution." },
            { title: "Enterprise Scale", description: "Asynchronous posting workers handle 10,000+ journal lines without system timeout or performance degradation." },
            { title: "Global Compliance", description: "Multi-GAAP parallel ledgers, multi-currency translation rules, and intercompany balancing for complex group structures." },
        ]
    },
    "accounts-payable": {
        slug: "accounts-payable",
        title: "Accounts Payable & Payments",
        description: "End-to-end P2P automation from multimodal AI invoice capture to ISO20022 treasury connectivity—100% Oracle Fusion parity across all 23 AP dimensions.",
        category: "Finance",
        icon: CreditCard,
        heroGradient: "from-emerald-500 to-teal-600",
        features: [
            { title: "AI Multimodal Invoice Capture", description: "GPT-4o and Whisper-powered capture from PDFs, images, audio recordings, and Excel files — with a user-in-the-loop validation UI before any data is committed.", icon: FileText },
            { title: "2-Way & 3-Way Matching", description: "Automated invoice-to-PO-to-receipt matching with multi-level variance holds and a complete hold-release approval workflow.", icon: Zap },
            { title: "Multi-Tier Withholding Tax", description: "Priority-based WHT group evaluation across Federal and State tiers with real accounting distributions posted to tax liability accounts.", icon: Percent },
            { title: "ISO20022 Payment Factory", description: "Centralized PPR payment runs with pain.001 XML generation for full treasury integration and IBAN/SWIFT supplier site parity.", icon: Landmark },
            { title: "Automated Intercompany Balancing", description: "SLA engine auto-inserts Intercompany Receivable/Payable lines to balance legal entities on cross-BSV journals—no manual intervention.", icon: RefreshCw },
            { title: "5-Bucket Aging & Audit Trail", description: "Subledger period close with full readiness checks, immutable audit logs, and 5-bucket aging reports for payables management.", icon: ShieldCheck },
        ],
        benefits: [
            { title: "90% Touchless Invoices", description: "Slash processing costs with AI-driven capture and automated 3-way matching eliminating manual data entry." },
            { title: "Zero Fraud Risk", description: "Duplicate invoice detection, policy enforcement, and SoD-enforced approval routing prevent payment errors." },
            { title: "Treasury Integration", description: "Native ISO20022 connectivity ensures seamless bank payment execution without middleware." },
            { title: "Tax Compliance Everywhere", description: "Multi-tier WHT calculations with real GL distributions satisfy global tax authority requirements." },
        ]
    },
    "accounts-receivable": {
        slug: "accounts-receivable",
        title: "Accounts Receivable & Collections",
        description: "Accelerate cash inflow with Oracle TCA-aligned customer hierarchies, automated revenue recognition, AI-driven dunning, and full SLA subledger integration.",
        category: "Finance",
        icon: PieChart,
        heroGradient: "from-purple-600 to-violet-700",
        features: [
            { title: "TCA Customer Hierarchy", description: "Oracle-aligned Party → Account → Site customer model supporting complex B2B hierarchies, global accounts, and consolidated billing.", icon: Users },
            { title: "Smart Auto-Invoice", description: "Flexible billing rules supporting standard invoices, credit memos, debit memos, and chargebacks with configurable payment terms.", icon: Receipt },
            { title: "ASC 606 Revenue Schedules", description: "Automated generation of ar_revenue_schedules for deferred and recognized revenue with bulk sweep processing for period-end.", icon: Scale },
            { title: "AI Collections & Dunning", description: "Async dunning workers with predictive credit scoring prevent server timeouts on 10,000+ invoice portfolios.", icon: MessageSquare },
            { title: "Receipt Application & Reversal", description: "Full receipt apply/unapply lifecycle with SLA event reversal, ensuring accounting mistakes can always be corrected.", icon: RefreshCw },
            { title: "Customer Self-Service Portal", description: "Branded portal for customers to view statements, submit disputes, and make payments — reducing collections workload.", icon: Monitor },
        ],
        benefits: [
            { title: "30% Lower DSO", description: "Reduce Days Sales Outstanding with proactive AI collections and automated dunning strategies." },
            { title: "Revenue Compliance", description: "Automated ASC 606/IFRS 15 schedules eliminate manual spreadsheet revenue recognition." },
            { title: "Enterprise Scale", description: "Async workers prevent system timeouts when processing dunning runs for large invoice portfolios." },
            { title: "Accounting Integrity", description: "Full unapply lifecycle ensures reversible receipt application — no permanent accounting traps." },
        ]
    },
    "cash-management": {
        slug: "cash-management",
        title: "Cash Management & Treasury",
        description: "Real-time global liquidity visibility with autonomous ZBA sweeps, ISO20022 statement processing, FX revaluation, and AI-driven forecasting—100% Oracle Fusion parity.",
        category: "Finance",
        icon: Landmark,
        heroGradient: "from-amber-500 to-orange-600",
        features: [
            { title: "Multi-Format Statement Processing", description: "Native parsers for ISO20022 CAMT.052 (intraday) and CAMT.053 (prior-day), MT940, and BAI2 bank statement formats.", icon: FileText },
            { title: "Smart Auto-Reconciliation", description: "Tolerance-based matching engine with regex rules and AI-description clustering reconciles high-volume statement lines automatically.", icon: RefreshCw },
            { title: "Multi-Scenario Cash Forecasting", description: "Scenario-based (Baseline, Optimistic, Pessimistic) forecasts sourced from AP, AR, payroll, and manual entries with AI anomaly detection.", icon: TrendingUp },
            { title: "Autonomous ZBA Sweep Engine", description: "Cron-based hourly sweep orchestration with Maker-Checker approval — fully configured notional pooling to minimize external bank fees.", icon: ArrowRightLeft },
            { title: "Dynamic FX Revaluation", description: "Automated unrealized FX gain/loss calculation using live gl_daily_rates with SLA-based journal posting to GL.", icon: Globe },
            { title: "Auditor-Grade Reporting", description: "PDF reconciliation reports with immutable audit trails for all bank account moves, matches, and approval events.", icon: ShieldCheck },
        ],
        benefits: [
            { title: "Liquidity Optimization", description: "Autonomous sweep engine maximizes interest income and minimizes borrowing costs without manual intervention." },
            { title: "100% Statement Coverage", description: "Support for CAMT.052 intraday positioning means no liquidity blind spots throughout the trading day." },
            { title: "Audit Readiness", description: "Every bank account movement is logged immutably with full maker-checker audit history for regulators." },
            { title: "FX Risk Elimination", description: "Dynamic revaluation prevents accumulated FX exposure from distorting period-end financial statements." },
        ]
    },
    "fixed-assets": {
        slug: "fixed-assets",
        title: "Fixed Assets & Lease Accounting",
        description: "Complete asset lifecycle management with multi-book depreciation, IFRS 16/ASC 842 lease compliance, async processing, and physical inventory tracking—all fully Oracle parity.",
        category: "Finance",
        icon: Building2,
        heroGradient: "from-blue-500 to-cyan-600",
        features: [
            { title: "Full Asset Lifecycle", description: "Add, transfer, impair, reinstate, and retire assets with approval workflows — full parity with Oracle Fusion FA including location and CCID transfers.", icon: Building2 },
            { title: "Multi-Book Depreciation Engine", description: "Parallel corporate, tax, and local GAAP depreciation books using Straight-Line, Declining Balance, and Units-of-Production methods — async background worker for enterprise volumes.", icon: BookCopy },
            { title: "IFRS 16 / ASC 842 Lease Accounting", description: "Automated present-value calculations, right-of-use asset creation, and lease liability amortization schedule tracking for full compliance.", icon: Calculator },
            { title: "Physical Inventory & Scanning", description: "Mobile barcode/QR scan recording with reconciliation reports that automatically flag location or existence discrepancies.", icon: ScanBarcode },
            { title: "Agentic AI Depreciation", description: "FA_CREATE_ASSET and FA_RUN_DEPRECIATION registered as agentic actions — natural language asset creation and automated depreciation runs.", icon: Brain },
            { title: "Full SLA Integration", description: "Every asset event (addition, depreciation, impairment, retirement) is mapped to Subledger Accounting rules for consistent GL posting.", icon: Zap },
        ],
        benefits: [
            { title: "Regulatory Compliance", description: "100% adherence to IFRS 16, ASC 842, and local tax depreciation rules verified across all book types." },
            { title: "Asset Maximization", description: "Physical inventory scanning with mismatch detection reduces ghost assets and optimizes utilization." },
            { title: "Processing Speed", description: "Async depreciation worker eliminates timeouts for large asset registries with thousands of items." },
            { title: "Audit Integrity", description: "Full reversible lifecycle (reinstatement after retirement) ensures accounting accuracy is always restorable." },
        ]
    },
    "tax-management": {
        slug: "tax-management",
        title: "Global Tax Engine",
        description: "100% Tier-1 enterprise-ready tax determination, calculation, and reporting — covering VAT/GST, cross-border RCM, deep GL reconciliation, and dynamic jurisdiction extensibility.",
        category: "Finance",
        icon: Percent,
        heroGradient: "from-emerald-600 to-green-700",
        features: [
            { title: "Place-of-Supply Determination", description: "Destination-based and configurable nexus one-to-many logic with full support for VAT, GST, and US Sales Tax across all jurisdictions.", icon: Globe },
            { title: "Reverse Charge Mechanism", description: "Automatic detection of cross-border B2B transactions with auto-adjustment of tax liabilities for RCM compliance—no manual overrides needed.", icon: ArrowLeftRight },
            { title: "Recoverability & Exemptions", description: "Recoverable vs. expense tax logic, partial recovery rates, and exemption certificates for procurement and sales transactions.", icon: ShieldCheck },
            { title: "Deep GL Reconciliation", description: "TaxReportingService verifies tax engine totals against GL control accounts with automated period-end scheduling and tax return generation.", icon: RefreshCw },
            { title: "Plugin Jurisdiction Registry", description: "registerJurisdiction API enables adding new countries and tax logic as data/plugins without any code changes — true enterprise extensibility.", icon: Settings },
            { title: "Quote-to-Cash Tax Hooks", description: "Fully integrated with AR, AP, Inventory, and GL — tax calculated and posted at every transaction touchpoint across the entire ERP.", icon: Zap },
        ],
        benefits: [
            { title: "Zero Audit Risk", description: "Accurate automated calculations with immutable audit trails minimize exposure to tax authority penalties." },
            { title: "Global Scale", description: "Add new go-live geographies by configuring data, not modifying code — the engine adapts automatically." },
            { title: "Cash Flow Optimization", description: "Accurate recoverability logic prevents over-payment of irrecoverable VAT on procurement." },
            { title: "Compliance Assurance", description: "Automated GL reconciliation reports prove tax liability accuracy to external auditors." },
        ]
    },
    "treasury": {
        slug: "treasury",
        title: "Corporate Treasury",
        description: "Institutional-grade treasury management with 100% Oracle Fusion parity — FX hedging, VaR analytics, multilateral netting, SoD enforcement, and ISO20022 payment hub.",
        category: "Finance",
        icon: Landmark,
        heroGradient: "from-amber-600 to-yellow-700",
        features: [
            { title: "Debt & Investment Lifecycle", description: "Full amortized-cost lifecycle for fixed/floating rate instruments with P&I calculation, interest accruals, and GL posting via the SLA engine.", icon: TrendingUp },
            { title: "FX Hedging & Mark-to-Market", description: "Forward contract and swap linkage with real-time MtM valuation, hedge effectiveness testing, and automated unrealized P&L posting to GL.", icon: Activity },
            { title: "SoD Deal Confirmation", description: "Front-office/back-office segregation of duties enforced at the deal confirmation layer — trader cannot confirm their own deal, satisfying SOX treasury controls.", icon: ShieldCheck },
            { title: "Multilateral Intercompany Netting", description: "Auto-detection of netting candidates from AP/AR history, batch-level approvals, and auto-journal generation to internal clearing accounts — eliminates 95% of intercompany wire fees.", icon: RefreshCw },
            { title: "AI Risk Analytics (VaR)", description: "Value at Risk (VaR) and Portfolio Duration metrics provide institutional-grade exposure visibility — risk metrics surface real-time in the Treasury Command Center.", icon: Brain },
            { title: "SWIFT gpi & ISO20022 Payment Hub", description: "Centralized payment transmission hub with real-time SWIFT gpi tracking, pain.001 generation, and multi-bank connectivity for all treasury settlements.", icon: Send },
        ],
        benefits: [
            { title: "95% Fee Reduction", description: "Multilateral netting eliminates intercompany bank wire fees for the vast majority of intercompany cash flows." },
            { title: "SOX-Safe Operations", description: "Enforced SoD between front and back office eliminates compliance risk in treasury deal management." },
            { title: "Margin Protection", description: "Proactive FX hedging and MtM visibility protect operating margins from currency volatility." },
            { title: "Real-Time Visibility", description: "Unified Treasury Command Center surfaces liquidity, risk, and deal status in a single institutional-grade dashboard." },
        ]
    },
    "epm-planning": {
        slug: "epm-planning",
        title: "Enterprise Performance Management",
        description: "CFO-grade unified planning platform covering strategic, financial, workforce, CapEx, and operational planning — enterprise-grade with Python ML bridge and AI-driven scenario analysis.",
        category: "Finance",
        icon: TrendingUp,
        heroGradient: "from-violet-600 to-purple-700",
        features: [
            { title: "Strategic & Long-Range Planning", description: "3-5-10 year LRP generation with M&A simulation, capital structure modeling, and macroeconomic factor integration (inflation, FX, interest rates).", icon: Globe },
            { title: "Integrated Financial Planning", description: "P&L, Balance Sheet, and Cash Flow planning with Zero-Based Budgeting packages, encumbrance/commitment control, and budget variance analysis.", icon: LayoutDashboard },
            { title: "Rolling Forecasts & Flash Reporting", description: "12/18/24-month continuous rolling forecasts with dynamic seeding from actuals, daily/weekly sales flash reports, and goal-seeking driver calculations.", icon: Calendar },
            { title: "Workforce Planning", description: "Headcount planning with new hire/termination modeling, compensation scenarios (salary, merit, bonus), multi-jurisdiction tax burden, and strategic skills gap analysis.", icon: Users },
            { title: "CapEx & Project Planning", description: "New asset ROI analysis, depreciation/amortization simulation, project EAC/ETC estimation, and Percentage-of-Completion modeling for project-centric enterprises.", icon: Building2 },
            { title: "AI Predictive Forecasting", description: "Python ML bridge for custom forecasting models integrated via PredictiveForecastingService — anomaly detection and variance validation to challenge plan assumptions.", icon: Brain },
        ],
        benefits: [
            { title: "Strategic Agility", description: "React to market shifts in hours not weeks with continuous driver-based rolling forecasts." },
            { title: "Cross-Functional Alignment", description: "Single platform connects Finance, HR, Operations, and Sales planning — eliminating siloed spreadsheets." },
            { title: "CFO Confidence", description: "AI anomaly detection flags plan inconsistencies before board presentations, reducing reforecast cycles." },
            { title: "Enterprise Database Scale", description: "Partitioned plan_units table handles 1M+ planning cells without performance degradation." },
        ]
    },

    "financial-close": {
        slug: "financial-close",
        title: "Financial Close & Consolidation",
        description: "Oracle FCCS-aligned close center with dependency-graph orchestration, real currency translation math, elimination rule execution, and AI delay prediction.",
        category: "Finance",
        icon: PieChart,
        heroGradient: "from-indigo-900 to-slate-800",
        features: [
            { title: "Close Orchestration Engine", description: "Dependency-graph task management tracks every close milestone across entities — controllers see a live dashboard with blocking task indicators and estimated completion.", icon: Activity },
            { title: "Journal Processing Hub", description: "Batch journal management with spreadsheet-style high-volume entry, approval routing, Excel import, and auto-post/auto-reverse rules.", icon: FileText },
            { title: "Global Consolidation", description: "Full translation engine using gl_daily_rates for foreign balance conversion and configurable elimination rules to generate intercompany offset journals.", icon: Globe },
            { title: "FX Revaluation Engine", description: "Automated unrealized FX gain/loss calculation and SLA-based GL posting for period-end currency revaluation — zero manual spreadsheet work.", icon: RefreshCw },
            { title: "AI Smart Close", description: "ClosePredictionModel detects likely delays and anomalies before they impact the close date — proactive alerts surface in the Close Center dashboard.", icon: Brain },
            { title: "Ledger Sets & Elimination Rules", description: "Configurable consolidation structures with gl_ledger_sets defining hierarchies, gl_elimination_definitions for intercompany matching, and multi-GAAP reporting support.", icon: BookCopy },
        ],
        benefits: [
            { title: "Days Faster Close", description: "Automated orchestration with dependency graphs reduces the close cycle by eliminating coordination bottlenecks." },
            { title: "Audit-Ready Consolidation", description: "Real translation and elimination math with full journal traceability satisfies group accounting audit requirements." },
            { title: "Zero FX Distortion", description: "Automated period-end revaluation ensures balance sheet FX exposure is accurately captured every month." },
            { title: "Predictive Control", description: "AI delay prediction allows finance leaders to intervene before the close date is missed." },
        ]
    },
    // --- PLACEHOLDERS ---
    "inventory": {
        slug: "inventory",
        title: "Inventory Management",
        description: "Enterprise-grade multi-org inventory with Lot/Serial control, FIFO/Average costing, hard/soft reservations, ATP, and cycle counting — 100% Oracle Fusion parity across all 15 canonical levels.",
        category: "SCM",
        icon: Package,
        heroGradient: "from-yellow-500 to-amber-600",
        features: [
            { title: "Multi-Org & Locator Structure", description: "Hierarchical organization with subinventories and locators — full Oracle Fusion topology for granular warehouse organization and locator-controlled picking.", icon: Globe },
            { title: "Lot & Serial Item Control", description: "Complete lot genealogy and serial number tracking with item attribute control — supports full backward traceability for regulatory and quality compliance.", icon: ScanBarcode },
            { title: "FIFO / Average Costing Engine", description: "Real-time cost layer valuation with CstTransactionCost records for every material movement, ensuring accurate inventory valuation on the balance sheet.", icon: Calculator },
            { title: "Hard & Soft Reservations + ATP", description: "Reserve specific lots or quantities (hard) or allocate from available pool (soft) with real-time Available-to-Promise calculations for order fulfillment.", icon: ShieldCheck },
            { title: "Min-Max Replenishment Planning", description: "Automated PlanningService triggers replenishment requisitions when stock drops below minimum thresholds, preventing stockouts without manual intervention.", icon: RefreshCw },
            { title: "Cycle Counting & Accuracy", description: "Snapshot-based cycle count workbench with mobile scanning, automatic adjustment creation, and reconciliation reports for continuous inventory accuracy.", icon: ClipboardList },
        ],
        benefits: [
            { title: "Zero Inventory Surprises", description: "Real-time costing and ATP ensure every order promise is backed by actual available inventory." },
            { title: "Regulatory Traceability", description: "Full lot genealogy from receipt to customer shipment satisfies FDA, ISO, and audit traceability requirements." },
            { title: "Working Capital Optimization", description: "Automated min-max replenishment prevents both stockouts and overstock, directly improving cash flow." },
            { title: "Accounting Integrity", description: "Every transaction posts a cost layer record, keeping inventory valuation always in sync with the General Ledger." },
        ]
    },
    "procurement": {
        slug: "procurement",
        title: "Procurement & Sourcing",
        description: "100% Oracle Fusion parity end-to-end — from self-service requisitioning to AP payment with real-time budgetary control, GL integration, sourcing RFQ, and AI-driven spend insights.",
        category: "SCM",
        icon: ShoppingBag,
        heroGradient: "from-cyan-500 to-blue-600",
        features: [
            { title: "Self-Service Requisitioning", description: "Amazon-like catalog shopping with built-in policy checks, approval routing, and direct PO conversion — employees buy compliantly without finance intervention.", icon: ShoppingBag },
            { title: "Competitive Sourcing (RFQ)", description: "Full RFQ/RFP lifecycle with side-by-side supplier quote comparison, award workflow, and automatic PO creation from winning bid.", icon: FileCheck },
            { title: "Real-Time Budgetary Control", description: "Requisitions perform live funds checks against EPM budgets and trigger encumbrance (reservation) upon approval — preventing overspend before it happens.", icon: ShieldCheck },
            { title: "GL & AP Integration", description: "Receipt accruals and AP invoices post automatically to the GL via GlIntegrationService — no manual journal entry required for the P2P cycle.", icon: Zap },
            { title: "Returns & Corrections", description: "Full receipt return and debit memo lifecycle with automated AP credit processing and inventory adjustment — matches Oracle Fusion Purchasing returns.", icon: RefreshCw },
            { title: "AI Procurement Intelligence", description: "Rule-based AI insights for supplier risk scoring, reorder recommendations, and payment timing optimization — surfaced on the Procurement Dashboard.", icon: Brain },
        ],
        benefits: [
            { title: "100% Spend Visibility", description: "Procurement Dashboard with Spend by Supplier and PO Status analytics gives CFOs instant control of purchasing activity." },
            { title: "Zero Budget Overruns", description: "Real-time encumbrance accounting stops unauthorized spend before it hits the GL." },
            { title: "Straight-Through P2P", description: "Automated receipt accruals and AP posting eliminate manual intermediate steps in the purchase-to-pay cycle." },
            { title: "Supplier Risk Management", description: "AI-driven supplier risk scoring surfaces concentration and performance risks before they become supply chain disruptions." },
        ]
    },
    "manufacturing": {
        slug: "manufacturing",
        title: "Manufacturing Execution (MES)",
        description: "Complete discrete and process manufacturing with Formula Designer, Recipe Manager, Batch Workbench, Lot Genealogy, LIMS quality, MRP planning, and costing — fully build-approved.",
        category: "SCM",
        icon: Factory,
        heroGradient: "from-orange-500 to-red-600",
        features: [
            { title: "Discrete & BOM Management", description: "Version-controlled Bills of Materials with component substitution and engineering change order support for make-to-stock and make-to-order production.", icon: ClipboardList },
            { title: "Process Formula & Recipe Manager", description: "Formula Designer for ingredient/yield management linked to the Recipe Manager — connects formulas to routings for a complete process manufacturing workflow.", icon: FlaskConical },
            { title: "Batch Workbench", description: "End-to-end batch execution from release to completion with real-time status tracking, material issue, and actual-vs-standard recording.", icon: Activity },
            { title: "Lot Genealogy & Traceability", description: "Interactive ingredient-to-output genealogy tree traces every batch component — essential for recall readiness and regulatory compliance.", icon: GitMerge },
            { title: "LIMS Quality Management", description: "In-process quality results logging (pH, Density, Purity) with configurable pass/fail specs and non-conformance notification — server-side paginated for high volumes.", icon: FileCheck },
            { title: "MRP Planning & Costing Workbench", description: "Server-paginated MRP workbench generates supply recommendations, and the Costing Workbench rolls up standard vs. actual manufacturing costs with variance analysis.", icon: Calculator },
        ],
        benefits: [
            { title: "Process + Discrete in One", description: "Single platform handles both formula-based process manufacturing and BOM-based discrete production without switching systems." },
            { title: "Recall Readiness", description: "Interactive lot genealogy tree instantly identifies which customers received affected batches — reducing recall response time from days to minutes." },
            { title: "Margin Visibility", description: "Real-time costing workbench shows variance between planned and actual production costs, enabling continuous manufacturing cost improvement." },
            { title: "Quality Assurance", description: "Embedded LIMS quality inspection gates prevent out-of-spec batches from advancing through production." },
        ]
    },
    "warehouse-management": {
        slug: "warehouse-management",
        title: "Warehouse Management (WMS)",
        description: "100% Oracle EWM-parity warehouse execution with wave planning, directed picking, scan-to-pack, ship confirm, slotting optimization, and task workbench — a complete digital fulfillment engine.",
        category: "SCM",
        icon: Layers,
        heroGradient: "from-indigo-600 to-blue-700",
        features: [
            { title: "ASN Receiving & Putaway", description: "Advance Ship Notice-driven receiving with inspection and directed putaway — warehouse managers can pre-validate inbound shipments before physical arrival.", icon: Truck },
            { title: "Wave Planning Console", description: "Wave release workbench batches sales orders by criteria (carrier, zone, priority) and generates optimized pick tasks with pick-path sorting for maximum throughput.", icon: Layers },
            { title: "Directed Picking & Task Workbench", description: "WmsTaskService manages all warehouse tasks (Pick, Move, Replenish) with task-type assignment, priority queuing, and real-time completion tracking.", icon: ClipboardList },
            { title: "Scan-to-Pack Packing Station", description: "Container-based packing with LPN (License Plate Number) creation, handling unit management, and automated packing list generation at the pack station.", icon: ScanBarcode },
            { title: "Ship Confirm & Carrier Integration", description: "Ship confirmation with manifest generation and mock carrier API integration — inventory automatically deducted and order status updated on confirm.", icon: Package },
            { title: "Slotting Analysis & Optimization", description: "V1 heuristic-based slotting service analyzes pick frequency and recommends optimal storage locations to minimize travel time across the warehouse.", icon: Activity },
        ],
        benefits: [
            { title: "Throughput Maximization", description: "Wave-based pick batching with path optimization dramatically increases lines picked per labor hour." },
            { title: "Near-100% Accuracy", description: "Scan-to-validate at every step — receiving, picking, packing — eliminates mis-picks and short-ships." },
            { title: "Real-Time Inventory", description: "Every warehouse movement updates inventory in real time, keeping ERP stock levels and WMS execution perfectly synchronized." },
            { title: "Rapid Fulfillment", description: "End-to-end Order-to-Ship flow (Wave → Pick → Pack → Ship) enables same-day fulfillment for high-velocity e-commerce and B2B orders." },
        ]
    },
    "core-hr": {
        slug: "core-hr",
        title: "Core HR & People Management",
        description: "100% Oracle Fusion Global HR parity — 3-tier employment model, effective dating, manager hierarchies, HDL bulk import, AOR row-level security, and immutable audit logs.",
        category: "HR",
        icon: Users,
        heroGradient: "from-pink-500 to-rose-600",
        features: [
            { title: "Oracle TCA-Aligned Person Model", description: "3-tier Person → Work Relationship → Assignment model mirrors Oracle Global HR — supports Hire, Transfer, and Termination actions with full lifecycle history.", icon: Globe },
            { title: "Enterprise & Workforce Structures", description: "Full Enterprise → Legal Entity → Legal Employer → PSU hierarchy with Jobs, Positions, Grades, and Department trees — configurable via the HR Setup Console.", icon: Users },
            { title: "Effective Dating & Temporal Queries", description: "All records are date-effective with Correction and Update modes \ — the 'As Of Date' UI allows managers and auditors to query workforce state at any historical point.", icon: Clock },
            { title: "Onboarding & Offboarding Journeys", description: "Configurable checklist templates for Onboarding, Offboarding, and Transfer journeys with task allocation, progress tracking, and automated provisioning triggers.", icon: ClipboardCheck },
            { title: "HDL Bulk Data Loading", description: "HDL Lite CSV import handles mass workforce changes (new hires, regradings) — essential for system go-lives, acquisitions, and annual compensation cycles.", icon: FileText },
            { title: "AOR Row-Level Security & Audit", description: "Area of Responsibility (AOR) schema enforces row-level data access by geography/organization, backed by immutable hr_audit_logs for every write operation.", icon: ShieldCheck },
        ],
        benefits: [
            { title: "Single Source of Truth", description: "One global person record eliminates duplicate IDs, ghost employees, and data reconciliation across fragmented HR systems." },
            { title: "Audit-Ready Compliance", description: "Field-level immutable audit logs satisfy external auditor requirements for SOX, GDPR, and labor law compliance." },
            { title: "Operational Efficiency", description: "HDL bulk loading and journey automation reduce HR administration time for mass changes by over 80%." },
            { title: "Manager Self-Sufficiency", description: "Manager hierarchy with recursive lookup enables automatic org chart generation and direct report access without IT involvement." },
        ]
    },
    "recruiting": {
        slug: "recruiting",
        title: "Recruiting & Onboarding",
        description: "Full Oracle CSP-aligned ATS — public career site, Kanban pipeline, AI resume scoring, GDPR PII masking, interview scheduling, offer management with payroll sync, and hiring analytics.",
        category: "HR",
        icon: Users,
        heroGradient: "from-rose-500 to-pink-600",
        features: [
            { title: "Public Career Site", description: "Brand-aligned external /careers portal with mobile-friendly application flow, job search, and apply — drives direct candidate sourcing without ATS middleware.", icon: Globe },
            { title: "Kanban Candidate Pipeline (CSP)", description: "Configurable Candidate Selection Process with drag-and-drop Kanban stages, matching Oracle Fusion Recruiting's selection flow from Screen to Offer.", icon: Activity },
            { title: "AI Resume Scoring & PII Masking", description: "Deterministic AI scores candidates on skills/experience match, while role-based PII masking hides personal data from hiring managers — GDPR-ready.", icon: Brain },
            { title: "Interview Scheduling & Feedback", description: "Interview booking with structured feedback forms and numeric ratings — all stored in hrm_rec_interviews for analytics and compliance documentation.", icon: Calendar },
            { title: "Offer Management & Payroll Sync", description: "Digital offer creation, tiered approval, electronic acceptance, and automatic salary record creation in Core HR and Payroll upon offer acceptance.", icon: FileSignature },
            { title: "Hiring Funnel Analytics", description: "Real-time RecruitingAnalytics dashboard shows pipeline conversion rates, time-to-fill, source ROI, and diversity metrics per requisition.", icon: BarChart3 },
        ],
        benefits: [
            { title: "50% Faster Time-to-Fill", description: "AI scoring and automated pipeline stages eliminate manual candidate review bottlenecks that delay hiring decisions." },
            { title: "GDPR Compliance by Design", description: "Role-based PII masking ensures interviewing managers never see personally identifiable data — compliance is automatic, not an afterthought." },
            { title: "Zero Payroll Lag", description: "Direct offer-to-payroll sync creates compensation records automatically on acceptance, eliminating the manual new-hire setup step." },
            { title: "Data-Driven Sourcing", description: "Source ROI analytics show which channels produce quality hires — enabling budget reallocation away from underperforming sources." },
        ]
    },
    "talent-management": {
        slug: "talent-management",
        title: "Talent & Performance",
        description: "Tier-1 certified talent suite — continuous performance & goals, 9-box succession pools, learning catalog & enrollment, competency profiles, and integrated talent analytics across all sub-domains.",
        category: "HR",
        icon: Users,
        heroGradient: "from-fuchsia-500 to-purple-600",
        features: [
            { title: "Continuous Performance & Goals", description: "OKR-style goal cascading from corporate to individual, real-time feedback check-ins, and structured review cycles — replaces the annual appraisal with ongoing dialogue.", icon: TrendingUp },
            { title: "9-Box Succession Planning", description: "Visual 9-box talent grid with configurable performance/potential axes, succession pool management, and readiness ratings for critical role pipelines.", icon: MessageSquare },
            { title: "Learning Management (LMS)", description: "Course catalog with on-demand and instructor-led learning, compliance training tracking, completion certificates, and manager-assigned development plan integration.", icon: BookOpen },
            { title: "Talent Profile & Competencies", description: "Skills and competency repository linked to job profiles — enables skills gap analysis between current employee profiles and target role requirements.", icon: Users },
            { title: "360 Feedback & Calibration", description: "Multi-rater feedback collection with configurable reviewer selection, calibration session support, and normalized rating distribution controls.", icon: Activity },
            { title: "Talent Analytics Dashboard", description: "Unified talent KPIs: bench strength by function, top-talent flight risk indicators, learning completion rates, and performance distribution heat maps.", icon: BarChart3 },
        ],
        benefits: [
            { title: "Proven Retention", description: "Visible career paths with development plans and succession pools demonstrably reduce voluntary attrition among high-potential employees." },
            { title: "Leadership Pipeline", description: "9-box succession management ensures you always have a bench of ready-now and ready-next candidates for every critical role." },
            { title: "Skills-Led Organization", description: "Competency profiles and gap analysis enable skills-based hiring, development, and internal mobility decisions." },
            { title: "Compliance Learning", description: "Automated mandatory training assignment and completion tracking eliminates manual compliance training administration." },
        ]
    },
    "workforce-rewards": {
        slug: "workforce-rewards",
        title: "Payroll & Compensation",
        description: "Oracle Fusion Workforce Rewards parity — Hire-to-Pay lifecycle with salary basis, progressive tax engine, retro-pay detection, AI anomaly detection, and decoupled Compensation/Payroll architecture.",
        category: "HR",
        icon: Percent,
        heroGradient: "from-green-500 to-emerald-600",
        features: [
            { title: "Salary Basis & Compensation Plans", description: "Salary Basis (Frequency/Annualization) and variable Compensation Plans mirror Oracle's CMP_SALARY model — annual salary calculated and retro-dated through the Assignment.", icon: PieChart },
            { title: "Gross-to-Net Payroll Engine", description: "Complete Hire → Time Logging → Gross-to-Net → Payslip flow with Pay Elements, Run Results, and decoupled Payroll service boundary — scales for bulk processing cycles.", icon: Calculator },
            { title: "Progressive Tax Engine", description: "2025-compliant progressive tax calculation with legislative data group (LDG) concept via Pay Groups — verified for multi-jurisdiction accuracy including state and federal tiers.", icon: Percent },
            { title: "AI Retro-Pay & Anomaly Detection", description: "Automatic retro-pay detection flags effective date misalignments; Z-score anomaly detection triggers alerts for net pay variances exceeding 15% from the prior period.", icon: Brain },
            { title: "Compensation Planning Cycle", description: "Merit increases, bonus planning, and stock award management in a unified cycle — managers submit recommendations, reviewed via Compensation Dashboard with budget guardrails.", icon: TrendingUp },
            { title: "GDPR/PII Payroll Security", description: "Sensitive salary and payroll data endpoints enforce PII masking at the API level — role-based access ensures only authorized Payroll Admins view gross pay details.", icon: ShieldCheck },
        ],
        benefits: [
            { title: "Zero Payroll Errors", description: "AI anomaly detection catches net pay outliers before payroll confirmation, eliminating costly corrections and employee complaints." },
            { title: "Regulatory Confidence", description: "Progressive tax engine with LDG configuration satisfies multi-jurisdiction payroll compliance without custom code." },
            { title: "Hire-to-Pay Integrity", description: "End-to-end verified flow from recruitment offer acceptance through to payslip generation — no manual data re-entry between HR and Payroll." },
            { title: "Planning Equity", description: "Compensation cycle with budget guardrails ensures merit increases are distributed equitably and within approved budget envelopes." },
        ]
    },
    "time-labor": {
        slug: "time-labor",
        title: "Time & Labor Management",
        description: "Oracle WFM-parity time collection with Oracle Time Rules Engine (OTR), accrual plans, absence management, workforce scheduling, and real-time payroll integration — analytically verified.",
        category: "HR",
        icon: Clock,
        heroGradient: "from-blue-500 to-indigo-600",
        features: [
            { title: "Oracle Time Rules Engine (OTR)", description: "Configurable OTR policies calculate premium pay (overtime, holiday, weekend) and shift differentials automatically — verified against WFM time entry scenarios.", icon: Siren },
            { title: "Multi-Channel Time Capture", description: "Flexible time entry via web timesheet, mobile, and physical clock simulation — project-based, task-based, or simple hours entry with geo-fence support.", icon: Smartphone },
            { title: "Accrual Plans & PTO Management", description: "Configurable accrual plans (Anniversary, Calendar, Hire Date) with carry-over rules, caps, and real-time balance display to employees via the ESS portal.", icon: CalendarRange },
            { title: "Absence & Leave Management", description: "Full absence lifecycle: request, approval routing, balance deduction, and calendar view — supports FMLA, sick, vacation, and custom absence types per jurisdiction.", icon: Calendar },
            { title: "Workforce Scheduling", description: "Shift pattern management and roster planning with schedule vs. actual gap detection — managers see real-time overtime risk before approving shifts.", icon: LayoutDashboard },
            { title: "Payroll Integration & Analytics", description: "Approved time flows directly to the Payroll engine for accurate gross pay calculation, with WFM Analytics dashboard showing overtime by department and period.", icon: BarChart3 },
        ],
        benefits: [
            { title: "Overtime Cost Control", description: "OTR-driven premium pay rules prevent unexpected overtime costs by surfacing budget risk before shifts are approved." },
            { title: "Labor Law Compliance", description: "Configurable rules engine enforces federal, state, and union labor agreements automatically — no manual interpretation required." },
            { title: "Employee Transparency", description: "Real-time accrual balances and leave calendars in the ESS portal reduce HR queries and build employee trust." },
            { title: "Payroll Accuracy", description: "Direct time-to-payroll integration eliminates manual time entry uploads, removing the most common source of payroll errors." },
        ]
    },
    "project-management": {
        slug: "project-management",
        title: "Project Portfolio Management",
        description: "Oracle Fusion PPM-aligned with WBS structures, expenditure management, project billing rules, revenue recognition by contract type, and real-time budget vs. actuals.",
        category: "Operations",
        icon: Briefcase,
        heroGradient: "from-teal-500 to-emerald-600",
        features: [
            { title: "WBS & Project Structure", description: "Hierarchical Work Breakdown Structure with tasks, milestones, and resource assignments — supports Cost, Time & Material, and Fixed-Price contract types.", icon: ListTodo },
            { title: "Expenditure Management", description: "Expenditure Types (Labor, Material, Expense) map to GL accounts via AutoAccounting rules — every cost center charge is traceable to a project task.", icon: PieChart },
            { title: "Project Billing & Invoicing", description: "Configurable billing rules (T&M, Progress, On-Demand) generate AR invoices directly from project actuals with bill-hold and write-off handling.", icon: Receipt },
            { title: "Revenue Recognition", description: "Percentage-of-Completion and Completed-Contract revenue recognition per IFRS 15 — automated on period-end with GL posting via GlIntegrationService.", icon: TrendingUp },
            { title: "Resource Utilization", description: "Portfolio-level resource allocation view with availability heat maps — identify over-allocation and reassign before projects fall behind schedule.", icon: Users },
            { title: "Budget vs. Actuals Dashboard", description: "Real-time EAC (Estimate at Completion), CPI, and SPI performance indicators alert PMs to cost/schedule variance before they become unmanageable.", icon: BarChart3 },
        ],
        benefits: [
            { title: "On-Time, On-Budget Delivery", description: "Real-time EAC and SPI indicators give PMs early warning of variance, enabling corrective action before milestones slip." },
            { title: "Cash Flow Acceleration", description: "Automated billing rules generate invoices the moment project milestones are achieved — no manual billing run required." },
            { title: "IFRS 15 Compliance", description: "Automated revenue recognition by contract type eliminates spreadsheet-based POC calculations and audit risk." },
            { title: "Portfolio Visibility", description: "Resource utilization and financial summary across the entire project portfolio gives executives instant ROI and risk visibility." },
        ]
    },
    "crm": {
        slug: "crm",
        title: "Customer Experience (CX)",
        description: "Oracle CX-aligned 360° customer platform — lead-to-cash pipeline, omnichannel service desk, AI lead scoring, campaign automation, partner portal, and CPQ quoting.",
        category: "CRM",
        icon: Handshake,
        heroGradient: "from-orange-500 to-amber-600",
        features: [
            { title: "Sales Force Automation", description: "Lead-to-Cash pipeline with Kanban opportunity management, AI win-probability scoring, activity timeline, and one-click quote generation from the opportunity record.", icon: TrendingUp },
            { title: "Omnichannel Service Desk", description: "Unified ticket management across email, chat, and phone with AI-powered knowledge base suggestions, SLA countdown timers, and escalation routing.", icon: Headphones },
            { title: "Marketing Campaign Automation", description: "Segment-based email and campaign automation with A/B testing, engagement scoring, and campaign-to-opportunity attribution reporting.", icon: Megaphone },
            { title: "AI Lead Scoring & Routing", description: "Deterministic scoring model ranks leads by firmographic and behavioral signals, with automatic round-robin or skill-based routing to the best-fit rep.", icon: Brain },
            { title: "CPQ & Quote Management", description: "Configure-Price-Quote engine with product rules, discount guardrails, and approval workflows — produces professional proposals with electronic signature.", icon: FileSignature },
            { title: "Partner & Channel Portal", description: "Collaborative portal for channel partners to register deals, access marketing materials, and track co-sell pipeline with margin protection rules.", icon: Handshake },
        ],
        benefits: [
            { title: "Faster Deal Cycles", description: "AI scoring prioritizes the highest-value opportunities, and CPQ automation eliminates the back-and-forth quoting delays that stall deals." },
            { title: "Customer Retention", description: "SLA-enforced service desk with proactive escalation reduces ticket resolution time and measurably improves customer satisfaction scores." },
            { title: "Attribution Clarity", description: "End-to-end lead-to-revenue attribution shows which marketing campaigns and channels truly drive pipeline and closed won revenue." },
            { title: "Channel Revenue Growth", description: "Partner portal with deal registration and co-sell enablement accelerates revenue through indirect channels without losing margin control." },
        ]
    },
    "billing": {
        slug: "billing",
        title: "Subscription & Usage Billing",
        description: "Enterprise billing engine with subscription lifecycle, usage metering, ASC 606 revenue recognition, dunning automation, revenue waterfall, and integrated credit memo management.",
        category: "Finance",
        icon: Receipt,
        heroGradient: "from-green-600 to-emerald-700",
        features: [
            { title: "Subscription Lifecycle Management", description: "Full subscription lifecycle — trial, activation, upgrade, downgrade, pause, and cancel — with automated proration calculations and mid-cycle change handling.", icon: Repeat },
            { title: "Usage Metering Engine", description: "Real-time consumption tracking via usage events API — tier pricing, volume discounts, and overage calculations applied on-the-fly for seat, API, or data billing models.", icon: Activity },
            { title: "ASC 606 / IFRS 15 Revenue Recognition", description: "Performance obligation identification, SSP allocation, and contract modification handling with automated revenue schedule generation and GL journal posting.", icon: PieChart },
            { title: "Dunning & Collections Automation", description: "Configurable multi-step dunning campaigns with email templates, retry schedules, payment link injection, and automatic subscription suspension on final failure.", icon: AlertCircle },
            { title: "Revenue Waterfall Visualization", description: "Deferred-to-recognized revenue waterfall dashboard with contract-level drill-down — provides CFO-ready ASC 606 evidence for auditors and board reporting.", icon: BarChart3 },
            { title: "Credit Memo & Refund Workbench", description: "Credit memo creation against original invoices, approval workflow, and refund processing with automatic AR and GL reversal — full audit trail per transaction.", icon: RefreshCw },
        ],
        benefits: [
            { title: "Pricing Model Agility", description: "Launch flat-rate, per-seat, usage, or hybrid pricing models in days — not months — with no-code subscription plan configuration." },
            { title: "ASC 606 Audit-Ready", description: "Revenue waterfall with full contract-level evidence eliminates spreadsheet-based revenue schedules and the audit risk that comes with them." },
            { title: "Churn Recovery", description: "Automated dunning with smart retry scheduling recovers failed payments that would otherwise result in involuntary churn." },
            { title: "Cash Flow Acceleration", description: "Straight-through billing from subscription event to AR invoice and GL posting removes 3-5 days of manual processing from the billing cycle." },
        ]
    },
    "construction": {
        slug: "construction",
        title: "Construction & Engineering",
        description: "Oracle-aligned construction management with contract management, bid management, progress billing, subcontract compliance, change order control, and real-time job costing.",
        category: "Operations",
        icon: HardHat,
        heroGradient: "from-yellow-600 to-orange-700",
        features: [
            { title: "Contract & Subcontract Management", description: "Full contract lifecycle from award to closeout with subcontract compliance tracking — insurance certificates, lien waivers, and retainage withholding managed automatically.", icon: FileCheck },
            { title: "Bid & Estimate Management", description: "Bid package creation, subcontractor invitation, and bid comparison workbench — winning bids convert to project budgets with one click.", icon: Calculator },
            { title: "Progress Billing (AIA)", description: "AIA G702/G703 format progress billing draws generated from percent-complete or milestone triggers, with owner approval workflow and retainage release scheduling.", icon: Receipt },
            { title: "Change Order Control", description: "Formal change order workflow with cost impact analysis, owner approval, subcontract amendment creation, and automatic budget revision on approval.", icon: Ruler },
            { title: "Real-Time Job Costing", description: "Labour, material, equipment, and subcontract costs tracked against the budget in real time — PM dashboards show CPI and EAC for every cost code.", icon: BarChart3 },
            { title: "Field Management & RFIs", description: "RFI and submittal management from the field — daily logs, deficiency lists, and inspection records linked to the project schedule and cost codes.", icon: Hammer },
        ],
        benefits: [
            { title: "Margin Protection", description: "Real-time CPI tracking and change order discipline prevent cost overruns from eroding the project margin before it's too late to recover." },
            { title: "Cash Flow Management", description: "AIA progress billing with automated retainage tracking ensures you bill on time and collect what you're owed on every draw." },
            { title: "Subcontractor Risk Reduction", description: "Automated insurance and lien waiver compliance tracking eliminates the manual paperwork chase that exposes GCs to financial and legal liability." },
            { title: "Field-to-Finance Speed", description: "RFI and change order approvals flow directly into budget revisions — no lag between field decisions and financial record updates." },
        ]
    },
    "maintenance": {
        slug: "maintenance",
        title: "Enterprise Maintenance (EAM)",
        description: "Full Oracle EAM-parity with asset registry, work order lifecycle, PM scheduling, inspection checklists, spare parts management, permit-to-work safety, and asset health analytics.",
        category: "Operations",
        icon: Wrench,
        heroGradient: "from-slate-600 to-zinc-700",
        features: [
            { title: "Asset Registry & 360 View", description: "Complete asset hierarchy with location, classification, criticality, and full maintenance history — every cost, warranty claim, and sensor event linked to the asset record.", icon: Activity },
            { title: "Work Order Lifecycle Management", description: "Full WO lifecycle from creation to close: craft assignment, parts issue, labor recording, and cost capture — maps directly to Oracle EAM work order statuses.", icon: ClipboardCheck },
            { title: "Preventive Maintenance Scheduling", description: "PM plans trigger on time intervals, meter readings, or IoT sensor thresholds — automatically generate work orders before failure occurs.", icon: Calendar },
            { title: "Inspection Checklists & Compliance", description: "Configurable inspection templates with pass/fail/measurement readings linked to work orders — non-conformance notifications route to supervisors automatically.", icon: FileCheck },
            { title: "Permit-to-Work Safety Management", description: "Lockout/Tagout and Permit-to-Work issuance workflow with safety checklist enforcement — prevents work order execution until safety permits are authorized.", icon: ShieldCheck },
            { title: "Asset Health & Reliability Analytics", description: "MTBF, MTTR, asset availability, and maintenance cost trend dashboards — AssetHealthDashboard provides predictive risk scores per asset class.", icon: BarChart3 },
        ],
        benefits: [
            { title: "Maximum Asset Uptime", description: "IoT and calendar-triggered PM scheduling catches failures before they cause production downtime." },
            { title: "Safety & Regulatory Compliance", description: "Permit-to-Work enforcement and inspection records satisfy OSHA, ISO 55000, and sector-specific safety audit requirements." },
            { title: "Maintenance Cost Reduction", description: "Predictive reliability analytics shift spend from reactive breakdown repairs to planned maintenance — typically reducing maintenance costs by 15-25%." },
            { title: "Spare Parts Optimization", description: "Linked inventory management prevents both stockouts during repairs and excess spare parts tying up working capital." },
        ]
    },
    "transportation-logistics": {
        slug: "transportation-logistics",
        title: "Transportation & Logistics",
        description: "Oracle OTM-aligned TMS with multi-modal planning, load building, carrier rate management, freight settlement, real-time shipment visibility, and environmental compliance reporting.",
        category: "SCM",
        icon: Truck,
        heroGradient: "from-blue-700 to-sky-600",
        features: [
            { title: "Multi-Modal Transport Planning", description: "AI-optimized routing across road, rail, air, and ocean modes — multi-stop consolidation and continuous move optimization reduce empty miles and cost per unit.", icon: Map },
            { title: "Load Building & Consolidation", description: "Automatic LTL-to-FTL consolidation engine groups shipments by lane, carrier, and delivery window to maximize trailer utilization and minimize freight cost.", icon: Layers },
            { title: "Carrier Rate Management", description: "Centralized rate card repository with carrier contract upload, lane-level rate comparison, and automated least-cost carrier selection at booking.", icon: Users },
            { title: "Freight Audit & Settlement", description: "Three-way match of carrier invoice against BOL and rate card — exceptions flagged for dispute, approved invoices auto-posted to AP for payment.", icon: Receipt },
            { title: "Real-Time Shipment Visibility", description: "Interactive geo-map with live carrier tracking integration, milestone event logging, and proactive delay alerts to customer service teams.", icon: Navigation },
            { title: "Carbon & Compliance Reporting", description: "CO2 emissions calculation per shipment lane, carrier performance scorecards, and regulatory compliance reporting for EU, FMCSA, and customs filing.", icon: ShieldCheck },
        ],
        benefits: [
            { title: "Freight Cost Reduction", description: "Multi-modal optimization and LTL consolidation typically reduce total freight spend by 10-20% without service level compromise." },
            { title: "On-Time Delivery", description: "Proactive delay alerts and re-routing capability maintain delivery performance commitments even when carriers fail." },
            { title: "Audit Savings", description: "Automated freight audit catches carrier invoice errors and overbilling — typically recovering 2-5% of freight invoice value." },
            { title: "Sustainability Compliance", description: "Per-shipment carbon tracking satisfies ESG reporting requirements and enables Scope 3 emissions disclosures without manual calculation." },
        ]
    },
    "real-estate": {
        slug: "real-estate",
        title: "Real Estate",
        description: "Manage commercial and residential portfolios.",
        category: "Operations",
        icon: Building2,
        heroGradient: "from-emerald-800 to-green-900",
        features: [], benefits: []
    },

    // ── FINANCE (Batch 1) ─────────────────────────────────────────────────────
    "expense-management": {
        slug: "expense-management",
        title: "Expense Management",
        description: "AI-powered expense capture, policy enforcement, and seamless reimbursement for global enterprises.",
        category: "Finance",
        icon: DollarSign,
        heroGradient: "from-green-600 to-emerald-700",
        features: [
            { title: "AI-Driven OCR Capture", description: "Automatically extract amount, merchant, and date from any receipt photo with enterprise-grade accuracy.", icon: Brain },
            { title: "Policy Enforcement Engine", description: "Real-time spend limit checks, category rules, and duplicate-detection prevent non-compliant claims before submission.", icon: ShieldCheck },
            { title: "Corporate Card Reconciliation", description: "Auto-match corporate card transactions to expense items with intelligent tolerance thresholds and one-click reconciliation.", icon: CreditCard },
            { title: "Global Tax Compliance", description: "Per-diem rates, VAT reclaim, and country-specific tax rules enforced automatically across 150+ jurisdictions.", icon: Globe },
            { title: "Multi-level Approval Workflow", description: "Configurable approval chains with mobile notifications, auto-escalation, and manager delegation.", icon: ClipboardList },
            { title: "ERP & Payroll Integration", description: "Approved claims post directly to AP and payroll for same-day or next-run reimbursement with full GL coding.", icon: ArrowRightLeft }
        ],
        benefits: [
            { title: "Compliance", description: "Eliminate out-of-policy spend with automated enforcement before reimbursement." },
            { title: "Speed", description: "Reduce reimbursement cycle from weeks to days with AI-assisted processing." },
            { title: "Visibility", description: "Real-time dashboards give finance teams actionable spend analytics by category, project, and department." },
            { title: "Global Ready", description: "Support employees in 150+ countries with local tax and per-diem rules built in." }
        ]
    },

    "intercompany-accounting": {
        slug: "intercompany-accounting",
        title: "Intercompany Accounting",
        description: "Automate and reconcile intercompany transactions across all entities with AI anomaly detection and data access controls.",
        category: "Finance",
        icon: GitMerge,
        heroGradient: "from-violet-600 to-purple-700",
        features: [
            { title: "Automated Batch Processing", description: "Schedule and auto-post intercompany journals across hundreds of entities with configurable netting rules.", icon: RefreshCw },
            { title: "AI Anomaly Detection", description: "Machine learning flags unusual intercompany balances or posting patterns for immediate review.", icon: Brain },
            { title: "Data Access Sets (Security)", description: "Granular ledger-level access controls ensure each entity's data remains isolated per Oracle Fusion standards.", icon: Lock },
            { title: "Balance Reconciliation Console", description: "Side-by-side dashboard showing in-transit positions, unmatched transactions, and aging intercompany balances.", icon: BarChart3 },
            { title: "Server-Side Pagination", description: "Handles millions of intercompany records with sub-second query performance across period-end close workloads.", icon: Layers },
            { title: "Period-Close Integration", description: "Validation gates prevent period close if unreconciled intercompany balances exist, protecting financial integrity.", icon: Calendar }
        ],
        benefits: [
            { title: "Accuracy", description: "Automated matching eliminates manual reconciliation errors that delay financial close." },
            { title: "Speed", description: "Reduce intercompany reconciliation time from days to hours with AI-assisted matching." },
            { title: "Compliance", description: "Full audit trail and access controls ensure SOX compliance for every intercompany posting." },
            { title: "Scale", description: "Handles 1M+ intercompany transactions per month across unlimited legal entities." }
        ]
    },

    "lease-management": {
        slug: "lease-management",
        title: "Lease Management",
        description: "IFRS 16 / ASC 842 compliant lease accounting with AI-driven contract analysis and automated GL integration.",
        category: "Finance",
        icon: FileSignature,
        heroGradient: "from-teal-600 to-cyan-700",
        features: [
            { title: "IFRS 16 & ASC 842 Compliance", description: "Automatically calculate ROU assets, lease liabilities, and amortization schedules for every lease in your portfolio.", icon: FileCheck },
            { title: "AI Contract Analysis", description: "NLP-powered extraction of key lease terms—commencement date, payments, escalations—from uploaded contract PDFs.", icon: Brain },
            { title: "Portfolio Dashboard", description: "Real-time visibility into lease expirations, option exercise windows, and exposure by asset class and geography.", icon: LayoutDashboard },
            { title: "Automated GL Posting", description: "Lease journals flow directly to the General Ledger with full subledger accounting event model support.", icon: ArrowRightLeft },
            { title: "High-Volume Support", description: "Manage portfolios of 10,000+ leases with server-side pagination and bulk modification workflows.", icon: Layers },
            { title: "Modification & Termination Workflows", description: "Guided workflows for remeasurement events with automatic recalculation of present values.", icon: RefreshCw }
        ],
        benefits: [
            { title: "Compliance", description: "Ensure IFRS 16 / ASC 842 compliance with automated calculations and audit-ready reports." },
            { title: "Efficiency", description: "Eliminate manual spreadsheets with automated journal generation and amortization scheduling." },
            { title: "Risk Management", description: "Proactive alerts for renewal deadlines, escalation clauses, and embedded lease terms." },
            { title: "Integration", description: "Seamless integration with Fixed Assets and General Ledger for a complete accounting picture." }
        ]
    },

    "revenue-management": {
        slug: "revenue-management",
        title: "Revenue Management",
        description: "ASC 606 / IFRS 15 revenue recognition with automated contract analysis, variable consideration, and full audit trail.",
        category: "Finance",
        icon: TrendingUp,
        heroGradient: "from-orange-600 to-amber-600",
        features: [
            { title: "Contract Identification Engine", description: "Automatic grouping of orders and contracts into performance obligations per ASC 606 identification criteria.", icon: FileText },
            { title: "Variable Consideration", description: "Handle discounts, refunds, credits, royalties, and performance bonuses with probabilistic estimation models.", icon: Calculator },
            { title: "Financing Component Detection", description: "Automatically assess and adjust transaction prices for significant financing components across multi-year contracts.", icon: DollarSign },
            { title: "Revenue Audit Console", description: "Full transaction-level traceability from contract inception to recognized revenue with real-time audit drill-down.", icon: ClipboardCheck },
            { title: "Forecasting Dashboard", description: "Forward-looking revenue schedule visualization with waterfall charts across periods and performance obligations.", icon: BarChart3 },
            { title: "GL Integration", description: "Post recognized revenue and deferred revenue automatically to GL with full subledger accounting integration.", icon: ArrowRightLeft }
        ],
        benefits: [
            { title: "Compliance", description: "Achieve ASC 606 / IFRS 15 compliance with automated contract analysis and rule enforcement." },
            { title: "Accuracy", description: "Eliminate manual revenue schedules with system-driven recognition logic and automated journal generation." },
            { title: "Audit Readiness", description: "Every recognition event is traceable back to its source contract, obligation, and business rule." },
            { title: "Forecast Confidence", description: "Accurate deferred revenue schedules give leadership reliable forward-looking financial visibility." }
        ]
    },

    "subledger-accounting": {
        slug: "subledger-accounting",
        title: "Subledger Accounting",
        description: "The accounting backbone of NexusAI ERP — enterprise-grade rules engine generating accurate GL journals from every transactional event.",
        category: "Finance",
        icon: BookMarked,
        heroGradient: "from-indigo-700 to-blue-700",
        features: [
            { title: "Configurable Rules Engine", description: "Define account derivation rules by event class, transaction type, and ledger — all without code changes.", icon: Settings },
            { title: "Multi-Ledger Support", description: "Post the same transaction to primary, secondary, and reporting ledgers with different accounting conventions simultaneously.", icon: BookCopy },
            { title: "15 Canonical Levels, 18 Dimensions", description: "Oracle Fusion-grade accounting event model covering every transaction source across all ERP modules.", icon: Layers },
            { title: "SLA Event Monitor", description: "Real-time dashboard of accounting events with bulk processing, server-side pagination, and exception management.", icon: Monitor },
            { title: "Transaction Import", description: "Import from AP, Inventory, Labor, and third-party sources into a unified subledger distribution engine.", icon: Send },
            { title: "Audit & Reconciliation", description: "Full before/after snapshots, readable account display, and period-level reconciliation reports.", icon: ShieldCheck }
        ],
        benefits: [
            { title: "Accuracy", description: "Eliminate manual journal entry errors with rule-driven automated accounting creation." },
            { title: "Compliance", description: "Meet GAAP, IFRS, and statutory requirements with configurable multi-GAAP ledger support." },
            { title: "Speed", description: "Process millions of accounting events per period with optimized batch architecture." },
            { title: "Traceability", description: "Every journal traces back to its source transaction for complete audit visibility." }
        ]
    },

    // ── PROJECTS & COSTING (Batch 2) ──────────────────────────────────────────
    "project-accounting": {
        slug: "project-accounting",
        title: "Project Accounting",
        description: "Complete project financial lifecycle—from cost collection to billing rules and capital asset creation—with Oracle Fusion-grade parity.",
        category: "Finance",
        icon: FolderKanban,
        heroGradient: "from-sky-600 to-blue-700",
        features: [
            { title: "Multi-Source Cost Collection", description: "Capture project costs from AP invoices, inventory issues, and timesheets into a unified expenditure model.", icon: Receipt },
            { title: "Billing Rules Manager", description: "Configure fixed-fee, T&M, and milestone billing rules with automated billing event generation.", icon: FileText },
            { title: "Capital Asset Workbench", description: "Group CIP costs into asset lines and interface to Fixed Assets for automated capitalization.", icon: Briefcase },
            { title: "Burdening & Overhead", description: "Apply G&A markups and overhead schedules using configurable burden structures and multipliers.", icon: Calculator },
            { title: "SLA Event Monitor", description: "Track all project accounting distributions with server-side pagination for 1M+ row datasets.", icon: Monitor },
            { title: "Bill Rate Schedules", description: "Hierarchical rate lookup tables for T&M revenue recognition and contractor cost tracking.", icon: Sigma }
        ],
        benefits: [
            { title: "Cost Integrity", description: "Full traceability from source transaction to GL distribution for every project cost." },
            { title: "Compliance", description: "IFRS/GAAP-compliant capitalization flow from CIP cost to Fixed Asset automatically." },
            { title: "Billing Accuracy", description: "Configurable billing rules ensure accurate revenue recognition for every project type." },
            { title: "Scale", description: "Enterprise-grade pagination handles the largest project portfolios without performance degradation." }
        ]
    },

    "project-costing": {
        slug: "project-costing",
        title: "Project Portfolio Management",
        description: "Enterprise PPM platform with earned value analytics, resource management, and AI-driven project health scoring.",
        category: "Finance",
        icon: ClipboardList,
        heroGradient: "from-cyan-600 to-teal-700",
        features: [
            { title: "WBS & Project Foundation", description: "Full Work Breakdown Structure with templates, task hierarchies, and project type configuration.", icon: FolderKanban },
            { title: "Earned Value Management", description: "Real-time SPI and CPI calculations with burndown charts and EAC/ETC forecasting.", icon: TrendingUp },
            { title: "AI Project Health Score", description: "Agentic AI analyzes schedule performance, cost variance, and risk signals to surface actionable insights.", icon: Brain },
            { title: "Inter-Project Cost Transfer", description: "Cross-charge and borrow/lend transactions between projects with full subledger accounting integration.", icon: ArrowLeftRight },
            { title: "Capital Project Capitalization", description: "Automated flow from CIP cost collection to asset line generation and Fixed Assets interface.", icon: Briefcase },
            { title: "Portfolio Analytics", description: "Executive-level dashboard with performance snapshots, risk heat maps, and resource utilization.", icon: BarChart3 }
        ],
        benefits: [
            { title: "Delivery", description: "Identify at-risk projects early with AI-driven health scoring and predictive forecasting." },
            { title: "Financial Control", description: "Full cost integrity from source transaction through to GL with automated period-close validation." },
            { title: "Agility", description: "What-if scenario planning for resource reallocation and budget reforecast decisions." },
            { title: "Compliance", description: "Complete audit trail from expenditure through burdening to subledger distribution." }
        ]
    },

    "planning-budgeting": {
        slug: "planning-budgeting",
        title: "Planning, Budgeting & Forecasting",
        description: "Enterprise Performance Management with driver-based planning, predictive forecasting, and real-time GL actuals integration.",
        category: "Finance",
        icon: Sigma,
        heroGradient: "from-fuchsia-600 to-violet-700",
        features: [
            { title: "Driver-Based Planning", description: "Model budgets using configurable global drivers, allocation rules, and formula engine for P&L, Balance Sheet, and Cash Flow.", icon: Calculator },
            { title: "Rolling Forecast Engine", description: "12-month continuous forecasting with automatic actuals pull from GL and variance analysis against budget.", icon: RefreshCw },
            { title: "Workforce Planning (WFP)", description: "Position-level headcount planning with benefits loading, salary bands, and what-if scenario modeling.", icon: Users },
            { title: "AI Predictive Forecasting", description: "Linear regression and Python ML bridge (Prophet/LightGBM) for automated statistical forecasting.", icon: Brain },
            { title: "Multi-Scenario Management", description: "Create, compare, and version unlimited budget scenarios with one-click snapshot and clone.", icon: Layers },
            { title: "ESG & Treasury Planning", description: "Carbon footprint modeling, cash flow forecasting, and intercompany elimination rules in one platform.", icon: Globe }
        ],
        benefits: [
            { title: "Agility", description: "Respond to market changes with instant scenario modeling and rolling forecast updates." },
            { title: "Accuracy", description: "Driver-based models eliminate manual spreadsheet errors and reduce forecast bias." },
            { title: "Speed", description: "Automated actuals integration reduces budgeting cycle time by up to 60%." },
            { title: "Compliance", description: "Full audit trail of every planning assumption with approval workflow and version locking." }
        ]
    },

    "manufacturing-costing": {
        slug: "manufacturing-costing",
        title: "Manufacturing Costing",
        description: "Standard costing, WIP tracking, and variance analysis for high-volume manufacturing operations.",
        category: "Finance",
        icon: Coins,
        heroGradient: "from-amber-600 to-orange-700",
        features: [
            { title: "Standard Cost Rollup & Update", description: "Calculate and publish standard costs across all manufactured items with BOM and routing-based rollup.", icon: Calculator },
            { title: "WIP Balance Dashboard", description: "Real-time visibility into open work order costs with server-side pagination for 12k+ concurrent orders.", icon: LayoutDashboard },
            { title: "Variance Analysis Console", description: "Usage, efficiency, rate, and configuration variance reporting with date-range filtering and drill-down.", icon: BarChart3 },
            { title: "Cost Elements Framework", description: "Define and track Material, Labor, Overhead, and Outside Processing cost components per operation.", icon: Layers },
            { title: "Overhead Allocation Rules", description: "Configurable absorption rates applied automatically to work orders based on labor hours or machine time.", icon: Settings },
            { title: "Subledger Integration", description: "All WIP transactions generate GL distributions via the SLA accounting event model.", icon: BookMarked }
        ],
        benefits: [
            { title: "Profitability", description: "Identify cost overruns by variance type before they impact period-end financial reporting." },
            { title: "Accuracy", description: "Standard cost rollup ensures inventory is valued consistently across all plants and warehouses." },
            { title: "Compliance", description: "Full audit trail from work order transaction to GL journal for regulatory and cost accounting compliance." },
            { title: "Scale", description: "Server-side pagination handles 50k+ variance journals per month without performance degradation." }
        ]
    },

    // ── SCM (Batch 3) ─────────────────────────────────────────────────────────
    "landed-cost": {
        slug: "landed-cost",
        title: "Landed Cost Management",
        description: "Accurately compute true item cost by allocating freight, duties, and insurance to inventory receipts with AI-driven estimation.",
        category: "SCM",
        icon: Anchor,
        heroGradient: "from-slate-600 to-blue-800",
        features: [
            { title: "Trade Operation Lifecycle", description: "Manage end-to-end import shipments from PO receipt through cost allocation and period close.", icon: Truck },
            { title: "Multi-Basis Allocation Engine", description: "Spread charges by quantity, value, weight, or volume with configurable cost component rules.", icon: Calculator },
            { title: "AI Cost Prediction", description: "Predictive freight and duty estimation using historical averages for one-click cost pre-population.", icon: Brain },
            { title: "AP Invoice Reconciliation", description: "Match actual carrier invoices to estimated charges with automated variance calculation.", icon: FileCheck },
            { title: "Variance Accounting", description: "Generate estimated vs actual variance journals including accrual creation and reversal via SLA.", icon: ArrowRightLeft },
            { title: "Audit Timeline", description: "Full immutable audit trail of all allocation changes, approvals, and period-close events.", icon: ShieldCheck }
        ],
        benefits: [
            { title: "Cost Accuracy", description: "Reflect true landed cost in inventory valuation for accurate margin and profitability reporting." },
            { title: "Compliance", description: "GAAP-compliant variance accounting with full SLA integration to General Ledger." },
            { title: "Efficiency", description: "AI estimation reduces manual data entry and speeds up cost finalization after delivery." },
            { title: "Financial Control", description: "Approval workflows and period-close gates prevent premature or erroneous settlement." }
        ]
    },

    "supplier-portal": {
        slug: "supplier-portal",
        title: "Supplier Portal & Contracts",
        description: "Self-service supplier collaboration platform with RFQ-to-contract lifecycle, AI compliance analysis, and performance scorecards.",
        category: "SCM",
        icon: Store,
        heroGradient: "from-emerald-600 to-lime-700",
        features: [
            { title: "Supplier Self-Registration", description: "Multi-step onboarding portal for prospective vendors with document upload, tax ID validation, and approval workflow.", icon: UserCheck },
            { title: "External Collaboration Portal", description: "Dedicated supplier-facing interface for PO acknowledgement, ASN submission, and self-service invoice creation.", icon: Monitor },
            { title: "Strategic Sourcing (RFQ)", description: "Create and manage RFQs, evaluate supplier quotes, and auto-convert winning bids to procurement contracts.", icon: Handshake },
            { title: "Contract Lifecycle Management", description: "Full contract authoring with standard clause library, AI risk analysis, and spend-vs-limit enforcement.", icon: FileSignature },
            { title: "Performance Scorecards", description: "Data-driven on-time delivery and quality scores drawn from real PO and receipt transactions.", icon: BarChart3 },
            { title: "AI Contract Compliance", description: "GPT-powered analysis flags deviations from standard clauses and risk patterns in amended contract text.", icon: Brain }
        ],
        benefits: [
            { title: "Efficiency", description: "Reduce supplier inquiry calls with a comprehensive self-service portal for orders to invoices." },
            { title: "Compliance", description: "Ensure every purchase is contract-compliant with automated spend limit enforcement." },
            { title: "Risk Reduction", description: "AI contract analysis surfaces legal and commercial risks before execution." },
            { title: "Relationships", description: "Performance scorecards enable data-driven supplier reviews and strategic negotiations." }
        ]
    },

    // ── HR (Batch 4) ──────────────────────────────────────────────────────────
    "employee-self-service": {
        slug: "employee-self-service",
        title: "Employee & Manager Self-Service",
        description: "Oracle Fusion-parity ESS/MSS platform with effective-dated changes, statutory forms, approval automation, and AI-guided HR assistance.",
        category: "HR",
        icon: UserCheck,
        heroGradient: "from-pink-600 to-rose-700",
        features: [
            { title: "Personal Information Management", description: "Employees manage addresses, bank details, and emergency contacts with effective-dated change requests and approval routing.", icon: Users },
            { title: "Statutory Forms & Compliance", description: "Localized tax document management for US (W-4, I-9), UK (P45), and Middle East jurisdictions with digital signature support.", icon: FileCheck },
            { title: "Manager Self-Service Dashboard", description: "Real-time team headcount, attrition risk, skill gap analysis, and quick-action transfers and promotions for managers.", icon: BarChart3 },
            { title: "Delegation & Proxy Authority", description: "Secure date-bound delegation of manager responsibilities with full audit trail of proxy actions.", icon: Key },
            { title: "Workflow Approval Engine", description: "Parallel and sequential approval routing with auto-escalation timers and manager nudge notifications.", icon: RefreshCw },
            { title: "AI-Guided HR Copilot", description: "Conversational NexusAI Buddy for leave balance queries, policy guidance, and proactive task nudges.", icon: Brain }
        ],
        benefits: [
            { title: "Productivity", description: "30% reduction in HR helpdesk tickets through robust employee self-service capabilities." },
            { title: "Compliance", description: "100% adherence to statutory filing deadlines with automated localized tax form management." },
            { title: "Manager Agility", description: "20% faster team management with real-time analytics and in-app quick actions." },
            { title: "Data Integrity", description: "Zod-validated forms and effective-dating prevent 95% of self-service data entry errors." }
        ]
    },

    "hr-analytics": {
        slug: "hr-analytics",
        title: "HR Analytics & Reporting",
        description: "Snapshot-based workforce intelligence platform with predictive attrition modeling, compliance reporting, and contextual drill-down.",
        category: "HR",
        icon: LineChart,
        heroGradient: "from-blue-600 to-indigo-700",
        features: [
            { title: "Workforce Trend Dashboard", description: "Real-time headcount, attrition, and diversity metrics powered by daily snapshots for instant rendering.", icon: BarChart3 },
            { title: "Predictive Attrition Modeling", description: "Linear regression on historical HR snapshots to forecast attrition risk at team and department level.", icon: Brain },
            { title: "Contextual Filtering", description: "Slice all dashboards by department, location, or job family with live API queries for granular analysis.", icon: Settings },
            { title: "Compliance Reporting", description: "New hire, termination, and EEO reports with CSV and PDF export for regulatory submissions.", icon: FileCheck },
            { title: "Skill Gap Analysis", description: "Manager-level comparison of employee skills against job profile requirements with remediation suggestions.", icon: ClipboardList },
            { title: "Report Scheduler", description: "Configurable recurring report generation with email delivery for automated compliance reporting.", icon: Calendar }
        ],
        benefits: [
            { title: "Decision Speed", description: "Snapshot architecture eliminates expensive real-time aggregations for instant dashboard loading." },
            { title: "Proactive Management", description: "Identify at-risk employees before they resign using AI-driven attrition forecasting." },
            { title: "Compliance", description: "Automated compliance reports reduce manual data collection effort by up to 80%." },
            { title: "Data Depth", description: "Drill down from executive KPIs to individual employee records in a single navigation flow." }
        ]
    },

    "hr-compliance": {
        slug: "hr-compliance",
        title: "HR Compliance & Governance",
        description: "Enterprise HR compliance platform with GDPR right-to-erasure, SoD conflict detection, legislative rule engine, and immutable audit ledger.",
        category: "HR",
        icon: Lock,
        heroGradient: "from-red-600 to-rose-800",
        features: [
            { title: "Legislative Rules Engine", description: "Configurable compliance rules with MODULO operators supporting US, UK, EU, and custom legislation templates.", icon: FileText },
            { title: "Risk Scoring Engine", description: "Weighted compliance risk scoring using tenure, location, and role factors with DB-driven configurable weights.", icon: AlertCircle },
            { title: "GDPR Privacy & Consent", description: "Employee policy acknowledgement tracking, right-to-erasure (anonymization service), and AOR-based PII masking.", icon: ShieldCheck },
            { title: "Area of Responsibility (AOR)", description: "Multi-dimensional security profiles ensuring HR data access is strictly limited to authorised team members.", icon: Key },
            { title: "Segregation of Duties", description: "SoD conflict matrix detecting incompatible role combinations (e.g., Payroll Admin + Payment Approver) with admin UI.", icon: GitMerge },
            { title: "Compliance Analytics", description: "Velocity charts, risk heatmaps, and remediation workflow tracking for all open compliance violations.", icon: BarChart3 }
        ],
        benefits: [
            { title: "Risk Reduction", description: "PII masking and AOR enforcement significantly reduce data leak and compliance exposure." },
            { title: "GDPR Readiness", description: "Right-to-erasure and consent management enable complete compliance with data privacy regulations." },
            { title: "Audit Confidence", description: "Immutable audit trail with before/after field-level snapshots for every HR change." },
            { title: "Operational Efficiency", description: "Automated multi-step remediation workflows replace error-prone manual email approval chains." }
        ]
    },

    "learning-management": {
        slug: "learning-management",
        title: "Learning Management System",
        description: "Enterprise LMS with SCORM delivery, certification renewal automation, AI recommendations, and full instructor management.",
        category: "HR",
        icon: GraduationCap,
        heroGradient: "from-violet-600 to-indigo-700",
        features: [
            { title: "Hierarchical Course Catalog", description: "Organize learning content in Communities > Subjects > Courses > Offerings with faceted search and eligibility profiles.", icon: BookOpen },
            { title: "Secure Content Delivery", description: "SCORM 1.2/2004, video, and PDF content player with progress tracking, pass/fail scoring, and completion certificates.", icon: Monitor },
            { title: "Compliance Certification Engine", description: "Automated certification renewal scheduling with configurable validity periods and grace period management.", icon: FileCheck },
            { title: "AI Learning Recommendations", description: "Personalized course recommendations based on role, skill gaps, and learning history with one-click enrollment.", icon: Brain },
            { title: "Manager Assignment Dashboard", description: "Assign mandatory training to teams, track completion rates, and view compliance status for direct reports.", icon: ClipboardList },
            { title: "Instructor Portal", description: "Dedicated workspace for instructors to manage their sessions, grade assessments, and view attendance.", icon: Users }
        ],
        benefits: [
            { title: "Compliance", description: "Automated certification renewals ensure no employee misses mandatory training deadlines." },
            { title: "Engagement", description: "AI-driven personalized recommendations increase course completion rates and learning relevance." },
            { title: "Efficiency", description: "Self-service enrollment and automated workflows eliminate manual training administration." },
            { title: "Visibility", description: "Manager dashboards provide real-time learning compliance status across every team." }
        ]
    },

    // ── PLATFORM (Batch 5) ─────────────────────────────────────────────────────
    "cost-management": {
        slug: "cost-management",
        title: "Cost Management",
        description: "Unified inventory costing platform with standard and weighted-average methods, anomaly detection, and full subledger integration.",
        category: "Operations",
        icon: Calculator,
        heroGradient: "from-zinc-600 to-slate-700",
        features: [
            { title: "Perpetual Costing Methods", description: "Standard and weighted-average perpetual costing with real-time cost layer processing for all inventory transactions.", icon: Layers },
            { title: "Cost Planning & Scenarios", description: "Model cost changes with scenario-based rollups before publishing to the live cost book.", icon: TrendingUp },
            { title: "Period Close Controls", description: "Period open/close lifecycle with reconciliation validation preventing premature close when open costs exist.", icon: Calendar },
            { title: "AI Anomaly Detection", description: "Statistical outlier detection for invoice price variances and efficiency variances flagged in real time.", icon: Brain },
            { title: "Distributions Viewer", description: "Full cost distribution history showing GL account, amount, and source transaction for every costing event.", icon: BarChart3 },
            { title: "Subledger Integration", description: "Every receipt, issue, and adjustment generates accounting events via the SLA framework for GL transfer.", icon: BookMarked }
        ],
        benefits: [
            { title: "Accuracy", description: "Perpetual costing ensures inventory is valued correctly at every transaction point throughout the period." },
            { title: "Control", description: "Scenario-based planning prevents costly standard cost publishing errors before they hit production." },
            { title: "Visibility", description: "Anomaly detection surfaces variance patterns that manual review would miss until period close." },
            { title: "Auditability", description: "Every cost distribution traced from source transaction to GL journal for complete compliance evidence." }
        ]
    },

    "master-data-management": {
        slug: "master-data-management",
        title: "Master Data Management",
        description: "Enterprise MDM hub with Trading Community Architecture, AI deduplication, governance workflows, and cross-module data integrity.",
        category: "Operations",
        icon: Database,
        heroGradient: "from-sky-700 to-blue-900",
        features: [
            { title: "Trading Community Architecture (TCA)", description: "Oracle-aligned Party, Organization, Person, and Location model as the golden record foundation for all master data.", icon: Building2 },
            { title: "AI Deduplication Console", description: "Fuzzy, exact, and Levenshtein matching with configurable thresholds and side-by-side merge candidate review.", icon: Brain },
            { title: "Product Information Hub (PIM)", description: "Centralized item master integrated with Order Management and Procurement for consistent pricing and UOM derivation.", icon: ScanBarcode },
            { title: "Governance Workflows", description: "Maker-checker change request approval for all master data modifications with full audit timeline.", icon: ClipboardCheck },
            { title: "Data Quality Dashboard", description: "Aggregated quality metrics, match score distributions, and steward workload visibility for operational health.", icon: BarChart3 },
            { title: "Bulk Import Wizard", description: "Drag-and-drop CSV import for Parties and Items with real-time validation feedback and error reporting.", icon: Send }
        ],
        benefits: [
            { title: "Data Quality", description: "Eliminate duplicate records and inconsistent master data across all business domains." },
            { title: "Compliance", description: "Maker-checker governance and complete audit trail for every master data change event." },
            { title: "Integration", description: "Cross-module validation ensures only approved, active master records are usable in transactions." },
            { title: "Efficiency", description: "Bulk import and AI-assisted merge reduce manual data stewardship effort by up to 70%." }
        ]
    },
};

export const getModuleIcon = (slug: string) => {
    return modules[slug]?.icon || LayoutDashboard;
};
