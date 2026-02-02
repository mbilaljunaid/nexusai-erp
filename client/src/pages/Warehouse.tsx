import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { StandardPage } from "@/components/layout/StandardPage";
import { Building2, Plus, Trash2, LayoutDashboard, Settings } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Warehouse() {
    const { toast } = useToast();
    const [activeNav, setActiveNav] = useState("dashboard");
    const [newWarehouse, setNewWarehouse] = useState({ warehouseName: "", location: "", capacity: "" });

    const { data: warehouse = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/warehouse/locations"],
        queryFn: () => fetch("/api/warehouse/locations").then(r => r.json()).catch(() => []),
    });

    const active = warehouse.filter((w: any) => w.status === "active").length;
    // Handle mixed types for capacity safely
    const totalCapacity = warehouse.reduce((sum: number, w: any) => sum + (parseInt(w.capacity) || 0), 0);

    const createMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/warehouse/locations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/warehouse/locations"] });
            setNewWarehouse({ warehouseName: "", location: "", capacity: "" });
            toast({ title: "Warehouse created" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/warehouse/locations/${id}`, { method: "DELETE" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/warehouse/locations"] });
            toast({ title: "Warehouse deleted" });
        },
    });

    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-500" },
        { id: "locations", label: "Locations", icon: Building2, color: "text-green-500" },
        { id: "zones", label: "Zones", icon: Settings, color: "text-purple-500" },
    ];

    return (
        <StandardPage
            title="Warehouse & Fulfillment"
            description="Masters, zones, pick/pack/ship, returns, reverse logistics, multi-warehouse allocation"
        >
            <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

            <div className="mt-6">
                {activeNav === "dashboard" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-4 gap-3">
                            <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Warehouses</p><p className="text-2xl font-bold">{warehouse.length}</p></CardContent></Card>
                            <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-600">{active}</p></CardContent></Card>
                            <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Capacity</p><p className="text-2xl font-bold text-blue-600">{totalCapacity}</p></CardContent></Card>
                            <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Active %</p><p className="text-2xl font-bold">{warehouse.length > 0 ? ((active / warehouse.length) * 100).toFixed(0) : 0}%</p></CardContent></Card>
                        </div>
                    </div>
                )}

                {activeNav === "locations" && (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle className="text-base">Add Warehouse</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-3 gap-3">
                                    <Input placeholder="Warehouse name" value={newWarehouse.warehouseName} onChange={(e) => setNewWarehouse({ ...newWarehouse, warehouseName: e.target.value })} />
                                    <Input placeholder="Location" value={newWarehouse.location} onChange={(e) => setNewWarehouse({ ...newWarehouse, location: e.target.value })} />
                                    <Input placeholder="Capacity" type="number" value={newWarehouse.capacity} onChange={(e) => setNewWarehouse({ ...newWarehouse, capacity: e.target.value })} />
                                </div>
                                <Button disabled={createMutation.isPending || !newWarehouse.warehouseName} className="w-full" onClick={() => createMutation.mutate(newWarehouse)}>
                                    <Plus className="w-4 h-4 mr-2" /> Add Warehouse
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="sap-table-container">
                            {isLoading ? <p>Loading...</p> : warehouse.length === 0 ? <p className="text-muted-foreground">No warehouses</p> : (
                                <div className="space-y-2">
                                    {warehouse.map((w: any) => (
                                        <div key={w.id} className="p-3 border rounded hover-elevate flex items-center justify-between bg-card text-card-foreground">
                                            <div>
                                                <p className="font-semibold">{w.warehouseName || w.name || w.warehouseId}</p>
                                                <p className="text-sm text-muted-foreground">{w.location} • Cap: {w.capacity}</p>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <Badge variant={w.status === "active" ? "default" : "secondary"}>{w.status || "active"}</Badge>
                                                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(w.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeNav === "zones" && (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle>Zone Configuration</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Select a warehouse to configure pick/pack zones.</p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </StandardPage>
    );
}
