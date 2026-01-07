import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function WarehouseManagement() {
  const { toast } = useToast();
  const [newWarehouse, setNewWarehouse] = useState({ warehouseName: "", location: "", capacity: "" });

  const { data: warehouses = [], isLoading } = useQuery<any[]>({ 
    queryKey: ["/api/warehouse/locations"],
    queryFn: () => fetch("/api/warehouse/locations").then(r => r.json()),
  });

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

  return (
    <div className="space-y-4 p-4" data-testid="warehouse-management">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Building className="w-8 h-8" />Warehouse Management</h1>
        <p className="text-muted-foreground">Manage warehouse locations and inventory</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card data-testid="card-total-warehouses"><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Warehouses</p><p className="text-2xl font-bold">{warehouses.length}</p></CardContent></Card>
        <Card data-testid="card-capacity-used"><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Capacity Used</p><p className="text-2xl font-bold">72%</p></CardContent></Card>
        <Card data-testid="card-stock-value"><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Stock Value</p><p className="text-2xl font-bold">$1.2M</p></CardContent></Card>
      </div>

      <Card data-testid="card-new-warehouse">
        <CardHeader><CardTitle className="text-base">Add Warehouse</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Warehouse name" value={newWarehouse.warehouseName} onChange={(e) => setNewWarehouse({ ...newWarehouse, warehouseName: e.target.value })} data-testid="input-warehouse-name" />
            <Input placeholder="Location" value={newWarehouse.location} onChange={(e) => setNewWarehouse({ ...newWarehouse, location: e.target.value })} data-testid="input-location" />
            <Input placeholder="Capacity" type="number" value={newWarehouse.capacity} onChange={(e) => setNewWarehouse({ ...newWarehouse, capacity: e.target.value })} data-testid="input-capacity" />
          </div>
          <Button disabled={createMutation.isPending || !newWarehouse.warehouseName} className="w-full" data-testid="button-create-warehouse">
            <Plus className="w-4 h-4 mr-2" /> Add Warehouse
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Warehouse Locations</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {isLoading ? (
              <p>Loading...</p>
            ) : warehouses.length === 0 ? (
              <p className="text-muted-foreground">No warehouses created</p>
            ) : (
              warehouses.map((w: any) => (
                <div key={w.id} className="flex justify-between items-center p-3 border rounded hover-elevate" data-testid={`warehouse-${w.id}`}>
                  <div>
                    <p className="font-semibold">{w.warehouseName || w.name}</p>
                    <p className="text-sm text-muted-foreground">{w.location}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge>{w.status || "active"}</Badge>
                    <Button size="icon" variant="ghost" data-testid={`button-delete-${w.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
