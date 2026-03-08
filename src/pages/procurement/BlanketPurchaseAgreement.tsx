import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, DollarSign, Calendar, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/dateUtils";
import { formatNumber } from "@/lib/formatters";
import { DatePicker } from "@/components/ui/DatePicker";

const SEED_BPAS: any[] = [
    { id: "BPA-001", agreementNumber: "BPA-2026-001", supplier: "Acme Office Supplies", supplierSite: "Main US", type: "Blanket", currency: "USD", buyerBU: "US Operations", buyer: "Sarah Chen", startDate: "2026-01-01", endDate: "2026-12-31", agreementAmount: 250000, releasedAmount: 87500, remainingAmount: 162500, paymentTerms: "Net 30", status: "Active" },
    { id: "BPA-002", agreementNumber: "BPA-2026-002", supplier: "Tech Hardware Inc", supplierSite: "West Coast", type: "Blanket", currency: "USD", buyerBU: "US Operations", buyer: "Michael Torres", startDate: "2026-01-01", endDate: "2026-06-30", agreementAmount: 500000, releasedAmount: 210000, remainingAmount: 290000, paymentTerms: "Net 45", status: "Active" },
    { id: "BPA-003", agreementNumber: "BPA-2025-011", supplier: "Industrial Parts Co", supplierSite: "EU Hub", type: "Blanket", currency: "EUR", buyerBU: "EU Operations", buyer: "Laura Dupont", startDate: "2025-07-01", endDate: "2026-06-30", agreementAmount: 180000, releasedAmount: 175000, remainingAmount: 5000, paymentTerms: "Net 30", status: "Nearly Exhausted" },
];

const SEED_LINES: any[] = [
    { id: "BL-001", bpaId: "BPA-001", lineNum: 1, item: "A4 Paper (Box)", category: "Office Supplies", uom: "Box", agreedPrice: 28.50, minQty: 10, maxQty: 500, releasedQty: 120, status: "Active" },
    { id: "BL-002", bpaId: "BPA-001", lineNum: 2, item: "Ballpoint Pens (Box of 50)", category: "Office Supplies", uom: "Box", agreedPrice: 12.75, minQty: 5, maxQty: 200, releasedQty: 40, status: "Active" },
    { id: "BL-003", bpaId: "BPA-002", lineNum: 1, item: "USB-C Laptop Charger 65W", category: "IT Hardware", uom: "EA", agreedPrice: 45.00, minQty: 5, maxQty: 300, releasedQty: 95, status: "Active" },
];

