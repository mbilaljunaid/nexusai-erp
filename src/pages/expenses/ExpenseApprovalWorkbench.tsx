import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/formatters";
import {
    CheckCircle2, XCircle, RotateCcw, Eye, MessageSquare, Clock,
    AlertTriangle, User, ChevronDown, ChevronRight, Send, FileText
} from "lucide-react";

interface ExpenseReport {
    id: string;
    reportRef: string;
    employee: string;
    department: string;
    purpose: string;
    totalAmount: number;
    currency: string;
    submittedAt: string;
    daysPending: number;
    violations: string[];
    status: "Pending" | "Flagged" | "Approved" | "Returned";
    lineCount: number;
    advanceApplied: number;
    hasReceipts: boolean;
}

const MOCK_REPORTS: ExpenseReport[] = [
    { id: "1", reportRef: "ER-2026-00142", employee: "Sarah Mitchell", department: "Sales", purpose: "Client visit — Acme Corp, New York", totalAmount: 2847.50, currency: "USD", submittedAt: "2026-03-05", daysPending: 3, violations: ["Hotel exceeds $200 policy"], status: "Flagged", lineCount: 8, advanceApplied: 500, hasReceipts: true },
    { id: "2", reportRef: "ER-2026-00141", employee: "James Walker", department: "Engineering", purpose: "AWS re:Invent Conference 2026", totalAmount: 1423.00, currency: "USD", submittedAt: "2026-03-04", daysPending: 4, violations: [], status: "Pending", lineCount: 5, advanceApplied: 0, hasReceipts: true },
    { id: "3", reportRef: "ER-2026-00139", employee: "Priya Sharma", department: "Finance", purpose: "IFRS Training — London", totalAmount: 3200.00, currency: "GBP", submittedAt: "2026-03-03", daysPending: 5, violations: ["Missing receipts (2 lines)", "Business meals exceed limit"], status: "Flagged", lineCount: 7, advanceApplied: 1000, hasReceipts: false },
    { id: "4", reportRef: "ER-2026-00138", employee: "Carlos Rivera", department: "Marketing", purpose: "Q1 Marketing Summit", totalAmount: 876.25, currency: "USD", submittedAt: "2026-03-02", daysPending: 6, violations: [], status: "Pending", lineCount: 4, advanceApplied: 0, hasReceipts: true },
    { id: "5", reportRef: "ER-2026-00137", employee: "Emily Chen", department: "Operations", purpose: "Vendor review — Chicago", totalAmount: 450.00, currency: "USD", submittedAt: "2026-03-01", daysPending: 7, violations: [], status: "Pending", lineCount: 3, advanceApplied: 0, hasReceipts: true },
];

