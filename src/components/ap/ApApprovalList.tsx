import { StandardTable, Column } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export function ApApprovalList() {
    const queryClient = useQueryClient();
    const { data: invoices, isLoading } = useQuery({
        queryKey: ['/api/ap/invoices'],
        queryFn: () => api.ap.invoices.list()
    });

    const pendingInvoices = invoices?.filter((i: any) => i.status === "PendingApproval") || [];

    const approveMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.ap.invoices.approve(id, "One-click approval from list");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/ap/invoices'] });
        }
    });

    const columns: Column<any>[] = [
        {
            accessorKey: "invoiceNumber",
            header: "Invoice",
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-semibold">{item.invoiceNumber}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                </div>
            )
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: (item) => (
                <span className="font-bold">
                    {formatCurrency(Number(item.amount, item.currency))}
                </span>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: () => (
                <div className="flex items-center text-amber-500 gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Approval Required</span>
                </div>
            )
        },
        {
            id: "actions",
            header: "Actions",
            cell: (item) => (
                <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" className="text-xs h-8">
                        <XCircle className="h-3 w-3 mr-1" /> Reject
                    </Button>
                    <Button
                        size="sm"
                        className="text-xs h-8"
                        disabled={approveMutation.isPending}
                        onClick={() => approveMutation.mutate(item.id)}
                    >
                        <CheckCircle className="h-3 w-3 mr-1" /> Approve
                    </Button>
                </div>
            )
        }
    ];

    return (
        <StandardTable
            data={pendingInvoices}
            columns={columns}
            isLoading={isLoading}
            filterColumn="invoiceNumber"
            filterPlaceholder="Filter pending approvals..."
        />
    );
}