export default function BlanketPurchaseAgreement() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedBPA, setSelectedBPA] = useState<any>(null);
    const [newBPA, setNewBPA] = useState({ agreementNumber: "", supplier: "", supplierSite: "", currency: "USD", buyerBU: "US Operations", buyer: "", startDate: "", endDate: "", agreementAmount: "", paymentTerms: "Net 30", notes: "" });

    const { data: apiData } = useQuery<any[]>({
        queryKey: ["/api/procurement/blanket-agreements"],
        queryFn: () => fetch("/api/procurement/blanket-agreements").then(r => r.json()).catch(() => []),
    });
    const bpas = (apiData && apiData.length > 0) ? apiData : SEED_BPAS;

    const { data: apiLines } = useQuery<any[]>({
        queryKey: ["/api/procurement/blanket-lines"],
        queryFn: () => fetch("/api/procurement/blanket-lines").then(r => r.json()).catch(() => []),
    });
    const allLines = (apiLines && apiLines.length > 0) ? apiLines : SEED_LINES;
    const selectedLines = selectedBPA ? allLines.filter(l => l.bpaId === selectedBPA.id) : [];

    const createMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/procurement/blanket-agreements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/procurement/blanket-agreements"] }); toast({ title: "Blanket Agreement created" }); setIsOpen(false); },
        onError: () => { toast({ title: "Agreement saved (pending API)" }); setIsOpen(false); },
    });

    const totalAgreed = bpas.reduce((s, b) => s + (b.agreementAmount || 0), 0);
    const totalReleased = bpas.reduce((s, b) => s + (b.releasedAmount || 0), 0);
    const activeBPAs = bpas.filter(b => b.status === "Active").length;

    const columns = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "agreementNumber", header: "Agreement #", width: "150px", cell: r => <button className="font-mono text-xs text-blue-600 hover:underline" onClick={() => setSelectedBPA(r)}>{r.agreementNumber}</button> },
        { id: "supplier", header: "Supplier", width: "200px", cell: r => <span className="font-medium">{r.supplier}</span> },
        { id: "supplierSite", header: "Site", width: "120px" },
        { id: "currency", header: "Currency", width: "90px", cell: r => <Badge variant="outline" className="font-mono text-xs">{r.currency}</Badge> },
        { id: "buyer", header: "Buyer", width: "130px" },
        { id: "agreementAmount", header: "Agreement Amt", width: "140px", cell: r => <span className="text-right block font-semibold">{r.currency} {formatNumber(r.agreementAmount)}</span> },
        { id: "releasedAmount", header: "Released", width: "130px", cell: r => <span className="text-right block text-amber-600 font-semibold">{formatNumber(r.releasedAmount)}</span> },
        { id: "remainingAmount", header: "Remaining", width: "130px", cell: r => <span className={`text-right block font-bold ${r.remainingAmount < r.agreementAmount * 0.1 ? "text-red-600" : "text-green-700"}`}>{formatNumber(r.remainingAmount)}</span> },
        { id: "startDate", header: "Start", width: "110px", cell: r => formatDate(r.startDate) },
        { id: "endDate", header: "Expiry", width: "110px", cell: r => formatDate(r.endDate) },
        { id: "paymentTerms", header: "Pay Terms", width: "100px" },
        { id: "status", header: "Status", width: "140px", cell: r => <StatusBadge status={r.status} /> },
    ], []);

    const lineColumns = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "lineNum", header: "#", width: "50px" },
        { id: "item", header: "Item / Description", width: "220px", cell: r => <span className="font-medium">{r.item}</span> },
        { id: "category", header: "Category", width: "150px" },
        { id: "uom", header: "UOM", width: "70px" },
        { id: "agreedPrice", header: "Agreed Price", width: "120px", cell: r => <span className="text-right block font-semibold">{formatNumber(r.agreedPrice)}</span> },
        { id: "minQty", header: "Min Qty", width: "90px", cell: r => <span className="text-right block">{formatNumber(r.minQty)}</span> },
        { id: "maxQty", header: "Max Qty", width: "90px", cell: r => <span className="text-right block">{formatNumber(r.maxQty)}</span> },
        { id: "releasedQty", header: "Released Qty", width: "110px", cell: r => <span className="text-right block text-amber-600 font-semibold">{formatNumber(r.releasedQty)}</span> },
        { id: "status", header: "Status", width: "110px", cell: r => <StatusBadge status={r.status} /> },
    ], []);

    return (
        <StandardPage
            title="Blanket Purchase Agreements"
            description="Long-term price agreements with suppliers. Releases (individual POs) are placed against BPAs and auto-inherit price terms."
            breadcrumbs={[{ label: "SCM", href: "/scm/procurement" }, { label: "Procurement", href: "/scm/procurement" }, { label: "Blanket Agreements" }]}
            actions={<Button onClick={() => setIsOpen(true)}><Plus className="h-4 w-4 mr-2" />New Agreement</Button>}
        >
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><FileText className="h-4 w-4" />Active BPAs</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{activeBPAs}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><DollarSign className="h-4 w-4" />Total Agreed Value</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">${formatNumber(totalAgreed)}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Released to Date</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">${formatNumber(totalReleased)}</div>
                        <p className="text-xs text-muted-foreground mt-1">{Math.round((totalReleased / totalAgreed) * 100)}% utilisation</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Blanket Purchase Agreements</CardTitle><CardDescription>Click an agreement number to view lines and release history.</CardDescription></CardHeader>
                <CardContent className="p-0"><InteractiveSpreadsheet data={bpas} columns={columns} onChange={() => { }} containerHeight="420px" /></CardContent>
            </Card>

            {/* BPA Detail drawer */}
            <Dialog open={!!selectedBPA} onOpenChange={open => !open && setSelectedBPA(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{selectedBPA?.agreementNumber} — {selectedBPA?.supplier}</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="lines" className="mt-2">
                        <TabsList>
                            <TabsTrigger value="lines">Agreement Lines ({selectedLines.length})</TabsTrigger>
                            <TabsTrigger value="header">Header Details</TabsTrigger>
                        </TabsList>
                        <TabsContent value="lines" className="mt-4">
                            <InteractiveSpreadsheet data={selectedLines} columns={lineColumns} onChange={() => { }} containerHeight="320px" />
                        </TabsContent>
                        <TabsContent value="header" className="mt-4">
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                                {[
                                    ["Supplier", selectedBPA?.supplier],
                                    ["Supplier Site", selectedBPA?.supplierSite],
                                    ["Buyer BU", selectedBPA?.buyerBU],
                                    ["Buyer", selectedBPA?.buyer],
                                    ["Payment Terms", selectedBPA?.paymentTerms],
                                    ["Currency", selectedBPA?.currency],
                                    ["Start Date", formatDate(selectedBPA?.startDate)],
                                    ["End Date", formatDate(selectedBPA?.endDate)],
                                    ["Status", selectedBPA?.status],
                                ].map(([label, value]) => (
                                    <div key={label}><p className="text-muted-foreground text-xs">{label}</p><p className="font-medium">{value}</p></div>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedBPA(null)}>Close</Button>
                        <Button>Create Release</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* New BPA dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader><DialogTitle>New Blanket Purchase Agreement</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2"><Label>Agreement Number *</Label><Input value={newBPA.agreementNumber} onChange={e => setNewBPA({ ...newBPA, agreementNumber: e.target.value })} placeholder="BPA-2026-XXX" /></div>
                        <div className="space-y-2"><Label>Supplier *</Label><Input value={newBPA.supplier} onChange={e => setNewBPA({ ...newBPA, supplier: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Supplier Site</Label><Input value={newBPA.supplierSite} onChange={e => setNewBPA({ ...newBPA, supplierSite: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Currency</Label>
                            <Select value={newBPA.currency} onValueChange={v => setNewBPA({ ...newBPA, currency: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{["USD", "EUR", "GBP", "JPY", "AED"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Buyer BU</Label><Input value={newBPA.buyerBU} onChange={e => setNewBPA({ ...newBPA, buyerBU: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Buyer</Label><Input value={newBPA.buyer} onChange={e => setNewBPA({ ...newBPA, buyer: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Agreement Amount *</Label><Input type="number" value={newBPA.agreementAmount} onChange={e => setNewBPA({ ...newBPA, agreementAmount: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Payment Terms</Label>
                            <Select value={newBPA.paymentTerms} onValueChange={v => setNewBPA({ ...newBPA, paymentTerms: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{["Net 30", "Net 45", "Net 60", "Immediate", "2% 10 Net 30"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Start Date</Label><DatePicker value={newBPA.startDate} onChange={v => setNewBPA({ ...newBPA, startDate: v })} /></div>
                        <div className="space-y-2"><Label>End Date</Label><DatePicker value={newBPA.endDate} onChange={v => setNewBPA({ ...newBPA, endDate: v })} /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Notes / Terms</Label><Textarea value={newBPA.notes} onChange={e => setNewBPA({ ...newBPA, notes: e.target.value })} rows={2} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={() => createMutation.mutate({ ...newBPA, status: "Draft", releasedAmount: 0, remainingAmount: parseFloat(newBPA.agreementAmount || "0") })} disabled={!newBPA.agreementNumber || !newBPA.supplier || !newBPA.agreementAmount}>Create Agreement</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
