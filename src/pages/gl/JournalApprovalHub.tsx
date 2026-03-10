import { formatDate } from "@/lib/dateUtils";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Search, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from '@/lib/formatters';

export default function JournalApprovalHub() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [actionDialog, setActionDialog] = useState<{
        isOpen: boolean;
        type: 'approve' | 'reject';
        journalId: string;
    }>({ isOpen: false, type: 'approve', journalId: '' });
    const [comments, setComments] = useState("");

    // Fetch Pending Approvals
    const { data: pendingApprovals, isLoading } = useQuery<any>({
        queryKey: ["journal-approvals"],
        queryFn: async () => {
            const res = await fetch("/api/gl/approvals/pending");
            if (!res.ok) throw new Error("Failed to fetch approvals");
            return res.json();
        }
    });

    // ACTION MUTATION
    const actionMutation = useMutation({
        mutationFn: async () => {
            const endpoint = actionDialog.type === 'approve'
                ? `/api/gl/journals/${actionDialog.journalId}/approve`
                : `/api/gl/journals/${actionDialog.journalId}/reject`;

            const res = await apiRequest("POST", endpoint, { comments });
            return await res.json();
        },
        onSuccess: (data) => {
            toast({
                title: actionDialog.type === 'approve' ? "Approved" : "Rejected",
                description: `Journal ${actionDialog.type === 'approve' ? 'approved' : 'rejected'} successfully.`,
                className: actionDialog.type === 'approve' ? "bg-green-600 text-white" : "bg-red-600 text-white"
            });
            setActionDialog({ ...actionDialog, isOpen: false });
            setComments("");
            queryClient.invalidateQueries({ queryKey: ["journal-approvals"] });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const openAction = (type: 'approve' | 'reject', journalId: string) => {
        setComments("");
        setActionDialog({ isOpen: true, type, journalId });
    };

    return (
        <StandardPage
            title="Journal Approvals"
            description="Review and approve pending journal entries."
            breadcrumbs={[
                { label: "General Ledger", href: "/finance/gl/journals" },
                { label: "Approvals" }
            ]}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-orange-500/10 border-orange-100">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-orange-800">Pending My Action</p>
                                <h3 className="text-2xl font-bold text-orange-900 dark:text-orange-200">{pendingApprovals?.length || 0}</h3>
                            </div>
                            <Clock className="h-8 w-8 text-orange-300" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Journal</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Requester</TableHead>
                            <TableHead>Date Submitted</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading approvals...</TableCell>
                            </TableRow>
                        ) : pendingApprovals?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No pending approvals found.</TableCell>
                            </TableRow>
                        ) : (
                            pendingApprovals?.map((item: any) => (
                                <TableRow key={item.approvalId}>
                                    <TableCell className="font-medium text-primary cursor-pointer hover:underline">
                                        {item.journalNumber}
                                    </TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-right font-mono">
                                        {formatCurrency(Number(item.amount))}
                                    </TableCell>
                                    <TableCell>{item.requester || "Unknown"}</TableCell>
                                    <TableCell>{formatDate(item.submittedDate)}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-500/10"
                                            onClick={() => openAction('reject', item.journalId)}>
                                            <XCircle className="h-4 w-4 mr-1" /> Reject
                                        </Button>
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => openAction('approve', item.journalId)}>
                                            <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Approve/Reject Dialog */}
            <Dialog open={actionDialog.isOpen} onOpenChange={(open) => !open && setActionDialog({ ...actionDialog, isOpen: false })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{actionDialog.type === 'approve' ? 'Approve Journal' : 'Reject Journal'}</DialogTitle>
                        <DialogDescription>
                            {actionDialog.type === 'approve'
                                ? "Are you sure you want to approve this journal? It will be posted automatically."
                                : "Please provide a reason for rejection."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder={actionDialog.type === 'reject' ? "Reason for rejection (required)..." : "Optional comments..."}
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionDialog({ ...actionDialog, isOpen: false })}>Cancel</Button>
                        <Button
                            variant={actionDialog.type === 'approve' ? 'default' : 'destructive'}
                            onClick={() => actionMutation.mutate()}
                            disabled={actionMutation.isPending || (actionDialog.type === 'reject' && !comments.trim())}
                        >
                            {actionMutation.isPending ? "Processing..." : (actionDialog.type === 'approve' ? "Confirm Approve" : "Confirm Reject")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
