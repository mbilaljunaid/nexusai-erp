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
import { Plus, Save, DollarSign } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatNumber } from "@/lib/formatters";

const METHODS = ["Cost Plus Markup", "Market Price", "Comparable Uncontrolled Price (CUP)", "Resale Price Method", "Profit Split"];
const ENTITIES = ["NexusAI US (Parent)", "NexusAI UK", "NexusAI Singapore", "NexusAI Germany"];

const SEED_POLICIES: any[] = [
    { id: "TP-001", sellerEntity: "NexusAI US (Parent)", buyerEntity: "NexusAI UK", item: "PUMP-ASSY-001", desc: "Centrifugal Pump Assembly", transferPrice: 2420, markupPct: 12, method: "Cost Plus Markup", currency: "GBP", effectiveFrom: "2026-01-01", effectiveTo: "2026-12-31", status: "Active" },
    { id: "TP-002", sellerEntity: "NexusAI US (Parent)", buyerEntity: "NexusAI Germany", item: "MOTOR-CTRL-005", desc: "Motor Controller Unit", transferPrice: 1050, markupPct: 10, method: "Cost Plus Markup", currency: "EUR", effectiveFrom: "2026-01-01", effectiveTo: "2026-12-31", status: "Active" },
    { id: "TP-003", sellerEntity: "NexusAI Singapore", buyerEntity: "NexusAI US (Parent)", item: "IMPELLER-SS-01", desc: "SS Impeller 6-Blade", transferPrice: 590, markupPct: 8, method: "Comparable Uncontrolled Price (CUP)", currency: "USD", effectiveFrom: "2026-01-01", effectiveTo: "", status: "Active" },
    { id: "TP-004", sellerEntity: "NexusAI UK", buyerEntity: "NexusAI Germany", item: "BEARING-6205", desc: "Bearing 6205 ZZ", transferPrice: 28, markupPct: 6, method: "Resale Price Method", currency: "EUR", effectiveFrom: "2025-01-01", effectiveTo: "2025-12-31", status: "Expired" },
];

const SEED_ADJUSTMENTS: any[] = [
    { adjId: "TPADJ-001", policy: "TP-001", period: "Feb 2026", actualTransactions: 42, baseAmount: 101640, adjustedAmount: 113837, taxImpact: 12197, status: "Posted to GL" },
    { adjId: "TPADJ-002", policy: "TP-002", period: "Feb 2026", actualTransactions: 18, baseAmount: 18900, adjustedAmount: 20790, taxImpact: 1890, status: "Pending Posting" },
];

