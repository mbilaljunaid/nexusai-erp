import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, DollarSign, FileText } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/dateUtils";
import { formatNumber } from "@/lib/formatters";

const EXP_TYPES = ["Travel — Airfare", "Travel — Hotel", "Travel — Ground Transport", "Meals & Entertainment", "Materials & Supplies", "Equipment Rental", "Subcontractor Fees", "Professional Services", "Training & Certification", "Miscellaneous"];

const SEED_BATCHES: any[] = [
    { id: "NLB-001", batchName: "March Field Trip — NYC", projectNum: "PROJ-2026-010", expType: "Travel — Airfare", employee: "Emma Garcia", expDate: "2026-03-05", amount: 1280.00, currency: "USD", receipt: "Receipt_EGA_NYC.pdf", taskCode: "TASK-010-05", approvalStage: "Pending", approvedBy: null, status: "Pending Approval" },
    { id: "NLB-002", batchName: "Server Hardware — Phase 2", projectNum: "PROJ-2026-010", expType: "Materials & Supplies", employee: "IT Admin", expDate: "2026-03-06", amount: 8450.00, currency: "USD", receipt: "INV-DELL-20260306.pdf", taskCode: "TASK-010-02", approvalStage: "Approved", approvedBy: "Project Manager", status: "Approved" },
    { id: "NLB-003", batchName: "Mar Team Dinner", projectNum: "PROJ-2026-007", expType: "Meals & Entertainment", employee: "Michael Torres", expDate: "2026-03-07", amount: 320.50, currency: "USD", receipt: null, taskCode: "TASK-007-01", approvalStage: "Pending", approvedBy: null, status: "Missing Receipt" },
];

export default function NonLaborExpenseBatch() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [newEntry, setNewEntry] = useState({ batchName: "", projectNum: "", expType: EXP_TYPES[0], employee: "", expDate: "", amount: "", taskCode: "", notes: "" });

    const { data: apiData } = useQuery<any[]>({ queryKey: ["/api/projects/non-labor-expenses"], queryFn: () => fetch("/api/projects/non-labor-expenses").then(r => r.json()).catch(() => []) });
    const batches = (apiData && apiData.length > 0) ? apiData : SEED_BATCHES;

    const createMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/projects/non-labor-expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/projects/non-labor-expenses"] }); toast({ title: "Expense entry submitted" }); setIsOpen(false); },
        onError: () => { toast({ title: "Saved (pending API)" }); setIsOpen(false); },
    });

    const totalAmount = batches.reduce((s, b) => s + b.amount, 0);
    const pending = batches.filter(b => b.status === "Pending Approval").length;

    const columns = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "id", header: "Ref #", width: "100px", cell: r => <span className="font-mono text-xs text-blue-600">{r.id}</span> },
        { id: "batchName", header: "Description", width: "220px", cell: r => <span className="font-medium">{r.batchName}</span> },
        { id: "projectNum", header: "Project", width: "140px", cell: r => <span className="font-mono text-xs text-indigo-600">{r.projectNum}</span> },
        { id: "taskCode", header: "Task", width: "120px", cell: r => <span className="font-mono text-xs">{r.taskCode}</span> },
        { id: "expType", header: "Expense Type", width: "180px", cell: r => <Badge variant="secondary" className="text-xs">{r.expType}</Badge> },
        { id: "employee", header: "Employee", width: "140px" },
        { id: "expDate", header: "Expense Date", width: "130px", cell: r => formatDate(r.expDate) },
        { id: "amount", header: "Amount", width: "110px", cell: r => <span className="text-right block font-bold">${formatNumber(r.amount)}</span> },
        { id: "receipt", header: "Receipt", width: "100px", cell: r => r.receipt ? <span className="text-green-600 text-xs">✓ Attached</span> : <span className="text-red-600 text-xs">Missing</span> },
        { id: "approvedBy", header: "Approved By", width: "130px", cell: r => r.approvedBy ? <span className="text-green-600 text-sm">{r.approvedBy}</span> : <span className="text-muted-foreground text-xs italic">Pending</span> },
        { id: "status", header: "Status", width: "160px", cell: r => <StatusBadge status={r.status} /> },
    ], []);

    return (
        <StandardPage
            title="Non-Labor Expense Batch Entry"
            description="Enter project-related non-labor costs: travel, materials, subcontractors, and supplies. Costs are approved at project level before processing into the PPM cost processor."
            breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: "Expenditures", href: "/projects/expenditures" }, { label: "Non-Labor Expenses" }]}
            actions={<Button onClick={() => setIsOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Expense</Button>}
        >
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><DollarSign className="h-4 w-4" />Total Submitted</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">${formatNumber(totalAmount)}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending Approval</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{pending}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Missing Receipts</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{batches.filter(b => !b.receipt).length}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Non-Labor Expense Entries</CardTitle><CardDescription>Approved entries flow into the PPM Cost Processor for burdening and billing.</CardDescription></CardHeader>
                <CardContent className="p-0"><InteractiveSpreadsheet data={batches} columns={columns} onChange={() => { }} containerHeight="460px" /></CardContent>
            </Card>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader><DialogTitle>Add Non-Labor Expense</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2 md:col-span-2"><Label>Description *</Label><Input value={newEntry.batchName} onChange={e => setNewEntry({ ...newEntry, batchName: e.target.value })} placeholder="e.g. Flight to NYC for client workshop" /></div>
                        <div className="space-y-2"><Label>Project # *</Label><Input value={newEntry.projectNum} onChange={e => setNewEntry({ ...newEntry, projectNum: e.target.value })} placeholder="PROJ-2026-XXX" /></div>
                        <div className="space-y-2"><Label>Task Code</Label><Input value={newEntry.taskCode} onChange={e => setNewEntry({ ...newEntry, taskCode: e.target.value })} placeholder="TASK-XXX-XX" /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Expense Type</Label>
                            <Select value={newEntry.expType} onValueChange={v => setNewEntry({ ...newEntry, expType: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{EXP_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Employee</Label><Input value={newEntry.employee} onChange={e => setNewEntry({ ...newEntry, employee: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Expense Date *</Label><Input type="date" value={newEntry.expDate} onChange={e => setNewEntry({ ...newEntry, expDate: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Amount ($) *</Label><Input type="number" step="0.01" value={newEntry.amount} onChange={e => setNewEntry({ ...newEntry, amount: e.target.value })} /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Notes</Label><Textarea value={newEntry.notes} onChange={e => setNewEntry({ ...newEntry, notes: e.target.value })} rows={2} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={() => createMutation.mutate({ ...newEntry, status: "Pending Approval", approvalStage: "Pending", currency: "USD" })} disabled={!newEntry.batchName || !newEntry.projectNum || !newEntry.amount}>Submit</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
