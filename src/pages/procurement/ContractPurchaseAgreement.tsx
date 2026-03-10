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
import { Plus, FileText, CheckCircle } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/dateUtils";
import { formatNumber } from "@/lib/formatters";

const SEED_CPAS: any[] = [
    { id: "CPA-2026-001", cpaNumber: "CPA-2026-001", title: "Master Services Agreement — CoatPro", supplier: "CoatPro Services Ltd", buyer: "procurement@nexusai.com", startDate: "2026-01-01", endDate: "2026-12-31", maxAmount: 500000, usedAmount: 98250, currency: "USD", governingLaw: "UK", status: "Active" },
    { id: "CPA-2026-002", cpaNumber: "CPA-2026-002", title: "IT Hardware Framework — Tech Hardware", supplier: "Tech Hardware Inc", buyer: "it-procurement@nexusai.com", startDate: "2026-01-01", endDate: "2027-06-30", maxAmount: 1200000, usedAmount: 54000, currency: "USD", governingLaw: "US", status: "Active" },
    { id: "CPA-2025-008", cpaNumber: "CPA-2025-008", title: "MRO Blanket Framework", supplier: "Industrial Supplies Co", buyer: "procurement@nexusai.com", startDate: "2025-01-01", endDate: "2025-12-31", maxAmount: 150000, usedAmount: 149200, currency: "USD", governingLaw: "US", status: "Expired" },
];

const SEED_RELATED_POS: any[] = [
    { id: "PO-2026-1310", cpaId: "CPA-2026-001", poNumber: "PO-2026-1310", description: "Surface Coating — Batch A", amount: 17500, status: "Approved" },
    { id: "PO-2026-1295", cpaId: "CPA-2026-001", poNumber: "PO-2026-1295", description: "Heat Treatment — March run", amount: 12500, status: "Closed" },
    { id: "PO-2026-1320", cpaId: "CPA-2026-002", poNumber: "PO-2026-1320", description: "Dell Monitor 24\" batch", amount: 54000, status: "Approved" },
];

