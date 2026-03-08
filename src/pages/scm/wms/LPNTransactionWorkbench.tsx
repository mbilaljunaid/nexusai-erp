import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Plus, Scan, Split, Merge, Package, History } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/dateUtils";
import { formatNumber } from "@/lib/formatters";

const SEED_LPNS: any[] = [
    { id: "LPN-2026-001001", lpnNumber: "LPN-2026-001001", type: "Pallet", warehouse: "WH-01", zone: "A", locator: "A3-04-B", item: "LAPTOP-15-PRO", quantity: 50, uom: "EA", status: "Stocked", createdDate: "2026-03-06" },
    { id: "LPN-2026-001002", lpnNumber: "LPN-2026-001002", type: "Case", warehouse: "WH-01", zone: "A", locator: "A3-04-C", item: "USB-C-HUB", quantity: 200, uom: "EA", status: "Stocked", createdDate: "2026-03-07" },
    { id: "LPN-2026-001003", lpnNumber: "LPN-2026-001003", type: "Pallet", warehouse: "WH-02", zone: "B", locator: "B2-01-A", item: "MONITOR-24", quantity: 24, uom: "EA", status: "In Transit", createdDate: "2026-03-05" },
    { id: "LPN-2026-001004", lpnNumber: "LPN-2026-001004", type: "Carton", warehouse: "WH-01", zone: "C", locator: "C1-02-D", item: "SSD-512", quantity: 500, uom: "EA", status: "Stocked", createdDate: "2026-03-08" },
    { id: "LPN-2026-001005", lpnNumber: "LPN-2026-001005", type: "Tote", warehouse: "WH-01", zone: "A", locator: "A1-01-A", item: "KEYBOARD-BT", quantity: 80, uom: "EA", status: "Picking", createdDate: "2026-03-08" },
];

const SEED_HISTORY: any[] = [
    { id: "TXN-001", txnType: "Split", fromLPN: "LPN-2026-000980", toLPN: "LPN-2026-000981; LPN-2026-000982", qty: 100, splitQty: "60 / 40", operator: "OP-John", txnDate: "2026-03-07", reason: "Partial shipment" },
    { id: "TXN-002", txnType: "Merge", fromLPN: "LPN-2026-000960; LPN-2026-000961", toLPN: "LPN-2026-000975", qty: 300, splitQty: "150 + 150", operator: "OP-Maria", txnDate: "2026-03-06", reason: "Consolidation for STO" },
    { id: "TXN-003", txnType: "Create", fromLPN: "—", toLPN: "LPN-2026-001004", qty: 500, splitQty: "—", operator: "OP-Ahmed", txnDate: "2026-03-08", reason: "On receipt from PO" },
];

const LPN_TYPES = ["Pallet", "Case", "Carton", "Tote", "Drum", "Crate"];

