import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

type AdjStatus = "Pending" | "Approved" | "Rejected";

interface ARAdjustment {
    id: string;
    customerId: string;
    customerName: string;
    invoiceNumber: string;
    adjustmentType: "Credit Memo" | "Write-Off" | "Dispute" | "Discount";
    amount: number;
    currency: string;
    reason: string;
    requestedBy: string;
    requestedDate: string;
    status: AdjStatus;
    requiresManagerApproval: boolean;
}

const MOCK_ADJUSTMENTS: ARAdjustment[] = [
    { id: "ADJ-001", customerId: "C-0042", customerName: "Acme Corp", invoiceNumber: "INV-10042", adjustmentType: "Credit Memo", amount: 1250.00, currency: "USD", reason: "Damaged goods returned — partial credit per RMA-220", requestedBy: "J. Smith", requestedDate: "2026-03-05", status: "Pending", requiresManagerApproval: false },
    { id: "ADJ-002", customerId: "C-0089", customerName: "TechFlow Ltd", invoiceNumber: "INV-10103", adjustmentType: "Write-Off", amount: 8750.00, currency: "USD", reason: "Customer declared bankruptcy — approved by CFO", requestedBy: "M. Jones", requestedDate: "2026-03-06", status: "Pending", requiresManagerApproval: true },
    { id: "ADJ-003", customerId: "C-0017", customerName: "Global Retail SA", invoiceNumber: "INV-9887", adjustmentType: "Dispute", amount: 3200.00, currency: "EUR", reason: "Pricing error on line 3 — unit price should be 28.00 not 32.00", requestedBy: "R. Patel", requestedDate: "2026-03-04", status: "Pending", requiresManagerApproval: false },
    { id: "ADJ-004", customerId: "C-0055", customerName: "Sunrise Logistics", invoiceNumber: "INV-9721", adjustmentType: "Discount", amount: 520.00, currency: "USD", reason: "Early payment discount — 2/10 Net 30 applied", requestedBy: "C. Williams", requestedDate: "2026-03-03", status: "Approved", requiresManagerApproval: false },
    { id: "ADJ-005", customerId: "C-0031", customerName: "Alpine Manufacturing GmbH", invoiceNumber: "INV-9650", adjustmentType: "Write-Off", amount: 470.00, currency: "USD", reason: "Small balance write-off — below collections threshold", requestedBy: "J. Smith", requestedDate: "2026-03-01", status: "Rejected", requiresManagerApproval: false },
];

const MANAGER_THRESHOLD = 5000;

