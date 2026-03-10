import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { BarChart3, Download } from "lucide-react";
import { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StandardPage } from '@/components/layout/StandardPage';

export default function WarehouseAnalytics() {
    const [period, setPeriod] = useState("WEEK");

    const { data: analytics } = useQuery<any>({
        queryKey: ["/api/wms/analytics", period],
        queryFn: () => apiRequest("GET", `/api/wms/analytics?period=${period}`).then(res => res.json()),
    });

    return (
        <StandardPage
            title="Warehouse Analytics"
            description="KPI dashboard and performance trends"
            actions={
                <div className="flex gap-2">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DAY">Daily</SelectItem>
                            <SelectItem value="WEEK">Weekly</SelectItem>
                            <SelectItem value="MONTH">Monthly</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Order Fill Rate</div>
                        <div className="text-3xl font-bold mt-1">{analytics?.fillRate}%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Pick Accuracy</div>
                        <div className="text-3xl font-bold mt-1">{analytics?.pickAccuracy}%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Productivity</div>
                        <div className="text-3xl font-bold mt-1">{analytics?.productivity}%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Space Utilization</div>
                        <div className="text-3xl font-bold mt-1">{analytics?.spaceUtilization}%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">On-Time Ship</div>
                        <div className="text-3xl font-bold mt-1">{analytics?.onTimeShip}%</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Orders Processed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={analytics?.ordersProcessed || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="orders" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Productivity Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={analytics?.productivityTrend || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="productivity" stroke="#82ca9d" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
