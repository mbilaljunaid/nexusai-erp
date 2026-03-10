import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Globe, ArrowRight, BookOpen } from "lucide-react";

// Oracle GL: Secondary Ledger Setup — assign secondary/reporting ledger pairs with conversion rules

interface LedgerPair {
    id: string; primaryLedger: string; secondaryLedger: string; secondaryType: "Reporting" | "Secondary" | "Adjunct"; conversionType: "Subledger" | "Balance" | "Journal"; currency: string; translationRule: string; dataConversionLevel: string; status: "Active" | "Inactive";
}

const SEED_PAIRS: LedgerPair[] = [
    { id: "1", primaryLedger: "UK Corporate", secondaryLedger: "UK IFRS Reporting", secondaryType: "Reporting", conversionType: "Balance", currency: "USD", translationRule: "Period Average", dataConversionLevel: "Subledger", status: "Active" },
    { id: "2", primaryLedger: "UAE Corporate", secondaryLedger: "UAE Statutory (AED)", secondaryType: "Secondary", conversionType: "Journal", currency: "AED", translationRule: "Historical Rate", dataConversionLevel: "Journal", status: "Active" },
];

const PRIMARY_LEDGERS = ["UK Corporate", "UAE Corporate", "US Corporate", "SA Corporate", "APAC Corporate"];
const SECONDARY_TYPES = ["Reporting", "Secondary", "Adjunct"];
const CONV_TYPES = ["Subledger", "Balance", "Journal"];
const TRANS_RULES = ["Period Average", "Historical Rate", "Spot Rate", "Corporate Rate", "Fixed Rate"];
const CURRENCIES = ["USD", "GBP", "EUR", "AED", "SAR", "CAD", "AUD", "SGD", "INR"];

export function GlSecondaryLedgerSetup() {
    const { toast } = useToast();
    const [pairs, setPairs] = useState<LedgerPair[]>(SEED_PAIRS);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState<Partial<LedgerPair>>({
        secondaryType: "Reporting", conversionType: "Balance", currency: "USD",
        translationRule: "Period Average", dataConversionLevel: "Subledger", status: "Active",
    });

    const handleAdd = () => {
        if (!form.primaryLedger || !form.secondaryLedger) { toast({ title: "Both ledgers required", variant: "destructive" }); return; }
        setPairs(prev => [...prev, { id: Date.now().toString(), ...form } as LedgerPair]);
        setShowAdd(false);
        setForm({ secondaryType: "Reporting", conversionType: "Balance", currency: "USD", translationRule: "Period Average", dataConversionLevel: "Subledger", status: "Active" });
        toast({ title: "Secondary ledger relationship created", className: "bg-green-900 border-green-700 text-white" });
    };

    const typeColor = (t: string) => {
        if (t === "Reporting") return "bg-blue-500/20 text-blue-400";
        if (t === "Secondary") return "bg-purple-500/20 text-purple-400";
        return "bg-amber-500/20 text-amber-400";
    };

    return (
        <StandardPage
            title="Secondary Ledger Setup"
            description="Assign secondary and reporting ledger pairs with conversion method and translation rules"
            actions={<Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" />Add Pair</Button>}
        >
            <div className="mb-4 p-3 bg-muted/30 rounded text-xs text-muted-foreground">
                <Globe className="h-3 w-3 inline mr-1" />
                Secondary ledgers receive copies of accounting at subledger, journal, or balance level. Reporting ledgers convert currency only. Use for IFRS vs local GAAP dual-book scenarios.
            </div>

            <div className="space-y-4">
                {pairs.map(pair => (
                    <Card key={pair.id} className="border-border">
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm bg-primary/10 px-2 py-0.5 rounded">{pair.primaryLedger}</span>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium text-sm">{pair.secondaryLedger}</span>
                                        </div>
                                        <Badge className={`text-xs ${typeColor(pair.secondaryType)}`}>{pair.secondaryType}</Badge>
                                        <Badge className={pair.status === "Active" ? "bg-green-500/20 text-green-400 text-xs" : "bg-muted text-muted-foreground text-xs"}>{pair.status}</Badge>
                                    </div>
                                    <div className="grid grid-cols-4 gap-3 text-xs">
                                        <div><p className="text-muted-foreground">Conversion Type</p><p className="font-medium">{pair.conversionType}</p></div>
                                        <div><p className="text-muted-foreground">Currency</p><p className="font-mono font-medium">{pair.currency}</p></div>
                                        <div><p className="text-muted-foreground">Translation Rule</p><p>{pair.translationRule}</p></div>
                                        <div><p className="text-muted-foreground">Data Level</p><p>{pair.dataConversionLevel}</p></div>
                                    </div>
                                </div>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 ml-4"><Pencil className="h-3 w-3" /></Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add Secondary Ledger Pair</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs">Primary Ledger *</Label>
                            <Select value={form.primaryLedger || ""} onValueChange={v => setForm(p => ({ ...p, primaryLedger: v }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>{PRIMARY_LEDGERS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Secondary Ledger Name *</Label>
                            <Input className="mt-1 h-8 text-xs" placeholder="e.g. UK IFRS Reporting"
                                onChange={e => setForm(p => ({ ...p, secondaryLedger: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Secondary Type</Label>
                            <Select value={form.secondaryType} onValueChange={v => setForm(p => ({ ...p, secondaryType: v as LedgerPair["secondaryType"] }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>{SECONDARY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Conversion Type</Label>
                            <Select value={form.conversionType} onValueChange={v => setForm(p => ({ ...p, conversionType: v as LedgerPair["conversionType"] }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>{CONV_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Currency</Label>
                            <Select value={form.currency} onValueChange={v => setForm(p => ({ ...p, currency: v }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Translation Rule</Label>
                            <Select value={form.translationRule} onValueChange={v => setForm(p => ({ ...p, translationRule: v }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>{TRANS_RULES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Data Conversion Level</Label>
                            <Select value={form.dataConversionLevel} onValueChange={v => setForm(p => ({ ...p, dataConversionLevel: v }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {["Subledger", "Journal", "Balance"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                        <Button onClick={handleAdd}>Create Pair</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}

export default GlSecondaryLedgerSetup;
