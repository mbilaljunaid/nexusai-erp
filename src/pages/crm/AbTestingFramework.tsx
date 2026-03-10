import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SplitSquareHorizontal, CheckCircle, BarChart2, Eye, MousePointerClick, TrendingUp, AlertCircle, Plus } from "lucide-react";

interface AbTestExperiment {
    id: string;
    name: string;
    status: "RUNNING" | "COMPLETED" | "DRAFT";
    variants: number;
    metric: string;
    significance: number | null;
    winner: string | null;
    startDate: string;
}

export default function AbTestingFramework() {

    const experiments: AbTestExperiment[] = [
        { id: "EXP-101", name: "Q4 Promo Subject Line Opt", status: "RUNNING", variants: 3, metric: "Open Rate", significance: 82.4, winner: null, startDate: "2026-09-08" },
        { id: "EXP-102", name: "Landing Page CTA Button Color", status: "COMPLETED", variants: 2, metric: "Click Rate", significance: 99.1, winner: "Variant B (Green)", startDate: "2026-08-15" },
        { id: "EXP-103", name: "Welcome Email Delay 1hr vs 24hr", status: "COMPLETED", variants: 2, metric: "Conversion", significance: 95.8, winner: "Variant A (1hr)", startDate: "2026-07-20" },
        { id: "EXP-104", name: "Pricing Page Layout Redesign", status: "DRAFT", variants: 3, metric: "Conversion", significance: null, winner: null, startDate: "-" },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "RUNNING": return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none"><BarChart2 className="h-3 w-3 mr-1 animate-pulse" /> Running</Badge>;
            case "COMPLETED": return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none"><CheckCircle className="h-3 w-3 mr-1" /> Conclusive</Badge>;
            case "DRAFT": return <Badge variant="outline" className="text-muted-foreground">Draft</Badge>;
            default: return null;
        }
    };

    return (
        <StandardPage
            title="A/B Testing Framework"
            description="Design split experiments, measure statistical significance, and declare winners natively."
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Marketing", href: "/crm/campaigns" },
                { label: "A/B Testing" }
            ]}
            actions={
                <Button>
                    <Plus className="h-4 w-4 mr-2" /> New Experiment
                </Button>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Active Experiments</p>
                        <p className="text-3xl font-black text-blue-600">3</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-emerald-500">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Conclusive Tests</p>
                        <p className="text-3xl font-black text-emerald-600">14</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Avg. Conversion Lift</p>
                        <p className="text-3xl font-black text-purple-600">+12.4%</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-slate-400">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Avg. Time to Significance</p>
                        <p className="text-3xl font-black text-slate-700">8 Days</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <SplitSquareHorizontal className="h-5 w-5 text-primary" /> Experiment Registry
                                </CardTitle>
                                <CardDescription>Track all historical and active split testing campaigns.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Experiment Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">Variants</TableHead>
                                <TableHead>Primary Metric</TableHead>
                                <TableHead className="text-center">Significance</TableHead>
                                <TableHead>Result / Winner</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {experiments.map(exp => (
                                <TableRow key={exp.id} className="hover:bg-muted/30">
                                    <TableCell>
                                        <p className="font-semibold text-primary">{exp.name}</p>
                                        <p className="text-xs text-muted-foreground">{exp.id} • Started {exp.startDate}</p>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(exp.status)}</TableCell>
                                    <TableCell className="text-center font-medium">{exp.variants}</TableCell>
                                    <TableCell className="text-sm text-slate-600 font-medium">{exp.metric}</TableCell>
                                    <TableCell className="text-center">
                                        {exp.significance !== null ? (
                                            <div className="flex flex-col items-center">
                                                <span className={`text-xs font-bold ${exp.significance > 95 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    {exp.significance.toFixed(1)}%
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">--</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {exp.winner ? (
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                <TrendingUp className="h-3 w-3 mr-1" /> {exp.winner}
                                            </Badge>
                                        ) : exp.status === "RUNNING" ? (
                                            <span className="text-xs text-muted-foreground animate-pulse">Gathering data...</span>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">--</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                <Card className="border shadow-sm border-blue-200">
                    <CardHeader className="bg-blue-50/50 pb-4 border-b">
                        <CardTitle className="text-base flex items-center justify-between">
                            <span className="flex items-center gap-2"><BarChart2 className="h-5 w-5 text-blue-600" /> Live Analysis: EXP-101</span>
                            {getStatusBadge("RUNNING")}
                        </CardTitle>
                        <CardDescription>Q4 Promo Subject Line Opt</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-slate-700">Variant A (Control)</span>
                                <span className="font-bold text-slate-900">22.4% Open</span>
                            </div>
                            <p className="text-xs text-muted-foreground italic">"NexusAI Q4 Feature Release"</p>
                            <Progress value={22.4 * 2} className="h-2 bg-slate-100" indicatorClassName="bg-slate-400" />
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>4,500 sends</span>
                                <span>1,008 opens</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-blue-700 flex items-center gap-1">Variant B <TrendingUp className="h-4 w-4" /></span>
                                <span className="font-bold text-blue-700">28.1% Open</span>
                            </div>
                            <p className="text-xs text-muted-foreground italic">"Unlock 10X Sales with Q4 Release 🚀"</p>
                            <Progress value={28.1 * 2} className="h-2 bg-blue-100" indicatorClassName="bg-blue-500" />
                            <div className="flex justify-between text-[10px] text-blue-700/70">
                                <span>4,500 sends</span>
                                <span>1,264 opens</span>
                            </div>
                        </div>

                        <div className="space-y-2 opacity-60 grayscale">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-slate-700 font-strike">Variant C</span>
                                <span className="font-bold text-slate-900">18.5% Open</span>
                            </div>
                            <p className="text-xs text-muted-foreground italic">"Action Required: Q4 Update"</p>
                            <Progress value={18.5 * 2} className="h-2 bg-slate-100" indicatorClassName="bg-slate-400" />
                        </div>

                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 flex gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-amber-800">Not Statistically Significant Yet</p>
                                <p className="text-xs text-amber-700/80 mt-1">Current confidence level is 82.4%. We recommend waiting until 95% confidence before declaring Variant B the winner.</p>
                            </div>
                        </div>

                        <Button className="w-full" variant="outline">
                            <StopCircle className="h-4 w-4 mr-2" /> Force Stop & Declare Winner
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}

// Temporary Icon patch
function StopCircle(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><rect x="9" y="9" width="6" height="6" /></svg>;
}
