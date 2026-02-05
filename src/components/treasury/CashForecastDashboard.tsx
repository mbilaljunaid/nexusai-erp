
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, TrendingUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts";
import { format } from "date-fns";

export function CashForecastDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: forecast = [], isLoading: isLoadingForecast } = useQuery<any[]>({
        queryKey: ['/api/treasury/forecast']
    });

    const { data: anomalies = [], isLoading: isLoadingAnomalies } = useQuery<any[]>({
        queryKey: ['/api/treasury/anomalies']
    });

    const generateMutation = useMutation({
        mutationFn: async () => {
            await apiRequest("POST", "/api/treasury/forecast/generate", {});
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/treasury/forecast'] });
            toast({ title: "Forecast Generated", description: "Cash flow projections updated." });
        }
    });

    // Prepare Chart Data
    // Group by Date + Source Type
    const chartData = forecast.reduce((acc: any[], item: any) => {
        const dateStr = format(new Date(item.forecastDate), 'yyyy-MM-dd');
        let day = acc.find(d => d.date === dateStr);
        if (!day) {
            day = { date: dateStr, dateDisplay: format(new Date(item.forecastDate), 'MMM dd'), net: 0 };
            acc.push(day);
        }

        const amt = Number(item.amount);
        day.net += amt;

        // Breakdown by source
        if (!day[item.source]) day[item.source] = 0;
        day[item.source] += amt;

        return acc;
    }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Liquidity Projection (90 Days)</h3>
                    <p className="text-sm text-muted-foreground">Aggregated from AP, AR, Debt Service, and FX Settlements.</p>
                </div>
                <Button
                    onClick={() => generateMutation.mutate()}
                    disabled={generateMutation.isPending}
                    className="shadow-md"
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
                    Refresh Forecast
                </Button>
            </div>

            {chartData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 shadow-lg border-primary/5">
                        <CardHeader>
                            <CardTitle>Daily Net Cash Flow</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis dataKey="dateDisplay" fontSize={10} />
                                    <YAxis fontSize={10} />
                                    <Tooltip
                                        formatter={(value: number) => `$${value.toLocaleString()}`}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend />
                                    <Bar nam="AP Outflows" dataKey="AP_INVOICE" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
                                    <Bar name="Debt Service" dataKey="DEBT_PAYMENT" stackId="a" fill="#f97316" />
                                    <Bar name="FX Settlements" dataKey="FX_SETTLEMENT" stackId="a" fill="#8b5cf6" />
                                    <Bar name="AR Inflows" dataKey="AR_INVOICE" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-orange-500" />
                                    AI Anomaly Detection
                                </CardTitle>
                                <CardDescription>
                                    Recent payments deviation {'>'} 3σ
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {anomalies.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground bg-muted/20 rounded-lg">
                                        No recent anomalies detected.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {anomalies.map((a: any) => (
                                            <div key={a.id} className="p-3 bg-destructive/5 border border-destructive/10 rounded-lg text-sm">
                                                <div className="flex justify-between font-medium">
                                                    <span>Payment #{a.id.slice(0, 6)}</span>
                                                    <span className="text-destructive">${Number(a.amount).toLocaleString()}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">{a.reason}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="shadow-md bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
                            <CardHeader>
                                <CardTitle className="text-sm">Quick Insights</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Next 30d Net:</span>
                                    <span className="font-bold font-mono">
                                        ${chartData.slice(0, 30).reduce((sum, d) => sum + d.net, 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Largest Outflow Day:</span>
                                    <span className="font-medium">
                                        {chartData.reduce((max, d) => d.net < max.net ? d : max, chartData[0] || { dateDisplay: '-', net: 0 }).dateDisplay}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="p-12 text-center bg-muted/10 rounded-xl border border-dashed">
                    <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium">No Forecast Data</h3>
                    <p className="text-muted-foreground mb-4">Run the forecast generator to analyze future liquidity.</p>
                    <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
                        Generate Now
                    </Button>
                </div>
            )}
        </div>
    );
}
