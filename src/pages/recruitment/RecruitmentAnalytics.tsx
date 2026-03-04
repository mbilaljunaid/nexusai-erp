import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    BarChart3,
    TrendingUp,
    DollarSign,
    Clock,
    Users,
    CheckCircle,
    Download
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from "recharts";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";
import { ExportButton } from "@/components/ExportButton";

interface Analytics {
    timeToHire: number;
    offerAcceptanceRate: number;
    costPerHire: number;
    activeRequisitions: number;
    sourceEffectiveness: Array<{ source: string; count: number; hires: number }>;
    pipelineFunnel: Array<{ stage: string; count: number }>;
    hiresOverTime: Array<{ month: string; count: number }>;
    interviewerPerformance: Array<{ id: string; name: string; interviews: number; avgRating: number; avgFeedbackTime: number }>;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function RecruitmentAnalytics() {
    const [dateRange, setDateRange] = useState('90');

    const { data: analytics, isLoading } = useQuery<Analytics>({
        queryKey: ['/api/recruitment/analytics', dateRange],
        queryFn: async () => {
            const res = await fetch(`/api/recruitment/analytics?days=${dateRange}`);
            if (!res.ok) {
                // Mock data for development
                return {
                    timeToHire: 28,
                    offerAcceptanceRate: 85,
                    costPerHire: 4200,
                    activeRequisitions: 12,
                    sourceEffectiveness: [
                        { source: 'LinkedIn', count: 145, hires: 22 },
                        { source: 'Indeed', count: 98, hires: 15 },
                        { source: 'Referral', count: 67, hires: 18 },
                        { source: 'Company Website', count: 52, hires: 8 },
                        { source: 'Recruiter', count: 34, hires: 12 }
                    ],
                    pipelineFunnel: [
                        { stage: 'Applied', count: 396 },
                        { stage: 'Screened', count: 198 },
                        { stage: 'Interviewed', count: 89 },
                        { stage: 'Offered', count: 28 },
                        { stage: 'Hired', count: 22 }
                    ],
                    hiresOverTime: [
                        { month: 'Sep', count: 5 },
                        { month: 'Oct', count: 8 },
                        { month: 'Nov', count: 12 },
                        { month: 'Dec', count: 15 },
                        { month: 'Jan', count: 18 },
                        { month: 'Feb', count: 22 }
                    ],
                    interviewerPerformance: [
                        { id: '1', name: 'John Smith', interviews: 45, avgRating: 4.2, avgFeedbackTime: 1.5 },
                        { id: '2', name: 'Sarah Johnson', interviews: 38, avgRating: 4.5, avgFeedbackTime: 0.8 },
                        { id: '3', name: 'Michael Chen', interviews: 32, avgRating: 3.9, avgFeedbackTime: 2.1 },
                        { id: '4', name: 'Emily Davis', interviews: 28, avgRating: 4.7, avgFeedbackTime: 0.5 }
                    ]
                };
            }
            return res.json();
        }
    });

    const exportData = analytics ? [
        { Metric: 'Time to Hire (days)', Value: analytics.timeToHire, Source: '', Applications: '', Hires: '', 'Conversion Rate': '' },
        { Metric: 'Offer Acceptance Rate (%)', Value: analytics.offerAcceptanceRate, Source: '', Applications: '', Hires: '', 'Conversion Rate': '' },
        { Metric: 'Cost per Hire ($)', Value: analytics.costPerHire, Source: '', Applications: '', Hires: '', 'Conversion Rate': '' },
        { Metric: 'Active Requisitions', Value: analytics.activeRequisitions, Source: '', Applications: '', Hires: '', 'Conversion Rate': '' },
        ...analytics.sourceEffectiveness.map(s => ({
            Metric: 'Source Effectiveness',
            Value: '',
            Source: s.source,
            Applications: s.count,
            Hires: s.hires,
            'Conversion Rate': `${((s.hires / s.count) * 100).toFixed(1)}%`
        }))
    ] : [];

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading analytics...</div>;
    }

    if (!analytics) {
        return <div className="p-8 text-center text-muted-foreground">No analytics data available</div>;
    }

