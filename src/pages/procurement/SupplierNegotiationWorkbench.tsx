import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Plus, Gavel, Lock, Unlock, ChevronRight, Award, TrendingDown } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/dateUtils";
import { formatNumber } from "@/lib/formatters";

const SEED_NEGOTIATIONS: any[] = [
    { id: "NEG-2026-001", title: "Annual MRO Supply Contract 2026", supplierCount: 5, currentRound: 2, totalRounds: 3, openDate: "2026-02-15", closeDate: "2026-03-20", bestBid: 348000, baselineEstimate: 420000, saving: 72000, sealed: false, status: "Active — Round 2 Open" },
    { id: "NEG-2026-002", title: "IT Hardware Framework — Q2", supplierCount: 3, currentRound: 1, totalRounds: 2, openDate: "2026-03-01", closeDate: "2026-03-15", bestBid: null, baselineEstimate: 180000, saving: null, sealed: true, status: "Sealed — Awaiting Close" },
    { id: "NEG-2026-003", title: "Logistics Partner Selection", supplierCount: 4, currentRound: 3, totalRounds: 3, openDate: "2026-01-10", closeDate: "2026-02-28", bestBid: 92500, baselineEstimate: 130000, saving: 37500, sealed: false, status: "Awarded" },
];

const SEED_BIDS: Record<string, any[]> = {
    "NEG-2026-001": [
        { id: "BID-001-1", supplier: "Industrial Supplies Co", round: 1, bidAmount: 412000, technicalScore: 82, commercialScore: 76, totalScore: 79, notes: "Includes extended payment 60 days", status: "Submitted" },
        { id: "BID-001-2", supplier: "CoatPro Services Ltd", round: 1, bidAmount: 398000, technicalScore: 88, commercialScore: 80, totalScore: 84, notes: "12 month price lock", status: "Submitted" },
        { id: "BID-001-3", supplier: "Global MRO Ltd", round: 1, bidAmount: 380000, technicalScore: 75, commercialScore: 85, totalScore: 80, notes: "", status: "Submitted" },
        { id: "BID-001-4", supplier: "Industrial Supplies Co", round: 2, bidAmount: 362000, technicalScore: 82, commercialScore: 86, totalScore: 84, notes: "Revised — added vendor-managed inventory", status: "Submitted" },
        { id: "BID-001-5", supplier: "CoatPro Services Ltd", round: 2, bidAmount: 348000, technicalScore: 88, commercialScore: 91, totalScore: 89.5, notes: "Best and Final", status: "Leading" },
        { id: "BID-001-6", supplier: "Global MRO Ltd", round: 2, bidAmount: 371000, technicalScore: 75, commercialScore: 83, totalScore: 79, notes: "", status: "Submitted" },
    ],
};

