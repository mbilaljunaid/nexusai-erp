import { formatDate } from "@/lib/dateUtils";
import React, { useState } from "react";
import { PromptDialog } from "@/components/shared/PromptDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, CheckCircle, XCircle, DollarSign, Undo } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/PageHeader";
import { useEnterpriseStore } from "@/lib/enterpriseStore";

export default function CreditMemoWorkbench() {
    const { businessUnitId } = useEnterpriseStore();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [pendingRejectId, setPendingRejectId] = useState<string | null>(null);

    // Fetch credit memos
    const { data: creditMemosResult, isLoading } = useQuery<any>({
        queryKey: ["credit-memos", statusFilter, businessUnitId],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (statusFilter && statusFilter !== "all") {
                params.append("status", statusFilter);
            }
            if (businessUnitId) {
                params.append("businessUnitId", businessUnitId);
            }
            const res = await fetch(`/api/billing/credit-memos?${params}`, {
                headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined
            });
            if (!res.ok) throw new Error("Failed to fetch credit memos");
            return res.json();
        },
    });

    // Fetch invoices for credit memo creation
    const { data: invoices = [] } = useQuery<any>({
        queryKey: ["invoices", businessUnitId],
        queryFn: async () => {
            const res = await fetch("/api/ar/invoices?status=Issued", {
                headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined
            });
            return res.json();
        },
    });

    // Create credit memo mutation
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/billing/credit-memo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(businessUnitId ? { "x-business-unit-id": businessUnitId } : {})
                },
                body: JSON.stringify({ ...data, entBusinessUnitId: businessUnitId }),
            });
            if (!res.ok) throw new Error("Failed to create credit memo");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Credit memo created and pending approval" });
            queryClient.invalidateQueries({ queryKey: ["credit-memos"] });
            setCreateDialogOpen(false);
        },
    });

    // Approve mutation
    const approveMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/billing/credit-memos/${id}/approve`, {
                method: "POST",
                headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined
            });
            if (!res.ok) throw new Error("Failed to approve");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Approved", description: "Credit memo approved" });
            queryClient.invalidateQueries({ queryKey: ["credit-memos"] });
        },
    });

    // Reject mutation
    const rejectMutation = useMutation({
        mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
            const res = await fetch(`/api/billing/credit-memos/${id}/reject`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(businessUnitId ? { "x-business-unit-id": businessUnitId } : {})
                },
                body: JSON.stringify({ reason }),
            });
            if (!res.ok) throw new Error("Failed to reject");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Rejected", description: "Credit memo rejected" });
            queryClient.invalidateQueries({ queryKey: ["credit-memos"] });
        },
    });

    const creditMemos = creditMemosResult?.data || [];

    const metrics = {
        totalCreditMemos: creditMemos.length,
        pendingApproval: creditMemos.filter((cm: any) => cm.status === "Draft").length,
        totalCreditAmount: creditMemos.reduce((sum: number, cm: any) => sum + Math.abs(parseFloat(cm.amount || "0")), 0),
        appliedThisMonth: creditMemos.filter((cm: any) => cm.status === "Approved").length,
    };



    return (
        <>
            <div className="space-y-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/finance/billing">Billing</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Credit Memos</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <PageHeader
                    title="Credit Memo Workbench"
                    description="Create, review, approve, and apply credit memos with maker-checker controls"
                />

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Credit Memos</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.totalCreditMemos}</div>
                            <p className="text-xs text-muted-foreground">All time</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-amber-500/100/5 border-amber-500/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-600">Pending Approval</CardTitle>
                            <CheckCircle className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{metrics.pendingApproval}</div>
                            <p className="text-xs text-muted-foreground">Awaiting review</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-red-500/100/5 border-red-500/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-red-600">Total Credit Amount</CardTitle>
                            <DollarSign className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                ${metrics.totalCreditAmount.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">Lifetime credits</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-green-500/100/5 border-green-500/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-600">Applied This Month</CardTitle>
                            <Undo className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{metrics.appliedThisMonth}</div>
                            <p className="text-xs text-muted-foreground">Successfully applied</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Tabs */}
                <Tabs defaultValue="all" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="all">All Credit Memos</TabsTrigger>
                        <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                        <TabsTrigger value="create">Create New</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Credit Memos</CardTitle>
                                    <CardDescription>Review and manage all credit memos</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-44">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="Draft">Draft</SelectItem>
                                            <SelectItem value="Approved">Approved</SelectItem>
                                            <SelectItem value="Rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={() => setCreateDialogOpen(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        New Credit Memo
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <InteractiveSpreadsheet
                                    data={creditMemos}
                                    columns={[
                                        { id: "invoiceNumber", header: "CM Number", width: "150px", cell: (r: any) => <div className="p-2 font-medium">{r.invoiceNumber}</div> },
                                        { id: "sourceTransactionId", header: "Original Invoice", width: "150px", cell: (item: any) => <div className="p-2">{item.sourceTransactionId || "—"}</div> },
                                        { id: "amount", header: "Amount", width: "150px", cell: (item: any) => <div className="p-2 font-bold text-red-600">${Math.abs(parseFloat(item.amount || "0")).toLocaleString()}</div> },
                                        { id: "status", header: "Status", width: "150px", cell: (item: any) => <div className="p-2"><StatusBadge status={item.status} /></div> },
                                        { id: "description", header: "Reason", width: "250px", cell: (item: any) => <div className="p-2">{item.description}</div> },
                                        { id: "createdAt", header: "Date", width: "150px", cell: (item: any) => <div className="p-2">{item.createdAt ? formatDate(item.createdAt) : "—"}</div> },
                                        {
                                            id: "actions", header: "Actions", width: "150px", cell: (item: any) => (
                                                <div className="flex gap-2 p-2">
                                                    {item.status === "Draft" && (
                                                        <>
                                                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); approveMutation.mutate(item.id); }}>
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setPendingRejectId(item.id); setRejectDialogOpen(true); }}>
                                                                <XCircle className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            )
                                        }
                                    ]}
                                    onChange={() => { }}
                                    virtualized={true} containerHeight="400px"
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pending" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Approval Queue</CardTitle>
                                <CardDescription>Credit memos requiring manager approval</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <InteractiveSpreadsheet
                                    data={creditMemos.filter((cm: any) => cm.status === "Draft")}
                                    columns={[
                                        { id: "invoiceNumber", header: "CM Number", width: "150px", cell: (r: any) => <div className="p-2 font-medium">{r.invoiceNumber}</div> },
                                        { id: "sourceTransactionId", header: "Original Invoice", width: "150px", cell: (item: any) => <div className="p-2">{item.sourceTransactionId || "—"}</div> },
                                        { id: "amount", header: "Amount", width: "150px", cell: (item: any) => <div className="p-2 font-bold text-red-600">${Math.abs(parseFloat(item.amount || "0")).toLocaleString()}</div> },
                                        { id: "description", header: "Reason", width: "250px", cell: (item: any) => <div className="p-2">{item.description}</div> },
                                        { id: "createdAt", header: "Date", width: "150px", cell: (item: any) => <div className="p-2">{item.createdAt ? formatDate(item.createdAt) : "—"}</div> },
                                        {
                                            id: "actions", header: "Actions", width: "200px", cell: (item: any) => (
                                                <div className="flex gap-2 p-2">
                                                    <Button variant="default" size="sm" onClick={(e) => { e.stopPropagation(); approveMutation.mutate(item.id); }}>
                                                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setPendingRejectId(item.id); setRejectDialogOpen(true); }}>
                                                        <XCircle className="h-4 w-4 mr-1" /> Reject
                                                    </Button>
                                                </div>
                                            )
                                        }
                                    ]}
                                    onChange={() => { }}
                                    virtualized={true} containerHeight="400px"
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="create" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Create Credit Memo</CardTitle>
                                <CardDescription>Issue a credit against an existing invoice</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CreateCreditMemoForm
                                    invoices={invoices}
                                    onSubmit={(data) => createMutation.mutate(data)}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <PromptDialog
                open={rejectDialogOpen}
                title="Reject Credit Memo"
                description="Please provide a reason for rejecting this credit memo."
                label="Rejection Reason"
                placeholder="Enter reason..."
                confirmLabel="Reject"
                onConfirm={(reason) => {
                    setRejectDialogOpen(false);
                    if (pendingRejectId) rejectMutation.mutate({ id: pendingRejectId, reason });
                    setPendingRejectId(null);
                }}
                onCancel={() => { setRejectDialogOpen(false); setPendingRejectId(null); }}
            />
        </>
    );
}

function CreateCreditMemoForm({ invoices, onSubmit }: { invoices: any[]; onSubmit: (data: any) => void }) {
    const [formData, setFormData] = useState({
        invoiceId: "",
        amount: "",
        reason: "",
    });

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Original Invoice</Label>
                <Select value={formData.invoiceId} onValueChange={(value) => setFormData({ ...formData, invoiceId: value })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select invoice to credit" />
                    </SelectTrigger>
                    <SelectContent>
                        {invoices.map((inv: any) => (
                            <SelectItem key={inv.id} value={inv.id}>
                                {inv.invoiceNumber} - ${inv.amount} ({inv.customerId})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Credit Amount</Label>
                <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                    placeholder="Describe the reason for this credit (e.g., service issue, billing error, goodwill gesture)"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={4}
                />
            </div>

            <Button
                onClick={() => onSubmit(formData)}
                disabled={!formData.invoiceId || !formData.amount || !formData.reason}
                className="w-full"
            >
                <Plus className="mr-2 h-4 w-4" />
                Create Credit Memo (Pending Approval)
            </Button>
        </div>
    );
}
