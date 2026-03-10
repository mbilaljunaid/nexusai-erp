import { Link } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    FileText, CheckCircle, DollarSign, AlertCircle,
    ChevronRight, BarChart3, Clock, Settings
} from "lucide-react";

const kpis = [
    { label: "Pending Reports", value: "24", icon: FileText, color: "text-blue-500" },
    { label: "Pending Approvals", value: "7", icon: Clock, color: "text-amber-500" },
    { label: "Total Reimbursable", value: "$48,200", icon: DollarSign, color: "text-green-500" },
    { label: "Policy Violations", value: "3", icon: AlertCircle, color: "text-red-500" },
];

const modules = [
    { title: "New Expense Report", description: "Submit a new expense claim", href: "/finance/expenses/new-report", icon: FileText },
    { title: "Approval Workbench", description: "Review and approve expense reports", href: "/finance/expenses/approvals", icon: CheckCircle },
    { title: "Cash Advances", description: "Manage cash advance requests", href: "/finance/expenses/cash-advances", icon: DollarSign },
    { title: "Audit Rules", description: "Configure expense audit policies", href: "/finance/expenses/audit-rules", icon: Settings },
    { title: "Per Diem Rates", description: "Manage per diem rate tables", href: "/finance/expenses/per-diem-rates", icon: BarChart3 },
    { title: "Payroll Reimbursement", description: "Transfer reimbursements to payroll", href: "/finance/expenses/payroll-reimbursement", icon: DollarSign },
    { title: "Expense Analytics", description: "Spend analytics and trends", href: "/finance/expenses/analytics", icon: BarChart3 },
];

export default function ExpenseDashboard() {
    return (
        <StandardPage
            title="Expense Management"
            description="Submit, approve, and audit employee expense reports"
        >
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
