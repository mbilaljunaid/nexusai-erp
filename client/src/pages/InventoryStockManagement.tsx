import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function InventoryStockManagement() {
  const { toast } = useToast();
  const [newStock, setNewStock] = useState({ productId: "", quantity: "100", reorderPoint: "20", supplierLeadTime: "5" });

  const { data: stocks = [], isLoading } = useQuery({
    queryKey: ["/api/inventory-stock"],
    queryFn: () => fetch("/api/inventory-stock").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/inventory-stock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-stock"] });
      setNewStock({ productId: "", quantity: "100", reorderPoint: "20", supplierLeadTime: "5" });
      toast({ title: "Stock added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/inventory-stock/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-stock"] });
      toast({ title: "Stock deleted" });
    },
  });

  const lowStock = stocks.filter((s: any) => (parseFloat(s.quantity) || 0) <= (parseFloat(s.reorderPoint) || 0)).length;
  const totalValue = stocks.reduce((sum: number, s: any) => sum + (parseFloat(s.quantity) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-8 w-8" />
          Inventory & Stock Management
        </h1>
        <p className="text-muted-foreground mt-2">Stock levels, reorder alerts, warehouse locations, and inventory tracking</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">SKUs Tracked</p>
            <p className="text-2xl font-bold">{stocks.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Units</p>
            <p className="text-2xl font-bold">{(totalValue / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Low Stock Alert</p>
            <p className="text-2xl font-bold text-red-600">{lowStock}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Stock Health</p>
            <p className="text-2xl font-bold text-green-600">{stocks.length > 0 ? (((stocks.length - lowStock) / stocks.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-stock">
        <CardHeader><CardTitle className="text-base">Add Stock</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Product ID" value={newStock.productId} onChange={(e) => setNewStock({ ...newStock, productId: e.target.value })} data-testid="input-prodid" className="text-sm" />
            <Input placeholder="Quantity" type="number" value={newStock.quantity} onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })} data-testid="input-qty" className="text-sm" />
            <Input placeholder="Reorder Point" type="number" value={newStock.reorderPoint} onChange={(e) => setNewStock({ ...newStock, reorderPoint: e.target.value })} data-testid="input-reorder" className="text-sm" />
            <Input placeholder="Lead Time (days)" type="number" value={newStock.supplierLeadTime} onChange={(e) => setNewStock({ ...newStock, supplierLeadTime: e.target.value })} data-testid="input-leadtime" className="text-sm" />
            <Button disabled={createMutation.isPending || !newStock.productId} size="sm" data-testid="button-add">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Stock Levels</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : stocks.length === 0 ? <p className="text-muted-foreground text-center py-4">No stock</p> : stocks.map((s: any) => {
            const isLow = (parseFloat(s.quantity) || 0) <= (parseFloat(s.reorderPoint) || 0);
            return (
              <div key={s.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`stock-${s.id}`}>
                <div className="flex-1">
                  <p className="font-semibold">{s.productId}</p>
                  <p className="text-xs text-muted-foreground">Qty: {s.quantity} • Reorder: {s.reorderPoint} • Lead: {s.supplierLeadTime}d</p>
                </div>
                <div className="flex gap-2 items-center">
                  {isLow && <Badge variant="destructive" className="text-xs">LOW</Badge>}
                  <Button size="icon" variant="ghost" data-testid={`button-delete-${s.id}`} className="h-7 w-7">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
