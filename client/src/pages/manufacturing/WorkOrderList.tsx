import React, { useState } from 'react';
import { StandardTable } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { openFormInNewWindow } from "@/lib/formUtils";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Plus, Play, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkOrder {
    id: string;
    orderNumber: string;
    productId: string;
    productName?: string;
    quantity: number;
    status: "planned" | "in_progress" | "completed" | "cancelled";
    scheduledDate?: string;
    priority?: "low" | "medium" | "high";
}

export default function WorkOrderList() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const limit = 50;

    const { data, isLoading } = useQuery<{ items: WorkOrder[], total: number }>({
        queryKey: ["/api/manufacturing/work-orders", page],
        queryFn: async () => {
            const res = await fetch(`/api/manufacturing/work-orders?limit=${limit}&offset=${page * limit}`);
            if (!res.ok) throw new Error("Failed to fetch work orders");
            return res.json();
        }
    });

    const statusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            const res = await fetch(`/api/manufacturing/work-orders/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error("Failed to update status");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/work-orders"] });
            toast({ title: "Updated", description: "Work order status changed." });
        }
    });

    const columns: Column<WorkOrder>[] = [
        {
            header: "Order #",
            accessorKey: "orderNumber",
            cell: (row: WorkOrder) => <span className="font-semibold">{row.orderNumber}</span>
        },
        {
            header: "Product",
            accessorKey: "productName",
            cell: (row: WorkOrder) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.productName || 'Unknown Product'}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{row.productId}</span>
                </div>
            )
        },
        {
            header: "Quantity",
            accessorKey: "quantity",
            cell: (row: WorkOrder) => <span className="font-mono">{row.quantity?.toLocaleString()}</span>
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row: WorkOrder) => {
                const colors = {
                    planned: "secondary",
                    in_progress: "default",
                    completed: "outline",
                    cancelled: "destructive"
                } as const;
                return <Badge variant={colors[row.status] || "secondary"} className="capitalize">{row.status?.replace('_', ' ')}</Badge>;
            }
        },
        {
            header: "Scheduled",
            accessorKey: "scheduledDate",
            cell: (row: WorkOrder) => row.scheduledDate ? new Date(row.scheduledDate).toLocaleDateString() : '-'
        },
        {
            header: "Actions",
            id: "actions",
            cell: (row: WorkOrder) => (
                <div className="flex gap-2">
                    {row.status === "planned" && (
                        <Button variant="ghost" size="sm" onClick={() => statusMutation.mutate({ id: row.id, status: "in_progress" })}>
                            <Play className="h-4 w-4 mr-1" /> Start
                        </Button>
                    )}
                    {row.status === "in_progress" && (
                        <Button variant="ghost" size="sm" onClick={() => statusMutation.mutate({ id: row.id, status: "completed" })}>
                            <CheckCircle className="h-4 w-4 mr-1" /> Complete
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <StandardPage
            title="Production Work Orders"
            breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "Work Orders" }]}
            actions={
                <Button onClick={() => openFormInNewWindow("workOrders", "Work Orders Form")}>
                    <Plus className="mr-2 h-4 w-4" /> Create Work Order
                </Button>
            }
        >
            <StandardTable
                data={data?.items || []}
                columns={columns}
                isLoading={isLoading}
                keyExtractor={(item) => item.id}
                filterColumn="orderNumber"
                filterPlaceholder="Filter by order number..."
                page={page + 1}
                pageSize={limit}
                totalItems={data?.total || 0}
                onPageChange={(p) => setPage(p - 1)}
            />
        </StandardPage>
    );
}
