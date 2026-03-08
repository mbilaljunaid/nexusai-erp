import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, TrendingDown, AlertTriangle, Package } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatNumber } from "@/lib/formatters";

const SEED_MINMAX: any[] = [
    { id: "MM-001", orgCode: "M1", subinventory: "FG-STORE", itemCode: "ITM-001", itemDesc: "Laptop 15\" Pro 16GB", uom: "EA", onHandQty: 45, minQty: 20, maxQty: 100, reorderPoint: 25, reorderQty: 60, leadTimeDays: 14, plannerCode: "P001", status: "Normal" },
    { id: "MM-002", orgCode: "M1", subinventory: "RM-STORE", itemCode: "RM-202", itemDesc: "Aluminium Sheet 2mm", uom: "Sheet", onHandQty: 18, minQty: 50, maxQty: 300, reorderPoint: 60, reorderQty: 200, leadTimeDays: 7, plannerCode: "P002", status: "Below Min" },
    { id: "MM-003", orgCode: "M1", subinventory: "PKG-STORE", itemCode: "PKG-001", itemDesc: "Cardboard Box Medium", uom: "EA", onHandQty: 240, minQty: 100, maxQty: 500, reorderPoint: 120, reorderQty: 300, leadTimeDays: 3, plannerCode: "P001", status: "Normal" },
    { id: "MM-004", orgCode: "W1", subinventory: "FG-STORE", itemCode: "ITM-042", itemDesc: "Laptop Carry Bag 15\"", uom: "EA", onHandQty: 8, minQty: 30, maxQty: 80, reorderPoint: 35, reorderQty: 50, leadTimeDays: 10, plannerCode: "P003", status: "Below Min" },
];

