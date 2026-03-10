import { Link } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BookOpen, GitBranch, FileText, CheckCircle,
    ChevronRight, BarChart3, Settings
} from "lucide-react";

const kpis = [
    { label: "Active SLA Rules", value: "142", icon: BookOpen, color: "text-blue-500" },
    { label: "Unprocessed Events", value: "18", icon: GitBranch, color: "text-amber-500" },
    { label: "Journals Pending", value: "7", icon: FileText, color: "text-purple-500" },
    { label: "Reconciled (Today)", value: "99.4%", icon: CheckCircle, color: "text-green-500" },
];

const modules = [
    { title: "Accounting Hub", description: "Accounting Hub workbench — event processing", href: "/finance/sla/accounting-hub", icon: BookOpen },
    { title: "ADR Builder", description: "Account derivation rules and mapping sets", href: "/finance/sla/adr-builder", icon: GitBranch },
    { title: "SLA Reconciliation", description: "Subledger to GL reconciliation", href: "/finance/sla/reconciliation", icon: CheckCircle },
    { title: "Manual Journal", description: "Manually create SLA accounting entries", href: "/finance/sla/manual-journal", icon: FileText },
    { title: "SLA Analytics", description: "Subledger accounting performance reports", href: "/analytics", icon: BarChart3 },
    { title: "SLA Configuration", description: "Rules, mappings and journal line types", href: "/system-configuration", icon: Settings },
];

export default function SLADashboard() {
    return (
        <StandardPage
            title="Subledger Accounting (SLA)"
            description="Define accounting rules, process events, reconcile subledgers to the General Ledger"
            breadcrumbs={[{ label: "Finance", href: "/finance" }, { label: "Subledger Accounting" }]}
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
