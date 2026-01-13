import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Tag, CheckCircle, DollarSign, Users, Activity } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function TradePromotions() {
    const { data: promos = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/cpg-promotions"],
        queryFn: () => fetch("/api/cpg-promotions").then(r => r.json()).catch(() => []),
    });

    const activeCount = promos.filter((p: any) => p.status === "active").length;
    const totalBudget = promos.reduce((sum: number, p: any) => sum + (parseFloat(p.budget) || 0), 0);
    const uniqueCustomers = new Set(promos.map((p: any) => p.customerId)).size;

    return (
        <StandardDashboard
            header={
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-heading">Trade Promotions & Marketing</h1>
                    <p className="text-muted-foreground mt-1">Campaign builder, discount types, budget allocation, and trade spend management</p>
                </div>
            }
        >
            <DashboardWidget title="Campaigns" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-blue-100/50">
                        <Tag className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{promos.length}</div>
                        <p className="text-xs text-muted-foreground">Total records</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Active" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-emerald-100/50">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-emerald-600">{activeCount}</div>
                        <p className="text-xs text-muted-foreground">Running now</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Total Budget" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-indigo-100/50">
                        <DollarSign className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-indigo-600">${(totalBudget / 1000).toFixed(0)}K</div>
                        <p className="text-xs text-muted-foreground">Allocated spend</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Customers" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-orange-100/50">
                        <Users className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{uniqueCustomers}</div>
                        <p className="text-xs text-muted-foreground">Targeted accounts</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget colSpan={4} title="Recent Promotions" icon={Activity}>
                <div className="space-y-3">
                    {isLoading ? (
                        Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                    ) : promos.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No promotions found</p>
                    ) : (
                        promos.slice(0, 10).map((p: any) => (
                            <div key={p.id} className="p-3 border rounded-lg text-sm hover:bg-accent/50 transition-colors flex items-center justify-between" data-testid={`promo-${p.id}`}>
                                <div className="flex-1">
                                    <p className="font-semibold">{p.promoId}</p>
                                    <p className="text-xs text-muted-foreground">{p.discount}% off • Budget: ${p.budget}</p>
                                </div>
                                <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-xs font-mono uppercase">
                                    {p.status}
                                </Badge>
                            </div>
                        ))
                    )}
                </div>
            </DashboardWidget>
        </StandardDashboard>
    );
}

