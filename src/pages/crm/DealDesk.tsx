import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, AlertCircle, User, DollarSign, Percent } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface ApprovalRequest {
    id: string;
    quoteId: string;
    quoteName: string;
    customerName: string;
    amount: number;
    requestedDiscount: number;
    reason: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    requestedBy: string;
    requestedAt: string;
    approvalChain: {
        role: string;
        approver: string;
        status: "PENDING" | "APPROVED" | "REJECTED";
        timestamp?: string;
    }[];
    slaRemaining: number; // hours
}

export default function DealDesk() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    // Fetch approval queue
    const { data: approvalQueue = [] } = useQuery<ApprovalRequest[]>({
        queryKey: ["deal-desk-queue"],
        queryFn: async () => {
            const res = await fetch("/api/crm/deal-desk/queue");
            return res.json();
        }
    });

    // Approve mutation
    const approveMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/crm/quotes/${id}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            if (!res.ok) throw new Error("Failed to approve");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["deal-desk-queue"] });
            toast({
                title: "Approved",
                description: "Quote discount approved successfully"
            });
            setSelectedRequest(null);
        }
    });

    // Reject mutation
    const rejectMutation = useMutation({
        mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
            const res = await fetch(`/api/crm/quotes/${id}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason })
            });
            if (!res.ok) throw new Error("Failed to reject");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["deal-desk-queue"] });
            toast({
                title: "Rejected",
                description: "Quote discount request rejected",
                variant: "destructive"
            });
            setSelectedRequest(null);
            setRejectionReason("");
        }
    });

    const pendingRequests = approvalQueue.filter(r => r.status === "PENDING");
    const approvedRequests = approvalQueue.filter(r => r.status === "APPROVED");
    const rejectedRequests = approvalQueue.filter(r => r.status === "REJECTED");



    const getSLAColor = (hours: number) => {
        if (hours <= 4) return "text-red-700";
        if (hours <= 12) return "text-amber-700";
        return "text-green-700";
    };

    return (
        <StandardPage
            title="Deal Desk"
            description="Pricing approval workflow for non-standard deals"
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Deal Desk" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-amber-500/10 border-amber-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Pending Approvals
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">{pendingRequests.length}</div>
                            <div className="text-xs text-amber-700">
                                ${pendingRequests.reduce((sum, r) => sum + r.amount, 0).toLocaleString()} total value
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Approved (30 days)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900 dark:text-green-200">{approvedRequests.length}</div>
                            <div className="text-xs text-green-700">
                                Avg approval time: 2.3 hours
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-500/10 border-red-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-red-800 uppercase flex items-center gap-1">
                                <XCircle className="h-3 w-3" />
                                Rejected (30 days)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-900 dark:text-red-200">{rejectedRequests.length}</div>
                            <div className="text-xs text-red-700">
                                {rejectedRequests.length > 0 ? ((rejectedRequests.length / approvalQueue.length) * 100).toFixed(0) : 0}% rejection rate
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
                        <TabsTrigger value="approved">Approved ({approvedRequests.length})</TabsTrigger>
                        <TabsTrigger value="rejected">Rejected ({rejectedRequests.length})</TabsTrigger>
                    </TabsList>

                    {/* Pending Tab */}
                    <TabsContent value="pending">
                        <Card>
                            <CardHeader>
                                <CardTitle>Approval Queue</CardTitle>
                                <CardDescription>Discount requests awaiting approval</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Quote</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="text-right">Discount</TableHead>
                                            <TableHead>Requested By</TableHead>
                                            <TableHead>SLA</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingRequests.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                                    No pending approvals
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            pendingRequests.map((request) => (
                                                <TableRow key={request.id}>
                                                    <TableCell className="font-medium">{request.quoteName}</TableCell>
                                                    <TableCell>{request.customerName}</TableCell>
                                                    <TableCell className="text-right font-mono">${request.amount.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant="outline" className="font-mono">
                                                            {request.requestedDiscount}%
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <User className="h-3 w-3" />
                                                            {request.requestedBy}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className={cn(`flex items-center gap-1 text-sm font-semibold ${getSLAColor(request.slaRemaining)}`)}>
                                                            <Clock className="h-3 w-3" />
                                                            {request.slaRemaining}h
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button size="sm" onClick={() => setSelectedRequest(request)}>
                                                            Review
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Approved Tab */}
                    <TabsContent value="approved">
                        <Card>
                            <CardHeader>
                                <CardTitle>Approved Requests</CardTitle>
                                <CardDescription>Recently approved discount requests</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Quote</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="text-right">Discount</TableHead>
                                            <TableHead>Approved At</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {approvedRequests.map((request) => (
                                            <TableRow key={request.id}>
                                                <TableCell className="font-medium">{request.quoteName}</TableCell>
                                                <TableCell>{request.customerName}</TableCell>
                                                <TableCell className="text-right font-mono">${request.amount.toLocaleString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <StatusBadge status="active" label={`${request.requestedDiscount}%`} />
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatDate(request.requestedAt)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Rejected Tab */}
                    <TabsContent value="rejected">
                        <Card>
                            <CardHeader>
                                <CardTitle>Rejected Requests</CardTitle>
                                <CardDescription>Declined discount requests</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Quote</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="text-right">Discount</TableHead>
                                            <TableHead>Rejected At</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rejectedRequests.map((request) => (
                                            <TableRow key={request.id}>
                                                <TableCell className="font-medium">{request.quoteName}</TableCell>
                                                <TableCell>{request.customerName}</TableCell>
                                                <TableCell className="text-right font-mono">${request.amount.toLocaleString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant="outline" className="text-red-700 border-red-700">{request.requestedDiscount}%</Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatDate(request.requestedAt)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Review Dialog */}
                {selectedRequest && (
                    <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Discount Approval Request</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                                {/* Request Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Quote Name</label>
                                        <div className="text-sm text-muted-foreground">{selectedRequest.quoteName}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Customer</label>
                                        <div className="text-sm text-muted-foreground">{selectedRequest.customerName}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Quote Amount</label>
                                        <div className="text-sm font-bold">${selectedRequest.amount.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Requested Discount</label>
                                        <div className="text-sm font-bold text-amber-700">{selectedRequest.requestedDiscount}%</div>
                                    </div>
                                </div>

                                {/* Justification */}
                                <Card className="border-l-4 border-l-amber-500">
                                    <CardHeader>
                                        <CardTitle className="text-sm">Justification</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{selectedRequest.reason}</p>
                                    </CardContent>
                                </Card>

                                {/* Approval Chain */}
                                <Card className="border-l-4 border-l-blue-500">
                                    <CardHeader>
                                        <CardTitle className="text-sm">Approval Chain</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {selectedRequest.approvalChain.map((step, index) => (
                                                <div key={index} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(`w-8 h-8 rounded-full flex items-center justify-center ${step.status === "APPROVED" ? "bg-green-100" :
                                                            step.status === "REJECTED" ? "bg-red-100" :
                                                                "bg-amber-100"
                                                            }`)}>
                                                            {step.status === "APPROVED" ? <CheckCircle className="h-4 w-4 text-green-700" /> :
                                                                step.status === "REJECTED" ? <XCircle className="h-4 w-4 text-red-700" /> :
                                                                    <Clock className="h-4 w-4 text-amber-700" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-sm">{step.role}</div>
                                                            <div className="text-xs text-muted-foreground">{step.approver}</div>
                                                        </div>
                                                    </div>
                                                    <StatusBadge status={step.status} />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Rejection Reason (if rejecting) */}
                                {selectedRequest.status === "PENDING" && (
                                    <div className="space-y-2">
                                        <Label>Rejection Reason (optional)</Label>
                                        <Textarea
                                            placeholder="Provide a reason for rejection..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-3">
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={() => approveMutation.mutate(selectedRequest.id)}
                                        disabled={selectedRequest.status !== "PENDING"}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => rejectMutation.mutate({
                                            id: selectedRequest.id,
                                            reason: rejectionReason || "Discount exceeds policy limits"
                                        })}
                                        disabled={selectedRequest.status !== "PENDING"}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </StandardPage>
    );
}
