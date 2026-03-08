import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Globe, Shield, Check } from "lucide-react";

// Oracle eBTax: Tax Subscription — assign tax regimes to Business Units / Legal Entities

interface TaxSubscription {
    id: string; entityType: "Business Unit" | "Legal Entity" | "Operating Unit"; entityName: string; taxRegime: string; country: string; effectiveFrom: string; effectiveTo: string; allowOverride: boolean; status: "Active" | "Inactive";
}

const SEED_SUBS: TaxSubscription[] = [
    { id: "1", entityType: "Business Unit", entityName: "US-OPS", taxRegime: "US Sales Tax", country: "US", effectiveFrom: "2024-01-01", effectiveTo: "", allowOverride: true, status: "Active" },
    { id: "2", entityType: "Legal Entity", entityName: "UK Ltd", taxRegime: "UK VAT Standard", country: "GB", effectiveFrom: "2024-01-01", effectiveTo: "", allowOverride: false, status: "Active" },
    { id: "3", entityType: "Legal Entity", entityName: "UAE FZ LLC", taxRegime: "UAE VAT (5%)", country: "AE", effectiveFrom: "2024-01-01", effectiveTo: "", allowOverride: false, status: "Active" },
    { id: "4", entityType: "Legal Entity", entityName: "KSA LLC", taxRegime: "KSA VAT (15%)", country: "SA", effectiveFrom: "2024-01-01", effectiveTo: "", allowOverride: false, status: "Active" },
];

const BUS_UNITS = ["US-OPS", "UK-OPS", "UAE-OPS", "APAC-OPS", "SA-OPS"];
const LEGAL_ENTITIES = ["UK Ltd", "UAE FZ LLC", "KSA LLC", "US Corp", "Singapore Pte Ltd"];
const REGIMES = ["UK VAT Standard", "UAE VAT (5%)", "KSA VAT (15%)", "US Sales Tax", "EU VAT", "German VAT 19%", "France VAT 20%", "Australia GST 10%"];

export function TaxSubscriptionSetup() {
    const { toast } = useToast();
    const [subs, setSubs] = useState<TaxSubscription[]>(SEED_SUBS);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState<Partial<TaxSubscription>>({
        entityType: "Legal Entity", allowOverride: false, status: "Active", effectiveFrom: new Date().toISOString().split("T")[0],
    });

    const toggle = (id: string) => setSubs(prev => prev.map(s => s.id === id ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" } : s));

    const handleAdd = () => {
        if (!form.entityName || !form.taxRegime) { toast({ title: "Entity and regime required", variant: "destructive" }); return; }
        setSubs(prev => [...prev, { id: Date.now().toString(), country: "US", ...form } as TaxSubscription]);
        setShowAdd(false);
        setForm({ entityType: "Legal Entity", allowOverride: false, status: "Active", effectiveFrom: new Date().toISOString().split("T")[0] });
        toast({ title: "Tax subscription created", className: "bg-green-900 border-green-700 text-white" });
    };

    return (
        <StandardPage
            title="Tax Subscriptions"
            description="Assign tax regimes to Business Units and Legal Entities for transaction defaulting"
            actions={<Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" />Add Subscription</Button>}
        >
            <div className="mb-4 p-3 bg-muted/30 rounded text-xs text-muted-foreground">
                <Shield className="h-3 w-3 inline mr-1" />
                Tax subscriptions determine which tax regimes apply to transactions for a given operating entity. Override flag controls whether line-level tax code can be changed by the user.
            </div>

            <Card>
                <CardContent className="p-0">
                    <table className="w-full text-sm">
                        <thead className="border-b border-border bg-muted/20 text-xs text-muted-foreground">
                            <tr>
                                <th className="p-3 text-left">Entity</th>
                                <th className="p-3 text-left">Entity Name</th>
                                <th className="p-3 text-left">Tax Regime</th>
                                <th className="p-3 text-left">Country</th>
                                <th className="p-3 text-left">Effective From</th>
                                <th className="p-3 text-left">Allow Override</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {subs.map(s => (
                                <tr key={s.id} className="hover:bg-muted/10">
                                    <td className="p-3"><Badge className="text-xs">{s.entityType}</Badge></td>
                                    <td className="p-3 font-medium">{s.entityName}</td>
                                    <td className="p-3 text-xs">{s.taxRegime}</td>
                                    <td className="p-3 font-mono text-xs">{s.country}</td>
                                    <td className="p-3 text-xs text-muted-foreground">{s.effectiveFrom}</td>
                                    <td className="p-3">
                                        {s.allowOverride ? <Check className="h-4 w-4 text-green-500" /> : <span className="text-muted-foreground text-xs">No</span>}
                                    </td>
                                    <td className="p-3">
                                        <Switch checked={s.status === "Active"} onCheckedChange={() => toggle(s.id)} aria-label={`Toggle ${s.entityName} subscription`} />
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

            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add Tax Subscription</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs">Entity Type</Label>
                            <Select value={form.entityType} onValueChange={v => setForm(p => ({ ...p, entityType: v as TaxSubscription["entityType"] }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {["Business Unit", "Legal Entity", "Operating Unit"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Entity Name *</Label>
                            <Select value={form.entityName || ""} onValueChange={v => setForm(p => ({ ...p, entityName: v }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="Select entity" /></SelectTrigger>
                                <SelectContent>
                                    {(form.entityType === "Business Unit" ? BUS_UNITS : LEGAL_ENTITIES).map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-2">
                            <Label className="text-xs">Tax Regime *</Label>
                            <Select value={form.taxRegime || ""} onValueChange={v => setForm(p => ({ ...p, taxRegime: v }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="Select regime" /></SelectTrigger>
                                <SelectContent>{REGIMES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Effective From</Label>
                            <Input type="date" className="mt-1 h-8 text-xs" value={form.effectiveFrom || ""}
                                onChange={e => setForm(p => ({ ...p, effectiveFrom: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Effective To (optional)</Label>
                            <Input type="date" className="mt-1 h-8 text-xs" value={form.effectiveTo || ""}
                                onChange={e => setForm(p => ({ ...p, effectiveTo: e.target.value }))} />
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                            <Switch checked={form.allowOverride} onCheckedChange={v => setForm(p => ({ ...p, allowOverride: v }))} aria-label="Allow tax code override" />
                            <Label className="text-xs">Allow tax code override on transaction lines</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                        <Button onClick={handleAdd}>Create Subscription</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}

export default TaxSubscriptionSetup;
