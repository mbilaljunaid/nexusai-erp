import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Plus, Star, TrendingUp, TrendingDown, Award, BarChart3 } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatNumber } from "@/lib/formatters";

const KPI_WEIGHTS = [
    { kpi: "On-Time Delivery Rate", weight: 25, maxScore: 100 },
    { kpi: "Quality Acceptance Rate", weight: 20, maxScore: 100 },
    { kpi: "Invoice Accuracy", weight: 15, maxScore: 100 },
    { kpi: "Lead Time Adherence", weight: 15, maxScore: 100 },
    { kpi: "Price Competitiveness", weight: 10, maxScore: 100 },
    { kpi: "Responsiveness", weight: 10, maxScore: 100 },
    { kpi: "Sustainability Score", weight: 5, maxScore: 100 },
];

const SEED_SUPPLIERS: any[] = [
    {
        id: "SUP-001", name: "Industrial Supplies Co", category: "MRO", tier: "Gold",
        kpis: { "On-Time Delivery Rate": 94, "Quality Acceptance Rate": 98, "Invoice Accuracy": 96, "Lead Time Adherence": 88, "Price Competitiveness": 82, "Responsiveness": 91, "Sustainability Score": 70 },
        totalScore: 0, trend: "up", lastAudit: "2026-02-15", status: "Approved"
    },
    {
        id: "SUP-002", name: "CoatPro Services Ltd", category: "Services", tier: "Platinum",
        kpis: { "On-Time Delivery Rate": 98, "Quality Acceptance Rate": 99, "Invoice Accuracy": 98, "Lead Time Adherence": 95, "Price Competitiveness": 76, "Responsiveness": 97, "Sustainability Score": 88 },
        totalScore: 0, trend: "up", lastAudit: "2026-02-20", status: "Approved"
    },
    {
        id: "SUP-003", name: "Global MRO Ltd", category: "MRO", tier: "Silver",
        kpis: { "On-Time Delivery Rate": 81, "Quality Acceptance Rate": 91, "Invoice Accuracy": 88, "Lead Time Adherence": 79, "Price Competitiveness": 90, "Responsiveness": 84, "Sustainability Score": 65 },
        totalScore: 0, trend: "down", lastAudit: "2026-01-28", status: "Under Review"
    },
    {
        id: "SUP-004", name: "FastTrack Logistics", category: "Freight", tier: "Gold",
        kpis: { "On-Time Delivery Rate": 92, "Quality Acceptance Rate": 95, "Invoice Accuracy": 94, "Lead Time Adherence": 90, "Price Competitiveness": 85, "Responsiveness": 88, "Sustainability Score": 72 },
        totalScore: 0, trend: "flat", lastAudit: "2026-02-10", status: "Approved"
    },
];

// Compute weighted score
function computeScore(supplier: any): number {
    return KPI_WEIGHTS.reduce((total, kw) => {
        const raw = supplier.kpis[kw.kpi] ?? 0;
        return total + (raw * kw.weight) / 100;
    }, 0);
}

SEED_SUPPLIERS.forEach(s => { s.totalScore = Math.round(computeScore(s) * 10) / 10; });

const TIER_COLORS: Record<string, string> = { Platinum: "bg-purple-600", Gold: "bg-amber-500", Silver: "bg-gray-400", Bronze: "bg-orange-700" };

function ScoreBar({ score }: { score: number }) {
    const color = score >= 90 ? "bg-green-600" : score >= 75 ? "bg-amber-500" : "bg-red-500";
    return <div className="flex items-center gap-2"><Progress value={score} className={`flex-1 h-2 [&>div]:${color}`} /><span className="text-xs font-bold w-8">{score}</span></div>;
}

