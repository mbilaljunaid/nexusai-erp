import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/formatters";
import { Plus, Building2, DollarSign, Pencil, FileText } from "lucide-react";

// Oracle OKL: Sublease Setup and Schedule

interface Sublease {
    id: string; subleaseRef: string; headLeaseRef: string; sublesseeName: string; property: string; commencementDate: string; expirationDate: string; monthlyRent: number; currency: string; area: number; areaUnit: string; status: "Active" | "Draft" | "Expired";
    schedules: { period: string; amount: number; status: "Billed" | "Upcoming" }[];
}

const MOCK_SUBLEASES: Sublease[] = [
    {
        id: "1", subleaseRef: "SL-2026-001", headLeaseRef: "LS-2024-003", sublesseeName: "TechStart Inc", property: "25 Canada Square — Suite 4B", commencementDate: "2026-01-01", expirationDate: "2027-12-31", monthlyRent: 14500, currency: "GBP", area: 2400, areaUnit: "sqft", status: "Active",
        schedules: [
            { period: "Jan 2026", amount: 14500, status: "Billed" },
            { period: "Feb 2026", amount: 14500, status: "Billed" },
            { period: "Mar 2026", amount: 14500, status: "Billed" },
            { period: "Apr 2026", amount: 14500, status: "Upcoming" },
        ],
    },
    {
        id: "2", subleaseRef: "SL-2026-002", headLeaseRef: "LS-2025-007", sublesseeName: "FinTech Partners Ltd", property: "One Canary Wharf — Floor 12", commencementDate: "2026-03-01", expirationDate: "2027-02-28", monthlyRent: 8900, currency: "GBP", area: 1200, areaUnit: "sqft", status: "Active",
        schedules: [
            { period: "Mar 2026", amount: 8900, status: "Billed" },
            { period: "Apr 2026", amount: 8900, status: "Upcoming" },
        ],
    },
];

