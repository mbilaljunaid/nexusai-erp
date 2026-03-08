import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/formatters";
import { Play, RefreshCw, Download, BarChart3, TrendingDown } from "lucide-react";

// Oracle FA: Depreciation Projection Report — project future depreciation by period

interface ProjectionRow {
    period: string;
    beginNbv: number;
    depreciationPtd: number;
    endNbv: number;
    accumulatedDeprn: number;
    remainingLife: number;
}

function computeRows(cost: number, nbv: number, method: string, lifeMonths: number, periods: number): ProjectionRow[] {
    const rows: ProjectionRow[] = [];
    let openNbv = nbv;
    let accDeprn = cost - nbv;
    let remaining = lifeMonths;
    const now = new Date();

    for (let i = 0; i < Math.min(periods, 60); i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const period = `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
        if (openNbv <= 0) break;

        let depn = 0;
        if (method === "STLN") {
            depn = cost / lifeMonths;
        } else if (method === "DB150") {
            depn = openNbv * (1.5 / lifeMonths);
        } else if (method === "DB200") {
            depn = openNbv * (2.0 / lifeMonths);
        } else if (method === "SYD") {
            const sumD = (lifeMonths * (lifeMonths + 1)) / 2;
            depn = (remaining / sumD) * cost;
        }
        depn = Math.min(depn, openNbv);
        accDeprn += depn;
        const endNbv = Math.max(0, openNbv - depn);
        rows.push({ period, beginNbv: openNbv, depreciationPtd: depn, endNbv, accumulatedDeprn: accDeprn, remainingLife: Math.max(0, remaining - 1) });
        openNbv = endNbv;
        remaining = Math.max(0, remaining - 1);
    }
    return rows;
}

const ASSETS = [
    { id: "1", label: "FA-00892 — Dell Server", cost: 18500, nbv: 12333, method: "STLN", lifeMonths: 60 },
    { id: "2", label: "FA-00844 — CNC Machining", cost: 87500, nbv: 52500, method: "DB150", lifeMonths: 84 },
    { id: "3", label: "FA-00820 — Photolithography", cost: 320000, nbv: 213333, method: "DB200", lifeMonths: 96 },
    { id: "ALL", label: "— All Assets (Aggregate) —", cost: 0, nbv: 0, method: "STLN", lifeMonths: 60 },
];

export function FaDepreciationProjection() {
    const { toast } = useToast();
    const [assetId, setAssetId] = useState("1");
    const [periods, setPeriods] = useState("12");
    const [rows, setRows] = useState<ProjectionRow[]>([]);
    const [running, setRunning] = useState(false);

    const asset = ASSETS.find(a => a.id === assetId)!;

    const handleRun = async () => {
        setRunning(true);
        await new Promise(r => setTimeout(r, 800));
        const result = computeRows(asset.cost, asset.nbv, asset.method, asset.lifeMonths, parseInt(periods) || 12);
        setRows(result);
        setRunning(false);
    };

    const totalDeprn = rows.reduce((s, r) => s + r.depreciationPtd, 0);

    return (
        <StandardPage
            title="Depreciation Projection"
            description="Project future period-by-period depreciation schedules for fixed assets"
            actions={
                rows.length > 0 && (
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />Export CSV
                    </Button>
                )
            }
        >
            <Card className="mb-4">
                <CardContent className="pt-4 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-2">
                            <Label htmlFor="asset-sel" className="text-xs">Asset</Label>
                            <Select value={assetId} onValueChange={setAssetId}>
                                <SelectTrigger id="asset-sel" className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {ASSETS.map(a => <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="periods" className="text-xs">Number of Periods</Label>
                            <Select value={periods} onValueChange={setPeriods}>
                                <SelectTrigger id="periods" className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {["6", "12", "24", "36", "60"].map(p => <SelectItem key={p} value={p}>{p} Periods</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleRun} disabled={running || assetId === "ALL"} className="h-8">
                            {running ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                            {running ? "Running..." : "Run Projection"}
                        </Button>
                    </div>
                    {assetId !== "ALL" && asset.cost > 0 && (
                        <div className="grid grid-cols-4 gap-3 mt-4 text-xs">
                            {[
                                { label: "Original Cost", value: formatNumber(asset.cost) },
                                { label: "Current NBV", value: formatNumber(asset.nbv) },
                                { label: "Method", value: asset.method },
                                { label: "Life (Months)", value: asset.lifeMonths.toString() },
                            ].map(m => (
                                <div key={m.label} className="bg-muted/30 rounded p-2">
                                    <p className="text-muted-foreground">{m.label}</p>
                                    <p className="font-medium font-mono">{m.value}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {rows.length === 0 ? (
                <Card className="flex items-center justify-center">
                    <div className="text-center py-16 text-muted-foreground">
                        <TrendingDown className="h-14 w-14 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Select an asset and click Run Projection</p>
                    </div>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        {[
                            { label: "Total Projected Depreciation", value: formatNumber(totalDeprn), color: "text-blue-400" },
                            { label: "Ending NBV", value: formatNumber(rows[rows.length - 1]?.endNbv ?? 0), color: "text-green-400" },
                            { label: "Remaining Life (end)", value: `${rows[rows.length - 1]?.remainingLife ?? 0} months`, color: "text-muted-foreground" },
                        ].map(m => (
                            <Card key={m.label}>
                                <CardContent className="pt-4 pb-4">
                                    <p className="text-xs text-muted-foreground">{m.label}</p>
                                    <p className={`text-xl font-bold ${m.color} mt-1`}>{m.value}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead className="border-b border-border bg-muted/20 text-muted-foreground">
                                    <tr>
                                        <th className="p-3 text-left">Period</th>
                                        <th className="p-3 text-right">Begin NBV</th>
                                        <th className="p-3 text-right">Depreciation</th>
                                        <th className="p-3 text-right">End NBV</th>
                                        <th className="p-3 text-right">Accum Deprn</th>
                                        <th className="p-3 text-right">Remaining Life</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {rows.map((r, i) => (
                                        <tr key={i} className="hover:bg-muted/10">
                                            <td className="p-3 font-medium">{r.period}</td>
                                            <td className="p-3 text-right">{formatNumber(r.beginNbv)}</td>
                                            <td className="p-3 text-right text-blue-300 font-medium">({formatNumber(r.depreciationPtd)})</td>
                                            <td className="p-3 text-right font-medium">{formatNumber(r.endNbv)}</td>
                                            <td className="p-3 text-right text-muted-foreground">{formatNumber(r.accumulatedDeprn)}</td>
                                            <td className="p-3 text-right text-muted-foreground">{r.remainingLife} mo</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t border-border bg-muted/10">
                                    <tr>
                                        <td className="p-3 font-semibold" colSpan={2}>Total</td>
                                        <td className="p-3 text-right font-bold text-blue-300">({formatNumber(totalDeprn)})</td>
                                        <td colSpan={3}></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </CardContent>
                    </Card>
                </>
            )}
        </StandardPage>
    );
}

export default FaDepreciationProjection;
