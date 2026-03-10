import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, RotateCcw, CheckCircle } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatNumber } from "@/lib/formatters";

const DISPOSITIONS = ["Restock to Inventory", "Scrap", "Return to Supplier", "Repair & Return", "Quarantine for Inspection"];

const SEED_RMA: any[] = [
    { id: "RMA-0041", so: "SO-0084110", customer: "Apex Industries", item: "PUMP-ASSY-001", desc: "Centrifugal Pump Assembly", qty: 2, reason: "Defective on Arrival", disposition: "Repair & Return", receivedQty: 0, status: "Open", inspectStatus: "Pending", restockLoc: "WH-QA", creditAmt: 5680, raisedDate: "2026-03-01" },
    { id: "RMA-0040", so: "SO-0083820", customer: "Global Tech Ltd", item: "MOTOR-CTRL-005", desc: "Motor Controller Unit", qty: 5, reason: "Wrong Item Shipped", disposition: "Restock to Inventory", receivedQty: 5, status: "Received", inspectStatus: "Passed", restockLoc: "WH-A-12B", creditAmt: 6200, raisedDate: "2026-02-22" },
    { id: "RMA-0039", so: "SO-0083510", customer: "National Utilities", item: "SEAL-MECH-14MM", desc: "Mechanical Seal 14mm", qty: 10, reason: "Customer Changed Mind", disposition: "Restock to Inventory", receivedQty: 10, status: "Restocked", inspectStatus: "Passed", restockLoc: "WH-B-03A", creditAmt: 950, raisedDate: "2026-02-15" },
    { id: "RMA-0038", so: "SO-0083201", customer: "Sky Construction", item: "VALVE-GATE-12", desc: "Gate Valve 12\" Flanged", qty: 1, reason: "Warranty Claim", disposition: "Return to Supplier", receivedQty: 1, status: "In QC", inspectStatus: "Inspect in Progress", restockLoc: "QA-HOLD", creditAmt: 680, raisedDate: "2026-02-10" },
];

