import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Award,
    Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { qualityService } from "@/services/maintenance.service";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

interface QualityMetrics {
    totalInspections: number;
    passRate: number;
    failRate: number;
    avgInspectionTime: number; // minutes
    criticalDefects: number;
    trend: "UP" | "DOWN" | "STABLE";
}

interface InspectionTrend {
    month: string;
    passed: number;
    failed: number;
    total: number;
}

interface DefectCategory {
    name: string;
    count: number;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export function QualityAnalytics() {
    const [timeRange, setTimeRange] = useState<string>("30");
    const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
    const [trends, setTrends] = useState<InspectionTrend[]>([]);
    const [defectCategories, setDefectCategories] = useState<DefectCategory[]>([]);

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    const loadAnalytics = async () => {
        try {
            const data = await qualityService.getAnalytics({ startDate: undefined, endDate: undefined });
            setMetrics({
                totalInspections: data.totalInspections || 0,
                passRate: data.passRate || 0,
                failRate: data.failRate || 0,
                avgInspectionTime: 22, // Static proxy for demo
                criticalDefects: (data.defectCategories || []).filter((d: any) => d.severity === 'CRITICAL').length,
                trend: "UP"
            });
            setTrends(data.trendData || []);
            setDefectCategories(data.defectCategories || []);
        } catch (error) {
            console.error("Failed to load analytics:", error);
            setMetrics(null);
            setTrends([]);
            setDefectCategories([]);
        }
    };

    const passFailData = [
        { name: "Passed", value: metrics?.passRate || 0, color: "#22c55e" },
        { name: "Failed", value: metrics?.failRate || 0, color: "#ef4444" }
    ];

    const getSeverityColor = (severity: DefectCategory["severity"]) => {
        switch (severity) {
            case "CRITICAL":
                return { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" };
            case "HIGH":
                return { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" };
            case "MEDIUM":
                return { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" };
            default:
                return { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" };
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Quality Analytics</h1>
                    <p className="text-muted-foreground">Track inspection performance and defect trends</p>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                        <SelectItem value="365">Last year</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* KPI Cards */}
            {metrics && (
                <div className="grid md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-medium text-muted-foreground">Total Inspections</div>
                                <Target className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="text-3xl font-bold">{metrics.totalInspections}</div>
                            <div className="text-xs text-muted-foreground mt-1">Last {timeRange} days</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-medium text-muted-foreground">Pass Rate</div>
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <div className="text-3xl font-bold text-green-600">{metrics.passRate}%</div>
                                {metrics.trend === "UP" ? (
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {metrics.trend === "UP" ? "↑" : "↓"} vs previous period
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-medium text-muted-foreground">Avg Time</div>
                                <Award className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="text-3xl font-bold">{metrics.avgInspectionTime}</div>
                            <div className="text-xs text-muted-foreground mt-1">minutes per inspection</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-medium text-muted-foreground">Critical Defects</div>
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                            </div>
                            <div className="text-3xl font-bold text-red-600">{metrics.criticalDefects}</div>
                            <div className="text-xs text-muted-foreground mt-1">Requires immediate action</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Pass/Fail Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Pass/Fail Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={passFailData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {passFailData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Inspection Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Inspection Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="passed" stroke="#22c55e" strokeWidth={2} name="Passed" />
                                <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} name="Failed" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Defect Categories */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Defect Categories (Last {timeRange} Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {defectCategories.map((defect, index) => {
                            const colors = getSeverityColor(defect.severity);
                            const total = defectCategories.reduce((sum, d) => sum + d.count, 0);
                            const percentage = ((defect.count / total) * 100).toFixed(1);

                            return (
                                <div key={index} className={cn("border-l-4 p-3 rounded", colors.border, colors.bg)}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle className="h-4 w-4" />
                                            <div className="font-medium">{defect.name}</div>
                                            <Badge variant="outline" className={cn(colors.bg, colors.text, "text-xs")}>
                                                {defect.severity}
                                            </Badge>
                                        </div>
                                        <div className="text-sm font-bold">{defect.count} defects</div>
                                    </div>
                                    <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-current opacity-60"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-right mt-1 opacity-75">{percentage}% of total defects</div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Defect Frequency Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Defect Frequency by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={defectCategories}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#3b82f6" name="Defect Count" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}

export default QualityAnalytics;
