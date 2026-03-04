
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    ClipboardList,
    ArrowRight,
    Search,
    Filter,
    Layers,
    CheckCircle2,
    Clock
} from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { useToast } from "@/hooks/use-toast";

export default function WavePlanning() {
    const { toast } = useToast();
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

    const { data: readyOrders = [], isLoading } = useQuery({
        queryKey: ["/api/scm/wms/orders/ready"],
        queryFn: async () => {
            const res = await fetch("/api/scm/wms/orders/ready");
            return res.json();
        }
    });

    const createWaveMutation = useMutation({
        mutationFn: async () => {
            return await apiRequest("POST", "/api/scm/wms/waves", {
                warehouseId: "WH-001",
                orderIds: selectedOrders,
                description: `Bulk Wave - ${new Date().toLocaleDateString()}`
            });
        },
        onSuccess: () => {
            toast({ title: "Wave Created", description: "Wave has been queued for release." });
            setSelectedOrders([]);
            queryClient.invalidateQueries({ queryKey: ["/api/scm/wms/orders/ready"] });
        }
    });

    const waveColumns: SpreadsheetColumn<any>[] = [
        {
            id: "select",
            header: <input type="checkbox" className="rounded bg-slate-900 border-slate-700" title="Select all orders" aria-label="Select all orders" />,
            width: "60px",
            cell: (row) => (
                <div className="flex justify-center w-full">
                    <input
                        type="checkbox"
                        title={`Select order ${row.orderNumber}`}
                        aria-label={`Select order ${row.orderNumber}`}
                        checked={selectedOrders.includes(row.id)}
                        onChange={(e) => {
                            if (e.target.checked) setSelectedOrders([...selectedOrders, row.id]);
                            else setSelectedOrders(selectedOrders.filter(id => id !== row.id));
                        }}
                        className="rounded bg-slate-900 border-slate-700 mt-1"
                    />
                </div>
            )
        },
        { id: "orderNumber", header: "Order #", width: "120px", cell: (row) => <div className="font-mono text-blue-400">{row.orderNumber}</div> },
        { id: "customer", header: "Customer", width: "150px", cell: () => <div className="text-white">Consolidated Express</div> },
        { id: "requestedDate", header: "Requested Date", width: "150px", cell: () => <div className="text-slate-400">{new Date().toLocaleDateString()}</div> },
        { id: "items", header: "Items", width: "100px", cell: () => <div className="text-white">5 items</div> },
        { id: "priority", header: "Priority", width: "120px", cell: () => <Badge variant="outline" className="border-orange-500/20 text-orange-400 bg-orange-500/5">High</Badge> }
    ];

    return (
        <StandardPage
            title="Wave Planning"
            description="Consolidate orders into waves for efficient picking and fulfillment."
        >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-3 bg-slate-900/50 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Ready for Fulfillment</CardTitle>
                            <CardDescription>Orders awaiting wave assignment</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <Input placeholder="Filter orders..." className="pl-9 w-64 bg-slate-950 border-slate-800" />
                            </div>
                            <Button variant="outline" className="border-slate-800 bg-slate-950">
                                <Filter className="w-4 h-4 mr-2" /> Filter
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div style={{ height: 400 }}>
                            <InteractiveSpreadsheet
                                columns={waveColumns}
                                data={readyOrders}
                                onChange={() => { }}
                                containerHeight="100%"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader>
                            <CardTitle>Wave Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                                <p className="text-xs text-slate-500 uppercase font-bold mb-2">Selected Orders</p>
                                <p className="text-3xl font-bold text-white">{selectedOrders.length}</p>
                                <p className="text-xs text-slate-400 mt-1">Total cube: 45.2 ft³</p>
                            </div>
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-500"
                                disabled={selectedOrders.length === 0 || createWaveMutation.isPending}
                                onClick={() => createWaveMutation.mutate()}
                            >
                                {createWaveMutation.isPending ? "Creating..." : "Create & Release Wave"}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                            <Button variant="outline" className="w-full border-slate-800 bg-slate-950" disabled={selectedOrders.length === 0}>
                                Assign to Template
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-sm">Recent Waves</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                { id: 'WV-102', status: 'RELEASED', time: '10m ago' },
                                { id: 'WV-101', status: 'COMPLETED', time: '2h ago' },
                            ].map(wave => (
                                <div key={wave.id} className="p-3 bg-slate-950 border border-slate-800 rounded flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-blue-400" />
                                        <span className="font-mono text-xs">{wave.id}</span>
                                    </div>
                                    <Badge className={wave.status === 'RELEASED' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}>
                                        {wave.status}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
