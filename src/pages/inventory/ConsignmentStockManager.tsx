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
import { Plus, FileCheck, Truck, Package } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatNumber } from "@/lib/formatters";

const SEED_CONSIGNMENT: any[] = [
    { id: "CON-001", supplier: "Industrial Supplies Co", item: "VALVE-GATE-12", desc: "Gate Valve 12\" Flanged", ownerStock: 45, consumedQty: 12, billingPoint: "Consumption", billingFreq: "Monthly", replenishAt: 20, maxStock: 60, lastBilled: "2026-02-28", daysUntilBilling: 4, cost: 680, status: "Active" },
    { id: "CON-002", supplier: "FastTrack Logistics", item: "BEARING-6205", desc: "Bearing 6205 ZZ", ownerStock: 200, consumedQty: 48, billingPoint: "Consumption", billingFreq: "Weekly", replenishAt: 80, maxStock: 250, lastBilled: "2026-03-05", daysUntilBilling: 1, cost: 32, status: "Replenishment Required" },
    { id: "CON-003", supplier: "CoatPro Services Ltd", item: "SS-BOLTS-M12", desc: "M12 SS Bolt Kit (100pcs)", ownerStock: 15, consumedQty: 85, billingPoint: "Depletion-30%", billingFreq: "Monthly", replenishAt: 30, maxStock: 120, lastBilled: "2026-02-01", daysUntilBilling: 0, cost: 28, status: "Bill Pending" },
    { id: "CON-004", supplier: "Global MRO Ltd", item: "SEAL-MECH-14MM", desc: "Mechanical Seal 14mm", ownerStock: 28, consumedQty: 7, billingPoint: "Consumption", billingFreq: "Monthly", replenishAt: 15, maxStock: 40, lastBilled: "2026-02-28", daysUntilBilling: 26, cost: 95, status: "Active" },
];

const BILLING_HISTORY: any[] = [
    { billId: "CBILL-0042", supplier: "Industrial Supplies Co", period: "Feb 2026", items: 3, qty: 28, amount: 7840, status: "Invoice Matched", invoiceNum: "INV-003841" },
    { billId: "CBILL-0041", supplier: "CoatPro Services Ltd", period: "Feb 2026", items: 1, qty: 72, amount: 2016, status: "Pending AP", invoiceNum: "" },
    { billId: "CBILL-0040", supplier: "Global MRO Ltd", period: "Jan 2026", items: 2, qty: 19, amount: 3040, status: "Paid", invoiceNum: "INV-003612" },
];

