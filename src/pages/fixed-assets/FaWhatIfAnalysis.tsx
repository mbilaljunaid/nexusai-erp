import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/formatters";
import {
    Play, RefreshCw, TrendingDown, BarChart3, Calculator, Info
} from "lucide-react";

interface ProjectionPeriod {
    period: string;
    openingNbv: number;
    depreciationPtd: number;
    closingNbv: number;
    accumulatedDeprn: number;
}

const DEPRN_METHODS = [
    { value: "STLN", label: "Straight-Line (STLN)" },
    { value: "DB150", label: "Declining Balance 150%" },
    { value: "DB200", label: "Declining Balance 200% / DDB" },
    { value: "SYD", label: "Sum-of-Years Digits" },
];

const MOCK_ASSETS = [
    { id: "FA-00892", label: "FA-00892 — Dell PowerEdge Server", cost: 18500, nbv: 12333, remainingLife: 38, method: "STLN" },
    { id: "FA-00844", label: "FA-00844 — CNC Machining Centre", cost: 87500, nbv: 52500, remainingLife: 42, method: "DB150" },
    { id: "FA-00820", label: "FA-00820 — Photolithography Machine", cost: 320000, nbv: 213333, remainingLife: 72, method: "DB200" },
    { id: "FA-00831", label: "FA-00831 — Delivery Fleet Van #3", cost: 38000, nbv: 19000, remainingLife: 30, method: "STLN" },
];

