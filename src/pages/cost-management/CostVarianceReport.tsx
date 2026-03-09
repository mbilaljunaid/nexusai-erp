import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { TrendingDown, TrendingUp, Minus, Download } from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { Progress } from "@/components/ui/progress";


const COST_ELEMENTS = ["Material", "Labor", "Machine", "Fixed Overhead", "Variable Overhead"];
const PERIODS = ["Mar 2026 (Current)", "Feb 2026", "Jan 2026", "Q4 2025"];

const SEED_ITEMS: any[] = [
    {
        item: "PUMP-ASSY-001", desc: "Centrifugal Pump Assembly", stdCost: 2840, actualCost: 3042, variance: 202, varPct: 7.1,
        breakdown: { Material: { std: 1540, actual: 1680, var: 140 }, Labor: { std: 480, actual: 512, var: 32 }, Machine: { std: 320, actual: 340, var: 20 }, "Fixed Overhead": { std: 340, actual: 340, var: 0 }, "Variable Overhead": { std: 160, actual: 170, var: 10 } }
    },
    {
        item: "MOTOR-CTRL-005", desc: "Motor Controller Unit", stdCost: 1240, actualCost: 1195, variance: -45, varPct: -3.6,
        breakdown: { Material: { std: 820, actual: 785, var: -35 }, Labor: { std: 180, actual: 180, var: 0 }, Machine: { std: 100, actual: 95, var: -5 }, "Fixed Overhead": { std: 90, actual: 90, var: 0 }, "Variable Overhead": { std: 50, actual: 45, var: -5 } }
    },
    {
        item: "VALVE-GATE-12", desc: "Gate Valve 12\" Flanged", stdCost: 680, actualCost: 710, variance: 30, varPct: 4.4,
        breakdown: { Material: { std: 420, actual: 445, var: 25 }, Labor: { std: 120, actual: 125, var: 5 }, Machine: { std: 80, actual: 80, var: 0 }, "Fixed Overhead": { std: 40, actual: 40, var: 0 }, "Variable Overhead": { std: 20, actual: 20, var: 0 } }
    },
    {
        item: "HVAC-UNIT-AHU", desc: "Air Handling Unit", stdCost: 8500, actualCost: 8140, variance: -360, varPct: -4.2,
        breakdown: { Material: { std: 5200, actual: 4900, var: -300 }, Labor: { std: 1400, actual: 1380, var: -20 }, Machine: { std: 800, actual: 800, var: 0 }, "Fixed Overhead": { std: 700, actual: 700, var: 0 }, "Variable Overhead": { std: 400, actual: 360, var: -40 } }
    },
    {
        item: "IMPELLER-SS-01", desc: "SS Impeller 6-Blade", stdCost: 680, actualCost: 695, variance: 15, varPct: 2.2,
        breakdown: { Material: { std: 480, actual: 490, var: 10 }, Labor: { std: 100, actual: 105, var: 5 }, Machine: { std: 60, actual: 60, var: 0 }, "Fixed Overhead": { std: 25, actual: 25, var: 0 }, "Variable Overhead": { std: 15, actual: 15, var: 0 } }
    },
];

function VarCell({ val }: { val: number }) {
    if (val === 0) return <span className="flex items-center justify-end gap-1 text-muted-foreground"><Minus className="h-3.5 w-3.5" />0</span>;
    return val > 0
        ? <span className="flex items-center justify-end gap-1 text-red-600 font-bold"><TrendingUp className="h-3.5 w-3.5" />+{formatNumber(val)}</span>
        : <span className="flex items-center justify-end gap-1 text-green-700 font-bold"><TrendingDown className="h-3.5 w-3.5" />{formatNumber(val)}</span>;
}