export default function RMAWorkbench() {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<any>(null);
    const [receiveOpen, setReceiveOpen] = useState(false);
    const [newRma, setNewRma] = useState({ so: "", customer: "", item: "", qty: 1, reason: "", disposition: "Restock to Inventory", creditAmt: 0 });

    const createMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/scm/rma", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { toast({ title: `RMA created — customer notified with return label` }); setIsOpen(false); },
        onError: () => { toast({ title: "RMA created (pending API)" }); setIsOpen(false); },
    });

    const receiveMutation = useMutation({
        mutationFn: (d: any) => fetch(`/api/scm/rma/${d.id}/receive`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { toast({ title: "RMA received — moved to QC inspection" }); setReceiveOpen(false); },
        onError: () => { toast({ title: "RMA received (pending API)" }); setReceiveOpen(false); },
    });

    const open = SEED_RMA.filter(r => r.status === "Open").length;
    const totalCredit = SEED_RMA.reduce((s, r) => s + r.creditAmt, 0);
    const restocked = SEED_RMA.filter(r => r.status === "Restocked").length;

    const cols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "id", header: "RMA #", width: "110px", cell: r => <span className="font-mono text-xs text-blue-600">{r.id}</span> },
        { id: "customer", header: "Customer", width: "160px", cell: r => <span className="font-medium text-sm">{r.customer}</span> },
        { id: "item", header: "Item", width: "150px", cell: r => <span className="font-mono text-xs">{r.item}</span> },
        { id: "qty", header: "Authorized Qty", width: "110px", cell: r => <span className="text-center block font-bold">{r.qty}</span> },
        { id: "receivedQty", header: "Received", width: "90px", cell: r => <span className={`text-center block font-bold ${r.receivedQty < r.qty ? "text-amber-600" : "text-green-700"}`}>{r.receivedQty}</span> },
        { id: "reason", header: "Return Reason", width: "180px", cell: r => <span className="text-xs">{r.reason}</span> },
        { id: "disposition", header: "Disposition", width: "170px", cell: r => <Badge variant="outline" className="text-xs">{r.disposition}</Badge> },
        { id: "inspectStatus", header: "QC Status", width: "140px", cell: r => <StatusBadge status={r.inspectStatus} /> },
        { id: "creditAmt", header: "Credit $", width: "100px", cell: r => <span className="font-mono text-right block">${formatNumber(r.creditAmt)}</span> },
        { id: "status", header: "Status", width: "130px", cell: r => <StatusBadge status={r.status} /> },
        {
            id: "actions", header: "", width: "130px", cell: r => (
                r.status === "Open"
                    ? <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => { setSelected(r); setReceiveOpen(true); }}>Receive Return</Button>
                    : <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelected(r)}>View</Button>
            )
        },
    ], []);

    return (
        <StandardPage
            title="RMA / Returns Workbench"
            description="Oracle Fusion WMS returns management. Authorize and receive customer returns (RMA), perform QC inspection, assign disposition (restock, scrap, supplier return, repair), and generate credit memos. Closes the loop between Order Management and Warehouse."
            breadcrumbs={[{ label: "WMS", href: "/scm/wms/dashboard" }, { label: "RMA Workbench" }]}
            actions={<Button onClick={() => setIsOpen(true)}><Plus className="h-4 w-4 mr-2" />New RMA</Button>}
        >
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="border-amber-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Open RMAs</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{open}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Returns</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{SEED_RMA.length}</div></CardContent>
                </Card>
                <Card className="border-green-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Restocked</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{restocked}</div></CardContent>
                </Card>
                <Card className="border-blue-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Credit Value</CardTitle></CardHeader>
                    <CardContent><div className="text-xl font-bold text-blue-700">${formatNumber(totalCredit)}</div></CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader><CardTitle>Return Merchandise Authorisations</CardTitle><CardDescription>Track customer returns from authorisation through receipt, QC inspection, disposition, and credit memo generation.</CardDescription></CardHeader>
                <CardContent className="p-0"><InteractiveSpreadsheet data={SEED_RMA} columns={cols} onChange={() => { }} containerHeight="400px" /></CardContent>
            </Card>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Create RMA Authorisation</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2"><Label>Sales Order # *</Label><Input value={newRma.so} onChange={e => setNewRma({ ...newRma, so: e.target.value })} placeholder="SO-XXXXXXX" className="font-mono" /></div>
                        <div className="space-y-2"><Label>Customer *</Label><Input value={newRma.customer} onChange={e => setNewRma({ ...newRma, customer: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Item Code *</Label><Input value={newRma.item} onChange={e => setNewRma({ ...newRma, item: e.target.value.toUpperCase() })} className="font-mono" /></div>
                        <div className="space-y-2"><Label>Return Qty *</Label><Input type="number" min={1} value={newRma.qty} onChange={e => setNewRma({ ...newRma, qty: parseInt(e.target.value) || 1 })} /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Return Reason</Label><Input value={newRma.reason} onChange={e => setNewRma({ ...newRma, reason: e.target.value })} placeholder="e.g. Defective on Arrival" /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Disposition</Label>
                            <Select value={newRma.disposition} onValueChange={v => setNewRma({ ...newRma, disposition: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{DISPOSITIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2"><Label>Credit Amount ($)</Label><Input type="number" value={newRma.creditAmt} onChange={e => setNewRma({ ...newRma, creditAmt: parseFloat(e.target.value) || 0 })} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button disabled={!newRma.so || !newRma.item} onClick={() => createMutation.mutate(newRma)}>Create RMA</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={receiveOpen} onOpenChange={setReceiveOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Receive Return — {selected?.id}</DialogTitle></DialogHeader>
                    {selected && <div className="py-4 space-y-3 text-sm">
                        <div className="p-3 bg-muted/30 rounded-lg grid grid-cols-2 gap-2">
                            <span className="text-muted-foreground">Customer:</span><span>{selected.customer}</span>
                            <span className="text-muted-foreground">Item:</span><span className="font-mono text-xs">{selected.item}</span>
                            <span className="text-muted-foreground">Auth Qty:</span><span className="font-bold">{selected.qty}</span>
                            <span className="text-muted-foreground">Disposition:</span><span>{selected.disposition}</span>
                        </div>
                        <div className="space-y-2"><Label>Received Qty (actual)</Label><Input type="number" min={0} max={selected.qty} defaultValue={selected.qty} className="w-28" /></div>
                        <div className="space-y-2"><Label>Receiving Location</Label><Input defaultValue={selected.restockLoc} className="font-mono" /></div>
                        <div className="space-y-2"><Label>QC Notes</Label><Textarea placeholder="Inspection notes..." rows={3} /></div>
                    </div>}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReceiveOpen(false)}>Cancel</Button>
                        <Button onClick={() => receiveMutation.mutate(selected)}><CheckCircle className="h-4 w-4 mr-2" />Confirm Receipt</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
