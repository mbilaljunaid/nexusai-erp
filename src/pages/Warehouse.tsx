import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconNavigation } from "@/components/IconNavigation";
import { StandardPage } from "@/components/layout/StandardPage";
import { Building2, Plus, Trash2, LayoutDashboard, Settings, Save, Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";

export default function Warehouse() {
    const { toast } = useToast();
    const [activeNav, setActiveNav] = useState("dashboard");
    const [localWarehouses, setLocalWarehouses] = useState<any[]>([]);

    const { data: warehouse = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/warehouse/locations"],
        queryFn: () => fetch("/api/warehouse/locations").then(r => r.json()).catch(() => []),
    });

    useEffect(() => {
        if (warehouse) {
            setLocalWarehouses(warehouse);
        }
    }, [warehouse]);

    const active = warehouse.filter((w: any) => w.status === "active").length;
    // Handle mixed types for capacity safely
    const totalCapacity = warehouse.reduce((sum: number, w: any) => sum + (parseInt(w.capacity) || 0), 0);

    const saveMutation = useMutation({
        mutationFn: async (updatedWarehouses: any[]) => {
            for (const w of updatedWarehouses) {
                if (!w.id || String(w.id).startsWith('temp-')) {
                    await fetch('/api/warehouse/locations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...w, id: undefined }) }).catch(() => { });
                } else {
                    await apiRequest('PATCH', `/api/warehouse/locations/${w.id}`, w).catch(() => { });
                }
            }

            const deletedIds = warehouse.filter((c: any) => !updatedWarehouses.find((uc: any) => uc.id === c.id)).map((c: any) => c.id);
            for (const id of deletedIds) {
                await fetch(`/api/warehouse/locations/${id}`, { method: 'DELETE' }).catch(() => { });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/warehouse/locations"] });
            toast({ title: "Warehouses saved successfully" });
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
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-base">Locations</CardTitle>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setLocalWarehouses([...localWarehouses, { id: `temp-${Date.now()}`, warehouseName: "", location: "", capacity: "1000", status: "active" }])}>
                                        <Plus className="w-4 h-4 mr-2" /> Add Warehouse
                                    </Button>
                                    <Button size="sm" onClick={() => saveMutation.mutate(localWarehouses)} disabled={saveMutation.isPending}>
                                        {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Changes
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-md bg-card">
                                    <InteractiveSpreadsheet
                                        data={localWarehouses}
                                        columns={[
                                            {
                                                id: "warehouseName",
                                                header: "Warehouse Name",
                                                width: "250px",
                                                cell: (row, index, updateRow) => (
                                                    <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent" placeholder="Name" value={row.warehouseName || row.name || ''} onChange={(e) => updateRow("warehouseName", e.target.value)} />
                                                )
                                            },
                                            {
                                                id: "location",
                                                header: "Location",
                                                width: "250px",
                                                cell: (row, index, updateRow) => (
                                                    <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent" placeholder="Location" value={row.location || ''} onChange={(e) => updateRow("location", e.target.value)} />
                                                )
                                            },
                                            {
                                                id: "capacity",
                                                header: "Capacity",
                                                width: "150px",
                                                cell: (row, index, updateRow) => (
                                                    <Input type="number" className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent" placeholder="1000" value={row.capacity || ''} onChange={(e) => updateRow("capacity", e.target.value)} />
                                                )
                                            },
                                            {
                                                id: "status",
                                                header: "Status",
                                                width: "150px",
                                                cell: (row, index, updateRow) => (
                                                    <Select value={row.status || 'active'} onValueChange={(val) => updateRow("status", val)}>
                                                        <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent"><SelectValue placeholder="Status" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="active">Active</SelectItem>
                                                            <SelectItem value="inactive">Inactive</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )
                                            }
                                        ]}
                                        onChange={setLocalWarehouses}
                                    />
                                </div>
                            </CardContent>
                        </Card>
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
