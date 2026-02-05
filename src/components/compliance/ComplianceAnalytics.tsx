import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    Legend,
    Tooltip as RechartsTooltip
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ComplianceAnalyticsProps {
    data: {
        riskDistribution: { severity: string; count: number }[];
        violationTrends: { month: string; count: number }[];
        velocity: { month: string; opened: number; resolved: number }[];
    };
}

const COLORS = {
    critical: "#ef4444",
    high: "#f97316",
    medium: "#eab308",
    low: "#22c55e",
};

export function ComplianceAnalytics({ data }: ComplianceAnalyticsProps) {
    const pieData = data.riskDistribution.map(d => ({
        name: d.severity.toUpperCase(),
        value: Number(d.count),
        color: COLORS[d.severity as keyof typeof COLORS] || "#94a3b8"
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="shadow-sm border">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Violation Trends (Last 6 Months)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.violationTrends}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#colorCount)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm border">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Risk Distribution by Severity
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                    <div className="h-[250px] w-full flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col gap-2 min-w-[120px]">
                            {pieData.map((d, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                                    <span className="text-xs font-medium text-slate-700">{d.name}</span>
                                    <span className="text-xs text-muted-foreground ml-auto">{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm border md:col-span-2">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Compliance Velocity (Opened vs Resolved)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.velocity}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f1f5f9' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="opened" name="Violations Opened" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="resolved" name="Violations Resolved" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}
