import { useState } from "react";
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
  const [newItem, setNewItem] = useState({ itemNumber: "", description: "", quantity: "0", categoryName: "" });
  const [newWarehouse, setNewWarehouse] = useState({ name: "", code: "", locationCode: "" });

  const { data: items = [], isLoading: itemsLoading } = useQuery<any[]>({ queryKey: ["/api/inventory/items"], queryFn: () => fetch("/api/inventory/items").then(r => r.json()).catch(() => []) });
  const { data: warehouses = [], isLoading: whLoading } = useQuery<any[]>({ queryKey: ["/api/inventory/warehouses"], queryFn: () => fetch("/api/inventory/warehouses").then(r => r.json()).catch(() => []) });

  const createItemMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/inventory/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
      setNewItem({ itemNumber: "", description: "", quantity: "0", categoryName: "" });
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
      setNewWarehouse({ name: "", code: "", locationCode: "" });
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

  // Basic mock check since we don't have quantity tracking in Item entity yet, assuming simple prop or 0
  const lowStockItems = items.filter((item: any) => (item.quantity || 0) <= (item.reorderLevel || 10));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground mt-2">Track persistent inventory items and organizations</p>
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
        <Button variant={viewType === "items" ? "default" : "outline"} onClick={() => setViewType("items")}>Items</Button>
        <Button variant={viewType === "warehouses" ? "default" : "outline"} onClick={() => setViewType("warehouses")}>Warehouses</Button>
      </div>

      {viewType === "items" && (
        <div className="space-y-4 p-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Add New Item</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="Item Number" value={newItem.itemNumber} onChange={(e) => setNewItem({ ...newItem, itemNumber: e.target.value })} />
                <Input placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
                <Input placeholder="Initial Qty" type="number" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} />
              </div>
              <Button disabled={createItemMutation.isPending || !newItem.itemNumber} className="w-full" onClick={() => createItemMutation.mutate(newItem)}>
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Inventory Items</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {itemsLoading ? <p>Loading...</p> : items.length === 0 ? <p className="text-muted-foreground">No items</p> : items.map((item: any) => (
                <div key={item.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{item.itemNumber}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deleteItemMutation.mutate(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {viewType === "warehouses" && (
        <div className="space-y-4 p-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Add Warehouse</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="Name" value={newWarehouse.name} onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })} />
                <Input placeholder="Code" value={newWarehouse.code} onChange={(e) => setNewWarehouse({ ...newWarehouse, code: e.target.value })} />
                <Input placeholder="Location" value={newWarehouse.locationCode} onChange={(e) => setNewWarehouse({ ...newWarehouse, locationCode: e.target.value })} />
              </div>
              <Button disabled={createWhMutation.isPending || !newWarehouse.name} className="w-full" onClick={() => createWhMutation.mutate(newWarehouse)}>
                <Plus className="w-4 h-4 mr-2" /> Add Warehouse
              </Button>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {whLoading ? <p>Loading...</p> : warehouses.length === 0 ? <p className="text-muted-foreground">No warehouses</p> : warehouses.map((wh: any) => (
              <Card key={wh.id} className="hover-elevate">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2"><Warehouse className="h-5 w-5 text-green-600" />{wh.name} ({wh.code})</span>
                    <Button size="icon" variant="ghost" onClick={() => deleteWhMutation.mutate(wh.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{wh.locationCode}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