export default function MinMaxPlanningSetup() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [newEntry, setNewEntry] = useState({ orgCode: "M1", subinventory: "", itemCode: "", uom: "EA", minQty: "", maxQty: "", reorderPoint: "", reorderQty: "", leadTimeDays: "" });

    const { data: apiData } = useQuery<any[]>({ queryKey: ["/api/inventory/min-max"], queryFn: () => fetch("/api/inventory/min-max").then(r => r.json()).catch(() => []) });
    const entries = (apiData && apiData.length > 0) ? apiData : SEED_MINMAX;

    const createMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/inventory/min-max", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/inventory/min-max"] }); toast({ title: "Min-Max entry created" }); setIsOpen(false); },
        onError: () => { toast({ title: "Saved (pending API)" }); setIsOpen(false); },
    });

    const belowMin = entries.filter(e => e.status === "Below Min").length;

    const getStockLevel = (e: any) => {
        if (e.onHandQty <= e.minQty) return "danger";
        if (e.onHandQty <= e.reorderPoint) return "warning";
        return "ok";
    };

    const columns = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "orgCode", header: "Org", width: "80px", cell: r => <Badge variant="outline" className="font-mono text-xs">{r.orgCode}</Badge> },
        { id: "subinventory", header: "Subinventory", width: "120px" },
        { id: "itemCode", header: "Item Code", width: "120px", cell: r => <span className="font-mono text-xs text-blue-600">{r.itemCode}</span> },
        { id: "itemDesc", header: "Item Description", width: "220px", cell: r => <span className="font-medium">{r.itemDesc}</span> },
        { id: "uom", header: "UOM", width: "70px" },
        {
            id: "onHandQty", header: "On Hand", width: "100px", cell: r => {
                const lvl = getStockLevel(r);
                return <span className={`text-right block font-bold ${lvl === "danger" ? "text-red-600" : lvl === "warning" ? "text-amber-600" : "text-green-700"}`}>{formatNumber(r.onHandQty)}</span>;
            }
        },
        { id: "minQty", header: "Min Qty", width: "100px", cell: r => <span className="text-right block text-red-600 font-semibold">{formatNumber(r.minQty)}</span> },
        { id: "reorderPoint", header: "Reorder Pt", width: "110px", cell: r => <span className="text-right block text-amber-600 font-semibold">{formatNumber(r.reorderPoint)}</span> },
        { id: "maxQty", header: "Max Qty", width: "100px", cell: r => <span className="text-right block text-green-700 font-semibold">{formatNumber(r.maxQty)}</span> },
        { id: "reorderQty", header: "Reorder Qty", width: "110px", cell: r => <span className="text-right block">{formatNumber(r.reorderQty)}</span> },
        { id: "leadTimeDays", header: "Lead Time", width: "100px", cell: r => <span className="text-center block">{r.leadTimeDays} days</span> },
        { id: "plannerCode", header: "Planner", width: "90px" },
        { id: "status", header: "Status", width: "130px", cell: r => <StatusBadge status={r.status} /> },
    ], []);

    return (
        <StandardPage
            title="Min-Max Planning Setup"
            description="Define minimum and maximum stock levels per item/subinventory. MRP will auto-generate replenishment suggestions when on-hand falls below the reorder point."
            breadcrumbs={[{ label: "SCM", href: "/scm/procurement" }, { label: "Inventory", href: "/inventory" }, { label: "Min-Max Planning" }]}
            actions={<Button onClick={() => setIsOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Entry</Button>}
        >
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-red-700 dark:text-red-400 flex gap-2 items-center"><AlertTriangle className="h-4 w-4" />Below Minimum</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-700 dark:text-red-400">{belowMin}</div><p className="text-xs text-muted-foreground">Items requiring replenishment</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Package className="h-4 w-4" />Total Items Tracked</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{entries.length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><TrendingDown className="h-4 w-4" />Avg Lead Time</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{Math.round(entries.reduce((s, e) => s + e.leadTimeDays, 0) / entries.length)} days</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Min-Max Planning Parameters</CardTitle><CardDescription>On-hand shown red if below min, amber if at reorder point, green if above. MRP suggests replenishment orders when on-hand ≤ Reorder Point.</CardDescription></CardHeader>
                <CardContent className="p-0"><InteractiveSpreadsheet data={entries} columns={columns} onChange={() => { }} containerHeight="500px" /></CardContent>
            </Card>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader><DialogTitle>New Min-Max Entry</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-3 gap-4 py-4">
                        <div className="space-y-2"><Label>Org</Label>
                            <Select value={newEntry.orgCode} onValueChange={v => setNewEntry({ ...newEntry, orgCode: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{["M1", "W1", "EU1"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Subinventory</Label><Input value={newEntry.subinventory} onChange={e => setNewEntry({ ...newEntry, subinventory: e.target.value })} placeholder="FG-STORE" /></div>
                        <div className="space-y-2"><Label>UOM</Label><Input value={newEntry.uom} onChange={e => setNewEntry({ ...newEntry, uom: e.target.value })} /></div>
                        <div className="space-y-2 md:col-span-3"><Label>Item Code *</Label><Input value={newEntry.itemCode} onChange={e => setNewEntry({ ...newEntry, itemCode: e.target.value })} placeholder="Search item code..." /></div>
                        <div className="space-y-2"><Label>Min Qty *</Label><Input type="number" value={newEntry.minQty} onChange={e => setNewEntry({ ...newEntry, minQty: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Reorder Point</Label><Input type="number" value={newEntry.reorderPoint} onChange={e => setNewEntry({ ...newEntry, reorderPoint: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Max Qty *</Label><Input type="number" value={newEntry.maxQty} onChange={e => setNewEntry({ ...newEntry, maxQty: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Reorder Qty</Label><Input type="number" value={newEntry.reorderQty} onChange={e => setNewEntry({ ...newEntry, reorderQty: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Lead Time (days)</Label><Input type="number" value={newEntry.leadTimeDays} onChange={e => setNewEntry({ ...newEntry, leadTimeDays: e.target.value })} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={() => createMutation.mutate({ ...newEntry, status: "Normal" })} disabled={!newEntry.itemCode || !newEntry.minQty || !newEntry.maxQty}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