    const interviewerColumns: SpreadsheetColumn<any>[] = [
        {
            id: "name",
            header: "Interviewer",
            width: "200px",
            cell: (row) => <div className="px-2 font-medium text-left">{row.name}</div>
        },
        {
            id: "interviews",
            header: "# Interviews",
            width: "150px",
            cell: (row) => <div className="px-2 text-center">{row.interviews}</div>
        },
        {
            id: "avgRating",
            header: "Avg Rating",
            width: "150px",
            cell: (row) => (
                <div className="px-2 text-center flex justify-center">
                    <Badge variant="outline">
                        {row.avgRating.toFixed(1)} / 5.0
                    </Badge>
                </div>
            )
        },
        {
            id: "avgFeedbackTime",
            header: "Avg Feedback Time (days)",
            width: "250px",
            cell: (row) => (
                <div className="px-2 text-center flex justify-center">
                    <Badge
                        variant={row.avgFeedbackTime <= 1 ? 'default' : 'secondary'}
                        className={row.avgFeedbackTime <= 1 ? 'bg-green-600' : ''}
                    >
                        {row.avgFeedbackTime.toFixed(1)}
                    </Badge>
                </div>
            )
        },
        {
            id: "performance",
            header: "Performance",
            width: "150px",
            cell: (row) => (
                <div className="px-2 text-center flex justify-center">
                    {row.avgRating >= 4.5 && row.avgFeedbackTime <= 1 ? (
                        <Badge variant="default" className="bg-green-600">Excellent</Badge>
                    ) : row.avgRating >= 4.0 ? (
                        <Badge variant="default">Good</Badge>
                    ) : (
                        <Badge variant="secondary">Average</Badge>
                    )}
                </div>
            )
        }
    ];

    return (
        <StandardPage title="Recruitment Analytics">
            <div className="flex items-center justify-between">
                <div>

                    <p className="text-muted-foreground mt-2">
                        Insights and metrics for recruitment performance
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="30">Last 30 Days</SelectItem>
                            <SelectItem value="60">Last 60 Days</SelectItem>
                            <SelectItem value="90">Last 90 Days</SelectItem>
                            <SelectItem value="365">Last Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <ExportButton
                        data={exportData}
                        filename={`recruitment-analytics-${new Date().toISOString().split('T')[0]}`}
                    />
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Time to Hire</p>
                                <p className="text-2xl font-bold">{analytics.timeToHire} days</p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Offer Acceptance</p>
                                <p className="text-2xl font-bold">{analytics.offerAcceptanceRate}%</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Cost per Hire</p>
                                <p className="text-2xl font-bold">${analytics.costPerHire.toLocaleString()}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Active Requisitions</p>
                                <p className="text-2xl font-bold">{analytics.activeRequisitions}</p>
                            </div>
                            <Users className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Source Effectiveness */}
                <Card>
                    <CardHeader>
                        <CardTitle>Source Effectiveness</CardTitle>
                        <CardDescription>Applications and hires by source</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.sourceEffectiveness}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="source" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3b82f6" name="Applications" />
                                <Bar dataKey="hires" fill="#10b981" name="Hires" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Pipeline Funnel */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recruitment Funnel</CardTitle>
                        <CardDescription>Candidate progression through stages</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {analytics.pipelineFunnel.map((stage, idx) => {
                                const total = analytics.pipelineFunnel[0].count;
                                const percentage = ((stage.count / total) * 100).toFixed(1);
                                return (
                                    <div key={stage.stage} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">{stage.stage}</span>
                                            <span>{stage.count} ({percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-6 relative overflow-hidden">
                                            {/* eslint-disable-next-line react/forbid-dom-props */}
                                            <div
                                                className="h-full flex items-center justify-end px-2 text-xs font-semibold text-white transition-all"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: COLORS[idx % COLORS.length]
                                                }}
                                            >
                                                {stage.count}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hires Over Time */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hires Over Time</CardTitle>
                        <CardDescription>Monthly hiring trend</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.hiresOverTime}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8b5cf6" name="Hires" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Sources (Pie) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Application Sources</CardTitle>
                        <CardDescription>Distribution by source</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={analytics.sourceEffectiveness}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => entry.source}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {analytics.sourceEffectiveness.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Interviewer Performance Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Interviewer Performance</CardTitle>
                    <CardDescription>Interview activity and feedback metrics</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg overflow-hidden h-[300px]">
                        <InteractiveSpreadsheet
                            data={analytics.interviewerPerformance}
                            columns={interviewerColumns}
                            containerHeight="300px"
                            virtualized={true}
                            onChange={() => { }}
                        />
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
