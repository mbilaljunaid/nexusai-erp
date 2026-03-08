import { Link } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Package, DollarSign, AlertTriangle, TrendingDown,
    ChevronRight, BarChart3, Settings, Calculator, Layers
} from "lucide-react";

const kpis = [
    { label: "Active Cost Books", value: "6", icon: Package, color: "text-blue-500" },
    { label: "Avg Product Cost", value: "$142.50", icon: DollarSign, color: "text-green-500" },
    { label: "Pending Adjustments", value: "8", icon: AlertTriangle, color: "text-amber-500" },
    { label: "Cost Variance", value: "2.3%", icon: TrendingDown, color: "text-purple-500" },
];

const modules = [
    { title: "Cost Dashboard", description: "Cost management overview & KPIs", href: "/scm/costing/dashboard", icon: BarChart3 },
    { title: "Cost Adjustments", description: "Review and approve cost adjustments", href: "/scm/costing/approvals", icon: Calculator },
    { title: "Cost Components", description: "Define material, labour, overhead elements", href: "/scm/lcm/components", icon: Layers },
    { title: "LCM Operations", description: "Landed cost management workbench", href: "/scm/lcm/operations", icon: Package },
    { title: "Cost Analytics", description: "Cost trend analysis and reporting", href: "/scm/costing/analytics", icon: BarChart3 },
    { title: "Cost Setup", description: "Configure cost organizations & methods", href: "/scm/costing/setup", icon: Settings },
];

export default function CostManagementDashboard() {
    return (
        <StandardPage
            title="Cost Management"
            description="Product costing, landed costs, and cost variance analysis"
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
