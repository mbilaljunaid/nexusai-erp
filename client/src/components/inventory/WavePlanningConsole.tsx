
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Ship, Play, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type WmsWave = {
    id: string;
    waveNumber: string;
    status: string;
    description: string;
    releaseDate: string | null;
    createdAt: string;
};

export const WavePlanningConsole = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [warehouseId, setWarehouseId] = useState("ORG-001"); // Default for prototype
    const [orderLimit, setOrderLimit] = useState("50");

    const { data: waves, isLoading } = useQuery({
        queryKey: ["wmsWaves", warehouseId],
        queryFn: async () => {
            const res = await fetch(`/api/wms/waves?warehouseId=${warehouseId}`);
            if (!res.ok) throw new Error("Failed to fetch waves");
            return res.json();
        },
        enabled: !!warehouseId
    });

    const createWaveMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/wms/waves", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ warehouseId, limit: parseInt(orderLimit) })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to create wave");
            }
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["wmsWaves"] });
            toast({ title: "Wave Generatod", description: `Created Wave ${data.wave.waveNumber} with ${data.lineCount} tasks.` });
        },
        onError: (err) => {
            toast({ title: "Wave Failed", description: err.message, variant: "destructive" });
        }
    });

    const releaseWaveMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/wms/waves/${id}/release`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("Failed to release wave");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wmsWaves"] });
            toast({ title: "Wave Released", description: "Tasks are now available for picking." });
        }
    });

    const columns: Column<WmsWave>[] = [
        { header: "Wave #", accessorKey: "waveNumber" },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item) => (
                <Badge variant={item.status === "RELEASED" ? "default" : "secondary"}>
                    {item.status}
                </Badge>
            )
        },
        { header: "Description", accessorKey: "description" },
        { header: "Created At", accessorKey: "createdAt" },
        {
            header: "Actions",
            cell: (item) => (
                <div className="flex gap-2">
                    {item.status === "PLANNED" && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => releaseWaveMutation.mutate(item.id)}
                            disabled={releaseWaveMutation.isPending}
                        >
                            {releaseWaveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                            Release
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <Card className="m-4">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Ship className="h-6 w-6" />
                        Wave Planning Console
                    </CardTitle>
                    <CardDescription>Group eligible orders into waves for optimized release.</CardDescription>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Wave
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Generate New Wave</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="grid gap-2">
                                <Label>Warehouse</Label>
                                <Input value={warehouseId} disabled />
                            </div>
                            <div className="grid gap-2">
                                <Label>Max Orders</Label>
                                <Input
                                    type="number"
                                    value={orderLimit}
                                    onChange={(e) => setOrderLimit(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={() => createWaveMutation.mutate()}
                                disabled={createWaveMutation.isPending}
                                className="w-full"
                            >
                                {createWaveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Generate Wave
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex gap-4">
                    {/* Filters can go here */}
                </div>
                <StandardTable
                    data={waves || []}
                    columns={columns}
                    isLoading={isLoading}
                    filterColumn="waveNumber"
                    filterPlaceholder="Search Wave..."
                />
            </CardContent>
        </Card>
    );
};
