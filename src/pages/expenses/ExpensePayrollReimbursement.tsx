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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Users, Send, CheckCircle2, AlertCircle, Banknote, DollarSign } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

type ReimburseStatus = "Pending" | "Approved" | "In Payroll" | "Paid" | "Rejected";
type PayMethod = "Next Payroll Run" | "Off-Cycle EFT" | "ACH Direct";

interface ReimburseRow {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    expenseReportRef: string;
    submittedDate: string;
    currency: string;
    grossAmount: number;
    taxWithheld: number;
    netPayable: number;
    paymentMethod: PayMethod;
    payrollRun: string;
    status: ReimburseStatus;
}

interface PayrollRun {
    id: string;
    runDate: string;
    period: string;
    totalReimbursements: number;
    employeeCount: number;
    status: "Pending" | "Approved" | "Transmitted" | "Complete";
}

const MOCK_ROWS: ReimburseRow[] = [
    { id: "ER001", employeeId: "EMP-1042", employeeName: "Sarah Mitchell", department: "Sales", expenseReportRef: "EXP-2026-0211", submittedDate: "2026-03-20", currency: "USD", grossAmount: 2340, taxWithheld: 0, netPayable: 2340, paymentMethod: "Next Payroll Run", payrollRun: "PR-APR-2026", status: "Approved" },
    { id: "ER002", employeeId: "EMP-1087", employeeName: "James Okafor", department: "Engineering", expenseReportRef: "EXP-2026-0212", submittedDate: "2026-03-22", currency: "USD", grossAmount: 890, taxWithheld: 0, netPayable: 890, paymentMethod: "Off-Cycle EFT", payrollRun: "—", status: "Pending" },
    { id: "ER003", employeeId: "EMP-1134", employeeName: "Priya Mehta", department: "Finance", expenseReportRef: "EXP-2026-0213", submittedDate: "2026-03-25", currency: "USD", grossAmount: 4560, taxWithheld: 228, netPayable: 4332, paymentMethod: "Next Payroll Run", payrollRun: "PR-APR-2026", status: "In Payroll" },
    { id: "ER004", employeeId: "EMP-1201", employeeName: "Carlos Vega", department: "Operations", expenseReportRef: "EXP-2026-0209", submittedDate: "2026-03-18", currency: "USD", grossAmount: 1250, taxWithheld: 0, netPayable: 1250, paymentMethod: "ACH Direct", payrollRun: "—", status: "Paid" },
    { id: "ER005", employeeId: "EMP-1312", employeeName: "Fatima Al-Rashid", department: "Legal", expenseReportRef: "EXP-2026-0214", submittedDate: "2026-03-28", currency: "GBP", grossAmount: 1800, taxWithheld: 0, netPayable: 1800, paymentMethod: "Next Payroll Run", payrollRun: "PR-APR-2026", status: "Pending" },
];

const MOCK_RUNS: PayrollRun[] = [
    { id: "PR-APR-2026", runDate: "2026-04-26", period: "April 2026", totalReimbursements: 11232, employeeCount: 3, status: "Pending" },
    { id: "PR-MAR-2026", runDate: "2026-03-28", period: "March 2026", totalReimbursements: 8445, employeeCount: 6, status: "Complete" },
];

const statusColors: Record<ReimburseStatus, string> = { Pending: "outline", Approved: "default", "In Payroll": "secondary", Paid: "default", Rejected: "destructive" };
const runStatusColors: Record<PayrollRun["status"], string> = { Pending: "outline", Approved: "default", Transmitted: "secondary", Complete: "default" };

