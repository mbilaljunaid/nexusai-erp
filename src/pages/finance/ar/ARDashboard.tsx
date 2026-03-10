import { Link } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    FileText, Users, Receipt, BarChart3, FileX,
    RefreshCw, Settings, CheckSquare, Package, Lock,
    ChevronRight, AlertCircle, TrendingDown, Inbox
} from "lucide-react";

const kpis = [
    { label: "Open Invoices", value: "142", icon: FileText, color: "text-blue-500" },
    { label: "Total Receivable", value: "$2.4M", icon: TrendingDown, color: "text-green-500" },
    { label: "Overdue Invoices", value: "38", icon: AlertCircle, color: "text-red-500" },
    { label: "Collected This Month", value: "$890K", icon: Receipt, color: "text-purple-500" },
];

const modules = [
    { title: "Invoices", description: "AR invoice list and detail", href: "/finance/ar/invoices", icon: FileText },
    { title: "Receipts", description: "Cash receipts and applications", href: "/finance/ar/receipts", icon: Inbox },
    { title: "Customers", description: "Customer accounts and profiles", href: "/finance/ar/customers", icon: Users },
    { title: "AutoInvoice Workbench", description: "Automated invoice creation", href: "/finance/ar/autoinvoice", icon: RefreshCw },
    { title: "Dunning Workbench", description: "Collections follow-up", href: "/finance/ar/dunning", icon: AlertCircle },
    { title: "Collections Workbench", description: "Manage collections pipeline", href: "/finance/ar/collections", icon: Package },
    { title: "Credit / Debit Memos", description: "Adjustments and credit notes", href: "/finance/ar/credit-debit-memos", icon: FileX },
    { title: "Receipt Application", description: "Apply receipts to invoices", href: "/finance/ar/receipt-application", icon: CheckSquare },
    { title: "Remittance Batches", description: "Batch remittance processing", href: "/finance/ar/remittance-batches", icon: Package },
    { title: "Customer Hierarchy", description: "Parent/child customer relationships", href: "/finance/ar/customer-hierarchy", icon: Users },
    { title: "Lockbox Setup", description: "Configure lockbox processing", href: "/finance/ar/lockbox-setup", icon: Lock },
    { title: "Customer Profile Classes", description: "Credit and payment profiles", href: "/finance/ar/profile-classes", icon: Settings },
    { title: "Analytics", description: "AR performance analytics", href: "/finance/ar/analytics", icon: BarChart3 },
    { title: "Period Close", description: "Month-end close process", href: "/finance/ar/period-close", icon: CheckSquare },
];

export default function ARDashboard() {
    return (
        <StandardPage
            title="Accounts Receivable"
            description="Manage invoices, receipts, customers, and collections"
        >
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
                {kpis.map((kpi) => (
                    <Card key={kpi.label}>
                        <CardContent className="flex items-center gap-3 p-4">
                            <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
                            <div>
                                <p className="text-2xl font-bold">{kpi.value}</p>
                                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {modules.map((mod) => (
                    <Link key={mod.href} to={mod.href}>
                        <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">{mod.title}</CardTitle>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <mod.icon className="h-6 w-6 text-muted-foreground mb-2" />
                                <p className="text-xs text-muted-foreground">{mod.description}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </StandardPage>
    );
}
