import { useQuery } from "@tanstack/react-query";
import { StandardDashboard } from "@/components/ui/StandardDashboard";
import { DashboardWidget } from "@/components/ui/DashboardWidget";
import { Activity, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

export default function RetailDashboard() {
    const { data: dashboard = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/retail-dashboard"],
        queryFn: () => fetch("/api/retail-dashboard").then(r => r.json()).catch(() => []),
    });

    const healthy = dashboard.filter((k: any) => k.status === "healthy").length;
    const atRisk = dashboard.filter((k: any) => k.status === "at-risk").length;
    const totalKpis = dashboard.length;
    const healthPercentage = totalKpis > 0 ? ((healthy / totalKpis) * 100).toFixed(0) : "0";

    return (
        <StandardDashboard
            header={{
                title: "Retail Operations Dashboard",
                description: "Executive summary, sales KPIs, inventory, fulfillment, compliance status, alerts & trends"
            }}
        >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <DashboardWidget
                    title="Total KPIs"
                    value={totalKpis}
                    icon={Activity}
                    loading={isLoading}
                    type="metric"
                    description="Monitored metrics"
                />
                <DashboardWidget
                    title="Healthy Metrics"
                    value={healthy}
                    icon={CheckCircle}
                    loading={isLoading}
                    type="metric"
                    trend={{ value: 10, label: "vs last month", direction: "up" }}
                    className="text-green-600"
                />
                <DashboardWidget
                    title="At Risk"
                    value={atRisk}
                    icon={AlertTriangle}
                    loading={isLoading}
                    type="metric"
                    description="Requires attention"
                    className="text-orange-600"
                />
                <DashboardWidget
                    title="Health Score"
                    value={`${healthPercentage}%`}
                    icon={TrendingUp}
                    loading={isLoading}
                    type="metric"
                    description="Overall status"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                <DashboardWidget
                    title="Key Metrics Details"
                    type="chart"
                    className="col-span-1"
                >
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {isLoading ? (
                            <p className="text-muted-foreground text-sm">Loading metrics...</p>
                        ) : dashboard.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">No data available</p>
                        ) : (
                            dashboard.map((k: any) => (
                                <div key={k.id} className="p-3 border rounded-lg text-sm hover:bg-muted/50 transition-colors flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="font-semibold">{k.kpiName}</p>
                                        <p className="text-xs text-muted-foreground">Target: {k.target}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono font-semibold">{k.actual}</p>
                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${k.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {k.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </DashboardWidget>
            </div>
        </StandardDashboard>
    );
}
