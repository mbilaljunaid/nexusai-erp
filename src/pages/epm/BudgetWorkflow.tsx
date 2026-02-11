import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, CheckCircle, XCircle, Clock, MessageSquare, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BudgetSubmission {
    id: string;
    budgetName: string;
    version: string;
    submittedBy: string;
    submittedAt: string;
    currentApprover?: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "IN_REVIEW";
    amount: number;
    department: string;
}

interface WorkflowComment {
    id: string;
    userId: string;
    userName: string;
    comment: string;
    timestamp: string;
    action: "SUBMIT" | "APPROVE" | "REJECT" | "COMMENT";
}

export default function BudgetWorkflow() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedSubmission, setSelectedSubmission] = useState<BudgetSubmission | null>(null);
    const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);
    const [actionComments, setActionComments] = useState("");

    // Fetch all submissions
    const { data: submissions = [] } = useQuery<BudgetSubmission[]>({
        queryKey: ["budget-workflow"],
        queryFn: async () => {
            const res = await fetch("/api/epm/workflow/submissions");
            return res.json();
        }
    });

    // Fetch workflow history for selected submission
    const { data: workflowHistory = [] } = useQuery<WorkflowComment[]>({
        queryKey: ["workflow-history", selectedSubmission?.id],
        queryFn: async () => {
            if (!selectedSubmission) return [];
            const res = await fetch(`/api/epm/workflow/submissions/${selectedSubmission.id}/history`);
            return res.json();
        },
        enabled: !!selectedSubmission
    });

    // Submit for approval mutation
    const submitMutation = useMutation({
        mutationFn: async (budgetId: string) => {
            const res = await fetch(`/api/epm/workflow/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ budgetId })
            });
            if (!res.ok) throw new Error("Failed to submit");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budget-workflow"] });
            toast({
                title: "Budget Submitted",
                description: "Budget submitted for approval"
            });
        }
    });

    // Approve/Reject mutation
    const actionMutation = useMutation({
        mutationFn: async ({ submissionId, action, comments }: { submissionId: string; action: string; comments: string }) => {
            const res = await fetch(`/api/epm/workflow/submissions/${submissionId}/${action.toLowerCase()}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ comments })
            });
            if (!res.ok) throw new Error(`Failed to ${action}`);
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["budget-workflow"] });
            setIsActionDialogOpen(false);
            setActionComments("");
            setActionType(null);
            toast({
                title: `Budget ${variables.action === "APPROVE" ? "Approved" : "Rejected"}`,
                description: `Budget has been ${variables.action.toLowerCase()}d successfully`
            });
        }
    });

    const pendingCount = submissions.filter(s => s.status === "PENDING").length;
    const approvedCount = submissions.filter(s => s.status === "APPROVED").length;
    const rejectedCount = submissions.filter(s => s.status === "REJECTED").length;

    const handleAction = (type: "APPROVE" | "REJECT") => {
        setActionType(type);
        setIsActionDialogOpen(true);
    };

    return (
        <StandardPage
            title="Budget Workflow"
            description="Collaborative budgeting with maker-checker controls"
            breadcrumbs={[
                { label: "EPM", href: "/epm" },
                { label: "Workflow" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-amber-50 border-amber-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Pending Approval
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">{pendingCount}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Approved
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">{approvedCount}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50 border-red-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-red-800 uppercase flex items-center gap-1">
                                <XCircle className="h-3 w-3" />
                                Rejected
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-900">{rejectedCount}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Total Submissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900">{submissions.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Submissions Table */}
                <Card className="border-t-4 border-t-purple-500">
                    <CardHeader>
                        <CardTitle>Budget Submissions</CardTitle>
                        <CardDescription>Track and manage budget approval workflow</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="pending">
                            <TabsList>
                                <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
                                <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
                                <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
                                <TabsTrigger value="all">All ({submissions.length})</TabsTrigger>
                            </TabsList>

                            <TabsContent value="pending" className="mt-4">
                                <SubmissionsTable
                                    submissions={submissions.filter(s => s.status === "PENDING")}
                                    onViewDetails={setSelectedSubmission}
                                    onAction={handleAction}
                                />
                            </TabsContent>

                            <TabsContent value="approved" className="mt-4">
                                <SubmissionsTable
                                    submissions={submissions.filter(s => s.status === "APPROVED")}
                                    onViewDetails={setSelectedSubmission}
                                />
                            </TabsContent>

                            <TabsContent value="rejected" className="mt-4">
                                <SubmissionsTable
                                    submissions={submissions.filter(s => s.status === "REJECTED")}
                                    onViewDetails={setSelectedSubmission}
                                />
                            </TabsContent>

                            <TabsContent value="all" className="mt-4">
                                <SubmissionsTable
                                    submissions={submissions}
                                    onViewDetails={setSelectedSubmission}
                                    onAction={handleAction}
                                />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Workflow History */}
                {selectedSubmission && (
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5" />
                                Workflow History - {selectedSubmission.budgetName}
                            </CardTitle>
                            <CardDescription>Version {selectedSubmission.version}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {workflowHistory.map((item) => (
                                <div key={item.id} className="flex gap-4 border-b pb-4 last:border-b-0">
                                    <div className={`p-2 rounded-full h-10 w-10 flex items-center justify-center ${item.action === "APPROVE" ? "bg-green-100" :
                                            item.action === "REJECT" ? "bg-red-100" :
                                                item.action === "SUBMIT" ? "bg-blue-100" : "bg-gray-100"
                                        }`}>
                                        {item.action === "APPROVE" && <CheckCircle className="h-5 w-5 text-green-600" />}
                                        {item.action === "REJECT" && <XCircle className="h-5 w-5 text-red-600" />}
                                        {item.action === "SUBMIT" && <Send className="h-5 w-5 text-blue-600" />}
                                        {item.action === "COMMENT" && <MessageSquare className="h-5 w-5 text-gray-600" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{item.userName}</span>
                                            <Badge variant="outline">{item.action}</Badge>
                                            <span className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</span>
                                        </div>
                                        {item.comment && (
                                            <p className="mt-1 text-sm text-muted-foreground">{item.comment}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Action Dialog */}
                <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{actionType === "APPROVE" ? "Approve" : "Reject"} Budget</DialogTitle>
                            <DialogDescription>{selectedSubmission?.budgetName}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Comments</label>
                                <Textarea
                                    placeholder="Add your comments..."
                                    value={actionComments}
                                    onChange={(e) => setActionComments(e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>Cancel</Button>
                            <Button
                                onClick={() => {
                                    if (selectedSubmission && actionType) {
                                        actionMutation.mutate({
                                            submissionId: selectedSubmission.id,
                                            action: actionType,
                                            comments: actionComments
                                        });
                                    }
                                }}
                                variant={actionType === "REJECT" ? "destructive" : "default"}
                            >
                                {actionType === "APPROVE" ? "Approve" : "Reject"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </StandardPage>
    );
}

function SubmissionsTable({
    submissions,
    onViewDetails,
    onAction
}: {
    submissions: BudgetSubmission[];
    onViewDetails: (submission: BudgetSubmission) => void;
    onAction?: (type: "APPROVE" | "REJECT") => void;
}) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Budget Name</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {submissions.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            No submissions found
                        </TableCell>
                    </TableRow>
                ) : (
                    submissions.map((submission) => (
                        <TableRow key={submission.id}>
                            <TableCell className="font-medium">{submission.budgetName}</TableCell>
                            <TableCell><code className="text-xs">v{submission.version}</code></TableCell>
                            <TableCell>{submission.department}</TableCell>
                            <TableCell className="text-right font-mono">${submission.amount.toLocaleString()}</TableCell>
                            <TableCell>{submission.submittedBy}</TableCell>
                            <TableCell>{new Date(submission.submittedAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                                {submission.status === "PENDING" && <Badge className="bg-amber-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>}
                                {submission.status === "APPROVED" && <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>}
                                {submission.status === "REJECTED" && <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>}
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => onViewDetails(submission)}>
                                        <History className="h-3 w-3 mr-1" />
                                        History
                                    </Button>
                                    {submission.status === "PENDING" && onAction && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => { onViewDetails(submission); onAction("APPROVE"); }}
                                            >
                                                <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                                                Approve
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => { onViewDetails(submission); onAction("REJECT"); }}
                                            >
                                                <XCircle className="h-3 w-3 mr-1 text-red-600" />
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}
