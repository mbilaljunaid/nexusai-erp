import { formatDate } from "@/lib/dateUtils";
import React, { useState } from 'react';
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { formatNumber } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Plus, Play, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DatePicker } from '@/components/ui/DatePicker';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WorkOrder {
    id: string;
    orderNumber: string;
    productId: string;
    productName?: string;
    quantity: number;
    status: "planned" | "in_progress" | "completed" | "cancelled";
    scheduledDate?: string;
    priority?: "low" | "medium" | "high";
    projectId?: string;
    projectNumber?: string;
}

export default function WorkOrderList() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const limit = 50;

    const { data, isLoading } = useQuery<{ items: WorkOrder[], total: number }>({
        queryKey: ["/api/manufacturing/work-orders", page],
        queryFn: async () => {
            // Mock fallback if API shouldn't fail
            const res = await fetch(`/api/manufacturing/work-orders?limit=${limit}&offset=${page * limit}`);
            if (!res.ok) return { items: [], total: 0 };
            return res.json();
        }
    });

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newOrder, setNewOrder] = useState({
        orderNumber: `WO-${Date.now()}`,
        productId: "",
        quantity: "1",
        scheduledDate: new Date().toISOString().split('T')[0],
        projectId: "",
        taskId: ""
    });

    const { data: products } = useQuery<any[]>({
        queryKey: ["/api/inventory/items"],
        queryFn: async () => {
            const res = await fetch("/api/inventory/items?limit=100");
            if (!res.ok) return [];
            const data = await res.json();
            return data.items || [];
        }
    });

    const { data: projects } = useQuery<any[]>({
        queryKey: ["/api/projects"],
        queryFn: async () => {
            const res = await fetch("/api/projects");
            if (!res.ok) return [];
            return await res.json();
        }
    });

    const { data: tasks } = useQuery<any[]>({
        queryKey: ["/api/projects", newOrder.projectId, "tasks"],
        queryFn: async () => {
            if (!newOrder.projectId) return [];
            const res = await fetch(`/api/projects/${newOrder.projectId}/tasks`);
            if (!res.ok) return [];
            return await res.json();
        },
        enabled: !!newOrder.projectId
    });


    const createMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                ...newOrder,
                quantity: Number(newOrder.quantity),
                scheduledDate: new Date(newOrder.scheduledDate)
            };
            const res = await fetch("/api/manufacturing/work-orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to create work order");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/work-orders"] });
            setIsCreateOpen(false);
            toast({ title: "Created", description: "Work Order created successfully" });
            setNewOrder({ ...newOrder, orderNumber: `WO-${Date.now()}` }); // Reset
        },
        onError: (err) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
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

    const columns: SpreadsheetColumn<any>[] = [
        {
            id: "orderNumber",
            header: "Order #",
            width: "150px",
            cell: (row: any) => <div className="p-2 font-semibold">{row.orderNumber}</div>
        },
        {
            id: "projectNumber",
            header: "Project",
            width: "200px",
            cell: (row: any) => (
                <div className="flex flex-col p-2">
                    <span className="font-medium">{row.projectNumber || '-'}</span>
                </div>
            )
        },
        {
            id: "productName",
            header: "Product",
            width: "250px",
            cell: (row: any) => (
                <div className="flex flex-col p-2">
                    <span className="font-medium">{row.productName || 'Unknown Product'}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{row.productId}</span>
                </div>
            )
        },
        {
            id: "quantity",
            header: "Quantity",
            width: "100px",
            cell: (row: any) => <div className="font-mono p-2">{formatNumber(row.quantity)}</div>
        },
        {
            id: "status",
            header: "Status",
            width: "150px",
            cell: (row: any) => {
                const colors = {
                    planned: "secondary",
                    in_progress: "default",
                    completed: "outline",
                    cancelled: "destructive"
                } as const;
                return <div className="p-2"><Badge variant={colors[row.status as keyof typeof colors] || "secondary"} className="capitalize">{row.status?.replace('_', ' ')}</Badge></div>;
            },
        },
        {
            id: "scheduledDate",
            header: "Scheduled",
            width: "150px",
            cell: (row: any) => <div className="p-2">{row.scheduledDate ? formatDate(row.scheduledDate) : '-'}</div>
        },
        {
            id: "actions",
            header: "Actions",
            width: "200px",
            cell: (row: any) => (
                <div className="flex gap-2 p-2">
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
                <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <SheetTrigger asChild>
                        <Button onClick={() => setIsCreateOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Create Work Order
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-[500px]">
                        <SheetHeader>
                            <SheetTitle>Create Work Order</SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="h-[calc(100vh-120px)] mt-4 pr-4">
                            <div className="grid gap-4 py-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Order Number</Label>
                                        <Input value={newOrder.orderNumber} onChange={(e) => setNewOrder({ ...newOrder, orderNumber: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Product</Label>
                                        <Select value={newOrder.productId} onValueChange={(v) => setNewOrder({ ...newOrder, productId: v })}>
                                            <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                                            <SelectContent>
                                                {products?.map((p: any) => (
                                                    <SelectItem key={p.id} value={p.id}>{p.itemName} ({p.itemNumber})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Quantity</Label>
                                        <Input type="number" value={newOrder.quantity} onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Scheduled Date</Label>
                                        <DatePicker value={newOrder.scheduledDate} onChange={(v) => setNewOrder({ ...newOrder, scheduledDate: v })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Project</Label>
                                        <Select value={newOrder.projectId} onValueChange={(v) => setNewOrder({ ...newOrder, projectId: v })}>
                                            <SelectTrigger><SelectValue placeholder="Select Project (Optional)" /></SelectTrigger>
                                            <SelectContent>
                                                {projects?.map((p: any) => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.projectNumber})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Task</Label>
                                        <Select value={newOrder.taskId} onValueChange={(v) => setNewOrder({ ...newOrder, taskId: v })} disabled={!newOrder.projectId}>
                                            <SelectTrigger><SelectValue placeholder="Select Task" /></SelectTrigger>
                                            <SelectContent>
                                                {tasks?.map((t: any) => (
                                                    <SelectItem key={t.id} value={t.id}>{t.name} ({t.taskNumber})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                        <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
                            <SheetClose asChild>
                                <Button variant="outline" type="button" className="mr-2">Cancel</Button>
                            </SheetClose>
                            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>Create Order</Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            }
        >
            <InteractiveSpreadsheet
                data={data?.items || []}
                columns={columns}
                onChange={() => { }} virtualized={true} containerHeight="600px"
            />
        </StandardPage>
    );
}
