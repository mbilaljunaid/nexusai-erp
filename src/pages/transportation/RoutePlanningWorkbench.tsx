import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Truck, MapPin, Navigation, Settings, AlertTriangle, Zap, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StandardTable } from "@/components/ui/StandardTable";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { ShipmentDetailSideSheet } from "@/components/transportation/ShipmentDetailSideSheet";
import { LogisticsInsightsCard } from "@/components/transportation/LogisticsInsightsCard";
import { RouteMapOverlay } from "@/components/transportation/RouteMapOverlay";

export default function RoutePlanningWorkbench() {
    const { toast } = useToast();
    const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
    const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);

    const { data: shipments, isLoading } = useQuery({
        queryKey: ["/api/transportation/shipments"],
        queryFn: () => fetch("/api/transportation/shipments").then(res => res.json())
    });

    const optimizeMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/transportation/shipments/${id}/optimize`, { method: "POST" }).then(res => res.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/transportation/shipments"] });
            toast({
                title: "Route Optimized",
                description: "Carrier and lane have been selected automatically.",
            });
        }
    });

    const columns = [
        { header: "Shipment #", accessorKey: "shipmentNumber" },
        {
            header: "Status",
            accessorKey: "status",
            cell: (info: any) => (
                <Badge variant={info.getValue() === "PLANNED" ? "outline" : "default"}>
                    {info.getValue()}
                </Badge>
            )
        },
        {
            header: "Carrier",
            accessorKey: "carrierId",
            cell: (info: any) => info.getValue() ? (
                <Badge variant="secondary">{info.getValue().slice(0, 8)}...</Badge>
            ) : <span className="text-muted-foreground italic">Unassigned</span>
        },
        {
            header: "Lane",
            accessorKey: "laneId",
            cell: (info: any) => info.getValue() ? (
                <span className="font-mono text-xs">{info.getValue().slice(0, 8)}...</span>
            ) : <span className="text-muted-foreground">-</span>
        },
        {
            header: "Est. Cost",
            accessorKey: "totalCost",
            cell: (info: any) => info.getValue() ? `$${Number(info.getValue()).toLocaleString()}` : "-"
        },
        {
            id: "actions",
            header: "Optimization",
            cell: (info: any) => (
                <div className="flex space-x-2">
                    <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-xs bg-indigo-500 hover:bg-indigo-600 text-white"
                        onClick={() => optimizeMutation.mutate(info.row.original.id)}
                        disabled={info.row.original.status !== "PLANNED" || optimizeMutation.isPending}
                    >
                        <Zap className="mr-1 h-3 w-3" /> Auto-Plan
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => {
                            setSelectedShipmentId(info.row.original.id);
                            setIsSideSheetOpen(true);
                        }}
                    >
                        Track
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <ShipmentDetailSideSheet
                shipmentId={selectedShipmentId}
                open={isSideSheetOpen}
                onOpenChange={setIsSideSheetOpen}
            />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    <Card className="border-none shadow-premium bg-card/50 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
                            <div>
                                <CardTitle className="text-lg">Shipment Planning Workbench</CardTitle>
                                <CardDescription>Consolidate orders and optimize route selections.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                                <Search className="mr-2 h-4 w-4" /> Filter Shipments
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <StandardTable data={shipments || []} columns={columns} isLoading={isLoading} />
                        </CardContent>
                    </Card>

                    {/* Additional workbench features placeholder */}
                    <div className="grid grid-cols-1 gap-6">
                        <RouteMapOverlay shipments={shipments || []} height="300px" />
                        <Card className="border-none shadow-premium bg-slate-50/50 backdrop-blur-sm h-48 flex items-center justify-center border-2 border-dashed border-slate-200">
                            <div className="text-center text-slate-400">
                                <Truck className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm font-semibold">Fleet Utilization (Phase 6)</p>
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="space-y-6">
                    <LogisticsInsightsCard />

                    <Card className="border-none shadow-premium bg-slate-900 text-white">
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Zap className="h-4 w-4 text-blue-400" />
                                Optimization Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">Total Savings Target</span>
                                <span className="font-bold text-emerald-400">+$24,500</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">Lanes Analyzed</span>
                                <span className="font-bold">142</span>
                            </div>
                            <Button className="w-full text-xs h-10 bg-indigo-600 hover:bg-indigo-700 text-white">Run Optimization Cycle</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
