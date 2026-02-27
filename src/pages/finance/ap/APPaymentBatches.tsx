import { useState } from "react";
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
import { Plus, Play, CheckCircle, Download, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function APPaymentBatches() {
    const [page, setPage] = useState(1);
    const pageSize = 20;
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<any>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        batchName: "",
        paymentMethod: "EFT",
        paymentDate: new Date().toISOString().split("T")[0],
        bankAccountId: ""
    });

    const { data: batches, isLoading } = useQuery({
        queryKey: ["/api/ap/payment-batches"],
        queryFn: () => fetch("/api/ap/payment-batches").then(r => r.json()),
        refetchInterval: 3000,
        refetchIntervalInBackground: true
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
        {
            header: "Batch #",
            accessorKey: "id",
            className: "font-mono font-medium"
        },
        { header: "Batch Name", accessorKey: "batchName" },
        {
            header: "Payment Date",
            accessorKey: "paymentDate",
            cell: (row) => new Date(row.paymentDate).toLocaleDateString()
        },
        { header: "Payment Method", accessorKey: "paymentMethod" },
        {
            header: "Invoice Count",
            accessorKey: "invoiceCount",
            cell: (row) => row.invoiceCount || 0
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
                    status === "CONFIRMED" ? "default" :
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
                                Confirm
                            </Button>
                        )}
                        {status === "CONFIRMED" && (
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
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Batch
                </Button>
            }
        >
            <div className="space-y-6">
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
                            <Label htmlFor="batchName">Batch Name</Label>
                            <Input
                                id="batchName"
                                value={formData.batchName}
                                onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                                placeholder="Weekly Payment Run"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="paymentMethod">Payment Method</Label>
                            <Select
                                value={formData.paymentMethod}
                                onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })}
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
                            <Label htmlFor="paymentDate">Payment Date</Label>
                            <Input
                                id="paymentDate"
                                type="date"
                                value={formData.paymentDate}
                                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bankAccountId">Bank Account</Label>
                            <Input
                                id="bankAccountId"
                                value={formData.bankAccountId}
                                onChange={(e) => setFormData({ ...formData, bankAccountId: e.target.value })}
                                placeholder="Operating Account"
                            />
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
