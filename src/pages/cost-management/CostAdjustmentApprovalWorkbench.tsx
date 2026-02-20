import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    ClipboardList,
    History,
    PlusCircle,
    ShieldCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// ── Types ──────────────────────────────────────────────────────────────────────

interface ApprovalRequest {
    id: string;
    requesterId: string;
    approverId: string | null;
    status: "PENDING" | "APPROVED" | "REJECTED";
    entityType: string;
    entityId: string;
    payload: string | null;
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
}

interface CreateAdjustmentForm {
    transactionId: string;
    costOrganizationId: string;
    adjustmentType: "PriceVariance" | "UsageVariance" | "OHVariance" | "Reclassification";
    adjustmentAmount: string;
    currencyCode: string;
    glAccountId: string;
    justification: string;
    submittedBy: string;
}

// ── Status Badge Helper ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
        PENDING: {
            label: "Pending",
            className: "bg-amber-100 text-amber-800 border-amber-300",
            icon: <Clock className="h-3 w-3 mr-1" />,
        },
        APPROVED: {
            label: "Approved",
            className: "bg-emerald-100 text-emerald-800 border-emerald-300",
            icon: <CheckCircle className="h-3 w-3 mr-1" />,
        },
        REJECTED: {
            label: "Rejected",
            className: "bg-red-100 text-red-800 border-red-300",
            icon: <XCircle className="h-3 w-3 mr-1" />,
        },
    };
    const cfg = map[status] ?? { label: status, className: "bg-gray-100 text-gray-700 border-gray-200", icon: null };
    return (
        <Badge variant="outline" className={`flex items-center text-xs font-medium ${cfg.className}`}>
            {cfg.icon}
            {cfg.label}
        </Badge>
    );
}

// ── ApprovalRow ─────────────────────────────────────────────────────────────────