export function SubleaseManagement() {
    const { toast } = useToast();
    const [subleases, setSubleases] = useState<Sublease[]>(MOCK_SUBLEASES);
    const [tab, setTab] = useState("list");
    const [selected, setSelected] = useState<Sublease | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState<Partial<Sublease>>({ currency: "GBP", areaUnit: "sqft", status: "Draft" });

    const totalMthly = subleases.filter(s => s.status === "Active").reduce((s, sl) => s + sl.monthlyRent, 0);

    const handleAdd = () => {
        if (!form.subleaseRef || !form.sublesseeName) { toast({ title: "Reference and sublessee required", variant: "destructive" }); return; }
        const newSL: Sublease = { id: Date.now().toString(), schedules: [], ...form } as Sublease;
        setSubleases(prev => [...prev, newSL]);
        setShowAdd(false);
        setForm({ currency: "GBP", areaUnit: "sqft", status: "Draft" });
        toast({ title: "Sublease created", className: "bg-green-900 border-green-700 text-white" });
    };

    return (
        <StandardPage
            title="Sublease Management"
            description="Manage subleases derived from head leases — configure sublessees, terms, and billing schedules"
            actions={
                <div className="flex gap-2">
                    {tab === "list" && <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" />Add Sublease</Button>}
                    {selected && tab === "detail" && <Button size="sm" variant="outline" onClick={() => { setSelected(null); setTab("list"); }}>← Back to List</Button>}
                </div>
            }
        >
            {/* Summary metrics */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                    { label: "Active Subleases", value: subleases.filter(s => s.status === "Active").length.toString(), color: "text-green-400" },
                    { label: "Monthly Sublease Income", value: `${formatNumber(totalMthly)} GBP`, color: "text-blue-400" },
                    { label: "Annual Sublease Income", value: `${formatNumber(totalMthly * 12)} GBP`, color: "text-purple-400" },
                ].map(m => (
                    <Card key={m.label}>
                        <CardContent className="pt-4 pb-4">
                            <p className="text-xs text-muted-foreground">{m.label}</p>
                            <p className={`text-xl font-bold ${m.color} mt-1`}>{m.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {!selected ? (
                <Card>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-muted/20 text-xs text-muted-foreground">
                                <tr>
                                    <th className="p-3 text-left">Sublease Ref</th>
                                    <th className="p-3 text-left">Head Lease</th>
                                    <th className="p-3 text-left">Sublessee</th>
                                    <th className="p-3 text-left">Property</th>
                                    <th className="p-3 text-left">Term</th>
                                    <th className="p-3 text-right">Monthly Rent</th>
                                    <th className="p-3 text-right">Area</th>
                                    <th className="p-3 text-left">Status</th>
                                    <th className="p-3 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {subleases.map(sl => (
                                    <tr key={sl.id} className="hover:bg-muted/10 cursor-pointer" onClick={() => { setSelected(sl); setTab("detail"); }}>
                                        <td className="p-3 font-mono text-xs text-primary">{sl.subleaseRef}</td>
                                        <td className="p-3 font-mono text-xs text-muted-foreground">{sl.headLeaseRef}</td>
                                        <td className="p-3 font-medium">{sl.sublesseeName}</td>
                                        <td className="p-3 text-xs text-muted-foreground">{sl.property}</td>
                                        <td className="p-3 text-xs">{sl.commencementDate} → {sl.expirationDate}</td>
                                        <td className="p-3 text-right font-medium">{formatNumber(sl.monthlyRent)} {sl.currency}</td>
                                        <td className="p-3 text-right text-xs">{sl.area?.toLocaleString()} {sl.areaUnit}</td>
                                        <td className="p-3">
                                            <Badge className={sl.status === "Active" ? "bg-green-500/20 text-green-400" : sl.status === "Draft" ? "bg-muted text-muted-foreground" : "bg-destructive/20 text-destructive"}>{sl.status}</Badge>
                                        </td>
                                        <td className="p-3">
                                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Pencil className="h-3 w-3" /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            ) : (
                /* Detail View */
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-base">{selected.subleaseRef} — {selected.sublesseeName}</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div><p className="text-xs text-muted-foreground">Head Lease</p><p className="font-mono">{selected.headLeaseRef}</p></div>
                                <div><p className="text-xs text-muted-foreground">Property</p><p>{selected.property}</p></div>
                                <div><p className="text-xs text-muted-foreground">Area</p><p>{selected.area?.toLocaleString()} {selected.areaUnit}</p></div>
                                <div><p className="text-xs text-muted-foreground">Commencement</p><p>{selected.commencementDate}</p></div>
                                <div><p className="text-xs text-muted-foreground">Expiration</p><p>{selected.expirationDate}</p></div>
                                <div><p className="text-xs text-muted-foreground">Monthly Rent</p><p className="font-bold">{formatNumber(selected.monthlyRent)} {selected.currency}</p></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-base">Billing Schedule</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/20 text-xs text-muted-foreground">
                                    <tr>
                                        <th className="p-3 text-left">Period</th>
                                        <th className="p-3 text-right">Amount</th>
                                        <th className="p-3 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {selected.schedules.map((sc, i) => (
                                        <tr key={i} className="hover:bg-muted/10">
                                            <td className="p-3">{sc.period}</td>
                                            <td className="p-3 text-right font-medium">{formatNumber(sc.amount)} {selected.currency}</td>
                                            <td className="p-3">
                                                <Badge className={sc.status === "Billed" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}>{sc.status}</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add Sublease</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { id: "subleaseRef", label: "Sublease Reference *", placeholder: "SL-2026-003" },
                            { id: "headLeaseRef", label: "Head Lease Reference", placeholder: "LS-XXXX-XXX" },
                            { id: "sublesseeName", label: "Sublessee Name *", placeholder: "Company name" },
                            { id: "property", label: "Property / Unit", placeholder: "Address — Suite" },
                        ].map(f => (
                            <div key={f.id} className={f.id === "property" ? "col-span-2" : ""}>
                                <Label className="text-xs">{f.label}</Label>
                                <Input className="mt-1 h-8 text-xs" placeholder={f.placeholder}
                                    onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))} />
                            </div>
                        ))}
                        <div>
                            <Label className="text-xs">Commencement Date</Label>
                            <Input type="date" className="mt-1 h-8 text-xs" onChange={e => setForm(p => ({ ...p, commencementDate: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Expiration Date</Label>
                            <Input type="date" className="mt-1 h-8 text-xs" onChange={e => setForm(p => ({ ...p, expirationDate: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Monthly Rent</Label>
                            <Input type="number" className="mt-1 h-8 text-xs" placeholder="0.00" onChange={e => setForm(p => ({ ...p, monthlyRent: parseFloat(e.target.value) }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Currency</Label>
                            <Select value={form.currency} onValueChange={v => setForm(p => ({ ...p, currency: v }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>{["USD", "GBP", "EUR", "AED", "SAR"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                        <Button onClick={handleAdd}>Create Sublease</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}

export default SubleaseManagement;
