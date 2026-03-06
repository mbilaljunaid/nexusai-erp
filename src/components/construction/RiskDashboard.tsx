import { formatDateTime } from "@/lib/dateUtils";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    Users,
    Activity,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskMetric {
    category: string;
    score: number; // 0-100
    severity: "low" | "medium" | "high" | "critical";
    trend: "up" | "down" | "stable";
    description: string;
    impact: string;
}

interface ProjectRisk {
    projectId: string;
    projectName: string;
    overallRiskScore: number;
    risks: RiskMetric[];
    lastUpdated: string;
}

interface RiskDashboardProps {
    projectId?: string;
}

export function RiskDashboard({ projectId }: RiskDashboardProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const { data: riskData, isLoading } = useQuery<ProjectRisk>({
        queryKey: ["construction-risk", projectId],
        enabled: !!projectId,
        queryFn: async () => {
            // Mock data - in production, this would call AI risk analysis endpoint
            return {
                projectId: projectId!,
                projectName: "Tech Campus Phase 2",
                overallRiskScore: 68,
                lastUpdated: new Date().toISOString(),
                risks: [
                    {
                        category: "Schedule",
                        score: 75,
                        severity: "high",
                        trend: "up",
                        description: "Project timeline at risk due to weather delays",
                        impact: "Potential 14-day delay, $280K impact"
                    },
                    {
                        category: "Budget",
                        score: 45,
                        severity: "medium",
                        trend: "stable",
                        description: "Cost variance within acceptable range",
                        impact: "3.2% under budget, monitoring material costs"
                    },
                    {
                        category: "Safety",
                        score: 22,
                        severity: "low",
                        trend: "down",
                        description: "Safety metrics improving",
                        impact: "Zero incidents last 30 days, strong compliance"
                    },
                    {
                        category: "Quality",
                        score: 58,
                        severity: "medium",
                        trend: "up",
                        description: "Punch list items increasing",
                        impact: "47 open items, up from 32 last week"
                    },
                    {
                        category: "Resources",
                        score: 82,
                        severity: "critical",
                        trend: "up",
                        description: "Labor shortage impacting productivity",
                        impact: "15% under planned crew size, delays likely"
                    },
                    {
                        category: "Compliance",
                        score: 15,
                        severity: "low",
                        trend: "stable",
                        description: "All permits and inspections current",
                        impact: "Full compliance with regulations"
                    }
                ]
            };
        }
    });

    const getSeverityConfig = (severity: string) => {
        switch (severity) {
            case "critical":
                return { color: "bg-red-100 text-red-800 border-red-200", icon: AlertTriangle, textColor: "text-red-600" };
            case "high":
                return { color: "bg-orange-100 text-orange-800 border-orange-200", icon: AlertTriangle, textColor: "text-orange-600" };
            case "medium":
                return { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Activity, textColor: "text-yellow-600" };
            case "low":
                return { color: "bg-green-100 text-green-800 border-green-200", icon: Zap, textColor: "text-green-600" };
            default:
                return { color: "bg-gray-100 text-gray-800 border-gray-200", icon: Activity, textColor: "text-gray-600" };
        }
    };

    const getRiskLevel = (score: number) => {
        if (score >= 75) return "Critical";
        if (score >= 60) return "High";
        if (score >= 40) return "Medium";
        return "Low";
    };

    const getRiskColor = (score: number) => {
        if (score >= 75) return "bg-red-500";
        if (score >= 60) return "bg-orange-500";
        if (score >= 40) return "bg-yellow-500";
        return "bg-green-500";
    };

    if (!projectId) {
        return (
            <Card className="h-96 flex items-center justify-center text-muted-foreground border-dashed">
                Select a project to view risk analysis
            </Card>
        );
    }

    if (isLoading) {
        return <Card className="h-96 flex items-center justify-center">Loading risk analysis...</Card>;
    }

    if (!riskData) return null;

    const overallLevel = getRiskLevel(riskData.overallRiskScore);
    const overallColor = getRiskColor(riskData.overallRiskScore);

    return (
        <div className="space-y-6">
            {/* Overall Risk Score */}
            <Card className="border-l-4" style={{ borderLeftColor: `var(--${overallColor})` }}>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Overall Project Risk
                        </span>
                        <Badge variant={overallLevel === "Critical" || overallLevel === "High" ? "destructive" : "secondary"}>
                            {overallLevel} Risk
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Risk Score</span>
                                <span className="font-semibold">{riskData.overallRiskScore}/100</span>
                            </div>
                            <Progress value={riskData.overallRiskScore} className="h-3" />
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold">{riskData.overallRiskScore}</div>
                            <div className="text-xs text-muted-foreground">Risk Index</div>
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-3">
                        Last updated: {formatDateTime(riskData.lastUpdated)}
                    </div>
                </CardContent>
            </Card>

            {/* Risk Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {riskData.risks.map((risk) => {
                    const config = getSeverityConfig(risk.severity);
                    const Icon = config.icon;
                    const TrendIcon = risk.trend === "up" ? TrendingUp : risk.trend === "down" ? TrendingDown : Activity;
                    const trendColor = risk.trend === "up" ? "text-red-500" : risk.trend === "down" ? "text-green-500" : "text-gray-500";

                    return (
                        <Card
                            key={risk.category}
                            className="hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => setSelectedCategory(selectedCategory === risk.category ? null : risk.category)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium">{risk.category}</CardTitle>
                                    <Badge variant="outline" className={config.color}>
                                        <Icon className="h-3 w-3 mr-1" />
                                        {risk.severity.toUpperCase()}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {/* Risk Score */}
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-muted-foreground">Risk Score</span>
                                            <span className="font-semibold">{risk.score}/100</span>
                                        </div>
                                        <Progress value={risk.score} className={cn("h-2", getRiskColor(risk.score))} />
                                    </div>

                                    {/* Trend Indicator */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <TrendIcon className={cn("h-4 w-4", trendColor)} />
                                        <span className={trendColor}>
                                            {risk.trend === "up" ? "Increasing" : risk.trend === "down" ? "Decreasing" : "Stable"}
                                        </span>
                                    </div>

                                    {/* Expandable Detail */}
                                    {selectedCategory === risk.category && (
                                        <div className="pt-2 border-t space-y-2">
                                            <div className="text-xs">
                                                <div className="font-medium mb-1">Description</div>
                                                <div className="text-muted-foreground">{risk.description}</div>
                                            </div>
                                            <div className="text-xs">
                                                <div className="font-medium mb-1">Impact</div>
                                                <div className="text-muted-foreground">{risk.impact}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* AI Insights */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2 text-blue-900">
                        <Zap className="h-4 w-4" />
                        AI-Powered Insights
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5 text-orange-600" />
                        <div>
                            <div className="font-medium">Action Required: Labor Resources</div>
                            <div className="text-muted-foreground text-xs">
                                Critical shortage detected. Consider engaging backup subcontractors or adjusting schedule by 2 weeks.
                            </div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 mt-0.5 text-blue-600" />
                        <div>
                            <div className="font-medium">Opportunity: Budget Surplus</div>
                            <div className="text-muted-foreground text-xs">
                                3.2% under budget. Potential to accelerate closeout or upgrade finishes.
                            </div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 mt-0.5 text-yellow-600" />
                        <div>
                            <div className="font-medium">Weather Forecast Integration</div>
                            <div className="text-muted-foreground text-xs">
                                Rain predicted for next 5 days. Consider rescheduling exterior work to avoid delays.
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
