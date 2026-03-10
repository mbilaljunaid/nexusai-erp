import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, Zap, Droplets, TrendingDown, TrendingUp } from "lucide-react";

const kpis = [
    { label: "Scope 1 Emissions", value: "4,820 tCO₂e", icon: Cloud, delta: "-8%", trend: "down" },
    { label: "Scope 2 Emissions", value: "11,340 tCO₂e", icon: Zap, delta: "-14%", trend: "down" },
    { label: "Scope 3 Emissions", value: "38,200 tCO₂e", icon: Cloud, delta: "+3%", trend: "up" },
    { label: "Water Intensity", value: "2.4 m³/unit", icon: Droplets, delta: "-6%", trend: "down" },
];

const monthly = [
    { month: "Oct", scope1: 420, scope2: 980 },
    { month: "Nov", scope1: 395, scope2: 940 },
    { month: "Dec", scope1: 380, scope2: 920 },
    { month: "Jan", scope1: 402, scope2: 955 },
    { month: "Feb", scope1: 388, scope2: 910 },
    { month: "Mar", scope1: 370, scope2: 890 },
];

export default function EmissionsAnalytics() {
    return (
        <StandardPage
            title="Emissions Analytics"
            description="Scope 1, 2 and 3 GHG emissions tracking and trend analysis"
        >
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
                {kpis.map((kpi) => (
                    <Card key={kpi.label}>
                        <CardContent className="p-4">
                            <kpi.icon className="h-6 w-6 text-muted-foreground mb-2" />
                            <p className="text-xl font-bold">{kpi.value}</p>
                            <p className="text-xs text-muted-foreground">{kpi.label}</p>
                            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${kpi.trend === "down" ? "text-green-500" : "text-red-500"}`}>
                                {kpi.trend === "down" ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                                {kpi.delta} YoY
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Monthly Emissions Trend (tCO₂e)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {monthly.map((m) => (
                            <div key={m.month} className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground w-8">{m.month}</span>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs w-12 text-muted-foreground">Scope 1</span>
                                        <div className="flex-1 bg-muted rounded h-2">
                                            <div className="bg-blue-500 h-2 rounded" style={{ width: `${(m.scope1 / 500) * 100}%` }} />
                                        </div>
                                        <span className="text-xs font-mono w-10 text-right">{m.scope1}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs w-12 text-muted-foreground">Scope 2</span>
                                        <div className="flex-1 bg-muted rounded h-2">
                                            <div className="bg-purple-500 h-2 rounded" style={{ width: `${(m.scope2 / 1100) * 100}%` }} />
                                        </div>
                                        <span className="text-xs font-mono w-10 text-right">{m.scope2}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
