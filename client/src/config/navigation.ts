import { SidebarNode } from "@/types/sidebar";
import {
    LayoutDashboard,
    Users,
    BarChart3,
    Settings as SettingsIcon,
    Sparkles,
    DollarSign,
    Zap,
    ChevronDown,
    Shield,
    Factory,
    Package,
    Briefcase,
    Store,
    MessageCircle,
    Cog,
    Brain,
    TrendingUp,
    Workflow,
    GitBranch,
    ShoppingCart,
    GraduationCap,
    Bell,
    Grid3x3,
    LayoutGrid,
    Database,
    Lock,
    Radio,
    Truck,
    Workflow as WorkflowIcon,
    Building,
    LogOut,
    BookOpen,
    ArrowRightLeft,
    RefreshCw,
    Warehouse,
} from "lucide-react";

export const navigationConfig: SidebarNode[] = [
    {
        id: "core-business",
        title: "Core Business",
        type: "section",
        children: [
            { id: "dashboard", title: "Dashboard", type: "link", icon: LayoutDashboard, path: "/dashboard" },
            { id: "processes", title: "Processes", type: "link", icon: WorkflowIcon, path: "/processes" },
            {
                id: "crm",
                title: "CRM",
                type: "section",
                icon: Users,
                allowedRoles: ["admin", "editor"],
                children: [
                    { id: "crm-dashboard", title: "Dashboard", type: "link", path: "/crm" },
                    { id: "crm-orders", title: "Orders", type: "link", path: "/crm/orders" },
                    { id: "crm-price-books", title: "Price Books", type: "link", path: "/crm/price-books" },
                    { id: "crm-case-comments", title: "Case Comments", type: "link", path: "/crm/case-comments" },
                ]
            },
            { id: "erp", title: "ERP", type: "link", icon: DollarSign, path: "/erp", allowedRoles: ["admin", "editor"] },
            { id: "hr", title: "HR", type: "link", icon: Briefcase, path: "/hr", allowedRoles: ["admin", "editor"] },
            { id: "projects", title: "Projects", type: "link", icon: Zap, path: "/projects", allowedRoles: ["admin", "editor"] },
        ],
    },
    {
        id: "operations-admin",
        title: "Operations & Admin",
        type: "section",
        children: [
            { id: "operations", title: "Operations", type: "link", icon: Cog, path: "/operations", allowedRoles: ["admin", "editor"] },
            { id: "admin", title: "Admin", type: "link", icon: Shield, path: "/admin", allowedRoles: ["admin"] },
            { id: "general", title: "General", type: "link", icon: Grid3x3, path: "/general", allowedRoles: ["admin", "editor"] },
        ],
    },
    {
        id: "finance-compliance",
        title: "Finance & Compliance",
        type: "section",
        children: [
            { id: "gl-journal-wizard", title: "Journal Wizard", type: "link", icon: Sparkles, path: "/gl/journals/wizard", allowedRoles: ["admin", "editor"] },
            { id: "gl-journals", title: "General Ledger", type: "link", icon: BookOpen, path: "/gl/journals", allowedRoles: ["admin", "editor"] },
            { id: "gl-config", title: "Configuration Hub", type: "link", icon: SettingsIcon, path: "/gl/config", allowedRoles: ["admin", "editor"] },
            { id: "gl-budgets", title: "Budget Manager", type: "link", icon: BarChart3, path: "/gl/budgets", allowedRoles: ["admin", "editor"] },
            { id: "gl-reports", title: "Financial Reporting", type: "link", icon: BarChart3, path: "/gl/reports", allowedRoles: ["admin", "editor"] },
            { id: "gl-trial-balance", title: "Trial Balance", type: "link", icon: LayoutGrid, path: "/gl/trial-balance", allowedRoles: ["admin", "editor"] },
            { id: "gl-cvr", title: "CVR Manager", type: "link", icon: Shield, path: "/gl/cvr", allowedRoles: ["admin", "editor"] },
            { id: "gl-data-access", title: "Data Access", type: "link", icon: Lock, path: "/gl/data-access", allowedRoles: ["admin", "editor"] },
            { id: "gl-period-close", title: "Period Close", type: "link", icon: BookOpen, path: "/gl/period-close", allowedRoles: ["admin", "editor"] },
            { id: "gl-journal-rules", title: "Journal Rules", type: "link", icon: Shield, path: "/gl/rules", allowedRoles: ["admin", "editor"] },
            { id: "gl-numbering-rules", title: "Numbering Rules", type: "link", icon: Grid3x3, path: "/gl/sequences", allowedRoles: ["admin", "editor"] },
            { id: "gl-intercompany", title: "Intercompany", type: "link", icon: ArrowRightLeft, path: "/gl/intercompany", allowedRoles: ["admin", "editor"] },
            { id: "gl-revaluation", title: "Revaluation", type: "link", icon: RefreshCw, path: "/gl/revaluation", allowedRoles: ["admin", "editor"] },
            { id: "ap", title: "Accounts Payable", type: "link", icon: DollarSign, path: "/finance/accounts-payable", allowedRoles: ["admin", "editor"] },
            { id: "ar", title: "Accounts Receivable", type: "link", icon: TrendingUp, path: "/finance/accounts-receivable", allowedRoles: ["admin", "editor"] },
            { id: "cash", title: "Cash Management", type: "link", icon: DollarSign, path: "/finance/cash-management", allowedRoles: ["admin", "editor"] },
            { id: "fixed-assets", title: "Fixed Assets", type: "link", icon: Building, path: "/finance/fixed-assets", allowedRoles: ["admin", "editor"] },
            {
                id: "cost-management",
                title: "Cost Management",
                type: "section",
                icon: DollarSign,
                allowedRoles: ["admin", "editor"],
                children: [
                    { id: "cost-dashboard", title: "Dashboard", type: "link", path: "/cost" },
                    { id: "cost-distributions", title: "Cost Distributions", type: "link", path: "/cost/distributions" },
                    { id: "cost-lcm", title: "Landed Cost", type: "link", path: "/cost/lcm" },
                    { id: "cost-scenarios", title: "Scenario Manager", type: "link", path: "/cost/scenarios" },
                ]
            },
            {
                id: "tax",
                title: "Tax Management",
                type: "section",
                icon: Shield,
                allowedRoles: ["admin", "editor"],
                children: [
                    { id: "tax-codes", title: "Tax Codes", type: "link", path: "/finance/tax" },
                    { id: "tax-jurisdictions", title: "Jurisdictions", type: "link", path: "/finance/tax/jurisdictions" },
                    { id: "tax-exemptions", title: "Exemptions", type: "link", path: "/finance/tax/exemptions" },
                ]
            },
            { id: "netting", title: "Netting", type: "link", icon: ArrowRightLeft, path: "/finance/netting", allowedRoles: ["admin", "editor"] },
            {
                id: "project-accounting",
                title: "Project Accounting",
                type: "section",
                icon: Zap,
                allowedRoles: ["admin", "editor"],
                children: [
                    { id: "ppm-dashboard", title: "Accounting Dashboard", type: "link", path: "/projects/accounting" },
                    { id: "ppm-import", title: "Transaction Review", type: "link", path: "/projects/import" },
                    { id: "ppm-expenditures", title: "Expenditure Inquiry", type: "link", path: "/projects/costs" },
                    { id: "ppm-assets", title: "Capital Assets", type: "link", path: "/projects/assets" },
                    { id: "ppm-burden", title: "Burden Schedules", type: "link", path: "/projects/burden" },
                    { id: "ppm-types", title: "Expenditure Types", type: "link", path: "/projects/types" },
                    { id: "ppm-rates", title: "Bill Rate Schedules", type: "link", path: "/projects/rates" },
                    { id: "ppm-templates", title: "Project Templates", type: "link", path: "/projects/templates" },
                    { id: "ppm-billing-rules", title: "Billing Rules", type: "link", path: "/projects/billing-rules" },
                    { id: "ppm-sla", title: "SLA Event Monitor", type: "link", path: "/projects/sla" },
                ]
            },
            {
                id: "procurement",
                title: "Procurement",
                type: "section", // Changed to section to allow children
                icon: ShoppingCart,
                // path: "/procurement", // Removed parent path
                allowedRoles: ["admin", "editor"],
                children: [
                    { id: "procurement-dashboard", title: "Dashboard", type: "link", path: "/procurement" },
                    { id: "procurement-orders", title: "Purchase Orders", type: "link", path: "/procurement/orders" },
                    { id: "procurement-requisitions", title: "Requisitions", type: "link", path: "/procurement/requisitions" },
                ]
            },
            { id: "governance", title: "Governance", type: "link", icon: Lock, path: "/governance", allowedRoles: ["admin"] },
        ],
    },
    {
        id: "supply-chain",
        title: "Supply Chain & Logistics",
        type: "section",
        children: [
            { id: "inventory", title: "Inventory Dashboard", type: "link", icon: Package, path: "/inventory" },
            { id: "warehouse", title: "Warehouse Mgmt", type: "link", icon: Warehouse, path: "/warehouse", allowedRoles: ["admin", "editor"] },
            { id: "scm", title: "Supply Chain", type: "link", icon: Truck, path: "/supply-chain", allowedRoles: ["admin", "editor"] },
            { id: "order-fulfillment", title: "Order Fulfillment", type: "link", icon: ShoppingCart, path: "/order-fulfillment", allowedRoles: ["admin", "editor"] },
            { id: "transportation", title: "Transportation", type: "link", icon: Truck, path: "/transportation", allowedRoles: ["admin", "editor"] },
        ],
    },
    {
        id: "intelligence",
        title: "Intelligence & Integration",
        type: "section",
        children: [
            { id: "analytics", title: "Analytics", type: "link", icon: BarChart3, path: "/analytics" },
            { id: "ai", title: "AI", type: "link", icon: Sparkles, path: "/ai", allowedRoles: ["admin", "editor"] },
            { id: "developer", title: "Developer", type: "link", icon: GitBranch, path: "/developer", allowedRoles: ["admin"] },
        ],
    },
    {
        id: "service-ops",
        title: "Service & Operations",
        type: "section",
        children: [
            { id: "service", title: "Service", type: "link", icon: Package, path: "/service", allowedRoles: ["admin", "editor"] },
            {
                id: "manufacturing",
                title: "Manufacturing",
                type: "section",
                icon: Factory,
                allowedRoles: ["admin", "editor"],
                children: [
                    { id: "mfg-hub", title: "MES Hub", type: "link", path: "/manufacturing" },
                    {
                        id: "mfg-planning",
                        title: "Intelligence",
                        type: "group",
                        children: [
                            { id: "mfg-mrp", title: "MRP Workbench", type: "link", path: "/manufacturing/mrp" },
                            { id: "mfg-gantt", title: "Production Schedule", type: "link", path: "/manufacturing/gantt" },
                        ]
                    },
                    {
                        id: "mfg-execution",
                        title: "Execution",
                        type: "group",
                        children: [
                            { id: "mfg-wo", title: "Work Orders", type: "link", path: "/manufacturing/work-orders" },
                            { id: "mfg-shop", title: "Shop Floor", type: "link", path: "/manufacturing/shop-floor" },
                            { id: "mfg-quality", title: "Quality Control", type: "link", path: "/manufacturing/quality" },
                        ]
                    },
                    {
                        id: "mfg-engineering",
                        title: "Engineering",
                        type: "group",
                        children: [
                            { id: "mfg-bom", title: "BOM Designer", type: "link", path: "/manufacturing/bom" },
                            { id: "mfg-routings", title: "Routing Master", type: "link", path: "/manufacturing/routings" },
                            { id: "mfg-wc", title: "Work Centers", type: "link", path: "/manufacturing/work-centers" },
                            { id: "mfg-resources", title: "Resources", type: "link", path: "/manufacturing/resources" },
                            { id: "mfg-std-ops", title: "Standard Operations", type: "link", path: "/manufacturing/standard-operations" },
                            { id: "mfg-calendars", title: "Calendars", type: "link", path: "/manufacturing/calendars" },
                        ]
                    },
                    {
                        id: "mfg-process",
                        title: "Process Manufacturing",
                        type: "group",
                        children: [
                            { id: "mfg-formulas", title: "Formula Designer", type: "link", path: "/manufacturing/formulas" },
                            { id: "mfg-recipes", title: "Recipe Manager", type: "link", path: "/manufacturing/recipes" },
                            { id: "mfg-batches", title: "Batch Workbench", type: "link", path: "/manufacturing/batches" },
                            { id: "mfg-genealogy", title: "Lot Genealogy", type: "link", path: "/manufacturing/genealogy" },
                        ]
                    },
                    {
                        id: "mfg-finance",
                        title: "Costing & Control",
                        type: "group",
                        children: [
                            { id: "mfg-costing", title: "Costing Workbench", type: "link", path: "/manufacturing/costing" },
                            { id: "mfg-wip", title: "WIP Valuation", type: "link", path: "/manufacturing/wip" },
                            { id: "mfg-variance", title: "Variance Analysis", type: "link", path: "/manufacturing/variances" },
                        ]
                    },
                ]
            },
            { id: "logistics", title: "Logistics", type: "link", icon: Truck, path: "/logistics", allowedRoles: ["admin", "editor"] },
        ],
    },
    {
        id: "workflow-automation",
        title: "Workflow & Automation",
        type: "section",
        children: [
            { id: "workflow", title: "Workflow", type: "link", icon: Workflow, path: "/workflow", allowedRoles: ["admin", "editor"] },
            { id: "automation", title: "Automation", type: "link", icon: Brain, path: "/automation", allowedRoles: ["admin"] },
            { id: "communication", title: "Communication", type: "link", icon: Bell, path: "/communication", allowedRoles: ["admin", "editor"] },
        ],
    },
    {
        id: "education-marketing",
        title: "Education & Marketing",
        type: "section",
        children: [
            { id: "education", title: "Education", type: "link", icon: GraduationCap, path: "/education" },
            { id: "marketing", title: "Marketing", type: "link", icon: TrendingUp, path: "/marketing", allowedRoles: ["admin", "editor"] },
        ],
    },
    {
        id: "platform-admin",
        title: "Platform Admin",
        type: "section",
        children: [
            { id: "user-mgmt", title: "User Management", type: "link", icon: Users, path: "/user-management", allowedRoles: ["admin"] },
            { id: "tenant-admin", title: "Tenant Admin", type: "link", icon: Building, path: "/tenant-admin", allowedRoles: ["admin"] },
            { id: "system-config", title: "System Config", type: "link", icon: SettingsIcon, path: "/system-configuration", allowedRoles: ["admin"] },
            { id: "deploy-industry", title: "Deploy Industry", type: "link", icon: Factory, path: "/industry-setup", allowedRoles: ["admin"] },
            { id: "view-deployments", title: "View Deployments", type: "link", icon: Database, path: "/industry-deployments", allowedRoles: ["admin"] },
        ],
    }
];