function computeProjection(nbv: number, cost: number, method: string, lifeMonths: number, periods: number): ProjectionPeriod[] {
    const result: ProjectionPeriod[] = [];
    let openingNbv = nbv;
    const accDeprn0 = cost - nbv;
    let accDeprn = accDeprn0;
    const monthlyRate = method === "STLN" ? (nbv / Math.max(1, lifeMonths)) : 0;
    const annualPct = method === "DB150" ? 1.5 / lifeMonths : method === "DB200" ? 2 / lifeMonths : 0;

    const now = new Date();
    for (let i = 0; i < Math.min(periods, 24); i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const period = `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
        let depn = 0;
        if (method === "STLN") depn = monthlyRate;
        else if (method.startsWith("DB")) depn = openingNbv * annualPct;
        else if (method === "SYD") {
            const rem = lifeMonths - i;
            const sumDigits = (lifeMonths * (lifeMonths + 1)) / 2;
            depn = (rem / sumDigits) * cost;
        }
        depn = Math.min(depn, openingNbv);
        accDeprn += depn;
        const closingNbv = Math.max(0, openingNbv - depn);
        result.push({ period, openingNbv, depreciationPtd: depn, closingNbv, accumulatedDeprn: accDeprn });
        if (closingNbv <= 0) break;
        openingNbv = closingNbv;
    }
    return result;
}

export function FaWhatIfAnalysis() {
    const { toast } = useToast();
    const [selectedAsset, setSelectedAsset] = useState(MOCK_ASSETS[0].id);
    const [scenario1Method, setScenario1Method] = useState("STLN");
    const [scenario1Life, setScenario1Life] = useState("60");
    const [scenario2Method, setScenario2Method] = useState("DB150");
    const [scenario2Life, setScenario2Life] = useState("60");
    const [projectPeriods, setProjectPeriods] = useState("12");
    const [running, setRunning] = useState(false);
    const [projections, setProjections] = useState<{ s1: ProjectionPeriod[]; s2: ProjectionPeriod[] } | null>(null);

    const asset = MOCK_ASSETS.find(a => a.id === selectedAsset)!;

    const handleRun = async () => {
        setRunning(true);
        await new Promise(r => setTimeout(r, 1000));
        const periods = parseInt(projectPeriods) || 12;
        const s1 = computeProjection(asset.nbv, asset.cost, scenario1Method, parseInt(scenario1Life) || 60, periods);
        const s2 = computeProjection(asset.nbv, asset.cost, scenario2Method, parseInt(scenario2Life) || 60, periods);
        setProjections({ s1, s2 });
        setRunning(false);
    };

    const totalDeprn = (rows: ProjectionPeriod[]) => rows.reduce((s, r) => s + r.depreciationPtd, 0);

    return (
        <StandardPage
            title="What-If Depreciation Analysis"
            description="Project and compare future depreciation under alternate methods and useful life scenarios"
        >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Parameters */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-base">Parameters</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="asset-sel">Asset</Label>
                            <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                                <SelectTrigger id="asset-sel" className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {MOCK_ASSETS.map(a => <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="bg-muted/30 rounded p-3 text-xs space-y-1">
                            <p className="font-medium text-foreground mb-2">Current Asset Data</p>
                            <div className="flex justify-between"><span className="text-muted-foreground">Original Cost</span><span>{formatNumber(asset.cost)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Current NBV</span><span className="font-medium">{formatNumber(asset.nbv)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Remaining Life</span><span>{asset.remainingLife} months</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Current Method</span><span className="font-mono">{asset.method}</span></div>
                        </div>

                        <Separator />
                        <p className="text-xs font-medium">Scenario A (Current / Baseline)</p>
                        <div>
                            <Label className="text-xs">Method</Label>
                            <Select value={scenario1Method} onValueChange={setScenario1Method}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {DEPRN_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Useful Life (Months)</Label>
                            <Input type="number" className="mt-1 h-8 text-xs" value={scenario1Life}
                                onChange={e => setScenario1Life(e.target.value)} />
                        </div>

                        <Separator />
                        <p className="text-xs font-medium text-amber-400">Scenario B (Alternate)</p>
                        <div>
                            <Label className="text-xs">Method</Label>
                            <Select value={scenario2Method} onValueChange={setScenario2Method}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {DEPRN_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Useful Life (Months)</Label>
                            <Input type="number" className="mt-1 h-8 text-xs" value={scenario2Life}
                                onChange={e => setScenario2Life(e.target.value)} />
                        </div>

                        <Separator />
                        <div>
                            <Label className="text-xs">Projection Periods</Label>
                            <Select value={projectPeriods} onValueChange={setProjectPeriods}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="6">6 Periods</SelectItem>
                                    <SelectItem value="12">12 Periods</SelectItem>
                                    <SelectItem value="24">24 Periods</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button className="w-full" onClick={handleRun} disabled={running}>
                            {running ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Calculator className="h-4 w-4 mr-2" />}
                            {running ? "Calculating..." : "Run Analysis"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Results */}
                <div className="lg:col-span-3">
                    {!projections ? (
                        <Card className="h-full flex items-center justify-center">
                            <div className="text-center py-16 text-muted-foreground">
                                <BarChart3 className="h-16 w-16 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">Configure parameters and click <strong>Run Analysis</strong></p>
                                <p className="text-xs mt-1">Side-by-side period-by-period comparison will appear here</p>
                            </div>
                        </Card>
                    ) : (
                        <>
                            {/* Summary comparison */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <Card className="border-blue-500/30">
                                    <CardContent className="pt-4 pb-4">
                                        <p className="text-xs text-muted-foreground">Scenario A — Total Depreciation ({projectPeriods}p)</p>
                                        <p className="text-2xl font-bold text-blue-400">{formatNumber(totalDeprn(projections.s1))}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {scenario1Method} / {scenario1Life} mo · Avg: {formatNumber(totalDeprn(projections.s1) / projections.s1.length)}/period
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="border-amber-500/30">
                                    <CardContent className="pt-4 pb-4">
                                        <p className="text-xs text-muted-foreground">Scenario B — Total Depreciation ({projectPeriods}p)</p>
                                        <p className="text-2xl font-bold text-amber-400">{formatNumber(totalDeprn(projections.s2))}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {scenario2Method} / {scenario2Life} mo · Avg: {formatNumber(totalDeprn(projections.s2) / projections.s2.length)}/period
                                        </p>
                                        <Badge className={`mt-1 text-xs ${totalDeprn(projections.s2) > totalDeprn(projections.s1) ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                                            {totalDeprn(projections.s2) > totalDeprn(projections.s1) ? "+" : "-"}
                                            {formatNumber(Math.abs(totalDeprn(projections.s2) - totalDeprn(projections.s1)))} vs Scenario A
                                        </Badge>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Period table */}
                            <Card>
                                <CardContent className="p-0">
                                    <div className="overflow-auto">
                                        <table className="w-full text-xs">
                                            <thead className="border-b border-border bg-muted/20">
                                                <tr>
                                                    <th className="p-3 text-left">Period</th>
                                                    <th className="p-3 text-right text-blue-400">Scenario A — Depreciation</th>
                                                    <th className="p-3 text-right text-blue-400">Closing NBV</th>
                                                    <th className="p-3 text-right text-amber-400">Scenario B — Depreciation</th>
                                                    <th className="p-3 text-right text-amber-400">Closing NBV</th>
                                                    <th className="p-3 text-right text-muted-foreground">Variance</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {projections.s1.map((row, i) => {
                                                    const s2 = projections.s2[i];
                                                    const variance = (s2?.depreciationPtd || 0) - row.depreciationPtd;
                                                    return (
                                                        <tr key={row.period} className="hover:bg-muted/10">
                                                            <td className="p-3 font-medium">{row.period}</td>
                                                            <td className="p-3 text-right text-blue-300">{formatNumber(row.depreciationPtd)}</td>
                                                            <td className="p-3 text-right">{formatNumber(row.closingNbv)}</td>
                                                            <td className="p-3 text-right text-amber-300">{formatNumber(s2?.depreciationPtd || 0)}</td>
                                                            <td className="p-3 text-right">{formatNumber(s2?.closingNbv || 0)}</td>
                                                            <td className="p-3 text-right">
                                                                <span className={variance > 0 ? "text-red-400" : variance < 0 ? "text-green-400" : "text-muted-foreground"}>
                                                                    {variance > 0 ? "+" : ""}{formatNumber(variance)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </StandardPage>
    );
}

export default FaWhatIfAnalysis;
