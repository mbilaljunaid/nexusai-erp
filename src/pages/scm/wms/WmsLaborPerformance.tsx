
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Activity,
    Clock,
    TrendingUp,
    Award,
    AlertTriangle,
    ArrowRight
} from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from "recharts";



export default function WmsLaborPerformance() {
    const { data: performanceData = [] } = useQuery<any>({
        queryKey: ['wms-labor-performance'],
        queryFn: async () => {
            const res = await fetch('/api/scm/wms/labor-performance');
            if (!res.ok) {
                // Return gracefully if endpoint not yet implemented
                return [];
            }
            return res.json();
        }
    });

    const performanceColumns: SpreadsheetColumn<any>[] = [
        { id: "name", header: "Worker Name", width: "150px", cell: (row) => <span className="font-semibold text-white">{row.name}</span> },
        { id: "tasks", header: "Tasks Completed", width: "150px", cell: (row) => <span className="text-slate-400">{row.tasks}</span> },
        {
            id: "efficiency", header: "Efficiency %", width: "200px", cell: (row) => (
                <div className="flex items-center gap-2">
                    <style>{`
                        .wms-bar-${row.name.replace(/\\s+/g, '')} { width: ${Math.min(row.efficiency, 100)}%; }
                    `}</style>
                    <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full bg-blue-500 wms-bar-${row.name.replace(/\\s+/g, '')}`} />
                    </div>
                    <span className="text-white">{row.efficiency}%</span>
                </div>
            )
        },
        { id: "errorRate", header: "Error Rate %", width: "150px", cell: (row) => <span className="text-slate-400">{row.errorRate}%</span> },
        {
            id: "tier", header: "Incentive Tier", width: "150px", cell: (row) => (
                <Badge variant="outline" className={row.efficiency > 100 ? 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5' : 'border-slate-800'}>
                    {row.efficiency > 100 ? <Award className="w-3 h-3 mr-1" /> : null}
                    {row.efficiency > 100 ? 'Gold' : row.efficiency > 90 ? 'Silver' : 'Standard'}
                </Badge>
            )
        },
        {
            id: "actions", header: "Actions", width: "150px", cell: () => (
                <Button variant="ghost" size="sm" className="text-blue-400 w-full justify-end">
                    View Log <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
            )
        }
    ];

    return (
        <StandardPage
            title="Labor & Productivity"
            description="Real-time tracking of warehouse staff performance and efficiency metrics."
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardContent className="p-6">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Active Staff</p>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-3xl font-bold text-white">24</p>
                            <Users className="w-6 h-6 text-blue-400 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardContent className="p-6">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Avg Efficiency</p>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-3xl font-bold text-green-400">94.2%</p>
                            <Activity className="w-6 h-6 text-green-400 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardContent className="p-6">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Tasks / Hour</p>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-3xl font-bold text-orange-400">18.5</p>
                            <Clock className="w-6 h-6 text-orange-400 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardContent className="p-6">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Error Rate</p>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-3xl font-bold text-red-400">0.45%</p>
                            <AlertTriangle className="w-6 h-6 text-red-400 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                        <CardTitle>Top Performers</CardTitle>
                        <CardDescription>Based on efficiency and quality score</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performanceData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={80} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                                        itemStyle={{ color: '#60a5fa' }}
                                    />
                                    <Bar dataKey="efficiency" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                        <CardTitle>Productivity Trend</CardTitle>
                        <CardDescription>Average tasks completed per shift</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={[
                                    { time: '08:00', value: 12 },
                                    { time: '10:00', value: 45 },
                                    { time: '12:00', value: 38 },
                                    { time: '14:00', value: 52 },
                                    { time: '16:00', value: 48 },
                                    { time: '18:00', value: 30 },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                                    <YAxis stroke="#64748b" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                                    />
                                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-slate-900/50 border-slate-800 mt-8">
                <CardHeader>
                    <CardTitle>Individual Performance Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        <InteractiveSpreadsheet
                            columns={performanceColumns}
                            data={performanceData}
                            onChange={() => { }}
                            containerHeight="100%"
                        />
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