function ApprovalRow({
    req,
    onApprove,
    onReject,
}: {
    req: ApprovalRequest;
    onApprove?: (id: string, approverId: string) => void;
    onReject?: (id: string, reason: string) => void;
}) {
    const payload = req.payload ? JSON.parse(req.payload) : {};
    const [rejecting, setRejecting] = useState(false);
    const [reason, setReason] = useState("");
    const [approverId, setApproverId] = useState("");

    return (
        <Card className="border border-border shadow-sm">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <StatusBadge status={req.status} />
                            <span className="text-xs text-muted-foreground font-mono truncate">#{req.id.slice(0, 8)}</span>
                            <Badge variant="secondary" className="text-xs">{payload.adjustmentType ?? req.entityType}</Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-sm mt-2">
                            <div>
                                <span className="text-muted-foreground">Amount: </span>
                                <span className={`font-semibold ${Number(payload.adjustmentAmount) >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                                    {payload.adjustmentAmount !== undefined
                                        ? `${Number(payload.adjustmentAmount) >= 0 ? "+" : ""}${Number(payload.adjustmentAmount).toLocaleString()} ${payload.currencyCode ?? ""}`
                                        : "—"}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Submitted by: </span>
                                <span className="font-medium">{req.requesterId.slice(0, 12)}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Date: </span>
                                <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        {payload.justification && (
                            <p className="text-xs text-muted-foreground mt-2 italic">"{payload.justification}"</p>
                        )}
                        {req.rejectionReason && (
                            <p className="text-xs text-red-600 mt-1">Rejection reason: {req.rejectionReason}</p>
                        )}
                    </div>

                    {req.status === "PENDING" && onApprove && onReject && (
                        <div className="flex flex-col gap-2 min-w-[180px]">
                            {!rejecting ? (
                                <>
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-xs">Approver ID</Label>
                                        <Input
                                            value={approverId}
                                            onChange={(e) => setApproverId(e.target.value)}
                                            placeholder="Your user ID"
                                            className="h-7 text-xs"
                                        />
                                    </div>
                                    <Button
                                        size="sm"
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                        disabled={!approverId}
                                        onClick={() => onApprove(req.id, approverId)}
                                    >
                                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full border-red-300 text-red-600 hover:bg-red-50"
                                        onClick={() => setRejecting(true)}
                                    >
                                        <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Rejection reason (required)"
                                        className="text-xs min-h-[60px]"
                                    />
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="w-full"
                                        disabled={!reason.trim()}
                                        onClick={() => { onReject(req.id, reason); setRejecting(false); setReason(""); }}
                                    >
                                        Confirm Rejection
                                    </Button>
                                    <Button size="sm" variant="ghost" className="w-full text-xs" onClick={() => setRejecting(false)}>
                                        Cancel
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// ── Create Adjustment Dialog ────────────────────────────────────────────────────

function CreateAdjustmentDialog({
    open,
    onClose,
    onSubmit,
    isLoading,
}: {
    open: boolean;
    onClose: () => void;
    onSubmit: (form: CreateAdjustmentForm) => void;
    isLoading: boolean;
}) {
    const [form, setForm] = useState<CreateAdjustmentForm>({
        transactionId: "",
        costOrganizationId: "",
        adjustmentType: "PriceVariance",
        adjustmentAmount: "0",
        currencyCode: "USD",
        glAccountId: "",
        justification: "",
        submittedBy: "",
    });

    const update = (key: keyof CreateAdjustmentForm, value: string) =>
        setForm((f) => ({ ...f, [key]: value }));

    const isValid =
        form.transactionId && form.costOrganizationId && form.glAccountId &&
        form.justification.length >= 10 && form.submittedBy && Number(form.adjustmentAmount) !== 0;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PlusCircle className="h-5 w-5 text-primary" />
                        Submit Cost Adjustment for Approval
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs">Transaction ID *</Label>
                            <Input value={form.transactionId} onChange={(e) => update("transactionId", e.target.value)} placeholder="txn-..." className="mt-1" />
                        </div>
                        <div>
                            <Label className="text-xs">Cost Org ID *</Label>
                            <Input value={form.costOrganizationId} onChange={(e) => update("costOrganizationId", e.target.value)} placeholder="org-..." className="mt-1" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs">Adjustment Type *</Label>
                            <select
                                value={form.adjustmentType}
                                onChange={(e) => update("adjustmentType", e.target.value as any)}
                                aria-label="Adjustment Type"
                                title="Adjustment Type"
                                className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="PriceVariance">Price Variance</option>
                                <option value="UsageVariance">Usage Variance</option>
                                <option value="OHVariance">Overhead Variance</option>
                                <option value="Reclassification">Reclassification</option>
                            </select>
                        </div>
                        <div>
                            <Label className="text-xs">Currency *</Label>
                            <Input value={form.currencyCode} onChange={(e) => update("currencyCode", e.target.value)} className="mt-1" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs">Adjustment Amount * (signed)</Label>
                            <Input type="number" value={form.adjustmentAmount} onChange={(e) => update("adjustmentAmount", e.target.value)} className="mt-1" placeholder="e.g. -500 or 1200" />
                        </div>
                        <div>
                            <Label className="text-xs">GL Account ID *</Label>
                            <Input value={form.glAccountId} onChange={(e) => update("glAccountId", e.target.value)} placeholder="1400-..." className="mt-1" />
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs">Justification * (min 10 chars)</Label>
                        <Textarea
                            value={form.justification}
                            onChange={(e) => update("justification", e.target.value)}
                            className="mt-1 min-h-[60px] text-sm"
                            placeholder="Describe the reason for this adjustment..."
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Your User ID (Submitter) *</Label>
                        <Input value={form.submittedBy} onChange={(e) => update("submittedBy", e.target.value)} placeholder="user-..." className="mt-1" />
                    </div>
                    <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                        <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span><strong>Maker-Checker (SoD):</strong> The approver must be a <em>different person</em> from the submitter. Self-approval is blocked by the system.</span>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button disabled={!isValid || isLoading} onClick={() => onSubmit(form)}>
                        {isLoading ? "Submitting..." : "Submit for Approval"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Main Workbench ──────────────────────────────────────────────────────────────

export default function CostAdjustmentApprovalWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [createOpen, setCreateOpen] = useState(false);

    // ── Queries ────────────────────────────────────────────────────────────────

    const { data: pending = [], isLoading: loadingPending } = useQuery<ApprovalRequest[]>({
        queryKey: ["/api/cost-management/adjustments/pending"],
        queryFn: async () => {
            const res = await fetch("/api/cost-management/adjustments/pending");
            if (!res.ok) throw new Error("Failed to fetch pending queue");
            return res.json();
        },
        refetchInterval: 30000,
    });

    const { data: history = [], isLoading: loadingHistory } = useQuery<ApprovalRequest[]>({
        queryKey: ["/api/cost-management/adjustments/history"],
        queryFn: async () => {
            const res = await fetch("/api/cost-management/adjustments/history?limit=50");
            if (!res.ok) throw new Error("Failed to fetch history");
            return res.json();
        },
    });

    // ── Mutations ──────────────────────────────────────────────────────────────

    const createMutation = useMutation({
        mutationFn: async (form: CreateAdjustmentForm) => {
            const res = await apiRequest("POST", "/api/cost-management/adjustments", {
                ...form,
                adjustmentAmount: Number(form.adjustmentAmount),
            });
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Adjustment submitted", description: "Pending approval from a different user." });
            queryClient.invalidateQueries({ queryKey: ["/api/cost-management/adjustments/pending"] });
            queryClient.invalidateQueries({ queryKey: ["/api/cost-management/adjustments/history"] });
            setCreateOpen(false);
        },
        onError: (err: any) => {
            toast({ title: "Submission failed", description: err.message, variant: "destructive" });
        },
    });

    const approveMutation = useMutation({
        mutationFn: async ({ requestId, approverId }: { requestId: string; approverId: string }) => {
            const res = await apiRequest("POST", `/api/cost-management/adjustments/${requestId}/approve`, { approverId });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message ?? "Approval failed");
            }
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Approved ✓", description: "GL adjustment journal posted successfully." });
            queryClient.invalidateQueries({ queryKey: ["/api/cost-management/adjustments/pending"] });
            queryClient.invalidateQueries({ queryKey: ["/api/cost-management/adjustments/history"] });
        },
        onError: (err: any) => {
            toast({ title: "Approval blocked", description: err.message, variant: "destructive" });
        },
    });

    const rejectMutation = useMutation({
        mutationFn: async ({ requestId, reason, rejectorId }: { requestId: string; reason: string; rejectorId?: string }) => {
            const res = await apiRequest("POST", `/api/cost-management/adjustments/${requestId}/reject`, {
                rejectorId: rejectorId ?? "system",
                reason,
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message ?? "Rejection failed");
            }
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Rejected", description: "Cost adjustment has been rejected and reverted to Draft." });
            queryClient.invalidateQueries({ queryKey: ["/api/cost-management/adjustments/pending"] });
            queryClient.invalidateQueries({ queryKey: ["/api/cost-management/adjustments/history"] });
        },
        onError: (err: any) => {
            toast({ title: "Rejection failed", description: err.message, variant: "destructive" });
        },
    });

    // ── Derived Stats ──────────────────────────────────────────────────────────
    const approved = history.filter((r) => r.status === "APPROVED").length;
    const rejected = history.filter((r) => r.status === "REJECTED").length;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <ClipboardList className="h-6 w-6 text-primary" />
                        Cost Adjustment Approval Workbench
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Maker-checker workflow for cost adjustments — Oracle Fusion Cost Management parity (L11)
                    </p>
                </div>
                <Button onClick={() => setCreateOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" /> New Adjustment
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="border-amber-200 bg-amber-50/50">
                    <CardContent className="p-4 flex items-center gap-3">
                        <Clock className="h-8 w-8 text-amber-500" />
                        <div>
                            <p className="text-2xl font-bold text-amber-700">{pending.length}</p>
                            <p className="text-xs text-amber-600">Pending Approval</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-emerald-200 bg-emerald-50/50">
                    <CardContent className="p-4 flex items-center gap-3">
                        <CheckCircle className="h-8 w-8 text-emerald-500" />
                        <div>
                            <p className="text-2xl font-bold text-emerald-700">{approved}</p>
                            <p className="text-xs text-emerald-600">Approved (Total)</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50/50">
                    <CardContent className="p-4 flex items-center gap-3">
                        <XCircle className="h-8 w-8 text-red-500" />
                        <div>
                            <p className="text-2xl font-bold text-red-700">{rejected}</p>
                            <p className="text-xs text-red-600">Rejected (Total)</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* SoD Policy Banner */}
            <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                <ShieldCheck className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-600" />
                <div>
                    <strong>Segregation of Duties Enforced.</strong> The person who submits a cost adjustment cannot approve it. Any self-approval attempt is blocked at the API layer (HTTP 403 Forbidden) and logged to the audit trail.
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="pending" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pending" className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Pending Queue
                        {pending.length > 0 && (
                            <Badge className="ml-1 bg-amber-500 text-white text-xs px-1.5 py-0 leading-tight">
                                {pending.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-1.5">
                        <History className="h-3.5 w-3.5" />
                        History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                    {loadingPending ? (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm py-8 justify-center">
                            <Clock className="h-4 w-4 animate-spin" /> Loading pending requests...
                        </div>
                    ) : pending.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                            <CheckCircle className="h-12 w-12 text-emerald-400" />
                            <p className="text-lg font-medium">No pending adjustments</p>
                            <p className="text-sm text-muted-foreground">All cost adjustments have been processed.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pending.map((req) => (
                                <ApprovalRow
                                    key={req.id}
                                    req={req}
                                    onApprove={(id, approverId) =>
                                        approveMutation.mutate({ requestId: id, approverId })
                                    }
                                    onReject={(id, reason) =>
                                        rejectMutation.mutate({ requestId: id, reason })
                                    }
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history">
                    {loadingHistory ? (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm py-8 justify-center">
                            <Clock className="h-4 w-4 animate-spin" /> Loading history...
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                            <AlertTriangle className="h-12 w-12 text-muted-foreground" />
                            <p className="text-lg font-medium">No history yet</p>
                            <p className="text-sm text-muted-foreground">Cost adjustment history will appear here once requests are processed.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((req) => (
                                <ApprovalRow key={req.id} req={req} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Create Dialog */}
            <CreateAdjustmentDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSubmit={(form) => createMutation.mutate(form)}
                isLoading={createMutation.isPending}
            />
        </div>
    );
}