export function ExpenseApprovalWorkbench() {
    const { toast } = useToast();
    const [reports, setReports] = useState<ExpenseReport[]>(MOCK_REPORTS);
    const [selectedReport, setSelectedReport] = useState<ExpenseReport | null>(null);
    const [actionDialog, setActionDialog] = useState<{ type: string; reportId: string } | null>(null);
    const [comment, setComment] = useState("");
    const [returnReason, setReturnReason] = useState("");
    const [tab, setTab] = useState("pending");

    const pending = reports.filter(r => r.status === "Pending" || r.status === "Flagged");
    const approved = reports.filter(r => r.status === "Approved");
    const returned = reports.filter(r => r.status === "Returned");

    const totalPendingAmount = pending.reduce((s, r) => s + r.totalAmount, 0);

    const applyAction = (type: "Approved" | "Returned", reportId: string) => {
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: type } : r));
        setActionDialog(null);
        setComment("");
        setReturnReason("");
        setSelectedReport(null);
        toast({
            title: type === "Approved" ? "Expense Report Approved" : "Expense Report Returned",
            description: type === "Approved"
                ? "Report submitted to payroll for reimbursement."
                : `Report returned to employee. Reason: ${returnReason || "See comments"}`,
            className: type === "Approved" ? "bg-green-900 border-green-700 text-white" : "bg-amber-900 border-amber-700 text-white",
        });
    };

    const StatusChip = ({ status }: { status: ExpenseReport["status"] }) => {
        const map = {
            Pending: "bg-blue-500/20 text-blue-400 border-blue-500/30",
            Flagged: "bg-amber-500/20 text-amber-400 border-amber-500/30",
            Approved: "bg-green-500/20 text-green-400 border-green-500/30",
            Returned: "bg-destructive/20 text-destructive border-destructive/30",
        };
        return <Badge className={`${map[status]} border text-xs`}>{status}</Badge>;
    };

    const ReportRow = ({ report }: { report: ExpenseReport }) => (
        <div
            className={`p-4 border rounded-lg cursor-pointer transition-colors hover:border-primary/50 ${selectedReport?.id === report.id ? "border-primary bg-primary/5" : "border-border"}`}
            onClick={() => setSelectedReport(report)}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{report.reportRef}</span>
                        <StatusChip status={report.status} />
                        {report.daysPending > 5 && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 border text-xs">
                                <Clock className="h-3 w-3 mr-1" />{report.daysPending} days
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm font-medium">{report.employee}</p>
                    <p className="text-xs text-muted-foreground">{report.department} · {report.purpose}</p>
                    {report.violations.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {report.violations.map((v, i) => (
                                <div key={i} className="flex items-center gap-1 text-xs text-amber-400">
                                    <AlertTriangle className="h-3 w-3" />{v}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="text-right ml-4">
                    <p className="font-semibold">{formatNumber(report.totalAmount)} {report.currency}</p>
                    <p className="text-xs text-muted-foreground">{report.lineCount} lines</p>
                    <p className="text-xs text-muted-foreground">Submitted {report.submittedAt}</p>
                </div>
            </div>
            {(report.status === "Pending" || report.status === "Flagged") && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs"
                        onClick={e => { e.stopPropagation(); setActionDialog({ type: "approve", reportId: report.id }); }}>
                        <CheckCircle2 className="h-3 w-3 mr-1" />Approve
                    </Button>
                    <Button size="sm" variant="destructive" className="h-7 text-xs"
                        onClick={e => { e.stopPropagation(); setActionDialog({ type: "return", reportId: report.id }); }}>
                        <RotateCcw className="h-3 w-3 mr-1" />Return
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs"
                        onClick={e => { e.stopPropagation(); setSelectedReport(report); }}>
                        <Eye className="h-3 w-3 mr-1" />View Detail
                    </Button>
                </div>
            )}
        </div>
    );

    return (
        <StandardPage
            title="Expense Approval Workbench"
            description="Review and approve employee expense reports"
        >
            {/* Summary metrics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: "Pending Approval", value: pending.length, sub: `${formatNumber(totalPendingAmount)} USD total`, color: "text-blue-400" },
                    { label: "Flagged / Violations", value: pending.filter(r => r.status === "Flagged").length, sub: "Require attention", color: "text-amber-400" },
                    { label: "Approved This Week", value: approved.length, sub: `${formatNumber(approved.reduce((s, r) => s + r.totalAmount, 0))} USD`, color: "text-green-400" },
                ].map(m => (
                    <Card key={m.label}>
                        <CardContent className="pt-4 pb-4">
                            <p className="text-xs text-muted-foreground">{m.label}</p>
                            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{m.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
                    <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
                    <TabsTrigger value="returned">Returned ({returned.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                    <div className="space-y-3">
                        {pending.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                                <p>No pending expense reports</p>
                            </div>
                        ) : pending.map(r => <ReportRow key={r.id} report={r} />)}
                    </div>
                </TabsContent>

                <TabsContent value="approved">
                    <div className="space-y-3">
                        {approved.map(r => <ReportRow key={r.id} report={r} />)}
                    </div>
                </TabsContent>

                <TabsContent value="returned">
                    <div className="space-y-3">
                        {returned.map(r => <ReportRow key={r.id} report={r} />)}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Approve Dialog */}
            <Dialog open={actionDialog?.type === "approve"} onOpenChange={() => setActionDialog(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" />Approve Expense Report</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Report will be approved and sent to payroll for reimbursement.
                        </p>
                        <div>
                            <Label htmlFor="approve-comment">Optional Comments</Label>
                            <Textarea id="approve-comment" className="mt-1" rows={3} placeholder="Add approval comments..."
                                value={comment} onChange={e => setComment(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionDialog(null)}>Cancel</Button>
                        <Button className="bg-green-600 hover:bg-green-700"
                            onClick={() => applyAction("Approved", actionDialog!.reportId)}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />Confirm Approval
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Return Dialog */}
            <Dialog open={actionDialog?.type === "return"} onOpenChange={() => setActionDialog(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle className="flex items-center gap-2"><RotateCcw className="h-5 w-5 text-amber-500" />Return Expense Report</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label htmlFor="return-reason">Return Reason *</Label>
                            <Select value={returnReason} onValueChange={setReturnReason}>
                                <SelectTrigger id="return-reason" className="mt-1"><SelectValue placeholder="Select a reason" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Missing receipts">Missing receipts</SelectItem>
                                    <SelectItem value="Insufficient business justification">Insufficient business justification</SelectItem>
                                    <SelectItem value="Policy violation — requires justification">Policy violation — requires justification</SelectItem>
                                    <SelectItem value="Personal expense included">Personal expense included</SelectItem>
                                    <SelectItem value="Incorrect amounts">Incorrect amounts</SelectItem>
                                    <SelectItem value="Duplicate entry">Duplicate entry</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="return-comment">Additional Comments</Label>
                            <Textarea id="return-comment" className="mt-1" rows={3} placeholder="Provide details to help the employee resubmit correctly..."
                                value={comment} onChange={e => setComment(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionDialog(null)}>Cancel</Button>
                        <Button variant="destructive" disabled={!returnReason}
                            onClick={() => applyAction("Returned", actionDialog!.reportId)}>
                            <RotateCcw className="h-4 w-4 mr-2" />Return to Employee
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}

export default ExpenseApprovalWorkbench;
