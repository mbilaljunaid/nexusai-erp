import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/formatters";
import { Plus, Pencil, FileText, TrendingDown, Calculator } from "lucide-react";

// Oracle OKL: Initial Direct Costs (IDC) — IFRS 16 / ASC 842 incremental costs

interface IDCRecord {
    id: string; leaseRef: string; costType: string; vendor: string; invoiceRef: string; costDate: string; amount: number; currency: string; amortisationMethod: "Straight-Line" | "Effective Interest"; leaseTerm: number; amortisedToDate: number; unamortised: number; glAccount: string; status: "Active" | "Fully Amortised";
}

const IDC_TYPES = [
    "Legal & Professional Fees — Lease Negotiation",
    "Commission — Lease Brokers",
    "Due Diligence Costs",
    "Valuation Costs",
    "Stamp Duty / Registration (Incremental)",
    "Other Incremental Costs",
];

const MOCK_IDC: IDCRecord[] = [
    { id: "1", leaseRef: "LS-2024-003", costType: "Legal & Professional Fees — Lease Negotiation", vendor: "Clifford Chance LLP", invoiceRef: "CC-INV-2024-0182", costDate: "2024-01-05", amount: 28500, currency: "GBP", amortisationMethod: "Straight-Line", leaseTerm: 120, amortisedToDate: 6556, unamortised: 21944, glAccount: "6421-IDC-AMORT", status: "Active" },
    { id: "2", leaseRef: "LS-2024-003", costType: "Commission — Lease Brokers", vendor: "JLL Property", invoiceRef: "JLL-2024-0091", costDate: "2024-01-10", amount: 15000, currency: "GBP", amortisationMethod: "Straight-Line", leaseTerm: 120, amortisedToDate: 3450, unamortised: 11550, glAccount: "6421-IDC-AMORT", status: "Active" },
    { id: "3", leaseRef: "LS-2025-007", costType: "Due Diligence Costs", vendor: "BDO LLP", invoiceRef: "BDO-2025-0441", costDate: "2025-04-01", amount: 8900, currency: "GBP", amortisationMethod: "Straight-Line", leaseTerm: 24, amortisedToDate: 5487, unamortised: 3413, glAccount: "6421-IDC-AMORT", status: "Active" },
];

