
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type WmsTask = {
    id: string;
    taskNumber: string;
    taskType: string;
    status: string;
    warehouseId: string;
    itemId: string;
    quantityPlanned: string;
    quantityActual: string;
    fromLocatorId: string;
    toLocatorId: string;
    createdAt: string;
};

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export const WmsTaskWorkbench = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const limit = 50;
    const [selectedTask, setSelectedTask] = useState<WmsTask | null>(null);
    const [scanQuantity, setScanQuantity] = useState("");
    const [activeTab, setActiveTab] = useState("PICK"); // Default to Picking

    const { data: taskData, isLoading } = useQuery({
        queryKey: ["wmsTasks", page, activeTab], // Refetch on tab change
        queryFn: async () => {
            // If tab is ALL, don't filter by type
            const typeParam = activeTab === "ALL" ? "" : `&taskType=${activeTab}`;
            const res = await fetch(`/api/wms/tasks?page=${page}&limit=${limit}${typeParam}`);
            if (!res.ok) throw new Error("Failed to fetch tasks");
            return res.json();
        }
    });

    const tasks = taskData?.data || [];
    const totalPages = taskData?.totalPages || 1;

    const completeMutation = useMutation({
        mutationFn: async ({ id, qty }: { id: string, qty: number }) => {
            const res = await fetch(`/api/wms/tasks/${id}/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ actualQuantity: qty })
            });
            if (!res.ok) throw new Error("Failed to complete task");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wmsTasks"] });
            toast({ title: "Task Completed", description: "Inventory has been moved." });
            setScanQuantity("");
            setSelectedTask(null);
        }
    });

    const columns: Column<WmsTask>[] = [
        { header: "Task #", accessorKey: "taskNumber" },
        {
            header: "Type",
            accessorKey: "taskType",
            cell: (item) => (
                <Badge variant={item.taskType === "PICK" ? "default" : "secondary"}>
                    {item.taskType}
                </Badge>
            )
        },
        { header: "Status", accessorKey: "status" },
        { header: "Item", accessorKey: "itemId" }, // Should resolve name in real implementation
        { header: "From", accessorKey: "fromLocatorId" },
        { header: "To", accessorKey: "toLocatorId" },
        { header: "Qty", accessorKey: "quantityPlanned" },
        {
            header: "Actions",
            cell: (item) => (
                <div className="flex gap-2">
                    {item.status !== "COMPLETED" && (
                        <Dialog open={selectedTask?.id === item.id} onOpenChange={(open) => !open && setSelectedTask(null)}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => setSelectedTask(item)}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Execute
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Complete Task {item.taskNumber}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label>Confirm Quantity</Label>
                                        <Input
                                            type="number"
                                            value={scanQuantity}
                                            onChange={(e) => setScanQuantity(e.target.value)}
                                            placeholder="Scan quantity..."
                                        />
                                    </div>
                                    <Button
                                        onClick={() => completeMutation.mutate({ id: item.id, qty: parseFloat(scanQuantity) })}
                                        disabled={!scanQuantity || completeMutation.isPending}
                                        className="w-full"
                                    >
                                        {completeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Confirm & Complete
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            )
        }
    ];

    return (
        
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
              />
            </PaginationItem>
            <PaginationItem>
              <span className="text-sm font-medium mx-4">Page {page} of {totalPages}</span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext 
                onClick={() => setPage(p => p + 1)} 
                className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
    );
};