export default function ArAdjustmentApprovals() {
    const { toast } = useToast();
    const formatCurrency = (v: number) => formatNumber(v);
    const [adjustments, setAdjustments] = useState<ARAdjustment[]>(MOCK_ADJUSTMENTS);
    const [confirmAction, setConfirmAction] = useState<{ adj: ARAdjustment; action: "Approved" | "Rejected" } | null>(null);
    const [activeTab, setActiveTab] = useState<"my-queue" | "all">("my-queue");

    const updateStatus = (id: string, status: AdjStatus) => {
        setAdjustments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
        toast({ title: `Adjustment ${status}`, description: `${id} has been ${status.toLowerCase()}.` });
        setConfirmAction(null);
    };

    const pendingAdj = adjustments.filter(a => a.status === "Pending");
    const myQueue = pendingAdj.filter(a => !a.requiresManagerApproval);
    const managersQueue = pendingAdj.filter(a => a.requiresManagerApproval);
    const showList = activeTab === "my-queue" ? adjustments.filter(a => a.status === "Pending") : adjustments;

    const columns: SpreadsheetColumn<ARAdjustment>[] = useMemo(() => [
        {
            id: "id", header: "Adj #", width: "100px",
            cellClassName: "font-mono text-sm font-medium",
            cell: (r) => r.id,
        },
        {
            id: "customerName", header: "Customer", width: "180px",
            cell: (r) => r.customerName,
        },
        {
            id: "invoiceNumber", header: "Invoice", width: "120px",
            cellClassName: "font-mono text-sm",
            cell: (r) => r.invoiceNumber,
        },
        {
            id: "adjustmentType", header: "Type", width: "130px",
            cell: (r) => <Badge variant="outline">{r.adjustmentType}</Badge>,
        },
        {
            id: "amount", header: "Amount", width: "120px",
            cellClassName: "text-right font-mono font-medium",
            cell: (r) => (
                <span className={r.amount >= MANAGER_THRESHOLD ? "text-amber-600" : ""}>
                    {formatCurrency(r.amount)}
                    {r.amount >= MANAGER_THRESHOLD && <AlertTriangle className="inline ml-1 h-3.5 w-3.5" />}
                </span>
            ),
        },
        {
            id: "reason", header: "Reason", width: "260px",
            cellClassName: "text-sm text-muted-foreground",
            cell: (r) => r.reason,
        },
        {
            id: "requestedBy", header: "Requested By", width: "130px",
            cell: (r) => r.requestedBy,
        },
        {
            id: "status", header: "Status", width: "120px",
            cell: (r) => (
                <Badge variant={r.status === "Approved" ? "default" : r.status === "Rejected" ? "destructive" : "secondary"}>
                    {r.status === "Approved" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                    {r.status === "Rejected" && <XCircle className="mr-1 h-3 w-3" />}
                    {r.status === "Pending" && <Clock className="mr-1 h-3 w-3" />}
                    {r.status}
                </Badge>
            ),
        },
        {
            id: "actions", header: "Actions", width: "180px",
            cell: (r) => r.status !== "Pending" ? null : (
                <div className="flex gap-1">
                    <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 h-7 px-2 text-xs"
                        onClick={() => setConfirmAction({ adj: r, action: "Approved" })}
                        aria-label={`Approve ${r.id}`}
                    >
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 px-2 text-xs"
                        onClick={() => setConfirmAction({ adj: r, action: "Rejected" })}
                        aria-label={`Reject ${r.id}`}
                    >
                        <XCircle className="h-3 w-3 mr-1" /> Reject
                    </Button>
                </div>
            ),
        },
    ], [formatCurrency]);

    return (
        <StandardPage
            title="AR Adjustment Approvals"
            description="Review and approve pending AR adjustments (credit memos, write-offs, disputes, discounts). Adjustments exceeding $5,000 require manager-level approval."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Accounts Receivable", href: "/finance/ar" },
                { label: "Adjustment Approvals" },
            ]}
        >
            {/* KPI Banner */}
            <div className="mb-4 p-3 bg-amber-50/60 dark:bg-amber-900/10 border border-amber-200 rounded-lg flex items-center gap-3 text-sm text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                    <strong>Approval Policy:</strong> Adjustments ≥ {formatCurrency(MANAGER_THRESHOLD)} require manager approval.
                    {managersQueue.length > 0 && ` ${managersQueue.length} item(s) are currently pending manager sign-off.`}
                </span>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Pending Approvals", count: pendingAdj.length, color: "border-l-yellow-500", textColor: "text-yellow-700" },
                    { label: "Manager Required", count: managersQueue.length, color: "border-l-red-400", textColor: "text-red-700" },
                    { label: "Approved (This Period)", count: adjustments.filter(a => a.status === "Approved").length, color: "border-l-green-500", textColor: "text-green-700" },
                    { label: "Rejected", count: adjustments.filter(a => a.status === "Rejected").length, color: "border-l-muted", textColor: "text-muted-foreground" },
                ].map((m) => (
                    <Card key={m.label} className={`border-l-4 ${m.color}`}>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{m.label}</p>
                            <p className={`text-3xl font-bold font-mono ${m.textColor}`}>{m.count}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <TabsList className="mb-4">
                    <TabsTrigger value="my-queue">My Queue ({pendingAdj.length})</TabsTrigger>
                    <TabsTrigger value="all">All Adjustments ({adjustments.length})</TabsTrigger>
                </TabsList>
                <TabsContent value={activeTab}>
                    <InteractiveSpreadsheet<ARAdjustment>
                        data={showList}
                        columns={columns}
                        onChange={() => { }}
                        containerHeight="480px"
                    />
                </TabsContent>
            </Tabs>

            {/* Approval/Rejection Confirmation */}
            <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmAction?.action === "Approved" ? "Approve" : "Reject"} Adjustment {confirmAction?.adj.id}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmAction?.action === "Approved" ? (
                                <>Approving this {confirmAction.adj.adjustmentType} of <strong>{formatCurrency(confirmAction.adj.amount)}</strong> for <strong>{confirmAction.adj.customerName}</strong> on invoice {confirmAction.adj.invoiceNumber}. A GL journal will be automatically generated for this adjustment.</>
                            ) : (
                                <>Rejecting {confirmAction?.adj.id}. The adjustment will be returned to the requester ({confirmAction?.adj.requestedBy}) with a rejected status. No GL entries will be created.</>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className={confirmAction?.action === "Approved" ? "bg-green-600 hover:bg-green-700" : "bg-destructive hover:bg-destructive/90"}
                            onClick={() => confirmAction && updateStatus(confirmAction.adj.id, confirmAction.action)}
                        >
                            Confirm {confirmAction?.action === "Approved" ? "Approval" : "Rejection"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </StandardPage>
    );
}
