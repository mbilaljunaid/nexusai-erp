import { useState } from "react";
import { ItemList } from "@/features/inventory/ItemList";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package, Warehouse, AlertTriangle, TrendingDown, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Inventory() {
  const { toast } = useToast();
  const [viewType, setViewType] = useState("items");
  const [newItem, setNewItem] = useState({ itemName: "", sku: "", quantity: "" });
  const [newWarehouse, setNewWarehouse] = useState({ warehouseName: "", location: "" });

  const { data: items = [], isLoading: itemsLoading } = useQuery<any[]>({ queryKey: ["/api/inventory/items"], queryFn: () => fetch("/api/inventory/items").then(r => r.json()).catch(() => []) });
  const { data: warehouses = [], isLoading: whLoading } = useQuery<any[]>({ queryKey: ["/api/inventory/warehouses"], queryFn: () => fetch("/api/inventory/warehouses").then(r => r.json()).catch(() => []) });

  const createItemMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/inventory/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
      setNewItem({ itemName: "", sku: "", quantity: "" });
      toast({ title: "Item created" });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/inventory/items/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
      toast({ title: "Item deleted" });
    },
  });

  const createWhMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/inventory/warehouses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/warehouses"] });
      setNewWarehouse({ warehouseName: "", location: "" });
      toast({ title: "Warehouse created" });
    },
  });

  const deleteWhMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/inventory/warehouses/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/warehouses"] });
      toast({ title: "Warehouse deleted" });
    },
  });

  const lowStockItems = items.filter((item: any) => item.quantity <= item.reorderLevel);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground mt-2">Track items and warehouse locations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Warehouses</p>
                <p className="text-2xl font-bold">{warehouses.length}</p>
              </div>
              <Warehouse className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockItems.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button
          variant={viewType === "items" ? "default" : "outline"}
          onClick={() => setViewType("items")}
          data-testid="button-view-items"
        >
          Items
        </Button>
        <Button
          variant={viewType === "warehouses" ? "default" : "outline"}
          onClick={() => setViewType("warehouses")}
          data-testid="button-view-warehouses"
        >
          Warehouses
        </Button>
      </div>

      {viewType === "items" && (
        <ItemList />
      )}

      {viewType === "warehouses" && (
        <div className="space-y-4 p-4">
          <Card data-testid="card-new-warehouse">
            <CardHeader><CardTitle className="text-base">Add Warehouse</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Warehouse name" value={newWarehouse.warehouseName} onChange={(e) => setNewWarehouse({ ...newWarehouse, warehouseName: e.target.value })} data-testid="input-wh-name" />
                <Input placeholder="Location" value={newWarehouse.location} onChange={(e) => setNewWarehouse({ ...newWarehouse, location: e.target.value })} data-testid="input-location" />
              </div>
              <Button disabled={createWhMutation.isPending || !newWarehouse.warehouseName} className="w-full" data-testid="button-add-warehouse">
                <Plus className="w-4 h-4 mr-2" /> Add Warehouse
              </Button>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {whLoading ? <p>Loading...</p> : warehouses.length === 0 ? <p className="text-muted-foreground col-span-2 text-center py-4">No warehouses</p> : warehouses.map((wh: any) => (
              <Card key={wh.id} data-testid={`warehouse-${wh.id}`} className="hover-elevate">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2"><Warehouse className="h-5 w-5 text-green-600" />{wh.warehouseName}</span>
                    <Button size="icon" variant="ghost" data-testid={`button-delete-wh-${wh.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div><span className="text-xs text-muted-foreground">Location</span><p className="text-sm font-medium">{wh.location}</p></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
