import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp,
    AlertCircle,
    Zap,
    Users
} from "lucide-react";

interface SkillGap {
    skill: string;
    gap: number;
    status: string;
}

interface TeamMetrics {
    headCount: number;
    averageRating: string;
    attritionRisk: string;
    utilization: string;
}

export interface WorkforceAnalyticsCardProps {
    metrics?: TeamMetrics;
    skillGaps?: SkillGap[];
}

export function WorkforceAnalyticsCard({ metrics, skillGaps }: WorkforceAnalyticsCardProps) {
    if (!metrics || !skillGaps) return null;

    return (
        <Card className="border-none shadow-md bg-zinc-900 text-white overflow-hidden">
            <CardHeader className="pb-4 border-b border-white/10">
                <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-teal-400" />
                    Workforce Insights
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {/* Top Metrics Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Attrition Risk</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-none px-2 py-0">
                                {metrics.attritionRisk}
                            </Badge>
                        </div>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Avg Performance</p>
                        <p className="text-xl font-bold text-teal-400">{metrics.averageRating}/5.0</p>
                    </div>
                </div>

                {/* Skill Gaps Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-400" />
                            Capability Gaps
                        </p>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Target vs Actual</span>
                    </div>
                    <div className="space-y-4">
                        {skillGaps.map((gap, i) => (
                            <div key={i} className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-zinc-300">{gap.skill}</span>
                                    <span className={gap.gap > 20 ? "text-red-400 font-medium" : "text-zinc-400 font-medium"}>
                                        {gap.gap}% Gap
                                    </span>
                                </div>
                                <div className="relative pt-1">
                                    <Progress
                                        value={100 - gap.gap}
                                        className="h-1 bg-card/10"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Stats */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-zinc-500">
                    <div className="flex items-center gap-2 text-xs font-medium">
                        <Users className="h-3.5 w-3.5" />
                        <span>Utilization: {metrics.utilization}</span>
                    </div>
                    <AlertCircle className="h-4 w-4 opacity-30" />
                </div>
            </CardContent>
        </Card>
    );
}
