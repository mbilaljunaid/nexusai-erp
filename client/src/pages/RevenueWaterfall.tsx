import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function RevenueWaterfall() {
    const [year, setYear] = useState<string>(new Date().getFullYear().toString());

    const { data: waterfallData, isLoading, error } = useQuery({
        queryKey: ['revenue-waterfall', year],
        queryFn: async () => {
            const res = await fetch(`/api/revenue/reporting/waterfall?year=${year}`);
            if (!res.ok) throw new Error("Failed to fetch waterfall data");
            return res.json();
        }
    });

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Revenue Waterfall
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Visualize recognized revenue over time.
                    </p>
                </div>

                <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2025">FY 2025</SelectItem>
                        <SelectItem value="2026">FY 2026</SelectItem>
                        <SelectItem value="2027">FY 2027</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Failed to load revenue waterfall data. Please try again.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6">
                <Card className="shadow-lg border-blue-100 dark:border-blue-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span>Recognized Revenue by Period</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[500px]">
                        {isLoading ? (
                            <Skeleton className="h-full w-full" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={waterfallData}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="period" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis
                                        stroke="#64748B"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                                        cursor={{ fill: '#F1F5F9' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Recognized Revenue" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
