import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, DollarSign, Receipt, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

type AdvanceStatus = "Issued" | "Partial" | "Reconciled" | "Overdue";

interface CashAdvance {
    id: string;
    advanceNumber: string;
    employeeName: string;
    employeeId: string;
    department: string;
    advanceAmount: number;
    spentAmount: number;
    balance: number;
    currency: string;
    issuedDate: string;
    dueDate: string;
    purpose: string;
    status: AdvanceStatus;
    linkedExpenseReports: string[];
}

const MOCK_ADVANCES: CashAdvance[] = [
    { id: "CA-001", advanceNumber: "ADV-2026-001", employeeName: "James Whitfield", employeeId: "EMP-0189", department: "Sales", advanceAmount: 5000, spentAmount: 4200, balance: 800, currency: "USD", issuedDate: "2026-03-01", dueDate: "2026-03-31", purpose: "Q1 Customer Conference — Chicago", status: "Partial", linkedExpenseReports: ["EXP-2026-041"] },
    { id: "CA-002", advanceNumber: "ADV-2026-002", employeeName: "Sara Ahmad", employeeId: "EMP-0234", department: "Finance", advanceAmount: 2500, spentAmount: 2500, balance: 0, currency: "USD", issuedDate: "2026-02-15", dueDate: "2026-03-15", purpose: "AP audit travel — NYC", status: "Reconciled", linkedExpenseReports: ["EXP-2026-028", "EXP-2026-029"] },
    { id: "CA-003", advanceNumber: "ADV-2026-003", employeeName: "Omar Hassan", employeeId: "EMP-0312", department: "Operations", advanceAmount: 8000, spentAmount: 1200, balance: 6800, currency: "USD", issuedDate: "2026-02-01", dueDate: "2026-02-28", purpose: "MENA supply chain site visits", status: "Overdue", linkedExpenseReports: [] },
    { id: "CA-004", advanceNumber: "ADV-2026-004", employeeName: "Emily Chen", employeeId: "EMP-0401", department: "Engineering", advanceAmount: 3500, spentAmount: 3500, balance: 0, currency: "USD", issuedDate: "2026-03-10", dueDate: "2026-03-31", purpose: "AWS re:Invent 2026", status: "Reconciled", linkedExpenseReports: ["EXP-2026-055"] },
];

const statusColors: Record<AdvanceStatus, string> = { Issued: "outline", Partial: "secondary", Reconciled: "default", Overdue: "destructive" };

const formSchema = z.object({
    employeeName: z.string().min(1),
    employeeId: z.string().min(1),
    department: z.string().min(1),
    advanceAmount: z.string().min(1),
    currency: z.string().default("USD"),
    dueDate: z.string().min(1),
    purpose: z.string().min(5),
});

