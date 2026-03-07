import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, BarChart3, Target, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";

interface AssuranceResult {
    period: string;
    totalRevenue: number;
    totalDeferred: number;
    anomalies: Array<{
        type: string;
        severity: "Low" | "Medium" | "High";
        description: string;
        contractId?: string;
    }>;
    summary: {
        anomalyCount: number;
        clearedCount: number;
        status: "Clean" | "Warnings" | "Critical";
    };
}

export default function RevenueAssurance() {
    const { data: result, isLoading, refetch, isFetching } = useQuery<AssuranceResult>({
        queryKey: ["/api/erp/revenue/assurance"],
        queryFn: async () => {
            const res = await fetch("/api/erp/revenue/assurance");
            if (!res.ok) throw new Error("Assurance check failed");
            return res.json();
        }
    });

    const anomalies = result?.anomalies || [];
    const statusColor = result?.summary?.status === "Clean" ? "text-emerald-600" :
        result?.summary?.status === "Warnings" ? "text-amber-600" : "text-red-600";

    return (
        <StandardDashboard
            header={
                <div className="flex justify-between items-center w-full">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-heading">Revenue Assurance</h1>
                        <p className="text-muted-foreground mt-1">ASC 606 anomaly detection &amp; revenue integrity checks</p>
                    </div>
                    <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                        <RefreshCw className={cn(`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`)} />
                        Run Check
                    </Button>
                </div>
            }
        >
            <DashboardWidget title="Assurance Status" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-/15">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                        <div className={cn(`text-2xl font-bold tracking-tight ${statusColor}`)}>
                            {isLoading ? "—" : (result?.summary?.status || "Pending")}
                        </div>
                        <p className="text-xs text-muted-foreground">Overall health</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Anomalies Found" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-/15">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-red-600">{result?.summary?.anomalyCount ?? "—"}</div>
                        <p className="text-xs text-muted-foreground">Require attention</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Total Revenue" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-/15">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-blue-600">
                            {result?.totalRevenue != null ? formatCurrency(result.totalRevenue) : "—"}
                        </div>
                        <p className="text-xs text-muted-foreground">Period recognized</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Deferred Balance" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-/15">
                        <BarChart3 className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-amber-600">
                            {result?.totalDeferred != null ? formatCurrency(result.totalDeferred) : "—"}
                        </div>
                        <p className="text-xs text-muted-foreground">Deferred revenue</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget colSpan={4} title="Anomaly Detail">
                <div className="space-y-3">
                    {isLoading ? (
                        Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                    ) : anomalies.length === 0 ? (
                        <div className="flex flex-col items-center py-8 gap-2 text-emerald-600">
                            <CheckCircle2 className="h-10 w-10 opacity-60" />
                            <p className="font-medium">No anomalies detected — revenue integrity confirmed</p>
                        </div>
                    ) : (
                        anomalies.map((anomaly, i) => (
                            <div key={i} className="p-3 border rounded-lg text-sm hover:bg-accent/50 transition-colors flex items-center justify-between" data-testid={`anomaly-${i}`}>
                                <div className="flex-1">
                                    <p className="font-semibold">{anomaly.type}</p>
                                    <p className="text-xs text-muted-foreground">{anomaly.description}</p>
                                    {anomaly.contractId && (
                                        <p className="text-xs text-blue-600 font-mono">Contract: {anomaly.contractId}</p>
                                    )}
                                </div>
                                <Badge variant={anomaly.severity === "High" ? "destructive" : anomaly.severity === "Medium" ? "default" : "secondary"} className="text-xs">
                                    {anomaly.severity}
                                </Badge>
                            </div>
                        ))
                    )}
                </div>
            </DashboardWidget>
        </StandardDashboard>
    );
}
