import React from 'react';
import { StandardTable } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { openFormInNewWindow } from "@/lib/formUtils";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface WorkOrder {
    id: string;
    number: string;
    product: string;
    quantity: number;
    status: "pending" | "in_progress" | "completed" | "cancelled";
    startDate?: string;
    dueDate?: string;
    priority?: "low" | "medium" | "high";
}

export default function WorkOrderList() {
    const { data: orders = [] } = useQuery<WorkOrder[]>({
        queryKey: ["/api/work-orders"],
        // Mocking data if API fails or is empty for demo
        queryFn: async () => {
            try {
                const res = await fetch("/api/work-orders");
                if (!res.ok) throw new Error("Failed");
                return await res.json();
            } catch (e) {
                return [
                    { id: "1", number: "WO-001", product: "Wireless Mouse", quantity: 500, status: "in_progress", priority: "high", dueDate: "2024-12-20" },
                    { id: "2", number: "WO-002", product: "Gaming Keyboard", quantity: 200, status: "pending", priority: "medium", dueDate: "2024-12-25" },
                    { id: "3", number: "WO-003", product: "USB-C Hub", quantity: 1000, status: "completed", priority: "low", dueDate: "2024-12-10" },
                ];
            }
        }
    });

    const columns: any[] = [
        {
            header: "Order #",
            accessorKey: "number",
            cell: (row: WorkOrder) => <span className="font-semibold">{row.number}</span>
        },
        {
            header: "Product",
            accessorKey: "product",
        },
        {
            header: "Quantity",
            accessorKey: "quantity",
            cell: (row: WorkOrder) => <span className="font-mono">{row.quantity.toLocaleString()}</span>
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row: WorkOrder) => {
                const colors = {
                    pending: "secondary",
                    in_progress: "default",
                    completed: "outline",
                    cancelled: "destructive"
                } as const;
                return <Badge variant={colors[row.status] || "secondary"} className="capitalize">{row.status?.replace('_', ' ')}</Badge>;
            }
        },
        {
            header: "Priority",
            accessorKey: "priority",
            cell: (row: WorkOrder) => (
                <Badge variant="outline" className={`capitalize ${row.priority === 'high' ? 'text-red-600 border-red-200 bg-red-50' : ''}`}>
                    {row.priority}
                </Badge>
            )
        },
        {
            header: "Due Date",
            accessorKey: "dueDate",
        }
    ];

    return (
        <StandardPage
            title="Work Orders"
            breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "Work Orders" }]}
            actions={
                <Button onClick={() => openFormInNewWindow("workOrders", "Work Orders Form")}>
                    <Plus className="mr-2 h-4 w-4" /> Create Work Order
                </Button>
            }
        >
            <StandardTable
                data={orders}
                columns={columns}
                keyExtractor={(item) => item.id}
                filterColumn="product" // Filtering by Product Name
                filterPlaceholder="Filter by product..."
            />
        </StandardPage>
    );
}
