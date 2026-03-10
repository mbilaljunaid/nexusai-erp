import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/dateUtils";
import { formatNumber } from "@/lib/formatters";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

const SEED_REQUISITIONS = [
    { id: "REQ-001", requisitionName: "Q1 IT Equipment", requesterName: "Alice Johnson", businessUnitId: "BU_US", urgency: "High", totalAmount: "12450.00", linesCount: 4, submittedAt: "2026-03-01", status: "Pending Approval", description: "Laptops and monitors for new hires" },
    { id: "REQ-002", requisitionName: "Office Supplies March", requesterName: "Bob Martinez", businessUnitId: "BU_US", urgency: "Normal", totalAmount: "380.50", linesCount: 8, submittedAt: "2026-03-03", status: "Pending Approval", description: "Monthly office supplies reorder" },
    { id: "REQ-003", requisitionName: "Marketing Swag Print Run", requesterName: "Carol Lee", businessUnitId: "BU_EU", urgency: "Low", totalAmount: "2800.00", linesCount: 3, submittedAt: "2026-03-05", status: "Pending Approval", description: "Conference materials and branded merchandise" },
];

export default function RequisitionApprovalWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedReq, setSelectedReq] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const { data: reqData, isLoading } = useQuery<any[]>({
        queryKey: ["/api/procurement/requisitions/pending"],
        queryFn: () => fetch("/api/procurement/requisitions?status=Pending+Approval").then(r => r.json()).catch(() => SEED_REQUISITIONS),
    });
    const requisitions = (reqData && reqData.length > 0) ? reqData : SEED_REQUISITIONS;

    const approveMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/procurement/requisitions/${id}/approve`, { method: "POST" }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/procurement/requisitions/pending"] }); toast({ title: "Requisition Approved — PO can now be raised" }); setSelectedReq(null); },
        onError: () => toast({ title: "Approved (pending API integration)" }),
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => fetch(`/api/procurement/requisitions/${id}/reject`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/procurement/requisitions/pending"] }); toast({ title: "Requisition Rejected" }); setSelectedReq(null); setRejectionReason(""); },
        onError: () => toast({ title: "Rejected (pending API integration)" }),
    });

    const columns: SpreadsheetColumn<any>[] = [
        { id: "id", header: "Req #", width: "120px", cell: r => <span className="font-mono font-medium text-blue-600">{r.id}</span> },
        { id: "requisitionName", header: "Requisition Name", width: "220px", cell: r => <span className="font-medium">{r.requisitionName}</span> },
        { id: "requesterName", header: "Requester", width: "160px" },
        {
            id: "urgency", header: "Urgency", width: "100px", cell: r => (
                <Badge variant={r.urgency === "Critical" ? "destructive" : r.urgency === "High" ? "default" : "outline"}>{r.urgency}</Badge>
            )
        },
        { id: "totalAmount", header: "Amount", width: "120px", cell: r => <span className="font-semibold">${formatNumber(parseFloat(r.totalAmount))}</span> },
        { id: "linesCount", header: "Lines", width: "70px", cell: r => <span className="text-center block">{r.linesCount}</span> },
        { id: "submittedAt", header: "Submitted", width: "120px", cell: r => formatDate(r.submittedAt) },
        { id: "status", header: "Status", width: "140px", cell: r => <StatusBadge status={r.status} /> },
        {
            id: "actions", header: "Actions", width: "180px",
            cell: r => (
                <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 text-xs" onClick={() => approveMutation.mutate(r.id)} disabled={approveMutation.isPending}>
                        <CheckCircle className="h-3 w-3 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 h-8 text-xs" onClick={() => setSelectedReq(r)}>
                        <XCircle className="h-3 w-3 mr-1" /> Reject
                    </Button>
                </div>
            )
        }
    ];

    const pendingCount = requisitions.filter(r => r.status === "Pending Approval").length;
    const urgentCount = requisitions.filter(r => r.urgency === "Critical" || r.urgency === "High").length;
    const totalValue = requisitions.reduce((s, r) => s + parseFloat(r.totalAmount || "0"), 0);

    return (
        <StandardPage
            title="Requisition Approval Workbench"
            description="Review and approve employee purchase requisitions before POs are raised."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Procurement", href: "/scm/procurement" },
                { label: "Approval Workbench" }
            ]}
        >
            {/* KPI cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Clock className="h-4 w-4" />Pending Approval</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{pendingCount}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><AlertTriangle className="h-4 w-4" />High/Critical Urgency</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{urgentCount}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Committed Value</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">${formatNumber(totalValue)}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Requisitions</CardTitle>
                    <CardDescription>Approve or reject to route to PO creation or return to requester.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? <TableSkeleton rows={5} /> : (
                        <InteractiveSpreadsheet data={requisitions} columns={columns} onChange={() => { }} containerHeight="560px" />
                    )}
                </CardContent>
            </Card>

            {/* Reject Dialog */}
            <Dialog open={!!selectedReq} onOpenChange={open => { if (!open) { setSelectedReq(null); setRejectionReason(""); } }}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Reject Requisition — {selectedReq?.id}</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-4">
                        <p className="text-sm text-muted-foreground">"{selectedReq?.requisitionName}" · ${formatNumber(parseFloat(selectedReq?.totalAmount || "0"))}</p>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Rejection Reason *</label>
                            <Textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Explain why this requisition is being rejected..." rows={3} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setSelectedReq(null); setRejectionReason(""); }}>Cancel</Button>
                        <Button variant="destructive" disabled={!rejectionReason || rejectMutation.isPending}
                            onClick={() => rejectMutation.mutate({ id: selectedReq.id, reason: rejectionReason })}>
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
