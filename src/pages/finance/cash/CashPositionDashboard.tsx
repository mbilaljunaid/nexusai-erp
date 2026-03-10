import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency, formatPercent } from "@/lib/formatters";

export default function CashPositionDashboard() {
    const [forecastDays, setForecastDays] = useState("30");
    const [scenario, setScenario] = useState("BASELINE");

    // Fetch cash position
    const { data: position } = useQuery<any>({
        queryKey: ["/api/finance/cash/position"],
        queryFn: () => fetch("/api/finance/cash/position").then(r => r.json())
    });

    // Fetch cash forecast
    const { data: forecast } = useQuery<any>({
        queryKey: ["/api/finance/cash/forecast", forecastDays, scenario],
        queryFn: () => fetch(`/api/finance/cash/forecast?days=${forecastDays}&scenario=${scenario}`).then(r => r.json())
    });

    const totalCash = position?.byCurrency?.reduce((sum: number, curr: any) =>
        sum + (curr.amount || 0), 0
    ) || 0;

    const changePercent = position?.changePercent || 0;

    return (
        <StandardPage
            title="Cash Position & Forecasting"
            description="Real-time cash position and multi-scenario forecasting"
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Cash Management", href: "/finance/cash" },
                { label: "Cash Position" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Cash Position</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totalCash)}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                {changePercent >= 0 ? (
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                ) : (
                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                )}
                                <span className={changePercent >= 0 ? "text-green-500" : "text-red-500"}>
                                    {formatPercent(Math.abs(changePercent) / 100)}
                                </span>
                                <span>vs last period</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Expected Receipts (30d)</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(forecast?.expectedReceipts || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                From AR and other sources
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Expected Payments (30d)</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {formatCurrency(forecast?.expectedPayments || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                AP and other obligations
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Cash by Currency */}
                <Card>
                    <CardHeader>
                        <CardTitle>Cash Position by Currency</CardTitle>
                        <CardDescription>Real-time balances across all currencies</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {position?.byCurrency?.map((curr: any) => (
                                <div key={curr.currency} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline">{curr.currency}</Badge>
                                        <span className="font-medium">{curr.currencyName || curr.currency}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">{formatCurrency(curr.amount || 0)}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {curr.accountCount} account(s)
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!position?.byCurrency || position.byCurrency.length === 0) && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No cash positions to display
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Cash Flow Forecast */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Cash Flow Forecast</CardTitle>
                                <CardDescription>Projected cash position over time</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Select value={forecastDays} onValueChange={setForecastDays}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">7 Days</SelectItem>
                                        <SelectItem value="30">30 Days</SelectItem>
                                        <SelectItem value="90">90 Days</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={scenario} onValueChange={setScenario}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BASELINE">Baseline</SelectItem>
                                        <SelectItem value="OPTIMISTIC">Optimistic</SelectItem>
                                        <SelectItem value="PESSIMISTIC">Pessimistic</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={forecast?.projections || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => formatDate(date)}
                                />
                                <YAxis tickFormatter={(value: number) => formatCurrency(value)} />
                                <Tooltip
                                    labelFormatter={(date) => formatDate(date)}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="cashBalance"
                                    stroke="#2563eb"
                                    strokeWidth={2}
                                    name="Projected Cash"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="receipts"
                                    stroke="#16a34a"
                                    strokeWidth={2}
                                    name="Receipts"
                                    strokeDasharray="5 5"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="payments"
                                    stroke="#dc2626"
                                    strokeWidth={2}
                                    name="Payments"
                                    strokeDasharray="5 5"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Treasury KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Days Sales Outstanding (DSO)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{position?.dso || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">days</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Days Payable Outstanding (DPO)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{position?.dpo || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">days</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Cash Conversion Cycle</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{position?.ccc || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">days</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
