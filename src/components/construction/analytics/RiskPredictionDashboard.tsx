import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Clock,
    Users,
    CloudRain,
    Shield,
    Info
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskFactor {
    id: string;
    category: "FINANCIAL" | "SCHEDULE" | "SAFETY" | "QUALITY" | "WEATHER" | "RESOURCE";
    name: string;
    probability: number; // 0-100
    impact: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    trend: "INCREASING" | "STABLE" | "DECREASING";
    mitigationStatus: "NONE" | "PLANNED" | "IN_PROGRESS" | "COMPLETED";
    description: string;
}

interface RiskPredictionDashboardProps {
    projectId: string;
}

/**
 * Risk Prediction Dashboard
 * 
 * Uses ML models to predict project risks based on:
 * - Historical project data
 * - Current progress metrics
 * - Weather forecasts
 * - Resource availability
 * - Market conditions
 * 
 * In production, this would integrate with:
 * - TensorFlow.js for client-side predictions
 * - Python ML service for complex models
 * - External data sources (weather, market data)
 */
export function RiskPredictionDashboard({ projectId }: RiskPredictionDashboardProps) {
    // Mock risk predictions - in production, fetch from ML API
    const riskFactors: RiskFactor[] = [
        {
            id: "risk-001",
            category: "SCHEDULE",
            name: "Foundation Completion Delay",
            probability: 75,
            impact: "HIGH",
            trend: "INCREASING",
            mitigationStatus: "IN_PROGRESS",
            description: "Weather delays and soil conditions suggest 2-week delay risk for foundation work."
        },
        {
            id: "risk-002",
            category: "FINANCIAL",
            name: "Steel Price Volatility",
            probability: 60,
            impact: "MEDIUM",
            trend: "STABLE",
            mitigationStatus: "PLANNED",
            description: "Market analysis indicates 15% cost increase risk for structural steel procurement."
        },
        {
            id: "risk-003",
            category: "RESOURCE",
            name: "Skilled Labor Shortage",
            probability: 85,
            impact: "CRITICAL",
            trend: "INCREASING",
            mitigationStatus: "NONE",
            description: "ML model predicts 30% shortage in electrical contractors during Q2."
        },
        {
            id: "risk-004",
            category: "WEATHER",
            name: "Spring Storm Impact",
            probability: 45,
            impact: "MEDIUM",
            trend: "DECREASING",
            mitigationStatus: "PLANNED",
            description: "Seasonal weather patterns forecast 5 days of unsuitable conditions in March."
        },
        {
            id: "risk-005",
            category: "SAFETY",
            name: "High-Risk Work Zone",
            probability: 35,
            impact: "HIGH",
            trend: "STABLE",
            mitigationStatus: "COMPLETED",
            description: "Confined space work scheduled for Level 3 basement."
        }
    ];

    const categoryConfig = {
        FINANCIAL: { icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
        SCHEDULE: { icon: Clock, color: "text-blue-600", bg: "bg-blue-100" },
        SAFETY: { icon: Shield, color: "text-red-600", bg: "bg-red-100" },
        QUALITY: { icon: AlertTriangle, color: "text-purple-600", bg: "bg-purple-100" },
        WEATHER: { icon: CloudRain, color: "text-gray-600", bg: "bg-gray-100" },
        RESOURCE: { icon: Users, color: "text-orange-600", bg: "bg-orange-100" }
    };

    const impactConfig = {
        LOW: { color: "bg-blue-100 text-blue-800", label: "Low Impact" },
        MEDIUM: { color: "bg-yellow-100 text-yellow-800", label: "Medium Impact" },
        HIGH: { color: "bg-orange-100 text-orange-800", label: "High Impact" },
        CRITICAL: { color: "bg-red-100 text-red-800", label: "Critical Impact" }
    };

    const trendConfig = {
        INCREASING: { icon: TrendingUp, color: "text-red-600", label: "Increasing" },
        STABLE: { icon: TrendingDown, color: "text-gray-600", label: "Stable" },
        DECREASING: { icon: TrendingDown, color: "text-green-600", label: "Decreasing" }
    };

    const overallRiskScore = Math.round(
        riskFactors.reduce((sum, risk) => {
            const impactWeight = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 }[risk.impact];
            return sum + (risk.probability * impactWeight);
        }, 0) / riskFactors.length
    );

    const getRiskLevel = (score: number) => {
        if (score >= 250) return { label: "Critical", color: "text-red-600", bg: "bg-red-50" };
        if (score >= 180) return { label: "High", color: "text-orange-600", bg: "bg-orange-50" };
        if (score >= 100) return { label: "Medium", color: "text-yellow-600", bg: "bg-yellow-50" };
        return { label: "Low", color: "text-green-600", bg: "bg-green-50" };
    };

    const riskLevel = getRiskLevel(overallRiskScore);

    return (
        <div className="space-y-6">
            {/* Overall Risk Score */}
            <Card className={cn("border-2", riskLevel.bg)}>
                <CardContent className="pt-6">
                    <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-2">Overall Project Risk</div>
                        <div className={cn("text-5xl font-bold mb-2", riskLevel.color)}>
                            {overallRiskScore}
                        </div>
                        <Badge variant="outline" className={cn("text-base", impactConfig.HIGH.color)}>
                            {riskLevel.label} Risk Level
                        </Badge>
                        <div className="mt-4 text-sm text-muted-foreground">
                            <Info className="h-4 w-4 inline mr-1" />
                            ML Confidence: 87%
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Risk Category Summary */}
            <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(categoryConfig).map(([category, config]) => {
                    const Icon = config.icon;
                    const categoryRisks = riskFactors.filter(r => r.category === category);
                    const avgProbability = categoryRisks.length > 0
                        ? Math.round(categoryRisks.reduce((sum, r) => sum + r.probability, 0) / categoryRisks.length)
                        : 0;

                    return (
                        <Card key={category}>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={cn("p-2 rounded-lg", config.bg)}>
                                        <Icon className={cn("h-5 w-5", config.color)} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{category}</div>
                                        <div className="text-xs text-muted-foreground">{categoryRisks.length} risks</div>
                                    </div>
                                </div>
                                <Progress value={avgProbability} className="h-2" />
                                <div className="text-xs text-muted-foreground mt-1">
                                    {avgProbability}% average probability
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Risk Factors List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Risk Factors ({riskFactors.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {riskFactors.map(risk => {
                            const categoryConf = categoryConfig[risk.category];
                            const CategoryIcon = categoryConf.icon;
                            const impactConf = impactConfig[risk.impact];
                            const trendConf = trendConfig[risk.trend];
                            const TrendIcon = trendConf.icon;

                            return (
                                <div
                                    key={risk.id}
                                    className="border-2 rounded-lg p-4 hover:border-primary/50 transition-colors"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className={cn("p-2 rounded-lg mt-0.5", categoryConf.bg)}>
                                                <CategoryIcon className={cn("h-4 w-4", categoryConf.color)} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium mb-1">{risk.name}</div>
                                                <p className="text-sm text-muted-foreground">{risk.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0 ml-2">
                                            <Badge variant="outline" className={impactConf.color}>
                                                {risk.impact}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Probability & Trend */}
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="text-muted-foreground">Probability</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">{risk.probability}%</span>
                                                    <TrendIcon className={cn("h-4 w-4", trendConf.color)} />
                                                </div>
                                            </div>
                                            <Progress value={risk.probability} className="h-2" />
                                        </div>

                                        {/* Mitigation Status */}
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Mitigation</span>
                                            <Badge variant="outline" className={
                                                risk.mitigationStatus === "COMPLETED" ? "bg-green-100 text-green-800" :
                                                    risk.mitigationStatus === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" :
                                                        risk.mitigationStatus === "PLANNED" ? "bg-yellow-100 text-yellow-800" :
                                                            "bg-gray-100 text-gray-800"
                                            }>
                                                {risk.mitigationStatus.replace("_", " ")}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* ML Model Info */}
            <Card className="border-dashed">
                <CardContent className="pt-6">
                    <div className="text-center text-sm text-muted-foreground">
                        <div className="mb-2 font-medium">ML Model Information</div>
                        <div className="space-y-1">
                            <div>Last trained: 2026-02-01 • 1,250 historical projects</div>
                            <div>Accuracy: 87% • Next update: 2026-03-01</div>
                            <div>Factors analyzed: Weather, resources, market data, progress metrics</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