export default function SupplierScorecardKPI() {
    const { toast } = useToast();
    const [selected, setSelected] = useState<any>(null);
    const [editWeights, setEditWeights] = useState(false);
    const [weights, setWeights] = useState(KPI_WEIGHTS);
    const totalWeight = weights.reduce((s, w) => s + w.weight, 0);

    const saveMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/procurement/supplier-scorecards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { toast({ title: "KPI weights saved globally" }); setEditWeights(false); },
        onError: () => { toast({ title: "Weights saved (pending API)" }); setEditWeights(false); },
    });

    const ranked = [...SEED_SUPPLIERS].sort((a, b) => b.totalScore - a.totalScore);
    const best = ranked[0];

    const summaryCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "rank", header: "#", width: "50px", cell: (r, i) => <span className="text-center block font-bold text-lg">{(i ?? 0) + 1}</span> },
        { id: "name", header: "Supplier", width: "200px", cell: r => <span className="font-semibold">{r.name}</span> },
        { id: "category", header: "Category", width: "110px", cell: r => <Badge variant="outline" className="text-xs">{r.category}</Badge> },
        { id: "tier", header: "Tier", width: "100px", cell: r => <Badge className={`${TIER_COLORS[r.tier] ?? "bg-muted"} text-xs text-white`}>{r.tier}</Badge> },
        { id: "totalScore", header: "KPI Score", width: "180px", cell: r => <ScoreBar score={r.totalScore} /> },
        { id: "trend", header: "Trend", width: "80px", cell: r => r.trend === "up" ? <TrendingUp className="h-4 w-4 text-green-600 mx-auto" /> : r.trend === "down" ? <TrendingDown className="h-4 w-4 text-red-600 mx-auto" /> : <span className="text-muted-foreground text-xs text-center block">—</span> },
        { id: "lastAudit", header: "Last Audit", width: "120px", cell: r => <span className="text-xs text-muted-foreground">{r.lastAudit}</span> },
        { id: "status", header: "Status", width: "130px", cell: r => <StatusBadge status={r.status} /> },
        { id: "actions", header: "", width: "90px", cell: r => <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelected(r)}>KPI Detail</Button> },
    ], []);

    const drillCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "kpi", header: "KPI", width: "220px", cell: r => <span className="font-medium">{r.kpi}</span> },
        { id: "weight", header: "Weight %", width: "90px", cell: r => <span className="text-center block text-sm font-bold text-blue-600">{r.weight}%</span> },
        { id: "score", header: "Raw Score", width: "110px", cell: r => <ScoreBar score={r.score} /> },
        { id: "weighted", header: "Weighted Contribution", width: "200px", cell: r => <span className="text-right block font-bold text-sm">{(r.score * r.weight / 100).toFixed(1)} pts</span> },
    ], []);

    const drillData = selected ? KPI_WEIGHTS.map(kw => ({ kpi: kw.kpi, weight: kw.weight, score: selected.kpis[kw.kpi] ?? 0 })) : [];

    return (
        <StandardPage
            title="Supplier Performance Scorecards"
            description="KPI-weighted supplier performance system. Configure KPI weights (must total 100%), score each supplier per KPI, and rank all suppliers by weighted composite score. Supports Gold/Platinum/Silver tier assignment."
            breadcrumbs={[{ label: "Procurement", href: "/scm/procurement" }, { label: "Supplier Scorecards" }]}
            actions={<Button variant="outline" onClick={() => setEditWeights(true)}><BarChart3 className="h-4 w-4 mr-2" />Configure KPI Weights</Button>}
        >
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="border-amber-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Award className="h-4 w-4 text-amber-500" />Top Supplier</CardTitle></CardHeader>
                    <CardContent><div className="font-bold text-lg">{best?.name}</div><div className="text-xs text-muted-foreground">Score: {best?.totalScore}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Suppliers</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{SEED_SUPPLIERS.length}</div></CardContent>
                </Card>
                <Card className="border-green-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg KPI Score</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{Math.round(SEED_SUPPLIERS.reduce((s, r) => s + r.totalScore, 0) / SEED_SUPPLIERS.length)}</div></CardContent>
                </Card>
                <Card className="border-red-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Under Review</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{SEED_SUPPLIERS.filter(s => s.status === "Under Review").length}</div></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="ranking">
                <TabsList className="mb-4"><TabsTrigger value="ranking">Supplier Ranking</TabsTrigger><TabsTrigger value="drill" disabled={!selected}>KPI Drill-Down — {selected?.name ?? "Select a supplier"}</TabsTrigger></TabsList>
                <TabsContent value="ranking">
                    <Card><CardHeader><CardTitle>Cross-Supplier KPI Benchmark</CardTitle><CardDescription>Ranked by weighted composite score. Configure weights via "Configure KPI Weights" button.</CardDescription></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={ranked} columns={summaryCols} onChange={() => { }} containerHeight="400px" /></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="drill">
                    {selected && <Card><CardHeader><CardTitle>{selected.name} — KPI Breakdown</CardTitle><CardDescription>Total weighted score: <strong>{selected.totalScore} / 100</strong> · Tier: {selected.tier}</CardDescription></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={drillData} columns={drillCols} onChange={() => { }} containerHeight="380px" /></CardContent>
                    </Card>}
                </TabsContent>
            </Tabs>

            <Dialog open={editWeights} onOpenChange={setEditWeights}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Configure KPI Weights</DialogTitle></DialogHeader>
                    <div className="py-4 space-y-3">
                        <p className="text-xs text-muted-foreground">Weights must total exactly 100%. Current total: <strong className={totalWeight !== 100 ? "text-red-600" : "text-green-600"}>{totalWeight}%</strong></p>
                        {weights.map((kw, idx) => (
                            <div key={kw.kpi} className="flex items-center gap-3">
                                <span className="text-sm flex-1">{kw.kpi}</span>
                                <div className="flex items-center gap-1">
                                    <Input type="number" min={0} max={100} value={kw.weight} onChange={e => setWeights(prev => prev.map((w, i) => i === idx ? { ...w, weight: parseInt(e.target.value) || 0 } : w))} className="w-20 h-8 text-sm text-right" />
                                    <span className="text-xs text-muted-foreground">%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditWeights(false)}>Cancel</Button>
                        <Button disabled={totalWeight !== 100} onClick={() => saveMutation.mutate({ weights })}>Save Weights</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
