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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/formatters";
import { Plus, RefreshCw, CheckCircle2, Inbox, Pencil, Settings2, Play } from "lucide-react";

// Oracle AR: Lockbox Setup — configuration page for lockbox batch processing

interface LockboxConfig {
    id: string; lockboxNumber: string; bankName: string; accountNumber: string; transmissionFormat: string; batchSource: string; defaultActivity: string; matchOrder: string; autoAssociate: boolean; status: "Active" | "Inactive";
}
interface LockboxBatch {
    id: string; lockboxNumber: string; batchDate: string; receiptCount: number; amount: number; status: "Processed" | "Pending" | "Errors"; errors: number;
}

const MOCK_LBX: LockboxConfig[] = [
    { id: "1", lockboxNumber: "LBX-001", bankName: "HSBC Bank plc", accountNumber: "12345678", transmissionFormat: "BAI2", batchSource: "LOCKBOX", defaultActivity: "Standard Receipts", matchOrder: "Reference, Amount, Date", autoAssociate: true, status: "Active" },
    { id: "2", lockboxNumber: "LBX-002", bankName: "Emirates NBD", accountNumber: "AE070331234567", transmissionFormat: "SWIFT MT900", batchSource: "LOCKBOX-AE", defaultActivity: "Standard Receipts", matchOrder: "Amount, Reference", autoAssociate: false, status: "Active" },
];
const MOCK_BATCHES: LockboxBatch[] = [
    { id: "1", lockboxNumber: "LBX-001", batchDate: "2026-03-07", receiptCount: 48, amount: 347892.50, status: "Processed", errors: 0 },
    { id: "2", lockboxNumber: "LBX-001", batchDate: "2026-03-06", receiptCount: 32, amount: 218450.00, status: "Processed", errors: 2 },
    { id: "3", lockboxNumber: "LBX-002", batchDate: "2026-03-07", receiptCount: 12, amount: 98700.00, status: "Pending", errors: 0 },
];

export function ArLockboxSetup() {
    const { toast } = useToast();
    const [lbx, setLbx] = useState<LockboxConfig[]>(MOCK_LBX);
    const [batches] = useState<LockboxBatch[]>(MOCK_BATCHES);
    const [tab, setTab] = useState("config");
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState<Partial<LockboxConfig>>({ transmissionFormat: "BAI2", defaultActivity: "Standard Receipts", autoAssociate: true, status: "Active" });

    const handleAdd = () => {
        if (!form.lockboxNumber || !form.bankName) { toast({ title: "Lockbox # and bank required", variant: "destructive" }); return; }
        setLbx(prev => [...prev, { id: Date.now().toString(), ...form } as LockboxConfig]);
        setShowAdd(false);
        setForm({ transmissionFormat: "BAI2", defaultActivity: "Standard Receipts", autoAssociate: true, status: "Active" });
        toast({ title: "Lockbox configured", className: "bg-green-900 border-green-700 text-white" });
    };

    return (
        <StandardPage
            title="Lockbox Setup"
            description="Configure lockbox transmission sources and auto-association rules for receipt import"
            actions={
                tab === "config" && <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" />Add Lockbox</Button>
            }
        >
            <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="config">Lockbox Configuration</TabsTrigger>
                    <TabsTrigger value="batches">Batch History</TabsTrigger>
                </TabsList>

                <TabsContent value="config">
                    <div className="space-y-4">
                        {lbx.map(l => (
                            <Card key={l.id}>
                                <CardContent className="pt-4 pb-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-mono font-bold text-primary">{l.lockboxNumber}</span>
                                                <Badge>{l.transmissionFormat}</Badge>
                                                <Badge className={l.status === "Active" ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"}>{l.status}</Badge>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                                <div><p className="text-muted-foreground">Bank</p><p className="font-medium">{l.bankName}</p></div>
                                                <div><p className="text-muted-foreground">Account</p><p className="font-mono">{l.accountNumber}</p></div>
                                                <div><p className="text-muted-foreground">Batch Source</p><p>{l.batchSource}</p></div>
                                                <div><p className="text-muted-foreground">Match Order</p><p>{l.matchOrder}</p></div>
                                                <div><p className="text-muted-foreground">Auto-Associate</p><p>{l.autoAssociate ? "Yes" : "No"}</p></div>
                                                <div><p className="text-muted-foreground">Default Activity</p><p>{l.defaultActivity}</p></div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="ghost" className="h-7"><Play className="h-3 w-3 mr-1" />Import</Button>
                                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Pencil className="h-3 w-3" /></Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="batches">
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/20 text-xs text-muted-foreground">
                                    <tr>
                                        <th className="p-3 text-left">Lockbox</th>
                                        <th className="p-3 text-left">Batch Date</th>
                                        <th className="p-3 text-right">Receipts</th>
                                        <th className="p-3 text-right">Amount</th>
                                        <th className="p-3 text-left">Status</th>
                                        <th className="p-3 text-right">Errors</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {batches.map(b => (
                                        <tr key={b.id} className="hover:bg-muted/10">
                                            <td className="p-3 font-mono text-xs">{b.lockboxNumber}</td>
                                            <td className="p-3">{b.batchDate}</td>
                                            <td className="p-3 text-right">{b.receiptCount}</td>
                                            <td className="p-3 text-right font-medium">{formatNumber(b.amount)}</td>
                                            <td className="p-3">
                                                <Badge className={b.status === "Processed" ? "bg-green-500/20 text-green-400" : b.status === "Errors" ? "bg-destructive/20 text-destructive" : "bg-blue-500/20 text-blue-400"}>{b.status}</Badge>
                                            </td>
                                            <td className="p-3 text-right">{b.errors > 0 ? <span className="text-red-400 font-medium">{b.errors}</span> : "—"}</td>
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
                    <DialogHeader><DialogTitle>Add Lockbox Configuration</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { id: "lockboxNumber", label: "Lockbox Number *", value: form.lockboxNumber || "" },
                            { id: "bankName", label: "Bank Name *", value: form.bankName || "" },
                            { id: "accountNumber", label: "Bank Account Number", value: form.accountNumber || "" },
                            { id: "batchSource", label: "Batch Source", value: form.batchSource || "" },
                            { id: "matchOrder", label: "Match Order", value: form.matchOrder || "Reference, Amount, Date" },
                        ].map(f => (
                            <div key={f.id}>
                                <Label className="text-xs">{f.label}</Label>
                                <Input className="mt-1 h-8 text-xs" value={f.value} onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))} />
                            </div>
                        ))}
                        <div>
                            <Label className="text-xs">Transmission Format</Label>
                            <Select value={form.transmissionFormat} onValueChange={v => setForm(p => ({ ...p, transmissionFormat: v }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {["BAI2", "SWIFT MT900", "SWIFT MT940", "CAMT053", "Custom"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2 pt-4">
                            <Switch checked={form.autoAssociate} onCheckedChange={v => setForm(p => ({ ...p, autoAssociate: v }))} aria-label="Auto-associate receipts" />
                            <Label className="text-xs">Auto-Associate Receipts</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                        <Button onClick={handleAdd}>Add Lockbox</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}

export default ArLockboxSetup;
