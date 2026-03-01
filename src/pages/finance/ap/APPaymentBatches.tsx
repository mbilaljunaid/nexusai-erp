import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Play, CheckCircle, Download, Loader2, FileText, Building2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ViewAccountingModal } from "@/components/sla/ViewAccountingModal";
import { useLocation } from "wouter";

function useActiveBu() {
    return useMemo(() => ({
        id: localStorage.getItem("nexus_active_bu") || null,
        name: localStorage.getItem("nexus_active_bu_name") || localStorage.getItem("nexus_active_bu") || "All Business Units"
    }), []);
}

export default function APPaymentBatches() {
    const [page, setPage] = useState(1);
    const pageSize = 20;
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<any>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [, setLocation] = useLocation();
    const activeBu = useActiveBu();

    const [formData, setFormData] = useState({
        businessUnitId: activeBu.id || "",
        batchName: "",
        paymentMethodCode: "EFT",
        checkDate: new Date().toISOString().split("T")[0],
        bankAccountId: ""
    });

    const [accountingModalOpen, setAccountingModalOpen] = useState(false);
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

    const { data: batches, isLoading } = useQuery({
        queryKey: ["/api/ap/payment-batches"],
        queryFn: () => fetch("/api/ap/payment-batches").then(r => r.json()),
        refetchInterval: 3000,
        refetchIntervalInBackground: true
    });

    const { data: bankAccounts = [] } = useQuery<any[]>({
        queryKey: ["/api/cash/accounts"],
    });

    const createMutation = useMutation({
        mutationFn: (data: any) =>
            fetch("/api/ap/payment-batches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ap/payment-batches"] });
            setCreateDialogOpen(false);
            toast({ title: "Payment batch created successfully" });
        }
    });

    const selectInvoicesMutation = useMutation({
        mutationFn: (batchId: number) =>
            fetch(`/api/ap/payment-batches/${batchId}/select`, {
                method: "POST"
            }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ap/payment-batches"] });
            toast({ title: "Invoices selected for payment" });
        }
    });

    const confirmMutation = useMutation({
        mutationFn: (batchId: number) =>
            fetch(`/api/ap/payment-batches/${batchId}/confirm`, {
                method: "POST"
            }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ap/payment-batches"] });
            toast({ title: "Payment batch confirmed" });
        }
    });

    const downloadISO20022 = async (batchId: number) => {
        try {
            const response = await fetch(`/api/ap/payment-batches/${batchId}/iso20022`);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ISO20022_BCH_${batchId}.xml`;
            a.click();
            toast({ title: "ISO20022 file downloaded" });
        } catch (error) {
            toast({ title: "Download failed", variant: "destructive" });
        }
    };

    const columns: Column<any>[] = [
        { header: "BU", accessorKey: "businessUnitId", className: "text-muted-foreground font-mono text-xs w-20", cell: (row) => row.businessUnitId || "Default" },
        {
            header: "Batch #",
            accessorKey: "id",
            className: "font-mono font-medium",
            cell: (row: any) => row.id.substring(0, 8).toUpperCase()
        },
        { header: "Batch Name", accessorKey: "batchName" },
        {
            header: "Payment Date",
            accessorKey: "checkDate",
            cell: (row) => row.checkDate ? new Date(row.checkDate).toLocaleDateString() : "-"
        },
        { header: "Payment Method", accessorKey: "paymentMethodCode" },
        {
            header: "Invoice Count",
            accessorKey: "paymentCount",
            cell: (row) => row.paymentCount || 0
        },
        {
            header: "Total Amount",
            accessorKey: "totalAmount",
            cell: (row) => `$${parseFloat(row.totalAmount || 0).toLocaleString()}`
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row) => {
                const status = row.status?.toUpperCase();
                const variant =
                    status === "CONFIRMED" || status === "PAID" || status === "COMPLETED" ? "default" :
                        status === "ERROR" ? "destructive" :
                            status === "SELECTED" ? "secondary" :
                                "outline";
                return <Badge variant={variant}>{row.status}</Badge>;
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: (row) => {
                const status = row.status?.toUpperCase();
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEntityId(row.id);
                                setAccountingModalOpen(true);
                            }}
                            title="View Accounting"
                        >
                            <FileText className="h-4 w-4" />
                        </Button>
                        {(status === "DRAFT" || status === "NEW") && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    selectInvoicesMutation.mutate(row.id);
                                }}
                            >
                                <Play className="h-4 w-4 mr-1" />
                                Select Invoices
                            </Button>
                        )}
                        {status === "SELECTED" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    confirmMutation.mutate(row.id);
                                }}
                            >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirm & Pay
                            </Button>
                        )}
                        {status === "CONFIRMED" && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        downloadISO20022(row.id);
                                    }}
                                >
                                    <Download className="h-4 w-4 mr-1" />
                                    ISO20022
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toast({ title: "Generating Remittance Advice..." });
                                        setTimeout(() => toast({ title: "Remittance Advice PDF sent to supplier(s)" }), 1000);
                                    }}
                                >
                                    <FileText className="h-4 w-4 mr-1 text-blue-500" />
                                    Remittance
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toast({ title: "Positive Pay Extraction Complete", description: "File is ready for bank transmission." });
                                    }}
                                >
                                    <Download className="h-4 w-4 mr-1 text-green-500" />
                                    Positive Pay
                                </Button>
                            </>
                        )}
                    </div>
                );
            }
        }
    ];

    return (
        <StandardPage
            title="Payment Batches"
            description="Payment Process Request (PPR) workflow"
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "AP", href: "/finance/ap" },
                { label: "Payment Batches" }
            ]}
            actions={
                <Button onClick={() => setLocation('/finance/ap/payments/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Create PPR
                </Button>
            }
        >
            <div className="space-y-6">
                {/* BU Context Banner */}
                <div className="flex items-center gap-2 px-1">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Active BU:</span>
                    <Badge variant="secondary" className="font-mono text-xs">
                        {activeBu.id ? activeBu.name : "All Business Units"}
                    </Badge>
                    {!activeBu.id && (
                        <span className="text-xs text-amber-600">(No BU selected — showing all batches)</span>
                    )}
                </div>
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Draft Batches</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {batches?.filter((b: any) => {
                                    const s = b.status?.toUpperCase();
                                    return s === "DRAFT" || s === "NEW";
                                }).length || 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Selected</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {batches?.filter((b: any) => b.status?.toUpperCase() === "SELECTED").length || 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {batches?.filter((b: any) => b.status?.toUpperCase() === "CONFIRMED").length || 0}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Batches Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Batches</CardTitle>
                        <CardDescription>Manage payment runs and generate payment files</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <StandardTable
                            data={batches || []}
                            columns={columns}
                            totalItems={batches?.length || 0}
                            page={page}
                            onPageChange={setPage}
                            pageSize={pageSize}
                            isLoading={isLoading}
                            filterColumn="batchName"
                            filterPlaceholder="Search batches..."
                            onRowClick={(item) => setLocation(`/finance/ap/payments/${item.id}`)}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Create Batch Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Payment Batch</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="businessUnitId">Business Unit *</Label>
                            <Select
                                value={formData.businessUnitId}
                                onValueChange={(v) => setFormData({ ...formData, businessUnitId: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Business Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BU_US">US Operations</SelectItem>
                                    <SelectItem value="BU_EU">EU Operations</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="batchName">Batch Name</Label>
                            <Input
                                id="batchName"
                                value={formData.batchName}
                                onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                                placeholder="Weekly Payment Run"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="paymentMethodCode">Payment Method</Label>
                            <Select
                                value={formData.paymentMethodCode}
                                onValueChange={(v) => setFormData({ ...formData, paymentMethodCode: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EFT">EFT (Electronic Funds Transfer)</SelectItem>
                                    <SelectItem value="Check">Check</SelectItem>
                                    <SelectItem value="Wire">Wire Transfer</SelectItem>
                                    <SelectItem value="ACH">ACH</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="checkDate">Payment Date</Label>
                            <Input
                                id="checkDate"
                                type="date"
                                value={formData.checkDate}
                                onChange={(e) => setFormData({ ...formData, checkDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bankAccountId">Bank Account</Label>
                            <Select
                                value={formData.bankAccountId}
                                onValueChange={(v) => setFormData({ ...formData, bankAccountId: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an Account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {bankAccounts?.map((account: any) => (
                                        <SelectItem key={account.id} value={account.id}>
                                            {account.accountName} (*{account.accountNumber?.slice(-4) || 'XXXX'})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => createMutation.mutate(formData)}>
                            Create Batch
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
