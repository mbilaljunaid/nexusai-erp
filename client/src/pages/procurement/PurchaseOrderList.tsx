import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Plus, Trash2, Eye } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";
import { StandardTable } from "@/components/ui/StandardTable";
import { ColumnDef } from "@tanstack/react-table";

interface PurchaseOrder {
    id: number | string;
    poNumber: string;
    supplierId: number | string;
    supplier?: { supplierName: string };
    totalAmount: number | string;
    status: string;
    createdAt: string;
    lines?: any[];
}

export default function PurchaseOrderList() {
    const { toast } = useToast();
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    const { data: pos = [], isLoading } = useQuery<PurchaseOrder[]>({
        queryKey: ["/api/procurement/purchase-orders"],
        queryFn: () => fetch("/api/procurement/purchase-orders").then(r => r.json()).catch(() => [])
    });

    const { data: suppliers = [] } = useQuery<any[]>({
        queryKey: ["/api/procurement/suppliers"],
        queryFn: () => fetch("/api/procurement/suppliers").then(r => r.json()).catch(() => [])
    });

    const deletePOMutation = useMutation({
        mutationFn: (id: string | number) => fetch(`/api/procurement/purchase-orders/${id}`, { method: "DELETE" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] });
            toast({ title: "PO deleted" });
        }
    });

    const approvePOMutation = useMutation({
        mutationFn: (id: string | number) => fetch(`/api/procurement/purchase-orders/${id}/approve`, { method: "POST" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] });
            toast({ title: "PO Approved" });
        }
    });

    const columns: ColumnDef<PurchaseOrder>[] = [
        {
            accessorKey: "poNumber",
            header: "PO Number",
            cell: ({ row }) => <span className="font-semibold">{row.original.poNumber}</span>
        },
        {
            accessorKey: "supplier",
            header: "Supplier",
            cell: ({ row }) => {
                const sName = row.original.supplier?.supplierName || suppliers.find(s => s.id === row.original.supplierId)?.supplierName || "Unknown";
                return <span>{sName}</span>;
            }
        },
        {
            accessorKey: "totalAmount",
            header: "Amount",
            cell: ({ row }) => <span>${Number(row.original.totalAmount).toLocaleString()}</span>
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.original.status === 'Draft' ? 'outline' : row.original.status === 'Approved' ? 'secondary' : 'default'}>
                    {row.original.status}
                </Badge>
            )
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }) => <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2 justify-end">
                    {row.original.status === 'Draft' && (
                        <Button size="sm" variant="outline" onClick={() => approvePOMutation.mutate(row.original.id)}>Approve</Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => deletePOMutation.mutate(row.original.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <StandardPage
            title="Purchase Orders"
            subtitle="Manage purchase orders and supplier agreements"
            actions={
                <Link href="/procurement/orders/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create PO
                    </Button>
                </Link>
            }
        >
            <StandardTable
                data={pos}
                columns={columns}
                isLoading={isLoading}
                filterColumn="poNumber"
                filterPlaceholder="Filter orders..."
            />
        </StandardPage>
    );
}
