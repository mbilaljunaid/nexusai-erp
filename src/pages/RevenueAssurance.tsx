import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, BarChart3, Target, Activity } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function RevenueAssurance() {
    const { data: revenue = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/telecom-revenue"],
        queryFn: () => fetch("/api/telecom-revenue").then(r => r.json()).catch(() => []),
    });

    const totalRev = revenue.reduce((sum: number, r: any) => sum + (parseFloat(r.amount) || 0), 0);
    const projected = revenue.reduce((sum: number, r: any) => sum + (parseFloat(r.projected) || 0), 0);
    const accuracy = projected > 0 ? (totalRev / projected) * 100 : 0;

    return (
        <StandardDashboard
            header={
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-heading">Revenue Assurance & Forecasting</h1>
                    <p className="text-muted-foreground mt-1">Revenue tracking, forecasting, promotion ROI, marketing spend, and billing accuracy analysis</p>
                </div>
            }
        >
            <DashboardWidget title="Total Revenue" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-emerald-100/50">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-emerald-600">${(totalRev / 1000).toFixed(0)}K</div>
                        <p className="text-xs text-muted-foreground">Actual collected revenue</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Projected" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-blue-100/50">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-blue-600">${(projected / 1000).toFixed(0)}K</div>
                        <p className="text-xs text-muted-foreground">Forecasted target</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Variance" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-amber-100/50">
                        <TrendingUp className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-amber-600">${((projected - totalRev) / 1000).toFixed(0)}K</div>
                        <p className="text-xs text-muted-foreground">Target gap</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Accuracy %" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-slate-100/50">
                        <Target className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{accuracy.toFixed(0)}%</div>
                        <p className="text-xs text-muted-foreground">Forecast precision</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget colSpan={4} title="Revenue Tracking">
                <div className="space-y-3">
                    {isLoading ? (
                        Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                    ) : revenue.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No data available</p>
                    ) : (
                        revenue.slice(0, 10).map((r: any) => (
                            <div key={r.id} className="p-3 border rounded-lg text-sm hover:bg-accent/50 transition-colors flex items-center justify-between" data-testid={`rev-${r.id}`}>
                                <div className="flex-1">
                                    <p className="font-semibold">{r.sourceId}</p>
                                    <p className="text-xs text-muted-foreground">Projected: ${r.projected}</p>
                                </div>
                                <Badge variant="default" className="text-xs font-mono">
                                    ${r.amount}
                                </Badge>
                            </div>
                        ))
                    )}
                </div>
            </DashboardWidget>
        </StandardDashboard>
    );
}

