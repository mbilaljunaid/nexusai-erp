
import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Area
} from "recharts";

interface ForecastDetail {
    source: "AR" | "AP" | "MANUAL";
    reference: string;
    amount: number;
    date: string;
    entityName?: string;
}

interface DailyForecast {
    date: string;
    openingBalance: number;
    inflow: number;
    outflow: number;
    netChange: number;
    closingBalance: number;
    details: ForecastDetail[];
}

export function CashForecastWidget() {
    const { data: forecast = [], isLoading } = useQuery<DailyForecast[]>({
        queryKey: ["/api/cash/forecast", { days: 5 }],
    });

    if (isLoading) {
        return <Skeleton className="w-full h-[400px] rounded-xl" />;
    }

    // Prepare chart data
    const chartData = forecast.map(day => ({
        date: new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
        Balance: day.closingBalance,
        Inflow: day.inflow,
        Outflow: day.outflow,
    }));

    return (
        <Card className="col-span-2">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>5-Day Liquidity Forecast</CardTitle>
                        <CardDescription>Projected cash position based on AP/AR schedules.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#6B7280", fontSize: 12 }}
                            />
                            <YAxis
                                yAxisId="left"
                                orientation="left"
                                stroke="#6B7280"
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#9CA3AF"
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                            />
                            <Legend />

                            {/* Inflow Bar */}
                            <Bar yAxisId="right" dataKey="Inflow" fill="#22C55E" barSize={20} radius={[4, 4, 0, 0]} name="Inflow (AR)" />
                            {/* Outflow Bar */}
                            <Bar yAxisId="right" dataKey="Outflow" fill="#EF4444" barSize={20} radius={[4, 4, 0, 0]} name="Outflow (AP)" />

                            {/* Balance Line */}
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="Balance"
                                stroke="#3B82F6"
                                strokeWidth={3}
                                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4, stroke: "#fff" }}
                                activeDot={{ r: 6 }}
                                name="Projected Balance"
                            />
                            <Area yAxisId="left" type="monotone" dataKey="Balance" fill="#3B82F6" fillOpacity={0.1} stroke="none" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                <div className="border rounded-md overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right text-green-600">Expected Inflow</TableHead>
                                <TableHead className="text-right text-red-600">Expected Outflow</TableHead>
                                <TableHead className="text-right">Net Change</TableHead>
                                <TableHead className="text-right font-bold">Closing Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {forecast.map((day) => (
                                <TableRow key={day.date}>
                                    <TableCell className="font-medium">
                                        {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </TableCell>
                                    <TableCell className="text-right text-green-600">
                                        {day.inflow > 0 ? `+${day.inflow.toLocaleString()}` : "-"}
                                    </TableCell>
                                    <TableCell className="text-right text-red-600">
                                        {day.outflow > 0 ? `-${day.outflow.toLocaleString()}` : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className={`flex items-center justify-end gap-1 ${day.netChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {day.netChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                            {Math.abs(day.netChange).toLocaleString()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-bold">
                                        ${day.closingBalance.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