export default function ExpensePayrollReimbursement() {
    const { toast } = useToast();
    const [rows, setRows] = useState<ReimburseRow[]>(MOCK_ROWS);
    const [runs] = useState<PayrollRun[]>(MOCK_RUNS);
    const [approveTarget, setApproveTarget] = useState<ReimburseRow | null>(null);
    const [submitRunConfirm, setSubmitRunConfirm] = useState<string | null>(null);

    const handleApprove = () => {
        if (!approveTarget) return;
        setRows(prev => prev.map(r => r.id === approveTarget.id ? { ...r, status: "Approved" } : r));
        toast({ title: "Reimbursement Approved", description: `${approveTarget.expenseReportRef} for ${approveTarget.employeeName} — ${approveTarget.currency} ${formatNumber(approveTarget.netPayable)} → ${approveTarget.paymentMethod}.` });
        setApproveTarget(null);
    };

    const columns: SpreadsheetColumn<ReimburseRow>[] = useMemo(() => [
        { id: "emp", header: "Employee", width: "160px", cellClassName: "font-medium text-sm", cell: r => r.employeeName },
        { id: "dept", header: "Dept", width: "110px", cellClassName: "text-sm text-muted-foreground", cell: r => r.department },
        { id: "ref", header: "Expense Report", width: "140px", cellClassName: "font-mono text-xs", cell: r => r.expenseReportRef },
        { id: "submitted", header: "Submitted", width: "100px", cellClassName: "font-mono text-sm", cell: r => r.submittedDate },
        { id: "gross", header: "Gross", width: "110px", cellClassName: "text-right font-mono", cell: r => `${r.currency} ${formatNumber(r.grossAmount)}` },
        { id: "tax", header: "WHT", width: "90px", cellClassName: "text-right font-mono text-muted-foreground", cell: r => r.taxWithheld > 0 ? `(${formatNumber(r.taxWithheld)})` : "—" },
        { id: "net", header: "Net Payable", width: "110px", cellClassName: "text-right font-mono font-bold", cell: r => `${r.currency} ${formatNumber(r.netPayable)}` },
        { id: "method", header: "Pay Method", width: "130px", cell: r => <Badge variant="outline">{r.paymentMethod}</Badge> },
        { id: "run", header: "Payroll Run", width: "120px", cellClassName: "font-mono text-xs text-muted-foreground", cell: r => r.payrollRun },
        { id: "status", header: "Status", width: "110px", cell: r => <Badge variant={statusColors[r.status] as any}>{r.status}</Badge> },
        {
            id: "actions", header: "", width: "100px",
            cell: r => r.status === "Pending"
                ? <Button size="sm" className="h-7 px-2 text-xs" onClick={() => setApproveTarget(r)}>Approve</Button>
                : r.status === "Paid" ? <span className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> Paid</span>
                    : null,
        },
    ], []);

    const runColumns: SpreadsheetColumn<PayrollRun>[] = useMemo(() => [
        { id: "id", header: "Run ID", width: "130px", cellClassName: "font-mono font-bold text-sm", cell: r => r.id },
        { id: "period", header: "Pay Period", width: "120px", cellClassName: "font-medium text-sm", cell: r => r.period },
        { id: "date", header: "Run Date", width: "110px", cellClassName: "font-mono text-sm", cell: r => r.runDate },
        { id: "count", header: "Employees", width: "100px", cellClassName: "font-mono text-center", cell: r => r.employeeCount },
        { id: "total", header: "Total", width: "130px", cellClassName: "text-right font-mono font-bold", cell: r => `USD ${formatNumber(r.totalReimbursements)}` },
        { id: "status", header: "Status", width: "100px", cell: r => <Badge variant={runStatusColors[r.status] as any}>{r.status}</Badge> },
        {
            id: "actions", header: "", width: "130px",
            cell: r => r.status === "Pending"
                ? <Button size="sm" className="h-7 px-2 text-xs" onClick={() => setSubmitRunConfirm(r.id)}>Submit to Payroll</Button>
                : null,
        },
    ], []);

    return (
        <StandardPage
            title="Expense Reimbursement via Payroll"
            description="Route approved expense report reimbursements through the payroll cycle or off-cycle ACH. Manages net payable calculation, withholding tax, and payroll run batching."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Expense Management", href: "/finance/expense-management" },
                { label: "Payroll Reimbursement" },
            ]}
        >
            <div className="mb-4 p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground flex items-start gap-2">
                <Banknote className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                <span><strong>Oracle Expenses Parity:</strong> Approved expense reports are batched into payroll runs or routed as off-cycle EFT/ACH payments. Net payable = gross amount minus any taxable benefit withholding. Payroll integration feeds EMP-level payroll journals into GL.</span>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
                {[
                    { label: "Pending Approval", val: rows.filter(r => r.status === "Pending").length, color: "border-l-amber-400" },
                    { label: "Approved", val: rows.filter(r => r.status === "Approved").length, color: "border-l-primary" },
                    { label: "In Payroll Run", val: rows.filter(r => r.status === "In Payroll").length, color: "border-l-secondary" },
                    { label: "Paid (MTD)", val: rows.filter(r => r.status === "Paid").length, color: "border-l-green-500" },
                ].map(m => (
                    <Card key={m.label} className={`border-l-4 ${m.color}`}>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{m.label}</p>
                            <p className="text-2xl font-bold font-mono">{m.val}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="pending">
                <TabsList className="mb-3">
                    <TabsTrigger value="pending">Reimbursements</TabsTrigger>
                    <TabsTrigger value="runs">Payroll Runs</TabsTrigger>
                </TabsList>
                <TabsContent value="pending">
                    <InteractiveSpreadsheet<ReimburseRow> data={rows} columns={columns} onChange={() => { }} containerHeight="400px" />
                </TabsContent>
                <TabsContent value="runs">
                    <InteractiveSpreadsheet<PayrollRun> data={runs} columns={runColumns} onChange={() => { }} containerHeight="400px" />
                </TabsContent>
            </Tabs>

            {/* Approve Dialog */}
            <AlertDialog open={!!approveTarget} onOpenChange={() => setApproveTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Approve Reimbursement</AlertDialogTitle>
                        <AlertDialogDescription>
                            Approve expense reimbursement for <strong>{approveTarget?.employeeName}</strong> — Expense report <strong>{approveTarget?.expenseReportRef}</strong>.
                            Net payable: <strong>{approveTarget?.currency} {formatNumber(approveTarget?.netPayable || 0)}</strong> via <strong>{approveTarget?.paymentMethod}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleApprove}>Approve</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Submit payroll run */}
            <AlertDialog open={!!submitRunConfirm} onOpenChange={() => setSubmitRunConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit Payroll Run</AlertDialogTitle>
                        <AlertDialogDescription>
                            Submit payroll run <strong>{submitRunConfirm}</strong> to the payroll engine. All approved reimbursements in this run will be included in the next pay cycle and GL journals will be generated automatically.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { toast({ title: "Payroll Run Submitted", description: `Run ${submitRunConfirm} transmitted to payroll engine.` }); setSubmitRunConfirm(null); }}>
                            Submit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </StandardPage>
    );
}
