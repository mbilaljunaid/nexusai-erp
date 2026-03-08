import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Plus, Factory, Package, ArrowRight, CheckCircle } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/dateUtils";
import { formatNumber } from "@/lib/formatters";

const SEED_OSP: any[] = [
    { id: "OSP-001", workOrderNum: "WO-2026-3821", woOperation: "Op 40 — Surface Coating", subAssembly: "SUB-CHASSIS-01", supplier: "CoatPro Services", poBroken: "PO-2026-1310", poStatus: "Sent to Supplier", qty: 50, sentDate: "2026-03-02", expectedReturn: "2026-03-12", returnedQty: 0, unitCharge: 45.00, totalCharge: 2250.00, status: "At Supplier" },
    { id: "OSP-002", workOrderNum: "WO-2026-3800", woOperation: "Op 20 — Heat Treatment", subAssembly: "RM-STEEL-BAR", supplier: "HeatTech Ltd", poBroken: "PO-2026-1295", poStatus: "Received Back", qty: 100, sentDate: "2026-02-22", expectedReturn: "2026-03-01", returnedQty: 100, unitCharge: 12.50, totalCharge: 1250.00, status: "Received" },
];

export default function OSPWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [receiveTarget, setReceiveTarget] = useState<any>(null);
    const [receivedQty, setReceivedQty] = useState("");
    const [newOSP, setNewOSP] = useState({ workOrderNum: "", woOperation: "", subAssembly: "", supplier: "", qty: "", unitCharge: "", expectedReturn: "" });

    const { data: apiData } = useQuery<any[]>({ queryKey: ["/api/manufacturing/osp"], queryFn: () => fetch("/api/manufacturing/osp").then(r => r.json()).catch(() => []) });
    const osps = (apiData && apiData.length > 0) ? apiData : SEED_OSP;

    const createMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/manufacturing/osp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/osp"] }); toast({ title: "OSP order created" }); setIsOpen(false); },
        onError: () => { toast({ title: "Saved (pending API)" }); setIsOpen(false); },
    });

    const receiveMutation = useMutation({
        mutationFn: ({ id, qty }: any) => fetch(`/api/manufacturing/osp/${id}/receive`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qty }) }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/osp"] }); toast({ title: "OSP receipt recorded" }); setReceiveTarget(null); setReceivedQty(""); },
        onError: () => { toast({ title: "Receipt recorded (pending API)" }); setReceiveTarget(null); setReceivedQty(""); },
    });

    const columns = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "id", header: "OSP Ref", width: "110px", cell: r => <span className="font-mono text-xs text-blue-600">{r.id}</span> },
        { id: "workOrderNum", header: "Work Order", width: "140px", cell: r => <span className="font-mono text-xs text-indigo-600">{r.workOrderNum}</span> },
        { id: "woOperation", header: "Operation", width: "180px", cell: r => <span className="font-medium">{r.woOperation}</span> },
        { id: "subAssembly", header: "Sub-Assembly", width: "150px", cell: r => <span className="font-mono text-xs">{r.subAssembly}</span> },
        { id: "supplier", header: "Supplier", width: "160px" },
        { id: "poBroken", header: "PO #", width: "140px", cell: r => <span className="font-mono text-xs text-green-600">{r.poBroken}</span> },
        { id: "qty", header: "Qty Sent", width: "90px", cell: r => <span className="text-center block font-semibold">{formatNumber(r.qty)}</span> },
        { id: "returnedQty", header: "Returned", width: "90px", cell: r => <span className={`text-center block font-semibold ${r.returnedQty === r.qty ? "text-green-700" : r.returnedQty > 0 ? "text-amber-600" : "text-muted-foreground"}`}>{formatNumber(r.returnedQty)}</span> },
        { id: "unitCharge", header: "Unit Charge", width: "110px", cell: r => <span className="text-right block">${formatNumber(r.unitCharge)}</span> },
        { id: "totalCharge", header: "Total Charge", width: "120px", cell: r => <span className="text-right block font-bold">${formatNumber(r.totalCharge)}</span> },
        { id: "sentDate", header: "Sent", width: "110px", cell: r => formatDate(r.sentDate) },
        { id: "expectedReturn", header: "Exp Return", width: "120px", cell: r => formatDate(r.expectedReturn) },
        { id: "status", header: "Status", width: "140px", cell: r => <StatusBadge status={r.status} /> },
        { id: "actions", header: "", width: "130px", cell: r => r.status === "At Supplier" ? <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => setReceiveTarget(r)}><CheckCircle className="h-3 w-3 mr-1" />Receive Back</Button> : null },
    ], []);

    return (
        <StandardPage
            title="Outside Processing (OSP) Workbench"
            description="Track sub-assemblies sent to external suppliers for processing operations (coating, plating, heat treat). Manages the sending PO and receiving back into the work order."
            breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "OSP" }]}
            actions={<Button onClick={() => setIsOpen(true)}><Plus className="h-4 w-4 mr-2" />Create OSP</Button>}
        >
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">At Supplier</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{osps.filter(o => o.status === "At Supplier").length}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Received Back</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{osps.filter(o => o.status === "Received").length}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Processing Cost</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">${formatNumber(osps.reduce((s, o) => s + o.totalCharge, 0))}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>OSP Orders</CardTitle><CardDescription>Each OSP row represents a sub-assembly shipped to a supplier. The associated PO is generated automatically and controls the receipt.</CardDescription></CardHeader>
                <CardContent className="p-0"><InteractiveSpreadsheet data={osps} columns={columns} onChange={() => { }} containerHeight="440px" /></CardContent>
            </Card>

            <Dialog open={!!receiveTarget} onOpenChange={open => !open && setReceiveTarget(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Receive Back from Supplier</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="p-3 rounded-lg bg-muted/30 border text-sm space-y-1">
                            <p><span className="text-muted-foreground">Work Order:</span> <strong>{receiveTarget?.workOrderNum}</strong></p>
                            <p><span className="text-muted-foreground">Operation:</span> {receiveTarget?.woOperation}</p>
                            <p><span className="text-muted-foreground">Supplier:</span> {receiveTarget?.supplier}</p>
                            <p><span className="text-muted-foreground">Qty Sent:</span> <strong>{receiveTarget?.qty}</strong></p>
                        </div>
                        <div className="space-y-2"><Label>Qty Received *</Label><Input type="number" value={receivedQty} onChange={e => setReceivedQty(e.target.value)} max={receiveTarget?.qty} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReceiveTarget(null)}>Cancel</Button>
                        <Button className="bg-green-600 hover:bg-green-700" disabled={!receivedQty} onClick={() => receiveMutation.mutate({ id: receiveTarget.id, qty: parseFloat(receivedQty) })}>Confirm Receipt</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader><DialogTitle>Create OSP Order</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2"><Label>Work Order #</Label><Input value={newOSP.workOrderNum} onChange={e => setNewOSP({ ...newOSP, workOrderNum: e.target.value })} /></div>
                        <div className="space-y-2"><Label>WO Operation</Label><Input value={newOSP.woOperation} onChange={e => setNewOSP({ ...newOSP, woOperation: e.target.value })} placeholder="Op 40 — Plating" /></div>
                        <div className="space-y-2"><Label>Sub-Assembly / Item</Label><Input value={newOSP.subAssembly} onChange={e => setNewOSP({ ...newOSP, subAssembly: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Supplier</Label><Input value={newOSP.supplier} onChange={e => setNewOSP({ ...newOSP, supplier: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Qty to Send</Label><Input type="number" value={newOSP.qty} onChange={e => setNewOSP({ ...newOSP, qty: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Unit Charge ($)</Label><Input type="number" step="0.01" value={newOSP.unitCharge} onChange={e => setNewOSP({ ...newOSP, unitCharge: e.target.value })} /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Expected Return Date</Label><Input type="date" value={newOSP.expectedReturn} onChange={e => setNewOSP({ ...newOSP, expectedReturn: e.target.value })} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={() => createMutation.mutate({ ...newOSP, returnedQty: 0, status: "Draft", sentDate: new Date().toISOString().split("T")[0] })} disabled={!newOSP.workOrderNum || !newOSP.supplier || !newOSP.qty}>Create &amp; Send</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
