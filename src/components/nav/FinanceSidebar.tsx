import {
    FileText,
    DollarSign,
    BarChart3,
    TrendingUp,
    Briefcase,
    Settings,
    Layers,
    CheckSquare,
} from "lucide-react";
import { DomainSidebar } from "./DomainSidebar";

export const financeMenu = [
    {
        label: "General Ledger",
        items: [
            { title: "Dashboard", url: "/finance", icon: BarChart3 },
            { title: "Journals", url: "/gl/journals", icon: FileText },
            { title: "Trial Balance", url: "/gl/trial-balance", icon: BarChart3 },
            { title: "Consolidation", url: "/gl/consolidation", icon: Layers }, // New
            { title: "Close Center", url: "/gl/close-center", icon: CheckSquare }, // Updated
            { title: "Chart of Accounts", url: "/gl/coa-structures", icon: Settings },
        ],
    },
    {
        label: "Payables (AP)",
        items: [
            { title: "Invoices", url: "/finance/accounts-payable", icon: FileText },
            { title: "Payments", url: "/finance/ap/payments", icon: DollarSign },
            { title: "Suppliers", url: "/finance/ap/suppliers", icon: Users },
        ],
    },
    {
        label: "Receivables (AR)",
        items: [
            { title: "Invoices", url: "/finance/ar/invoices", icon: FileText },
            { title: "Customers", url: "/finance/ar/customers", icon: Users },
            { title: "Collections", url: "/finance/ar/collections", icon: DollarSign },
        ],
    },
    {
        label: "Assets & Cash",
        items: [
            { title: "Fixed Assets", url: "/finance/fixed-assets", icon: Briefcase },
            { title: "Cash Management", url: "/finance/cash-management", icon: DollarSign },
        ],
    },
    {
        label: "Lease Management",
        items: [
            { title: "Portfolio Workbench", url: "/finance/leases", icon: Briefcase },
            { title: "Lease Setup", url: "/finance/leases/setup", icon: Settings },
        ]
    },
    {
        label: "Contracts (CLM)",
        items: [
            { title: "Contract List", url: "/finance/contracts", icon: FileText },
            { title: "Revenue Contracts", url: "/revenue/contracts", icon: DollarSign },
        ]
    },
    {
        label: "Reporting",
        items: [
            { title: "Financial Reports", url: "/gl/reports", icon: BarChart3 },
            { title: "Report Builder", url: "/gl/reports/builder", icon: Settings },
        ],
    },
];

// Import missing icons locally for now if not available in lucide-react (Clock/Users were implied)
import { Clock, Users } from "lucide-react";

export function FinanceSidebar() {
    return <DomainSidebar title="Finance" menu={financeMenu} />;
}
