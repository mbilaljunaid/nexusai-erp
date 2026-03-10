import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/formatters";
import { Plus, AlertTriangle, Calculator, RefreshCw, CheckCircle2, TrendingDown } from "lucide-react";

// Oracle FA: Impairment Testing — IAS 36 / GAAP impairment assessment

interface ImpairmentTest {
    id: string; testRef: string; assetNumber: string; description: string; testDate: string; triggerEvent: string; carryingAmount: number; recoverableAmount: number; impairmentLoss: number; currency: string; standard: "IAS 36" | "ASC 350" | "ASC 360"; status: "Draft" | "Approved" | "Posted";
}

const TRIGGER_EVENTS = [
    "Significant market value decline",
    "Physical damage or obsolescence",
    "Adverse changes in business environment",
    "Management decision to dispose",
    "Economic performance worse than expected",
    "Significant changes in technology",
    "Annual mandatory test (goodwill/indefinite-life)",
];

const MOCK_TESTS: ImpairmentTest[] = [
    { id: "1", testRef: "IMP-2026-001", assetNumber: "FA-00820", description: "Photolithography Machine", testDate: "2026-03-01", triggerEvent: "Significant market value decline", carryingAmount: 213333, recoverableAmount: 175000, impairmentLoss: 38333, currency: "USD", standard: "IAS 36", status: "Approved" },
    { id: "2", testRef: "IMP-2026-002", assetNumber: "FA-00851", description: "Office Fit-Out — Floor 3", testDate: "2026-03-01", triggerEvent: "Adverse changes in business environment", carryingAmount: 204167, recoverableAmount: 204167, impairmentLoss: 0, currency: "GBP", standard: "IAS 36", status: "Approved" },
];

