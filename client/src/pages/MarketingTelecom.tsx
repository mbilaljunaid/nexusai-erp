import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Send, CheckCircle, DollarSign, Activity } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarketingTelecom() {
    const { data: campaigns = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/telecom-campaigns"],
        queryFn: () => fetch("/api/telecom-campaigns").then(r => r.json()).catch(() => []),
    });

    const active = campaigns.filter((c: any) => c.status === "active").length;
    const totalBudget = campaigns.reduce((sum: number, c: any) => sum + (parseFloat(c.budget) || 0), 0);
    const activePercent = campaigns.length > 0 ? (active / campaigns.length) * 100 : 0;

    return (
        <StandardDashboard
            header={
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-heading">Marketing Campaigns & Promotions</h1>
                    <p className="text-muted-foreground mt-1">Campaign setup, budget tracking, promotions, seasonal packages, and ROI analysis</p>
                </div>
            }
        >
            <DashboardWidget title="Campaigns" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-blue-100/50">
                        <Send className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{campaigns.length}</div>
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
                        <div className="text-2xl font-bold tracking-tight text-emerald-600">{active}</div>
                        <p className="text-xs text-muted-foreground">Live campaigns</p>
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

            <DashboardWidget title="Active %" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-slate-100/50">
                        <Activity className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{activePercent.toFixed(0)}%</div>
                        <p className="text-xs text-muted-foreground">Campaign activity</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget colSpan={4} title="Campaigns" icon={Megaphone}>
                <div className="space-y-3">
                    {isLoading ? (
                        Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                    ) : campaigns.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No campaigns found</p>
                    ) : (
                        campaigns.slice(0, 10).map((c: any) => (
                            <div key={c.id} className="p-3 border rounded-lg text-sm hover:bg-accent/50 transition-colors flex items-center justify-between" data-testid={`camp-${c.id}`}>
                                <div className="flex-1">
                                    <p className="font-semibold">{c.campaignId}</p>
                                    <p className="text-xs text-muted-foreground">Budget: ${c.budget}</p>
                                </div>
                                <Badge variant={c.status === "active" ? "default" : "secondary"} className="text-xs font-mono uppercase">
                                    {c.status}
                                </Badge>
                            </div>
                        ))
                    )}
                </div>
            </DashboardWidget>
        </StandardDashboard>
    );
}

