import { cn } from "@/lib/utils";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Zap, TrendingDown, ShieldAlert } from "lucide-react";

export function LogisticsInsightsCard() {
    const insights = [
        {
            title: "Consolidation Opportunity",
            description: "3 shipments to Region West can be consolidated into a single TL (Truckload) to save $1,200.",
            type: "OPTIMIZATION",
            icon: Zap,
            color: "text-blue-600",
            bgColor: "bg-blue-500/10"
        },
        {
            title: "Carrier Rate Alert",
            description: "FastWay Freight decreased rates on Lane: CHI-LAX by 8% for the next 48 hours.",
            type: "RATE_SAVING",
            icon: TrendingDown,
            color: "text-emerald-600",
            bgColor: "bg-emerald-500/10"
        },
        {
            title: "SLA Risk High",
            description: "Carrier performance on Route PHX-SEA is trending down. 2 active shipments at risk of delay.",
            type: "EXCEPTION",
            icon: ShieldAlert,
            color: "text-amber-600",
            bgColor: "bg-amber-500/10"
        }
    ];

    return (
        <Card className="border-none shadow-premium bg-gradient-to-br from-indigo-50/50 to-white">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-600" />
                        AI Logistics Insights
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">Derived from real-time carrier and lane performance data.</p>
                </div>
                <Badge variant="premium">Real-time</Badge>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                {insights.map((insight, i) => (
                    <div key={i} className={cn(`p-4 rounded-xl ${insight.bgColor} border border-transparent hover:border-indigo-200 transition-all cursor-pointer group`)}>
                        <div className="flex gap-4">
                            <div className={cn(`p-2 rounded-lg bg-white shadow-sm h-fit ${insight.color}`)}>
                                <insight.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-200">{insight.title}</h4>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    {insight.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                <Button variant="outline" className="w-full text-xs font-bold py-6 border-indigo-100 text-indigo-700 hover:bg-indigo-500/10">
                    View Comprehensive Network Analysis
                </Button>
            </CardContent>
        </Card>
    );
}
