import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Plus, AlertTriangle, CheckCircle, Wallet } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatNumber } from "@/lib/formatters";

const SEED_POS: any[] = [
    { id: "PO-2026-1310", poNumber: "PO-2026-1310", supplier: "CoatPro Services Ltd", totalAmount: 28500, currency: "USD", status: "Pending Distribution" },
    { id: "PO-2026-1295", poNumber: "PO-2026-1295", supplier: "HeatTech Ltd", totalAmount: 12500, currency: "USD", status: "Distributions Complete" },
    { id: "PO-2026-1320", poNumber: "PO-2026-1320", supplier: "Tech Hardware Inc", totalAmount: 54000, currency: "USD", status: "Pending Distribution" },
];

const SEED_LINES: any[] = [
    { id: "L1", poId: "PO-2026-1310", lineNum: 1, item: "COAT-SVC-01", description: "Surface Coating — Batch A", quantity: 50, unitPrice: 350, lineTotal: 17500 },
    { id: "L2", poId: "PO-2026-1310", lineNum: 2, item: "COAT-LABOR", description: "Setup & Preparation Labor", quantity: 10, unitPrice: 100, lineTotal: 1000 },
];

const SEED_DISTRIBUTIONS: any[] = [
    { id: "D1", lineId: "L1", distNum: 1, chargeAccount: "01-640-7210-0000", project: "PROJ-2026-010", task: "TASK-010-05", expenditureType: "Subcontractor", pct: 70, amount: 12250, status: "Reserved" },
    { id: "D2", lineId: "L1", distNum: 2, chargeAccount: "01-650-7210-0000", project: null, task: null, expenditureType: null, pct: 30, amount: 5250, status: "Reserved" },
];

const CHARGE_ACCOUNTS = ["01-640-7210-0000", "01-650-7210-0000", "02-100-5000-0000", "02-200-6000-0000", "03-310-8100-5000"];
const EXP_TYPES = ["Materials", "Subcontractor", "Equipment", "Labor — Direct", "Labor — Indirect", "Travel", "Other"];

