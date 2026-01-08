import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { Loader2, TrendingUp, AlertCircle, Users, Target, Activity } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export default function AnalyticsDetail() {
    const { data: pipeline = [], isLoading: pipelineLoading } = useQuery<any[]>({
        queryKey: ["/api/analytics/pipeline"],
    });

    const { data: revenue = [], isLoading: revenueLoading } = useQuery<any[]>({
        queryKey: ["/api/analytics/revenue"],
    });

    const { data: leadSources = [], isLoading: sourcesLoading } = useQuery<any[]>({
        queryKey: ["/api/analytics/lead-sources"],
    });

    const { data: cases = [], isLoading: casesLoading } = useQuery<any[]>({
        queryKey: ["/api/analytics/cases"],
    });

    if (pipelineLoading || revenueLoading || sourcesLoading || casesLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading analytics data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Breadcrumb items={[
                { label: "CRM", path: "/crm" },
                { label: "Analytics", path: "/crm/analytics" },
            ]} />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">CRM Analytics Dashboard</h2>
                    <p className="text-muted-foreground underline">Real-time performance metrics and pipeline visualization</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pipeline Funnel */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-indigo-500" />
                            Pipeline Funnel
                        </CardTitle>
                        <CardDescription>Value of opportunities by stage</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {pipeline.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={pipeline} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="stage" type="category" width={100} fontSize={12} />
                                    <Tooltip
                                        formatter={(value: any) => `$${Number(value).toLocaleString()}`}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} label={{ position: 'right', formatter: (v: any) => `$${Number(v).toLocaleString()}`, fontSize: 10 }} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState message="No pipeline data available" />
                        )}
                    </CardContent>
                </Card>

                {/* Lead Sources */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-green-500" />
                            Lead Generation Sources
                        </CardTitle>
                        <CardDescription>Distribution of leads by source</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {leadSources.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={leadSources}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="source"
                                    >
                                        {leadSources.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState message="No lead source data available" />
                        )}
                    </CardContent>
                </Card>

                {/* Revenue Forecast (Bar Chart instead of Line for variety) */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            Monthly Revenue Performance
                        </CardTitle>
                        <CardDescription>Closed-won revenue over the last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {revenue.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenue}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" fontSize={12} />
                                    <YAxis fontSize={12} tickFormatter={(v: any) => `$${v}`} />
                                    <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
                                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState message="No revenue history available" />
                        )}
                    </CardContent>
                </Card>

                {/* Case Resolution Status */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-rose-500" />
                            Support Case Distribution
                        </CardTitle>
                        <CardDescription>Active vs Resolved issues</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {cases.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={cases}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        labelLine={false}
                                        dataKey="count"
                                        nameKey="status"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {cases.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState message="No case data available" />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
            <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm">{message}</p>
        </div>
    );
}
