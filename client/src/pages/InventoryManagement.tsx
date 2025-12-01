import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconNavigation } from "@/components/IconNavigation";
import { AutoRequisitionForm } from "@/components/forms/AutoRequisitionForm";
import { Package, Plus, Search, AlertTriangle, TrendingDown, BarChart3, Warehouse, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function InventoryManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeNav, setActiveNav] = useState("stock-levels");
  const [newItem, setNewItem] = useState({ itemName: "", sku: "", quantity: "", category: "Raw Materials" });

  const { data: inventory = [], isLoading } = useQuery({ queryKey: ["/api/inventory/items"], queryFn: () => fetch("/api/inventory/items").then(r => r.json()) });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/inventory/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
      setNewItem({ itemName: "", sku: "", quantity: "", category: "Raw Materials" });
      toast({ title: "Item added to inventory" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/inventory/items/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
      toast({ title: "Item removed" });
    },
  });

  const navItems = [
    { id: "stock-levels", label: "Stock Levels", icon: Package, color: "text-blue-500" },
    { id: "reorder-points", label: "Reorder Points", icon: AlertTriangle, color: "text-orange-500" },
    { id: "warehouses", label: "Warehouses", icon: Warehouse, color: "text-purple-500" },
  ];

  const inventoryMetrics = [
    { title: "Total SKUs", value: "2,847", icon: Package, change: "+5%" },
    { title: "Low Stock Items", value: "34", icon: AlertTriangle, change: "-12%" },
    { title: "Stockout Risk", value: "8", icon: TrendingDown, change: "+2%" },
    { title: "Inventory Value", value: "$847K", icon: BarChart3, change: "+8.2%" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Package className="h-8 w-8" />Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Monitor stock levels, reorder points, and warehouse allocation</p>
        </div>
        <Button data-testid="button-add-inventory">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {inventoryMetrics.map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold mt-2">{metric.value}</p>
                  <p className={`text-xs mt-2 ${metric.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                    {metric.change}
                  </p>
                </div>
                <metric.icon className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "stock-levels" && (
        <div className="space-y-4">
          <Card data-testid="card-add-item">
            <CardHeader><CardTitle className="text-base">Add New Item</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <Input placeholder="Item name" value={newItem.itemName} onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })} data-testid="input-item-name" />
                <Input placeholder="SKU" value={newItem.sku} onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })} data-testid="input-sku" />
                <Input placeholder="Quantity" type="number" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} data-testid="input-quantity" />
                <Select value={newItem.category} onValueChange={(v) => setNewItem({ ...newItem, category: v })}>
                  <SelectTrigger data-testid="select-category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                    <SelectItem value="Finished Goods">Finished Goods</SelectItem>
                    <SelectItem value="WIP">Work in Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => createMutation.mutate(newItem)} disabled={createMutation.isPending || !newItem.itemName} className="w-full" data-testid="button-add-item">
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-base">Current Stock Levels</CardTitle>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground absolute ml-3" />
                  <Input placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <p>Loading...</p>
              ) : inventory.length === 0 ? (
                <p className="text-muted-foreground">{inventory.length} items tracked</p>
              ) : (
                inventory.map((item: any) => (
                  <div key={item.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between" data-testid={`item-${item.id}`}>
                    <div>
                      <p className="font-semibold">{item.itemName}</p>
                      <p className="text-sm text-muted-foreground">SKU: {item.sku} • Qty: {item.quantity}</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(item.id)} data-testid={`button-delete-${item.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeNav === "reorder-points" && (
        <div className="space-y-4">
          <Card className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Low Stock Items - Auto-Requisition Ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">34 items need attention. Click "Create Auto-Requisition" to automatically trigger purchase workflow</p>
            </CardContent>
          </Card>
          <div className="space-y-3">
            {[
              { id: "1", itemName: "Widget A", sku: "W-001", quantity: 5, reorderLevel: 20, reorderQuantity: 100 },
              { id: "2", itemName: "Component B", sku: "C-002", quantity: 12, reorderLevel: 50, reorderQuantity: 200 },
              { id: "3", itemName: "Material C", sku: "M-003", quantity: 8, reorderLevel: 30, reorderQuantity: 150 },
            ].map((item) => (
              <AutoRequisitionForm key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {activeNav === "warehouses" && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Warehouse Allocation</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">12 warehouses managed</p></CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
