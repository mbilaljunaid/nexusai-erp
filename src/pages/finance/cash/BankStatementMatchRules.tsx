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
import { Plus, Pencil, CheckSquare, Settings2, ArrowRight } from "lucide-react";

// Oracle CE: Auto-Reconciliation Matching Rules (Statement Lines to System Transactions)

interface MatchRule {
    id: string;
    ruleName: string;
    ruleType: "Amount" | "Reference" | "Date+Amount" | "Payee+Amount" | "Regex";
    matchField: string;
    tolerance: string;
    toleranceType: "Absolute" | "Percent";
    dateTolerance: number;
    autoAction: "Create Receipt" | "Create Payment" | "Write-Off" | "Manual Review";
    priority: number;
    isActive: boolean;
}

const INITIAL_RULES: MatchRule[] = [
    { id: "1", ruleName: "Exact Reference Match", ruleType: "Reference", matchField: "Transaction Reference = Statement Ref", tolerance: "0", toleranceType: "Absolute", dateTolerance: 5, autoAction: "Create Receipt", priority: 1, isActive: true },
    { id: "2", ruleName: "Amount + Date Match (±3 days)", ruleType: "Date+Amount", matchField: "Amount ± Tolerance within Date Range", tolerance: "0.01", toleranceType: "Absolute", dateTolerance: 3, autoAction: "Create Receipt", priority: 2, isActive: true },
    { id: "3", ruleName: "Payee + Amount Match", ruleType: "Payee+Amount", matchField: "Payee Name LIKE Supplier Name AND Amount matches", tolerance: "1.00", toleranceType: "Absolute", dateTolerance: 7, autoAction: "Create Payment", priority: 3, isActive: true },
    { id: "4", ruleName: "Bank Charges Auto Write-Off", ruleType: "Regex", matchField: "Description MATCHES /(bank charge|service fee|maintenance fee)/i", tolerance: "100", toleranceType: "Absolute", dateTolerance: 0, autoAction: "Write-Off", priority: 4, isActive: true },
    { id: "5", ruleName: "Large Amount — Manual Review", ruleType: "Amount", matchField: "Amount > 50,000", tolerance: "0", toleranceType: "Absolute", dateTolerance: 0, autoAction: "Manual Review", priority: 99, isActive: true },
];

export function BankStatementMatchRules() {
    const { toast } = useToast();
    const [rules, setRules] = useState<MatchRule[]>(INITIAL_RULES);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState<Partial<MatchRule>>({
        ruleType: "Amount", toleranceType: "Absolute", autoAction: "Create Receipt", isActive: true, dateTolerance: 5, priority: 10,
    });

    const toggleActive = (id: string) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
    };

    const handleAdd = () => {
        if (!form.ruleName) { toast({ title: "Rule name required", variant: "destructive" }); return; }
        setRules(prev => [...prev, { id: Date.now().toString(), ...form } as MatchRule]);
        setShowAdd(false);
        setForm({ ruleType: "Amount", toleranceType: "Absolute", autoAction: "Create Receipt", isActive: true, dateTolerance: 5, priority: 10 });
        toast({ title: "Match rule created", className: "bg-green-900 border-green-700 text-white" });
    };

    const actionColor = (action: string) => {
        if (action === "Create Receipt" || action === "Create Payment") return "bg-green-500/20 text-green-400";
        if (action === "Write-Off") return "bg-amber-500/20 text-amber-400";
        return "bg-blue-500/20 text-blue-400";
    };

    return (
        <StandardPage
            title="Bank Statement Matching Rules"
            description="Configure auto-reconciliation rules for matching bank statement lines to system transactions"
            actions={<Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" />Add Rule</Button>}
        >
            <div className="space-y-3">
                {rules.sort((a, b) => a.priority - b.priority).map(rule => (
                    <Card key={rule.id} className={`border-border transition-colors ${!rule.isActive ? "opacity-60" : ""}`}>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-7 w-7 rounded bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                                        {rule.priority}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm">{rule.ruleName}</span>
                                            <Badge className="text-xs">{rule.ruleType}</Badge>
                                            <Badge className={`text-xs ${actionColor(rule.autoAction)}`}>{rule.autoAction}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-mono">{rule.matchField}</p>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                            {rule.tolerance !== "0" && <span>Tolerance: ±{rule.tolerance} ({rule.toleranceType})</span>}
                                            {rule.dateTolerance > 0 && <span>Date Window: ±{rule.dateTolerance} days</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Switch checked={rule.isActive} onCheckedChange={() => toggleActive(rule.id)} aria-label={`Toggle ${rule.ruleName}`} />
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Pencil className="h-3 w-3" /></Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add Matching Rule</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <Label className="text-xs">Rule Name *</Label>
                            <Input className="mt-1 h-8 text-xs" value={form.ruleName || ""}
                                onChange={e => setForm(p => ({ ...p, ruleName: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Rule Type</Label>
                            <Select value={form.ruleType} onValueChange={v => setForm(p => ({ ...p, ruleType: v as MatchRule["ruleType"] }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {["Amount", "Reference", "Date+Amount", "Payee+Amount", "Regex"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Auto Action</Label>
                            <Select value={form.autoAction} onValueChange={v => setForm(p => ({ ...p, autoAction: v as MatchRule["autoAction"] }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {["Create Receipt", "Create Payment", "Write-Off", "Manual Review"].map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Tolerance</Label>
                            <Input type="number" className="mt-1 h-8 text-xs" value={form.tolerance || "0"}
                                onChange={e => setForm(p => ({ ...p, tolerance: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Tolerance Type</Label>
                            <Select value={form.toleranceType} onValueChange={v => setForm(p => ({ ...p, toleranceType: v as MatchRule["toleranceType"] }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Absolute">Absolute Amount</SelectItem>
                                    <SelectItem value="Percent">Percentage</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Date Window (Days)</Label>
                            <Input type="number" className="mt-1 h-8 text-xs" value={form.dateTolerance ?? 5}
                                onChange={e => setForm(p => ({ ...p, dateTolerance: parseInt(e.target.value) }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Priority</Label>
                            <Input type="number" className="mt-1 h-8 text-xs" value={form.priority ?? 10}
                                onChange={e => setForm(p => ({ ...p, priority: parseInt(e.target.value) }))} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                        <Button onClick={handleAdd}>Add Rule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}

export default BankStatementMatchRules;
