import { useQuery } from "@tanstack/react-query";
import { StandardDashboard } from "@/components/ui/StandardDashboard";
import { DashboardWidget } from "@/components/ui/DashboardWidget";
import { Activity, Heart, AlertOctagon, CheckCircle2 } from "lucide-react";

export default function HealthcareDashboard() {
    const { data: dashboard = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/hc-dashboard"],
        queryFn: () => fetch("/api/hc-dashboard").then(r => r.json()).catch(() => []),
    });

    const totalKpis = dashboard.length;
    const onTrack = dashboard.filter((k: any) => k.status === "on-track").length;
    const atRisk = dashboard.filter((k: any) => k.status === "at-risk").length;
    const healthPercentage = totalKpis > 0 ? ((onTrack / totalKpis) * 100).toFixed(0) : "0";

    return (
        <StandardDashboard
            header={{
                title: "Healthcare Operations Dashboard",
                description: "Executive summary, KPIs, operational metrics, compliance status, financial health, alerts & trends"
            }}
        >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <DashboardWidget
                    title="Total Metrics"
                    value={totalKpis}
                    icon={Activity}
                    loading={isLoading}
                    type="metric"
                    description="Tracked KPIs"
                />
                <DashboardWidget
                    title="On Track"
                    value={onTrack}
                    icon={CheckCircle2}
                    loading={isLoading}
                    type="metric"
                    className="text-green-600"
                    description="Meeting targets"
                />
                <DashboardWidget
                    title="At Risk"
                    value={atRisk}
                    icon={AlertOctagon}
                    loading={isLoading}
                    type="metric"
                    className="text-orange-600"
                    description="Needs attention"
                />
                <DashboardWidget
                    title="Operational Health"
                    value={`${healthPercentage}%`}
                    icon={Heart}
                    loading={isLoading}
                    type="metric"
                    description="Overall score"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                <DashboardWidget
                    title="Performance Metrics"
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
                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${k.status === 'on-track' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
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