export default function CashAdvanceReconciliation() {
    const { toast } = useToast();
    const [advances, setAdvances] = useState<CashAdvance[]>(MOCK_ADVANCES);
    const [createOpen, setCreateOpen] = useState(false);
    const [reconcileTarget, setReconcileTarget] = useState<CashAdvance | null>(null);
    const [expenseRef, setExpenseRef] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { employeeName: "", employeeId: "", department: "", advanceAmount: "", currency: "USD", dueDate: "", purpose: "" },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const amt = parseFloat(values.advanceAmount);
        const adv: CashAdvance = {
            id: `CA-${String(advances.length + 1).padStart(3, "0")}`,
            advanceNumber: `ADV-2026-${String(advances.length + 1).padStart(3, "0")}`,
            employeeName: values.employeeName,
            employeeId: values.employeeId,
            department: values.department,
            advanceAmount: amt,
            spentAmount: 0,
            balance: amt,
            currency: values.currency,
            issuedDate: new Date().toISOString().slice(0, 10),
            dueDate: values.dueDate,
            purpose: values.purpose,
            status: "Issued",
            linkedExpenseReports: [],
        };
        setAdvances(prev => [adv, ...prev]);
        form.reset();
        setCreateOpen(false);
        toast({ title: "Cash Advance Issued", description: `${adv.advanceNumber} — ${adv.currency} ${formatNumber(amt)} issued to ${adv.employeeName}.` });
    };

    const handleReconcile = () => {
        if (!reconcileTarget || !expenseRef.trim()) return;
        const spent = reconcileTarget.advanceAmount; // full spend for simplicity
        setAdvances(prev => prev.map(a => a.id === reconcileTarget.id ? {
            ...a,
            spentAmount: spent,
            balance: 0,
            status: "Reconciled" as AdvanceStatus,
            linkedExpenseReports: [...a.linkedExpenseReports, expenseRef.trim()],
        } : a));
        toast({ title: "Advance Reconciled", description: `${reconcileTarget.advanceNumber} fully reconciled against ${expenseRef.trim()}.` });
        setReconcileTarget(null);
        setExpenseRef("");
    };

    const overdue = advances.filter(a => a.status === "Overdue");
    const open = advances.filter(a => ["Issued", "Partial", "Overdue"].includes(a.status));

    const columns: SpreadsheetColumn<CashAdvance>[] = useMemo(() => [
        { id: "advanceNumber", header: "Advance #", width: "140px", cellClassName: "font-mono text-sm font-bold", cell: r => r.advanceNumber },
        { id: "employeeName", header: "Employee", width: "170px", cellClassName: "font-medium", cell: r => r.employeeName },
        { id: "department", header: "Dept", width: "110px", cellClassName: "text-sm text-muted-foreground", cell: r => r.department },
        { id: "purpose", header: "Purpose", width: "210px", cellClassName: "text-xs", cell: r => r.purpose },
        { id: "advance", header: "Advance", width: "120px", cellClassName: "text-right font-mono font-medium", cell: r => `${r.currency} ${formatNumber(r.advanceAmount)}` },
        { id: "spent", header: "Spent", width: "110px", cellClassName: "text-right font-mono text-green-600", cell: r => r.spentAmount > 0 ? formatNumber(r.spentAmount) : "—" },
        {
            id: "balance", header: "Balance Due", width: "110px",
            cellClassName: "text-right font-mono font-bold",
            cell: r => r.balance > 0 ? <span className={r.status === "Overdue" ? "text-destructive" : ""}>{formatNumber(r.balance)}</span> : <span className="text-muted-foreground">—</span>,
        },
        { id: "dueDate", header: "Due", width: "95px", cellClassName: "font-mono text-sm", cell: r => r.dueDate },
        { id: "status", header: "Status", width: "105px", cell: r => <Badge variant={statusColors[r.status] as any}>{r.status}</Badge> },
        {
            id: "actions", header: "Actions", width: "130px",
            cell: r => ["Issued", "Partial", "Overdue"].includes(r.status) ? (
                <Button size="sm" className="h-7 px-2 text-xs" onClick={() => setReconcileTarget(r)}>
                    <Receipt className="mr-1 h-3 w-3" /> Reconcile
                </Button>
            ) : <span className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> Done</span>,
        },
    ], []);

    return (
        <StandardPage
            title="Cash Advance Reconciliation"
            description="Track cash advances issued to employees for business travel and expenses. Reconcile advances against submitted expense reports to close the advance."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Expense Management", href: "/expenses" },
                { label: "Cash Advances" },
            ]}
            actions={
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Issue Advance
                </Button>
            }
        >
            {overdue.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300 text-sm">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <strong>{overdue.length} advance(s) overdue</strong> — {overdue.map(a => a.employeeName).join(", ")} must submit expense reports immediately.
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                    { label: "Open Advances", val: open.length, color: "border-l-primary" },
                    { label: "Overdue", val: overdue.length, color: "border-l-destructive" },
                    { label: "Total Outstanding", val: `$${formatNumber(open.reduce((s, a) => s + a.balance, 0))}`, color: "border-l-amber-400" },
                    { label: "Reconciled (YTD)", val: advances.filter(a => a.status === "Reconciled").length, color: "border-l-green-500" },
                ].map(m => (
                    <Card key={m.label} className={`border-l-4 ${m.color}`}>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{m.label}</p>
                            <p className="text-2xl font-bold font-mono">{m.val}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <InteractiveSpreadsheet<CashAdvance>
                data={advances}
                columns={columns}
                onChange={() => { }}
                containerHeight="420px"
            />

            {/* Issue Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary" /> Issue Cash Advance</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-2">
                            <div className="grid grid-cols-2 gap-3">
                                <FormField control={form.control} name="employeeName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Employee Name *</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="employeeId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Employee ID *</FormLabel>
                                        <FormControl><Input {...field} className="font-mono" placeholder="EMP-XXXX" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="department" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {["Sales", "Finance", "Engineering", "Operations", "HR", "Marketing", "Legal"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="currency" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Currency</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {["USD", "EUR", "GBP", "AED"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="advanceAmount" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Advance Amount *</FormLabel>
                                        <FormControl><Input {...field} type="number" step="0.01" className="font-mono" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="dueDate" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date (expense report by) *</FormLabel>
                                        <FormControl><Input {...field} type="date" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="purpose" render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Purpose *</FormLabel>
                                        <FormControl><Input {...field} placeholder="e.g. Q2 Client Conference — London" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Issue Advance</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Reconcile Dialog */}
            <AlertDialog open={!!reconcileTarget} onOpenChange={() => { setReconcileTarget(null); setExpenseRef(""); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" /> Reconcile Cash Advance</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                            <p>Reconciling <strong>{reconcileTarget?.advanceNumber}</strong> ({reconcileTarget?.currency} {formatNumber(reconcileTarget?.advanceAmount || 0)}) for <strong>{reconcileTarget?.employeeName}</strong>.</p>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-foreground">Expense Report Reference *</label>
                                <Input
                                    className="font-mono"
                                    placeholder="EXP-2026-XXX"
                                    value={expenseRef}
                                    onChange={e => setExpenseRef(e.target.value)}
                                />
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReconcile} disabled={!expenseRef.trim()}>Reconcile & Close</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </StandardPage>
    );
}
