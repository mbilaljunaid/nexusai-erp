import { Link } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Leaf, BarChart3, Globe, FileText, ChevronRight,
    TrendingDown, AlertTriangle, CheckSquare
} from "lucide-react";

const kpis = [
    { label: "Scope 1 Emissions (tCO₂e)", value: "1,240", icon: Leaf, color: "text-green-500" },
    { label: "Scope 2 Emissions (tCO₂e)", value: "3,870", icon: TrendingDown, color: "text-yellow-500" },
    { label: "ESG Score", value: "72/100", icon: BarChart3, color: "text-blue-500" },
    { label: "Targets On Track", value: "4 / 6", icon: CheckSquare, color: "text-purple-500" },
];

const modules = [
    {
        title: "Sustainability Compliance",
        description: "CPG & manufacturing sustainability tracking",
        href: "/epm/esg/sustainability",
        icon: Leaf,
    },
    {
        title: "ESG Reporting",
        description: "GRI / SASB / TCFD disclosure reports",
        href: "/epm/esg/reporting",
        icon: FileText,
    },
    {
        title: "Emissions Analytics",
        description: "Scope 1, 2, 3 breakdown and trends",
        href: "/epm/esg/analytics",
        icon: BarChart3,
    },
    {
        title: "Global Targets",
        description: "Net-zero commitment tracking",
        href: "/epm/esg/targets",
        icon: Globe,
    },
    {
        title: "Risk & Incidents",
        description: "ESG risk flags and incident log",
        href: "/epm/esg/risks",
        icon: AlertTriangle,
    },
];

export default function ESGDashboard() {
    return (
        <StandardPage
            title="ESG & Sustainability"
            description="Track environmental, social, and governance performance"
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
