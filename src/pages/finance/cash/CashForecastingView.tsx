import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    LineChart,
    Line
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { StandardPage } from '@/components/layout/StandardPage';

interface ForecastData {
    date: string;
    receipts: number;
    payments: number;
    netCashFlow: number;
    endingBalance: number;
}

interface Scenario {
    id: string;
    name: string;
    type: "best" | "expected" | "worst";
    data: ForecastData[];
}

export default function CashForecastingView() {
    const [selectedPeriod, setSelectedPeriod] = useState<"30" | "60" | "90">("30");
    const [selectedScenario, setSelectedScenario] = useState<string>("expected");

    // Fetch forecast data
    const { data: forecastData, isLoading } = useQuery<Scenario[]>({
        queryKey: ["/api/finance/cash/forecast/scenarios", selectedPeriod],
        queryFn: async () => {
            const res = await fetch(`/api/finance/cash/forecast?period=${selectedPeriod}`);
            if (!res.ok) throw new Error("Failed to fetch forecast");
            return res.json();
        }
    });

    const currentScenario = forecastData?.find(s => s.id === selectedScenario);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            notation: "compact",
            maximumFractionDigits: 1
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        });
    };

    // Calculate summary metrics
    const summary = currentScenario?.data.reduce((acc, item) => ({
        totalReceipts: acc.totalReceipts + item.receipts,
        totalPayments: acc.totalPayments + item.payments,
        netCashFlow: acc.netCashFlow + item.netCashFlow,
        endingBalance: item.endingBalance
    }), { totalReceipts: 0, totalPayments: 0, netCashFlow: 0, endingBalance: 0 });

    return (
        <StandardPage
            title="Cash Forecasting"
            description="Project cash flow and analyze scenarios"
            actions={
                <div className="flex gap-3">
                    <Select value={selectedPeriod} onValueChange={(v: any) => setSelectedPeriod(v)}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="30">30 Days</SelectItem>
                            <SelectItem value="60">60 Days</SelectItem>
                            <SelectItem value="90">90 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Summary Metrics */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Receipts</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatCurrency(summary.totalReceipts)}
                                        </p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Payments</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            {formatCurrency(summary.totalPayments)}
                                        </p>
                                    </div>
                                    <TrendingDown className="h-8 w-8 text-red-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                                        <p className={`text-2xl font-bold ${summary.netCashFlow >= 0 ? "text-green-600" : "text-red-600"
                                            }`}>
                                            {formatCurrency(summary.netCashFlow)}
                                        </p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Ending Balance</p>
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(summary.endingBalance)}
                                        </p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Scenario Tabs */}
                <Tabs value={selectedScenario} onValueChange={setSelectedScenario}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="best">Best Case</TabsTrigger>
                        <TabsTrigger value="expected">Expected</TabsTrigger>
                        <TabsTrigger value="worst">Worst Case</TabsTrigger>
                    </TabsList>

                    <TabsContent value={selectedScenario} className="space-y-4 mt-6">
                        {/* Cash Flow Waterfall Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Cash Flow Projection</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="h-80 bg-muted animate-pulse rounded" />
                                ) : (
                                    <ResponsiveContainer width="100%" height={350}>
                                        <BarChart data={currentScenario?.data || []}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
                                            <YAxis tickFormatter={formatCurrency} fontSize={12} />
                                            <Tooltip
                                                formatter={(value: number) => formatCurrency(value)}
                                                labelFormatter={formatDate}
                                            />
                                            <Legend />
                                            <Bar dataKey="receipts" fill="#10b981" name="Receipts" />
                                            <Bar dataKey="payments" fill="#ef4444" name="Payments" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>

                        {/* Balance Trend */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Projected Balance Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="h-64 bg-muted animate-pulse rounded" />
                                ) : (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={currentScenario?.data || []}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
                                            <YAxis tickFormatter={formatCurrency} fontSize={12} />
                                            <Tooltip
                                                formatter={(value: number) => formatCurrency(value)}
                                                labelFormatter={formatDate}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="endingBalance"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                name="Ending Balance"
                                                dot={{ r: 4 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </StandardPage>
    );
}
