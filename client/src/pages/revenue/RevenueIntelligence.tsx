import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, TrendingUp, AlertCircle, LineChart, ShieldAlert } from "lucide-react";
import { CartesianGrid, Line, LineChart as RechartsLine, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function RevenueIntelligence() {
    const { data: forecast, isLoading: isLoadingForecast } = useQuery({
        queryKey: ["revenue-forecast"],
        queryFn: () => fetch("/api/revenue/forecasting/projection?months=6").then((res) => res.json()),
    });

    const { data: risks, isLoading: isLoadingRisks } = useQuery({
        queryKey: ["revenue-risks"],
        queryFn: () => fetch("/api/revenue/intelligence/risk-analysis").then((res) => res.json()),
    });

    // Merge history and forecast for chart
    const chartData = React.useMemo(() => {
        if (!forecast) return [];

        // Transform History
        const historyData = (forecast.history || []).map((h: any) => ({
            period: h.period,
            actual: h.y,
            forecast: null
        }));

        // Transform Forecast
        const forecastData = (forecast.forecast || []).map((f: any) => ({
            period: f.period,
            actual: null,
            forecast: f.amount
        }));

        return [...historyData, ...forecastData];
    }, [forecast]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Revenue AI Agent</h1>
                    <p className="text-muted-foreground">Automated forecasting and risk detection engine.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Model: Linear Regression (v1.0)
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Forecast Chart */}
                <Card className="col-span-1 border-muted/50 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <LineChart className="h-5 w-5 text-primary" />
                            <CardTitle>Revenue Forecast (6 Months)</CardTitle>
                        </div>
                        <CardDescription>
                            Predictive analysis based on historical recognition patterns.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {isLoadingForecast ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                    <p className="text-sm text-muted-foreground">Training model...</p>
                                </div>
                            </div>
                        ) : chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsLine data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                    <XAxis dataKey="period" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                        formatter={(val: number) => [`$${val.toFixed(2)}`, "Revenue"]}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="actual"
                                        stroke="#2563eb"
                                        name="Actual Revenue"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="forecast"
                                        stroke="#9333ea"
                                        name="AI Prediction"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={{ r: 4 }}
                                    />
                                </RechartsLine>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                No historical data available to generate forecast.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Risk Radar */}
                <Card className="col-span-1 border-destructive/20 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-destructive" />
                            <CardTitle>Contract Risk Radar</CardTitle>
                        </div>
                        <CardDescription>
                            AI-identified contracts requiring immediate attention.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingRisks ? (
                            <div className="space-y-2">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : risks && risks.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Contract ID</TableHead>
                                        <TableHead>Risk Score</TableHead>
                                        <TableHead>Primary Issue</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {risks.map((risk: any) => (
                                        <TableRow key={risk.contractId} className="group cursor-pointer hover:bg-muted/50">
                                            <TableCell className="font-mono text-xs text-muted-foreground group-hover:text-foreground">
                                                {risk.contractId.substring(0, 8)}...
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={risk.riskScore > 50 ? "destructive" : "secondary"}>
                                                    {risk.riskScore}/100
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {risk.risks[0]?.description}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2 min-h-[200px]">
                                <ShieldAlert className="w-12 h-12 opacity-20" />
                                <p>No high-risk contracts detected.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
