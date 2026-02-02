import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { DollarSign, LineChart, TrendingUp, Layers, Activity } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function CostingProfitability() {
    const { data: costing = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/fashion-costing"],
        queryFn: () => fetch("/api/fashion-costing").then(r => r.json()).catch(() => []),
    });

    const avgMargin = costing.length > 0
        ? (costing.reduce((sum: number, c: any) => sum + (parseFloat(c.margin) || 0), 0) / costing.length).toFixed(1)
        : 0;
    const totalRevenue = costing.reduce((sum: number, c: any) => sum + (parseFloat(c.msrp) || 0), 0);
    const uniqueCollections = new Set(costing.map((c: any) => c.collection)).size;

    return (
        <StandardDashboard
            header={
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-heading">Costing, Margin & Product Profitability</h1>
                    <p className="text-muted-foreground mt-1">Full cost build, landed cost, duty, SKU-level P&L, and break-even analysis</p>
                </div>
            }
        >
            <DashboardWidget title="SKUs Costed" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-blue-100/50">
                        <Layers className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{costing.length}</div>
                        <p className="text-xs text-muted-foreground">Master SKU list</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Avg Margin %" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-emerald-100/50">
                        <LineChart className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-emerald-600">{avgMargin}%</div>
                        <p className="text-xs text-muted-foreground">Blended contribution</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Total Revenue" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-indigo-100/50">
                        <DollarSign className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-indigo-600">${(totalRevenue / 1000).toFixed(0)}K</div>
                        <p className="text-xs text-muted-foreground">MSRP value</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Collections" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-slate-100/50">
                        <TrendingUp className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{uniqueCollections}</div>
                        <p className="text-xs text-muted-foreground">Product groups</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget colSpan={4} title="P&L by Style" icon={Activity}>
                <div className="space-y-3">
                    {isLoading ? (
                        Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                    ) : costing.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No costing data available</p>
                    ) : (
                        costing.slice(0, 10).map((c: any) => (
                            <div key={c.id} className="p-3 border rounded-lg text-sm hover:bg-accent/50 transition-colors flex items-center justify-between" data-testid={`costing-${c.id}`}>
                                <div className="flex-1">
                                    <p className="font-semibold">{c.sku}</p>
                                    <p className="text-xs text-muted-foreground">Collection: {c.collection} • Cost: ${c.cost} • MSRP: ${c.msrp}</p>
                                </div>
                                <Badge variant={c.margin > 50 ? "default" : "secondary"} className="text-xs font-mono uppercase">
                                    {c.margin}% Margin
                                </Badge>
                            </div>
                        ))
                    )}
                </div>
            </DashboardWidget>
        </StandardDashboard>
    );
}

