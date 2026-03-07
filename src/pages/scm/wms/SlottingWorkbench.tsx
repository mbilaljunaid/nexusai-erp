import { cn } from "@/lib/utils";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Brain,
    Move,
    Map,
    TrendingUp,
    Zap,
    ArrowRightLeft,
    CheckCircle2,
    Settings
} from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";

export default function SlottingWorkbench() {
    return (
        <StandardPage
            title="Slotting Workbench"
            description="AI-driven inventory placement optimization to minimize travel distance and maximize throughput."
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="w-5 h-5 text-purple-400" />
                                Smart Optimization Suggestions
                            </CardTitle>
                            <CardDescription>AI recommendations for SKU relocation based on velocity</CardDescription>
                        </div>
                        <Button className="bg-purple-600 hover:bg-purple-500">
                            Run Optimization Engine
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { item: 'SKU-7708 - Industrial Bearing', current: 'Z-04-12 (Back)', recommended: 'A-01-05 (Front)', reason: 'High Velocity (A-M-C Rank A)', benefit: '85% travel red.' },
                                { item: 'SKU-1022 - Copper Wiring', current: 'A-01-02 (Front)', recommended: 'C-12-08 (Bulk)', reason: 'Seasonal Slowdown (Rank C)', benefit: 'Space opt.' },
                                { item: 'SKU-8821 - Hydraulic Fluid', current: 'Mixed-01', recommended: 'HAZMAT-04', reason: 'Safety Compliance Flag', benefit: 'Risk mitigation' },
                            ].map((rec, i) => (
                                <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-white">{rec.item}</h4>
                                            <Badge variant="outline" className="text-[10px] uppercase border-purple-500/20 text-purple-400">{rec.reason}</Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-muted-foreground">{rec.current}</span>
                                            <ArrowRightLeft className="w-4 h-4 text-purple-400" />
                                            <span className="text-green-400 font-mono">{rec.recommended}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">Expected Benefit: <span className="text-white">{rec.benefit}</span></p>
                                    </div>
                                    <Button className="ml-4 bg-slate-900 border border-slate-800 hover:bg-purple-900/40 text-xs py-1 h-8">
                                        Generate Move Task
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader>
                            <CardTitle>Warehouse Heatmap</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="aspect-square bg-slate-950 rounded-lg border border-slate-800 p-4 grid grid-cols-5 grid-rows-5 gap-1">
                                {Array.from({ length: 25 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(`rounded-sm ${i === 2 || i === 7 || i === 12 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : i % 3 === 0 ? 'bg-orange-500/50' : 'bg-blue-500/10'}`)}
                                        title={`Sector ${i + 1}: ${i === 2 ? 'Congested' : 'Clear'}`}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between items-center mt-4 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                <span>Low Activity</span>
                                <div className="flex-1 mx-4 h-1 bg-gradient-to-r from-blue-500 via-orange-500 to-red-500 rounded" />
                                <span>High Traffic</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-sm">Efficiency Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground/70">Golden Zone Occupancy</span>
                                <span className="text-white font-bold">72%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <Progress value={72} className="h-full" indicatorClassName="bg-purple-500" />
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground/70">Honeycombing Index</span>
                                <span className="text-white font-bold">14.2%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <Progress value={14} className="h-full" indicatorClassName="bg-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
