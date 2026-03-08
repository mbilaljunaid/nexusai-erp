import { Link } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeftRight, CheckCircle, AlertCircle, DollarSign,
    ChevronRight, GitMerge, Scale, Receipt, FileText, Settings
} from "lucide-react";

const kpis = [
    { label: "Open IC Transactions", value: "47", icon: ArrowLeftRight, color: "text-blue-500" },
    { label: "Pending Reconciliation", value: "12", icon: AlertCircle, color: "text-amber-500" },
    { label: "Netting Balance", value: "$2.4M", icon: DollarSign, color: "text-green-500" },
    { label: "Matched This Month", value: "94%", icon: CheckCircle, color: "text-purple-500" },
];

const modules = [
    { title: "IC Workbench", description: "Manage intercompany transactions", href: "/finance/intercompany/workbench", icon: ArrowLeftRight },
    { title: "Reconciliation", description: "Match and reconcile IC balances", href: "/finance/intercompany/reconciliation", icon: CheckCircle },
    { title: "Netting", description: "Multi-entity netting workbench", href: "/finance/intercompany/netting", icon: GitMerge },
    { title: "Allocations", description: "Cross-entity cost allocations", href: "/finance/intercompany/allocations", icon: Scale },
    { title: "Auto-Invoice", description: "Automate IC invoicing", href: "/finance/intercompany/auto-invoice", icon: Receipt },
    { title: "Receiver Workbench", description: "Review received IC invoices", href: "/finance/intercompany/receiver-workbench", icon: FileText },
    { title: "Netting Settlement", description: "Process netting payments", href: "/finance/intercompany/netting-settlement", icon: DollarSign },
    { title: "Data Access", description: "Manage IC data access rules", href: "/finance/intercompany/data-access", icon: Settings },
];

export default function ICDashboard() {
    return (
        <StandardPage
            title="Intercompany"
            description="Manage intercompany transactions, reconciliation, and netting across legal entities"
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
