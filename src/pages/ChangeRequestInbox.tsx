import { formatDate } from "@/lib/dateUtils";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Check, X, FileDiff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function ChangeRequestInbox() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);

    // Fetch Pending Requests
    const { data: requests = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/mdm/change-requests/pending"],
    });

    // Action Mutation
    const actionMutation = useMutation({
        mutationFn: async ({ id, status, reason }: { id: string, status: string, reason?: string }) => {
            const res = await fetch(`/api/mdm/change-requests/${id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, reason }),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/mdm/change-requests/pending"] });
            setSelectedRequest(null);
            setActionType(null);
            setRejectReason("");
            toast({ title: "Success", description: "Request updated successfully." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const handleAction = () => {
        if (actionType === "REJECT" && !rejectReason) {
            toast({ title: "Validation Warning", description: "Please provide a reason for rejection.", variant: "destructive" });
            return;
        }

        const status = actionType === "APPROVE" ? "APPROVED" : "REJECTED";
        actionMutation.mutate({ id: selectedRequest.id, status, reason: rejectReason });
    };

    const columns = [
        {
            id: "requestType",
            header: "Type",
            width: "150px",
            cell: (row: any) => (
                <Badge variant="outline">{row.requestType}</Badge>
            )
        },
        { id: "entityType", width: "200px", header: "Entity Type", cell: (row: any) => <div className="px-2 h-full flex items-center font-medium">{row.entityType}</div> },
        { id: "requesterId", width: "200px", header: "Requested By", cell: (row: any) => <div className="px-2 h-full flex items-center text-muted-foreground">{row.requesterId}</div> },
        { id: "createdAt", width: "150px", header: "Date", cell: (row: any) => <div className="px-2 h-full flex items-center text-muted-foreground">{formatDate(row.createdAt)}</div> },
        {
            id: "actions",
            header: "Actions",
            width: "300px",
            cell: (row: any) => (
                <div className="flex gap-2 items-center h-full px-2">
                    <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => { setSelectedRequest(row); setActionType("APPROVE"); }}>
                        <Check className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => { setSelectedRequest(row); setActionType("REJECT"); }}>
                        <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setSelectedRequest(row); setActionType(null); /* Just View */ }}>
                        <FileDiff className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <StandardPage
            title="Change Request Inbox"
            description="Review and approve proposed changes to Master Data."
            breadcrumbs={[{ label: "MDM", href: "/mdm/governance" }, { label: "Change Requests" }]}
        >
            <div className="bg-card w-full rounded-md border shadow-sm">
                <InteractiveSpreadsheet
                    data={requests}
                    columns={columns}
                    onChange={() => { }}
                    virtualized={true}
                    containerHeight="600px"
                />
            </div>

            {/* Action Dialog */}
            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === "APPROVE" ? "Approve Request" : actionType === "REJECT" ? "Reject Request" : "Request Details"}
                        </DialogTitle>
                        <DialogDescription>
                            Review the proposed changes below.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-4 my-4">
                            <div className="bg-muted p-4 rounded-md font-mono text-xs overflow-auto max-h-[200px]">
                                {JSON.stringify(selectedRequest.proposedChanges, null, 2)}
                            </div>

                            {actionType === "REJECT" && (
                                <div>
                                    <label className="text-sm font-medium">Rejection Reason</label>
                                    <Textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Why is this being rejected?"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedRequest(null)}>Cancel</Button>
                        {actionType && (
                            <Button
                                variant={actionType === "APPROVE" ? "default" : "destructive"}
                                onClick={handleAction}
                                disabled={actionMutation.isPending}
                            >
                                {actionType === "APPROVE" ? "Confirm Approval" : "Confirm Rejection"}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
