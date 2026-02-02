import React, { useState } from 'react';
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import {
    Plus, Play, CheckCircle, Package, FlaskConical,
    Activity, ClipboardCheck, AlertTriangle, History
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BatchOrder {
    id: string;
    batchNumber: string;
    recipeId: string;
    productId: string;
    recipeName?: string;
    productName?: string;
    plannedQuantity: number;
    actualYield?: number;
    status: "draft" | "released" | "in_progress" | "qc_pending" | "completed" | "closed";
    scheduledStart?: string;
}

export default function BatchWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<BatchOrder | null>(null);

    const { data, isLoading } = useQuery<{ items: BatchOrder[], total: number }>({
        queryKey: ["/api/manufacturing/batches", page, pageSize],
        queryFn: async () => {
            const offset = (page - 1) * pageSize;
            const res = await fetch(`/api/manufacturing/batches?limit=${pageSize}&offset=${offset}`);
            return res.json();
        }
    });

    const batches = data?.items || [];
    const totalItems = data?.total || 0;

    const stats = {
        active: batches.filter(b => ["released", "in_progress"].includes(b.status)).length,
        qc: batches.filter(b => b.status === "qc_pending").length,
        avgYield: 98.2 // Mocked for now
    };

    const statusMutation = useMutation({
        mutationFn: async ({ id, status, actualYield }: { id: string, status: string, actualYield?: number }) => {
            const res = await fetch(`/api/manufacturing/batches/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, actualYield })
            });
            if (!res.ok) throw new Error("Failed to update batch status");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/batches"] });
            setIsSheetOpen(false);
            toast({ title: "Updated", description: "Batch status synchronized." });
        }
    });

    const columns: Column<BatchOrder>[] = [
        {
            header: "Batch #",
            accessorKey: "batchNumber",
            cell: (row: BatchOrder) => <span className="font-mono font-bold text-indigo-700">{row.batchNumber}</span>
        },
        {
            header: "Recipe / Product",
            accessorKey: "recipeName",
            cell: (row: BatchOrder) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.recipeName || 'Standard Recipe'}</span>
                    <span className="text-[10px] text-muted-foreground">{row.productName}</span>
                </div>
            )
        },
        {
            header: "Planned Qty",
            accessorKey: "plannedQuantity",
            cell: (row: BatchOrder) => <span className="font-mono">{row.plannedQuantity.toLocaleString()} KG</span>
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row: BatchOrder) => (
                <Badge className="capitalize" variant={
                    row.status === 'completed' ? 'default' :
                        row.status === 'qc_pending' ? 'outline' :
                            row.status === 'in_progress' ? 'secondary' : 'outline'
                }>
                    {row.status.replace('_', ' ')}
                </Badge>
            )
        },
        {
            header: "Actions",
            id: "actions",
            cell: (row: BatchOrder) => (
                <Button variant="ghost" size="sm" onClick={() => { setSelectedBatch(row); setIsSheetOpen(true); }}>
                    Manage
                </Button>
            )
        }
    ];

    return (
        <StandardPage
            title="Batch Manufacturing Workbench"
            breadcrumbs={[
                { label: "Manufacturing", href: "/manufacturing" },
                { label: "Execution" },
                { label: "Batch Workbench" }
            ]}
            actions={
                <Button className="bg-indigo-600">
                    <Plus className="mr-2 h-4 w-4" /> Create New Batch
                </Button>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Active Batches</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-500" />
                            {stats.active}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase">QC Quarantine</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <ClipboardCheck className="h-5 w-5 text-amber-500" />
                            {stats.qc}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Average Yield</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <FlaskConical className="h-5 w-5 text-green-500" />
                            {stats.avgYield}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <StandardTable
                        data={batches}
                        columns={columns}
                        isLoading={isLoading}
                        keyExtractor={(item) => item.id}
                        filterColumn="batchNumber"
                        filterPlaceholder="Filter by batch ID..."
                        page={page}
                        pageSize={pageSize}
                        totalItems={totalItems}
                        onPageChange={setPage}
                    />
                </CardContent>
            </Card>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Batch Execution Control</SheetTitle>
                        <SheetDescription>
                            Review ingredients, record yield, and transition batch status.
                        </SheetDescription>
                    </SheetHeader>
                    {selectedBatch && (
                        <div className="space-y-6 mt-6">
                            <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100 space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-indigo-600 font-bold">BATCH {selectedBatch.batchNumber}</span>
                                    <Badge variant="outline">{selectedBatch.status.toUpperCase()}</Badge>
                                </div>
                                <div className="font-semibold text-indigo-900">{selectedBatch.productName}</div>
                                <div className="text-xs text-indigo-700">Planned: {selectedBatch.plannedQuantity} KG</div>
                            </div>

                            <div className="space-y-4">
                                {selectedBatch.status === 'released' && (
                                    <Button className="w-full" onClick={() => statusMutation.mutate({ id: selectedBatch.id, status: 'in_progress' })}>
                                        <Play className="mr-2 h-4 w-4" /> Start Cooking / Processing
                                    </Button>
                                )}

                                {selectedBatch.status === 'in_progress' && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Actual Yield (KG)</Label>
                                            <Input type="number" placeholder="Enter final net weight" />
                                        </div>
                                        <Button className="w-full bg-amber-600" onClick={() => statusMutation.mutate({ id: selectedBatch.id, status: 'qc_pending' })}>
                                            <ClipboardCheck className="mr-2 h-4 w-4" /> Move to QC Quarantine
                                        </Button>
                                    </div>
                                )}

                                {selectedBatch.status === 'qc_pending' && (
                                    <div className="p-4 border border-amber-200 bg-amber-50 rounded-md flex items-start gap-3">
                                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                                        <div className="text-xs text-amber-800">
                                            Batch is currently locked for quality inspection. Lab results must be recorded before completion.
                                        </div>
                                    </div>
                                )}

                                <div className="border-t pt-4">
                                    <Button variant="ghost" className="w-full text-xs text-muted-foreground">
                                        <History className="mr-2 h-3 w-3" /> View Batch Genealogy
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </StandardPage>
    );
}