export function FaImpairmentTesting() {
    const { toast } = useToast();
    const [tests, setTests] = useState<ImpairmentTest[]>(MOCK_TESTS);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState<Partial<ImpairmentTest>>({
        testDate: new Date().toISOString().split("T")[0], standard: "IAS 36", status: "Draft",
        carryingAmount: 0, recoverableAmount: 0,
    });
    const impairmentLoss = Math.max(0, (form.carryingAmount || 0) - (form.recoverableAmount || 0));

    const handlePost = (id: string) => {
        setTests(prev => prev.map(t => t.id === id ? { ...t, status: "Posted" } : t));
        toast({ title: "Impairment loss posted to GL", description: "Journal entry created — Impairment Loss Dr / Accumulated Impairment Cr", className: "bg-green-900 border-green-700 text-white" });
    };

    const handleAdd = () => {
        if (!form.assetNumber || !form.triggerEvent) { toast({ title: "Asset and trigger event required", variant: "destructive" }); return; }
        const ref = `IMP-${new Date().getFullYear()}-${String(tests.length + 3).padStart(3, "0")}`;
        setTests(prev => [...prev, { id: Date.now().toString(), testRef: ref, impairmentLoss, ...form } as ImpairmentTest]);
        setShowAdd(false);
        setForm({ testDate: new Date().toISOString().split("T")[0], standard: "IAS 36", status: "Draft", carryingAmount: 0, recoverableAmount: 0 });
        toast({ title: "Impairment test created", className: "bg-green-900 border-green-700 text-white" });
    };

    const statusColor = (s: string) => ({
        Draft: "bg-muted text-muted-foreground",
        Approved: "bg-blue-500/20 text-blue-400",
        Posted: "bg-green-500/20 text-green-400",
    }[s] || "bg-muted");

    return (
        <StandardPage
            title="Impairment Testing"
            description="Conduct IAS 36 / ASC 360 impairment assessments — compare carrying amount to recoverable amount"
            actions={<Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" />New Test</Button>}
        >
            <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                    { label: "Total Tests This Year", value: tests.length.toString(), color: "text-blue-400" },
                    { label: "Total Impairment Loss Recognised", value: formatNumber(tests.filter(t => t.status === "Posted").reduce((s, t) => s + t.impairmentLoss, 0)), color: "text-red-400" },
                    { label: "Assets with Zero Impairment", value: tests.filter(t => t.impairmentLoss === 0).length.toString(), color: "text-green-400" },
                ].map(m => (
                    <Card key={m.label}>
                        <CardContent className="pt-4 pb-4">
                            <p className="text-xs text-muted-foreground">{m.label}</p>
                            <p className={`text-xl font-bold ${m.color} mt-1`}>{m.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-3">
                {tests.map(t => (
                    <Card key={t.id} className={`border-border ${t.impairmentLoss > 0 ? "border-red-500/30" : ""}`}>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-mono font-bold text-primary">{t.testRef}</span>
                                        <span className="text-sm">{t.assetNumber} — {t.description}</span>
                                        <Badge className="text-xs">{t.standard}</Badge>
                                        <Badge className={`text-xs ${statusColor(t.status)}`}>{t.status}</Badge>
                                        {t.impairmentLoss > 0 && <Badge className="text-xs bg-red-500/20 text-red-400"><AlertTriangle className="h-3 w-3 mr-1 inline" />Impaired</Badge>}
                                    </div>
                                    <div className="grid grid-cols-4 gap-3 text-xs">
                                        <div><p className="text-muted-foreground">Test Date</p><p>{t.testDate}</p></div>
                                        <div><p className="text-muted-foreground">Carrying Amount</p><p className="font-medium">{formatNumber(t.carryingAmount)} {t.currency}</p></div>
                                        <div><p className="text-muted-foreground">Recoverable Amount</p><p className="font-medium">{formatNumber(t.recoverableAmount)} {t.currency}</p></div>
                                        <div>
                                            <p className="text-muted-foreground">Impairment Loss</p>
                                            <p className={`font-bold ${t.impairmentLoss > 0 ? "text-red-400" : "text-green-400"}`}>
                                                {t.impairmentLoss > 0 ? `(${formatNumber(t.impairmentLoss)})` : "Nil"} {t.currency}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">Trigger: {t.triggerEvent}</p>
                                </div>
                                {t.status !== "Posted" && t.impairmentLoss > 0 && (
                                    <Button size="sm" className="ml-4" onClick={() => handlePost(t.id)}>Post to GL</Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>New Impairment Test</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs">Asset Number *</Label>
                            <Input className="mt-1 h-8 text-xs font-mono" placeholder="FA-XXXXX"
                                onChange={e => setForm(p => ({ ...p, assetNumber: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Asset Description</Label>
                            <Input className="mt-1 h-8 text-xs" onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Test Date</Label>
                            <Input type="date" className="mt-1 h-8 text-xs" value={form.testDate}
                                onChange={e => setForm(p => ({ ...p, testDate: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Accounting Standard</Label>
                            <Select value={form.standard} onValueChange={v => setForm(p => ({ ...p, standard: v as ImpairmentTest["standard"] }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>{["IAS 36", "ASC 350", "ASC 360"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-2">
                            <Label className="text-xs">Trigger Event *</Label>
                            <Select value={form.triggerEvent || ""} onValueChange={v => setForm(p => ({ ...p, triggerEvent: v }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="Select trigger" /></SelectTrigger>
                                <SelectContent>{TRIGGER_EVENTS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Carrying Amount</Label>
                            <Input type="number" className="mt-1 h-8 text-xs" value={form.carryingAmount}
                                onChange={e => setForm(p => ({ ...p, carryingAmount: parseFloat(e.target.value) || 0 }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Recoverable Amount</Label>
                            <Input type="number" className="mt-1 h-8 text-xs" value={form.recoverableAmount}
                                onChange={e => setForm(p => ({ ...p, recoverableAmount: parseFloat(e.target.value) || 0 }))} />
                        </div>
                        {impairmentLoss > 0 && (
                            <div className="col-span-2 bg-red-500/10 border border-red-500/30 rounded p-3 text-xs text-red-400">
                                <AlertTriangle className="h-3 w-3 inline mr-1" />
                                Calculated impairment loss: <strong>{formatNumber(impairmentLoss)}</strong>. This will be charged to the Impairment Loss expense account.
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                        <Button onClick={handleAdd}>Create Test</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}

export default FaImpairmentTesting;
