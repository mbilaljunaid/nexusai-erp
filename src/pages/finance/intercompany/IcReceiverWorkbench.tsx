import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, MessageSquare, ArrowRight } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

type ReceiverStatus = "Pending" | "Approved" | "Rejected" | "Modification Requested";

interface ICReceivable {
    id: string;
    batchId: string;
    description: string;
    sellerEntity: string;
    myEntity: string;
    amount: number;
    currency: string;
    transactionDate: string;
    dueDate: string;
    apInvoiceRef?: string;
    status: ReceiverStatus;
    rejectionReason?: string;
}

const MY_ENTITY = "LE-002 (EMEA Ltd)";

const MOCK_RECEIVABLES: ICReceivable[] = [
    { id: "ICR-001", batchId: "IC-2026-001", description: "Management fee — HQ to EMEA Q1 2026", sellerEntity: "LE-001 (Parent HQ)", myEntity: MY_ENTITY, amount: 125000, currency: "USD", transactionDate: "2026-03-31", dueDate: "2026-04-30", status: "Pending" },
    { id: "ICR-002", batchId: "IC-2026-004", description: "Royalty — IP licensing HQ Q1 2026", sellerEntity: "LE-001 (Parent HQ)", myEntity: MY_ENTITY, amount: 32000, currency: "USD", transactionDate: "2026-02-28", dueDate: "2026-03-31", status: "Pending" },
    { id: "ICR-003", batchId: "IC-2025-047", description: "IT infrastructure recharge Q4 2025", sellerEntity: "LE-001 (Parent HQ)", myEntity: MY_ENTITY, amount: 41000, currency: "USD", transactionDate: "2025-12-31", dueDate: "2026-01-31", apInvoiceRef: "APINV-2026-0441", status: "Approved" },
    { id: "ICR-004", batchId: "IC-2025-039", description: "Shared service allocation — HR Oct 2025", sellerEntity: "LE-001 (Parent HQ)", myEntity: MY_ENTITY, amount: 18200, currency: "USD", transactionDate: "2025-10-31", dueDate: "2025-11-30", apInvoiceRef: "APINV-2025-0892", status: "Rejected", rejectionReason: "Allocation basis incorrect — requesting revised calculation" },
];

const statusColors: Record<ReceiverStatus, string> = {
    Pending: "outline",
    Approved: "default",
    Rejected: "destructive",
    "Modification Requested": "secondary",
};

