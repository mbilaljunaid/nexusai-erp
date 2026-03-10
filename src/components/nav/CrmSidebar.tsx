import {
    Target, // Leads/Opportunities
    Users, // Contacts/Partners
    Briefcase, // Accounts
    Map, // Territories
    DollarSign, // Incentives/Commissions
    TrendingUp, // Forecast
    Megaphone, // Campaigns
    LifeBuoy, // Cases/Service
    FileText, // Contracts
    Truck, // Field Service
    BarChart3, // Analytics
    Settings, // CPQ Configurator
    ShieldCheck, // Service Entitlements
} from "lucide-react";
import { DomainSidebar } from "./DomainSidebar";

export const crmMenu = [
    {
        label: "Sales Core",
        items: [
            { title: "Dashboard", url: "/crm", icon: BarChart3 },
            { title: "Leads", url: "/crm/leads", icon: Target },
            { title: "Accounts", url: "/crm/accounts", icon: Briefcase },
            { title: "Contacts", url: "/crm/contacts", icon: Users },
            { title: "Opportunities", url: "/crm/leads", icon: Target },
            { title: "Mobile Rep Sales", url: "/crm/sales/mobile", icon: Target },
            { title: "Activities", url: "/crm/activities", icon: BarChart3 },
        ],
    },
    {
        label: "CPQ & Products",
        items: [
            { title: "Product Catalog", url: "/crm/catalog", icon: Briefcase },
            { title: "CPQ Dashboard", url: "/crm/cpq", icon: DollarSign },
            { title: "CPQ Rules Config", url: "/crm/cpq/rules", icon: Settings },
            { title: "Guided Selling", url: "/crm/cpq/guided", icon: Settings },
            { title: "Quote Builder", url: "/crm/quotes/builder", icon: FileText },
            { title: "Quote Approvals", url: "/crm/cpq/approvals", icon: FileText },
            { title: "Terms & CLM", url: "/crm/cpq/clm", icon: FileText },
        ],
    },
    {
        label: "Sales Ops",
        items: [
            { title: "Territories", url: "/crm/territories", icon: Map },
            { title: "Playbook Builder", url: "/crm/sales/playbooks", icon: Briefcase },
            { title: "Forecast", url: "/crm/forecast", icon: TrendingUp },
            { title: "Collab Forecasting", url: "/crm/sales/forecasting", icon: TrendingUp },
            { title: "Quota Management", url: "/crm/quotas", icon: Target },
            { title: "Incentive Comp", url: "/crm/incentives", icon: DollarSign },
            { title: "Leaderboard", url: "/crm/incentives/leaderboard", icon: Target },
            { title: "Commissions", url: "/crm/commissions/admin", icon: DollarSign },
            { title: "Disputes", url: "/crm/incentives/disputes", icon: DollarSign },
            { title: "Clawback Rules", url: "/crm/compensation/clawbacks", icon: DollarSign },
            { title: "Agreements", url: "/crm/compensation/agreements", icon: DollarSign },
        ],
    },
    {
        label: "Marketing",
        items: [
            { title: "Campaigns", url: "/crm/campaigns", icon: Megaphone },
            { title: "Email Builder", url: "/crm/marketing/email-templates", icon: Megaphone },
            { title: "Campaign Flows", url: "/crm/campaigns/builder", icon: TrendingUp },
            { title: "Segments", url: "/crm/marketing/segments", icon: Users },
            { title: "Attribution ROI", url: "/crm/marketing/attribution", icon: DollarSign },
            { title: "UTM Tracking", url: "/crm/marketing/utm", icon: Target },
            { title: "A/B Testing", url: "/crm/marketing/ab-testing", icon: Target },
            { title: "Analytics", url: "/crm/analytics", icon: BarChart3 },
        ],
    },
    {
        label: "Service & Contracts",
        items: [
            { title: "Cases / Service", url: "/crm/cases", icon: LifeBuoy },
            { title: "Email-to-Case", url: "/crm/service/email-to-case", icon: LifeBuoy },
            { title: "Omnichannel Routing", url: "/crm/cases/routing", icon: Target },
            { title: "Contact Center", url: "/crm/service/analytics", icon: BarChart3 },
            { title: "Agent Scripts", url: "/crm/service/scripts", icon: FileText },
            { title: "Customer Surveys", url: "/crm/service/csat", icon: FileText },
            { title: "Service Entitlements", url: "/crm/service/entitlements", icon: ShieldCheck },
            { title: "Field Serv Optimizer", url: "/crm/field-service/optimizer", icon: Truck },
            { title: "Field Serv Mobile", url: "/crm/field-service/mobile", icon: Truck },
            { title: "Field Serv Skills", url: "/crm/field-service/skills", icon: Truck },
            { title: "Parts Replenish", url: "/crm/field-service/parts", icon: Truck },
            { title: "Work Orders", url: "/crm/field-service", icon: Truck },
            { title: "Contracts (CLM)", url: "/crm/contracts", icon: FileText },
            { title: "Knowledge Base", url: "/crm/knowledge", icon: FileText },
        ],
    },
    {
        label: "Partners",
        items: [
            { title: "Partner Portal", url: "/crm/partner", icon: Users },
        ],
    },
];

export function CrmSidebar() {
    return <DomainSidebar title="CRM" menu={crmMenu} />;
}
