import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Download, Play, RefreshCw, FileText, Shield, CheckCircle2 } from "lucide-react";

// Oracle AP: Positive Pay — configure format + generate file for bank fraud prevention

interface PositivePayConfig {
    id: string; configName: string; bankName: string; accountNumber: string; format: string; delimiter: string; includeHeader: boolean; includeTrailer: boolean; sortOrder: string; frequency: string; lastGenerated: string; status: "Active" | "Inactive";
}
interface PositivePayRun {
    id: string; config: string; runDate: string; checkCount: number; amount: number; status: "Transmitted" | "Pending" | "Failed";
}

const FORMATS = ["BAI2", "NACHA-CCD", "SWIFT-MT101", "CheckFree", "Custom Fixed-Width", "CSV Delimited"];

const MOCK_CONFIGS: PositivePayConfig[] = [
    { id: "1", configName: "HSBC – USD Payroll Checks", bankName: "HSBC Bank", accountNumber: "****6819", format: "NACHA-CCD", delimiter: ",", includeHeader: true, includeTrailer: true, sortOrder: "Check Number", frequency: "Daily", lastGenerated: "2026-03-07", status: "Active" },
    { id: "2", configName: "JPMorgan – Vendor Checks", bankName: "JPMorgan Chase", accountNumber: "****4421", format: "BAI2", delimiter: "|", includeHeader: true, includeTrailer: true, sortOrder: "Issue Date", frequency: "Weekly", lastGenerated: "2026-03-03", status: "Active" },
];
const MOCK_RUNS: PositivePayRun[] = [
    { id: "1", config: "HSBC – USD Payroll Checks", runDate: "2026-03-07", checkCount: 87, amount: 342890.50, status: "Transmitted" },
    { id: "2", config: "HSBC – USD Payroll Checks", runDate: "2026-03-06", checkCount: 64, amount: 218445.00, status: "Transmitted" },
    { id: "3", config: "JPMorgan – Vendor Checks", runDate: "2026-03-03", checkCount: 201, amount: 891200.75, status: "Transmitted" },
];

