import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    TrendingUp,
    AlertTriangle,
    Users,
    Target,
    Download,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface AttritionRisk {
    employeeId: string;
    employeeName: string;
    department: string;
    riskScore: number;
    riskFactors: string[];
    tenure: number;
    lastReview: string;
}

interface SkillGap {
    skill: string;
    currentCount: number;
    requiredCount: number;
    gap: number;
    priority: 'High' | 'Medium' | 'Low';
}

interface TalentTrend {
    month: string;
    hires: number;
    departures: number;
    netChange: number;
}

export default function HRPredictiveAnalytics() {
    const [dateRange, setDateRange] = useState('12');
    const [riskFilter, setRiskFilter] = useState('ALL');

    const { data: analytics, isLoading } = useQuery<any>({
        queryKey: ['/analytics/hr-predictive', dateRange],
        queryFn: async () => {
            const res = await fetch(`/api/analytics/hr-predictive?months=${dateRange}`);
            if (!res.ok) {
                throw new Error("Failed to fetch predictive analytics");
            }
            return res.json();
        }
    });

    const getRiskColor = (score: number) => {
        if (score >= 70) return 'bg-red-600';
        if (score >= 50) return 'bg-orange-600';
        return 'bg-yellow-600';
    };

    const getRiskLabel = (score: number) => {
        if (score >= 70) return 'High';
        if (score >= 50) return 'Medium';
        return 'Low';
    };

    const getPriorityColor = (priority: string) => {
        if (priority === 'High') return 'bg-red-600';
        if (priority === 'Medium') return 'bg-orange-600';
        return 'bg-blue-600';
    };

    const filteredRisks = analytics?.attritionRisk.filter((risk: AttritionRisk) => {
        if (riskFilter === 'ALL') return true;
        if (riskFilter === 'HIGH') return risk.riskScore >= 70;
        if (riskFilter === 'MEDIUM') return risk.riskScore >= 50 && risk.riskScore < 70;
        return risk.riskScore < 50;
    }) || [];

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading predictive analytics...</div>;
    }

    return (
        <div className="space-y-6 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <TrendingUp className="h-8 w-8" />
                        HR Predictive Analytics
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        AI-powered insights for workforce planning
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="6">Last 6 Months</SelectItem>
                            <SelectItem value="12">Last 12 Months</SelectItem>
                            <SelectItem value="18">Last 18 Months</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Avg Attrition Risk</p>
                                <p className="text-2xl font-bold">{analytics.summary.avgAttritionRisk}%</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">High Risk Employees</p>
                                <p className="text-2xl font-bold">{analytics.summary.highRiskCount}</p>
                            </div>
                            <Users className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Critical Skill Gaps</p>
                                <p className="text-2xl font-bold">{analytics.summary.criticalSkillGaps}</p>
                            </div>
                            <Target className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Projected Attrition</p>
                                <p className="text-2xl font-bold">{analytics.summary.projectedAttrition}%</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attrition Risk Analysis */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div>
                            <CardTitle>Flight Risk Analysis</CardTitle>
                            <CardDescription>Employees at risk of leaving</CardDescription>
                        </div>
                        <Select value={riskFilter} onValueChange={setRiskFilter}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Risks</SelectItem>
                                <SelectItem value="HIGH">High Only</SelectItem>
                                <SelectItem value="MEDIUM">Medium Only</SelectItem>
                                <SelectItem value="LOW">Low Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {filteredRisks.map((risk: AttritionRisk) => (
                                <Card key={risk.employeeId}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="font-semibold">{risk.employeeName}</h4>
                                                <p className="text-sm text-muted-foreground">{risk.department} • {risk.tenure}y tenure</p>
                                            </div>
                                            <Badge className={getRiskColor(risk.riskScore)}>
                                                {getRiskLabel(risk.riskScore)} ({risk.riskScore}%)
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">Risk Factors:</p>
                                            {risk.riskFactors.map((factor, idx) => (
                                                <p key={idx} className="text-xs flex items-start gap-1">
                                                    <span className="text-red-500">•</span>
                                                    {factor}
                                                </p>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Skill Gap Analysis */}
                <Card>
                    <CardHeader>
                        <CardTitle>Skill Gap Prediction</CardTitle>
                        <CardDescription>Critical competency shortfalls</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analytics.skillGaps.map((gap: SkillGap) => (
                                <div key={gap.skill} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{gap.skill}</span>
                                            <Badge className={getPriorityColor(gap.priority)} variant="default">
                                                {gap.priority}
                                            </Badge>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {gap.currentCount}/{gap.requiredCount} (-{gap.gap})
                                        </span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-3">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                                            style={{ width: `${(gap.currentCount / gap.requiredCount) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Talent Trends */}
            <Card>
                <CardHeader>
                    <CardTitle>Talent Movement Trends</CardTitle>
                    <CardDescription>Hiring vs departures over time</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.talentTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="hires" stroke="#10b981" name="Hires" strokeWidth={2} />
                            <Line type="monotone" dataKey="departures" stroke="#ef4444" name="Departures" strokeWidth={2} />
                            <Line type="monotone" dataKey="netChange" stroke="#3b82f6" name="Net Change" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card>
                <CardHeader>
                    <CardTitle>AI-Powered Recommendations</CardTitle>
                    <CardDescription>Suggested interventions to improve retention</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <Card>
                            <CardContent className="p-4 flex items-start gap-4">
                                <ArrowUpRight className="h-5 w-5 text-green-600 mt-1" />
                                <div className="flex-1">
                                    <h4 className="font-medium">Offer Competitive Compensation Review</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        3 high-risk employees have salaries 15-20% below market rate. Schedule compensation reviews.
                                    </p>
                                    <Button size="sm" variant="outline" className="mt-2">
                                        View Employees
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-start gap-4">
                                <Target className="h-5 w-5 text-blue-600 mt-1" />
                                <div className="flex-1">
                                    <h4 className="font-medium">Invest in Cloud Architecture Training</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        7-person gap in critical Cloud Architecture skills. Consider upskilling program or external hiring.
                                    </p>
                                    <Button size="sm" variant="outline" className="mt-2">
                                        Create Learning Path
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-start gap-4">
                                <AlertTriangle className="h-5 w-5 text-orange-600 mt-1" />
                                <div className="flex-1">
                                    <h4 className="font-medium">Conduct Stay Interviews</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Schedule 1-on-1 stay interviews with 5 high-risk employees to understand concerns and retention drivers.
                                    </p>
                                    <Button size="sm" variant="outline" className="mt-2">
                                        Schedule Interviews
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
