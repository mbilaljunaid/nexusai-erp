import { Link } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Globe, FileSearch, Settings, AlertCircle,
    ChevronRight, BarChart3, CheckCircle, BookOpen
} from "lucide-react";

const kpis = [
    { label: "Active Tax Regimes", value: "8", icon: Globe, color: "text-blue-500" },
    { label: "Tax Rules Configured", value: "124", icon: Settings, color: "text-green-500" },
    { label: "Open VAT Return Periods", value: "3", icon: AlertCircle, color: "text-amber-500" },
    { label: "Supplier TRN Validated", value: "97%", icon: CheckCircle, color: "text-purple-500" },
];

const modules = [
    { title: "Tax Regimes", description: "Configure global tax regimes and rates", href: "/finance/tax/regimes", icon: Globe },
    { title: "Tax Rules", description: "Determining factors and classifications", href: "/finance/tax/rules", icon: Settings },
    { title: "VAT Return Wizard", description: "Generate and submit VAT returns", href: "/finance/tax/vat-return", icon: FileSearch },
    { title: "Tax Subscriptions", description: "Link taxes to legal entities and BUs", href: "/finance/tax/subscriptions", icon: BookOpen },
    { title: "Supplier TRN Validator", description: "Validate supplier tax registration numbers", href: "/finance/tax/supplier-trn", icon: CheckCircle },
    { title: "Withholding Tax", description: "WHT setup and calculations", href: "/finance/tax/withholding", icon: AlertCircle },
    { title: "Tax Analytics", description: "Tax liability and reclaim analytics", href: "/finance/tax/analytics", icon: BarChart3 },
];

export default function TaxDashboard() {
    return (
        <StandardPage
            title="Tax Management"
            description="Configure and manage global tax regimes, rules, and compliance"
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
