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
        ],
    },
    {
        label: "Sales Ops",
        items: [
            { title: "Territories", url: "/crm/territories", icon: Map },
            { title: "Forecast", url: "/crm/forecast", icon: TrendingUp },
            { title: "Incentive Comp", url: "/crm/incentives", icon: DollarSign },
            { title: "Commissions", url: "/crm/commissions/admin", icon: DollarSign },
            { title: "Quota Management", url: "/crm/quotas", icon: Target },
        ],
    },
    {
        label: "Marketing",
        items: [
            { title: "Campaigns", url: "/crm/campaigns", icon: Megaphone },
            { title: "Email Builder", url: "/crm/marketing/campaigns", icon: Megaphone },
            { title: "Marketing Automation", url: "/crm/marketing/automation", icon: TrendingUp },
            { title: "Analytics", url: "/crm/analytics", icon: BarChart3 },
        ],
    },
    {
        label: "Service & Contracts",
        items: [
            { title: "Cases / Service", url: "/crm/cases", icon: LifeBuoy },
            { title: "Field Service", url: "/crm/field-service", icon: Truck },
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
