import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, DollarSign, Activity, Package, Clock } from "lucide-react";
import { AnalyticsChart } from '@/components/AnalyticsChart';

interface Props {
    projectId: string;
}

export default function ProjectFinancialDetail({ projectId }: Props) {
    const { data: project, isLoading } = useQuery<any>({
        queryKey: [`/api/ppm/projects/${projectId}`],
    });

    if (isLoading) return <div>Loading project performance...</div>;
    if (!project) return <div>Project not found</div>;

    const { metrics } = project.performance;

    const evMetrics = [
        { label: "Planned Value (PV)", value: metrics.plannedValue, icon: Clock, color: "text-blue-500" },
        { label: "Earned Value (EV)", value: metrics.earnedValue, icon: Activity, color: "text-green-500" },
        { label: "Actual Cost (AC)", value: metrics.actualCost, icon: DollarSign, color: "text-purple-500" },
    ];

    const performanceIndices = [
        { label: "CPI", value: metrics.cpi.toFixed(2), metric: "Cost Performance", status: metrics.cpi >= 1 ? "Under Budget" : "Over Budget", variant: metrics.cpi >= 1 ? "default" : "destructive" },
        { label: "SPI", value: metrics.spi.toFixed(2), metric: "Schedule Performance", status: metrics.spi >= 1 ? "On Schedule" : "Behind Schedule", variant: metrics.spi >= 1 ? "default" : "destructive" },
        { label: "EAC", value: `$${parseFloat(metrics.eac).toLocaleString()}`, metric: "Estimate at Comp.", status: "Forecasted", variant: "secondary" },
    ];

    const chartData = [
        { name: 'PV', value: metrics.plannedValue },
        { name: 'EV', value: metrics.earnedValue },
        { name: 'AC', value: metrics.actualCost },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold">{project.name}</h2>
                    <p className="text-muted-foreground">{project.projectNumber} • {project.projectType}</p>
                </div>
                <Badge variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}>{project.status}</Badge>
            </div>

            {/* EVM Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {evMetrics.map((m, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">{m.label}</CardTitle>
                            <m.icon className={`h-4 w-4 ${m.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">${parseFloat(m.value).toLocaleString()}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Indices */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {performanceIndices.map((p, i) => (
                    <Card key={i}>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center">
                                <span className="text-sm text-muted-foreground mb-1">{p.metric}</span>
                                <span className="text-3xl font-bold mb-2">{p.value}</span>
                                <Badge variant={p.variant as any}>{p.status}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">EVM Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full mt-4">
                            <AnalyticsChart
                                title=""
                                data={chartData}
                                type="bar"
                                dataKey="value"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Project Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Reported Progress</span>
                                <span className="font-semibold">{project.percentComplete}%</span>
                            </div>
                            <Progress value={parseFloat(project.percentComplete || "0")} />
                        </div>
                        <div className="pt-4 space-y-2">
                            <div className="text-sm text-muted-foreground flex justify-between">
                                <span>Budget (BAC)</span>
                                <span>${parseFloat(project.budget || "0").toLocaleString()}</span>
                            </div>
                            <div className="text-sm text-muted-foreground flex justify-between">
                                <span>Estimate to Complete (ETC)</span>
                                <span>${parseFloat(metrics.etc).toLocaleString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
