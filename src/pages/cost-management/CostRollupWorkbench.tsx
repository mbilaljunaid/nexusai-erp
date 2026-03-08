import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Package, Layers, DollarSign } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

const SEED_ROLLUP: any[] = [
    { id: "CR-001", itemNumber: "FG-001", itemDescription: "Laptop 15\" Pro (Assembled)", itemType: "Finished Good", bomLevels: 4, costMethod: "Standard", materialCost: 820.00, laborCost: 95.50, machineOverhead: 45.00, indirectOverhead: 62.75, totalStandardCost: 1023.25, previousCost: 998.00, costVariance: 25.25, rollupDate: "2026-01-31", status: "Current" },
    { id: "CR-002", itemNumber: "SUB-010", itemDescription: "Motherboard Assembly", itemType: "Sub-Assembly", bomLevels: 3, costMethod: "Standard", materialCost: 210.00, laborCost: 38.00, machineOverhead: 22.50, indirectOverhead: 19.80, totalStandardCost: 290.30, previousCost: 278.00, costVariance: 12.30, rollupDate: "2026-01-31", status: "Current" },
    { id: "CR-003", itemNumber: "FG-002", itemDescription: "Office Chair Ergonomic", itemType: "Finished Good", bomLevels: 2, costMethod: "Standard", materialCost: 145.00, laborCost: 28.50, machineOverhead: 12.00, indirectOverhead: 14.50, totalStandardCost: 200.00, previousCost: 192.50, costVariance: 7.50, rollupDate: "2026-01-31", status: "Current" },
    { id: "CR-004", itemNumber: "RM-202", itemDescription: "Aluminium Sheet 2mm", itemType: "Raw Material", bomLevels: 0, costMethod: "Standard", materialCost: 3.50, laborCost: 0, machineOverhead: 0, indirectOverhead: 0, totalStandardCost: 3.50, previousCost: 3.20, costVariance: 0.30, rollupDate: "2026-01-31", status: "Current" },
];

export default function CostRollupWorkbench() {
    const [selectedOrg, setSelectedOrg] = useState("INV_US1");
    const [costType, setCostType] = useState("Standard");
    const [runStatus, setRunStatus] = useState<"idle" | "running" | "complete">("idle");
    const [progress, setProgress] = useState(0);

    const { data: apiData } = useQuery<any[]>({ queryKey: ["/api/cost/rollup", selectedOrg], queryFn: () => fetch(`/api/cost/rollup?org=${selectedOrg}`).then(r => r.json()).catch(() => []) });
    const rollupData = (apiData && apiData.length > 0) ? apiData : SEED_ROLLUP;

    const handleRunRollup = () => {
        setRunStatus("running");
        setProgress(0);
        const step = () => {
            setProgress(p => {
                if (p >= 100) { setRunStatus("complete"); return 100; }
                setTimeout(step, 120);
                return p + 5;
            });
        };
        setTimeout(step, 120);
    };

    const totalMaterial = rollupData.filter(r => r.itemType === "Finished Good").reduce((s, r) => s + r.materialCost, 0);
    const totalLabor = rollupData.filter(r => r.itemType === "Finished Good").reduce((s, r) => s + r.laborCost, 0);
    const totalOverhead = rollupData.filter(r => r.itemType === "Finished Good").reduce((s, r) => s + r.machineOverhead + r.indirectOverhead, 0);

    const columns = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "itemNumber", header: "Item Code", width: "120px", cell: r => <span className="font-mono text-xs text-blue-600">{r.itemNumber}</span> },
        { id: "itemDescription", header: "Item Description", width: "250px", cell: r => <span className="font-medium">{r.itemDescription}</span> },
        { id: "itemType", header: "Type", width: "130px", cell: r => <Badge variant={r.itemType === "Finished Good" ? "default" : r.itemType === "Sub-Assembly" ? "secondary" : "outline"} className="text-xs">{r.itemType}</Badge> },
        { id: "bomLevels", header: "BOM Lvls", width: "90px", cell: r => <span className="text-center block">{r.bomLevels}</span> },
        { id: "materialCost", header: "Material", width: "110px", cell: r => <span className="text-right block">${formatNumber(r.materialCost)}</span> },
        { id: "laborCost", header: "Labor", width: "100px", cell: r => <span className="text-right block">${formatNumber(r.laborCost)}</span> },
        { id: "machineOverhead", header: "Mach OH", width: "100px", cell: r => <span className="text-right block">${formatNumber(r.machineOverhead)}</span> },
        { id: "indirectOverhead", header: "Indir OH", width: "100px", cell: r => <span className="text-right block">${formatNumber(r.indirectOverhead)}</span> },
        { id: "totalStandardCost", header: "Total Std Cost", width: "130px", cell: r => <span className="text-right block font-bold">${formatNumber(r.totalStandardCost)}</span> },
        { id: "costVariance", header: "Variance", width: "110px", cell: r => <span className={`text-right block font-semibold ${r.costVariance > 0 ? "text-red-600" : "text-green-700"}`}>{r.costVariance > 0 ? "+" : ""}{formatNumber(r.costVariance)}</span> },
        { id: "rollupDate", header: "Rollup Date", width: "120px" },
        { id: "status", header: "Status", width: "110px", cell: r => <Badge variant="outline" className="text-xs">{r.status}</Badge> },
    ], []);

    return (
        <StandardPage
            title="Cost Rollup Workbench"
            description="Multi-level BOM cost explosion that rolls up material, labor, and overhead costs to compute the standard cost of finished goods."
            breadcrumbs={[{ label: "SCM", href: "/scm/procurement" }, { label: "Cost Management", href: "/scm/cost" }, { label: "Cost Rollup" }]}
            actions={
                <Button onClick={handleRunRollup} disabled={runStatus === "running"} className="bg-blue-600 hover:bg-blue-700">
                    {runStatus === "running" ? "Rolling Up..." : runStatus === "complete" ? "Re-Run Rollup" : "Run Cost Rollup"}
                </Button>
            }
        >
            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="pt-4">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2"><Label>Inventory Organization</Label>
                            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INV_US1">US Main Warehouse (M1)</SelectItem>
                                    <SelectItem value="INV_US2">US West (W1)</SelectItem>
                                    <SelectItem value="INV_EU1">EU DC (EU1)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Cost Type</Label>
                            <Select value={costType} onValueChange={setCostType}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{["Standard", "Frozen Standard", "Simulation"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        {runStatus !== "idle" && (
                            <div className="space-y-2 flex flex-col justify-end">
                                <Label>{runStatus === "running" ? `Rolling up BOM… ${progress}%` : "Rollup complete"}</Label>
                                <Progress value={progress} className="h-2" />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Package className="h-4 w-4" />Avg Material Cost (FG)</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">${formatNumber(totalMaterial / Math.max(1, rollupData.filter(r => r.itemType === "Finished Good").length))}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Layers className="h-4 w-4" />Avg Labor (FG)</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">${formatNumber(totalLabor / Math.max(1, rollupData.filter(r => r.itemType === "Finished Good").length))}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><DollarSign className="h-4 w-4" />Avg Overhead (FG)</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">${formatNumber(totalOverhead / Math.max(1, rollupData.filter(r => r.itemType === "Finished Good").length))}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Cost Rollup Results</CardTitle><CardDescription>Multi-level BOM explosion showing material, labor, machine overhead, and indirect overhead per item.</CardDescription></CardHeader>
                <CardContent className="p-0"><InteractiveSpreadsheet data={rollupData} columns={columns} onChange={() => { }} containerHeight="500px" /></CardContent>
            </Card>
        </StandardPage>
    );
}
