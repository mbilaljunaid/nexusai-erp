import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from "recharts";
import {
    ShieldCheck,
    AlertTriangle,
    Calendar,
    DollarSign,
    FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from '@/components/layout/StandardPage';

export default function LeaseComplianceDashboard() {
    const { data: stats } = useQuery<any>({
        queryKey: ["/api/lease/compliance/stats"],
        queryFn: async () => {
            const res = await fetch("/api/lease/compliance/stats");
            return res.json();
        }
    });

    const leaseTypeData = [
        { name: "Operating", value: 65, color: "#3b82f6" },
        { name: "Finance", value: 35, color: "#10b981" }
    ];

    const upcomingRenewals = [
        { name: "Global HQ Office", days: 12, value: "$450,000", risk: "High" },
        { name: "Regional Hub - West", days: 45, value: "$120,000", risk: "Medium" },
        { name: "Data Center Lab", days: 82, value: "$85,000", risk: "Low" }
    ];

    return (
        <StandardPage
            title="Lease Compliance Dashboard"
            description="IFRS 16 and ASC 842 financial disclosure overview"
            actions={
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-full border border-green-200 dark:border-green-900">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-sm font-semibold">Audit Compliant - Period Q1 2026</span>
                </div>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Metric Cards */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Lease Liability</CardDescription>
                        <CardTitle className="text-2xl font-bold font-mono">$12,450,230.15</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-xs text-red-600">
                            <span className="font-semibold">+2.4%</span> vs last month
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total ROU Asset Value</CardDescription>
                        <CardTitle className="text-2xl font-bold font-mono">$11,820,115.42</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-xs text-green-600">
                            <span className="font-semibold">-1.1%</span> depreciation impact
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Active Contracts</CardDescription>
                        <CardTitle className="text-2xl font-bold">142</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-xs text-blue-600">
                            12 New this period
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Compliance Progress */}
                <Card>
                    <CardHeader>
                        <CardTitle>Disclosure Completeness</CardTitle>
                        <CardDescription>Audit readiness for period ending Dec 2025</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Contract Identification</span>
                                <span className="font-semibold text-green-600">100%</span>
                            </div>
                            <Progress value={100} className="h-2" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Remeasurement Accuracy</span>
                                <span className="font-semibold text-blue-600">94.2%</span>
                            </div>
                            <Progress value={94} className="h-2" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Disclosure Note Generation</span>
                                <span className="font-semibold text-amber-600">68.5%</span>
                            </div>
                            <Progress value={68} className="h-2" />
                        </div>
                    </CardContent>
                </Card>

                {/* Portfolio Mix */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lease Composition</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={leaseTypeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {leaseTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-col gap-2 ml-4">
                            {leaseTypeData.map((entry) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div
                                        className={`w-3 h-3 rounded-full ${entry.color === "#3b82f6" ? "bg-blue-500" :
                                            entry.color === "#10b981" ? "bg-emerald-500" : ""
                                            }`}
                                        title={`${entry.name} color indicator`}
                                    />
                                    <span className="text-sm">{entry.name} ({entry.value}%)</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Renewal Tracking */}
            <Card>
                <CardHeader>
                    <CardTitle>Critical Portfolio Events</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {upcomingRenewals.map((event) => (
                            <div key={event.name} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded ${event.risk === "High" ? "bg-red-100 text-red-600" :
                                        event.risk === "Medium" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                                        }`}>
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{event.name}</p>
                                        <p className="text-sm text-muted-foreground">Expires in <span className="font-bold">{event.days} days</span></p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{event.value}</p>
                                    <Badge variant={event.risk === "High" ? "destructive" : "secondary"}>
                                        {event.risk} Risk
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
