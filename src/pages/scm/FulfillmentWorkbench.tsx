import { formatTime } from "@/lib/dateUtils";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Package, Truck, CheckCircle, ClipboardList, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { StandardPage } from "@/components/layout/StandardPage";

export default function FulfillmentWorkbench() {
    const { toast } = useToast();
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

    // 1. Fetch Orders Ready for Fulfillment
    const { data: readyOrders = [], isLoading: isLoadingOrders } = useQuery<any>({
        queryKey: ["/api/scm/wms/orders/ready"],
        queryFn: async () => {
            const res = await fetch("/api/scm/wms/orders/ready");
            return res.json();
        }
    });

    // 2. Fetch Tasks (For Execution Tab)
    const { data: tasksData } = useQuery<any>({
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
                description: `Manual Wave ${formatTime(new Date())}`
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
    const orderColumns: SpreadsheetColumn<any>[] = [
        {
            id: "select",
            header: "",
            width: "50px",
            cell: (row: any) => (
                <Checkbox
                    aria-label={`Select order ${row.orderNumber}`}
                    checked={selectedOrders.includes(row.id)}
                    onCheckedChange={(checked: boolean) => {
                        if (checked) setSelectedOrders([...selectedOrders, row.id]);
                        else setSelectedOrders(selectedOrders.filter(id => id !== row.id));
                    }}
                />
            )
        },
        { id: "orderNumber", header: "Order #", width: "150px", cell: (row) => <span className="font-medium text-white">{row.orderNumber}</span> },
        { id: "totalAmount", header: "Total Amount", width: "150px", cell: (row) => <span>${Number(row.totalAmount).toFixed(2)}</span> },
        { id: "status", header: "Status", width: "150px", cell: (row) => <Badge variant="secondary">{row.status}</Badge> }
    ];

    // Columns for Tasks
    const taskColumns: SpreadsheetColumn<any>[] = [
        { id: "taskNumber", header: "Task #", width: "150px", cell: (row) => <span className="font-medium text-white">{row.taskNumber}</span> },
        { id: "itemId", header: "Item ID", width: "150px", cell: (row) => <span>{row.itemId}</span> },
        { id: "quantity", header: "Qty", width: "150px", cell: (row) => <span>{row.quantityPlanned} {row.uom}</span> },
        {
            id: "actions",
            header: "Action",
            width: "150px",
            cell: (row: any) => (
                <Button
                    size="sm"
                    onClick={() => confirmTaskMutation.mutate({ taskId: row.id, quantity: Number(row.quantityPlanned) })}
                >
                    Confirm
                </Button>
            )
        }
    ];

    return (
        <StandardPage
            title="Order Fulfillment"
            description="Wave Planning & Task Execution"
            actions={
                <div className="flex gap-2">
                    <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
                </div>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">Pending Orders</CardTitle>
                        <ClipboardList className="h-4 w-4 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{readyOrders.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">Active Tasks</CardTitle>
                        <Package className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{tasks.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card/5 border-white/10">
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
                <TabsList className="bg-card/5 border-white/10">
                    <TabsTrigger value="planning">Wave Planning</TabsTrigger>
                    <TabsTrigger value="execution">Task Execution</TabsTrigger>
                </TabsList>

                <TabsContent value="planning" className="space-y-4">
                    <Card className="bg-card/5 border-white/10">
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
                            <div className="rounded-md border border-white/10 h-[400px]">
                                {readyOrders.length === 0 ? (
                                    <div className="p-8 text-center text-white/40 h-full flex items-center justify-center">No orders ready for fulfillment</div>
                                ) : (
                                    <InteractiveSpreadsheet
                                        columns={orderColumns}
                                        data={readyOrders}
                                        onChange={() => { }}
                                        containerHeight="100%"
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="execution" className="space-y-4">
                    <Card className="bg-card/5 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white/90">Picking Queue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border border-white/10 h-[400px]">
                                {tasks.length === 0 ? (
                                    <div className="p-8 text-center text-white/40 h-full flex items-center justify-center">No pending tasks</div>
                                ) : (
                                    <InteractiveSpreadsheet
                                        columns={taskColumns}
                                        data={tasks}
                                        onChange={() => { }}
                                        containerHeight="100%"
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
