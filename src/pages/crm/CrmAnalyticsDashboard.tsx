
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Users, Activity, CheckCircle, AlertTriangle } from "lucide-react";

export default function CrmAnalyticsDashboard() {

    const { data, isLoading } = useQuery({
        queryKey: ["/api/crm/analytics/metrics"],
        queryFn: () => fetch("/api/crm/analytics/metrics").then(r => r.json())
    });

    if (isLoading) return <div className="p-8">Loading Analytics...</div>;

    const { pipeline = [], winRate, service, leaderboard = [] } = data || {};
    const totalPipelineValue = pipeline.reduce((acc: number, curr: any) => acc + curr.totalValue, 0);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Executive Insight</h1>
                    <p className="text-muted-foreground mt-2">Real-time performance metrics across Sales and Service.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
                        <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalPipelineValue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{winRate?.rate || 0}%</div>
                        <p className="text-xs text-muted-foreground">Based on {winRate?.totalClosed || 0} deals</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{service?.slaCompliance || 0}%</div>
                        <p className="text-xs text-muted-foreground">{service?.openCases} active cases</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
                        <Users className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Generated $450k revenue</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pipeline Chart */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Pipeline by Stage</CardTitle>
                        <CardDescription>Value distribution across sales stages.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pipeline}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="stage" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip cursor={{ fill: 'transparent' }} formatter={(value: number) => [`$${value.toLocaleString()}`, "Value"]} />
                                <Bar dataKey="totalValue" fill="#0f172a" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Sales Leaderboard */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Top Performers</CardTitle>
                        <CardDescription>Revenue contribution by representative.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {leaderboard.map((user: any, index: number) => (
                                <div key={user.id} className="flex items-center">
                                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-800 font-bold mr-4">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.name}</p>
                                        <p className="text-xs text-muted-foreground">Sales Rep</p>
                                    </div>
                                    <div className="font-bold">${Number(user.totalSales).toLocaleString()}</div>
                                </div>
                            ))}
                            {leaderboard.length === 0 && <p className="text-muted-foreground text-center py-8">No closed deals yet.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function DollarSignIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="12" x2="12" y1="2" y2="22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    )
}
