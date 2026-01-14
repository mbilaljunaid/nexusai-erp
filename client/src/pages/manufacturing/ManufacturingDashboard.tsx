import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Factory, ClipboardList, CheckCircle2, AlertOctagon,
    BarChart3, Activity, Users, Settings2
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
    activeWorkOrders: number;
    completedToday: number;
    pendingQuality: number;
    averageEfficiency: number;
}

export default function ManufacturingDashboard() {
    const { data: woData, isLoading: woLoading } = useQuery({
        queryKey: ["/api/manufacturing/work-orders"],
        queryFn: async () => {
            const res = await fetch("/api/manufacturing/work-orders?limit=100");
            return res.json();
        }
    });

    const { data: qData, isLoading: qLoading } = useQuery({
        queryKey: ["/api/manufacturing/quality-inspections"],
    });

    const workOrders = woData?.items || [];
    const stats: Stats = {
        activeWorkOrders: workOrders.filter((wo: any) => wo.status === 'in_progress').length,
        completedToday: workOrders.filter((wo: any) => wo.status === 'completed').length,
        pendingQuality: (qData || []).filter((q: any) => q.status === 'pending').length,
        averageEfficiency: 94.2 // Still mocked until OEE engine is built
    };

    // Prepare chart data: Distribution by Status
    const statusDistribution = [
        { name: 'Planned', count: workOrders.filter((w: any) => w.status === 'planned').length, color: '#94a3b8' },
        { name: 'Released', count: workOrders.filter((w: any) => w.status === 'released').length, color: '#60a5fa' },
        { name: 'In Progress', count: workOrders.filter((w: any) => w.status === 'in_progress').length, color: '#fbbf24' },
        { name: 'Completed', count: workOrders.filter((w: any) => w.status === 'completed').length, color: '#4ade80' },
    ];

    if (woLoading || qLoading) {
        return (
            <StandardPage title="Manufacturing Performance Oversight">
                <div className="grid grid-cols-4 gap-4 mb-8">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
                </div>
                <div className="grid grid-cols-2 gap-8">
                    <Skeleton className="h-[300px] w-full" />
                    <Skeleton className="h-[300px] w-full" />
                </div>
            </StandardPage>
        );
    }

    return (
        <StandardPage
            title="Manufacturing Performance Oversight"
            breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "Overview" }]}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="bg-blue-50 border-blue-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700">Active Work Orders</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-900">{stats.activeWorkOrders}</div>
                        <p className="text-xs text-blue-600 mt-1">Orders currently on shop floor</p>
                    </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Completed (Today)</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-900">{stats.completedToday}</div>
                        <p className="text-xs text-green-600 mt-1">Finished goods output</p>
                    </CardContent>
                </Card>

                <Card className="bg-amber-50 border-amber-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-amber-700">Pending Quality</CardTitle>
                        <ClipboardList className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-900">{stats.pendingQuality}</div>
                        <p className="text-xs text-amber-600 mt-1">Inspections awaiting review</p>
                    </CardContent>
                </Card>

                <Card className="bg-indigo-50 border-indigo-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-700">OEE Performance</CardTitle>
                        <Settings2 className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-900">{stats.averageEfficiency}%</div>
                        <p className="text-xs text-indigo-600 mt-1">Global efficiency rating</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader><CardTitle>Work Order Status Distribution</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statusDistribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Recent Critical Events</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="bg-amber-100 p-2 rounded-full">
                                        <AlertOctagon className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-semibold">Production Bottleneck: WC-01</span>
                                            <span className="text-xs text-muted-foreground">12m ago</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Assembly line 01 reports intermittent resource unavailability.</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
