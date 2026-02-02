import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Truck, PackageCheck, DollarSign, BarChart3, ListChecks } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function SalesDistribution() {
    const { data: orders = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/cpg-sales"],
        queryFn: () => fetch("/api/cpg-sales").then(r => r.json()).catch(() => []),
    });

    const totalValue = orders.reduce((sum: number, o: any) => sum + (parseFloat(o.value) || 0), 0);
    const delivered = orders.filter((o: any) => o.status === "delivered").length;
    const fulfillmentPercent = orders.length > 0 ? (delivered / orders.length) * 100 : 0;

    return (
        <StandardDashboard
            header={
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-heading">Sales & Distribution</h1>
                    <p className="text-muted-foreground mt-1">Customer master, sales orders, fulfillment, route planning, and trade terms</p>
                </div>
            }
        >
            <DashboardWidget title="Orders" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-blue-100/50">
                        <PackageCheck className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{orders.length}</div>
                        <p className="text-xs text-muted-foreground">Total volume</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Total Value" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-emerald-100/50">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-emerald-600">${(totalValue / 1000).toFixed(0)}K</div>
                        <p className="text-xs text-muted-foreground">Order book value</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Delivered" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-indigo-100/50">
                        <Truck className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-indigo-600">{delivered}</div>
                        <p className="text-xs text-muted-foreground">Successful drops</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Fulfillment %" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-slate-100/50">
                        <BarChart3 className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{fulfillmentPercent.toFixed(0)}%</div>
                        <p className="text-xs text-muted-foreground">OTIF performance</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget colSpan={4} title="Sales Orders" icon={ListChecks}>
                <div className="space-y-3">
                    {isLoading ? (
                        Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                    ) : orders.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No active orders</p>
                    ) : (
                        orders.slice(0, 10).map((o: any) => (
                            <div key={o.id} className="p-3 border rounded-lg text-sm hover:bg-accent/50 transition-colors flex items-center justify-between" data-testid={`order-${o.id}`}>
                                <div className="flex-1">
                                    <p className="font-semibold">{o.orderId}</p>
                                    <p className="text-xs text-muted-foreground">Customer: {o.customerId} • Transit</p>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <span className="font-mono text-xs font-bold">${o.value}</span>
                                    <Badge variant={o.status === "delivered" ? "default" : "secondary"} className="text-xs font-mono uppercase">
                                        {o.status}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DashboardWidget>
        </StandardDashboard>
    );
}

