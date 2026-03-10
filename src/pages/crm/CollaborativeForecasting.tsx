import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Target, Save, CheckCircle, ChevronRight, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { Progress } from "@/components/ui/progress";

interface ForecastNode {
    id: string;
    name: string;
    role: "VP" | "Manager" | "Rep";
    quota: number;
    closedWon: number;
    commit: number;
    bestCase: number;
    pipeline: number;
    managerAdjustment: number | null;
    children?: ForecastNode[];
    isExpanded?: boolean;
}

export default function CollaborativeForecasting() {
    const [period, setPeriod] = useState("Q3_2026");

    // Define the initial rollup structure
    const [forecastData, setForecastData] = useState<ForecastNode[]>([
        {
            id: "NA_SALES",
            name: "North America Sales",
            role: "VP",
            quota: 5000000,
            closedWon: 2100000,
            commit: 3800000,
            bestCase: 4500000,
            pipeline: 8200000,
            managerAdjustment: 4000000, // VP overridden commit
            isExpanded: true,
            children: [
                {
                    id: "ENT_EAST",
                    name: "Enterprise East",
                    role: "Manager",
                    quota: 2500000,
                    closedWon: 1200000,
                    commit: 2000000,
                    bestCase: 2400000,
                    pipeline: 4500000,
                    managerAdjustment: null,
                    isExpanded: true,
                    children: [
                        { id: "REP_01", name: "Sarah Jenkins", role: "Rep", quota: 1500000, closedWon: 900000, commit: 1300000, bestCase: 1600000, pipeline: 2800000, managerAdjustment: null },
                        { id: "REP_02", name: "Michael Ross", role: "Rep", quota: 1000000, closedWon: 300000, commit: 700000, bestCase: 800000, pipeline: 1700000, managerAdjustment: null },
                    ]
                },
                {
                    id: "ENT_WEST",
                    name: "Enterprise West",
                    role: "Manager",
                    quota: 2500000,
                    closedWon: 900000,
                    commit: 1800000,
                    bestCase: 2100000,
                    pipeline: 3700000,
                    managerAdjustment: 1950000, // Manager bumped it up
                    isExpanded: false,
                    children: [
                        { id: "REP_03", name: "David Kim", role: "Rep", quota: 1250000, closedWon: 500000, commit: 900000, bestCase: 1000000, pipeline: 2000000, managerAdjustment: null },
                        { id: "REP_04", name: "Emily Chen", role: "Rep", quota: 1250000, closedWon: 400000, commit: 900000, bestCase: 1100000, pipeline: 1700000, managerAdjustment: null },
                    ]
                }
            ]
        }
    ]);

    const toggleExpand = (nodeId: string, nodes: ForecastNode[]): ForecastNode[] => {
        return nodes.map(node => {
            if (node.id === nodeId) {
                return { ...node, isExpanded: !node.isExpanded };
            }
            if (node.children) {
                return { ...node, children: toggleExpand(nodeId, node.children) };
            }
            return node;
        });
    };

    const handleAdjustmentChange = (nodeId: string, value: string, nodes: ForecastNode[]): ForecastNode[] => {
        return nodes.map(node => {
            if (node.id === nodeId) {
                return { ...node, managerAdjustment: value === "" ? null : Number(value) };
            }
            if (node.children) {
                return { ...node, children: handleAdjustmentChange(nodeId, value, node.children) };
            }
            return node;
        });
    };

    const renderRows = (nodes: ForecastNode[], level: number = 0) => {
        let rows: JSX.Element[] = [];

        nodes.forEach(node => {
            const hasChildren = node.children && node.children.length > 0;
            const appliedCommit = node.managerAdjustment !== null ? node.managerAdjustment : node.commit;
            const attainmentPct = (node.closedWon / node.quota) * 100;
            const projectedPct = (appliedCommit / node.quota) * 100;

            rows.push(
                <TableRow key={node.id} className={level === 0 ? "bg-muted/10 font-medium" : level === 1 ? "bg-muted/5" : ""}>
                    <TableCell className="pl-4">
                        <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
                            {hasChildren ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 mr-1"
                                    onClick={() => setForecastData(toggleExpand(node.id, forecastData))}
                                    title={node.isExpanded ? "Collapse" : "Expand"}
                                >
                                    {node.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </Button>
                            ) : (
                                <span className="w-7 inline-block"></span>
                            )}
                            <div className="flex flex-col">
                                <span className={level === 0 ? "font-bold text-primary" : "font-medium"}>{node.name}</span>
                                <span className="text-[10px] text-muted-foreground uppercase">{node.role}</span>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(node.quota)}</TableCell>
                    <TableCell className="text-right text-emerald-600 font-semibold">{formatCurrency(node.closedWon)}</TableCell>
                    <TableCell className="text-right text-slate-500">{formatCurrency(node.commit)}</TableCell>
                    <TableCell className="text-right">
                        {node.role !== "Rep" ? (
                            <Input
                                type="number"
                                className={`h-8 w-32 text-right ml-auto ${node.managerAdjustment !== null ? 'border-primary bg-primary/5' : ''}`}
                                placeholder="Override..."
                                value={node.managerAdjustment !== null ? node.managerAdjustment : ""}
                                onChange={(e) => setForecastData(handleAdjustmentChange(node.id, e.target.value, forecastData))}
                            />
                        ) : (
                            <span className="text-muted-foreground">-</span>
                        )}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">{formatCurrency(appliedCommit)}</TableCell>
                    <TableCell className="text-right text-purple-600">{formatCurrency(node.bestCase)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatCurrency(node.pipeline)}</TableCell>
                    <TableCell className="w-[150px]">
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px]">
                                <span>{attainmentPct.toFixed(0)}%</span>
                                <span className="text-primary font-medium">{projectedPct.toFixed(0)}% Proj</span>
                            </div>
                            <div className="relative h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="absolute top-0 left-0 h-full bg-emerald-500" style={{ width: `${Math.min(attainmentPct, 100)}%` }}></div>
                                <div className="absolute top-0 h-full bg-primary/30" style={{ left: `${Math.min(attainmentPct, 100)}%`, width: `${Math.min(projectedPct - attainmentPct, 100 - attainmentPct)}%` }}></div>
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            );

            if (node.isExpanded && hasChildren) {
                rows = [...rows, ...renderRows(node.children!, level + 1)];
            }
        });

        return rows;
    };

    const overallNode = forecastData[0];
    const overallAppliedCommit = overallNode.managerAdjustment !== null ? overallNode.managerAdjustment : overallNode.commit;

    return (
        <StandardPage
            title="Collaborative Forecasting"
            description="Multi-level pipeline rollup with manager overrides and commit alignment."
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Sales Ops", href: "/crm/forecast" },
                { label: "Collaborative Rollup" }
            ]}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Save className="h-4 w-4 mr-2" /> Save Draft
                    </Button>
                    <Button>
                        <CheckCircle className="h-4 w-4 mr-2" /> Submit Forecast
                    </Button>
                </div>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="border-l-4 border-l-slate-400">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Global Quota</p>
                        <p className="text-3xl font-black text-slate-700">{formatCurrency(overallNode.quota)}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/50">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-emerald-800 mb-1">Closed Won (YTD)</p>
                        <div className="flex items-baseline justify-between">
                            <p className="text-3xl font-black text-emerald-600">{formatCurrency(overallNode.closedWon)}</p>
                            <Badge className="bg-emerald-200 text-emerald-800 hover:bg-emerald-200 border-none">
                                {((overallNode.closedWon / overallNode.quota) * 100).toFixed(1)}%
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-primary bg-primary/5">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-primary mb-1">Calculated Commit Rollup</p>
                        <p className="text-3xl font-black text-primary">{formatCurrency(overallNode.commit)}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500 bg-purple-50/50">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-purple-800 mb-1">VP Final Judgement</p>
                        <div className="flex items-baseline justify-between">
                            <p className="text-3xl font-black text-purple-700">{formatCurrency(overallAppliedCommit)}</p>
                            <Badge className="bg-purple-200 text-purple-800 hover:bg-purple-200 border-none">
                                {((overallAppliedCommit / overallNode.quota) * 100).toFixed(1)}%
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" /> Forecast Hierarchy Grid
                            </CardTitle>
                            <CardDescription>Adjust and override subordinate commits based on managerial judgement.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="h-9 px-4 text-sm bg-muted/30">
                                Hierarchy: VP → Region → AE
                            </Badge>
                            <Select value={period} onValueChange={setPeriod}>
                                <SelectTrigger className="w-[160px] h-9">
                                    <SelectValue placeholder="Period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Q1_2026">Q1 2026</SelectItem>
                                    <SelectItem value="Q2_2026">Q2 2026</SelectItem>
                                    <SelectItem value="Q3_2026">Q3 2026</SelectItem>
                                    <SelectItem value="Q4_2026">Q4 2026</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="w-[300px]">Organizational Hierarchy</TableHead>
                                <TableHead className="text-right">Quota</TableHead>
                                <TableHead className="text-right text-emerald-600">Closed Won</TableHead>
                                <TableHead className="text-right">Rep/Auto Commit</TableHead>
                                <TableHead className="text-right">Manager Override</TableHead>
                                <TableHead className="text-right font-bold text-primary bg-primary/5">Final Commit</TableHead>
                                <TableHead className="text-right text-purple-600">Best Case</TableHead>
                                <TableHead className="text-right">Total Pipeline</TableHead>
                                <TableHead className="w-[150px]">Attainment Pacing</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {renderRows(forecastData)}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </StandardPage>
    );
}
