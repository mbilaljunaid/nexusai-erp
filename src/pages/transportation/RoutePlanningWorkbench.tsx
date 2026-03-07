import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Truck, MapPin, Navigation, Settings, AlertTriangle, Zap, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { ShipmentDetailSideSheet } from "@/components/transportation/ShipmentDetailSideSheet";
import { LogisticsInsightsCard } from "@/components/transportation/LogisticsInsightsCard";
import { RouteMapOverlay } from "@/components/transportation/RouteMapOverlay";
import { StandardPage } from "@/components/layout/StandardPage";
import { formatNumber } from '@/lib/formatters';

export default function RoutePlanningWorkbench() {
    const { toast } = useToast();
    const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
    const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);

    const { data: shipments, isLoading } = useQuery<any>({
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
        { id: "shipmentNumber", header: "Shipment #", width: "150px", cell: (info: any) => <div className="px-2 h-full flex items-center font-medium">{info.shipmentNumber}</div> },
        {
            id: "status",
            header: "Status",
            width: "120px",
            cell: (info: any) => (
                <div className="px-2 h-full flex items-center">
                    <Badge variant={info.status === "PLANNED" ? "outline" : "default"}>
                        {info.status}
                    </Badge>
                </div>
            )
        },
        {
            id: "carrierId",
            header: "Carrier",
            width: "150px",
            cell: (info: any) => <div className="px-2 h-full flex items-center">{info.carrierId ? (
                <Badge variant="secondary">{String(info.carrierId).slice(0, 8)}...</Badge>
            ) : <span className="text-muted-foreground italic">Unassigned</span>}</div>
        },
        {
            id: "laneId",
            header: "Lane",
            width: "150px",
            cell: (info: any) => <div className="px-2 h-full flex items-center">{info.laneId ? (
                <span className="font-mono text-xs">{String(info.laneId).slice(0, 8)}...</span>
            ) : <span className="text-muted-foreground">-</span>}</div>
        },
        {
            id: "totalCost",
            header: "Est. Cost",
            width: "120px",
            cell: (info: any) => <div className="px-2 h-full flex items-center">{info.totalCost ? `$${formatNumber(Number(info.totalCost))}` : "-"}</div>
        },
        {
            id: "actions",
            header: "Optimization",
            width: "200px",
            cell: (info: any) => (
                <div className="px-2 h-full flex items-center space-x-2">
                    <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-xs bg-indigo-500 hover:bg-indigo-600 text-white"
                        onClick={() => optimizeMutation.mutate(info.id)}
                        disabled={info.status !== "PLANNED" || optimizeMutation.isPending}
                    >
                        <Zap className="mr-1 h-3 w-3" /> Auto-Plan
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => {
                            setSelectedShipmentId(info.id);
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
        <StandardPage title="Page Title">
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
                        <CardContent className="p-0 h-[400px]">
                            <InteractiveSpreadsheet
                                data={shipments || []}
                                columns={columns}
                                onChange={() => { }}
                                virtualized={true}
                                containerHeight="400px"
                            />
                        </CardContent>
                    </Card>

                    {/* Additional workbench features placeholder */}
                    <div className="grid grid-cols-1 gap-6">
                        <RouteMapOverlay shipments={shipments || []} height="300px" />
                        <Card className="border-none shadow-premium bg-slate-500/10 backdrop-blur-sm h-48 flex items-center justify-center border-2 border-dashed border-border">
                            <div className="text-center text-muted-foreground/70">
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
                                <span className="text-muted-foreground/70">Total Savings Target</span>
                                <span className="font-bold text-emerald-400">+$24,500</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground/70">Lanes Analyzed</span>
                                <span className="font-bold">142</span>
                            </div>
                            <Button className="w-full text-xs h-10 bg-indigo-600 hover:bg-indigo-700 text-white">Run Optimization Cycle</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
