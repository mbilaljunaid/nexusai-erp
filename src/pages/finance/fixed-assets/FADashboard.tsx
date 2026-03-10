import { Link } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Laptop, Calculator, Plus, Layers, TrendingDown, AlertTriangle,
    ChevronRight, FileText, Settings, BarChart3, Search, RefreshCw
} from "lucide-react";

const kpis = [
    { label: "Total Assets", value: "4,812", icon: Layers, color: "text-blue-500" },
    { label: "Gross Book Value", value: "$184.3M", icon: Calculator, color: "text-green-500" },
    { label: "Accumulated Depreciation", value: "$62.1M", icon: TrendingDown, color: "text-amber-500" },
    { label: "Pending Additions", value: "23", icon: Plus, color: "text-purple-500" },
];

const modules = [
    { title: "Asset Workbench", description: "Search, view and manage all assets", href: "/finance/fixed-assets/workbench", icon: Laptop },
    { title: "Mass Additions", description: "Import and capitalise asset batches", href: "/finance/fixed-assets/mass-additions", icon: Plus },
    { title: "Mass Change", description: "Bulk reassignment and reclassification", href: "/finance/fixed-assets/mass-change", icon: RefreshCw },
    { title: "Add Asset Wizard", description: "Guided new asset creation", href: "/finance/fixed-assets/add", icon: Plus },
    { title: "Group Assets", description: "Manage component group assets", href: "/finance/fixed-assets/group-assets", icon: Layers },
    { title: "Impairment Testing", description: "Asset impairment analysis", href: "/finance/fixed-assets/impairment-testing", icon: AlertTriangle },
    { title: "Depreciation Projection", description: "Model future depreciation", href: "/finance/fixed-assets/depreciation-projection", icon: BarChart3 },
    { title: "Reclassification", description: "Reclassify or transfer assets", href: "/finance/fixed-assets/reclassification", icon: RefreshCw },
    { title: "Physical Inventory", description: "Reconcile physical vs book assets", href: "/finance/fixed-assets/physical-inventory", icon: Search },
    { title: "Capital Projects", description: "CIP to fixed asset conversion", href: "/finance/fixed-assets/capital-projects", icon: FileText },
    { title: "Tax Book Config", description: "Configure tax depreciation books", href: "/finance/fixed-assets/tax-book-config", icon: Settings },
    { title: "What-If Analysis", description: "Scenario-based depreciation modelling", href: "/finance/fixed-assets/what-if", icon: Calculator },
];

export default function FADashboard() {
    return (
        <StandardPage
            title="Fixed Assets"
            description="Asset lifecycle management — additions, depreciation, impairment, transfers and disposals"
            breadcrumbs={[{ label: "Finance", href: "/finance" }, { label: "Fixed Assets" }]}
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

            <div>
                <h3 className="text-lg font-semibold mb-4">Fixed Asset Functions</h3>
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
            </div>
        </StandardPage>
    );
}
