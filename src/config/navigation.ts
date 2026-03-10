import { SidebarNode } from "@/types/sidebar";
import {
    LayoutDashboard,
    Users,
    BarChart3,
    Settings as SettingsIcon,
    Sparkles,
    DollarSign,
    Zap,
    Shield,
    Factory,
    Package,
    Briefcase,
    MessageCircle,
    Cog,
    Brain,
    TrendingUp,
    Workflow as WorkflowIcon,
    GitBranch,
    Search,
    ShoppingCart,
    Ship,
    GraduationCap,
    Bell,
    Grid3x3,
    LayoutGrid,
    Database,
    Lock,
    Radio,
    Truck,
    Building,
    LogOut,
    BookOpen,
    ArrowRightLeft,
    RefreshCw,
    Warehouse,
    Wrench,
    Hammer,
    Activity,
    FileText,
    User,
    History as HistoryIcon,
    Headphones,
    ClipboardList,
    Globe,
    Megaphone,
    Target,
    Heart,
    Wifi,
    Hotel,
    ShoppingBag,
    Boxes,
    Car,
    Landmark,
    Flame,
    Receipt,
    CreditCard,
    Banknote,
    BookOpenCheck,
    UserPlus,
    ScrollText,
    Calculator,
} from "lucide-react";

export const navigationConfig: SidebarNode[] = [
    {
        id: "overview",
        title: "Overview",
        type: "section",
        children: [
            { id: "dashboard", title: "Dashboard", type: "link", icon: LayoutDashboard, path: "/dashboard" },
            {
                id: "processes", title: "Processes", type: "group", icon: WorkflowIcon,
                children: [
                    { id: "o2c", title: "Order-to-Cash (O2C)", type: "link", path: "/processes/o2c" },
                    { id: "p2p", title: "Procure-to-Pay (P2P)", type: "link", path: "/processes/p2p" },
                    { id: "r2r", title: "Record-to-Report (R2R)", type: "link", path: "/processes/r2r" },
                    { id: "plan2produce", title: "Plan-to-Produce", type: "link", path: "/processes/plan-to-produce" },
                    { id: "h2r", title: "Hire-to-Retire", type: "link", path: "/processes/hire-to-retire" },
                    { id: "p2a", title: "Project-to-Asset", type: "link", path: "/processes/project-to-asset" }
                ]
            },
        ]
    },
    {
        id: "modules",
        title: "Modules",
        type: "section",
        children: [
            {
                id: "me-team", title: "Me & My Team", type: "group", icon: User,
                children: [
                    { id: "me", title: "Me (ESS)", type: "link", path: "/me" },
                    { id: "my-team", title: "My Team (MSS)", type: "link", path: "/my-team" }
                ]
            },
            {
                id: "company-setup", title: "Company Setup", type: "group", icon: Building, path: "/company-setup",
                children: [
                    { id: "ent-dashboard", title: "Overview", type: "link", path: "/company-setup" },
                    { id: "ent-legal-groups", title: "Legal Groups", type: "link", path: "/company-setup/legal-groups" },
                    { id: "ent-business-units", title: "Business Units", type: "link", path: "/company-setup/business-units" },
                    { id: "ent-ledgers", title: "Ledgers", type: "link", path: "/company-setup/ledgers" },
                    { id: "ent-mappings", title: "Mappings", type: "link", path: "/company-setup/mappings" }
                ]
            },
            {
                id: "finance", title: "Finance & Accounting", type: "group", icon: DollarSign, path: "/finance",
                children: [
                    { id: "finance-gl", title: "General Ledger", type: "link", path: "/finance/gl" },
                    { id: "finance-ap", title: "Accounts Payable", type: "link", path: "/finance/ap" },
                    { id: "finance-ap-ers", title: "Evaluated Receipt Settlement", type: "link", path: "/finance/ap/ers-settlement" },
                    { id: "finance-ar", title: "Accounts Receivable", type: "link", path: "/finance/ar" },
                    { id: "finance-cm", title: "Cash & Treasury", type: "link", path: "/finance/cash" },
                    { id: "finance-rev", title: "Billing & Revenue", type: "link", path: "/finance/revenue" },
                    { id: "finance-fa", title: "Fixed Assets", type: "link", path: "/finance/fixed-assets" },
                    { id: "finance-leases", title: "Lease Accounting", type: "link", path: "/finance/leases" },
                    { id: "finance-ic", title: "Intercompany", type: "link", path: "/finance/intercompany" },
                    { id: "finance-sla", title: "Subledger Accounting", type: "link", path: "/finance/sla" },
                    { id: "finance-expense", title: "Expense Management", type: "link", path: "/finance/expense-management" },
                    { id: "finance-tax", title: "Tax Management", type: "link", path: "/finance/tax" },
                ]
            },
            {
                id: "epm", title: "Enterprise Performance (EPM)", type: "group", icon: TrendingUp, path: "/epm",
                children: [
                    { id: "epm-planning", title: "Planning & Budgeting", type: "link", path: "/epm" },
                    { id: "epm-controls", title: "Budget Controls", type: "link", path: "/finance/epm/budget-controls" },
                    { id: "epm-scenarios", title: "Scenario Comparison", type: "link", path: "/finance/epm/scenarios" },
                    { id: "epm-consolidation", title: "Consolidation", type: "link", path: "/finance/gl/consolidation" },
                    { id: "epm-esg", title: "ESG & Sustainability", type: "link", path: "/epm/esg" },
                ]
            },
            {
                id: "scm", title: "Supply Chain & Procurement", type: "group", icon: Package, path: "/scm",
                children: [
                    { id: "procurement", title: "Procurement", type: "link", path: "/scm/procurement" },
                    { id: "procurement-reqs", title: "Purchase Requisitions", type: "link", path: "/procurement/requisitions/new" },
                    { id: "procurement-approvals", title: "Requisition Approvals", type: "link", path: "/procurement/requisitions/approvals" },
                    { id: "procurement-orders", title: "Purchase Orders", type: "link", path: "/procurement/orders" },
                    { id: "procurement-bpa", title: "Blanket Agreements", type: "link", path: "/procurement/blanket-agreements" },
                    { id: "procurement-cpa", title: "Contract Agreements", type: "link", path: "/procurement/cpas" },
                    { id: "procurement-buyer", title: "Buyer Work Area", type: "link", path: "/procurement/buyer-workarea" },
                    { id: "procurement-qualification", title: "Supplier Qualification", type: "link", path: "/procurement/supplier-qualifications" },
                    { id: "procurement-negotiations", title: "Supplier Negotiations", type: "link", path: "/procurement/negotiations" },
                    { id: "procurement-scorecard", title: "Supplier Scorecards", type: "link", path: "/procurement/supplier-scorecard" },
                    { id: "procurement-asn", title: "Supplier ASN Portal", type: "link", path: "/procurement/asn-portal" },


                    { id: "procurement-punchout", title: "Punchout Catalogs", type: "link", path: "/procurement/punchout" },
                    { id: "procurement-funds", title: "Funds Check", type: "link", path: "/procurement/funds-check" },
                    { id: "procurement-distributions", title: "PO Distributions", type: "link", path: "/procurement/distributions" },
                    { id: "procurement-change", title: "Change Orders", type: "link", path: "/procurement/change-orders" },
                    { id: "procurement-dropship", title: "Drop Ship & B2B", type: "link", path: "/scm/fulfillment/drop-ship" },
                    { id: "portal-supplier", title: "Supplier Portal", type: "link", path: "/portal/supplier" },
                    { id: "inventory", title: "Inventory", type: "link", path: "/inventory" },
                    { id: "inventory-uom", title: "UOM Conversions", type: "link", path: "/inventory/uom-conversions" },
                    { id: "inventory-cw", title: "Catch Weight", type: "link", path: "/inventory/catch-weight" },
                    { id: "inventory-categories", title: "Item Categories", type: "link", path: "/inventory/categories" },
                    { id: "inventory-org-tabs", title: "Item Master (Org Tabs)", type: "link", path: "/inventory/item-master-orgs" },
                    { id: "inventory-abc", title: "ABC Classification", type: "link", path: "/inventory/abc-classification" },
                    { id: "inventory-consignment", title: "Consignment Stock", type: "link", path: "/inventory/consignment" },


                    { id: "inventory-lots", title: "Lot & Serial Control", type: "link", path: "/inventory/lot-serial" },
                    { id: "inventory-min-max", title: "Min-Max Planning", type: "link", path: "/inventory/min-max" },
                    { id: "inventory-status", title: "Material Status", type: "link", path: "/inventory/material-status" },
                    { id: "costing", title: "Cost Management", type: "link", path: "/scm/costing" },
                    { id: "costing-rollup", title: "Cost Rollup", type: "link", path: "/scm/costing/rollup" },
                    { id: "costing-processor", title: "Cost Processor", type: "link", path: "/scm/costing/processor" },
                    { id: "costing-variance", title: "Variance Report", type: "link", path: "/scm/costing/variance" },
                    { id: "costing-period-close", title: "Period Reconciliation", type: "link", path: "/scm/costing/period-close" },
                    { id: "costing-receipt", title: "Receipt Accounting", type: "link", path: "/scm/costing/receipt-accounting" },
                    { id: "costing-transfer-pricing", title: "Transfer Pricing", type: "link", path: "/scm/costing/transfer-pricing" },
                    { id: "costing-overhead", title: "Overhead Rules", type: "link", path: "/scm/costing/overhead-rules" },
                    { id: "costing-landed-cost", title: "Landed Cost Apportionment", type: "link", path: "/scm/costing/landed-cost" },

                    { id: "gtm", title: "Global Trade (GTM)", type: "link", path: "/scm/gtm" },
                ]
            },
            {
                id: "mfg", title: "Manufacturing & Operations", type: "group", icon: Hammer, path: "/manufacturing",
                children: [
                    { id: "manufacturing", title: "Manufacturing", type: "link", path: "/manufacturing/dashboard" },
                    { id: "mfg-bom", title: "BOM Designer", type: "link", path: "/manufacturing/bom" },
                    { id: "mfg-work-orders", title: "Work Orders", type: "link", path: "/manufacturing/work-orders" },
                    { id: "mfg-rework-orders", title: "Non-Standard / Rework", type: "link", path: "/manufacturing/rework-orders" },
                    { id: "mfg-formulas", title: "Formula Designer", type: "link", path: "/manufacturing/formulas" },
                    { id: "mfg-formula-yield", title: "Formula Yields (Co/By)", type: "link", path: "/manufacturing/formula-yield" },
                    { id: "mfg-mrp", title: "MRP Workbench", type: "link", path: "/manufacturing/mrp" },
                    { id: "mfg-mrp-explosion", title: "MRP BOM Explosion", type: "link", path: "/manufacturing/mrp-explosion" },
                    { id: "mfg-bom-effectivity", title: "BOM Effectivity Editor", type: "link", path: "/manufacturing/bom-effectivity" },
                    { id: "mfg-kanban-setup", title: "Kanban Replenishment", type: "link", path: "/manufacturing/kanban-setup" },
                    { id: "mfg-production-adherence", title: "Production Adherence", type: "link", path: "/manufacturing/production-adherence" },


                    { id: "mfg-scm-events", title: "SC Event Monitor", type: "link", path: "/manufacturing/scm-events" },
                    { id: "mfg-work-instructions", title: "Work Instructions", type: "link", path: "/manufacturing/work-instructions" },
                    { id: "wms", title: "Warehouse (WMS)", type: "link", path: "/scm/wms/dashboard" },
                    { id: "wms-waves", title: "Wave Planning", type: "link", path: "/scm/wms/waves" },
                    { id: "wms-lpn", title: "LPN Workbench", type: "link", path: "/scm/wms/lpn" },
                    { id: "wms-bol", title: "BOL & Rate Shopping", type: "link", path: "/scm/wms/bol" },
                    { id: "wms-rma", title: "RMA / Returns", type: "link", path: "/scm/wms/rma" },
                    { id: "wms-locator-seq", title: "Locator Picking Sequence", type: "link", path: "/scm/wms/locator-sequence" },


                    { id: "wms-interleaving", title: "Task Interleaving", type: "link", path: "/scm/wms/task-interleaving" },
                    { id: "wms-pack", title: "Pack Station", type: "link", path: "/scm/wms/pack-station" },
                    { id: "wms-cross-dock", title: "Cross-Docking", type: "link", path: "/scm/wms/cross-docking" },
                    { id: "tms", title: "Transportation (TMS)", type: "link", path: "/transportation" },
                    { id: "tms-edi", title: "EDI 214 Events", type: "link", path: "/transportation/edi-events" },
                    { id: "tms-carriers", title: "Carrier Management", type: "link", path: "/transportation/carriers" },
                    { id: "tms-multimodal", title: "Multi-Modal Optimizer", type: "link", path: "/transportation/multimodal" },
                    { id: "tms-claims", title: "Freight Claims (OS&D)", type: "link", path: "/tms/claims" },

                    { id: "lcm", title: "Landed Cost (LCM)", type: "link", path: "/scm/lcm/operations" },
                    { id: "logistics", title: "Logistics", type: "link", path: "/logistics" },
                    { id: "quality", title: "Quality Management", type: "link", path: "/manufacturing/quality" },
                    { id: "maintenance", title: "Maintenance (EAM)", type: "link", path: "/maintenance" },
                    { id: "maintenance-pm", title: "PM Scheduler", type: "link", path: "/maintenance/pm/scheduler" },
                    { id: "maintenance-pm-routes", title: "PM Routes", type: "link", path: "/maintenance/pm-routes" },
                    { id: "maintenance-warranty", title: "Asset Warranty", type: "link", path: "/maintenance/warranty" },
                    { id: "maintenance-fmea", title: "FMEA Workbench", type: "link", path: "/maintenance/fmea" },
                    { id: "maintenance-cbm", title: "CBM Engine", type: "link", path: "/maintenance/cbm-rules" },
                    { id: "maintenance-meters", title: "Meter Rollovers", type: "link", path: "/maintenance/meters-config" },
                    { id: "maintenance-inspections", title: "Inspections", type: "link", path: "/maintenance/inspections" },
                    { id: "maintenance-permits", title: "Permits", type: "link", path: "/maintenance/permits" },
                ]
            },

            {
                id: "crm", title: "CRM & Sales", type: "group", icon: Target, path: "/crm",
                children: [
                    { id: "crm-sales", title: "Sales Execution", type: "link", path: "/crm" },
                    { id: "crm-cpq", title: "CPQ & Quotes", type: "link", path: "/crm/cpq" },
                    { id: "crm-service", title: "Service & Customer Portal", type: "link", path: "/service" },
                    { id: "crm-marketing", title: "Marketing", type: "link", path: "/crm/campaigns" },
                    { id: "crm-fieldservice", title: "Field Service", type: "link", path: "/crm/field-service" },
                    { id: "crm-incentives", title: "Incentive Comp", type: "link", path: "/crm/incentives" },
                    { id: "crm-partners", title: "Partners (PRM)", type: "link", path: "/crm/partners" }
                ]
            },
            {
                id: "hr", title: "HR & Talent", type: "group", icon: Briefcase, path: "/hr",
                children: [
                    { id: "hr-core", title: "Core HR", type: "link", path: "/hr" },
                    { id: "hr-self-service", title: "My HR (Self-Service)", type: "link", path: "/hr/self-service/me" },
                    { id: "hr-recruit", title: "Recruitment", type: "link", path: "/hr/recruitment" },
                    { id: "hr-talent", title: "Talent & Learning", type: "link", path: "/hr/learning/me" },
                    { id: "hr-wfm", title: "Workforce Mgmt (WFM)", type: "link", path: "/hr/wfm/me/time" },
                    { id: "hr-comp-ben", title: "Compensation & Benefits", type: "link", path: "/hr/compensation" },
                    { id: "hr-workforce-setup", title: "Workforce Setup", type: "link", path: "/hr/setup" },
                    { id: "hr-analytics", title: "HR Analytics", type: "link", path: "/hr/analytics" },
                ]
            },
            {
                id: "projects", title: "Projects & Contracts", type: "group", icon: Zap, path: "/projects",
                children: [
                    { id: "ppm", title: "Project Portfolio (PPM)", type: "link", path: "/projects" },
                    { id: "construction", title: "Construction", type: "link", path: "/construction" },
                    { id: "lease-contracts", title: "Lease & Contract Mgmt", type: "link", path: "/projects/leases" }
                ]
            },
            {
                id: "intelligence", title: "Intelligence & Governance", type: "group", icon: Brain,
                children: [
                    { id: "mdm", title: "Master Data Mgmt (MDM)", type: "link", path: "/mdm" },
                    { id: "analytics", title: "Analytics", type: "link", path: "/analytics" },
                    { id: "compliance", title: "Compliance & Risk", type: "link", path: "/compliance/dashboard" },
                    { id: "audit", title: "Audit Trails", type: "link", path: "/compliance/audit" },
                    { id: "security", title: "Security Profiles", type: "link", path: "/compliance/security" },
                    { id: "fsm", title: "Functional Setup (FSM)", type: "link", path: "/system/setup" },
                ]
            }
        ]
    },
    {
        id: "industries",
        title: "Industries",
        type: "section",
        children: [
            {
                id: "industry-verticals", title: "Industry Solutions", type: "group", icon: Landmark, path: "/industry",
                children: [
                    { id: "ind-mfg", title: "Manufacturing & High-Tech", type: "link", path: "/industry/manufacturing" },
                    { id: "ind-retail", title: "Retail & Consumer Goods", type: "link", path: "/industry/retail" },
                    { id: "ind-health", title: "Healthcare & Life Sciences", type: "link", path: "/industry/healthcare" },
                    { id: "ind-finserv", title: "Financial Services", type: "link", path: "/industry/financial-services" },
                    { id: "ind-public", title: "Public Sector", type: "link", path: "/industry/public-sector" },
                    { id: "ind-ec", title: "Engineering & Construction", type: "link", path: "/industry/engineering" },
                    { id: "ind-proserv", title: "Professional Services", type: "link", path: "/industry/professional-services" },
                    { id: "ind-telco", title: "Telecommunications", type: "link", path: "/industry/telecom" },
                    { id: "ind-energy", title: "Energy & Utilities", type: "link", path: "/industry/energy" },
                    { id: "ind-auto", title: "Automotive", type: "link", path: "/industry/automotive" },
                    { id: "ind-aero", title: "Aerospace & Defense", type: "link", path: "/industry/aerospace" },
                    { id: "ind-logistics", title: "Logistics & Transport", type: "link", path: "/industry/logistics" },
                    { id: "ind-media", title: "Media & Entertainment", type: "link", path: "/industry/media" },
                    { id: "ind-hospitality", title: "Hospitality & Travel", type: "link", path: "/industry/hospitality" },
                    { id: "ind-realestate", title: "Real Estate", type: "link", path: "/industry/real-estate" },
                ]
            }
        ]
    },
    {
        id: "platform-admin",
        title: "Platform",
        type: "section",
        children: [
            { id: "admin", title: "Admin", type: "link", icon: Shield, path: "/admin", allowedRoles: ["admin"] },
            { id: "system-config", title: "Settings", type: "link", icon: SettingsIcon, path: "/system-configuration", allowedRoles: ["admin"] },
        ]
    }
];
