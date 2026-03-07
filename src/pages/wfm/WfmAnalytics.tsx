
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { DollarSign, Clock, AlertTriangle, Users } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Input } from "@/components/ui/input";
import { DatePicker } from '@/components/ui/DatePicker';
import { formatNumber } from '@/lib/formatters';



const MOCK_TENANT_ID = "test-tenant-wfm-001";

export default function WfmAnalytics() {
    const [dateRange, setDateRange] = useState({
        start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
        end: format(endOfMonth(new Date()), "yyyy-MM-dd")
    });

    const { data: metrics, isLoading } = useQuery<any>({
        queryKey: ["wfm-analytics", dateRange],
        queryFn: async () => {
            const res = await fetch(`/api/wfm/analytics?tenantId=${MOCK_TENANT_ID}&startDate=${dateRange.start}&endDate=${dateRange.end}`);
            if (!res.ok) throw new Error("Failed to fetch metrics");
            return res.json();
        }
    });

    return (
        <StandardPage title="Workforce Analytics">
            <div className="flex justify-between items-center">
                <div>
                    
                    <p className="text-muted-foreground">Labor Variance & Cost Analysis.</p>
                </div>
                <div className="flex gap-2">
                    {/* Basic Date Picker mockup */}
                    <DatePicker className="border p-2 rounded" value={dateRange.start} onChange={v => setDateRange({ ...dateRange, start: v })} />
                    <span className="self-center">-</span>
                    <DatePicker className="border p-2 rounded" value={dateRange.end} onChange={v => setDateRange({ ...dateRange, end: v })} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Actual Hours</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalActualHours || 0}</div>
                        <p className="text-xs text-muted-foreground">vs {metrics?.totalScheduledHours || 0} Scheduled</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
                        <Clock className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalOvertimeHours || 0}</div>
                        <p className="text-xs text-muted-foreground">Rate Impact: Low</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Violations</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.violationsCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Pending Review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${formatNumber(metrics?.estimatedCost) || 0}</div>
                        <p className="text-xs text-muted-foreground">@ $50/hr Avg</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Labor Variance</CardTitle>
                        <CardDescription>Daily Scheduled vs Actual Hours</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={metrics?.chartData || []}>
                                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="scheduled" name="Scheduled" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="actual" name="Actual" fill="#2563eb" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Cost Projections</CardTitle>
                        <CardDescription>Based on Flat Rate</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-80 flex items-center justify-center text-muted-foreground">
                            Pie Chart Placeholder (Need Recharts Pie Import)
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