export function APPositivePayConfig() {
    const { toast } = useToast();
    const [configs, setConfigs] = useState<PositivePayConfig[]>(MOCK_CONFIGS);
    const [runs] = useState<PositivePayRun[]>(MOCK_RUNS);
    const [tab, setTab] = useState("configs");
    const [showAdd, setShowAdd] = useState(false);
    const [generating, setGenerating] = useState<string | null>(null);
    const [form, setForm] = useState<Partial<PositivePayConfig>>({
        format: "NACHA-CCD", delimiter: ",", includeHeader: true, includeTrailer: true,
        sortOrder: "Check Number", frequency: "Daily", status: "Active",
    });

    const handleGenerate = async (configId: string) => {
        setGenerating(configId);
        await new Promise(r => setTimeout(r, 1500));
        setGenerating(null);
        toast({
            title: "Positive Pay File Generated",
            description: "Transmitting to bank portal. File reference: PPF-" + Date.now().toString().slice(-8),
            className: "bg-green-900 border-green-700 text-white",
        });
    };

    const handleAdd = () => {
        if (!form.configName || !form.bankName) { toast({ title: "Name and bank required", variant: "destructive" }); return; }
        setConfigs(prev => [...prev, { id: Date.now().toString(), lastGenerated: "", ...form } as PositivePayConfig]);
        setShowAdd(false);
        setForm({ format: "NACHA-CCD", delimiter: ",", includeHeader: true, includeTrailer: true, sortOrder: "Check Number", frequency: "Daily", status: "Active" });
        toast({ title: "Configuration saved", className: "bg-green-900 border-green-700 text-white" });
    };

    const { formatNumber } = { formatNumber: (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) };

    return (
        <StandardPage
            title="Positive Pay"
            description="Configure and generate Positive Pay files for bank fraud prevention"
            actions={tab === "configs" && <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" />Add Configuration</Button>}
        >
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400">
                <Shield className="h-3 w-3 inline mr-1" />
                Positive Pay transmits an authorised check register to your bank daily. Any presented checks not on the register are flagged for review, preventing cheque fraud.
            </div>

            <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="configs">Configurations ({configs.length})</TabsTrigger>
                    <TabsTrigger value="runs">Transmission History</TabsTrigger>
                </TabsList>

                <TabsContent value="configs">
                    <div className="space-y-3">
                        {configs.map(c => (
                            <Card key={c.id} className={`border-border ${c.status === "Inactive" ? "opacity-60" : ""}`}>
                                <CardContent className="pt-4 pb-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-medium">{c.configName}</span>
                                                <Badge className="text-xs">{c.format}</Badge>
                                                <Badge className={c.status === "Active" ? "bg-green-500/20 text-green-400 text-xs" : "bg-muted text-muted-foreground text-xs"}>{c.status}</Badge>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                                                <div><p className="text-muted-foreground">Bank</p><p>{c.bankName}</p></div>
                                                <div><p className="text-muted-foreground">Account</p><p className="font-mono">{c.accountNumber}</p></div>
                                                <div><p className="text-muted-foreground">Frequency</p><p>{c.frequency}</p></div>
                                                <div><p className="text-muted-foreground">Sort Order</p><p>{c.sortOrder}</p></div>
                                                <div><p className="text-muted-foreground">Last Generated</p><p>{c.lastGenerated || "Never"}</p></div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <Button size="sm" variant="outline" className="h-8 text-xs"
                                                onClick={() => handleGenerate(c.id)} disabled={generating === c.id}>
                                                {generating === c.id ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <Play className="h-3 w-3 mr-1" />}
                                                Generate File
                                            </Button>
                                            <Button size="sm" variant="ghost" className="h-8 text-xs">
                                                <Download className="h-3 w-3 mr-1" />Download
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="runs">
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/20 text-xs text-muted-foreground">
                                    <tr>
                                        <th className="p-3 text-left">Configuration</th>
                                        <th className="p-3 text-left">Run Date</th>
                                        <th className="p-3 text-right">Check Count</th>
                                        <th className="p-3 text-right">Amount</th>
                                        <th className="p-3 text-left">Status</th>
                                        <th className="p-3 w-12"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {runs.map(r => (
                                        <tr key={r.id} className="hover:bg-muted/10">
                                            <td className="p-3 text-sm">{r.config}</td>
                                            <td className="p-3">{r.runDate}</td>
                                            <td className="p-3 text-right font-medium">{r.checkCount}</td>
                                            <td className="p-3 text-right font-medium">{formatNumber(r.amount)}</td>
                                            <td className="p-3">
                                                <Badge className={r.status === "Transmitted" ? "bg-green-500/20 text-green-400" : r.status === "Failed" ? "bg-destructive/20 text-destructive" : "bg-blue-500/20 text-blue-400"}>{r.status}</Badge>
                                            </td>
                                            <td className="p-3">
                                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Download className="h-3 w-3" /></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add Positive Pay Configuration</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <Label className="text-xs">Configuration Name *</Label>
                            <Input className="mt-1 h-8 text-xs" placeholder="e.g. HSBC – USD Vendor Checks"
                                onChange={e => setForm(p => ({ ...p, configName: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Bank Name *</Label>
                            <Input className="mt-1 h-8 text-xs" onChange={e => setForm(p => ({ ...p, bankName: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Account Number</Label>
                            <Input className="mt-1 h-8 text-xs font-mono" onChange={e => setForm(p => ({ ...p, accountNumber: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-xs">File Format</Label>
                            <Select value={form.format} onValueChange={v => setForm(p => ({ ...p, format: v }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>{FORMATS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Generation Frequency</Label>
                            <Select value={form.frequency} onValueChange={v => setForm(p => ({ ...p, frequency: v }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>{["Daily", "Weekly", "On Demand"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Sort Order</Label>
                            <Select value={form.sortOrder} onValueChange={v => setForm(p => ({ ...p, sortOrder: v }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>{["Check Number", "Issue Date", "Payee Name", "Amount"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch checked={form.includeHeader} onCheckedChange={v => setForm(p => ({ ...p, includeHeader: v }))} id="hdr" />
                            <Label htmlFor="hdr" className="text-xs">Include Header Record</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch checked={form.includeTrailer} onCheckedChange={v => setForm(p => ({ ...p, includeTrailer: v }))} id="trl" />
                            <Label htmlFor="trl" className="text-xs">Include Trailer Record</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                        <Button onClick={handleAdd}>Save Configuration</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}

export default APPositivePayConfig;
