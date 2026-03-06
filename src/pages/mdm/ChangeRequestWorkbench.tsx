import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/dateUtils";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, FileEdit } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";


interface ChangeRequest {
    id: string;
    entityType: "PARTY" | "ITEM";
    entityId: string;
    changeType: "CREATE" | "UPDATE" | "DELETE";
    proposedChanges: Record<string, any>;
    currentValues?: Record<string, any>;
    status: "PENDING" | "APPROVED" | "REJECTED";
    requestedBy: string;
    requestedAt: string;
    reviewedBy?: string;
    reviewedAt?: string;
    comments?: string;
}

export default function ChangeRequestWorkbench() {
    const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
    const [reviewComments, setReviewComments] = useState("");
    const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");

    const queryClient = useQueryClient();

    // Fetch pending requests
    const { data: requests = [] } = useQuery<any>({
        queryKey: ["/api/mdm/change-requests/pending"],
    });

    // Approve/Reject mutation
    const reviewMutation = useMutation({
        mutationFn: async ({ requestId, status }: { requestId: string; status: "APPROVED" | "REJECTED" }) => {
            const res = await fetch(`/api/mdm/change-requests/${requestId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, comments: reviewComments }),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/mdm/change-requests/pending"] });
            setSelectedRequest(null);
            setReviewComments("");
        },
    });

    const filteredRequests = requests.filter((r: ChangeRequest) => r.status === activeTab);

    return (
        <StandardPage title="Change Request Workbench">
            {/* Header */}
            <div>
                
                <p className="text-muted-foreground">
                    Review and approve master data changes
                </p>
            </div>

            {/* Status Tabs */}
            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
                <TabsList>
                    <TabsTrigger value="PENDING">
                        <Clock className="w-4 h-4 mr-2" />
                        Pending
                    </TabsTrigger>
                    <TabsTrigger value="APPROVED">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approved
                    </TabsTrigger>
                    <TabsTrigger value="REJECTED">
                        <XCircle className="w-4 h-4 mr-2" />
                        Rejected
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4">
                    {filteredRequests.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <FileEdit className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No {activeTab.toLowerCase()} requests</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Requests List */}
                            <div className="space-y-3">
                                {filteredRequests.map((request: ChangeRequest) => (
                                    <Card
                                        key={request.id}
                                        className={cn(`cursor-pointer transition-all ${selectedRequest?.id === request.id
                                                ? "border-primary ring-2 ring-primary"
                                                : "hover:border-primary/50"
                                            }`)}
                                        onClick={() => setSelectedRequest(request)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-base">
                                                        {request.changeType} {request.entityType}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs">
                                                        Requested by {request.requestedBy}
                                                    </CardDescription>
                                                </div>
                                                <Badge
                                                    variant={
                                                        request.status === "PENDING"
                                                            ? "outline"
                                                            : request.status === "APPROVED"
                                                                ? "default"
                                                                : "destructive"
                                                    }
                                                >
                                                    {request.status}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDateTime(request.requestedAt)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Request Detail */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Request Details</CardTitle>
                                    <CardDescription>
                                        {selectedRequest
                                            ? `Review changes for ${selectedRequest.entityType} ${selectedRequest.entityId}`
                                            : "Select a request to view details"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {!selectedRequest ? (
                                        <p className="text-center py-12 text-muted-foreground">
                                            No request selected
                                        </p>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Before/After Comparison */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="text-sm font-semibold mb-2">Current Values</h4>
                                                    <div className="p-3 border rounded-lg bg-muted/50 text-sm space-y-1">
                                                        {selectedRequest.currentValues ? (
                                                            Object.entries(selectedRequest.currentValues).map(([key, value]) => (
                                                                <div key={key}>
                                                                    <span className="font-medium">{key}:</span>{" "}
                                                                    <span className="text-muted-foreground">{String(value)}</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-muted-foreground italic">New record</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-semibold mb-2">Proposed Changes</h4>
                                                    <div className="p-3 border rounded-lg bg-primary/5 text-sm space-y-1">
                                                        {Object.entries(selectedRequest.proposedChanges).map(([key, value]) => (
                                                            <div key={key}>
                                                                <span className="font-medium">{key}:</span>{" "}
                                                                <span className="text-primary font-semibold">{String(value)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Comments */}
                                            {selectedRequest.status === "PENDING" && (
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        Review Comments
                                                    </label>
                                                    <Textarea
                                                        value={reviewComments}
                                                        onChange={(e) => setReviewComments(e.target.value)}
                                                        placeholder="Add comments about this change request..."
                                                        rows={3}
                                                    />
                                                </div>
                                            )}

                                            {/* Review Comments (if reviewed) */}
                                            {selectedRequest.comments && (
                                                <div className="p-3 border rounded-lg bg-muted/50">
                                                    <p className="text-sm font-medium mb-1">Review Comments</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {selectedRequest.comments}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        Reviewed by {selectedRequest.reviewedBy} on{" "}
                                                        {selectedRequest.reviewedAt &&
                                                            formatDateTime(selectedRequest.reviewedAt)}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            {selectedRequest.status === "PENDING" && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() =>
                                                            reviewMutation.mutate({
                                                                requestId: selectedRequest.id,
                                                                status: "APPROVED",
                                                            })
                                                        }
                                                        disabled={reviewMutation.isPending}
                                                        className="flex-1"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() =>
                                                            reviewMutation.mutate({
                                                                requestId: selectedRequest.id,
                                                                status: "REJECTED",
                                                            })
                                                        }
                                                        disabled={reviewMutation.isPending}
                                                        className="flex-1"
                                                    >
                                                        <XCircle className="w-4 h-4 mr-2" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
