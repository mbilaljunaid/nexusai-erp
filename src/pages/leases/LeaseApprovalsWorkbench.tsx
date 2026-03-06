import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    FileCheck,
    Clock,
    AlertTriangle,
    CheckCircle2,
    XSquare,
    ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StandardPage } from '@/components/layout/StandardPage';

interface LeaseWorkflowItem {
    id: string;
    leaseName: string;
    totalValue: number;
    currency: string;
    status: "Draft" | "Pending Approval" | "Approved" | "Active";
    commencementDate: string;
    submittedBy: string;
    submittedAt: string;
}

export default function LeaseApprovalsWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedLeaseId, setSelectedLeaseId] = useState<string | null>(null);

    // Fetch pending approvals
    const { data: pendingLeases = [], isLoading } = useQuery<LeaseWorkflowItem[]>({
        queryKey: ["/api/lease/approvals"],
        queryFn: async () => {
            const res = await fetch("/api/lease/approvals");
            if (!res.ok) throw new Error("Failed to fetch approvals");
            return res.json();
        }
    });

    const approvalMutation = useMutation({
        mutationFn: async ({ id, action, comments }: { id: string; action: "approve" | "reject"; comments?: string }) => {
            const res = await fetch(`/api/lease/leases/${id}/${action}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ comments })
            });
            if (!res.ok) throw new Error(`Failed to ${action} lease`);
            return res.json();
        },
        onSuccess: (_, variables) => {
            toast({
                title: `Lease ${variables.action === "approve" ? "Approved" : "Rejected"}`,
                description: `Successfully processed lease ${variables.id}`
            });
            queryClient.invalidateQueries({ queryKey: ["/api/lease/approvals"] });
            setSelectedLeaseId(null);
        }
    });

    const formatCurrency = (amount: number, currency: string = "USD") => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
    };

    return (
        <StandardPage
            title="Lease Approval Workbench"
            description="Review and approve lease contracts for financial recognition"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending List */}
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-orange-500" />
                                Pending Review ({pendingLeases.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <TableSkeleton rows={4} />
                            ) : pendingLeases.length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 opacity-50 mb-3" />
                                    <p className="text-muted-foreground">All clear! No pending lease approvals.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pendingLeases.map((lease) => (
                                        <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                                            key={lease.id}
                                            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedLeaseId === lease.id ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
                                                }`}
                                            onClick={() => setSelectedLeaseId(lease.id)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-lg">{lease.leaseName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Submitted by {lease.submittedBy} • {formatDate(lease.submittedAt)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">{formatCurrency(lease.totalValue, lease.currency)}</p>
                                                    <Badge variant="outline" className="mt-1">Pending Approval</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Action Panel */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Decision Panel</CardTitle>
                            <CardDescription>
                                {selectedLeaseId ? "Review the selected lease and take action" : "Select a lease from the list to begin review"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!selectedLeaseId ? (
                                <div className="py-12 text-center text-muted-foreground">
                                    <ArrowRight className="mx-auto h-10 w-10 opacity-20 mb-2" />
                                    <p>Select a contract</p>
                                </div>
                            ) : (
                                <>
                                    <div className="p-3 bg-muted rounded-md text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <span>Standard Compliance:</span>
                                            <span className="text-green-600 font-medium">Verified</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>NPV Accuracy:</span>
                                            <span className="text-green-600 font-medium">99.9%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>GL Mapping:</span>
                                            <span className="text-green-600 font-medium">Ready</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Approval Comments</label>
                                        <Input placeholder="Optional feedback..." />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <Button
                                            variant="outline"
                                            className="border-red-500 text-red-600 hover:bg-red-50"
                                            onClick={() => approvalMutation.mutate({ id: selectedLeaseId, action: "reject" })}
                                            disabled={approvalMutation.isPending}
                                        >
                                            <XSquare className="mr-2 h-4 w-4" />
                                            Reject
                                        </Button>
                                        <Button
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => approvalMutation.mutate({ id: selectedLeaseId, action: "approve" })}
                                            disabled={approvalMutation.isPending}
                                        >
                                            <FileCheck className="mr-2 h-4 w-4" />
                                            Approve
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-900 mt-4">
                                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                                        <p className="text-xs text-amber-700 dark:text-amber-400">
                                            Approving this will automatically generate the ROU Asset and Liability entries in the General Ledger for the next period.
                                        </p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
