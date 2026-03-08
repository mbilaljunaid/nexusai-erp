import { Link } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Settings, FileText, ShoppingCart, Package,
    ChevronRight, BarChart3, Tag
} from "lucide-react";

const kpis = [
    { label: "Active Configurations", value: "142", icon: Settings, color: "text-blue-500" },
    { label: "Quotes This Month", value: "38", icon: FileText, color: "text-green-500" },
    { label: "Avg Quote Value", value: "$84K", icon: ShoppingCart, color: "text-purple-500" },
    { label: "Products in Catalog", value: "214", icon: Package, color: "text-amber-500" },
];

const modules = [
    { title: "CPQ Configurator", description: "Product configuration engine", href: "/crm/cpq/configure", icon: Settings },
    { title: "Quote Builder", description: "Create and send sales quotes", href: "/crm/quotes/builder", icon: FileText },
    { title: "Product Catalog", description: "Manage products and bundles", href: "/crm/catalog", icon: Package },
    { title: "Deal Desk", description: "Advanced pricing approvals", href: "/crm/deal-desk", icon: Tag },
    { title: "CPQ Analytics", description: "Quote win rates and trends", href: "/crm/cpq/analytics", icon: BarChart3 },
];

export default function CPQDashboard() {
    return (
        <StandardPage
            title="CPQ — Configure, Price, Quote"
            description="Product configuration, guided selling, and quote management"
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
