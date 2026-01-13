import { StandardTable } from "@/components/ui/StandardTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
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

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "invoiceNumber",
            header: "Invoice",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-semibold">{row.original.invoiceNumber}</span>
                    <span className="text-xs text-muted-foreground">{row.original.description}</span>
                </div>
            )
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => (
                <span className="font-bold">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: row.original.currency }).format(Number(row.original.amount))}
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
            cell: ({ row }) => (
                <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" className="text-xs h-8">
                        <XCircle className="h-3 w-3 mr-1" /> Reject
                    </Button>
                    <Button
                        size="sm"
                        className="text-xs h-8"
                        disabled={approveMutation.isPending}
                        onClick={() => approveMutation.mutate(row.original.id)}
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