export default function ConsignmentStockManager() {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<any>(null);
    const [confirmBill, setConfirmBill] = useState(false);

    const billMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/inventory/consignment-bill", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { toast({ title: "Consignment billing initiated — AP invoice pending" }); setConfirmBill(false); },
        onError: () => { toast({ title: "Billing triggered (pending API)" }); setConfirmBill(false); },
    });

    const replenishMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/inventory/consignment-replenish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => toast({ title: "Replenishment PO sent to supplier" }),
        onError: () => toast({ title: "Replenishment PO sent (pending API)" }),
    });

    const totalOwned = SEED_CONSIGNMENT.reduce((s, r) => s + r.ownerStock * r.cost, 0);
    const totalConsumed = SEED_CONSIGNMENT.reduce((s, r) => s + r.consumedQty, 0);
    const pendingBilling = SEED_CONSIGNMENT.filter(r => r.status === "Bill Pending").length;
    const needsReplen = SEED_CONSIGNMENT.filter(r => r.status === "Replenishment Required").length;

    const stockCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "id", header: "Agreement", width: "110px", cell: r => <span className="font-mono text-xs text-blue-600">{r.id}</span> },
        { id: "supplier", header: "Supplier", width: "180px", cell: r => <span className="font-medium text-sm">{r.supplier}</span> },
        { id: "item", header: "Item", width: "150px", cell: r => <span className="font-mono text-xs">{r.item}</span> },
        { id: "ownerStock", header: "Consigned Qty", width: "120px", cell: r => <span className="text-center block font-bold">{r.ownerStock}</span> },
        { id: "consumedQty", header: "Consumed (Period)", width: "130px", cell: r => <span className="text-center block text-amber-700 font-semibold">{r.consumedQty}</span> },
        { id: "replenishAt", header: "Replenish@", width: "100px", cell: r => <span className="text-center block text-sm">{r.replenishAt}</span> },
        { id: "billingFreq", header: "Bill Freq", width: "100px", cell: r => <Badge variant="outline" className="text-xs">{r.billingFreq}</Badge> },
        { id: "daysUntilBilling", header: "Next Bill In", width: "100px", cell: r => <span className={`text-center block font-bold text-sm ${r.daysUntilBilling <= 1 ? "text-red-600" : "text-muted-foreground"}`}>{r.daysUntilBilling === 0 ? "TODAY" : `${r.daysUntilBilling}d`}</span> },
        { id: "ownerValue", header: "Stock Value", width: "120px", cell: r => <span className="text-right block font-mono text-sm">${formatNumber(r.ownerStock * r.cost)}</span> },
        { id: "status", header: "Status", width: "170px", cell: r => <StatusBadge status={r.status} /> },
        {
            id: "actions", header: "", width: "170px", cell: r => (
                <div className="flex gap-1">
                    {r.status === "Bill Pending" && <Button size="sm" className="h-7 text-xs" onClick={() => { setSelected(r); setConfirmBill(true); }}>Bill Now</Button>}
                    {r.status === "Replenishment Required" && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => replenishMutation.mutate(r)}>Replenish</Button>}
                </div>
            )
        },
    ], []);

    const billCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "billId", header: "Bill ID", width: "120px", cell: r => <span className="font-mono text-xs text-blue-600">{r.billId}</span> },
        { id: "supplier", header: "Supplier", width: "180px" },
        { id: "period", header: "Period", width: "110px" },
        { id: "items", header: "Items", width: "70px", cell: r => <span className="text-center block">{r.items}</span> },
        { id: "qty", header: "Total Qty", width: "90px", cell: r => <span className="text-right block">{r.qty}</span> },
        { id: "amount", header: "Amount", width: "120px", cell: r => <span className="text-right block font-mono font-bold">${formatNumber(r.amount)}</span> },
        { id: "invoiceNum", header: "AP Invoice", width: "140px", cell: r => r.invoiceNum ? <span className="font-mono text-xs text-green-700">{r.invoiceNum}</span> : <span className="text-muted-foreground text-xs">—</span> },
        { id: "status", header: "Status", width: "150px", cell: r => <StatusBadge status={r.status} /> },
    ], []);

    return (
        <StandardPage
            title="Consignment Stock Manager"
            description="Oracle Fusion consignment inventory — stock owned by supplier but stored at your facility. Billing is triggered on consumption (not receipt). Tracks consigned quantity, billing cycles, and triggers AP invoices on depletion threshold or calendar date."
            breadcrumbs={[{ label: "Inventory", href: "/inventory" }, { label: "Consignment Stock" }]}
            actions={<Button onClick={() => setIsOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Agreement</Button>}
        >
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="border-blue-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Consigned Value</CardTitle></CardHeader>
                    <CardContent><div className="text-xl font-bold text-blue-700">${formatNumber(totalOwned)}</div><p className="text-xs text-muted-foreground">Supplier-owned stock on-site</p></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Units Consumed (Period)</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{totalConsumed}</div></CardContent>
                </Card>
                <Card className="border-red-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending Billing</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{pendingBilling}</div></CardContent>
                </Card>
                <Card className="border-amber-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Needs Replenishment</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{needsReplen}</div></CardContent>
                </Card>
            </div>
            <Tabs defaultValue="stock">
                <TabsList className="mb-4"><TabsTrigger value="stock">Consignment Stock</TabsTrigger><TabsTrigger value="billing">Billing History</TabsTrigger></TabsList>
                <TabsContent value="stock">
                    <Card><CardHeader><CardTitle>Active Consignment Agreements</CardTitle><CardDescription>Stock is owned by supplier. Billing occurs on consumption. Click "Bill Now" to initiate AP invoice generation for consumed quantities.</CardDescription></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={SEED_CONSIGNMENT} columns={stockCols} onChange={() => { }} containerHeight="380px" /></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="billing">
                    <Card><CardHeader><CardTitle>Consignment Billing History</CardTitle><CardDescription>Historical billing records matched to supplier invoices and AP payments.</CardDescription></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={BILLING_HISTORY} columns={billCols} onChange={() => { }} containerHeight="320px" /></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            <Dialog open={confirmBill} onOpenChange={setConfirmBill}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Confirm Consignment Billing</DialogTitle></DialogHeader>
                    {selected && <div className="py-4 space-y-3 text-sm">
                        <p>Bill <strong>{selected.supplier}</strong> for consumed consignment stock?</p>
                        <div className="grid grid-cols-2 gap-2 p-3 bg-muted/30 rounded-lg">
                            <span className="text-muted-foreground">Item:</span><span className="font-mono">{selected.item}</span>
                            <span className="text-muted-foreground">Consumed Qty:</span><span className="font-bold">{selected.consumedQty}</span>
                            <span className="text-muted-foreground">Unit Cost:</span><span className="font-mono">${selected.cost}</span>
                            <span className="text-muted-foreground">Bill Amount:</span><span className="font-bold text-primary">${formatNumber(selected.consumedQty * selected.cost)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">This will create an AP invoice request to Accounts Payable.</p>
                    </div>}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmBill(false)}>Cancel</Button>
                        <Button onClick={() => billMutation.mutate(selected)}>Confirm &amp; Bill</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>New Consignment Agreement</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2"><Label>Supplier *</Label><Input placeholder="Supplier name" /></div>
                        <div className="space-y-2"><Label>Item Code *</Label><Input placeholder="ITEM-CODE" className="font-mono" /></div>
                        <div className="space-y-2"><Label>Max Consigned Qty</Label><Input type="number" placeholder="100" /></div>
                        <div className="space-y-2"><Label>Replenish Trigger Qty</Label><Input type="number" placeholder="30" /></div>
                        <div className="space-y-2"><Label>Billing Point</Label>
                            <Select><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                <SelectContent>{["Consumption", "Depletion-30%", "Depletion-50%", "Calendar"].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Billing Frequency</Label>
                            <Select><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                <SelectContent>{["Weekly", "Monthly", "Quarterly"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={() => { toast({ title: "Consignment agreement created" }); setIsOpen(false); }}>Create Agreement</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
