import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { BarChart3, CheckCircle, AlertCircle, Percent, Activity } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function GovernmentBI() {
    const { data: kpis = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/gov-bi"],
        queryFn: () => fetch("/api/gov-bi").then(r => r.json()).catch(() => []),
    });

    const onTrackCount = kpis.filter((k: any) => k.status === "on-track").length;
    const atRiskCount = kpis.filter((k: any) => k.status === "at-risk").length;
    const performancePercent = kpis.length > 0 ? (onTrackCount / kpis.length) * 100 : 0;

    return (
        <StandardDashboard
            header={
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-heading">Government BI & Dashboards</h1>
                    <p className="text-muted-foreground mt-1">Cross-departmental services, major projects, finance, and human resource performance indicators</p>
                </div>
            }
        >
            <DashboardWidget title="Metrics Tracked" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-blue-100/50">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{kpis.length}</div>
                        <p className="text-xs text-muted-foreground">Active KPIs</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="On Track" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-emerald-100/50">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-emerald-600">{onTrackCount}</div>
                        <p className="text-xs text-muted-foreground">Within targets</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="At Risk" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-amber-100/50">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-amber-600">{atRiskCount}</div>
                        <p className="text-xs text-muted-foreground">Needs attention</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Performance %" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-slate-100/50">
                        <Percent className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{performancePercent.toFixed(0)}%</div>
                        <p className="text-xs text-muted-foreground">Global health score</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget colSpan={4} title="Operational KPIs" icon={Activity}>
                <div className="space-y-3">
                    {isLoading ? (
                        Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                    ) : kpis.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No KPIs registered</p>
                    ) : (
                        kpis.slice(0, 10).map((k: any) => (
                            <div key={k.id} className="p-3 border rounded-lg text-sm hover:bg-accent/50 transition-colors flex items-center justify-between" data-testid={`kpi-${k.id}`}>
                                <div className="flex-1">
                                    <p className="font-semibold">{k.kpiId}</p>
                                    <p className="text-xs text-muted-foreground">Department: {k.departmentId} • Updated: Today</p>
                                </div>
                                <Badge variant={k.status === "on-track" ? "default" : "secondary"} className="text-xs font-mono uppercase">
                                    {k.status}
                                </Badge>
                            </div>
                        ))
                    )}
                </div>
            </DashboardWidget>
        </StandardDashboard>
    );
}

