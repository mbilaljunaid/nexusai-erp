
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function RiskDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: limits = [] } = useQuery<any[]>({ queryKey: ['/api/treasury/risk-limits'] });
    const { data: fxDeals = [] } = useQuery<any[]>({ queryKey: ['/api/treasury/fx-deals'] });
    const { data: counterparties = [] } = useQuery<any[]>({ queryKey: ['/api/treasury/counterparties'] });
    const { data: riskMetrics } = useQuery<any>({ queryKey: ['/api/treasury/risk-metrics'] });

    // Compute Utilization
    const utilization = limits.map(limit => {
        const cpName = counterparties.find(c => c.id === limit.counterpartyId)?.name || 'Unknown';
        const exposure = fxDeals
            .filter(d => d.counterpartyId === limit.counterpartyId && d.status === 'CONFIRMED')
            .reduce((sum, d) => sum + Number(d.buyAmount), 0); // Simplified: Using Buy Amount as exposure

        return {
            counterpartyId: limit.counterpartyId,
            name: cpName,
            limit: Number(limit.maxAmount),
            exposure,
            percentage: Math.min(100, (exposure / Number(limit.maxAmount)) * 100)
        };
    });

    // Compute Portfolio MtM
    const totalMtM = fxDeals.reduce((sum, d) => sum + Number(d.markToMarket || 0), 0);

    const revalueMutation = useMutation({
        mutationFn: async () => {
            // Revalue all active deals
            // In a real app this would be a bulk endpoint, here we loop or call a single bulk endpoint
            // We'll just revalue the first 10 for demo purposes or iterate
            const promises = fxDeals.map(d => apiRequest("POST", `/api/treasury/fx-deals/${d.id}/revalue`));
            await Promise.all(promises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/treasury/fx-deals'] });
            toast({ title: "Valuation Complete", description: "Portfolio marked to market." });
        }
    });

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Portfolio Mark-to-Market</CardTitle>
                        {totalMtM >= 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${totalMtM >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {totalMtM >= 0 ? "+" : ""}{totalMtM.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                        </div>
                        <p className="text-xs text-muted-foreground">Unrealized P&L</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Risk Limit Usage</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {utilization.filter(u => u.percentage > 90).length} / {limits.length}
                        </div>
                        <p className="text-xs text-muted-foreground">Counterparties near breach ({'>'}90%)</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => revalueMutation.mutate()}
                            disabled={revalueMutation.isPending}
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${revalueMutation.isPending ? 'animate-spin' : ''}`} />
                            Run Revaluation
                        </Button>
                    </CardHeader>
                </Card>

                {/* Advanced Intelligence Metrics */}
                <Card className="bg-blue-600 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium opacity-80 text-blue-100">Portfolio Duration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{riskMetrics?.portfolioDuration || "0.0"} Months</div>
                        <p className="text-xs text-blue-100 opacity-70 mt-1">Weighted Avg Maturity</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Value at Risk (VaR 95%)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-400">
                            ${Number(riskMetrics?.valueAtRisk95 || 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">1-Day Potential Loss Proxy</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Hedges</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{riskMetrics?.activeHedges || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Hedged Exposures</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Counterparty Limits & Exposure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {utilization.length === 0 && <p className="text-muted-foreground text-sm">No risk limits defined.</p>}

                    {utilization.map(item => (
                        <div key={item.counterpartyId} className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-muted-foreground">
                                    {item.exposure.toLocaleString()} / {item.limit.toLocaleString()} USD ({item.percentage.toFixed(1)}%)
                                </span>
                            </div>
                            <Progress value={item.percentage} className={item.percentage > 90 ? "bg-red-100 [&>div]:bg-red-500" : ""} />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
