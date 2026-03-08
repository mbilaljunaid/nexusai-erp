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
import { Plus, Pencil, Lock, BookOpen } from "lucide-react";

// Oracle GL: Encumbrance Types — Commitment, Obligation, Requisition

interface EncumbranceType {
    id: string; typeName: string; typeCode: string; description: string; subledger: string; enabledFlag: boolean;
}

const SEED_TYPES: EncumbranceType[] = [
    { id: "1", typeName: "Commitment", typeCode: "COMMITMENT", description: "Purchase Orders and Blanket Agreements", subledger: "Purchasing", enabledFlag: true },
    { id: "2", typeName: "Obligation", typeCode: "OBLIGATION", description: "Approved Purchase Requisitions", subledger: "Purchasing", enabledFlag: true },
    { id: "3", typeName: "Requisition", typeCode: "REQUISITION", description: "Pre-encumbrance for Requisitions", subledger: "Purchasing", enabledFlag: true },
    { id: "4", typeName: "Budget Encumbrance", typeCode: "BUDGET", description: "Budget reservation without purchase document", subledger: "General Ledger", enabledFlag: false },
];

export function GlEncumbranceSetup() {
    const { toast } = useToast();
    const [types, setTypes] = useState<EncumbranceType[]>(SEED_TYPES);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState<Partial<EncumbranceType>>({ enabledFlag: true });

    const toggle = (id: string) => {
        setTypes(prev => prev.map(t => t.id === id ? { ...t, enabledFlag: !t.enabledFlag } : t));
        toast({ title: "Updated", description: "Encumbrance type status changed." });
    };

    const handleAdd = () => {
        if (!form.typeCode || !form.typeName) { toast({ title: "Code and name required", variant: "destructive" }); return; }
        setTypes(prev => [...prev, { id: Date.now().toString(), ...form } as EncumbranceType]);
        setShowAdd(false);
        setForm({ enabledFlag: true });
        toast({ title: "Encumbrance type created", className: "bg-green-900 border-green-700 text-white" });
    };

    return (
        <StandardPage
            title="Encumbrance Types"
            description="Configure encumbrance accounting types for budgetary control (Commitment, Obligation, Requisition)"
            actions={<Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" />Add Type</Button>}
        >
            <div className="mb-4 p-3 bg-muted/30 rounded text-xs text-muted-foreground">
                <Lock className="h-3 w-3 inline mr-1" />
                Encumbrance accounting must also be enabled on each Ledger in Ledger Setup. These types control the sub-ledger journal category for pre-expenditure transactions.
            </div>

            <Card>
                <CardContent className="p-0">
                    <table className="w-full text-sm">
                        <thead className="border-b border-border bg-muted/20 text-xs text-muted-foreground">
                            <tr>
                                <th className="p-3 text-left">Type Code</th>
                                <th className="p-3 text-left">Type Name</th>
                                <th className="p-3 text-left">Description</th>
                                <th className="p-3 text-left">Subledger Source</th>
                                <th className="p-3 text-left">Enabled</th>
                                <th className="p-3 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {types.map(t => (
                                <tr key={t.id} className="hover:bg-muted/10">
                                    <td className="p-3 font-mono font-bold text-primary">{t.typeCode}</td>
                                    <td className="p-3 font-medium">{t.typeName}</td>
                                    <td className="p-3 text-xs text-muted-foreground">{t.description}</td>
                                    <td className="p-3"><Badge className="text-xs">{t.subledger}</Badge></td>
                                    <td className="p-3">
                                        <Switch checked={t.enabledFlag} onCheckedChange={() => toggle(t.id)} aria-label={`Toggle ${t.typeName}`} />
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
                <DialogContent>
                    <DialogHeader><DialogTitle>Add Encumbrance Type</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                        {[
                            { id: "typeCode", label: "Type Code *", placeholder: "e.g. COMMITMENT" },
                            { id: "typeName", label: "Type Name *", placeholder: "e.g. Commitment" },
                            { id: "description", label: "Description", placeholder: "Purpose of this encumbrance type" },
                        ].map(f => (
                            <div key={f.id}>
                                <Label className="text-xs">{f.label}</Label>
                                <Input className="mt-1 h-8 text-xs" placeholder={f.placeholder}
                                    onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))} />
                            </div>
                        ))}
                        <div>
                            <Label className="text-xs">Subledger</Label>
                            <Select value={form.subledger || "General Ledger"} onValueChange={v => setForm(p => ({ ...p, subledger: v }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {["Purchasing", "General Ledger", "Accounts Payable", "Payroll", "Projects"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                        <Button onClick={handleAdd}>Add Type</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}

export default GlEncumbranceSetup;