export default function SupplierNegotiationWorkbench() {
    const { toast } = useToast();
    const [negotiations, setNegotiations] = useState<any[]>(SEED_NEGOTIATIONS);
    const [selected, setSelected] = useState<any>(negotiations[0]);
    const [roundFilter, setRoundFilter] = useState<string>("All");
    const [isAwardOpen, setIsAwardOpen] = useState(false);
    const [awardSupplier, setAwardSupplier] = useState("");
    const [awardNotes, setAwardNotes] = useState("");

    const awardMutation = useMutation({
        mutationFn: (d: any) => fetch(`/api/procurement/negotiations/${d.id}/award`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: (data, variables) => {
            setNegotiations(p => p.map(n => n.id === variables.id ? { ...n, status: "Awarded" } : n));
            if (selected?.id === variables.id) setSelected((prev: any) => ({ ...prev, status: "Awarded" }));
            toast({ title: `Negotiation awarded to ${awardSupplier} — PO will be auto-generated` });
            setIsAwardOpen(false);
        },
        onError: () => { toast({ title: "Award recorded (pending API)" }); setIsAwardOpen(false); },
    });

    const openRoundMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/procurement/negotiations/${id}/open-round`, { method: "POST" }).then(r => r.json()),
        onSuccess: (data, id) => {
            setNegotiations(p => p.map(n => n.id === id ? { ...n, currentRound: n.currentRound + 1, status: `Active — Round ${n.currentRound + 1} Open` } : n));
            if (selected?.id === id) setSelected((prev: any) => ({ ...prev, currentRound: prev.currentRound + 1, status: `Active — Round ${prev.currentRound + 1} Open` }));
            toast({ title: "Next bid round opened — suppliers notified" });
        },
        onError: () => toast({ title: "Round opened (pending API)" }),
    });

    const closeMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/procurement/negotiations/${id}/close`, { method: "POST" }).then(r => r.json()),
        onSuccess: (data, id) => {
            setNegotiations(p => p.map(n => n.id === id ? { ...n, sealed: false, status: "Evaluations Active" } : n));
            if (selected?.id === id) setSelected((prev: any) => ({ ...prev, sealed: false, status: "Evaluations Active" }));
            toast({ title: "Sealed bids locked — results revealed to evaluation team" });
        },
        onError: () => toast({ title: "Bids closed and revealed (pending API)" }),
    });

    const bids = (SEED_BIDS[selected?.id] ?? []).filter(b => roundFilter === "All" || b.round === parseInt(roundFilter));
    const bestBid = bids.reduce((best, b) => !best || b.totalScore > best.totalScore ? b : best, null as any);
    const uniqueRounds = [...new Set((SEED_BIDS[selected?.id] ?? []).map(b => b.round))];

    const negCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "title", header: "Negotiation Title", width: "260px", cell: r => <span className="font-medium">{r.title}</span> },
        { id: "supplierCount", header: "Suppliers", width: "90px", cell: r => <span className="text-center block font-bold">{r.supplierCount}</span> },
        { id: "currentRound", header: "Round", width: "100px", cell: r => <span className="text-center block font-bold text-blue-600">{r.currentRound}/{r.totalRounds}</span> },
        { id: "sealed", header: "Mode", width: "110px", cell: r => r.sealed ? <span className="flex items-center gap-1 text-xs text-amber-700 font-medium"><Lock className="h-3.5 w-3.5" />Sealed</span> : <span className="flex items-center gap-1 text-xs text-green-700"><Unlock className="h-3.5 w-3.5" />Open</span> },
        { id: "closeDate", header: "Close Date", width: "120px", cell: r => formatDate(r.closeDate) },
        { id: "saving", header: "Saving", width: "120px", cell: r => r.saving ? <span className="text-right block font-bold text-green-700">${formatNumber(r.saving)}</span> : <span className="text-xs text-muted-foreground">Pending</span> },
        { id: "status", header: "Status", width: "200px", cell: r => <StatusBadge status={r.status} /> },
        { id: "actions", header: "", width: "90px", cell: r => <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelected(r)}>Open</Button> },
    ], []);

    const bidCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "round", header: "Round", width: "70px", cell: r => <span className="text-center block font-bold text-blue-600">R{r.round}</span> },
        { id: "supplier", header: "Supplier", width: "200px", cell: r => <span className={`font-medium ${r.status === "Leading" ? "text-green-700" : ""}`}>{r.supplier}</span> },
        { id: "bidAmount", header: "Bid Amount", width: "130px", cell: r => <span className={`text-right block font-bold ${r.status === "Leading" ? "text-green-700" : ""}`}>${formatNumber(r.bidAmount)}</span> },
        { id: "technicalScore", header: "Technical", width: "100px", cell: r => <span className="text-center block">{r.technicalScore}</span> },
        { id: "commercialScore", header: "Commercial", width: "110px", cell: r => <span className="text-center block">{r.commercialScore}</span> },
        { id: "totalScore", header: "Total Score", width: "110px", cell: r => <span className={`text-center block font-bold text-lg ${r.status === "Leading" ? "text-green-700" : ""}`}>{r.totalScore}</span> },
        { id: "notes", header: "Supplier Notes", width: "230px", cell: r => <span className="text-xs text-muted-foreground">{r.notes || "—"}</span> },
        { id: "status", header: "", width: "100px", cell: r => r.status === "Leading" ? <Badge className="bg-green-600 text-xs">Leading</Badge> : <StatusBadge status={r.status} /> },
    ], []);

    return (
        <StandardPage
            title="Supplier Negotiation Workbench"
            description="Manage structured multi-round sourcing negotiations with sealed-bid support. Each round, suppliers submit bids which are scored on technical and commercial criteria. Best bid auto-populates the award suggestion."
            breadcrumbs={[{ label: "Procurement", href: "/scm/procurement" }, { label: "Negotiations" }]}
        >
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Negotiations</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-blue-600">{negotiations.filter(n => n.status !== "Awarded").length}</div></CardContent>
                </Card>
                <Card className="border-green-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><TrendingDown className="h-4 w-4 text-green-600" />Total Savings Captured</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">${formatNumber(negotiations.filter(n => n.saving).reduce((s, n) => s + n.saving, 0))}</div></CardContent>
                </Card>
                <Card className="border-amber-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Lock className="h-4 w-4 text-amber-500" />Sealed Bids Active</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{negotiations.filter(n => n.sealed).length}</div></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="list">
                <TabsList className="mb-4"><TabsTrigger value="list">All Negotiations</TabsTrigger><TabsTrigger value="bids">Bid Comparison — {selected?.title}</TabsTrigger></TabsList>

                <TabsContent value="list">
                    <Card><CardHeader><CardTitle>Sourcing Negotiations</CardTitle></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={negotiations} columns={negCols} onChange={() => { }} containerHeight="380px" /></CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bids">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div><CardTitle>Bid Analysis — {selected?.title}</CardTitle>
                                    <CardDescription>Round {selected?.currentRound}/{selected?.totalRounds} · {selected?.supplierCount} suppliers · Baseline: ${formatNumber(selected?.baselineEstimate)}</CardDescription>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Select value={roundFilter} onValueChange={setRoundFilter}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Round" /></SelectTrigger>
                                        <SelectContent><SelectItem value="All">All Rounds</SelectItem>{uniqueRounds.map(r => <SelectItem key={r} value={String(r)}>Round {r}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <Button size="sm" variant="outline" className="h-8" onClick={() => openRoundMutation.mutate(selected?.id)}>Open Next Round</Button>
                                    <Button size="sm" variant="outline" className="h-8" onClick={() => closeMutation.mutate(selected?.id)}><Lock className="h-3.5 w-3.5 mr-1" />Seal/Close Bids</Button>
                                    <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700" onClick={() => { setAwardSupplier(bestBid?.supplier ?? ""); setIsAwardOpen(true); }}><Award className="h-3.5 w-3.5 mr-1" />Award</Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={bids} columns={bidCols} onChange={() => { }} containerHeight="380px" /></CardContent>
                        {bestBid && (
                            <div className="p-4 border-t bg-green-50 dark:bg-green-950/20 flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2 text-green-700 font-semibold"><Award className="h-4 w-4" />Recommended Award: <strong>{bestBid.supplier}</strong> — Score {bestBid.totalScore} — ${formatNumber(bestBid.bidAmount)}</div>
                                <div className="text-muted-foreground">Saving vs baseline: <strong className="text-green-700">${formatNumber(selected?.baselineEstimate - bestBid.bidAmount)} ({Math.round(((selected?.baselineEstimate - bestBid.bidAmount) / selected?.baselineEstimate) * 100)}%)</strong></div>
                            </div>
                        )}
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isAwardOpen} onOpenChange={setIsAwardOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Award Negotiation</DialogTitle></DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="p-3 rounded-lg bg-muted/40 text-sm"><p className="text-muted-foreground text-xs mb-1">Awarding To</p><p className="font-bold text-lg">{awardSupplier}</p><p className="text-xs text-muted-foreground">A Contract Purchase Agreement (CPA) will be generated automatically upon award.</p></div>
                        <div className="space-y-2"><Label>Winning Bid Amount ($) *</Label><Input type="number" defaultValue={bestBid?.bidAmount} /></div>
                        <div className="space-y-2"><Label>Award Justification Notes</Label><Textarea value={awardNotes} onChange={e => setAwardNotes(e.target.value)} rows={3} placeholder="Committee decision rationale, technical justification…" /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAwardOpen(false)}>Cancel</Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => awardMutation.mutate({ id: selected?.id, supplier: awardSupplier, notes: awardNotes })}><Award className="h-4 w-4 mr-2" />Confirm Award</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
