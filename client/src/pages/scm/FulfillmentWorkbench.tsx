
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/DataTable";
import { Package, Truck, CheckCircle, ClipboardList, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function FulfillmentWorkbench() {
    const { toast } = useToast();
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

    // 1. Fetch Orders Ready for Fulfillment
    const { data: readyOrders = [], isLoading: isLoadingOrders } = useQuery({
        queryKey: ["/api/scm/wms/orders/ready"],
        queryFn: async () => {
            const res = await fetch("/api/scm/wms/orders/ready");
            return res.json();
        }
    });

    // 2. Fetch Tasks (For Execution Tab)
    const { data: tasksData } = useQuery({
        queryKey: ["/api/scm/wms/tasks", "warehouse-1"],
        queryFn: async () => {
            const res = await fetch("/api/scm/wms/tasks?warehouseId=warehouse-1");
            return res.json();
        }
    });
    const tasks = tasksData?.data || [];

    // Mutation: Create Wave
    const createWaveMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/scm/wms/waves/create", {
                warehouseId: "warehouse-1", // Context
                orderIds: selectedOrders,
                description: `Manual Wave ${new Date().toLocaleTimeString()}`
            });
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Wave Created", description: "Orders released to picking." });
            queryClient.invalidateQueries({ queryKey: ["/api/scm/wms/orders/ready"] });
            queryClient.invalidateQueries({ queryKey: ["/api/scm/wms/tasks"] });
            setSelectedOrders([]);
        }
    });

    // Mutation: Confirm Task
    const confirmTaskMutation = useMutation({
        mutationFn: async ({ taskId, quantity }: { taskId: string, quantity: number }) => {
            const res = await apiRequest("POST", `/api/scm/wms/tasks/${taskId}/confirm`, {
                quantity,
                userId: "current-user"
            });
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Task Confirmed", description: "Inventory deducted." });
            queryClient.invalidateQueries({ queryKey: ["/api/scm/wms/tasks"] });
        }
    });

    // Columns for Orders
    const orderColumns = [
        { accessorKey: "orderNumber", header: "Order #" },
        { accessorKey: "customer", header: "Customer" }, // Need join or simple display
        { accessorKey: "totalAmount", header: "Value" },
        { accessorKey: "requestedDate", header: "Due Date" },
        {
            id: "select",
            header: "Select",
            cell: ({ row }: any) => (
                <input
                    type="checkbox"
                    aria-label={`Select order ${row.original.orderNumber}`}
                    checked={selectedOrders.includes(row.original.id)}
                    onChange={(e) => {
                        if (e.target.checked) setSelectedOrders([...selectedOrders, row.original.id]);
                        else setSelectedOrders(selectedOrders.filter(id => id !== row.original.id));
                    }}
                />
            )
        }
    ];

    // Columns for Tasks
    const taskColumns = [
        { accessorKey: "taskNumber", header: "Task #" },
        { accessorKey: "item", header: "Item" }, // Need generic join logic or just ID
        { accessorKey: "quantityPlanned", header: "Qty To Pick" },
        { accessorKey: "status", header: "Status", cell: ({ row }: any) => <Badge>{row.original.status}</Badge> },
        {
            id: "actions",
            header: "Action",
            cell: ({ row }: any) => (
                <Button
                    size="sm"
                    onClick={() => confirmTaskMutation.mutate({ taskId: row.original.id, quantity: Number(row.original.quantityPlanned) })}
                    disabled={row.original.status !== 'PENDING'}
                >
                    Confirm Pick
                </Button>
            )
        }
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white/90">Order Fulfillment</h1>
                    <p className="text-white/60">Wave Planning & Task Execution</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">Pending Orders</CardTitle>
                        <ClipboardList className="h-4 w-4 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{readyOrders.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">Active Tasks</CardTitle>
                        <Package className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{tasks.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">Shipped Today</CardTitle>
                        <Truck className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">0</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="planning" className="w-full">
                <TabsList className="bg-white/5 border-white/10">
                    <TabsTrigger value="planning">Wave Planning</TabsTrigger>
                    <TabsTrigger value="execution">Task Execution</TabsTrigger>
                </TabsList>

                <TabsContent value="planning" className="space-y-4">
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <div className="flex justify-between">
                                <CardTitle className="text-white/90">Orders Awaiting Release</CardTitle>
                                <Button
                                    onClick={() => createWaveMutation.mutate()}
                                    disabled={selectedOrders.length === 0 || createWaveMutation.isPending}
                                >
                                    {createWaveMutation.isPending ? "Releasing..." : `Release Wave (${selectedOrders.length})`}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Simplified Table for now - ideally use reusable DataTable but columns vary */}
                            <div className="rounded-md border border-white/10">
                                <table className="w-full text-sm text-left text-white/70">
                                    <thead className="bg-white/5">
                                        <tr>
                                            <th className="p-4">Select</th>
                                            <th className="p-4">Order #</th>
                                            <th className="p-4">Total Amount</th>
                                            <th className="p-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {readyOrders.map((order: any) => (
                                            <tr key={order.id} className="border-b border-white/5">
                                                <td className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        aria-label={`Select order ${order.orderNumber}`}
                                                        checked={selectedOrders.includes(order.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedOrders([...selectedOrders, order.id]);
                                                            else setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                                                        }}
                                                    />
                                                </td>
                                                <td className="p-4 font-medium text-white">{order.orderNumber}</td>
                                                <td className="p-4">${Number(order.totalAmount).toFixed(2)}</td>
                                                <td className="p-4"><Badge variant="secondary">{order.status}</Badge></td>
                                            </tr>
                                        ))}
                                        {readyOrders.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-4 text-center text-white/40">No orders ready for fulfillment</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="execution" className="space-y-4">
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white/90">Picking Queue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border border-white/10">
                                <table className="w-full text-sm text-left text-white/70">
                                    <thead className="bg-white/5">
                                        <tr>
                                            <th className="p-4">Task #</th>
                                            <th className="p-4">Item ID</th>
                                            <th className="p-4">Qty</th>
                                            <th className="p-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasks.map((task: any) => (
                                            <tr key={task.id} className="border-b border-white/5">
                                                <td className="p-4 font-medium text-white">{task.taskNumber}</td>
                                                <td className="p-4">{task.itemId}</td>
                                                <td className="p-4">{task.quantityPlanned} {task.uom}</td>
                                                <td className="p-4">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => confirmTaskMutation.mutate({ taskId: task.id, quantity: Number(task.quantityPlanned) })}
                                                    >
                                                        Confirm
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {tasks.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-4 text-center text-white/40">No pending tasks</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
