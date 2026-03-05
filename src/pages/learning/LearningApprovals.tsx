import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";


interface EnrollmentRequest {
    id: string;
    employeeName: string;
    courseTitle: string;
    requestedAt: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    justification?: string;
    reviewComments?: string;
}

export default function LearningApprovals() {
    const queryClient = useQueryClient();

    const { data: requests = [] } = useQuery<any>({
        queryKey: ["/api/learning/approvals/pending"],
    });

    const approveMutation = useMutation({
        mutationFn: async ({ requestId, comments }: { requestId: string; comments: string }) => {
            const res = await fetch(`/api/learning/approvals/${requestId}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ comments }),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/learning/approvals/pending"] });
        },
    });

    const rejectMutation = useMutation({
        mutationFn: async ({ requestId, comments }: { requestId: string; comments: string }) => {
            const res = await fetch(`/api/learning/approvals/${requestId}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ comments }),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/learning/approvals/pending"] });
        },
    });

    const pending = requests.filter((r: EnrollmentRequest) => r.status === "PENDING");
    const approved = requests.filter((r: EnrollmentRequest) => r.status === "APPROVED");
    const rejected = requests.filter((r: EnrollmentRequest) => r.status === "REJECTED");

    return (
        <StandardPage title="Learning Approvals">
            {/* Header */}
            <div>
                
                <p className="text-muted-foreground">
                    Review enrollment requests from your team
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Pending Requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-600">{pending.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Approved</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{approved.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Rejected</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">{rejected.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Approval Tabs */}
            <Tabs defaultValue="pending">
                <TabsList>
                    <TabsTrigger value="pending">
                        <Clock className="w-4 h-4 mr-2" />
                        Pending ({pending.length})
                    </TabsTrigger>
                    <TabsTrigger value="approved">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approved ({approved.length})
                    </TabsTrigger>
                    <TabsTrigger value="rejected">
                        <XCircle className="w-4 h-4 mr-2" />
                        Rejected ({rejected.length})
                    </TabsTrigger>
                </TabsList>

                {/* Pending */}
                <TabsContent value="pending" className="space-y-4">
                    {pending.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No pending requests</p>
                            </CardContent>
                        </Card>
                    ) : (
                        pending.map((request: EnrollmentRequest) => (
                            <Card key={request.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{request.employeeName}</CardTitle>
                                            <CardDescription>
                                                Requesting enrollment in: <strong>{request.courseTitle}</strong>
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline">Pending</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {request.justification && (
                                        <div className="p-3 border rounded-lg bg-muted/50">
                                            <p className="text-sm font-medium mb-1">Justification</p>
                                            <p className="text-sm text-muted-foreground">{request.justification}</p>
                                        </div>
                                    )}

                                    <p className="text-xs text-muted-foreground">
                                        Requested: {new Date(request.requestedAt).toLocaleString()}
                                    </p>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => approveMutation.mutate({ requestId: request.id, comments: "" })}
                                            disabled={approveMutation.isPending}
                                            className="flex-1"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Approve
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => rejectMutation.mutate({ requestId: request.id, comments: "" })}
                                            disabled={rejectMutation.isPending}
                                            className="flex-1"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Reject
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                {/* Approved */}
                <TabsContent value="approved" className="space-y-4">
                    {approved.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No approved requests</p>
                            </CardContent>
                        </Card>
                    ) : (
                        approved.map((request: EnrollmentRequest) => (
                            <Card key={request.id} className="border-green-200 bg-green-50/30">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{request.employeeName}</CardTitle>
                                            <CardDescription>{request.courseTitle}</CardDescription>
                                        </div>
                                        <Badge className="bg-green-600">Approved</Badge>
                                    </div>
                                </CardHeader>
                                {request.reviewComments && (
                                    <CardContent>
                                        <div className="p-3 border rounded-lg bg-white">
                                            <p className="text-sm font-medium mb-1">Review Comments</p>
                                            <p className="text-sm text-muted-foreground">{request.reviewComments}</p>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))
                    )}
                </TabsContent>

                {/* Rejected */}
                <TabsContent value="rejected" className="space-y-4">
                    {rejected.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <XCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No rejected requests</p>
                            </CardContent>
                        </Card>
                    ) : (
                        rejected.map((request: EnrollmentRequest) => (
                            <Card key={request.id} className="border-red-200 bg-red-50/30">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{request.employeeName}</CardTitle>
                                            <CardDescription>{request.courseTitle}</CardDescription>
                                        </div>
                                        <Badge variant="destructive">Rejected</Badge>
                                    </div>
                                </CardHeader>
                                {request.reviewComments && (
                                    <CardContent>
                                        <div className="p-3 border rounded-lg bg-white">
                                            <p className="text-sm font-medium mb-1">Rejection Reason</p>
                                            <p className="text-sm text-muted-foreground">{request.reviewComments}</p>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
