import { StandardTable } from "@/components/ui/StandardTable";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Calendar, DollarSign, ArrowRight, Percent, CheckCircle2, Plus } from "lucide-react";
import { useState } from "react";
import { ApInvoice } from "@shared/schema";
import { ApSideSheet } from "./ApSideSheet";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

async function fetchInvoices() {
    const res = await apiRequest("GET", "/api/ap/invoices");
    return res.json();
}

export function ApInvoiceList() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [selectedInvoice, setSelectedInvoice] = useState<ApInvoice | null>(null);

    const { data: invoices = [], isLoading } = useQuery<ApInvoice[]>({
        queryKey: ['/api/ap/invoices'],
        queryFn: fetchInvoices
    });

    const validateMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await apiRequest("POST", `/api/ap/invoices/${id}/validate`);
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['/api/ap/invoices'] });
            toast({
                title: "Validation Complete",
                description: `Invoice status: ${data.status}. Holds: ${data.holds.length}`,
                variant: data.status === "VALIDATED" ? "default" : "destructive",
            });
        },
        onError: (err: Error) => {
            toast({ title: "Validation Failed", description: err.message, variant: "destructive" });
        }
    });

    const columns: ColumnDef<ApInvoice>[] = [
        {
            accessorKey: "invoiceNumber",
            header: "Invoice Number",
            cell: ({ row }) => <span className="font-semibold">{row.original.invoiceNumber}</span>
        },
        {
            accessorKey: "supplierId",
            header: "Supplier",
            cell: ({ row }) => <span className="text-muted-foreground">SUP-{row.original.supplierId}</span>
        },
        {
            accessorKey: "invoiceAmount",
            header: "Amount",
            cell: ({ row }) => (
                <span className="font-mono">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: row.original.invoiceCurrencyCode || 'USD' }).format(Number(row.original.invoiceAmount))}
                </span>
            )
        },
        {
            accessorKey: "invoiceDate",
            header: "Invoice Date",
            cell: ({ row }) => <span>{new Date(row.original.invoiceDate).toLocaleDateString()}</span>
        },
        {
            accessorKey: "dueDate",
            header: "Due Date",
            cell: ({ row }) => <span className="text-red-500">{row.original.dueDate ? new Date(row.original.dueDate).toLocaleDateString() : 'N/A'}</span>
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <div className="flex gap-1">
                    <Badge variant={row.original.paymentStatus === "PAID" ? "default" : row.original.paymentStatus === "UNPAID" ? "destructive" : "secondary"}>
                        {row.original.paymentStatus}
                    </Badge>
                    <Badge variant="outline">
                        {row.original.invoiceStatus || "DRAFT"}
                    </Badge>
                </div>
            )
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2 justify-end">
                    {row.original.validationStatus !== "VALIDATED" ? (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => { e.stopPropagation(); validateMutation.mutate(row.original.id); }}
                            disabled={validateMutation.isPending}
                        >
                            Validate
                        </Button>
                    ) : null}
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedInvoice(row.original)}
                    >
                        Details
                    </Button>
                </div>
            )
        }
    ];

    return (
        <>
            <StandardTable
                data={invoices}
                columns={columns}
                isLoading={isLoading}
                filterColumn="invoiceNumber"
                filterPlaceholder="Filter invoices..."
                onRowClick={(row) => setSelectedInvoice(row)}
            />

            <ApSideSheet
                open={!!selectedInvoice}
                onOpenChange={(open) => !open && setSelectedInvoice(null)}
                invoice={selectedInvoice || undefined}
                type="invoice"
            />
        </>
    );
}