export default function IcReceiverWorkbench() {
    const { toast } = useToast();
    const [receivables, setReceivables] = useState<ICReceivable[]>(MOCK_RECEIVABLES);
    const [actionTarget, setActionTarget] = useState<{ icr: ICReceivable; action: "Approved" | "Rejected" | "Modification Requested" } | null>(null);
    const [rejectionNote, setRejectionNote] = useState("");

    const handleAction = () => {
        if (!actionTarget) return;
        setReceivables(prev => prev.map(r => r.id === actionTarget.icr.id ? {
            ...r,
            status: actionTarget.action,
            rejectionReason: actionTarget.action !== "Approved" ? rejectionNote : undefined,
            apInvoiceRef: actionTarget.action === "Approved" ? `APINV-2026-${900 + Math.floor(Math.random() * 99)}` : r.apInvoiceRef,
        } : r));
        const messages: Record<typeof actionTarget.action, string> = {
            Approved: `IC charge accepted. AP invoice created in your Payables subledger.`,
            Rejected: `IC charge rejected. Sender notified.`,
            "Modification Requested": `Modification request sent to ${actionTarget.icr.sellerEntity}.`,
        };
        toast({ title: `${actionTarget.action}`, description: messages[actionTarget.action] });
        setRejectionNote("");
        setActionTarget(null);
    };

    const pending = receivables.filter(r => r.status === "Pending");
    const historical = receivables.filter(r => r.status !== "Pending");

    const makeColumns = (showActions: boolean): SpreadsheetColumn<ICReceivable>[] => [
        { id: "batchId", header: "IC Batch", width: "130px", cellClassName: "font-mono text-sm font-medium", cell: (r) => r.batchId },
        { id: "description", header: "Description", width: "260px", cellClassName: "text-sm", cell: (r) => r.description },
        {
            id: "seller", header: "Sender → Receiver", width: "270px",
            cell: (r) => (
                <div className="flex items-center gap-1 text-xs">
                    <span className="font-medium text-primary">{r.sellerEntity}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span>{r.myEntity}</span>
                </div>
            ),
        },
        { id: "amount", header: "Amount", width: "140px", cellClassName: "text-right font-mono font-bold", cell: (r) => `${r.currency} ${formatNumber(r.amount)}` },
        { id: "dueDate", header: "Due Date", width: "100px", cellClassName: "font-mono text-xs", cell: (r) => r.dueDate },
        {
            id: "status", header: "Status", width: "180px",
            cell: (r) => (
                <div>
                    <Badge variant={statusColors[r.status] as any}>{r.status}</Badge>
                    {r.apInvoiceRef && <p className="text-xs text-muted-foreground font-mono mt-0.5">{r.apInvoiceRef}</p>}
                </div>
            ),
        },
        ...(showActions ? [{
            id: "actions", header: "Actions", width: "240px",
            cell: (r: ICReceivable) => r.status === "Pending" ? (
                <div className="flex gap-1">
                    <Button size="sm" className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700" onClick={() => setActionTarget({ icr: r, action: "Approved" })}>
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Accept
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs border-amber-400 text-amber-600" onClick={() => setActionTarget({ icr: r, action: "Modification Requested" })}>
                        <MessageSquare className="mr-1 h-3 w-3" /> Modify
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs border-destructive text-destructive" onClick={() => setActionTarget({ icr: r, action: "Rejected" })}>
                        <XCircle className="mr-1 h-3 w-3" /> Reject
                    </Button>
                </div>
            ) : null,
        } as SpreadsheetColumn<ICReceivable>] : []),
    ];

    return (
        <StandardPage
            title="IC Receiver Workbench"
            description={`Intercompany charges directed to your entity (${MY_ENTITY}). Review, approve, reject, or request modification of charges from other group entities. Approved charges automatically create AP invoices.`}
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Intercompany", href: "/intercompany" },
                { label: "Receiver Workbench" },
            ]}
        >
            {/* Summary KPI */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                    { label: "Pending Approval", val: pending.length, color: "border-l-amber-400" },
                    { label: "Approved (this period)", val: receivables.filter(r => r.status === "Approved").length, color: "border-l-green-500" },
                    { label: "Rejected", val: receivables.filter(r => r.status === "Rejected").length, color: "border-l-destructive" },
                    { label: "Pending Value", val: `$${formatNumber(pending.reduce((s, r) => s + r.amount, 0))}`, color: "border-l-primary" },
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
                <TabsList className="mb-4">
                    <TabsTrigger value="pending">Pending Approval ({pending.length})</TabsTrigger>
                    <TabsTrigger value="history">History ({historical.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                    {pending.length === 0 ? (
                        <div className="flex items-center justify-center h-32 rounded-lg border border-dashed text-muted-foreground gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            No pending IC charges to review.
                        </div>
                    ) : (
                        <InteractiveSpreadsheet<ICReceivable>
                            data={pending}
                            columns={makeColumns(true)}
                            onChange={() => { }}
                            containerHeight="360px"
                        />
                    )}
                </TabsContent>

                <TabsContent value="history">
                    <InteractiveSpreadsheet<ICReceivable>
                        data={historical}
                        columns={makeColumns(false)}
                        onChange={() => { }}
                        containerHeight="360px"
                    />
                </TabsContent>
            </Tabs>

            {/* Action Confirmation */}
            <AlertDialog open={!!actionTarget} onOpenChange={() => { setActionTarget(null); setRejectionNote(""); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {actionTarget?.action === "Approved" && "Accept IC Charge"}
                            {actionTarget?.action === "Rejected" && "Reject IC Charge"}
                            {actionTarget?.action === "Modification Requested" && "Request Modification"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            <p>
                                {actionTarget?.action === "Approved" && <>Accepting <strong>{actionTarget.icr.batchId}</strong> ({actionTarget.icr.currency} {formatNumber(actionTarget.icr.amount)}) from <strong>{actionTarget.icr.sellerEntity}</strong>. An AP invoice will be created in your Payables subledger.</>}
                                {actionTarget?.action === "Rejected" && <>Rejecting <strong>{actionTarget.icr.batchId}</strong>. The sender will be notified.</>}
                                {actionTarget?.action === "Modification Requested" && <>Requesting a modification to <strong>{actionTarget.icr.batchId}</strong>. The sender will be notified to revise,</>}
                            </p>
                            {actionTarget?.action !== "Approved" && (
                                <div className="mt-3 space-y-1">
                                    <Label>{actionTarget?.action === "Rejected" ? "Rejection Reason *" : "Modification Note *"}</Label>
                                    <Textarea
                                        value={rejectionNote}
                                        onChange={e => setRejectionNote(e.target.value)}
                                        placeholder="Provide details to the sending entity..."
                                        rows={3}
                                        className="mt-1"
                                    />
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className={actionTarget?.action === "Approved" ? "bg-green-600 hover:bg-green-700" : actionTarget?.action === "Rejected" ? "bg-destructive hover:bg-destructive/90" : ""}
                            onClick={handleAction}
                            disabled={actionTarget?.action !== "Approved" && !rejectionNote.trim()}
                        >
                            Confirm {actionTarget?.action}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </StandardPage>
    );
}
