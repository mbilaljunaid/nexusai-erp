import React from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, ArrowRight, CheckCircle2, CircleDashed } from "lucide-react";

export default function GoalCascadeTree() {

    return (
        <StandardPage title="Goal Alignment & Cascade">
            <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">Visualize how individual objectives directly support departmental and corporate initiatives.</p>
                <div className="text-sm font-medium border px-3 py-1 rounded-full text-muted-foreground bg-muted/20">Fiscal Year 2026</div>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border overflow-hidden relative">

                {/* Corporate Node */}
                <div className="flex justify-center mb-12">
                    <div className="w-[400px] border rounded-lg p-4 bg-background shadow-sm relative z-10 text-center">
                        <Badge className="mb-2 bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200">Corporate Goal</Badge>
                        <h3 className="font-bold text-lg">Achieve Enterprise Scalability</h3>
                        <p className="text-sm text-muted-foreground mt-2">Increase system throughput by 300% to support global expansions.</p>
                        <div className="flex items-center justify-center gap-2 mt-4 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 className="h-4 w-4" /> 45% Complete
                        </div>
                    </div>
                </div>

                {/* Vertical Line Drop (CSS hack for visual cascade) */}
                <div className="absolute top-[140px] left-1/2 w-px h-12 bg-border z-0 -translate-x-1/2"></div>
                <div className="absolute top-[188px] left-[25%] right-[25%] h-px bg-border z-0"></div>
                <div className="absolute top-[188px] left-[25%] w-px h-8 bg-border z-0"></div>
                <div className="absolute top-[188px] right-[25%] w-px h-8 bg-border z-0"></div>

                {/* Department Level */}
                <div className="flex justify-between max-w-4xl mx-auto px-4 relative z-10 mb-12">
                    <div className="w-[300px] border rounded-lg p-4 bg-background shadow-sm text-center">
                        <Badge className="mb-2 bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200">Department Goal</Badge>
                        <h3 className="font-bold">Migrate to Microservices</h3>
                        <p className="text-sm text-muted-foreground mt-2">Break down monolithic HR/WFM logic into distributed APIs.</p>
                        <div className="flex items-center justify-center gap-2 mt-4 text-xs font-semibold text-amber-600">
                            <CircleDashed className="h-4 w-4" /> 20% Complete
                        </div>
                    </div>
                    <div className="w-[300px] border rounded-lg p-4 bg-background shadow-sm text-center opacity-70">
                        <Badge className="mb-2 bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200">Department Goal</Badge>
                        <h3 className="font-bold">Expand Data Center Footprint</h3>
                        <p className="text-sm text-muted-foreground mt-2">Provision APAC and EMEA regional compute clusters.</p>
                        <div className="flex items-center justify-center gap-2 mt-4 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 className="h-4 w-4" /> 80% Complete
                        </div>
                    </div>
                </div>

                {/* Vertical Line Drop */}
                <div className="absolute top-[370px] left-[25%] w-px h-12 bg-border z-0"></div>

                {/* Individual Level */}
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <div className="w-[300px] border-2 border-primary rounded-lg p-4 bg-primary/5 shadow-sm">
                        <Badge className="mb-2 border-primary">My Individual Goal</Badge>
                        <h3 className="font-bold">Containerize Scheduling Engine</h3>
                        <p className="text-sm text-muted-foreground mt-2">Dockerize the AIScheduleOptimizer and deploy via Kubernetes.</p>
                        <div className="flex gap-2 items-center mt-4">
                            <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[65%]"></div>
                            </div>
                            <span className="text-xs font-bold w-10 text-right">65%</span>
                        </div>
                    </div>
                </div>

            </div>
        </StandardPage>
    );
}