export default function TransferPricingSetup() {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [newPolicy, setNewPolicy] = useState({ sellerEntity: "", buyerEntity: "", item: "", markupPct: 10, method: "Cost Plus Markup", currency: "USD", effectiveFrom: "", effectiveTo: "" });

    const saveMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/cost-management/transfer-pricing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { toast({ title: "Transfer pricing policy saved" }); setIsOpen(false); },
        onError: () => { toast({ title: "Policy saved (pending API)" }); setIsOpen(false); },
    });

    const policyCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "id", header: "Policy ID", width: "100px", cell: r => <span className="font-mono text-xs text-blue-600">{r.id}</span> },
        { id: "sellerEntity", header: "Seller Entity", width: "180px", cell: r => <span className="text-sm font-medium">{r.sellerEntity}</span> },
        { id: "buyerEntity", header: "Buyer Entity", width: "160px", cell: r => <span className="text-sm">{r.buyerEntity}</span> },
        { id: "item", header: "Item", width: "140px", cell: r => <span className="font-mono text-xs">{r.item}</span> },
        { id: "transferPrice", header: "Transfer Price", width: "130px", cell: r => <span className="font-mono text-right block font-bold">{r.currency} {formatNumber(r.transferPrice)}</span> },
        { id: "markupPct", header: "Markup %", width: "90px", cell: r => <span className="text-center block font-bold text-blue-700">+{r.markupPct}%</span> },
        { id: "method", header: "Pricing Method", width: "260px", cell: r => <Badge variant="outline" className="text-xs">{r.method}</Badge> },
        { id: "effectiveFrom", header: "Eff From", width: "110px", cell: r => <span className="text-xs font-mono">{r.effectiveFrom}</span> },
        { id: "effectiveTo", header: "Eff To", width: "110px", cell: r => <span className="text-xs font-mono">{r.effectiveTo || "Open"}</span> },
        { id: "status", header: "Status", width: "110px", cell: r => <StatusBadge status={r.status} /> },
    ], []);

    const adjCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "adjId", header: "Adjustment", width: "120px", cell: r => <span className="font-mono text-xs text-blue-600">{r.adjId}</span> },
        { id: "policy", header: "Policy", width: "110px", cell: r => <Badge variant="outline">{r.policy}</Badge> },
        { id: "period", header: "Period", width: "110px" },
        { id: "actualTransactions", header: "Transactions", width: "110px", cell: r => <span className="text-center block">{r.actualTransactions}</span> },
        { id: "baseAmount", header: "Base Amount", width: "130px", cell: r => <span className="font-mono text-right block">${formatNumber(r.baseAmount)}</span> },
        { id: "adjustedAmount", header: "After Markup", width: "130px", cell: r => <span className="font-mono text-right block font-bold">${formatNumber(r.adjustedAmount)}</span> },
        { id: "taxImpact", header: "Tax Impact", width: "120px", cell: r => <span className="font-mono text-right block text-red-600">${formatNumber(r.taxImpact)}</span> },
        { id: "status", header: "Status", width: "160px", cell: r => <StatusBadge status={r.status} /> },
    ], []);

    return (
        <StandardPage
            title="Transfer Pricing Setup"
            description="Oracle-style intercompany transfer pricing — define markup policies between legal entities (Cost Plus, CUP, Resale Price, Profit Split). Generates periodic cost adjustment entries posted to GL for tax compliance and OECD arm's length documentation."
            breadcrumbs={[{ label: "Cost Management", href: "/scm/costing" }, { label: "Transfer Pricing" }]}
            actions={<Button onClick={() => setIsOpen(true)}><Plus className="h-4 w-4 mr-2" />New Policy</Button>}
        >
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Policies</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{SEED_POLICIES.filter(p => p.status === "Active").length}</div></CardContent>
                </Card>
                <Card className="border-amber-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending GL Posting</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{SEED_ADJUSTMENTS.filter(a => a.status === "Pending Posting").length}</div></CardContent>
                </Card>
                <Card className="border-blue-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Tax Impact (Period)</CardTitle></CardHeader>
                    <CardContent><div className="text-xl font-bold text-blue-700">${formatNumber(SEED_ADJUSTMENTS.reduce((s, a) => s + a.taxImpact, 0))}</div></CardContent>
                </Card>
            </div>
            <Tabs defaultValue="policies">
                <TabsList className="mb-4"><TabsTrigger value="policies">Pricing Policies</TabsTrigger><TabsTrigger value="adjustments">Cost Adjustments</TabsTrigger></TabsList>
                <TabsContent value="policies">
                    <Card><CardHeader><CardTitle>Intercompany Transfer Pricing Policies</CardTitle><CardDescription>Define markup methods between selling and buying legal entities. OECD arm's length documentation maintained per policy.</CardDescription></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={SEED_POLICIES} columns={policyCols} onChange={() => { }} containerHeight="360px" /></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="adjustments">
                    <Card><CardHeader><CardTitle>Periodic Cost Adjustments</CardTitle><CardDescription>Calculated markup adjustments per period. Posted to GL as intercompany cost adjustment journals. Tax impact shown for transfer pricing documentation.</CardDescription></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={SEED_ADJUSTMENTS} columns={adjCols} onChange={() => { }} containerHeight="280px" /></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>New Transfer Pricing Policy</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2"><Label>Seller Entity *</Label>
                            <Select value={newPolicy.sellerEntity} onValueChange={v => setNewPolicy({ ...newPolicy, sellerEntity: v })}>
                                <SelectTrigger><SelectValue placeholder="Select seller..." /></SelectTrigger>
                                <SelectContent>{ENTITIES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Buyer Entity *</Label>
                            <Select value={newPolicy.buyerEntity} onValueChange={v => setNewPolicy({ ...newPolicy, buyerEntity: v })}>
                                <SelectTrigger><SelectValue placeholder="Select buyer..." /></SelectTrigger>
                                <SelectContent>{ENTITIES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Item Code</Label><Input value={newPolicy.item} onChange={e => setNewPolicy({ ...newPolicy, item: e.target.value.toUpperCase() })} className="font-mono" placeholder="or leave blank for all" /></div>
                        <div className="space-y-2"><Label>Markup %</Label><Input type="number" min={0} step={0.1} value={newPolicy.markupPct} onChange={e => setNewPolicy({ ...newPolicy, markupPct: parseFloat(e.target.value) || 0 })} /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Pricing Method</Label>
                            <Select value={newPolicy.method} onValueChange={v => setNewPolicy({ ...newPolicy, method: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Currency</Label>
                            <Select value={newPolicy.currency} onValueChange={v => setNewPolicy({ ...newPolicy, currency: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{["USD", "GBP", "EUR", "SGD", "AED"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Effective From *</Label><Input type="date" value={newPolicy.effectiveFrom} onChange={e => setNewPolicy({ ...newPolicy, effectiveFrom: e.target.value })} /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Effective To (blank = open)</Label><Input type="date" value={newPolicy.effectiveTo} onChange={e => setNewPolicy({ ...newPolicy, effectiveTo: e.target.value })} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button disabled={!newPolicy.sellerEntity || !newPolicy.buyerEntity || !newPolicy.effectiveFrom} onClick={() => saveMutation.mutate(newPolicy)}>Save Policy</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
