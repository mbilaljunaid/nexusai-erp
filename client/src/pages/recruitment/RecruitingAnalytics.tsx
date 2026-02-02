
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from "recharts";
import { Loader2 } from "lucide-react";

export default function RecruitingAnalytics() {
    const { data: analytics, isLoading } = useQuery({
        queryKey: ["/api/recruitment/analytics"],
        queryFn: () => fetch("/api/recruitment/analytics").then(r => r.json())
    });

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    // Transform Data for Charts
    const funnelData = Object.entries(analytics?.funnel || {}).map(([stage, count]) => ({ stage, count }));
    const sourceData = Object.entries(analytics?.sourceBreakdown || {}).map(([source, count]) => ({ source, count }));

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">Recruiting Analytics</h1>
                <p className="text-muted-foreground mt-2">Insights into hiring velocity and pipeline health.</p>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Hires (YTD)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{analytics?.totalHires || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Time to Fill</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{analytics?.timeToFill || 0} Days</div>
                        <p className="text-xs text-muted-foreground mt-1">Avg time from Req to Offer</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{analytics?.acceptanceRate || 0}%</div>
                        <p className="text-xs text-muted-foreground mt-1">Offers accepted vs extended</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PIPELINE FUNNEL */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pipeline Volume</CardTitle>
                        <CardDescription>Candidates by Stage</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={funnelData} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="stage" type="category" width={100} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* SOURCE BREAKDOWN */}
                <Card>
                    <CardHeader>
                        <CardTitle>Source Effectiveness</CardTitle>
                        <CardDescription>Candidates by Origin</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sourceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="source" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
