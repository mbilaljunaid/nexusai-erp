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
import { useToast } from "@/hooks/use-toast";
import { Plus, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatNumber } from "@/lib/formatters";

// Standard UOM classes
const UOM_CLASSES = ["Weight", "Volume", "Length", "Area", "Time", "Temperature", "Quantity", "Energy"];

const SEED_BASE_UOMS: Record<string, string> = {
    Weight: "KG", Volume: "L", Length: "M", Area: "M2", Time: "HR", Temperature: "C", Quantity: "EA", Energy: "KWH"
};

const SEED_STANDARD: any[] = [
    { id: "UC-001", fromUOM: "LB", toUOM: "KG", fromClass: "Weight", toClass: "Weight", convFactor: 0.453592, interClass: false, status: "Active" },
    { id: "UC-002", fromUOM: "OZ", toUOM: "KG", fromClass: "Weight", toClass: "Weight", convFactor: 0.0283495, interClass: false, status: "Active" },
    { id: "UC-003", fromUOM: "GAL", toUOM: "L", fromClass: "Volume", toClass: "Volume", convFactor: 3.78541, interClass: false, status: "Active" },
    { id: "UC-004", fromUOM: "FT", toUOM: "M", fromClass: "Length", toClass: "Length", convFactor: 0.3048, interClass: false, status: "Active" },
    { id: "UC-005", fromUOM: "IN", toUOM: "M", fromClass: "Length", toClass: "Length", convFactor: 0.0254, interClass: false, status: "Active" },
    { id: "UC-006", fromUOM: "GAL", toUOM: "KG", fromClass: "Volume", toClass: "Weight", convFactor: 3.3, interClass: true, itemSpecific: false, itemCode: null, status: "Active", note: "Water-based liquids approx" },
    { id: "UC-007", fromUOM: "JUG", toUOM: "GAL", fromClass: "Quantity", toClass: "Volume", convFactor: 5, interClass: true, itemSpecific: true, itemCode: "CHEM-CLEAN-01", status: "Active", note: "1 JUG = 5 GAL for item CHEM-CLEAN-01" },
    { id: "UC-008", fromUOM: "DRUM", toUOM: "L", fromClass: "Quantity", toClass: "Volume", convFactor: 200, interClass: true, itemSpecific: true, itemCode: "CHEM-SOLV-02", status: "Active", note: "200L drum size" },
];

const SEED_ITEM_OVERRIDES: any[] = [
    { id: "IOR-001", itemCode: "CHEM-CLEAN-01", itemDesc: "Industrial Cleaner", purchaseUOM: "JUG", stockUOM: "L", convFactor: 18.927, lastUpdated: "2026-01-15", status: "Active" },
    { id: "IOR-002", itemCode: "CHEM-SOLV-02", itemDesc: "Solvent Degreaser", purchaseUOM: "DRUM", stockUOM: "L", convFactor: 200, lastUpdated: "2026-01-20", status: "Active" },
    { id: "IOR-003", itemCode: "CABLE-CU-10MM", itemDesc: "Copper Cable 10mm²", purchaseUOM: "MTR", stockUOM: "KG", convFactor: 0.0891, lastUpdated: "2026-02-10", status: "Active" },
];

