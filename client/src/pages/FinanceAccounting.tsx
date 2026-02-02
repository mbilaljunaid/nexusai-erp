import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Percent, Activity } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function FinanceAccounting() {
    const { data: financials = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/telecom-finance"],
        queryFn: () => fetch("/api/telecom-finance").then(r => r.json()).catch(() => []),
    });

    const totalRev = financials.reduce((sum: number, f: any) => sum + (parseFloat(f.revenue) || 0), 0);
    const totalCost = financials.reduce((sum: number, f: any) => sum + (parseFloat(f.cost) || 0), 0);
    const profit = totalRev - totalCost;
    const marginPercent = totalRev > 0 ? (profit / totalRev) * 100 : 0;

    return (
        <StandardDashboard
            header={
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-heading">Finance, Accounting & EPM</h1>
                    <p className="text-muted-foreground mt-1">GL/AR/AP, revenue recognition, cost tracking, and variance analysis</p>
                </div>
            }
        >
            <DashboardWidget title="Total Revenue" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-emerald-100/50">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-emerald-600">${(totalRev / 1000).toFixed(0)}K</div>
                        <p className="text-xs text-muted-foreground">Invoiced revenue</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Total Cost" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-red-100/50">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-red-600">${(totalCost / 1000).toFixed(0)}K</div>
                        <p className="text-xs text-muted-foreground">Operating expenses</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Profit" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-blue-100/50">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-blue-600">${(profit / 1000).toFixed(0)}K</div>
                        <p className="text-xs text-muted-foreground">Net contribution</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Margin %" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-slate-100/50">
                        <Percent className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{marginPercent.toFixed(0)}%</div>
                        <p className="text-xs text-muted-foreground">Efficiency score</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget colSpan={4} title="Financial Summary" icon={Activity}>
                <div className="space-y-3">
                    {isLoading ? (
                        Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                    ) : financials.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No financial records found</p>
                    ) : (
                        financials.slice(0, 10).map((f: any) => (
                            <div key={f.id} className="p-3 border rounded-lg text-sm hover:bg-accent/50 transition-colors flex items-center justify-between" data-testid={`fin-${f.id}`}>
                                <div className="flex-1">
                                    <p className="font-semibold">{f.entityId}</p>
                                    <p className="text-xs text-muted-foreground">Revenue: ${f.revenue} • Cost: ${f.cost} • Margin: {((parseFloat(f.profit) / parseFloat(f.revenue)) * 100).toFixed(1)}%</p>
                                </div>
                                <Badge variant={parseFloat(f.profit) > 0 ? "default" : "secondary"} className="text-xs font-mono uppercase">
                                    ${f.profit}
                                </Badge>
                            </div>
                        ))
                    )}
                </div>
            </DashboardWidget>
        </StandardDashboard>
    );
}