export function LeaseInitialDirectCosts() {
    const { toast } = useToast();
    const [idcs, setIdcs] = useState<IDCRecord[]>(MOCK_IDC);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState<Partial<IDCRecord>>({
        amortisationMethod: "Straight-Line", currency: "GBP", status: "Active",
        costDate: new Date().toISOString().split("T")[0],
    });

    const totalIDC = idcs.reduce((s, r) => s + r.amount, 0);
    const totalUnamortised = idcs.reduce((s, r) => s + r.unamortised, 0);

    const handleAdd = () => {
        if (!form.leaseRef || !form.costType || !form.amount) { toast({ title: "Lease, type and amount required", variant: "destructive" }); return; }
        const record: IDCRecord = {
            id: Date.now().toString(),
            amortisedToDate: 0,
            unamortised: form.amount!,
            glAccount: "6421-IDC-AMORT",
            ...form,
        } as IDCRecord;
        setIdcs(prev => [...prev, record]);
        setShowAdd(false);
        setForm({ amortisationMethod: "Straight-Line", currency: "GBP", status: "Active", costDate: new Date().toISOString().split("T")[0] });
        toast({ title: "Initial Direct Cost recorded", description: "IDC will be amortised over the lease term against the ROU asset.", className: "bg-green-900 border-green-700 text-white" });
    };

    return (
        <StandardPage
            title="Initial Direct Costs"
            description="Record and amortise IFRS 16 / ASC 842 incremental lease inception costs (legal, broker commissions, due diligence)"
            actions={<Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" />Add IDC</Button>}
        >
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400">
                <FileText className="h-3 w-3 inline mr-1" />
                Under IFRS 16 and ASC 842, Initial Direct Costs that are incremental to obtaining a lease must be added to the Right-of-Use (ROU) asset and amortised over the lease term. Non-incremental costs are expensed immediately.
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                    { label: "Total IDC Recorded", value: `${formatNumber(totalIDC)} GBP`, color: "text-blue-400" },
                    { label: "Total Amortised to Date", value: `${formatNumber(totalIDC - totalUnamortised)} GBP`, color: "text-green-400" },
                    { label: "Remaining Unamortised", value: `${formatNumber(totalUnamortised)} GBP`, color: "text-amber-400" },
                ].map(m => (
                    <Card key={m.label}><CardContent className="pt-4 pb-4">
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                        <p className={`text-xl font-bold ${m.color} mt-1`}>{m.value}</p>
                    </CardContent></Card>
                ))}
            </div>

            <div className="space-y-3">
                {idcs.map(r => {
                    const amortPct = ((r.amortisedToDate / r.amount) * 100).toFixed(1);
                    return (
                        <Card key={r.id} className="border-border">
                            <CardContent className="pt-4 pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className="text-xs">{r.leaseRef}</Badge>
                                            <span className="text-sm font-medium">{r.costType}</span>
                                            <Badge className={r.status === "Active" ? "bg-blue-500/20 text-blue-400 text-xs" : "bg-green-500/20 text-green-400 text-xs"}>{r.status}</Badge>
                                        </div>
                                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                                            <div><p className="text-muted-foreground">Vendor</p><p>{r.vendor}</p></div>
                                            <div><p className="text-muted-foreground">Invoice</p><p className="font-mono">{r.invoiceRef}</p></div>
                                            <div><p className="text-muted-foreground">Cost Date</p><p>{r.costDate}</p></div>
                                            <div><p className="text-muted-foreground">Total IDC</p><p className="font-bold">{formatNumber(r.amount)} {r.currency}</p></div>
                                            <div><p className="text-muted-foreground">Amortised</p><p className="text-green-400">{formatNumber(r.amortisedToDate)} ({amortPct}%)</p></div>
                                            <div><p className="text-muted-foreground">Unamortised</p><p className="text-amber-400 font-medium">{formatNumber(r.unamortised)} {r.currency}</p></div>
                                        </div>
                                        {/* Amortisation progress bar */}
                                        <div className="mt-2">
                                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div className={`h-full bg-green-500 rounded-full transition-all w-[${amortPct}%]`} />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">{r.amortisationMethod} over {r.leaseTerm} months → GL: {r.glAccount}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 ml-4"><Pencil className="h-3 w-3" /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add Initial Direct Cost</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs">Lease Reference *</Label>
                            <Input className="mt-1 h-8 text-xs font-mono" placeholder="LS-XXXX-XXX"
                                onChange={e => setForm(p => ({ ...p, leaseRef: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Cost Date</Label>
                            <Input type="date" className="mt-1 h-8 text-xs" value={form.costDate}
                                onChange={e => setForm(p => ({ ...p, costDate: e.target.value }))} />
                        </div>
                        <div className="col-span-2">
                            <Label className="text-xs">Cost Type *</Label>
                            <Select value={form.costType || ""} onValueChange={v => setForm(p => ({ ...p, costType: v }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="Select cost type" /></SelectTrigger>
                                <SelectContent>{IDC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Vendor / Payee</Label>
                            <Input className="mt-1 h-8 text-xs" onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Invoice Reference</Label>
                            <Input className="mt-1 h-8 text-xs font-mono" onChange={e => setForm(p => ({ ...p, invoiceRef: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Amount *</Label>
                            <Input type="number" className="mt-1 h-8 text-xs" onChange={e => setForm(p => ({ ...p, amount: parseFloat(e.target.value) }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Currency</Label>
                            <Select value={form.currency} onValueChange={v => setForm(p => ({ ...p, currency: v }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>{["USD", "GBP", "EUR", "AED"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Lease Term (Months)</Label>
                            <Input type="number" className="mt-1 h-8 text-xs" onChange={e => setForm(p => ({ ...p, leaseTerm: parseInt(e.target.value) }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Amortisation Method</Label>
                            <Select value={form.amortisationMethod} onValueChange={v => setForm(p => ({ ...p, amortisationMethod: v as IDCRecord["amortisationMethod"] }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Straight-Line">Straight-Line</SelectItem>
                                    <SelectItem value="Effective Interest">Effective Interest</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                        <Button onClick={handleAdd}>Record IDC</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}

export default LeaseInitialDirectCosts;
