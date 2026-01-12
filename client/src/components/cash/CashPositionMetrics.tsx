
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, ArrowUpRight, ArrowDownRight, RefreshCcw, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CashPosition {
    totalBalance: number;
    totalUnreconciledAmount: number;
    totalUnreconciledCount: number;
    accounts: Array<{
        name: string;
        balance: number;
        unreconciledAmount: number;
        unreconciledCount: number;
        currency: string;
    }>;
}

export function CashPositionMetrics() {
    const { data: position, isLoading } = useQuery<CashPosition>({
        queryKey: ["/api/cash/position"],
    });

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-[100px]" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[120px] mb-2" />
                            <Skeleton className="h-4 w-[80px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const metrics = [
        {
            title: "Total Cash Balance",
            value: position?.totalBalance || 0,
            icon: <Wallet className="h-4 w-4 text-muted-foreground" />,
            description: "Aggregate across all active accounts",
            trend: "+2.5%",
            trendUp: true
        },
        {
            title: "Unreconciled Amount",
            value: position?.totalUnreconciledAmount || 0,
            icon: <AlertCircle className="h-4 w-4 text-destructive" />,
            description: `${position?.totalUnreconciledCount || 0} items pending reconciliation`,
            trend: "Action Required",
            trendUp: false
        },
        {
            title: "Forecasted Liquidity (30d)",
            value: (position?.totalBalance || 0) * 1.15, // Mocked for now, will link to forecast service
            icon: <ArrowUpRight className="h-4 w-4 text-emerald-500" />,
            description: "Includes pending AP/AR flows",
            trend: "+15%",
            trendUp: true
        },
        {
            title: "Working Capital Buffer",
            value: (position?.totalBalance || 0) * 0.4,
            icon: <RefreshCcw className="h-4 w-4 text-blue-500" />,
            description: "Current liquidity coverage ratio",
            trend: "Stable",
            trendUp: true
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((m, i) => (
                <Card key={i} className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{m.title}</CardTitle>
                        {m.icon}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(m.value)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {m.description}
                        </p>
                        <div className={`text-xs mt-2 flex items-center ${m.trendUp ? 'text-emerald-500' : 'text-destructive font-medium'}`}>
                            {m.trendUp ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                            {m.trend}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
