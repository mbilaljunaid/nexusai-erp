
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Package, Truck, ClipboardList, RefreshCw, Layers, ArrowRight, CheckCircle2, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DashboardWidget } from "@/components/layout/StandardDashboard";
import { StandardPage } from "@/components/layout/StandardPage";

export default function WarehouseOperations() {
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
    const { data: tasksData, isLoading: isLoadingTasks } = useQuery({
        queryKey: ["/api/scm/wms/tasks", "warehouse-1"],
        queryFn: async () => {
            const res = await fetch("/api/scm/wms/tasks?warehouseId=warehouse-1");
            return res.json();
        }
    });
    const tasks = tasksData?.data || [];

    // Mutation: Create & Release Wave
    const createWaveMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/scm/wms/waves/create", {
                warehouseId: "warehouse-1",
                orderIds: selectedOrders,
                description: `Manual Wave ${new Date().toLocaleTimeString()}`
            });
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Wave Released", description: "Tasks generated for picking queue." });
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
                userId: "warehouse_worker_1"
            });
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Pick Confirmed", description: "Inventory updated successfully." });
            queryClient.invalidateQueries({ queryKey: ["/api/scm/wms/tasks"] });
        }
    });

    return (
        <StandardPage
            title="Warehouse Operations"
            description="Terminal Core • Execution & Fulfillment Hub"
            className="bg-slate-950 text-slate-200"
            actions={
                <div className="flex gap-3">
                    <Button variant="outline" className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-200" onClick={() => queryClient.invalidateQueries()}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Sync Registry
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                        <QrCode className="mr-2 h-4 w-4" /> Scan LPN/Task
                    </Button>
                </div>
            }
        >

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <DashboardWidget title="Orders Ready" icon={ClipboardList}>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-white">{readyOrders.length}</span>
                        <span className="text-xs text-green-400">+2 vs yesterday</span>
                    </div>
                </DashboardWidget>
                <DashboardWidget title="Active Picking Tasks" icon={Package}>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-orange-400">{tasks.length}</span>
                        <span className="text-xs text-slate-500">In process</span>
                    </div>
                </DashboardWidget>
                <DashboardWidget title="Staged LPNs" icon={Layers}>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-purple-400">12</span>
                        <span className="text-xs text-slate-500">Awaiting shipment</span>
                    </div>
                </DashboardWidget>
                <DashboardWidget title="Throughput (H)" icon={Truck}>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-green-400">145</span>
                        <span className="text-xs text-green-400">+5% efficiency</span>
                    </div>
                </DashboardWidget>
            </div>

            <Tabs defaultValue="waves" className="w-full space-y-6">
                <TabsList className="bg-slate-900 border border-slate-800 p-1 h-12">
                    <TabsTrigger value="waves" className="px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Wave Planning</TabsTrigger>
                    <TabsTrigger value="execution" className="px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Picking Queue</TabsTrigger>
                    <TabsTrigger value="lpn" className="px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Handling Units (LPN)</TabsTrigger>
                    <TabsTrigger value="putaway" className="px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Putaway</TabsTrigger>
                </TabsList>

                <TabsContent value="waves" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-white">Release Planning</CardTitle>
                                <CardDescription className="text-slate-400">Select orders to release for picking</CardDescription>
                            </div>
                            <Button
                                onClick={() => createWaveMutation.mutate()}
                                disabled={selectedOrders.length === 0 || createWaveMutation.isPending}
                                className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20"
                            >
                                {createWaveMutation.isPending ? "Releasing..." : `Release Wave (${selectedOrders.length} Orders)`}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto rounded-lg border border-slate-800">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-800/50 text-slate-400 font-medium border-b border-slate-800">
                                        <tr>
                                            <th className="p-4 w-12 text-center">
                                                <input type="checkbox" title="Select all orders" aria-label="Select all orders" className="rounded border-slate-700 bg-slate-900" />
                                            </th>
                                            <th className="p-4">Order Number</th>
                                            <th className="p-4">Total Amount</th>
                                            <th className="p-4">Priority</th>
                                            <th className="p-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {readyOrders.map((order: any) => (
                                            <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="p-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        title={`Select order ${order.orderNumber}`}
                                                        aria-label={`Select order ${order.orderNumber}`}
                                                        checked={selectedOrders.includes(order.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedOrders([...selectedOrders, order.id]);
                                                            else setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                                                        }}
                                                        className="rounded border-slate-700 bg-slate-900"
                                                    />
                                                </td>
                                                <td className="p-4 font-mono text-blue-400">{order.orderNumber}</td>
                                                <td className="p-4 font-medium">${Number(order.totalAmount).toLocaleString()}</td>
                                                <td className="p-4">
                                                    <Badge variant="outline" className="border-orange-500/20 text-orange-400 bg-orange-500/5">High</Badge>
                                                </td>
                                                <td className="p-4">
                                                    <Badge className="bg-slate-800 text-slate-300 border-slate-700">{order.status}</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                        {readyOrders.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-12 text-center text-slate-500 italic">No pending orders found in registry</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="execution" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white">Picking Execution Queue</CardTitle>
                            <CardDescription className="text-slate-400">Scan items and confirm pick quantities</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {tasks.map((task: any) => (
                                    <Card key={task.id} className="bg-slate-950 border-slate-800 hover:border-blue-500/50 transition-all group">
                                        <CardContent className="p-6 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Task ID: {task.taskNumber}</p>
                                                    <h3 className="text-lg font-bold text-white mt-1">Item: {task.itemId}</h3>
                                                </div>
                                                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">{task.status}</Badge>
                                            </div>
                                            <div className="py-4 border-y border-slate-800 flex justify-between items-center">
                                                <div className="space-y-1">
                                                    <p className="text-xs text-slate-500">Quantity Needed</p>
                                                    <p className="text-2xl font-mono text-white">{task.quantityPlanned} <span className="text-sm text-slate-500">{task.uom}</span></p>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <p className="text-xs text-slate-500">Location</p>
                                                    <p className="text-sm font-mono text-slate-300">ZONE-A-04-12</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300"
                                                    onClick={() => { }}
                                                >
                                                    Report Gap
                                                </Button>
                                                <Button
                                                    className="flex-1 bg-green-600 hover:bg-green-500"
                                                    onClick={() => confirmTaskMutation.mutate({ taskId: task.id, quantity: Number(task.quantityPlanned) })}
                                                >
                                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Pick
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {tasks.length === 0 && (
                                    <div className="col-span-full py-12 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500">
                                        <Package className="h-12 w-12 mb-4 opacity-20" />
                                        <p>No active tasks assigned to this station</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="lpn" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white">LPN Registry (License Plate Numbers)</CardTitle>
                            <CardDescription className="text-slate-400">Track handling units and container contents</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {[
                                    { id: "LPN001", type: "Pallet", status: "Staged", contents: "12 Items" },
                                    { id: "LPN002", type: "Box", status: "In Picking", contents: "4 Items" },
                                    { id: "LPN003", type: "Container", status: "Awaiting Shipping", contents: "50 Items" }
                                ].map((lpn) => (
                                    <div key={lpn.id} className="p-4 bg-slate-950 rounded-lg border border-slate-800 p-4 flex items-center gap-4">
                                        <div className="p-3 bg-slate-900 rounded-lg">
                                            <Layers className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-mono text-white text-sm">{lpn.id}</p>
                                            <p className="text-xs text-slate-500">{lpn.type} • {lpn.contents}</p>
                                        </div>
                                        <Badge className="ml-auto bg-slate-800 text-xs">{lpn.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