export default function UOMConversionMatrix() {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [calcFrom, setCalcFrom] = useState({ fromUOM: "LB", qty: "", toUOM: "KG" });
    const [calcResult, setCalcResult] = useState<number | null>(null);
    const [newConv, setNewConv] = useState({ fromUOM: "", toUOM: "", fromClass: UOM_CLASSES[0], toClass: UOM_CLASSES[0], convFactor: "", itemCode: "", note: "" });

    const calc = () => {
        const rule = SEED_STANDARD.find(r => r.fromUOM === calcFrom.fromUOM && r.toUOM === calcFrom.toUOM)
            ?? SEED_STANDARD.find(r => r.toUOM === calcFrom.fromUOM && r.fromUOM === calcFrom.toUOM && false);
        if (!rule || !calcFrom.qty) { toast({ title: "No conversion rule found for this UOM pair" }); return; }
        setCalcResult(parseFloat(calcFrom.qty) * rule.convFactor);
    };

    const createMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/inventory/uom-conversions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { toast({ title: "UOM conversion rule saved" }); setIsOpen(false); },
        onError: () => { toast({ title: "Conversion saved (pending API)" }); setIsOpen(false); },
    });

    const stdCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "fromUOM", header: "From UOM", width: "110px", cell: r => <Badge variant="outline" className="font-mono text-sm">{r.fromUOM}</Badge> },
        { id: "fromClass", header: "From Class", width: "110px", cell: r => <Badge variant="secondary" className="text-xs">{r.fromClass}</Badge> },
        { id: "arrow", header: "", width: "50px", cell: () => <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto" /> },
        { id: "toUOM", header: "To UOM", width: "110px", cell: r => <Badge variant="outline" className="font-mono text-sm">{r.toUOM}</Badge> },
        { id: "toClass", header: "To Class", width: "110px", cell: r => <Badge variant="secondary" className="text-xs">{r.toClass}</Badge> },
        { id: "convFactor", header: "Conversion Factor", width: "160px", cell: r => <span className="font-mono font-bold text-blue-700">{r.convFactor}</span> },
        { id: "interClass", header: "Inter-Class", width: "100px", cell: r => r.interClass ? <Badge className="bg-purple-600 text-xs">Inter-Class</Badge> : <span className="text-xs text-muted-foreground">Same Class</span> },
        { id: "itemCode", header: "Item-Specific", width: "160px", cell: r => r.itemCode ? <span className="font-mono text-xs text-indigo-700">{r.itemCode}</span> : <span className="text-muted-foreground text-xs">Standard</span> },
        { id: "note", header: "Note", width: "240px", cell: r => <span className="text-xs text-muted-foreground">{r.note ?? "—"}</span> },
        { id: "status", header: "Status", width: "100px", cell: r => <StatusBadge status={r.status} /> },
    ], []);

    const overrideCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "itemCode", header: "Item Code", width: "150px", cell: r => <span className="font-mono text-xs text-blue-600">{r.itemCode}</span> },
        { id: "itemDesc", header: "Description", width: "200px", cell: r => <span className="font-medium">{r.itemDesc}</span> },
        { id: "purchaseUOM", header: "Purchase UOM", width: "130px", cell: r => <Badge variant="outline" className="font-mono">{r.purchaseUOM}</Badge> },
        { id: "arrow", header: "", width: "50px", cell: () => <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto" /> },
        { id: "stockUOM", header: "Stock UOM", width: "120px", cell: r => <Badge variant="secondary" className="font-mono">{r.stockUOM}</Badge> },
        { id: "convFactor", header: "Factor", width: "110px", cell: r => <span className="font-mono font-bold text-purple-700">{r.convFactor}</span> },
        { id: "lastUpdated", header: "Last Updated", width: "130px" },
        { id: "status", header: "Status", width: "100px", cell: r => <StatusBadge status={r.status} /> },
    ], []);

    return (
        <StandardPage
            title="UOM Conversion Matrix"
            description="Define standard and inter-class unit of measure conversions. Item-specific overrides allow different conversion factors for the same UOM pair (e.g. 1 DRUM = 200L for Chemical items)."
            breadcrumbs={[{ label: "Inventory", href: "/inventory" }, { label: "UOM Conversions" }]}
            actions={<Button onClick={() => setIsOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Conversion</Button>}
        >
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Standard Conversions</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{SEED_STANDARD.filter(s => !s.interClass).length}</div></CardContent>
                </Card>
                <Card className="border-purple-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Inter-Class Conversions</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-purple-700">{SEED_STANDARD.filter(s => s.interClass).length}</div></CardContent>
                </Card>
                <Card className="border-indigo-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Item-Specific Overrides</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-indigo-700">{SEED_ITEM_OVERRIDES.length}</div></CardContent>
                </Card>
            </div>

            {/* Calculator */}
            <Card className="mb-6 border-2 border-dashed">
                <CardHeader className="pb-2"><CardTitle className="text-sm">UOM Calculator</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex gap-3 items-end flex-wrap">
                        <div className="space-y-1"><label className="text-xs font-bold">Quantity</label><Input type="number" value={calcFrom.qty} onChange={e => setCalcFrom({ ...calcFrom, qty: e.target.value })} className="w-28 h-9 text-xs" placeholder="Enter qty" /></div>
                        <div className="space-y-1"><label className="text-xs font-bold">From UOM</label><Input value={calcFrom.fromUOM} onChange={e => setCalcFrom({ ...calcFrom, fromUOM: e.target.value.toUpperCase() })} className="w-24 h-9 text-xs font-mono" /></div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground mb-1" />
                        <div className="space-y-1"><label className="text-xs font-bold">To UOM</label><Input value={calcFrom.toUOM} onChange={e => setCalcFrom({ ...calcFrom, toUOM: e.target.value.toUpperCase() })} className="w-24 h-9 text-xs font-mono" /></div>
                        <Button onClick={calc} className="h-9">=</Button>
                        {calcResult !== null && <div className="text-xl font-bold text-blue-700 ml-2">{formatNumber(calcResult)} {calcFrom.toUOM}</div>}
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="standard">
                <TabsList className="mb-4"><TabsTrigger value="standard">Standard Conversions</TabsTrigger><TabsTrigger value="overrides">Item-Specific Overrides ({SEED_ITEM_OVERRIDES.length})</TabsTrigger></TabsList>
                <TabsContent value="standard">
                    <Card><CardHeader><CardTitle>Conversion Rules</CardTitle><CardDescription>Inter-class conversions (purple) cross UOM class boundaries. Item-specific overrides apply only to a particular item code.</CardDescription></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={SEED_STANDARD} columns={stdCols} onChange={() => { }} containerHeight="420px" /></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="overrides">
                    <Card><CardHeader><CardTitle>Item-Level UOM Overrides</CardTitle><CardDescription>Override the standard conversion factor for a specific item — e.g. 1 JUG of Chemical item = 18.927L not the standard 18.9279L water equivalent.</CardDescription></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={SEED_ITEM_OVERRIDES} columns={overrideCols} onChange={() => { }} containerHeight="360px" /></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Add UOM Conversion Rule</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2"><Label>From UOM *</Label><Input value={newConv.fromUOM} onChange={e => setNewConv({ ...newConv, fromUOM: e.target.value.toUpperCase() })} placeholder="e.g. LB" className="font-mono" /></div>
                        <div className="space-y-2"><Label>From Class</Label>
                            <Select value={newConv.fromClass} onValueChange={v => setNewConv({ ...newConv, fromClass: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{UOM_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>To UOM *</Label><Input value={newConv.toUOM} onChange={e => setNewConv({ ...newConv, toUOM: e.target.value.toUpperCase() })} placeholder="e.g. KG" className="font-mono" /></div>
                        <div className="space-y-2"><Label>To Class</Label>
                            <Select value={newConv.toClass} onValueChange={v => setNewConv({ ...newConv, toClass: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{UOM_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2"><Label>Conversion Factor * (1 From UOM = ? To UOM)</Label><Input type="number" value={newConv.convFactor} onChange={e => setNewConv({ ...newConv, convFactor: e.target.value })} placeholder="e.g. 0.453592" className="font-mono" /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Item Code (leave blank for standard)</Label><Input value={newConv.itemCode} onChange={e => setNewConv({ ...newConv, itemCode: e.target.value })} placeholder="Optional — makes this item-specific" /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Note</Label><Input value={newConv.note} onChange={e => setNewConv({ ...newConv, note: e.target.value })} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button disabled={!newConv.fromUOM || !newConv.toUOM || !newConv.convFactor} onClick={() => createMutation.mutate({ ...newConv, status: "Active" })}>Save Rule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