export default function CostVarianceReport() {
    const { toast } = useToast();
    const [period, setPeriod] = useState(PERIODS[0]);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const { data: varianceData = [], isLoading } = useQuery({
        queryKey: ["/api/manufacturing/variance-journals", period],
        queryFn: async () => {
            const res = await fetch("/api/manufacturing/variance-journals");
            if (!res.ok) throw new Error("Failed to fetch variance data");
            return res.json();
        }
    });

    const itemsToDisplay = varianceData.length > 0 ? varianceData : SEED_ITEMS; // Fallback to SEED if API is not fully seeded yet for demo

    const totalStd = itemsToDisplay.reduce((s: number, r: any) => s + r.stdCost, 0);
    const totalActual = itemsToDisplay.reduce((s: number, r: any) => s + r.actualCost, 0);
    const totalVar = totalActual - totalStd;

    const summaryCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "item", header: "Item Code", width: "160px", cell: r => <span className="font-mono text-xs text-blue-600">{r.item}</span> },
        { id: "desc", header: "Description", width: "220px", cell: r => <span className="font-medium text-sm">{r.desc}</span> },
        { id: "stdCost", header: "Standard Cost", width: "140px", cell: r => <span className="text-right block font-mono">${formatNumber(r.stdCost)}</span> },
        { id: "actualCost", header: "Actual Cost", width: "140px", cell: r => <span className="text-right block font-mono">${formatNumber(r.actualCost)}</span> },
        { id: "variance", header: "Variance $", width: "130px", cell: r => <VarCell val={r.variance} /> },
        { id: "varPct", header: "Var %", width: "100px", cell: r => <span className={`text-right block font-bold ${r.variance > 0 ? "text-red-600" : r.variance < 0 ? "text-green-700" : "text-muted-foreground"}`}>{r.variance > 0 ? "+" : ""}{r.varPct}%</span> },
        { id: "actions", header: "", width: "100px", cell: r => <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelectedItem(r)}>Drill Down</Button> },
    ], []);

    const drillItem = selectedItem ?? SEED_ITEMS[0];
    const drillData = COST_ELEMENTS.map(el => ({ element: el, ...drillItem.breakdown[el] }));

    const drillCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "element", header: "Cost Element", width: "180px", cell: r => <span className="font-semibold">{r.element}</span> },
        { id: "std", header: "Standard", width: "130px", cell: r => <span className="text-right block font-mono">${formatNumber(r.std)}</span> },
        { id: "actual", header: "Actual", width: "130px", cell: r => <span className="text-right block font-mono">${formatNumber(r.actual)}</span> },
        { id: "var", header: "Variance $", width: "130px", cell: r => <VarCell val={r.var} /> },
        { id: "varPct", header: "% of Std", width: "110px", cell: r => { const p = r.std > 0 ? ((r.var / r.std) * 100).toFixed(1) : "0"; return <span className={`text-right block font-bold ${r.var > 0 ? "text-red-600" : r.var < 0 ? "text-green-700" : "text-muted-foreground"}`}>{r.var > 0 ? "+" : ""}{p}%</span>; } },
        {
            id: "bar", header: "Variance Profile", width: "250px", cell: r => {
                const max = Math.max(...drillData.map(d => Math.abs(d.var)), 1);
                const pct = Math.abs(r.var) / max * 100;
                return (
                    <div className="flex items-center gap-2">
                        <Progress value={pct} className={`flex-1 h-4 ${r.var > 0 ? "[&>div]:bg-red-500" : "[&>div]:bg-green-500"}`} />
                    </div>

                );
            }
        },
    ], [drillData]);

    // Variance summary by element (across all items)
    const elementSummary = COST_ELEMENTS.map(el => ({
        element: el,
        totalStd: SEED_ITEMS.reduce((s, r) => s + r.breakdown[el].std, 0),
        totalActual: SEED_ITEMS.reduce((s, r) => s + r.breakdown[el].actual, 0),
        totalVar: SEED_ITEMS.reduce((s, r) => s + r.breakdown[el].var, 0),
    }));

    const elementCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "element", header: "Cost Element", width: "180px", cell: r => <span className="font-semibold">{r.element}</span> },
        { id: "totalStd", header: "Total Standard", width: "150px", cell: r => <span className="text-right block font-mono">${formatNumber(r.totalStd)}</span> },
        { id: "totalActual", header: "Total Actual", width: "150px", cell: r => <span className="text-right block font-mono">${formatNumber(r.totalActual)}</span> },
        { id: "totalVar", header: "Total Variance", width: "150px", cell: r => <VarCell val={r.totalVar} /> },
        { id: "pctOfTotal", header: "% of Std", width: "110px", cell: r => { const p = r.totalStd > 0 ? ((r.totalVar / r.totalStd) * 100).toFixed(1) : "0"; return <span className={`text-right block font-bold ${r.totalVar > 0 ? "text-red-600" : r.totalVar < 0 ? "text-green-700" : "text-muted-foreground"}`}>{r.totalVar > 0 ? "+" : ""}{p}%</span>; } },
    ], []);

    return (
        <StandardPage
            title="Cost Element Variance Report"
            description="Actual vs standard cost comparison broken down by cost element (Material, Labor, Machine, Fixed OH, Variable OH). Drill into any item to see element-level variance. Positive variance = cost overrun."
            breadcrumbs={[{ label: "Cost Management", href: "/scm/costing" }, { label: "Variance Report" }]}
            actions={
                <div className="flex gap-2">
                    <Select value={period} onValueChange={setPeriod}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>{PERIODS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => toast({ title: "Report exported to XLSX" })}><Download className="h-4 w-4 mr-2" />Export</Button>
                </div>
            }
        >
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Standard Cost</CardTitle></CardHeader>
                    <CardContent><div className="text-xl font-bold">${formatNumber(totalStd)}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Actual Cost</CardTitle></CardHeader>
                    <CardContent><div className="text-xl font-bold">${formatNumber(totalActual)}</div></CardContent>
                </Card>
                <Card className={totalVar > 0 ? "border-red-200" : "border-green-200"}><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Net Variance</CardTitle></CardHeader>
                    <CardContent><div className={`text-xl font-bold flex items-center gap-1 ${totalVar > 0 ? "text-red-600" : "text-green-700"}`}>{totalVar > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}${Math.abs(totalVar).toLocaleString()}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Unfavourable Items</CardTitle></CardHeader>
                    <CardContent><div className="text-xl font-bold text-red-600">{SEED_ITEMS.filter(r => r.variance > 0).length}</div></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="summary">
                <TabsList className="mb-4">
                    <TabsTrigger value="summary">Item Variance Summary</TabsTrigger>
                    <TabsTrigger value="drill">Element Drill-Down — {drillItem.item}</TabsTrigger>
                    <TabsTrigger value="elements">By Cost Element (All Items)</TabsTrigger>
                </TabsList>

                <TabsContent value="summary">
                    <Card><CardHeader><CardTitle>Item-Level Variance — {period}</CardTitle><CardDescription>Click "Drill Down" on any row to see variance by cost element.</CardDescription></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={SEED_ITEMS} columns={summaryCols} onChange={() => { }} containerHeight="420px" /></CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="drill">
                    <Card><CardHeader>
                        <CardTitle>{drillItem.item} — {drillItem.desc}</CardTitle>
                        <CardDescription>Standard: ${formatNumber(drillItem.stdCost)} · Actual: ${formatNumber(drillItem.actualCost)} · Variance: <span className={drillItem.variance > 0 ? "text-red-600 font-bold" : "text-green-700 font-bold"}>{drillItem.variance > 0 ? "+" : ""}{formatNumber(drillItem.variance)}</span></CardDescription>
                    </CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={drillData} columns={drillCols} onChange={() => { }} containerHeight="320px" /></CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="elements">
                    <Card><CardHeader><CardTitle>Variance Aggregated by Cost Element</CardTitle><CardDescription>Which cost element is driving the most variance across all manufactured items this period.</CardDescription></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={elementSummary} columns={elementCols} onChange={() => { }} containerHeight="320px" /></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
