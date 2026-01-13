import { useQuery } from "@tanstack/react-query";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, BarChart3, Activity } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from "recharts";

interface CRMMetrics {
    totalLeads: number;
    pipelineValue: string;
    winRate: string;
    avgSalesCycle: string;
    leadsBySource: { name: string; value: number }[];
    revenueTrend: { month: string; value: number }[];
}

export default function CrmDashboard() {
    const { data: metrics, isLoading } = useQuery<CRMMetrics>({
        queryKey: ["/api/crm/metrics"],
        // Mock data fallback if API doesn't exist
        queryFn: async () => {
            try {
                const res = await fetch("/api/crm/metrics");
                if (!res.ok) throw new Error("Failed");
                return res.json();
            } catch (e) {
                return {
                    totalLeads: 1240,
                    pipelineValue: "$1.2M",
                    winRate: "24%",
                    avgSalesCycle: "45 days",
                    leadsBySource: [
                        { name: 'Web', value: 400 },
                        { name: 'Referral', value: 300 },
                        { name: 'Events', value: 300 },
                        { name: 'Other', value: 240 },
                    ],
                    revenueTrend: [
                        { month: 'Jan', value: 4000 },
                        { month: 'Feb', value: 3000 },
                        { month: 'Mar', value: 2000 },
                        { month: 'Apr', value: 2780 },
                        { month: 'May', value: 1890 },
                        { month: 'Jun', value: 2390 },
                    ]
                }
            }
        }
    });

    const header = (
        <div>
            <h1 className="text-3xl font-bold tracking-tight">CRM Dashboard</h1>
            <p className="text-muted-foreground">
                Overview of your sales performance and pipeline activities.
            </p>
        </div>
    );

    return (
        <StandardDashboard header={header}>
            {/* KPIs */}
            <DashboardWidget title="Total Leads" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-700 rounded-full">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{metrics?.totalLeads ?? "..."}</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Pipeline Value" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-700 rounded-full">
                        <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{metrics?.pipelineValue ?? "..."}</div>
                        <p className="text-xs text-muted-foreground">Weighted forecast</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Win Rate" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-700 rounded-full">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{metrics?.winRate ?? "..."}</div>
                        <p className="text-xs text-muted-foreground">vs Industry avg 20%</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Avg Sales Cycle" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 text-orange-700 rounded-full">
                        <Activity className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{metrics?.avgSalesCycle ?? "..."}</div>
                        <p className="text-xs text-muted-foreground">-5 days improvement</p>
                    </div>
                </div>
            </DashboardWidget>

            {/* Charts */}
            <DashboardWidget title="Revenue Trend" colSpan={2} className="min-h-[300px]">
                <div className="h-[250px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metrics?.revenueTrend || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Leads by Source" colSpan={2} className="min-h-[300px]">
                <div className="h-[250px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metrics?.leadsBySource || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="value" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </DashboardWidget>

        </StandardDashboard>
    );
}