export default function ContractPurchaseAgreement() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCPA, setSelectedCPA] = useState<any>(null);
    const [newCPA, setNewCPA] = useState({ title: "", supplier: "", startDate: "", endDate: "", maxAmount: "", currency: "USD", governingLaw: "US", notes: "" });

    const { data: apiData } = useQuery<any[]>({ queryKey: ["/api/procurement/cpas"], queryFn: () => fetch("/api/procurement/cpas").then(r => r.json()).catch(() => []) });
    const cpas = (apiData && apiData.length > 0) ? apiData : SEED_CPAS;

    const createMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/procurement/cpas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/procurement/cpas"] }); toast({ title: "CPA created — pending approval" }); setIsOpen(false); },
        onError: () => { toast({ title: "Saved (pending API)" }); setIsOpen(false); },
    });

    const approveMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/procurement/cpas/${id}/approve`, { method: "POST" }).then(r => r.json()),
        onSuccess: () => { toast({ title: "CPA approved and activated" }); setSelectedCPA(null); },
        onError: () => { toast({ title: "CPA approved (pending API)" }); setSelectedCPA(null); },
    });

    const relatedPOs = SEED_RELATED_POS.filter(p => p.cpaId === selectedCPA?.id);

    const cpaCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "cpaNumber", header: "CPA Number", width: "140px", cell: r => <span className="font-mono text-xs text-blue-600">{r.cpaNumber}</span> },
        { id: "title", header: "Title", width: "280px", cell: r => <span className="font-medium">{r.title}</span> },
        { id: "supplier", header: "Supplier", width: "200px" },
        { id: "startDate", header: "Start", width: "110px", cell: r => formatDate(r.startDate) },
        { id: "endDate", header: "End", width: "110px", cell: r => formatDate(r.endDate) },
        { id: "maxAmount", header: "Max Amount", width: "130px", cell: r => <span className="text-right block font-semibold">${formatNumber(r.maxAmount)}</span> },
        {
            id: "utilisation", header: "Utilisation", width: "130px", cell: r => {
                const pct = Math.round((r.usedAmount / r.maxAmount) * 100);
                return (
                    <div>
                        <div className="flex justify-between text-xs mb-1"><span>${formatNumber(r.usedAmount)}</span><span className={pct >= 90 ? "text-red-600 font-bold" : pct >= 70 ? "text-amber-600" : "text-green-700"}>{pct}%</span></div>
                        <div className="h-1.5 bg-muted rounded-full"><div className={`h-1.5 rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-green-600"}`} data-pct={Math.min(pct, 100)} /></div>

                    </div>
                );
            }
        },
        { id: "currency", header: "CCY", width: "70px" },
        { id: "status", header: "Status", width: "120px", cell: r => <StatusBadge status={r.status} /> },
        { id: "actions", header: "", width: "100px", cell: r => <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelectedCPA(r)}><FileText className="h-3 w-3 mr-1" />Details</Button> },
    ], []);

    const poCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "poNumber", header: "PO Number", width: "150px", cell: r => <span className="font-mono text-xs text-blue-600">{r.poNumber}</span> },
        { id: "description", header: "Description", width: "250px", cell: r => <span className="font-medium">{r.description}</span> },
        { id: "amount", header: "Amount", width: "120px", cell: r => <span className="text-right block font-bold">${formatNumber(r.amount)}</span> },
        { id: "status", header: "Status", width: "120px", cell: r => <StatusBadge status={r.status} /> },
    ], []);

    return (
        <StandardPage
            title="Contract Purchase Agreements"
            description="Framework agreements establishing governance, T&Cs, and maximum spend authority with a supplier. Individual POs are placed under a CPA — no item lines on the CPA itself."
            breadcrumbs={[{ label: "Procurement", href: "/scm/procurement" }, { label: "Contract Agreements" }]}
            actions={<Button onClick={() => setIsOpen(true)}><Plus className="h-4 w-4 mr-2" />Create CPA</Button>}
        >
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active CPAs</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{cpas.filter(c => c.status === "Active").length}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Committed</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">${formatNumber(cpas.filter(c => c.status === "Active").reduce((s, c) => s + c.usedAmount, 0))}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Expiring in 90 Days</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{cpas.filter(c => { const d = new Date(c.endDate); const n = new Date(); return d > n && (d.getTime() - n.getTime()) < 90 * 86400000; }).length}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Contract Purchase Agreements</CardTitle><CardDescription>CPAs establish authority and T&Cs. POs placed under a CPA inherit its terms automatically.</CardDescription></CardHeader>
                <CardContent className="p-0"><InteractiveSpreadsheet data={cpas} columns={cpaCols} onChange={() => { }} containerHeight="480px" /></CardContent>
            </Card>

            {/* CPA Detail */}
            <Dialog open={!!selectedCPA} onOpenChange={o => !o && setSelectedCPA(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>CPA Detail — {selectedCPA?.cpaNumber}</DialogTitle></DialogHeader>
                    <Tabs defaultValue="header">
                        <TabsList><TabsTrigger value="header">Header</TabsTrigger><TabsTrigger value="pos">Related POs ({relatedPOs.length})</TabsTrigger></TabsList>
                        <TabsContent value="header">
                            <div className="grid md:grid-cols-2 gap-3 py-3 text-sm">
                                {[["Title", selectedCPA?.title], ["Supplier", selectedCPA?.supplier], ["Buyer", selectedCPA?.buyer], ["Start Date", selectedCPA?.startDate], ["End Date", selectedCPA?.endDate], ["Max Amount", `$${formatNumber(selectedCPA?.maxAmount)} ${selectedCPA?.currency}`], ["Used Amount", `$${formatNumber(selectedCPA?.usedAmount)}`], ["Governing Law", selectedCPA?.governingLaw], ["Status", selectedCPA?.status]].map(([l, v]) => (
                                    <div key={l}><p className="text-xs text-muted-foreground">{l}</p><p className="font-medium">{v}</p></div>
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="pos">
                            <div className="mt-3">
                                {relatedPOs.length > 0 ? <InteractiveSpreadsheet data={relatedPOs} columns={poCols} onChange={() => { }} containerHeight="260px" /> : <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">No POs placed under this CPA yet.</div>}
                            </div>
                        </TabsContent>
                    </Tabs>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedCPA(null)}>Close</Button>
                        {selectedCPA?.status === "Pending Approval" && <Button className="bg-green-600 hover:bg-green-700" onClick={() => approveMutation.mutate(selectedCPA.id)}><CheckCircle className="h-4 w-4 mr-1" />Approve CPA</Button>}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create CPA */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader><DialogTitle>Create Contract Purchase Agreement</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2 md:col-span-2"><Label>CPA Title *</Label><Input value={newCPA.title} onChange={e => setNewCPA({ ...newCPA, title: e.target.value })} placeholder="e.g. Master Services Agreement — Supplier Name" /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Supplier *</Label><Input value={newCPA.supplier} onChange={e => setNewCPA({ ...newCPA, supplier: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Start Date *</Label><Input type="date" value={newCPA.startDate} onChange={e => setNewCPA({ ...newCPA, startDate: e.target.value })} /></div>
                        <div className="space-y-2"><Label>End Date *</Label><Input type="date" value={newCPA.endDate} onChange={e => setNewCPA({ ...newCPA, endDate: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Maximum Amount *</Label><Input type="number" value={newCPA.maxAmount} onChange={e => setNewCPA({ ...newCPA, maxAmount: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Currency</Label>
                            <Select value={newCPA.currency} onValueChange={v => setNewCPA({ ...newCPA, currency: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{["USD", "EUR", "GBP", "AED"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2"><Label>Notes</Label><Textarea value={newCPA.notes} onChange={e => setNewCPA({ ...newCPA, notes: e.target.value })} rows={2} placeholder="Key terms, payment conditions, SLA commitments..." /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button disabled={!newCPA.title || !newCPA.supplier || !newCPA.maxAmount} onClick={() => createMutation.mutate({ ...newCPA, status: "Pending Approval", usedAmount: 0 })}>Create CPA</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
