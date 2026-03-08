import {
    FileText,
    DollarSign,
    BarChart3,
    TrendingUp,
    Briefcase,
    Settings,
    Layers,
    CheckSquare,
    RefreshCw,
    ShieldCheck,
    FileCheck,
    PieChart,
    RotateCcw,
    BookOpen,
    AlertCircle,
    ArrowRight,
    Upload,
    GitBranch,
    Search,
    Shield,
    Wallet,
    Banknote,
    MapPin,
} from "lucide-react";
import { DomainSidebar } from "./DomainSidebar";

export const financeMenu = [
    {
        label: "General Ledger",
        items: [
            { title: "Dashboard", url: "/finance", icon: BarChart3 },
            { title: "Journals", url: "/gl/journals", icon: FileText },
            { title: "Trial Balance", url: "/gl/trial-balance", icon: BarChart3 },
            { title: "Consolidation", url: "/gl/consolidation", icon: Layers },
            { title: "Close Center", url: "/gl/close-center", icon: CheckSquare },
            { title: "Chart of Accounts", url: "/gl/coa-structures", icon: Settings },
        ],
    },
    {
        label: "Payables (AP)",
        items: [
            { title: "AP Dashboard", url: "/finance/ap", icon: BarChart3 },
            { title: "Invoice Workbench", url: "/finance/ap/invoices", icon: FileText },
            { title: "Suppliers", url: "/finance/ap/suppliers", icon: Users },
            { title: "Payment Batches", url: "/finance/ap/payments", icon: DollarSign },
            { title: "Prepayments", url: "/finance/ap/prepayments", icon: DollarSign },
            { title: "AI Invoice Capture", url: "/finance/ap/ai-capture", icon: TrendingUp },
            { title: "Reports", url: "/finance/ap/reports", icon: BarChart3 },
            { title: "Withholding Tax", url: "/finance/ap/withholding-tax", icon: Settings },
            { title: "Recurring Invoices", url: "/finance/ap/recurring-invoices", icon: RefreshCw },
            { title: "Supplier Merge", url: "/finance/ap/supplier-merge", icon: RefreshCw },
            { title: "Hold Types Setup", url: "/finance/ap/config/hold-types", icon: Settings },
            { title: "Distribution Sets", url: "/finance/ap/config/distribution-sets", icon: FileText },
            { title: "4-Way Match Config", url: "/finance/ap/config/match-tolerances", icon: CheckSquare },
            { title: "Configuration", url: "/finance/ap/config", icon: Settings },
        ],
    },
    {
        label: "Receivables (AR)",
        items: [
            { title: "Dunning Workbench", url: "/finance/ar/dunning", icon: FileCheck },
            { title: "Invoices", url: "/finance/ar/invoices", icon: FileText },
            { title: "Chargeback Workbench", url: "/finance/ar/chargebacks", icon: RotateCcw },
            { title: "Credit / Debit Memos", url: "/finance/ar/credit-debit-memos", icon: FileText },
            { title: "Receipt Application", url: "/finance/ar/receipt-application", icon: CheckSquare },
            { title: "Adjustment Approvals", url: "/finance/ar/adjustment-approvals", icon: ShieldCheck },
            { title: "Analytics", url: "/finance/ar/analytics", icon: BarChart3 },
            { title: "Reports", url: "/finance/ar/reports", icon: FileText },
            { title: "Period Close", url: "/finance/ar/period-close", icon: CheckSquare },
        ],
    },
    {
        label: "Billing & Revenue",
        items: [
            { title: "Billing Dashboard", url: "/finance/billing", icon: BarChart3 },
            { title: "Billing Workbench", url: "/finance/billing/workbench", icon: FileText },
            { title: "Revenue Contracts", url: "/finance/revenue/contracts", icon: DollarSign },
            { title: "Tax Management", url: "/finance/tax", icon: DollarSign },
            { title: "VAT Return Output", url: "/finance/tax/vat-return", icon: FileText },
            { title: "Supplier TRN Validator", url: "/finance/tax/supplier-trn", icon: Search },
            { title: "Expense Management", url: "/finance/expense-management", icon: FileText },
            { title: "Cash Advances", url: "/expenses/cash-advances", icon: Wallet },
            { title: "Audit Rule Sets", url: "/expenses/audit-rules", icon: Shield },
            { title: "Payroll Reimbursement", url: "/expenses/payroll-reimbursement", icon: Banknote },
            { title: "Per Diem Rates", url: "/expenses/per-diem-rates", icon: MapPin },
        ],
    },
    {
        label: "Assets & Cash",
        items: [
            { title: "Asset Workbench", url: "/finance/fixed-assets", icon: Briefcase },
            { title: "Fixed Assets", url: "/finance/fixed-assets/inquiry", icon: FileText },
            { title: "Capital Projects (CIP)", url: "/finance/fixed-assets/capital-projects", icon: TrendingUp },
            { title: "Tax Books (MACRS)", url: "/finance/fixed-assets/tax-books", icon: BookOpen },
            { title: "Reclassification", url: "/finance/fixed-assets/reclassification", icon: ArrowRight },
            { title: "Prorate Conventions", url: "/finance/fixed-assets/prorate-conventions", icon: Settings },
            { title: "Physical Inventory", url: "/finance/fixed-assets/physical-inventory", icon: CheckSquare },
            { title: "Treasury Bank Accounts", url: "/finance/treasury/bank-accounts", icon: Briefcase },
            { title: "Cash Dashboard", url: "/finance/cash", icon: BarChart3 },
            { title: "Bank Statement Import", url: "/finance/cash/bank-statement-import", icon: Upload },
            { title: "Bank Reconciliation", url: "/finance/cash/reconciliation", icon: CheckSquare },
            { title: "Cash Forecasting", url: "/finance/cash/forecasting", icon: TrendingUp },
            { title: "Currency Revaluation", url: "/finance/cash/revaluation", icon: RefreshCw },
            { title: "Notional Cash Pooling", url: "/finance/cash/notional-pooling", icon: Layers },
            { title: "Bank Exceptions", url: "/finance/cash/bank-exceptions", icon: AlertCircle },
            { title: "ZBA Management", url: "/finance/cash/zba", icon: Layers },
        ],
    },
    {
        label: "Intercompany",
        items: [
            { title: "Workbench", url: "/finance/intercompany/workbench", icon: TrendingUp },
            { title: "Reconciliation", url: "/finance/intercompany/reconciliation", icon: BarChart3 },
            { title: "Netting", url: "/finance/intercompany/netting", icon: TrendingUp },
            { title: "Netting Settlement", url: "/intercompany/netting-settlement", icon: DollarSign },
            { title: "Auto-Invoice", url: "/intercompany/auto-invoice", icon: FileText },
            { title: "Receiver Workbench", url: "/intercompany/receiver-workbench", icon: CheckSquare },
        ],
    },
    {
        label: "Lease Management",
        items: [
            { title: "Portfolio Workbench", url: "/finance/leases", icon: Briefcase },
            { title: "Compliance Dashboard", url: "/finance/leases/compliance", icon: PieChart },
            { title: "Approval Hub", url: "/finance/leases/approvals", icon: FileCheck },
            { title: "Approval Chains", url: "/finance/leases/approval-chains", icon: GitBranch },
            { title: "Lease System Setup", url: "/finance/leases/setup", icon: Settings },
            { title: "Disclosure Reports", url: "/finance/leases/reports/disclosure", icon: FileText },
        ]
    },
    {
        label: "Contracts (CLM)",
        items: [
            { title: "Contract List", url: "/finance/contracts", icon: FileText },
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
