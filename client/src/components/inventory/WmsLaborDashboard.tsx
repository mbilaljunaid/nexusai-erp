
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function WmsLaborDashboard() {
    const warehouseId = "PAGINATION-TEST-ORG"; // User Context (Reusing existing test org)

    const { data: metrics, isLoading } = useQuery({
        queryKey: ['wmsLabor'],
        queryFn: async () => {
            const res = await fetch(`/api/wms/labor/metrics?warehouseId=${warehouseId}`);
            if (!res.ok) throw new Error("Failed to fetch labor metrics");
            return res.json();
        }
    });

    const totalTasks = metrics?.reduce((acc: number, curr: any) => acc + curr.tasksCompleted, 0) || 0;
    const topPerformer = metrics?.[0]?.userName || "N/A";

    return (
        <div className="space-y-4 p-4">
            <h2 className="text-2xl font-bold tracking-tight">Labor Productivity (Last 24h)</h2>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tasks Completed</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTasks}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.length || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{topPerformer}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Productivity by User</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="userName" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="tasksCompleted" fill="#8884d8" name="Tasks" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
