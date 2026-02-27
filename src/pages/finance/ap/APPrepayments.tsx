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
import { DollarSign, Link, Unlink } from "lucide-react";

export default function APPrepayments() {
    const [page, setPage] = useState(1);
    const pageSize = 20;
    const [applyDialogOpen, setApplyDialogOpen] = useState(false);
    const [selectedPrepay, setSelectedPrepay] = useState<any>(null);
    const [invoiceId, setInvoiceId] = useState("");
    const [amount, setAmount] = useState("");
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: prepayments, isLoading } = useQuery({
        queryKey: ["/api/ap/prepayments"],
        queryFn: async () => {
            // Fetch all invoices and filter for prepayments
            const response = await fetch("/api/ap/invoices");
            const data = await response.json();
            return data.data?.filter((inv: any) =>
                inv.invoiceType === "PREPAYMENT" &&
                parseFloat(inv.remainingAmount || inv.invoiceAmount || 0) > 0
            ) || [];
        }
    });

    const applyMutation = useMutation({
        mutationFn: async ({ invoiceId, prepayId, amount }: any) =>
            fetch(`/api/ap/invoices/${invoiceId}/apply-prepayment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prepayId, amount })
            }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ap/prepayments"] });
            setApplyDialogOpen(false);
            toast({ title: "Prepayment applied successfully" });
        }
    });

    const columns: Column<any>[] = [
        {
            header: "Prepayment #",
            accessorKey: "invoiceNumber",
            className: "font-mono font-medium"
        },
        { header: "Supplier", accessorKey: "supplier.name" },
        {
            header: "Original Amount",
            accessorKey: "invoiceAmount",
            cell: (row) => `$${parseFloat(row.invoiceAmount).toFixed(2)}`
        },
        {
            header: "Applied",
            accessorKey: "appliedAmount",
            cell: (row) => {
                const applied = parseFloat(row.invoiceAmount) - parseFloat(row.remainingAmount || row.invoiceAmount);
                return `$${applied.toFixed(2)}`;
            }
        },
        {
            header: "Remaining",
            accessorKey: "remainingAmount",
            cell: (row) => (
                <span className="font-semibold text-green-600">
                    ${parseFloat(row.remainingAmount || row.invoiceAmount).toFixed(2)}
                </span>
            )
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row) => {
                const remaining = parseFloat(row.remainingAmount || row.invoiceAmount);
                const original = parseFloat(row.invoiceAmount);
                const isFullyApplied = remaining === 0;
                const isPartiallyApplied = remaining < original && remaining > 0;

                return (
                    <Badge variant={isFullyApplied ? "secondary" : "default"}>
                        {isFullyApplied ? "Fully Applied" : isPartiallyApplied ? "Partially Applied" : "Available"}
                    </Badge>
                );
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: (row) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPrepay(row);
                        setApplyDialogOpen(true);
                    }}
                    disabled={parseFloat(row.remainingAmount || row.invoiceAmount) === 0}
                >
                    <Link className="h-4 w-4 mr-1" />
                    Apply to Invoice
                </Button>
            )
        }
    ];

    return (
        <StandardPage
            title="Prepayments"
            description="Manage and apply supplier prepayments"
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "AP", href: "/finance/ap" },
                { label: "Prepayments" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Prepayments</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${(prepayments?.reduce((sum: number, p: any) =>
                                    sum + parseFloat(p.invoiceAmount), 0) || 0).toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">Original amount</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Applied</CardTitle>
                            <Unlink className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${(prepayments?.reduce((sum: number, p: any) =>
                                    sum + (parseFloat(p.invoiceAmount) - parseFloat(p.remainingAmount || p.invoiceAmount)), 0) || 0).toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">To invoices</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Available</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                ${(prepayments?.reduce((sum: number, p: any) =>
                                    sum + parseFloat(p.remainingAmount || p.invoiceAmount), 0) || 0).toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">Ready to apply</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Prepayments Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Prepayment List</CardTitle>
                        <CardDescription>All supplier prepayments and their application status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <StandardTable
                            data={prepayments || []}
                            columns={columns}
                            totalItems={prepayments?.length || 0}
                            page={page}
                            onPageChange={setPage}
                            pageSize={pageSize}
                            isLoading={isLoading}
                            filterColumn="invoiceNumber"
                            filterPlaceholder="Search prepayments..."
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Apply Prepayment Dialog */}
            <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Apply Prepayment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Prepayment</Label>
                            <p className="font-mono text-sm">{selectedPrepay?.invoiceNumber}</p>
                            <p className="text-sm text-muted-foreground">
                                Available: ${parseFloat(selectedPrepay?.remainingAmount || selectedPrepay?.invoiceAmount || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="invoiceId">Invoice ID</Label>
                            <Input
                                id="invoiceId"
                                value={invoiceId}
                                onChange={(e) => setInvoiceId(e.target.value)}
                                placeholder="Enter invoice ID"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount to Apply</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApplyDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => applyMutation.mutate({
                                invoiceId,
                                prepayId: selectedPrepay?.id,
                                amount: parseFloat(amount)
                            })}
                        >
                            Apply
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