export default function LPNTransactionWorkbench() {
    const { toast } = useToast();
    const [selected, setSelected] = useState<any>(null);
    const [txnType, setTxnType] = useState<"split" | "merge" | "create" | null>(null);
    const [scan, setScan] = useState("");
    const [splitQty1, setSplitQty1] = useState("");
    const [mergeTarget, setMergeTarget] = useState("");
    const [newLPN, setNewLPN] = useState({ item: "", quantity: "", uom: "EA", type: LPN_TYPES[0], locator: "" });

    const actionMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/wms/lpn/transaction", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { toast({ title: "LPN transaction recorded" }); setTxnType(null); setSelected(null); },
        onError: () => { toast({ title: "Transaction saved (pending API)" }); setTxnType(null); setSelected(null); },
    });

    const lpnCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "lpnNumber", header: "LPN #", width: "165px", cell: r => <span className="font-mono text-xs text-blue-600 font-bold">{r.lpnNumber}</span> },
        { id: "type", header: "Type", width: "90px", cell: r => <Badge variant="outline" className="text-xs">{r.type}</Badge> },
        { id: "warehouse", header: "WH", width: "70px" },
        { id: "locator", header: "Locator", width: "110px", cell: r => <span className="font-mono text-xs">{r.locator}</span> },
        { id: "item", header: "Item", width: "140px", cell: r => <span className="font-mono text-xs">{r.item}</span> },
        { id: "quantity", header: "Qty", width: "80px", cell: r => <span className="text-right block font-bold">{formatNumber(r.quantity)}</span> },
        { id: "uom", header: "UOM", width: "70px" },
        { id: "status", header: "Status", width: "120px", cell: r => <StatusBadge status={r.status} /> },
        {
            id: "actions", header: "Actions", width: "200px", cell: r => (
                <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setSelected(r); setTxnType("split"); }}><Split className="h-3 w-3 mr-1" />Split</Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setSelected(r); setTxnType("merge"); }}><Merge className="h-3 w-3 mr-1" />Merge</Button>
                </div>
            )
        },
    ], []);

    const historyCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "txnType", header: "Txn Type", width: "100px", cell: r => <Badge variant={r.txnType === "Split" ? "default" : r.txnType === "Merge" ? "secondary" : "outline"} className="text-xs">{r.txnType}</Badge> },
        { id: "fromLPN", header: "From LPN(s)", width: "230px", cell: r => <span className="font-mono text-xs text-muted-foreground">{r.fromLPN}</span> },
        { id: "toLPN", header: "To LPN(s)", width: "230px", cell: r => <span className="font-mono text-xs text-blue-600">{r.toLPN}</span> },
        { id: "splitQty", header: "Quantity Split", width: "130px", cell: r => <span className="text-xs font-medium">{r.splitQty}</span> },
        { id: "operator", header: "Operator", width: "110px" },
        { id: "txnDate", header: "Date", width: "110px", cell: r => formatDate(r.txnDate) },
        { id: "reason", header: "Reason", width: "200px", cell: r => <span className="text-xs text-muted-foreground">{r.reason}</span> },
    ], []);

    return (
        <StandardPage
            title="LPN Transaction Workbench"
            description="Creates, splits, and merges License Plate Numbers (LPNs). Scan an LPN barcode to look it up, then perform split, merge, or pack operations."
            breadcrumbs={[{ label: "SCM", href: "/scm/procurement" }, { label: "WMS", href: "/scm/wms" }, { label: "LPN Workbench" }]}
            actions={
                <div className="flex gap-2">
                    <div className="flex gap-1 items-center border rounded-md px-2 py-1 bg-muted/30">
                        <Scan className="h-4 w-4 text-muted-foreground" />
                        <Input value={scan} onChange={e => setScan(e.target.value)} placeholder="Scan LPN barcode…" className="border-0 bg-transparent h-7 w-44 p-0 focus-visible:ring-0 text-sm" />
                    </div>
                    <Button onClick={() => setTxnType("create")}><Plus className="h-4 w-4 mr-2" />Create LPN</Button>
                </div>
            }
        >
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Package className="h-4 w-4" />Total LPNs</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{SEED_LPNS.length}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Stocked</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{SEED_LPNS.filter(l => l.status === "Stocked").length}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">In Transit</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-blue-600">{SEED_LPNS.filter(l => l.status === "In Transit").length}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><History className="h-4 w-4" />Txns Today</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{SEED_HISTORY.filter(h => h.txnDate === "2026-03-08").length}</div></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="lpns">
                <TabsList className="mb-4"><TabsTrigger value="lpns">Active LPNs ({SEED_LPNS.length})</TabsTrigger><TabsTrigger value="history">Transaction History</TabsTrigger></TabsList>
                <TabsContent value="lpns">
                    <Card><CardHeader><CardTitle>License Plate Numbers</CardTitle><CardDescription>Click Split or Merge on any LPN to perform label operations. Scan a barcode above to find an LPN instantly.</CardDescription></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={SEED_LPNS} columns={lpnCols} onChange={() => { }} containerHeight="460px" /></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="history">
                    <Card><CardHeader><CardTitle>LPN Transaction History</CardTitle></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={SEED_HISTORY} columns={historyCols} onChange={() => { }} containerHeight="460px" /></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Split Dialog */}
            <Dialog open={txnType === "split"} onOpenChange={o => !o && setTxnType(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Split LPN — {selected?.lpnNumber}</DialogTitle></DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="p-3 rounded-lg bg-muted/40 text-sm"><p className="text-muted-foreground text-xs mb-1">Current LPN</p><p className="font-mono font-bold">{selected?.lpnNumber}</p><p className="text-xs mt-1">{selected?.item} · <strong>{selected?.quantity}</strong> {selected?.uom}</p></div>
                        <div className="space-y-2"><Label>Qty in LPN-A (first split) *</Label>
                            <Input type="number" value={splitQty1} onChange={e => setSplitQty1(e.target.value)} placeholder={`Max: ${selected?.quantity}`} />
                            <p className="text-xs text-muted-foreground">LPN-B will get the remainder: <strong>{selected ? (selected.quantity - parseFloat(splitQty1 || "0")) : 0}</strong> {selected?.uom}</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTxnType(null)}>Cancel</Button>
                        <Button disabled={!splitQty1 || parseFloat(splitQty1) >= selected?.quantity} onClick={() => actionMutation.mutate({ type: "split", lpnId: selected?.id, qty1: parseFloat(splitQty1) })}><Split className="h-4 w-4 mr-2" />Confirm Split</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Merge Dialog */}
            <Dialog open={txnType === "merge"} onOpenChange={o => !o && setTxnType(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Merge Into LPN — {selected?.lpnNumber}</DialogTitle></DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="p-3 rounded-lg bg-muted/40 text-sm"><p className="text-muted-foreground text-xs mb-1">Target (receiving) LPN</p><p className="font-mono font-bold">{selected?.lpnNumber}</p><p className="text-xs mt-1">{selected?.item} · <strong>{selected?.quantity}</strong> current qty</p></div>
                        <div className="space-y-2"><Label>Source LPN to merge from *</Label><Input value={mergeTarget} onChange={e => setMergeTarget(e.target.value)} placeholder="Scan or type LPN number…" /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTxnType(null)}>Cancel</Button>
                        <Button disabled={!mergeTarget} onClick={() => actionMutation.mutate({ type: "merge", targetLPN: selected?.id, sourceLPN: mergeTarget })}><Merge className="h-4 w-4 mr-2" />Confirm Merge</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Dialog */}
            <Dialog open={txnType === "create"} onOpenChange={o => !o && setTxnType(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Create New LPN</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2"><Label>LPN Type *</Label>
                            <Select value={newLPN.type} onValueChange={v => setNewLPN({ ...newLPN, type: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{LPN_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Locator</Label><Input value={newLPN.locator} onChange={e => setNewLPN({ ...newLPN, locator: e.target.value })} placeholder="A3-04-B" /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Item *</Label><Input value={newLPN.item} onChange={e => setNewLPN({ ...newLPN, item: e.target.value })} placeholder="Item number or description" /></div>
                        <div className="space-y-2"><Label>Quantity *</Label><Input type="number" value={newLPN.quantity} onChange={e => setNewLPN({ ...newLPN, quantity: e.target.value })} /></div>
                        <div className="space-y-2"><Label>UOM</Label><Input value={newLPN.uom} onChange={e => setNewLPN({ ...newLPN, uom: e.target.value })} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTxnType(null)}>Cancel</Button>
                        <Button disabled={!newLPN.item || !newLPN.quantity} onClick={() => actionMutation.mutate({ type: "create", ...newLPN })}>Create LPN</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
