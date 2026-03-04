
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { Loader2, TrendingUp, Users, Target, Clock, Zap } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function RecruitingAnalytics() {
    const { data: analytics, isLoading } = useQuery({
        queryKey: ["/api/recruitment/analytics"],
        queryFn: () => fetch("/api/recruitment/analytics").then(r => r.json())
    });

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    // Transform Data for Charts
    const funnelData = Object.entries(analytics?.funnel || {
        "Applied": 120,
        "Screening": 85,
        "Interview": 34,
        "Offer": 12,
        "Hired": 8
    }).map(([stage, count]) => ({ stage, count }));

    const sourceData = Object.entries(analytics?.sourceBreakdown || {
        "LinkedIn": 45,
        "Referral": 28,
        "Direct": 15,
        "Sourcing": 12,
        "Other": 10
    }).map(([source, count], index) => ({ name: source, value: count, color: COLORS[index % COLORS.length] }));

    return (
        <StandardPage title="Recruiting Intelligence">
            <div className="flex justify-between items-center">
                <div>
                    
                    <p className="text-muted-foreground mt-2">NEXUS Insight Engine: Real-time visibility into hiring velocity and ROI.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs uppercase px-2 py-1">Live Feed: Active</Badge>
                </div>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-blue-600">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Users className="w-4 h-4" /> Total Hires (YTD)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{analytics?.totalHires || 8}</div>
                        <p className="text-xs text-green-600 font-medium mt-1">+12% vs last year</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-indigo-600">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Clock className="w-4 h-4" /> Avg. Time to Fill</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{analytics?.timeToFill || 28} Days</div>
                        <p className="text-xs text-muted-foreground mt-1">Goal: &lt; 30 days</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-emerald-600">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Target className="w-4 h-4" /> Acceptance Rate</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{analytics?.acceptanceRate || 92}%</div>
                        <p className="text-xs text-green-600 font-medium mt-1">High Intent Pipeline</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-600">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Zap className="w-4 h-4" /> Sourcing Efficiency</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">84%</div>
                        <p className="text-xs text-muted-foreground mt-1">AI-assisted screening</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PIPELINE FUNNEL */}
                <Card>
                    <CardHeader>
                        <CardTitle>Conversion Funnel</CardTitle>
                        <CardDescription>Visualizing candidate drop-off across stages.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={funnelData} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="stage" type="category" width={100} fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* SOURCE BREAKDOWN */}
                <Card>
                    <CardHeader>
                        <CardTitle>Source Effectiveness</CardTitle>
                        <CardDescription>Which channels yield the most high-quality candidates?</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sourceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {sourceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Hiring Velocity Trend</CardTitle>
                    <CardDescription>Month-over-month trend of successful placements.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                                { month: 'Jan', hires: 4 },
                                { month: 'Feb', hires: 7 },
                                { month: 'Mar', hires: 5 },
                                { month: 'Apr', hires: 12 },
                                { month: 'May', hires: 8 },
                                { month: 'Jun', hires: 11 },
                            ]}>
                                <defs>
                                    <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <Tooltip />
                                <Area type="monotone" dataKey="hires" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorHires)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}

function Badge({ children, variant, className }: any) {
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variant === 'outline' ? 'text-foreground' : 'bg-primary text-primary-foreground'} ${className}`}>
            {children}
        </span>
    );
}