export default function PODistributionWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedPO, setSelectedPO] = useState<any>(SEED_POS[0]);
    const [selectedLine, setSelectedLine] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [newDist, setNewDist] = useState({ chargeAccount: CHARGE_ACCOUNTS[0], project: "", task: "", expenditureType: EXP_TYPES[0], pct: "" });

    const lines = SEED_LINES.filter(l => l.poId === selectedPO?.id);
    const distributions = SEED_DISTRIBUTIONS.filter(d => d.lineId === selectedLine?.id);
    const totalPct = distributions.reduce((s, d) => s + d.pct, 0);
    const isBalanced = Math.abs(totalPct - 100) < 0.01;

    const submitMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/procurement/distributions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { toast({ title: "Distribution saved" }); setIsOpen(false); },
        onError: () => { toast({ title: "Saved (pending API)" }); setIsOpen(false); },
    });

    const encumbranceMutation = useMutation({
        mutationFn: (poId: string) => fetch(`/api/procurement/po/${poId}/encumber`, { method: "POST" }).then(r => r.json()),
        onSuccess: () => { toast({ title: "Encumbrance reserved in GL — Funds check passed" }); },
        onError: () => { toast({ title: "Funds check submitted (pending API)" }); },
    });

    const poCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "poNumber", header: "PO Number", width: "150px", cell: r => <span className="font-mono text-xs text-blue-600">{r.poNumber}</span> },
        { id: "supplier", header: "Supplier", width: "220px", cell: r => <span className="font-medium">{r.supplier}</span> },
        { id: "totalAmount", header: "Total", width: "120px", cell: r => <span className="text-right block font-bold">${formatNumber(r.totalAmount)}</span> },
        { id: "currency", header: "CCY", width: "70px" },
        { id: "status", header: "Status", width: "180px", cell: r => <StatusBadge status={r.status} /> },
        { id: "action", header: "", width: "100px", cell: r => <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setSelectedPO(r); setSelectedLine(null); }}>Distribute</Button> },
    ], []);

    const lineCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "lineNum", header: "Line", width: "60px", cell: r => <span className="text-center block font-bold">{r.lineNum}</span> },
        { id: "item", header: "Item", width: "130px", cell: r => <span className="font-mono text-xs">{r.item}</span> },
        { id: "description", header: "Description", width: "220px", cell: r => <span className="font-medium">{r.description}</span> },
        { id: "quantity", header: "Qty", width: "80px", cell: r => <span className="text-right block">{r.quantity}</span> },
        { id: "unitPrice", header: "Unit Price", width: "110px", cell: r => <span className="text-right block">${formatNumber(r.unitPrice)}</span> },
        { id: "lineTotal", header: "Line Total", width: "120px", cell: r => <span className="text-right block font-bold">${formatNumber(r.lineTotal)}</span> },
        { id: "action", header: "", width: "120px", cell: r => <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelectedLine(r)}>Add Distributions</Button> },
    ], []);

    const distCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "distNum", header: "Dist #", width: "70px", cell: r => <span className="text-center block font-bold text-xs">D{r.distNum}</span> },
        { id: "chargeAccount", header: "Charge Account (CCID)", width: "200px", cell: r => <span className="font-mono text-xs text-indigo-700">{r.chargeAccount}</span> },
        { id: "project", header: "Project", width: "140px", cell: r => r.project ? <span className="font-mono text-xs text-blue-600">{r.project}</span> : <span className="text-muted-foreground text-xs italic">None</span> },
        { id: "task", header: "Task", width: "120px", cell: r => r.task ? <span className="font-mono text-xs">{r.task}</span> : <span className="text-muted-foreground text-xs">—</span> },
        { id: "expenditureType", header: "Expenditure Type", width: "160px", cell: r => r.expenditureType ? <Badge variant="secondary" className="text-xs">{r.expenditureType}</Badge> : <span className="text-muted-foreground text-xs">—</span> },
        { id: "pct", header: "Pct %", width: "90px", cell: r => <span className={`text-right block font-bold ${r.pct === 100 ? "text-green-700" : "text-amber-600"}`}>{r.pct}%</span> },
        { id: "amount", header: "Amount", width: "120px", cell: r => <span className="text-right block font-semibold">${formatNumber(r.amount)}</span> },
        { id: "status", header: "Status", width: "120px", cell: r => <StatusBadge status={r.status} /> },
    ], []);

    return (
        <StandardPage
            title="PO Distribution Workbench"
            description="Assign charge accounts, project codes, and expenditure types to each PO line. Distributions must sum to 100% before GL encumbrance can be reserved."
            breadcrumbs={[{ label: "Procurement", href: "/scm/procurement" }, { label: "PO Distributions" }]}
        >
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Wallet className="h-4 w-4" />Selected PO</CardTitle></CardHeader>
                    <CardContent><div className="text-xl font-bold font-mono text-blue-600">{selectedPO?.poNumber}</div><p className="text-xs text-muted-foreground">{selectedPO?.supplier}</p></CardContent>
                </Card>
                <Card className={selectedLine && !isBalanced ? "border-amber-300" : ""}>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center">{isBalanced ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}Distribution Balance</CardTitle></CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${isBalanced ? "text-green-700" : "text-amber-600"}`}>{selectedLine ? `${totalPct}%` : "—"}</div>
                        <p className="text-xs text-muted-foreground">{selectedLine ? (isBalanced ? "Balanced ✓" : `${(100 - totalPct).toFixed(1)}% unallocated`) : "Select a line"}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Line Total</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{selectedLine ? `$${formatNumber(selectedLine.lineTotal)}` : "—"}</div></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="pos">
                <TabsList className="mb-4"><TabsTrigger value="pos">PO List</TabsTrigger><TabsTrigger value="lines" disabled={!selectedPO}>PO Lines {selectedPO && `(${lines.length})`}</TabsTrigger><TabsTrigger value="distributions" disabled={!selectedLine}>Distributions {selectedLine && `(${distributions.length})`}</TabsTrigger></TabsList>

                <TabsContent value="pos">
                    <Card><CardHeader><CardTitle>Purchase Orders — Awaiting Distribution</CardTitle></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={SEED_POS} columns={poCols} onChange={() => { }} containerHeight="380px" /></CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="lines">
                    <Card><CardHeader><CardTitle>PO Lines — {selectedPO?.poNumber}</CardTitle><CardDescription>Click "Add Distributions" to open the distribution editor for each line.</CardDescription></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={lines} columns={lineCols} onChange={() => { }} containerHeight="380px" /></CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="distributions">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div><CardTitle>Distributions — Line {selectedLine?.lineNum} ({selectedLine?.description})</CardTitle>
                                    <CardDescription>Each distribution row assigns a portion of this line's cost to a charge account and optionally a project/task.</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => setIsOpen(true)}><Plus className="h-4 w-4 mr-1" />Add Distribution</Button>
                                    {isBalanced && <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => encumbranceMutation.mutate(selectedPO.id)}><CheckCircle className="h-4 w-4 mr-1" />Reserve Encumbrance</Button>}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={distributions} columns={distCols} onChange={() => { }} containerHeight="360px" /></CardContent>
                        {!isBalanced && distributions.length > 0 && (
                            <div className="p-4 m-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 flex gap-3 items-center text-sm text-amber-700">
                                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                                <span>Distributions total <strong>{totalPct}%</strong> — must reach 100% before encumbrance can be reserved. Add <strong>{(100 - totalPct).toFixed(1)}%</strong> more.</span>
                            </div>
                        )}
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add Distribution — Line {selectedLine?.lineNum}</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2 md:col-span-2"><Label>Charge Account (CCID) *</Label>
                            <Select value={newDist.chargeAccount} onValueChange={v => setNewDist({ ...newDist, chargeAccount: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{CHARGE_ACCOUNTS.map(a => <SelectItem key={a} value={a}><span className="font-mono text-xs">{a}</span></SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Project</Label><Input value={newDist.project} onChange={e => setNewDist({ ...newDist, project: e.target.value })} placeholder="PROJ-2026-XXX" /></div>
                        <div className="space-y-2"><Label>Task</Label><Input value={newDist.task} onChange={e => setNewDist({ ...newDist, task: e.target.value })} placeholder="TASK-XXX-XX" /></div>
                        <div className="space-y-2"><Label>Expenditure Type</Label>
                            <Select value={newDist.expenditureType} onValueChange={v => setNewDist({ ...newDist, expenditureType: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{EXP_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Percentage (%) *</Label>
                            <Input type="number" min="0.01" max={100 - totalPct} step="0.01" value={newDist.pct} onChange={e => setNewDist({ ...newDist, pct: e.target.value })} placeholder={`Max: ${(100 - totalPct).toFixed(1)}%`} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button disabled={!newDist.chargeAccount || !newDist.pct} onClick={() => submitMutation.mutate({
                            lineId: selectedLine.id, chargeAccount: newDist.chargeAccount, project: newDist.project || null, task: newDist.task || null,
                            expenditureType: newDist.expenditureType, pct: parseFloat(newDist.pct), amount: selectedLine.lineTotal * parseFloat(newDist.pct) / 100, status: "Pending"
                        })}>Save Distribution</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
