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
            { id: "processes", title: "Processes", type: "link", icon: WorkflowIcon, path: "/processes" },
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
                id: "finance", title: "Finance & Accounting", type: "group", icon: DollarSign, path: "/finance",
                children: [
                    { id: "finance-gl", title: "General Ledger", type: "link", path: "/finance/gl" },
                    { id: "finance-ap", title: "Accounts Payable", type: "link", path: "/finance/ap" },
                    { id: "finance-ar", title: "Accounts Receivable", type: "link", path: "/finance/accounts-receivable" },
                    { id: "finance-cm", title: "Cash & Treasury", type: "link", path: "/finance/treasury" },
                    { id: "finance-rev", title: "Billing & Revenue", type: "link", path: "/finance/revenue" },
                    { id: "finance-fa", title: "Fixed Assets", type: "link", path: "/finance/fixed-assets" },
                    { id: "finance-ic", title: "Intercompany", type: "link", path: "/finance/intercompany/workbench" },
                    { id: "finance-sla", title: "Subledger Accounting", type: "link", path: "/finance/sla" },
                    { id: "finance-expense", title: "Expense Management", type: "link", path: "/finance/expense-management" },
                    { id: "finance-tax", title: "Tax Management", type: "link", path: "/finance/tax" },
                ]
            },
            {
                id: "epm", title: "Enterprise Performance (EPM)", type: "group", icon: TrendingUp, path: "/epm",
                children: [
                    { id: "epm-planning", title: "Planning", type: "link", path: "/epm/planning" },
                    { id: "epm-budgeting", title: "Budgeting", type: "link", path: "/epm/budgeting" },
                    { id: "epm-forecasting", title: "Forecasting", type: "link", path: "/epm/forecasting" },
                    { id: "epm-modeling", title: "Financial Modeling", type: "link", path: "/epm/modeling" },
                    { id: "epm-consolidation", title: "Consolidation", type: "link", path: "/finance/gl/consolidation" },
                ]
            },
            {
                id: "scm", title: "Supply Chain & Procurement", type: "group", icon: Package, path: "/scm",
                children: [
                    { id: "procurement", title: "Procurement", type: "link", path: "/scm/procurement" },
                    { id: "portal-supplier", title: "Supplier Portal", type: "link", path: "/portal/supplier" },
                    { id: "inventory", title: "Inventory", type: "link", path: "/inventory" },
                    { id: "costing", title: "Cost Management", type: "link", path: "/scm/costing/dashboard" },
                ]
            },
            {
                id: "mfg", title: "Manufacturing & Operations", type: "group", icon: Hammer, path: "/manufacturing",
                children: [
                    { id: "manufacturing", title: "Manufacturing", type: "link", path: "/manufacturing/dashboard" },
                    { id: "wms", title: "Warehouse (WMS)", type: "link", path: "/scm/wms/dashboard" },
                    { id: "tms", title: "Transportation (TMS)", type: "link", path: "/transportation" },
                    { id: "lcm", title: "Landed Cost (LCM)", type: "link", path: "/scm/lcm/operations" },
                    { id: "logistics", title: "Logistics", type: "link", path: "/logistics" },
                    { id: "quality", title: "Quality Management", type: "link", path: "/manufacturing/quality" },
                    { id: "maintenance", title: "Maintenance (EAM)", type: "link", path: "/maintenance" },
                ]
            },
            {
                id: "crm", title: "CRM & Sales", type: "group", icon: Target, path: "/crm",
                children: [
                    { id: "crm-sales", title: "Sales Execution", type: "link", path: "/crm" },
                    { id: "crm-cpq", title: "CPQ & Quotes", type: "link", path: "/crm/cpq" },
                    { id: "crm-service", title: "Service & Customer Portal", type: "link", path: "/service" },
                    { id: "crm-marketing", title: "Marketing", type: "link", path: "/marketing" },
                    { id: "crm-partners", title: "Partners (PRM)", type: "link", path: "/crm/partners" }
                ]
            },
            {
                id: "hr", title: "HR & Talent", type: "group", icon: Briefcase, path: "/hr",
                children: [
                    { id: "hr-core", title: "Core HR", type: "link", path: "/hr" },
                    { id: "hr-recruit", title: "Recruitment", type: "link", path: "/hr/recruitment" },
                    { id: "hr-talent", title: "Talent & Learning", type: "link", path: "/talent/learning" },
                    { id: "hr-wfm", title: "Workforce Mgmt (WFM)", type: "link", path: "/wfm/my-time" },
                    { id: "hr-rewards", title: "Rewards", type: "link", path: "/rewards/compensation" },
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
                id: "industry-verticals", title: "Industry Solutions", type: "group", icon: Landmark, path: "/industries",
                children: [
                    { id: "ind-mfg", title: "Manufacturing & High-Tech", type: "link", path: "/industries/manufacturing" },
                    { id: "ind-retail", title: "Retail & Consumer Goods", type: "link", path: "/industries/retail" },
                    { id: "ind-health", title: "Healthcare & Life Sciences", type: "link", path: "/industries/healthcare" },
                    { id: "ind-finserv", title: "Financial Services", type: "link", path: "/industries/financial-services" },
                    { id: "ind-public", title: "Public Sector", type: "link", path: "/industries/public-sector" },
                    { id: "ind-ec", title: "Engineering & Construction", type: "link", path: "/industries/engineering" },
                    { id: "ind-proserv", title: "Professional Services", type: "link", path: "/industries/professional-services" },
                    { id: "ind-telco", title: "Telecommunications", type: "link", path: "/industries/telecom" },
                    { id: "ind-energy", title: "Energy & Utilities", type: "link", path: "/industries/energy" },
                    { id: "ind-auto", title: "Automotive", type: "link", path: "/industries/automotive" },
                    { id: "ind-aero", title: "Aerospace & Defense", type: "link", path: "/industries/aerospace" },
                    { id: "ind-logistics", title: "Logistics & Transport", type: "link", path: "/industries/logistics" },
                    { id: "ind-media", title: "Media & Entertainment", type: "link", path: "/industries/media" },
                    { id: "ind-hospitality", title: "Hospitality & Travel", type: "link", path: "/industries/hospitality" },
                    { id: "ind-realestate", title: "Real Estate", type: "link", path: "/industries/real-estate" },
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
