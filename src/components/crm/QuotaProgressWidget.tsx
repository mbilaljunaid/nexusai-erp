import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Award } from "lucide-react";

interface QuotaPerformance {
    userId: string;
    periodName: string;
    quota: number;
    actual: number;
    attainment: number; // percentage 0-100+
}

export function QuotaProgressWidget({ userId, periodName = "Q1-2026" }: { userId?: string, periodName?: string }) {
    // Determine user ID (mock for now if not provided, usually from context)
    const effectiveUserId = userId || "1";

    const { data: performance, isLoading } = useQuery<QuotaPerformance>({
        queryKey: ["/api/crm/quotas/performance", effectiveUserId, periodName],
        queryFn: async () => {
            const res = await fetch(`/api/crm/quotas/performance?userId=${effectiveUserId}&periodName=${periodName}`);
            if (!res.ok) throw new Error("Failed to fetch quota");
            return res.json();
        }
    });

    if (isLoading) {
        return <Card className="h-full animate-pulse bg-muted/20" />;
    }

    const { quota, actual, attainment } = performance || { quota: 0, actual: 0, attainment: 0 };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    const getStatusColor = (percent: number) => {
        if (percent >= 100) return "bg-green-500";
        if (percent >= 75) return "bg-blue-500";
        if (percent >= 50) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <Card className="h-full border-muted/50 shadow-sm hover-elevate">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                    <span>Quota Attainment ({periodName})</span>
                    <Target className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between mb-2">
                    <span className="text-3xl font-bold">{attainment.toFixed(1)}%</span>
                    <span className="text-xs font-medium text-muted-foreground">
                        {formatCurrency(actual)} / {formatCurrency(quota)}
                    </span>
                </div>

                <Progress value={Math.min(attainment, 100)} className="h-2.5" indicatorClassName={getStatusColor(attainment)} />

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>Projection: {((actual / (new Date().getDate() / 90)) * 1).toFixed(0)} (Mock)</span>
                    </div>
                    {attainment >= 100 && (
                        <div className="flex items-center gap-1 text-green-600 font-bold">
                            <Award className="h-3 w-3" />
                            <span>Target Hit!</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
