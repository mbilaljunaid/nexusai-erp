import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, Filter, RefreshCcw, Activity, ArrowRightLeft, Building2, Landmark, Settings2, Plus, ArrowUpRight, ArrowDownRight, ShieldCheck, AlertTriangle, PlayCircle, Settings, TrendingDown, History } from "lucide-react";
import { formatDate } from "@/lib/dateUtils";
import { StandardPage } from '@/components/layout/StandardPage';

interface ZBAPool {
    id: string;
    name: string;
    masterAccountId: string;
    masterAccountName: string;
    subsidiaryAccounts: string[];
    targetBalance: number;
    currency: string;
    status: "active" | "inactive";
}

interface SweepHistory {
    id: string;
    poolId: string;
    executionDate: string;
    totalSwept: number;
    accountsProcessed: number;
    status: "completed" | "failed";
}

export default function ZBAManagement() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch ZBA pools
    const { data: pools = [], isLoading: poolsLoading } = useQuery<ZBAPool[]>({
        queryKey: ["/api/finance/cash/zba/pools"],
        queryFn: async () => {
            const res = await fetch("/api/finance/cash/zba/pools");
            if (!res.ok) throw new Error("Failed to fetch ZBA pools");
            return res.json();
        }
    });

    // Fetch sweep history
    const { data: history = [] } = useQuery<SweepHistory[]>({
        queryKey: ["/api/finance/cash/zba/history"],
        queryFn: async () => {
            const res = await fetch("/api/finance/cash/zba/history");
            if (!res.ok) throw new Error("Failed to fetch sweep history");
            return res.json();
        }
    });

    // Execute sweeps mutation
    const executeSweepsMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/finance/cash/zba/execute-sweeps", {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });

            if (!res.ok) throw new Error("Sweep execution failed");
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "ZBA Sweeps Complete",
                description: `Processed ${data.poolsProcessed} pools, swept ${formatCurrency(data.totalSwept)}`
            });
            queryClient.invalidateQueries({ queryKey: ["/api/finance/cash/zba"] });
        },
        onError: (error: Error) => {
            toast({
                title: "Sweep Execution Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    const formatCurrency = (amount: number, currency: string = "USD") => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency
        }).format(amount);
    };

    const formatShortDate = (dateString: string) => {
        return formatDate(new Date(dateString), "MMM d, yyyy h:mm a");
    };

    return (
        <StandardPage
            title="Zero-Based Accounting (ZBA)"
            description="Manage ZBA pools and execute automated cash sweeps"
            actions={
                <Button
                    onClick={() => executeSweepsMutation.mutate()}
                    disabled={executeSweepsMutation.isPending || pools.length === 0}
                    size="lg"
                >
                    <PlayCircle className="mr-2 h-5 w-5" />
                    {executeSweepsMutation.isPending ? "Executing..." : "Execute All Sweeps"}
                </Button>
            }
        >
            <div className="space-y-6">

                {/* Info Card */}
                <Card className="border-purple-500 bg-purple-500/10 dark:bg-purple-950/20">
                    <CardContent className="pt-6">
                        <p className="text-sm text-purple-900 dark:text-purple-100">
                            <strong>Zero-Based Accounting (ZBA)</strong> automatically transfers funds between subsidiary
                            accounts and a master account to maintain target balances. This optimizes cash utilization
                            and reduces idle balances.
                        </p>
                    </CardContent>
                </Card>

                {/* ZBA Pools */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>ZBA Pools</CardTitle>
                            <Button variant="outline" size="sm">
                                <Settings className="mr-2 h-4 w-4" />
                                Configure Pool
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {poolsLoading ? (
                            <div className="space-y-3">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-32 bg-muted animate-pulse rounded" />
                                ))}
                            </div>
                        ) : pools.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <TrendingDown className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No ZBA pools configured</p>
                                <p className="text-sm mt-1">Configure a pool to start automated cash sweeps</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pools.map((pool) => (
                                    <div
                                        key={pool.id}
                                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-lg">{pool.name}</h3>
                                                    <Badge variant={pool.status === "active" ? "default" : "secondary"}>
                                                        {pool.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Master Account: {pool.masterAccountName}
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                <PlayCircle className="mr-2 h-4 w-4" />
                                                Execute Sweep
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Target Balance</p>
                                                <p className="font-semibold text-lg">
                                                    {formatCurrency(pool.targetBalance, pool.currency)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Subsidiary Accounts</p>
                                                <p className="font-semibold text-lg">{pool.subsidiaryAccounts.length}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Currency</p>
                                                <p className="font-semibold text-lg">{pool.currency}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sweep History */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            <CardTitle>Sweep History</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {history.length === 0 ? (
                            <p className="text-center py-8 text-muted-foreground">
                                No sweep history available
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {history.slice(0, 10).map((sweep) => (
                                    <div
                                        key={sweep.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{formatDate(sweep.executionDate)}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {sweep.accountsProcessed} accounts processed
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-lg text-blue-600">
                                                {formatCurrency(sweep.totalSwept)}
                                            </p>
                                            <Badge variant={sweep.status === "completed" ? "default" : "destructive"}>
                                                {sweep.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
