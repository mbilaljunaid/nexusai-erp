import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Leaf, ShieldCheck, CheckCircle, Percent, Activity } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function SustainabilityComplianceCPG() {
    const { data: compliance = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/cpg-compliance"],
        queryFn: () => fetch("/api/cpg-compliance").then(r => r.json()).catch(() => []),
    });

    const certifiedCount = compliance.filter((c: any) => c.certified).length;
    const compliantCount = compliance.filter((c: any) => c.compliant).length;
    const compliancePercent = compliance.length > 0 ? (compliantCount / compliance.length) * 100 : 0;

    return (
        <StandardDashboard
            header={
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-heading">Sustainability & Compliance</h1>
                    <p className="text-muted-foreground mt-1">Ingredient certs, packaging labels, eco-scores, RSL compliance, and regulatory mapping</p>
                </div>
            }
        >
            <DashboardWidget title="Items Tracked" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-blue-100/50">
                        <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{compliance.length}</div>
                        <p className="text-xs text-muted-foreground">Portfolio items</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Certified" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-emerald-100/50">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-emerald-600">{certifiedCount}</div>
                        <p className="text-xs text-muted-foreground">ECO/Fairtrade/Bio</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Compliant" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-indigo-100/50">
                        <CheckCircle className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-indigo-600">{compliantCount}</div>
                        <p className="text-xs text-muted-foreground">Regulatory verified</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Compliance %" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-slate-100/50">
                        <Percent className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{compliancePercent.toFixed(0)}%</div>
                        <p className="text-xs text-muted-foreground">Safety score</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget colSpan={4} title="Compliance Items" icon={Leaf}>
                <div className="space-y-3">
                    {isLoading ? (
                        Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                    ) : compliance.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No compliance items found</p>
                    ) : (
                        compliance.slice(0, 10).map((c: any) => (
                            <div key={c.id} className="p-3 border rounded-lg text-sm hover:bg-accent/50 transition-colors flex items-center justify-between" data-testid={`compliance-${c.id}`}>
                                <div className="flex-1">
                                    <p className="font-semibold">{c.itemId}</p>
                                    <p className="text-xs text-muted-foreground">Eco Score: {c.ecoScore} • Status: {c.type}</p>
                                </div>
                                <Badge variant={c.compliant ? "default" : "destructive"} className="text-xs font-mono uppercase">
                                    {c.compliant ? "Compliant" : "Non-Compliant"}
                                </Badge>
                            </div>
                        ))
                    )}
                </div>
            </DashboardWidget>
        </StandardDashboard>
    );
}

