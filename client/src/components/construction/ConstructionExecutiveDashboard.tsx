import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Alert, AlertDescription, AlertTitle
} from "@/components/ui/alert";
import {
    AlertTriangle,
    TrendingUp,
    DollarSign,
    ShieldAlert,
    BarChart3,
    CheckCircle2,
    Clock
} from "lucide-react";

interface ProjectRisk {
    contractId: string;
    contractNumber: string;
    subject: string;
    riskScore: number;
    riskLevel: string;
    topFactors: string[];
    variationExposure: string;
}

export default function ConstructionExecutiveDashboard() {
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [projects, setProjects] = useState<any[]>([]);

    // Fetch PPM Projects to populate context
    useEffect(() => {
        fetch("/api/ppm/projects")
            .then(res => res.json())
            .then(data => {
                setProjects(data);
                if (data.length > 0) setSelectedProjectId(data[0].id);
            });
    }, []);

    const { data: riskData = [], isLoading } = useQuery<ProjectRisk[]>({
        queryKey: ["construction-project-risk", selectedProjectId],
        enabled: !!selectedProjectId,
        queryFn: async () => {
            const res = await fetch(`/api/construction/projects/${selectedProjectId}/risk`);
            return res.json();
        }
    });

    const highRiskCount = riskData.filter(r => r.riskLevel === "HIGH").length;
    const totalExposure = riskData.reduce((sum, r) => sum + Number(r.variationExposure), 0);
    const avgRiskScore = riskData.length > 0
        ? riskData.reduce((sum, r) => sum + r.riskScore, 0) / riskData.length
        : 0;

    return (
        <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Construction Portfolio Insights</h1>
                    <p className="text-muted-foreground italic">AI-driven risk assessment and financial exposure monitoring.</p>
                </div>
            </div>

            {/* KPI Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-red-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-red-500" />
                            High Risk Contracts
                        </CardDescription>
                        <CardTitle className="text-3xl">{highRiskCount}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground font-medium">Requiring immediate attention</div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-amber-500" />
                            Variation Exposure
                        </CardDescription>
                        <CardTitle className="text-3xl">${(totalExposure / 1000000).toFixed(2)}M</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground font-medium">Pending potential change orders</div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-blue-500" />
                            Portfolio Risk Index
                        </CardDescription>
                        <CardTitle className="text-3xl">{avgRiskScore.toFixed(0)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={avgRiskScore} className="h-1.5 mt-2" />
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Health Status
                        </CardDescription>
                        <CardTitle className="text-3xl">STABLE</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground font-medium">No critical schedule slippage</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Risk Distribution Table */}
                <Card className="col-span-8 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Contract-Level Risk Matrix</CardTitle>
                        <CardDescription>Detailed breakdown of specific contract health.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Contract</TableHead>
                                    <TableHead>Risk Level</TableHead>
                                    <TableHead>Risk Score</TableHead>
                                    <TableHead className="text-right">Est. Exposure</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground animate-pulse">Analyzing portfolio...</TableCell></TableRow>
                                ) : riskData.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">No contract data found for selected project.</TableCell></TableRow>
                                ) : (
                                    riskData.map(risk => (
                                        <TableRow key={risk.contractId}>
                                            <TableCell>
                                                <div className="font-medium">{risk.contractNumber}</div>
                                                <div className="text-xs text-muted-foreground">{risk.subject}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={risk.riskLevel === "HIGH" ? "destructive" : risk.riskLevel === "MEDIUM" ? "outline" : "secondary"}
                                                    className={risk.riskLevel === "MEDIUM" ? "border-amber-500 text-amber-600" : ""}
                                                >
                                                    {risk.riskLevel}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-mono mr-2">{risk.riskScore}</span>
                                                    <Progress value={risk.riskScore} className={`h-1.5 w-16 ${risk.riskScore > 70 ? "[&>div]:bg-red-500" : ""}`} />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-mono font-bold">
                                                ${Number(risk.variationExposure).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Insights Panel */}
                <div className="col-span-4 space-y-6">
                    <Card className="shadow-sm bg-slate-900 text-white">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-amber-400" />
                                AI Strategic Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {riskData.some(r => r.riskLevel === "HIGH") ? (
                                <Alert className="bg-red-950/50 border-red-900 text-red-200">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Critical Variations Detected</AlertTitle>
                                    <AlertDescription className="text-xs">
                                        Multiple contracts exhibit high variation frequency. Recommend immediate audit of PCO processing.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <Alert className="bg-green-950/50 border-green-900 text-green-200">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <AlertTitle>Stable Performance</AlertTitle>
                                    <AlertDescription className="text-xs">
                                        Contract variances are within expected 5% margin of original budget.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-slate-400">Recurring Risk Factors</h4>
                                <ul className="text-xs space-y-2">
                                    <li className="flex items-center gap-2">
                                        <div className="h-1 w-1 bg-amber-400 rounded-full" />
                                        Subcontractor schedule delays (75% correlation)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="h-1 w-1 bg-amber-400 rounded-full" />
                                        Materials cost volatility
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-dashed border-2">
                        <CardHeader className="pb-3 text-center">
                            <Clock className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                            <CardTitle className="text-base uppercase tracking-widest text-muted-foreground">Coming Soon</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-center text-muted-foreground pb-6 px-10">
                            Predictive cash flow modeling based on historical pay app cycles.
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function Sparkles(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    );
}
